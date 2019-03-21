const TelegramBot = require('node-telegram-bot-api');
const express     = require('express')
const bodyParser  = require('body-parser')
const app         = express()
const port        = 1488

require('dotenv').config()

app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())

const bot   = new TelegramBot(process.env.TOKEN, {polling: false})
const users = {}

/* register active chats */
bot.getUpdates().then(upds => {
  for (let upd of upds) {
    const chat = upd.message.chat
    users[chat.id] = chat
  }

  console.log(users);
})

/**
 *
 * API Server
 * @msg - string; text of the reminder
 * @chat - chat id that returns after your add a bot
 *
 */
app.post('/', (req, res) => {
  const msg  = req.body.message
  const chat = req.body.chat

  if (!chat)
    return res.json({err: '"chat" is mandatory'})

  if (!msg)
    return res.json({err: 'No message was sent'})

  const user = users[chat] || false

  if (!user)
    return res.json({err: 'User ID is not found'})

  bot.sendMessage(user.id, msg).then(e => {
    res.send({status: 'Success'})
  })
})

app.listen(port, () => console.log(`Example app listening on port ${port}!`))