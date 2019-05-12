const request = require('request')

module.exports.getMyIp = function() {
  return new Promise((resolve, reject) => {
    request({
      url:'http://myip.co.il',
      headers: {
        'User-Agent': 'curl/7.37.0'
      }
    }, function (error, response, body) {
      if (error)
        return reject(error)

      resolve(body)
    })
  })
}