# i18n auto

> 基于正则替换和抽取的国际化工具

## 快速开始

在`package.json` 里添加私有仓库
```json
{
  "scripts": {
    "i18n:test": "trans example",
    "i18n:start": "trans start",
    "i18n:add": "trans add",
    "i18n:translate": "trans translate"
  },
  "dependencies": {
    "package-vue-i18n": "git+ssh://git@g.lenovo.com.cn:CUBE/package-vue-i18n.git"
  }
}
```

## 翻译配置

以下是默认配置，可以在命令行里携带相应的参数传入。
```js
const defaultConfig = {
  root: path.resolve(process.cwd(), 'src'),
  src: path.resolve(process.cwd(), 'src'),
  output: path.resolve(process.cwd(), 'src/lang/zh/auto.js'),
  i18n: '/src/lang/auto.js',
  ext: ['.vue', '.js'],
  exclude: [
    '/src/lang',
    '/src/assets',
    '/src/icons',
    '/src/mock',
    '/src/styles',
    '/src/filters',
    '/src/utils',
    'RegionPicker'
  ]
}
```

## 效果

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