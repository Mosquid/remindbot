const {exec}    = require('child_process');
const {emitonoff} = require('./events')

module.exports.getStatus = function() {
  return new Promise((resolve, reject) => {
    exec('termux-battery-status', (err, stdout, stderr) => {
      if (err)
        return reject(err)

      const data = JSON.parse(stdout)
      
      resolve(data)
    })
  })
}

module.exports.battery = function battery() {
  setInterval(function() {
    module.exports.getStatus()
    .then(data => {
      if (data.percentage < 20 && data.plugged !== 'PLUGGED_AC')
        emitonoff.emit('battery', JSON.stringify(data))
    })
    .catch(e => {
      console.log(e)
    })
  }, 60 * 60 * 1000)
}