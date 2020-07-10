const trans = require('./transform')
const translator = require('./transform/lib/translator')
const path = require('path')

const method = process.argv.slice(2)[0]

const i18n = {
  /**
   * 执行测试样例代码翻译
   */
  example() {
    trans({
      root: path.resolve(process.cwd(), 'src'),
      src: path.resolve(process.cwd(), 'src/lang/transform/example'),
      output: path.resolve(process.cwd(), 'src/lang/transform/output'),
      exclude: [],
      i18n: path.resolve(process.cwd(), 'src/lang/transform/output/auto.js')
    })
  },
  /**
   * 执行全量工程翻译
   */
  start() {
    trans({
      root: path.resolve(process.cwd(), 'src'),
      src: path.resolve(process.cwd(), 'src'),
      i18n: path.resolve(process.cwd(), 'src/lang/zh/auto.js')
    })
  },
  /**
   * 执行对比中英文，对英文包进行增量追加
   */
  add() {
    translator.runAddonTask('en')
  },
  /**
   * 执行英文包的追加部分翻译
   */
  translate() {
    translator.runCheckTask('en')
  }
}

i18n[method] && i18n[method]()
