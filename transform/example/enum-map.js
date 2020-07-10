import { AGENTSTATE, CALLTYPE, MessageID, REASONCODE } from '@call/voice-freeswitch/enum'

export const callTypeMap = {
  '-1': '',
  [CALLTYPE.UNKNOWN]: '未知类型',
  [CALLTYPE.INTERNAL]: '内部通话',
  [CALLTYPE.INBOUND]: '客户呼入',
  [CALLTYPE.OUTBOUND]: '手动呼出', // 在页面的电话条或SIP话机上呼出PSTN电话
  [CALLTYPE.CONSULT]: '电话转接',
  [CALLTYPE.THREEWAY]: '多方通话',
  [CALLTYPE.ORDERCALLBACK]: '预约回呼', // 客户呼入后，排队超时，使用预约回呼功能后，系统自动回呼或者坐席手动回呼
  [CALLTYPE.MANUALCALLBACK]: '电话回访', // 在未接来电中，客户名单，语音信箱，满意度调查等页面进行回拨的
  [CALLTYPE.PREDICT]: '预测外呼',
  [CALLTYPE.PREVIEW]: '预览外呼',
  [CALLTYPE.WEBPHONE]: '网页电话',
  [CALLTYPE.MONITORING]: '班长监听/强插'
}
export const agentStateMap = {
  [AGENTSTATE.LOGOUT]: '离线',
  [AGENTSTATE.READY]: '就绪',
  [AGENTSTATE.NOTREADY]: '未就绪'
}
export const agentReasonCodeMap = {
  [REASONCODE.ACW]: '案面',
  [REASONCODE.TALKING]: '通话中',
  [REASONCODE.BUSY]: '忙碌',
  [REASONCODE.REST]: '小休',
  [REASONCODE.RING]: '振铃'
}
export const callStateDisplayMap = {
  [MessageID.EventDialing]: '拨号中',
  [MessageID.EventRinging]: '振铃中',
  [MessageID.EventEstablished]: '通话中',
  [MessageID.EventReleased]: '已挂断',
  [MessageID.EventHeld]: '保持中',
  [MessageID.EventRetrieved]: '通话中',
  [MessageID.EventAbandoned]: '已废弃'
}

export const messageIdDisplayMap = {
  [MessageID.EventAgentLogin]: 'EventAgentLogin',
  [MessageID.EventAgentLogout]: 'EventAgentLogout',
  [MessageID.EventAgentNotReady]: 'EventAgentNotReady',
  [MessageID.EventAgentReady]: 'EventAgentReady',
  [MessageID.EventQueued]: 'EventQueued',
  [MessageID.EventRinging]: 'EventRinging',
  [MessageID.EventAbandoned]: 'EventAbandoned',
  [MessageID.EventDialing]: 'EventDialing',
  [MessageID.EventEstablished]: 'EventEstablished',
  [MessageID.EventAttachedDataChanged]: 'EventAttachedDataChanged',
  [MessageID.EventDtmfSent]: 'EventDtmfSent',
  [MessageID.EventHeld]: 'EventHeld',
  [MessageID.EventRetrieved]: 'EventRetrieved',
  [MessageID.EventReleased]: 'EventReleased',
  [MessageID.EventThreeWayEstablished]: 'EventThreeWayEstablished',
  [MessageID.EventThreeWayReleased]: 'EventThreeWayReleased',
  [MessageID.EventOcbNumberInfo]: 'EventOcbNumberInfo',
  [MessageID.EventPartyInfo]: 'EventPartyInfo',
  [MessageID.EventSysSettingsUpdate]: 'EventSysSettingsUpdate',
  [MessageID.EventConferenceInfo]: 'EventConferenceInfo',
  [MessageID.EventAgentInfo]: 'EventAgentInfo',
  [MessageID.EventRegistered]: 'EventRegistered',
  [MessageID.EventUnregistered]: 'EventUnregistered',
  [MessageID.EventLinkConnected]: 'EventLinkConnected',
  [MessageID.EventLinkDisconnected]: 'EventLinkDisconnected',
  [MessageID.EventError]: 'EventError',
  [MessageID.EventWelcome]: 'EventWelcome',
  [MessageID.EventPong]: 'EventPong'
}

/**
 * 获取当前坐席的状态
 * @param agentState
 * @param reasonCode
 * @return {string}
 */
export const getAgentStateDisplay = function(agentState, reasonCode) {
  // 仅显示案面扩展状态
  if (agentState === AGENTSTATE.NOTREADY && reasonCode === REASONCODE.ACW) {
    return agentReasonCodeMap[reasonCode]
  }
  return agentStateMap[agentState]
}

/**
 * 获取当前坐席的扩展状态（包含未就绪时的状态）
 * @param agentState
 * @param reasonCode
 * @return {string}
 */
export const getAgentStateExtendDisplay = function(agentState, reasonCode) {
  if (agentState === AGENTSTATE.NOTREADY) {
    return agentReasonCodeMap[reasonCode]
  }
  return agentStateMap[agentState]
}
