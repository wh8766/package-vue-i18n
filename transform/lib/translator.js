const axios = require('axios')
const crypto = require('crypto')
const fs = require('fs')
const path = require('path')
const readline = require('readline')
const get = require('lodash.get')

const appid = '20200205000380671'
const key = 'bk_YljU2i6Q7V3nYkJFG'

const service = axios.create({
  timeout: 10 * 1000,
  headers: {
    'Content-Type': 'application/x-www-form-urlencoded',
    'charset': 'utf-8'
  }
})

// 最后一个interceptors 方便接口响应使用数据
service.interceptors.response.use(response => {
  return response.data
})

const request = function(content, to) {
  const salt = Date.now()
  const query = content.replace(' ', '')

  return service({
    url: 'http://fanyi-api.baidu.com/api/trans/vip/translate',
    method: 'get',
    params: {
      q: query,
      appid: appid,
      salt: salt,
      from: 'zh',
      to: to || 'en',
      sign: md5(appid + query + salt + key)
    }
  })
}

const md5 = function(content) {
  return crypto.createHash('md5').update(content).digest('hex')
}

/**
 * 获取文件路径的hash
 * @param filePath
 * @return {string}
 */
function hash(filePath) {
  const crypto = require('crypto')

  const secret = 'abcdefg'
  const hash = crypto.createHmac('sha256', secret)
    .update(filePath)
    .digest('hex')
  // 前缀格式 @XXXX:
  return `@${hash.substr(0, 5).toUpperCase()}:`
}

class Package {
  constructor(path) {
    this.path = path
    this.hash = hash(path)
    this.list = []
  }
  push(item) {

  }
}

const startTask = function(to) {
  if (!pool.length) {
    save(to)
    return
  }
  const next = pool.pop()
  request(next[1], to).then(res => {
    if (res.error_code) {
      // 超限处理
      pool.push(next)
      return
    }
    // res.trans_result.dst
    outputContent[next[0]] = outputContent[next[0]].replace(regxContent, function(match, p1) {
      let re = get(res, 'trans_result[0].dst')
      // 防英文里的' 造成语法报错
      re = re.trim().replace(/'/g, '\\\'')
      // 首字母大写
      re = re.replace(/^\w/, (match) => {
        return match.toUpperCase()
      })
      console.log(LOGNAME, `剩余${pool.length}项`, p1, re)
      return `: '${re}',`
    })
  }).catch(re => {
    // 失败处理
    console.log(LOGNAME, 'error', re.message)
    pool.push(next)
  }).finally(() => {
    startTask(to)
  })
}

let threads = 5
const save = function(to) {
  if (threads > 1) {
    threads--
    return
  }
  saveFile(to, outputContent)
}

const saveFile = function(to, content) {
  console.log(LOGNAME, '正在生成多语言入口文件', to)
  fs.writeFileSync(path.resolve(`./src/lang/${to}/auto.js`), content.join('\r\n') + '\r\n')
}

const LOGNAME = '[translator] '
const outputContent = []
let lineIndex = 0
const pool = []
// const regxTag = /'@[0-9A-Z]{4}/
const regxContent = /: '([\S ]+)',?/
const regxChinese = /[\u4e00-\u9fa5]/

/**
 * 读取文件
 * @param to
 * @param handleLine
 * @return {Promise<Array>}
 */
const loadFile = function(to = 'en', handleLine) {
  const lines = []
  const rl = readline.createInterface({
    input: fs.createReadStream(`./src/lang/${to}/auto.js`)
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

// 开始执行全量翻译
const runTask = function(to = 'en') {
  const rl = readline.createInterface({
    input: fs.createReadStream('./src/lang/zh/auto.js')
  })
  rl.on('line', (line) => {
    outputContent.push(line)
    line.replace(regxContent, (match, p1) => {
      pool.push([lineIndex, p1])
      return match
    })
    lineIndex++
  }).on('close', () => {
    console.log(LOGNAME, '总数：', pool.length)
    for (let i = 0; i < threads; i++) {
      setTimeout(function() {
        startTask(to)
      }, i * 800)
    }
  })
}

// 执行检查动作，非全量
const runCheckTask = function(to = 'en') {
  const rl = readline.createInterface({
    input: fs.createReadStream('./src/lang/en/auto.js')
  })
  rl.on('line', (line) => {
    outputContent.push(line)
    line.replace(regxContent, (match, p1) => {
      if (regxChinese.test(p1)) {
        pool.push([lineIndex, p1])
      }
      return match
    })
    lineIndex++
  }).on('close', () => {
    console.log(LOGNAME, '总数：', pool.length)
    for (let i = 0; i < threads; i++) {
      setTimeout(function() {
        startTask(to)
      }, i * 800)
    }
  })
}

// 执行对比，增量
const regxKeyAndContent = /'(@\w{5}:)(.+)':/
const runAddonTask = async function(to = 'en') {
  const zh = await loadFile('zh')
  const en = await loadFile(to)
  for (const line of zh) {
    const match = regxKeyAndContent.exec(line)
    if (!match) {
      continue
    }
    const itemIndex = en.findIndex(item => {
      return item.includes(match[0])
    })
    if (itemIndex > -1) {
      continue
    }
    // 没有匹配到，进行追加
    const itemEndIndex = en.findIndex(item => {
      return item.includes(`${match[1]} file end`)
    })
    en.splice(itemEndIndex, 0, line)
    console.log(LOGNAME, '追加', match[0])
  }
  // todo 保存并局部翻译
  saveFile(to, en)
}

// 先执行，vue.template.test.js
// 再执行对比中英文，对英文包进行增量追加 runAddonTask
// 再执行英文包的追加部分翻译 runCheckTask

// runCheckTask()
// runTask('cht')
// runAddonTask('en')

module.exports = {
  runTask,
  runAddonTask,
  runCheckTask
}
