<template>
  <div class="app-container">
    <header>
      <h1>客户中心</h1>

      <el-form :inline="true">
        <el-button
          type="primary"
          :disabled="!buttonPermission('addUserInfo')"
          plain
          @click="newUser"
        >新增</el-button>
        <el-button
          type="primary"
          :disabled="!buttonPermission('importUserInfo')"
          plain
          @click="dialogImportVisible = true"
        >导入客户</el-button>
        <el-button
          type="primary"
          :disabled="!buttonPermission('exportUserInfo')"
          plain
          @click="exportUsers"
        >导出客户</el-button>
        <el-button
          type="danger"
          :disabled="!buttonPermission('batchUserDelete')"
          plain
          @click="deleteUsers()"
        >批量删除</el-button>
      </el-form>
    </header>
    <el-card>
      <section>
        <h2>条件查询</h2>
        <el-form
          ref="queryForm"
          :inline="true"
          :model="query.condition"
          :rules="query.rules"
        >
          <el-form-item prop="customer_id">
            <el-input
              v-model="query.condition.customer_id"
              maxlength="50"
              placeholder="客户ID"
              clearable
            />
          </el-form-item>
          <el-form-item prop="name">
            <el-input
              v-model="query.condition.name"
              maxlength="50"
              placeholder="姓名"
              clearable
            />
          </el-form-item>
          <el-form-item prop="phone">
            <el-input
              v-model="query.condition.phone"
              maxlength="50"
              placeholder="电话"
              clearable
            />
          </el-form-item>
          <el-form-item prop="email">
            <el-input
              v-model="query.condition.email"
              maxlength="50"
              placeholder="邮箱"
              clearable
            />
          </el-form-item>
          <el-form-item prop="wechat_openid">
            <el-input
              v-model="query.condition.wechat_openid"
              maxlength="50"
              placeholder="OpenID"
              clearable
            />
          </el-form-item>
          <el-form-item required>
            <ext-date-picker
              v-model="query.condition.range"
              size="large"
              placehoder="创建日期"
              type="daterange"
              range-separator="至"
              start-placeholder="开始日期"
              end-placeholder="结束日期"
              format="yyyy 年 MM 月 dd 日"
              value-format="yyyy-MM-dd"
              :picker-options="query.pickerOptions"
              @range-error="handleRangeError"
            />
          </el-form-item>
        </el-form>

        <div class="text-right">
          <el-button type="primary" plain @click="queryList">查询</el-button>
          <el-button plain @click="reset">重置</el-button>
        </div>
      </section>

      <section>
        <h2>查询结果</h2>
        <el-table
          v-loading="loading('/api/crm/customer')"
          :data="query.data"
          class="crm-list"
          @select="select"
          @select-all="select"
        >
          <el-table-column type="selection" width="55" />
          <el-table-column
            header-align="center"
            align="center"
            prop="customer_id"
            label="客户ID"
          />
          <el-table-column
            header-align="center"
            align="center"
            prop="name"
            width="120px"
            label="姓名"
          />
          <el-table-column
            header-align="center"
            align="center"
            prop="phone"
            width="120px"
            label="电话"
          >
            <template slot-scope="scope">
              <div v-for="(item, index) in scope.row.phone" :key="index">
                {{ item }}
              </div>
            </template>
          </el-table-column>
          <el-table-column
            header-align="center"
            align="center"
            prop="email"
            label="邮箱"
          >
            <template slot-scope="scope">
              <div v-for="(item, index) in scope.row.email" :key="index">
                {{ item }}
              </div>
            </template>
          </el-table-column>
          <el-table-column
            header-align="center"
            align="center"
            prop="wechat_openid"
            label="OpenID"
          >
            <template slot-scope="scope">
              <div
                v-for="(item, index) in scope.row.wechat_openid"
                :key="index"
              >
                {{ item }}
              </div>
            </template>
          </el-table-column>
          <el-table-column
            header-align="center"
            align="center"
            prop="created_at"
            width="140px"
            label="创建时间"
          />
          <el-table-column
            header-align="center"
            align="center"
            prop="last_contact_time"
            width="140px"
            label="最近联系时间"
          />
          <el-table-column
            header-align="center"
            align="center"
            prop="columnProp"
            label="操作"
          >
            <template slot-scope="scope">
              <el-button
                type="text"
                style="font-weight:normal;"
                :disabled="!buttonPermission('viewUserInfo')"
                @click="gotoDetail(scope.row.customer_id)"
              >查看</el-button>
              <el-button
                type="text"
                style="font-weight:normal;"
                :disabled="!buttonPermission('editUserInfo')"
                @click="editUser(scope.row.id)"
              >编辑</el-button>
              <el-button
                class="el-link--danger delete-button"
                type="text"
                style="font-weight:normal;"
                :disabled="!buttonPermission('delteUserInfo')"
                @click="deleteUsers([scope.row.id])"
              >删除</el-button>
            </template>
          </el-table-column>
        </el-table>
      </section>

      <pagination
        :total="query.page.total"
        :limit.sync="query.page.size"
        @pagination="pagination"
      />

      <!--      <footer>-->
      <!--        <h2>查询说明</h2>-->
      <!--        <ol>-->
      <!--          <li>创建时间段为必填字段，不限制整体时间跨度；</li>-->
      <!--          <li>创建时间段默认为从今日开始往前推7日的时间段；</li>-->
      <!--          <li>关闭时间段的起始时间不能早于创建时间段的起始时间；</li>-->
      <!--          <li>条件查询中的各个查询条件之间是“与”的关系，即输入信息越多，结果越准确；</li>-->
      <!--          <li>点击“重置”按钮，会重置所有输入框的状态。</li>-->
      <!--        </ol>-->
      <!--      </footer>-->
    </el-card>

    <crm-dialog ref="userDialog" @done="handleUserDone" />
    <crm-import
      templete-url="static/crm/客户中心导入模板.xlsx"
      import-url="/api/crm/import"
      report-error-url="/api/crm/error_report"
      :visible.sync="dialogImportVisible"
      @closed="closeImportDialog"
    />
  </div>
