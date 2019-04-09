const {exec}    = require('child_process');
const {emitonoff} = require('./events')

module.exports = function battery() {
  setInterval(function() {
    exec('termux-battery-status', (err, stdout, stderr) => {
      if (err)
        return

      const data = JSON.parse(stdout)

      if (data.percentage < 20 && data.plugged !== 'PLUGGED_AC')
        emitonoff.emit('battery', stdout)
    })
  }, 60 * 60 * 1000)
}