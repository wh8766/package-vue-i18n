<template>
  <div class="recorder-container" v-if="containerDisplay">
    <el-form :inline="true" class="recorder-form">
      <el-form-item :label="$t('@3C570:记录名称')">
        <el-input v-model="name" :disabled="recording" :placeholder="$t('@3C570:请输入记录名称')"></el-input>
      </el-form-item>
      <el-form-item>
        <el-switch
          v-model="recording"
          @change="recordingChange"
          :disabled="name === ''"
          :active-text="$t('@3C570:记录中')"
          :inactive-text="$t('@3C570:停止')"></el-switch>
      </el-form-item>
      <el-form-item>
        {{ $t('@A4ABA:已记录 ') }}<b>{{messages.length}}</b> {{ $t('@A4ABA:条') }}
      </el-form-item>
    </el-form>
    <el-form :inline="true" class="recorder-form">
      <el-form-item :label="$t('@3C570:选择记录')">
        <el-select :placeholder="$t('@3C570:请选择回放记录')" v-model="selectedRecord" @change="recordChange">
          <el-option v-for="record in recordsList" :label="record.name" :value="record.key" :key="record.key"></el-option>
        </el-select>
      </el-form-item>

      <span>{{ $t('@3C570:剩余 ') }}<b>{{replayMessages.length}}</b> {{ $t('@3C570:条') }}</span>

      <el-button-group>
        <el-button type="primary" @click="autoPlay" v-if="!timer">{{ $t('@3C570:自动') }}</el-button>
        <el-button type="primary" @click="stopPlay" v-else>{{ $t('@3C570:停止') }}</el-button>
      </el-button-group>

      <el-button-group v-if="selectedRecord">
        <el-popover
          v-if="replayMessages.length"
          placement="bottom"
          width="850"
          trigger="hover">
          <div>
            <h3>{{ $t('@A4ABA:当前执行') }}</h3>
            <div v-html="formatJSONData(formartMessage(currentReplayMessage))"></div>
            <h3>{{ $t('@A4ABA:下一条') }}</h3>
            <div v-html="formatJSONData(formartMessage(replayMessages[0]))"></div>
          </div>
          <el-button slot="reference" type="primary" @click="stepPlay">{{ $t('@A4ABA:单步') }}</el-button>
        </el-popover>
        <el-button v-else type="primary" @click="restartPaly">{{ $t('@A4ABA:重新开始单步') }}</el-button>
      </el-button-group>

      <el-dropdown trigger="click">
        <el-button type="danger">
          {{ $t('@3C570:更多操作') }}<i class="el-icon-arrow-down el-icon--right"></i>
        </el-button>
        <el-dropdown-menu slot="dropdown">
          <el-dropdown-item @click.native="reviewRecord">{{ $t('@3C570:查看记录') }}</el-dropdown-item>
          <el-dropdown-item @click.native="renameRecord">{{ $t('@A4ABA:重命名记录') }}</el-dropdown-item>
          <el-popover
            placement="left"
            width="50"
            trigger="click">
            <div class="text-center">
              <a ref="link" class="link"><i class="el-icon-download"></i>{{ $t('@3C570:下载记录数据') }}</a>
            </div>
            <el-dropdown-item slot="reference" @click.native="downloadRecord">{{ $t('@3C570:下载记录') }}</el-dropdown-item>
            <el-dropdown-item slot="reference" @click.native="addRecord">{{ $t('@3C570:填写记录') }}</el-dropdown-item>
            <el-dropdown-item slot="reference" @click.native="uploadRecord">{{ $t('@3C570:载入记录') }}</el-dropdown-item>
          </el-popover>
          <el-popover
            placement="left"
            width="200"
            trigger="click">
            <el-form-item>
              <el-slider v-model="speed" :min="0.5" :max="2" :step="0.5"></el-slider>
            </el-form-item>
            <el-dropdown-item slot="reference">{{ $t('@3C570:播放速度调整') }}</el-dropdown-item>
          </el-popover>

          <el-dropdown-item @click.native="removeRecord" divided>{{ $t('@3C570:移除记录') }}</el-dropdown-item>
          <el-dropdown-item @click.native="removeAllRecords">{{ $t('@3C570:移除全部记录') }}</el-dropdown-item>
          <el-dropdown-item @click.native="hideTool" divided>{{ $t('@3C570:关闭工具栏') }}</el-dropdown-item>
        </el-dropdown-menu>
      </el-dropdown>

    </el-form>

    <el-dialog :title="$t('@A4ABA:播放速度调整')" :visible.sync="dialogSpeedVisible" width="400px">
      <el-form label-width="100px">
        <el-form-item :label="$t('@A4ABA:速度（秒）')">
          <el-slider v-model="speed" :min="0.5" :max="2" :step="0.5"></el-slider>
        </el-form-item>
      </el-form>
    </el-dialog>

    <el-dialog
      :title="$t('@3C570:数据查看')"
      fullscreen
      :before-close="() => {this.reviewMessagesData = []}"
      :visible="reviewMessagesData.length > 0">
      <el-table
        :data="reviewMessagesData"
        style="width: 100%">
        <el-table-column
          prop="time"
          label="time"
          show-overflow-tooltip
        />
        <el-table-column
          prop="callState"
          label="callState"
          show-overflow-tooltip
        />
        <el-table-column
          prop="messageName"
          label="messageName"
          show-overflow-tooltip
        />
        <el-table-column
          prop="otherDn"
          label="otherDn"
          show-overflow-tooltip
        />
        <el-table-column
          prop="connId"
          label="connId"
          show-overflow-tooltip
        />
        <el-table-column
          prop="transferConnId"
          label="transferConnId"
          show-overflow-tooltip
        />
        <el-table-column
          prop="callType"
          label="callType"
          show-overflow-tooltip
        />
        <el-table-column
          prop="VirualQueue"
          label="VirualQueue"
          show-overflow-tooltip
        />
        <el-table-column
          prop="displayName"
          label="displayName"
          show-overflow-tooltip
        />
        <el-table-column
          prop="ecloud_consult_operation"
          label="consultOperation"
          show-overflow-tooltip
        />
        <el-table-column :label="$t('@A4ABA:数据')">
          <template v-slot:default="scope">
            <el-popover
              placement="left"
              trigger="hover"
              width="650">
              <div v-html="formatJSONData(scope.row)"></div>
              <el-button type="text" slot="reference">{{ $t('@A4ABA:查看') }}</el-button>
            </el-popover>
          </template>
        </el-table-column>
      </el-table>
      <span slot="footer" class="dialog-footer">
        <el-select :placeholder="$t('@3C570:请选择回放记录')" v-model="selectedRecord" @change="viewRecordChange">
          <el-option v-for="record in recordsList" :label="record.name" :value="record.key" :key="record.key"></el-option>
        </el-select>
        <el-button type="primary" @click="reviewMessagesData = []">{{ $t('@3C570:关闭') }}</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script type="text/ecmascript-6">
  import { $t } from '@/lang/static'

  import { MessageType } from '@call/voice-genesys/enum'
  import ws from '@/api/softphone-genesys/softphone-ws'
  import { isProd, uuid } from '@/utils'
  import get from 'lodash.get'
  import axios from 'axios'
  import Prism from 'prismjs'

  const recordMessageTypes = [MessageType.CallStateChange, MessageType.DeviceStateChange]
  const RECORD_STORAGE_PREFIX = 'GENESYS_RECORD_STORAGE_PREFIX'

  export default {
    name: 'voice-recorder',
    data() {
      return {
        name: '',
        recording: false,
        messages: [],

        currentReplayMessage: null,

        selectedRecord: '',
        recordsList: [],
        replayMessages: [],
        reviewMessagesData: [],
        readyToPlay: false,
        timer: null,
        speed: 0.5,

        dialogSpeedVisible: false,
        containerDisplay: !isProd
      }
    },
    mounted() {
      recordMessageTypes.forEach(type => {
        ws.addEventListener(type, this._recorderMessageHandle)
      })
      this.refreshRecordList()
    },
    beforeDestroy() {
      recordMessageTypes.forEach(type => {
        ws.addEventListener(type, this._recorderMessageHandle)
      })
      this.timer && clearInterval(this.timer)
    },
    methods: {
      _recorderMessageHandle(message, type) {
        if (!this.recording) {
          return
        }

        this.messages.push(message)
      },
      formartMessage(message) {
        if (!message) {
          return null
        }
        const data = message.data
        return {
          ...data,
          time: data.timestamp.split(' ')[1],
          callState: get(data, 'call.state'),
          messageName: data.messageName,
          displayName: get(data, 'devices[0].userState.displayName', ''),
          otherDn: get(data, 'otherDn', ''),
          connId: get(data, 'call.connId', ''),
          transferConnId: get(data, 'call.transferConnId', ''),
          callType: get(data, 'call.callType', ''),
          VirualQueue: get(data, 'call.userData.n_vq_name', ''),
          functionPoint: get(data, 'call.userData.functionPoint', ''),
          ecloud_consult_operation: get(data, 'call.userData.ecloud_consult_operation')
        }
      },
      recordingChange(state) {
        if (state) {
          this.recording = true
          this.messages = []
        } else {
          if (!this.messages.length) {
            this.$message.warning($t('@3C570:没有捕获到电话事件，不做保存'))
            return
          }
          localStorage.setItem(uuid(RECORD_STORAGE_PREFIX), JSON.stringify({
            name: this.name,
            messages: this.messages
          }))

          this.refreshRecordList()
          this.$message.success($t('@3C570:事件记录已保存'))

          this.recording = false
          this.name = ''
        }
      },
      reviewRecord() {
        if (!this.selectedRecord) {
          this.$message.warning($t('@3C570:请选择要查看的事件记录'))
          return
        }

        const recordData = JSON.parse(localStorage.getItem(this.selectedRecord))
        recordData.messages.filter(item => item.data).forEach((data) => {
          this.reviewMessagesData.push(this.formartMessage(data))
        })
      },
      viewRecordChange() {
        this.reviewMessagesData = []
        this.reviewRecord()
      },
      renameRecord() {
        if (!this.selectedRecord) {
          this.$message.warning($t('@A4ABA:请选择要重命名的事件记录'))
          return
        }
        this.$prompt($t('@A4ABA:请输新的名词'), $t('@A4ABA:重命名')).then(({ value }) => {
          if (!value || value.length > 20) {
            return this.$message.warning($t('@A4ABA:新名词不能为空或者超出20字'))
          }
          const recordData = JSON.parse(localStorage.getItem(this.selectedRecord))
          recordData.name = value
          localStorage.setItem(this.selectedRecord, JSON.stringify(recordData))
          this.refreshRecordList()
          this.$message.success($t('@A4ABA:重命名成功'))
        }).catch(() => {})
      },
      removeRecord() {
        if (!this.selectedRecord) {
          this.$message.warning($t('@3C570:请选择要移除的事件记录'))
          return
        }

        const recordData = JSON.parse(localStorage.getItem(this.selectedRecord))
        this.$confirm($t('@3C570:确定移除？') + recordData.name).then(() => {
          localStorage.removeItem(this.selectedRecord)
          this.refreshRecordList()
          this.$message.success($t('@3C570:事件记录已移除'))
        }).catch(() => {})
      },
      removeAllRecords() {
        this.$confirm($t('@3C570:确定全部移除？')).then(() => {
          this.recordsList = []

          for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i)
            if (key.startsWith(RECORD_STORAGE_PREFIX)) {
              localStorage.removeItem(key)
            }
          }
          this.refreshRecordList()
          this.$message.success($t('@3C570:事件记录已批量移除'))
        }).catch(() => {})
      },
      downloadRecord() {
        if (!this.selectedRecord) {
          this.$message.warning($t('@3C570:请选择要下载事件记录'))
          return
        }

        const recordData = JSON.parse(localStorage.getItem(this.selectedRecord))

        if (!recordData.messages.length) {
          this.$message.warning($t('@3C570:播放事件队列为空，请重新录制或者选择其他记录'))
          return
        }

        // https://codepen.io/vidhill/pen/bNPEmX
        const json = JSON.stringify(recordData)
        const blob = new Blob([json], { type: 'octet/stream' })

        this.$refs.link.href = window.URL.createObjectURL(blob)
        this.$refs.link.target = '_blank'
        // target filename
        this.$refs.link.download = `${this.selectedRecord}-${recordData.name}-record.json`
      },
      addRecord() {
        this.$prompt($t('@3C570:JSON 内容')).then(({ value }) => {
          localStorage.setItem(uuid(RECORD_STORAGE_PREFIX), value)
          this.refreshRecordList()
          this.$message.success($t('@3C570:事件记录已保存'))
        }).catch(() => {})
      },
      uploadRecord() {
        let recordData
        this.$prompt($t('@3C570:sentry 捕获到的JSON 地址')).then(({ value }) => {
          return axios.get(value.trim(), {
            timeout: 10 * 1000,
            headers: {
              'Content-Type': 'application/json',
              'charset': 'utf-8'
            }
          })
        }).then((json) => {
          recordData = json.data
          return this.$prompt($t('@3C570:获取数据成功，填写记录名称'))
        }).then(({ value }) => {
          localStorage.setItem(uuid(RECORD_STORAGE_PREFIX), JSON.stringify({
            name: value.trim(),
            // 可能包含了error 信息
            messages: recordData.filter(item => item.data).reverse()
          }))
          this.refreshRecordList()
          this.$message.success($t('@3C570:事件记录已保存'))
        }).catch(() => {})
      },
      refreshRecordList() {
        this.recordsList = []

        for (let i = 0; i < localStorage.length; i++) {
          const key = localStorage.key(i)
          if (key.startsWith(RECORD_STORAGE_PREFIX)) {
            const data = JSON.parse(localStorage.getItem(key))
            this.recordsList.push({
              key,
              name: data.name
            })
          }
        }

        // 根据name 排个序吧，方便对用例进行管理
        this.recordsList = this.recordsList.sort((a, b) => a.name.charCodeAt() - b.name.charCodeAt())
        this.selectedRecord = ''
      },
      recordChange(key) {
        const data = JSON.parse(localStorage.getItem(key))
        this.replayMessages = data.messages
      },
      _beforePlay() {
        if (!this.replayMessages.length) {
          this.$message.warning($t('@3C570:播放事件队列为空，请重新录制或者选择其他记录'))
          return false
        }
        if (!this.readyToPlay) {
          ws.destroy()
          this.$message.info($t('@3C570:开始播放后，电话条不再接收真实事件，刷新后可恢复'))
        }
        this.readyToPlay = true
        return true
      },
      autoPlay() {
        if (!this.selectedRecord) {
          this.$message.warning($t('@3C570:请选择事件记录'))
          return
        }

        // 恢复一下数据
        this.restartPaly()

        if (!this._beforePlay()) {
          return
        }

        this.timer = setInterval(() => {
          const data = this.stepPlay()
          if (!data) {
            clearInterval(this.timer)
            this.timer = null
          }
        }, this.speed * 1000)
      },
      stopPlay() {
        this.timer && clearInterval(this.timer)
        this.timer = null
      },
      restartPaly() {
        if (!this.replayMessages.length) {
          this.recordChange(this.selectedRecord)
          this.currentReplayMessage = null
        }
      },
      stepPlay() {
        if (!this._beforePlay()) {
          return
        }

        const data = this.replayMessages.shift()
        if (data) {
          ws.addPool(data)
        }
        this.currentReplayMessage = data
        return data
      },
      hideTool() {
        this.containerDisplay = false
      },
      formatJSONData(json) {
        return Prism.highlight(JSON.stringify(json), Prism.languages.javascript, 'javascript')
      }
    }
  }

</script>

<style lang='scss' type="text/scss" scoped>
  @import "../../scss/rules";
  @import "~prismjs/themes/prism-tomorrow.css";

  .recorder-container {
    border-bottom: 1px solid $borderColor;
    background-color: $bg-light-blue;
    padding-top: 10px;
    padding-left: 10px;
    padding-right: 10px;

    .recorder-form span {
      color: $ldark;
      display: inline-block;
      line-height: 28px;
      font-size: 14px;
    }

    .link {
      color: $link;
    }
  }
  /deep/ .is-active {
    color: #2691ff
  }
</style>
