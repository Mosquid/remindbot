const low      = require('lowdb')
const FileSync = require('lowdb/adapters/FileSync')
const adapter  = new FileSync('./db.json')
const db       = low(adapter)

module.exports.addTask = task => {
  db
  .get('tasks')
  .push(task)
  .write()
}

module.exports.deleteTask = id => {
  db.get('posts')
  .remove({ ts: id })
  .write()
}