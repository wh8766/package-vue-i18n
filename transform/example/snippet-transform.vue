<template>
  <el-form-item required>
    <h1>{{ $t('@AAC9E:待分配任务-文本质检') }}</h1>
    <el-input
      v-model.trim="query"
      clearable
      :placeholder="$t('@AAC9E:搜索') + text + $t('@AAC9E:关键词')"
      :str="`${$t('@AAC9E:复合文本输出')}`"
      :text="`${$t('@AAC9E:复合文本输出')}${pickerOptions}${$t('@AAC9E: 结尾也有')}`"
      prefix-icon="el-icon-search"
      @keydown.enter.native.stop="handleQuery"
    />
    <h3 v-if="result">{{ $t('@AAC9E:搜索结果："') }} {{ query }}"</h3>
    <p v-else class="empty">{{ $t('@AAC9E:没有') }} {{ text }} {{ $t('@AAC9E:数据') }}</p>
    <p>{{ $t('@AAC9E:这里是普通/文字') }}</p>
    <p>
      {{ $t('@AAC9E:这里是多行组合文本') }}
      <el-button type="primary">buttonCont</el-button>
      {{ $t('@AAC9E:这里又有') }} {{ text }}
      {{ $t('@AAC9E:换行后的文本') }}
    </p>
    <span>{{ $t('@AAC9E:请选择文件……') }}</span>
    <p>{{ $t('@AAC9E:确定给当前用户发送邀评信息？') }}</p>
    <p>{{ $t('@AAC9E:大 ') }} {{ engineerQueue.publicQueue }}${$t('@AAC9E: 个 ')}{{ engineerQueue.privateQueue }}</p>
    <el-table-column
      header-align="center"
      align="center"
      prop="phone"
      width="120px"
      :label="$t('@AAC9E:电话')"
    >
      <p>{{ $t('@AAC9E:[草稿]') }}</p>
      <template slot-scope="scope">
        <p>{{ $t('@AAC9E:内部文本能寄出') }}</p>
        <div v-for="(item, index) in scope.row.phone" :key="index">
          {{ $t('@AAC9E:内部文本 ') }} {{ item }}
        </div>
      </template>
    </el-table-column>
    <div :start-placeholder="$t('@AAC9E:开始日期，加了符号')" :start="$t('@AAC9E:开始日期，加了符号') + val" />
    <el-input type="textarea" :placeholder="$t('@AAC9E:请输入内容（限 300 字）')" maxlength="300" />
    <ol>
      <li>1. {{ $t('@AAC9E:最多不超过300个字符') }}</li>
      <li>2. {{ $t('@AAC9E:如输入') }}<span v-pre>{{queueName}}</span>${$t('@AAC9E:则显示技能组名称，')}<span v-pre>{{serviceName}}</span>${$t('@AAC9E:显示当前客服姓名，')}<span v-pre>{{serviceCode}}</span>{{ $t('@AAC9E:显示客服工号') }}</li>
    </ol>
    <ext-date-picker
      v-model="query.condition.range"
      size="large"
      :placehoder="$t('@AAC9E:创建日期')"
      :place="$t('@AAC9E:测试内容是否可靠') + val"
      type="daterange"
      :range-separator="$t('@AAC9E:至')"
      :start-placeholder="$t('@AAC9E:开始日期，加了符号')"
      :start="$t('@AAC9E:开始日期，加了符号') + val"
      :end-placeholder="$t('@AAC9E:结束日期')"
      :format="$t('@AAC9E:yyyy 年 MM 月 dd 日')"
      value-format="yyyy-MM-dd"
      :picker-options="query.pickerOptions"
      @range-error="handleRangeError"
    />
  </el-form-item>
</template>

<script type="text/ecmascript-6">
  import { $t } from '@/lang/static'

  const strMap = {
    A: $t('@AAC9E:这里是map 类型文字'),
    B: $t('@AAC9E:这里是map 类型文字 too')
  }
  const keyMap = {
    '值': $t('@AAC9E:这里是key map 类型文字')
  }
  export default {
    name: 'crm-index',
    data() {
      return {
        queueName: '',
        query: {
          pickerOptions: $t('@AAC9E:这里是data 里的中文'),
          str: $t('@AAC9E:这里是普通中文')
        }
      }
    },
    computed: {
      val() {
        return this.data
      }
    },
    // 这里有中文注释
    methods: {
      handleQuery(query = $t('@AAC9E:默认搜索内容')) {
        return 'ok'
      },
      handleRangeError() {
        this.$confirm(`${$t('@AAC9E:确定移除【')}${this.query.str}${$t('@AAC9E:】任务吗？此操作无法撤销！')}`)
        console.log($t('@AAC9E:这里输出了中文'))
        console.log(`${$t('@AAC9E:这里的中文是这样输出的')}${this.query.pickerOptions}`)
        console.log(`${$t('@AAC9E:这样输出的 ok this is ok and ')}${this.query.pickerOptions}${$t('@AAC9E: 后置中文')}`)
        this.$message.error($t('@AAC9E:上传头像图片只能是 JPG或PNG 格式!'))
        this.$message.error($t('@AAC9E:上传头像图片大小不能超过 2MB!'))
        alert($t('@AAC9E:附件不能大于30M'))
      }
    }
  }
</script>

<style lang='scss' type="text/scss" scoped>
  .loading {
    content: $t('@AAC9E:加载中');
  }
</style>
