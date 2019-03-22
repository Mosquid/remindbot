const TelegramBot = require('node-telegram-bot-api');
const express     = require('express')
const bodyParser  = require('body-parser')
const app         = express()
const moment      = require('moment')
const {addTask}   = require('./db')
const port        = 1488

require('dotenv').config()

app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())

const bot   = new TelegramBot(process.env.TOKEN, {polling: true})
const users = {}

bot.on('message', handleUpdateEvent)
bot.on('polling_error', handlePollingError)

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
  const date = req.body.date ? moment(req.body.date) : null

  if (!chat)
    return res.json({err: '"chat" is mandatory'})

  if (!msg)
    return res.json({err: 'No message was sent'})

  const task = taskFactory({msg})
  addTask(task)

  res.json({done: true})
  // bot.sendMessage(chat, msg)
  // .then(e => {
  //   res.json({status: 'Success'})
  // })
  // .catch(e => {
  //   console.log(e);
  //   res.json({err: 'Failed to add a reminder'})
  // })
})

app.listen(port, () => console.log(`Example app listening on port ${port}!`))

/**
 *
 * Utils functions
 *
 */
function handleUpdateEvent(upd) {
  const chatId = upd.from.id
  // in the CLI we'll need to add CHAT_ID so we're sending it back
  bot.sendMessage(chatId, `Chat ID: ${chatId}`)
}

function taskFactory(data) {
  const obj = {
    delay: 1550,//todo
    ts: new Date().getTime(),
    text: data.msg
  }

  return obj
}

function handlePollingError(err) {
  console.log('[Polling Failed]', err);
}