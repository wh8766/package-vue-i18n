const axios = require('axios')
const crypto = require('crypto')
const fs = require('fs')
const path = require('path')
const readline = require('readline')
const get = require('lodash.get')
const util = require('./util')

const config = util.getConfig()

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
      appid: config.baidu.appid,
      salt: salt,
      from: 'zh',
      to: to || 'en',
      sign: md5(config.baidu.appid + query + salt + config.baidu.key)
    }
  })
}

const md5 = function(content) {
  return crypto.createHash('md5').update(content).digest('hex')
}

/**
 * 执行全量的翻译
 * @param to
 */
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
  util.saveFile(to, outputContent)
}

const LOGNAME = '[translator] '
const outputContent = []
let lineIndex = 0
const pool = []
// const regxTag = /'@[0-9A-Z]{4}/
const regxContent = /: '([\S ]+)',?/
const regxChinese = /[\u4e00-\u9fa5]/

/**
 * 开始执行全量翻译
 * @param to
 */
const runTask = function(to = 'en') {
  const rl = readline.createInterface({
    input: fs.createReadStream(path.resolve(config.i18n, 'zh', 'index.js'))
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

/**
 * 执行英文包的追加部分翻译
 * @param to
 */
const runCheckTask = function(to = 'en') {
  const rl = readline.createInterface({
    input: fs.createReadStream(path.resolve(config.i18n, to, 'index.js'))
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

const regxKeyAndContent = /'(@\w{5}:)(.+)':/
// 执行对比中英文，对英文包进行增量追加
const runAddonTask = async function(to = 'en') {
  const zh = await util.loadFile('zh')
  const en = await util.loadFile(to)
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
  util.saveFile(to, en)
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
