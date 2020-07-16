const path = require('path')

// 自定义配置项
module.exports = {
  root: path.resolve(process.cwd(), ''),
  src: path.resolve(process.cwd(), 'transform/example'),
  output: path.resolve(process.cwd(), 'transform/output'),
  exclude: [],
  i18n: path.resolve(process.cwd(), 'transform/output/i18n')
}