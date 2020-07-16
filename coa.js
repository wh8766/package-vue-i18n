/* jshint quotmark: false */
'use strict'

const PKG = require('./package.json')

const trans = require('./transform')
const translator = require('./transform/lib/translator')

/**
 * Command-Option-Argument.
 *
 * @see https://github.com/veged/coa
 */
module.exports = require('coa')
  .Cmd().title('执行源码国际化替换')
  .helpful()
  .name('trans')
  .title(PKG.description)
  .opt()
    .name('version').title('Version')
    .short('v').long('version')
    .only()
    .flag()
    .act(function() {
      // output the version to stdout instead of stderr if returned
      process.stdout.write(PKG.version + '\n')
      // coa will run `.toString` on the returned value and send it to stderr
      return ''
    })
    .end()
  .cmd()
    .name('translate').title('开始执行全量翻译')
    .opt()
      .name('to').title('目标语言，默认是en')
      .long('to').short('t')
      .val(function(val) {
        return val || this.reject('Option \'--to\' must have a value.')
      })
      .end()
    .act(function(opts) {
      translator.runTask(opts.to)
    })
    .end()
  .cmd()
    .name('add').title('执行对比中英文，对英文包进行增量追加')
    .opt()
      .name('to').title('目标语言，默认是en')
      .long('to').short('t')
      .val(function(val) {
        return val || this.reject('Option \'--to\' must have a value.')
      })
      .end()
    .act(function(opts) {
      translator.runAddonTask(opts.to)
    })
    .end()
  .cmd()
    .name('check').title('执行英文包的追加部分翻译')
    .opt()
      .name('to').title('目标语言，默认是en')
      .long('to').short('t')
      .val(function(val) {
        return val || this.reject('Option \'--to\' must have a value.')
      })
      .end()
    .act(function(opts) {
      translator.runCheckTask(opts.to)
    })
    .end()
  .act(function(opts, args) {
    trans()
  })

