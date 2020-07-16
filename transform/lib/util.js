const path = require('path')
const fs = require('fs')
const readline = require('readline')
const crypto = require('crypto')

const defaultConfig = {
  root: path.resolve(process.cwd(), 'src'),
  src: path.resolve(process.cwd(), 'src'),
  i18n: path.resolve(process.cwd(), 'src/lang'),
  output: '',
  ext: ['.vue', '.js'],
  exclude: [
    '/src/lang',
    '/src/assets',
    '/src/icons',
    '/src/mock',
    '/src/styles'
  ],
  baidu: {
    appid: '20200205000380671',
    key: 'bk_YljU2i6Q7V3nYkJFG'
  },
  statement: {
    imp: `import { $t } from '@/lang/static'`,
    disabled: 'vue-i18n-translator:disabled'
  }
}

const getConfig = function() {
  const configPath = path.resolve(process.cwd(), 'i18n.config.js')
  const hasConfig = fs.existsSync(configPath)
  if (hasConfig) {
    const loadConfig = require(configPath)
    return {
      ...defaultConfig,
      ...loadConfig
    }
  } else {
    console.log('没有找到i18n.config.js 文件，将使用默认配置')
    console.log(defaultConfig)
  }
}

const LOGNAME = '[translator] '
const config = getConfig()
const saveFile = function(to, content) {
  console.log(LOGNAME, '正在生成多语言入口文件', to)
  if (!fs.existsSync(path.resolve(config.i18n, to))) {
    fs.mkdirSync(path.resolve(config.i18n, to), { recursive: true })
    console.log(LOGNAME, '生成文件夹')
  }
  fs.writeFileSync(
    path.resolve(path.resolve(config.i18n, to, 'index.js')),
    Array.isArray(content) ? content.join('\r\n') + '\r\n' : content
  )
}

/**
 * 读取文件
 * @param to
 * @param handleLine
 * @return {Promise<Array>}
 */
const loadFile = function(to = 'en', handleLine) {
  const lines = []
  const rl = readline.createInterface({
    input: fs.createReadStream(path.resolve(config.i18n, to, 'index.js'))
  })
  rl.on('line', (line) => {
    if (handleLine) {
      lines.push(handleLine(line))
    } else {
      lines.push(line)
    }
  })
  return new Promise((resolve, reject) => {
    rl.on('close', () => {
      resolve(lines)
    })
  })
}

/**
 * 获取文件路径的hash
 * @param filePath
 * @return {string}
 */
function hash(filePath) {
  const secret = 'abcdefg'
  const hash = crypto.createHmac('sha256', secret)
    .update(filePath)
    .digest('hex')
  // 前缀格式 @XXXX:
  return `@${hash.substr(0, 5).toUpperCase()}:`
}

module.exports = {
  getConfig,
  saveFile,
  loadFile,
  hash,
  LOGNAME
}
