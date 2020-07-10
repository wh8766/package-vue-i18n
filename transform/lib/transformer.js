const path = require('path')

const regxAttr = /(\S+)="([\u4e00-\u9fa5\w，：；、“”"！《》【】（）…。？!?#%&+*,.:\[\]\(\)\/\- ]+)"/g
const regxStatement = /'([\u4e00-\u9fa5\w，：；、“”"！《》【】（）…。？!?#%&+*,.\[\]\(\)\/\- ]+)'(?!:)/g
const regxDynamicStatement = /([`\}]{1})([\u4e00-\u9fa5\w，：；、“”"！《》【】（）…。？!?#%&+*,.:\[\]\(\)\/\- ]+)([`\}]{1}|\$\{)/g
// 匹配vue template 中的文本语句
const regxVueContentStatement = /(>|\}\})([\r\n\t\w. ]*)([\u4e00-\u9fa5\w，：；、“”"！《》【】（）…。？!?#%&+*,.:\[\]\(\)\/\- ]+)([\r\n\t ]*)(<|\{\{)/g

const regxChinese = /[\u4e00-\u9fa5]/
const regxTemplateContent = /<template>([\s\S]+)<\/template>/
const regxScriptTag = /<script( type=".+")?>/
const regxScriptContent = /<script( type=".+")?>([\s\S]+)<\/script>/
const regxI18nTag = /@\w{5}:/
const regxI18nTagAdnContent = /\$t\('(@\w{5}:)(.*?)'\)/g

// 文件级别的禁用
const translatorDisabled = 'vue-i18n-translator:disabled'

/**
 * 进行字符串替换，并输出修改后的源码和i18n 映射关系
 * @param origin
 * @param filePath
 * @return {{code: string, i18n: Map<string, string>}}
 */
module.exports = function(origin, filePath) {
  const pathHash = hash(filePath)
  const ext = path.extname(filePath)
  const i18n = new Map()

  // 如果
  if (origin.includes(translatorDisabled)) {
    return {
      i18n: i18n
    }
  }

  let code = origin
  // .vue
  const pipeVueFunctions = [
    pipeOldI18nTag,
    pipeAttributeTransform,
    pipeStatementTransform,
    pipeImporti18n,
    pipeVueContent
  ]
  if (ext === '.vue') {
    pipeVueFunctions.forEach(f => {
      code = f(code, pathHash, i18n, ext)
    })
  }

  // .js
  const pipeJsFunctions = [
    pipeOldI18nTag,
    pipeStatementTransform,
    pipeImporti18n
  ]
  if (ext === '.js') {
    pipeJsFunctions.forEach(f => {
      code = f(code, pathHash, i18n, ext)
    })
  }
  return {
    code: code,
    i18n: i18n,
    hash: pathHash
  }
}

/**
 * vue 属性转换
 * @param origin {string}
 * @param pathHash {string}
 * @param i18n {Map}
 * @return {string}
 */
const pipeAttributeTransform = function(origin, pathHash, i18n) {
  return origin.replace(regxAttr, function(match, p1, p2) {
    if (!regxChinese.test(p2)) {
      return match
    }
    const key = `${pathHash}${p2}`
    i18n.set(key, p2)
    if (p1.startsWith(':')) {
      return `${p1}="$t('${key}')"`
    } else {
      return `:${p1}="$t('${key}')"`
    }
  })
}

/**
 * 处理 '内容' 或者 `内容`
 * @param origin {string}
 * @param pathHash {string}
 * @param i18n {Map}
 * @return {string}
 */
const pipeStatementTransform = function(origin, pathHash, i18n) {
  origin = origin.replace(regxStatement, function(match, p1) {
    if (!regxChinese.test(p1.trim())) {
      return match
    }
    const key = `${pathHash}${p1}`
    i18n.set(key, p1)
    return `$t('${key}')`
  })
  return origin.replace(regxDynamicStatement, function(match, p1, p2, p3) {
    if (!regxChinese.test(p2.trim())) {
      return match
    }
    const key = `${pathHash}${p2}`
    i18n.set(key, p2)
    return `${p1}\${$t('${key}')}${p3}`
  })
}

/**
 * 追加$t 函数的import
 * @param origin {string}
 * @param pathHash {string}
 * @param i18n {Map}
 * @param extname {string}
 * @return {string}
 */
const pipeImporti18n = function(origin, pathHash, i18n, extname) {
  if (i18n.size === 0) {
    return origin
  }
  const imp = `import { $t } from '@/lang/static'`
  if (origin.includes(imp)) {
    return origin
  }

  // 如果是 js 文件，直接添加
  if (extname === '.js') {
    return imp + '\r\n' + origin
  }
  // 针对vue 文件里的script 进行追加
  return origin.replace(regxScriptContent, function(match, p1, p2) {
    // 同时需要判定在script 里是否存在转换
    if (regxI18nTag.test(p2)) {
      return `<script type="text/ecmascript-6">\r\n  ${imp}\r\n${p2}<\/script>`
    }
    return match
  })
}

/**
 * @param origin {string}
 * @param pathHash {string}
 * @param i18n {Map}
 * @return {string}
 */
const pipeVueContent = function(origin, pathHash, i18n) {
  return origin.replace(regxTemplateContent, function(match, p1) {
    return match.replace(regxVueContentStatement, function(match, p1, p2, p3, p4, p5) {
      if (!p3 || !regxChinese.test(p3.trim())) {
        return match
      }
      const key = `${pathHash}${p3}`
      i18n.set(key, p3)
      return `${p1}${p2}{{ $t('${key}') }}${p4}${p5}`
    })
  })
}

/**
 * 处于文件中已有的i18n tag 内容
 * @param origin {string}
 * @param pathHash {string}
 * @param i18n {Map}
 * @return {string}
 */
const pipeOldI18nTag = function(origin, pathHash, i18n) {
  return origin.replace(regxI18nTagAdnContent, function(match, p1, p2) {
    i18n.set(pathHash + p2, p2)
  	return `$t('${pathHash}${p2}')`
  })
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
  console.log('获取文件路径的hash', filePath, hash)
  return `@${hash.substr(0, 5).toUpperCase()}:`
}

