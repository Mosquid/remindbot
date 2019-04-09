const TelegramBot   = require('node-telegram-bot-api');
const express       = require('express')
const bodyParser    = require('body-parser')
const moment        = require('moment-timezone')
const app           = express()
const {addTask}     = require('./db')
const {getAllTasks} = require('./db')
const {updateQueue} = require('./scheduler')
const {emitonoff}   = require('./events')
const cors          = require('cors')
const battery       = require('./battery')()
const port          = 1488
const WebSocket     = require('ws');
const ws            = new WebSocket(process.env.WS_URL);

require('dotenv').config()

app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())
app.use(cors())

const bot   = new TelegramBot(process.env.TOKEN, {polling: true})
const users = {}

bot.on('message', handleUpdateEvent)
bot.on('polling_error', handlePollingError)

emitonoff.on('battery', data => {
  const obj = JSON.parse(data)
  sendToChat(process.env.MY_CHAT, `Please charge me. The battery level is ${obj.percentage}%`)
})

emitonoff.on('task', task => {
  sendToChat(task.chat, task.text)
})

/**
 *
 * API Server
 * @msg - string; text of the reminder
 * @chat - chat id that returns after your add a bot
 *
 */
updateQueue()

app.get('/', (req, res) => {
  const tasks = getAllTasks()
  
  if (!tasks || !tasks.length)
    return res.send('No upcoming tasks')

  let output = '<ul style="font-size: 150%">'

  for (let task of tasks) {
    console.log(task.ts)
    const date = moment.unix(task.ts).format('LLLL')
    output += `<li><strong>${date}</strong><div>${task.text}</div></li>`
  }

  output += '</ul>'

  res.send(output)
})

app.post('/', (req, res) => {
  const msg  = req.body.message
  const chat = req.body.chat
  const date = req.body.date ? moment(req.body.date) : null

  if (!chat)
    return res.json({err: '"chat" is mandatory'})

  if (!msg)
    return res.json({err: 'No message was sent'})

  const task = taskFactory({msg, date, chat})
  addTask(task)
  updateQueue()

  res.json({done: true})
})

/**
 *
 * Adding WS message handler for home IP
 * (the project will be running on my old android device)
 *
 */
ws.on('message', data => {
  const req = JSON.parse(data)
  const msg  = req.message
  const chat = req.chat
  const date = req.date ? moment(req.date) : null

  if (!chat || !date || !msg)
    return

  const task = taskFactory({msg, date, chat})
  addTask(task)
  updateQueue()
})

app.listen(port, () => console.log(`Example app listening on port ${port}!`))

/**
 *
 * Utils functions
 *
 */
function handleUpdateEvent(upd) {
  const chatId = upd.chat.id
  const text = encodeURI(upd.text)

  bot.sendMessage(chatId, `https://www.google.com/search?q=${text}`)
}

function taskFactory(data) {
  const obj = {
    ts: data.date.unix(),
    id: new Date().getTime(),
    text: data.msg,
    chat: data.chat
  }

  return obj
}

function sendToChat(chat, text) {
  bot.sendMessage(chat, text)
    .then(e => console.log('[SENT to]:', chat))
    .catch(err => console.log(err))
}

function handlePollingError(err) {
  console.log('[Polling Failed]', err);
}