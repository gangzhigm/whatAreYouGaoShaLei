/**
 * 发送消息
 * 多语言
 * 🇨🇳中文翻译
 */
export default {
    __name__: 'massSend',

    /* 发送消息路由 */
    createMessage: '新建下发消息',
    sent: '已发送',

    /* 消息类型 */
    messageType: '消息类型',
    massSend: '群发消息',
    serviceMessage: '客服消息',
    templateMessage: '模板消息',
    textMessage: '文字消息',

    nonOriginal:'非原创图文处理',
    //群发消息 - 非原创图文发送规范
    graphicSpecification:'微信会将需要群发的文章，与公众平台原创库中的文章进行比较，相似度过高时，判定为非原创图文。\n' +
        '本文章若为原创图文将正常发送，当被判定为非原创图文时，需要选择一种发送处理方式。',
    detailUrl:'详情见微信官方文档',
    chooseWay:'请选择非原创图文的处理方式',
    continueSend:'继续群发（群发时，会自动替换成原文的样式，且会自动将文章注明为转载并显示来源）',
    stopSend:'停止群发',

    customerTip: '只有在48小时内有',
    interactive: '互动',
    customerServiceTip: '的联系人才能收到该类型的消息。',
    behaviorContent: '互动行为包括：<br>1.联系人发送信息<br>2.点击自定义菜单（仅有点击推事件、扫描推事件、<br>扫描推事件且弹出“消息接收中”提示框这三种菜单类<br>型是会触发客服接口的）<br>3.关注公众号<br>4.扫描二维码<br>5.支付成功<br>6.联系人维权',
    templateMessageContent: '模板消息仅用于公众号向用户发送重要的服务通知，只能用于符合其要求的服务场景中，不支持广告等营销类消息以及其它所有可能对用户造成骚扰的消息。详情请见',
    templateRule: '《模板消息运营规范》',
    imageTextDel: '当所有用户发送完毕后，图文消息将从草稿箱删除',

    /* 对象、类型、时间 */
    recipient: '群发对象',
    recipientMessage: '消息对象',
    sendType: '发送类型',
    sendTime: '发送时间',
    chooseContent: '选择素材',
    sendImm: '立即发送',
    timingSend: '定时发送',
    chooseTemplate: '选择模板消息',
    chooseCustomer: '已选择',
    user: '个用户',
    users: '个用户',
    needTime: '大约需要',
    minutes: '分钟',
    hours: '小时',
    keyword: '按名称搜索...',

    choose: '请选择',
    allUsers: '所有用户',
    alRecipientSelected: '未选择发送对象!',
    expire: '定时发送的【发送时间】过期，请重新选择',
    chooseConfirm: '请添加内容或选择素材',
    contentNoEmpty: '不能为空',
    textNoExceed: '不能超过600字符',
    massSendConfirm: '群发确认',
    confirmContent: '开始群发后无法撤销，是否确认？',
    noRepeat: '请耐心等待，请勿重复发送',
    failedReason: '原因',
    noTemplateTip: '没有匹配模板',

    /* 发送消息 */
    sendMessage: '发送消息',

    /* 发送完成 */
    sendSuccess: '发送完成',

    /* 已发送 */
    status: '发送状态',
    originalGraphic: '非原创图文处理方式',
    setting: '发送设置',
    operation: '操作',
    success: '发送成功人数：',
    failure: '失败人数：',
    reasonFailure: '失败原因',
    causeFailure: '非原创，停止发送',
    tobeSend: '待发送',
    keepSend:'继续发送',
    sendStop:'停止发送',
    read: '阅读',
    like: '点赞',
    Users: '用户',
    messageName: '消息名称',
    resendTimes: '重发次数',
    timingSendTime: '定时发送时间',
    resend: '失败用户重新发送',
    refresh: '刷新',
    resends: '重发',
    notDelete: '发送中和待发送的数据不可删除',
    selectTime: '请选择时间',
    sendTimeToast: '请填写定时发送的【发送时间】',
    sedFailure: '发送失败，失败原因:(',
    functionDisabledTip: '当前微信公众号为订阅号，不支持下发模板消息！',
    /*发送中*/
    sending:'发送中',

    // Pall中国限定 菜单消息相关
    invalidGroup: '已失效分组',
    invalidLabel: '已失效标签',

    delgruop: '删除群发',
    confirm: '确定删除本条发送记录？',
    selectMessage: '选择图文',
    selectVideo: '选择视频',
    videoTip: '请选择要删除的已群发视频',
    textTip: '请选择要删除的已群发图文',
    sendingPart: '删除部分群发',
    sendingAlready: '已删除群发',
    delOk: '以下图文将被删除，是否确定？',
    deleted: '已删除'
};
