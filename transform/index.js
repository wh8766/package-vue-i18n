const fs = require('fs')
const path = require('path')
const transform = require('./lib/transformer')
const LOGNAME = '[i18n]'
const util = require('./lib/util')

const config = util.getConfig()

const mapFileContent = []
const filePaths = []

module.exports = function() {
  mapFileContent.push(`// 这里是自动生成的内容 ${new Date()}`)
  mapFileContent.push('export default {')
  findFile(config.src)
  mapFileContent.push('}\r\n')
  console.log(LOGNAME, '正在生成多语言入口文件')
  util.saveFile('zh', mapFileContent.join('\r\n'))
}

function findFile(dirPath) {
  // 转换为绝对路径
  const param = path.resolve(dirPath)
  if (!fs.existsSync(param)) {
    return
  }

  const stats = fs.statSync(param)
  // 如果是目录的话，遍历目录下的文件信息
  if (stats.isDirectory()) {
    const file = fs.readdirSync(param)
    file.forEach((e) => {
      // 遍历之后递归调用查看文件函数
      // 遍历目录得到的文件名称是不含路径的，需要将前面的绝对路径拼接
      const absolutePath = path.resolve(path.join(param, e))
      findFile(absolutePath)
    })
  } else {
    // 如果不是目录，打印文件信息
    if (config.ext.includes(path.extname(param)) && isInclude(param, config)) {
      loadFile(param, config)
      filePaths.push(param)
    }
  }
}

function loadFile(filePath) {
  console.log(LOGNAME, filePath, '正在处理')
  const content = fs.readFileSync(path.resolve(filePath), 'utf-8')
  const relativePath = path.relative(config.root, filePath)
  const re = transform(content, relativePath)
  if (re.i18n.size > 0) {
    let targetPath = filePath
    if (config.output) {
      targetPath = path.resolve(config.output, path.relative(config.src, filePath))
    }
    fs.writeFileSync(path.resolve(targetPath), re.code)

    mapFileContent.push(`  // ${re.hash} file path: ` + relativePath)
    for (const [k, v] of re.i18n) {
      mapFileContent.push(`  '${k}': '${v}',`)
    }
    mapFileContent.push(`  // ${re.hash} file end`)
  }

  console.log(LOGNAME, relativePath, '完成处理, size = ', re.i18n.size)
}

function isInclude(filePath) {
  const paths = config.exclude.map(p => p.replace(/\//g, '\\'))
  const re = paths.some(p => {
    return filePath.includes(p)
  })
  return !re
}
