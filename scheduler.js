const {getLatestTask} = require('./db')
const {deleteTask}    = require('./db')
const moment          = require('moment-timezone')
const {emitonoff}     = require('./events')

require('dotenv').config()

let masterTimout = false

module.exports.updateQueue = item => {
  const latest = getLatestTask()

  if (!latest)
    return
  
  const diff = latest.ts - moment().unix()

  if (diff < 0) {
    deleteTask(latest.id)
    module.exports.updateQueue()
  }

  clearTimeout(masterTimout)
  
  masterTimout = setTimeout(function() {
    emitonoff.emit('task', latest)
    deleteTask(latest.id)
    module.exports.updateQueue()
  }, diff * 100)
}