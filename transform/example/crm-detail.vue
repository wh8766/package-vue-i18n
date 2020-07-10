<template>
  <div class="app-container">
    <header>
      <h1>客户详情</h1>
      <el-button v-if="ready" type="primary" plain :disabled="!buttonPermission('editUserInfo')" @click="editUser">编辑</el-button>
    </header>
    <el-card class="crm-detail">
      <section style="min-height: 180px;">
        <h2>记录详情</h2>
        <ul v-if="ready" class="detail-list">
          <li><span>客户姓名</span> {{ detail.name }}</li>
          <li><span>电话</span><div v-html="displayPhones" /></li>
          <li><span>邮箱</span><div v-html="displayEmails" /></li>
          <li><span>客户ID</span> {{ detail.customer_id }}</li>
          <li><span>公司</span> {{ detail.company_name }}</li>
          <li><span>行业</span> {{ detail.industry }}</li>
          <li><span>OpenID</span> {{ displayOpenId }}</li>
          <li><span>地址</span> {{ `${detail.province_name || ''} ${detail.city_name || ''} ${detail.district_name || ''} ${detail.address || ''}` }}</li>
          <li><span>职业</span> {{ detail.job }}</li>
          <!-- <li><span>标签</span> {{ '' }}</li> -->
          <li><span>创建时间</span> {{ detail.created_at }}</li>
          <li><span>备注</span> {{ detail.remarks }}</li>
          <li><span>最近联系时间</span> {{ detail.last_contact_time }}</li>
        </ul>
        <div v-else class="empty">查询不到数据</div>
      </section>
      <section>
        <h2>更多操作</h2>
        <div class="text-center">
          <el-button v-if="permissionOrder" type="primary" :disabled="!ready" plain @click="createOrder">创建工单</el-button>
          <el-button v-if="permissionOrder" type="primary" :disabled="!ready" plain @click="gotoOrderQuery">查看工单</el-button>
          <el-button type="primary" :disabled="!ready || !cubeUserReady" plain @click="gotoCaseQuery">服务记录</el-button>
          <el-button type="primary" :disabled="!ready || !cubeUserReady" plain @click="gotoTouch">接触记录</el-button>
        </div>
      </section>
    </el-card>

    <crm-dialog ref="userDialog" @done="handleUserDone" />
  </div>
</template>

<script type="text/ecmascript-6">
  import { mapGetters } from 'vuex'
  import ExtDatePicker from '@/components/ExtDatePicker'
  import CrmDialog from './components/crm-user-form-dialog'
  import { customerRestApi } from '@/api/crm'
  import { getUserInfo } from '@/api/call-center/call-center'
  import { CUBE } from '@/configuration'

  export default {
    name: 'crm-detail',
    components: { ExtDatePicker, CrmDialog },
    data() {
      return {
        // 工单权限
        permissionOrder: CUBE.permission.order,
        // address: "123213"
        // city_code: 123
        // company_name: "lenovo"
        // created_at: "2019-07-24 16:09:59"
        // credentials_number: "511381"
        // credentials_type: "id_card"
        // customer_id: "031606499897799621"
        // district_code: 123123
        // id: 13
        // job: "lenovo"
        // phone: [],
        // email: [],
        // name: "张三"
        // province_code: 138
        // remarks: "这是一个测试用户"
        // sex: 1
        // updated_at: "2019-07-24 16:15:06"
        // wechat_openid: []
        detail: null,
        cube_uid: null,
        currentId: null
      }
    },
    computed: {
      ...mapGetters([
        'buttonPermission'
      ]),
      displayPhones() {
        if (!this.detail.phone.length) {
          return ''
        }
        return this.detail.phone.join('</br>')
      },
      displayEmails() {
        if (!this.detail.email.length) {
          return ''
        }
        return this.detail.email.join('</br>')
      },
      displayOpenId() {
        if (!this.detail.wechat_openid.length) {
          return ''
        }
        return this.detail.wechat_openid.join('</br>')
      },
      ready() {
        return this.detail !== null
      },
      cubeUserReady() {
        return this.cube_uid !== null
      }
    },
    mounted() {
      const id = this.$route.query.cid
      if (!id) {
        return this.$message.error('错误的用户ID')
      }
      this.initData(id)
    },
    activated() {
      const id = this.$route.query.cid
      if (id && id !== this.currentId) {
        this.initData(id)
      }
    },
    methods: {
      initData(id) {
        // todo 其他页面根据customer id 跳转过来，将不再是单纯的独立CRM 详情页，应该考虑从青松的中间层里查询客户信息
        customerRestApi.get(id).then((res) => {
          const item = res.data
          if (item) {
            this.detail = item
            this.currentId = id
            return res
          }
          return Promise.reject('未能查到用户信息')
        }).then(() => {
          // 需要查询出关联的魔方用户信息，才能在详情页跳转到其他服务页面
          // 如果查询不到则忽略这个关系，异常不处理
          getUserInfo({ customer_uid: id }).then(res => {
            this.cube_uid = this.$get(res, 'data.cube_uid')

            // 使用魔方用户体系里的openid 进行回填
            // todo 微信用户绑定客户后做了更新，但是没有同步到客户详情里，仅存在于魔方用户关联体系里
            const openId = this.$get(res, 'data.open_id')
            if (!this.detail.wechat_openid.length && openId) {
              this.detail.wechat_openid.push(openId)
            }
          }).catch(() => {})
        }).catch(this.$message.warning)
      },
      editUser() {
        this.$refs.userDialog.show(this.detail)
      },
      handleUserDone() {
        this.initData(this.currentId)
      },
      createOrder() {
        this.$router.push({
          path: `/work-order/workorder/create/${this.detail.customer_id}`,
          query: { customer: this.detail.customer_id }
        })
      },
      gotoOrderQuery() {
        // /work-order/workorder/particulars?id=023190814182230633
        this.$router.push({
          path: '/work-order/workorder',
          query: { customer_id: this.detail.customer_id }
        })
      },
      gotoCaseQuery() {
        this.$router.push({
          name: 'case-query',
          query: { customer_id: this.detail.customer_id }
        })
      },
      gotoTouch() {
        this.$router.push({
          name: 'touch-query',
          query: { customer_id: this.detail.customer_id }
        })
      }
    }
  }
</script>

<style lang='scss' type="text/scss" scoped>
  .crm-detail {
    min-height: 500px;
  }
</style>
