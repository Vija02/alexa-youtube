const chalk = require('chalk')

exports.log = (...params) => console.log(chalk.yellow(...params))
exports.info = (...params) => console.info(chalk.blue(...params))
exports.error = (...params) => console.error(chalk.red(...params))
