const TelegramBot = require('node-telegram-bot-api');

module.exports.initBot = function(handleUpdateEvent, handlePollingError) {
  const bot = new TelegramBot(process.env.TOKEN, {polling: true})
  
  bot.on('message', handleUpdateEvent)
  bot.on('polling_error', handlePollingError)

  return bot
}