/* jshint quotmark: false */
'use strict'

const PKG = require('./package.json')

const trans = require('./transform')
const translator = require('./transform/lib/translator')
const path = require('path')

/**
 * Command-Option-Argument.
 *
 * @see https://github.com/veged/coa
 */
module.exports = require('coa').Cmd()
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
  .opt()
    .name('root').title('Root directory, "-" for STDIN')
    .short('r').long('root')
    .val(function(val) {
      return val || this.reject('Option \'--root\' must have a value.')
    })
    .end()
  .opt()
    .name('src').title('Root directory, "-" for STDIN')
    .short('s').long('src')
    .val(function(val) {
      return val || this.reject('Option \'--src\' must have a value.')
    })
    .end()
  .opt()
    .name('output').title('Root directory, "-" for STDIN')
    .short('o').long('output')
    .val(function(val) {
      return val || this.reject("Option '--output' must have a value.");
    })
    .end()
  .cmd()
    .name('example').title('Root directory, "-" for STDIN')
    .act(function(opts, args, res) {
      trans({
        root: path.resolve(process.cwd(), ''),
        src: path.resolve(process.cwd(), 'transform/example'),
        output: path.resolve(process.cwd(), 'transform/output'),
        exclude: [],
        i18n: path.resolve(process.cwd(), 'transform/output/auto.js')
      })
    })
    .end()
  .cmd()
    .name('add')
    .opt()
      .name('to').title('Translate to target language')
      .long('to')
      .end()
    .act(function(opts) {
      translator.runAddonTask(opts.to)
    })
    .end()
  .cmd()
    .name('check')
    .opt()
      .name('check').title('Check and translate to target language')
      .long('check')
      .end()
    .act(function(opts) {
      translator.runAddonTask(opts.check)
    })
    .end()
  .act(function(opts, args) {
    console.log(opts, args)
  })

