# i18n auto

> 基于正则替换和抽取的国际化工具

这个工具的初衷是为了解决已有项目的快速国际化，在衡量了一些开源的国际化批处理工具后，由于没有对vue 的很好支持，决定快速实现一个。

核心的最佳实践是：不再人工抽取命名i18n key，所有可执行编码里的中文，都会被替换为`文件路径hash:中文内容` 作为key 值。
虽然这会让key 值变长变冗余，但是源码可维护性大大提高，并且能有效降低心智负担。

## 快速开始

在`package.json` 里添加私有仓库（内网环境）
```json
{
  "scripts": {
    "i18n:start": "trans",
    "i18n:translate": "trans translate",
    "i18n:add": "trans add",
    "i18n:check": "trans check"
  },
  "dependencies": {
    "package-vue-i18n": "git+ssh://git@g.lenovo.com.cn:CUBE/package/package-vue-i18n.git"
  }
}
```

### 翻译配置

请在项目根目录下创建 `i18n.config.js`，进行目录和排除项配置
```js
const path = require('path')

module.exports = {
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
```
参数及其说明

- root 根目录，默认为`src` ，用于参与文件路径hash 的计算
- src 需要做国际化处理的文件夹
- i18n 存储国际化key-value 的文件夹
- output 经过处理的源码文件输出到哪里，默认是空，即覆盖原文件
- ext 需要处理的源码文件后缀名，目前也仅支持`vue` `js`
- exclude 需要排除的文件夹路径
- baidu 百度翻译配置
    - appid
    - key
- statement 语句标识
    - imp 翻译函数`$t` 的引入，参见后续的`关于翻译函数 $t` 章节
    - disabled 忽略当前文件的标记

### 执行操作

接下来就可以让工具快速完成自动翻译了
```shell script
# 1. 执行源码国际化替换
trans
# 2. 开始执行全量翻译，可选参数目标语言-t 或者--to
trans translate -t en
# 3. 执行对比中英文，对英文包进行增量追加，可选参数目标语言-t 或者--to
trans add -t en
# 4. 执行英文包的追加部分翻译，可选参数目标语言-t 或者--to
trans translate -t en
```

目标语言支持情况，参考百度翻译文档：http://api.fanyi.baidu.com/doc/21

### 使用场景说明

- 首次使用，按顺序执行1、2 即可；
- 新增一种语言（比如日语），只需要执行2 即可；
- 项目迭代后使用，按顺序执行1、3、4 即可；

## 效果

翻译过程中，主要会涉及到的替换：

- vue template attr 内中文，会替换为bind-attr 形式
- 标签内部的中文替换为 ``{{ $t('xx') }}``
- 模板字符串内的中文内容
- 普通js 语句内的中文内容

原始内容
```vue
<h1>待分配任务-文本质检</h1>
<el-input
  v-model.trim="query"
  clearable
  :placeholder="'搜索' + text + '关键词'"
  :str="`复合文本输出`"
  :text="`复合文本输出${pickerOptions} 结尾也有`"
  prefix-icon="el-icon-search"
  @keydown.enter.native.stop="handleQuery"
/>
<h3 v-if="result">搜索结果："{{ query }}"</h3>
<p v-else class="empty">没有{{ text }}数据</p>
```

替换后
```vue
<h1>{{ $t('@62592:待分配任务-文本质检') }}</h1>
<el-input
  v-model.trim="query"
  clearable
  :placeholder="$t('@62592:搜索') + text + $t('@62592:关键词')"
  :str="`${$t('@62592:复合文本输出')}`"
  :text="`${$t('@62592:复合文本输出')}${pickerOptions}${$t('@62592: 结尾也有')}`"
  prefix-icon="el-icon-search"
  @keydown.enter.native.stop="handleQuery"
/>
<h3 v-if="result">{{ $t('@62592:搜索结果："') }}{{ query }}"</h3>
<p v-else class="empty">{{ $t('@62592:没有') }}{{ text }}{{ $t('@62592:数据') }}</p>
```

## 关于翻译函数 $t

样例里我们使用的是`vue-i18n` ，在项目的`main.js` 入口文件里install vue-i18n ，从而让Vue 实例具备了`this.$t` 的能力，进而能够在vue template 里直接使用`$t`。
但在script 标签内是没有这个翻译函数的，所以需要在有中文翻译的script 内引入`$t` 函数

如下所示：
```javascript
import { $t } from '@/lang/static'

export const callTypeMap = {
  '-1': '',
  [CALLTYPE.UNKNOWN]: $t('@D34A7:未知类型')
}
```

引入文件的内容也很简单，只要能够正确输出翻译后的结果即可
```javascript
// ...

const i18n = new VueI18n({
  // set locale
  // options: en | zh | es
  locale: getLanguage(),
  // set locale messages
  messages
})

// 提供给国际化自动转的代码使用，在vue 里能够不再区分template 和script 里的$t
export const $t = function(key) {
  return i18n.t(key)
}
```

## 常见问题

Q 完成国际化之后，项目仍然在迭代怎么办？

A 迭代或者修改bug，都可以正常进行，只需要在版本发布前按顺序执行示例里的1、3、4 命令即可。

Q 是否可以串行执行命令？

A 目前还不可以，百度翻译API 做了最大并发数限制，目前用异步请求池完成的