<template>
  <el-form-item required>
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
    <p>这里是普通/文字</p>
    <p>
      这里是多行组合文本
      <el-button type="primary">buttonCont</el-button>
      这里又有{{ text }}
      换行后的文本
    </p>
    <span>请选择文件……</span>
    <p>确定给当前用户发送邀评信息？</p>
    <p>大 {{ engineerQueue.publicQueue }} 个 {{ engineerQueue.privateQueue }}</p>
    <el-table-column
      header-align="center"
      align="center"
      prop="phone"
      width="120px"
      label="电话"
    >
      <el-form-item label="手机号码:" prop="customer_phone">
        <span style="color: #606266">{{ ruleForm.customer_phone }}</span>
      </el-form-item>
      <p>[草稿]</p>
      <template slot-scope="scope">
        <p>内部文本能寄出</p>
        <div v-for="(item, index) in scope.row.phone" :key="index">
          内部文本 {{ item }}
        </div>
      </template>
    </el-table-column>
    <div start-placeholder="开始日期，加了符号" :start="'开始日期，加了符号' + val" />
    <el-input type="textarea" placeholder="请输入内容（限 300 字）" maxlength="300" />
    <ol>
      <li>1. 最多不超过300个字符</li>
      <li>2. 如输入<span v-pre>{{queueName}}</span>则显示技能组名称，<span v-pre>{{serviceName}}</span>显示当前客服姓名，<span v-pre>{{serviceCode}}</span>显示客服工号</li>
    </ol>
    <ext-date-picker
      v-model="query.condition.range"
      size="large"
      placehoder="创建日期"
      :place="'测试内容是否可靠' + val"
      type="daterange"
      range-separator="至"
      start-placeholder="开始日期，加了符号"
      :start="'开始日期，加了符号' + val"
      end-placeholder="结束日期"
      format="yyyy 年 MM 月 dd 日"
      value-format="yyyy-MM-dd"
      :picker-options="query.pickerOptions"
      @range-error="handleRangeError"
    />
  </el-form-item>
</template>

<script type="text/ecmascript-6">
  const strMap = {
    A: '这里是map 类型文字',
    B: '这里是map 类型文字 too'
  }
  const keyMap = {
    '值': '这里是key map 类型文字'
  }
  export default {
    name: 'crm-index',
    data() {
      return {
        queueName: '',
        query: {
          pickerOptions: '这里是data 里的中文',
          str: '这里是普通中文',
          talk: '您好，您还在线吗？真的很想帮助您，还请您尽快回复我哦~'
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
      handleQuery(query = '默认搜索内容') {
        return 'ok'
      },
      handleRangeError() {
        this.$confirm(`确定移除【${this.query.str}】任务吗？此操作无法撤销！`)
        console.log('这里输出了中文')
        console.log('您还没有权限查看,请去系统配置页面配置.')
        console.log(`这里的中文是这样输出的${this.query.pickerOptions}`)
        console.log(`这样输出的 ok this is ok and ${this.query.pickerOptions} 后置中文`)
        this.$message.error('上传头像图片只能是 JPG或PNG 格式!')
        this.$message.error('上传头像图片大小不能超过 2MB!')
        alert('附件不能大于30M')
      }
    }
  }
</script>

<style lang='scss' type="text/scss" scoped>
  .loading {
    content: '加载中';
  }
</style>