</template>

<script type="text/ecmascript-6">
  import Pagination from '@/components/Pagination'
  import ExtDatePicker from '@/components/ExtDatePicker'
  import CrmImport from '../components/crm-import-dialog'
  import CrmDialog from './components/crm-user-form-dialog'
  import { mapGetters } from 'vuex'
  import { customerExport, customerRestApi } from '@/api/crm'
  import { paramsShake, handleDownload } from '@/utils'
  import { RegexUtil } from '@/utils/validate'

  const MAX_EXPORT_LIMIT = 10000

  const pickerOptions = {
    shortcuts: [
      {
        text: '最近一周',
        onClick(picker) {
          const end = new Date()
          const start = new Date()
          start.setTime(start.getTime() - 3600 * 1000 * 24 * 7)
          picker.$emit('pick', [start, end])
        }
      },
      {
        text: '最近一个月',
        onClick(picker) {
          const end = new Date()
          const start = new Date()
          start.setTime(start.getTime() - 3600 * 1000 * 24 * 30)
          picker.$emit('pick', [start, end])
        }
      }
    ]
  }

  export default {
    name: 'crm-index',
    components: { Pagination, ExtDatePicker, CrmImport, CrmDialog },
    data() {
      return {
        dialogImportVisible: false,
        query: {
          condition: {
            customer_id: '',
            name: '',
            phone: '',
            email: '',
            wechat_openid: '',
            range: [] // [begin_time, end_time]
          },
          rules: {
            phone: [
              {
                trigger: 'blur',
                validator: function(rule, value, callback) {
                  if (value && !RegexUtil.telephone.test(value)) {
                    return callback(new Error('请填写正确的电话号码'))
                  }
                  callback()
                }
              }
            ]
          },
          pickerOptions,
          select: [],
          page: {
            size: 10,
            current: 1,
            total: 0
          },
          data: []
        }
      }
    },
    computed: {
      ...mapGetters('api', ['loading']),
      ...mapGetters(['buttonPermission'])
    },
    mounted() {
      this.queryList()
      console.log(this.$route)
      const openTarget = this.$route.params.open
      if (openTarget === 'addUser') {
        this.$nextTick(() => {
          this.newUser()
        })
      }
    },
    methods: {
      queryList(page = 1, limit = 10) {
        // 所有条件都是可选
        // const conditionCheck = paramsShake(this.query.condition)
        // if (!Object.keys(conditionCheck).length && !this.query.condition.range) {
        //   return this.$message.warning('请至少输入一个条件进行查询')
        // }
        let bt = ''
        let et = ''
        if (this.query.condition.range.length) {
          bt = `${this.query.condition.range[0]} 00:00:00`
          et = `${this.query.condition.range[1]} 23:59:59`
        }
        const queryParams = Object.assign(
          {
            page,
            per_page: limit,
            begin_time: bt,
            end_time: et
          },
          this.query.condition
        )
        customerRestApi
          .list(paramsShake(queryParams))
          .then(res => {
            this.query.data = res.data.data
            this.query.page.total = res.data.total
            if (this.query.page.current !== res.data.current_page) {
              this.query.page.current = res.data.current_page
            }
            this.query.select = []
            if (!res.data.total) {
              //   this.$message.warning('查询不到数据')
              console.log('暂无数据')
            }
          })
          .catch(this.$message.error)
      },
      pagination({ page, limit }) {
        this.query.page.current = page
        this.query.page.size = limit
        this.queryList(page, limit)
      },
      select(selection) {
        this.query.select = selection.map(item => item.id)
      },
      gotoDetail(cid) {
        this.$router.push({
          name: 'crm-detail',
          query: { cid }
        })
      },
      newUser() {
        this.$refs.userDialog.show()
      },
      editUser(id) {
        const user = this.query.data.find(item => item.id === id)
        user.credentials_type = user.credentials_type || ''
        this.$refs.userDialog.show(user)
      },
      handleUserDone(done) {
        this.queryList(this.query.page.current, this.query.page.size)
        // 只有新建客户才触发跳转
        if (!done.isEditing) {
          this.gotoDetail(done.response.data.customer_id)
        }
      },
      deleteUsers(ids) {
        const targetIds = ids || this.query.select
        if (!targetIds.length) {
          return this.$message.warning('请选择删除目标')
        }
        this.$confirm(`确认删除这${targetIds.length}个用户？`, '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        })
          .then(() => {
            return customerRestApi
              .delete(targetIds.join(','))
              .catch(this.$message.error)
          })
          .then(() => {
            this.$message.success('删除完成')
            this.queryList(this.query.page.current, this.query.page.size)
          })
          .catch(() => {})
      },
      exportUsers() {
        if (
          this.query.select.length === 0 &&
          this.query.page.total > MAX_EXPORT_LIMIT
        ) {
          return this.$alert(
            `每次最多下载条${MAX_EXPORT_LIMIT}客户信息，当前下载列表已超出范围，请您重新选择。`
          )
        }
        if (this.query.select.length) {
          customerExport({ ids: this.query.select }).then(res => {
            handleDownload(res.filename, res.blob)
          })
        } else {
          const queryParams = Object.assign({
            name: this.query.condition.name,
            customer_id: this.query.condition.customer_id,
            wechat_openid: this.query.condition.wechat_openid,
            phone: this.query.condition.phone,
            email: this.query.condition.email,
            begin_time: this.query.condition.range[0],
            end_time: this.query.condition.range[1]
          })
          customerExport(paramsShake(queryParams)).then(res => {
            console.log('export', res.filename)
            handleDownload(res.filename, res.blob)
          })
        }
      },
      handleRangeError(span) {
        this.$message.warning('时间跨度超出范围')
      },
      reset() {
        this.query.condition.range = []
        this.$refs.queryForm.resetFields()
      },
      closeImportDialog() {
        this.queryList()
      }
    }
  }
</script>

<style lang="scss" type="text/scss" scoped>
.crm-list .delete-button {
  color: #f37261 !important;
}
</style>
