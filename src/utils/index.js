module.exports = {
  sleep: ms => {
    return new Promise(resolve => setTimeout(resolve, ms)) // Sleep for await/async
  }
}
module.exports.valid = require('./validator')
module.exports.filter = require('./filter')
