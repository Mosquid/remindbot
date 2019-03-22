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
  db.get('tasks')
  .remove({ id: id })
  .write()
}

module.exports.getLatestTask = () => {
  const tasks = db.get('tasks')
  .orderBy('ts')
  .take(1)
  .value()

  return tasks[0]
}