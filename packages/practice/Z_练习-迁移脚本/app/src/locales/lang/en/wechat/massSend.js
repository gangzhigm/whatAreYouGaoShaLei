/**
 * 发送消息
 * i18n
 * 🇬🇧 English translations
 */
export default {
    __name__: 'massSend',

    /* 发送消息路由 */
    createMessage: 'create message',
    sent: 'Message list',

    /* 消息类型 */
    messageType: 'Message type',
    massSend: 'Mass send',
    serviceMessage: 'Customer service message',
    templateMessage: 'Template message',
    textMessage: 'Text message',

    nonOriginal: 'Process method of non-original article sending',

    //群发消息 - 非原创图文发送规范
    graphicSpecification: 'Before send the articles WeChat will compare the article with articles in the original library of the public platform.\n' +
        'If the similarity is too high, it is determined to be non-original article.\n' +
        'If this article is an original article, it will be sent normally. When it is judged as a non-original article, you need to choose a sending processing method.',
    detailUrl: 'See WeChat official documentation for details',
    chooseWay: 'Please choose a  way of  sending',
    continueSend: 'Continue to send  (It will be automatically replaced with the original style, and the article will be automatically marked as a reprint and the source will be displayed）',
    stopSend: 'Stop sending',


    customerTip: 'Only',
    interactive: 'interactive',
    customerServiceTip: 'customers within 48 hours can received  the customer service message',
    behaviorContent: 'Interactive behaviors include:<br>1. customers send messages<br>2. click on the custom menuclick on the custom menu <br>(only click events, scan  events,and scan  events with <br>the popup of “message receiving”will triger customer<br> service interface.)<br>Type will trigger customer service interface.<br>3.follow wechat account<br>4. scan QR Code<br>5. successful payment<br>6. customer rights protection',
    templateMessageContent: 'Template messages are only used to send important service notifications to users by wechat account,They can only be used in service scenarios that meet their requirements,do not support marketing messages such as advertisements and other messages that may cause harassment to users.For details, please enter:',
    templateRule: '《Template message operation specification》',
    imageTextDel: 'When all users have finished sending, the content will be deleted from the draft box',

    /* 对象、类型、时间 */
    recipient: 'Recipient',
    recipientMessage: 'Recipient',
    sendType: 'Send Time',
    sendTime: 'Send Time',
    chooseContent: 'Choose contents',
    sendImm: 'Send immediately',
    timingSend: 'Timing send',
    chooseTemplate: 'Choose template message',
    chooseCustomer: 'Already choose',
    user: 'user',
    users: 'users',
    needTime: 'need about',
    minutes: 'minutes',
    hours: 'hours',
    keyword: 'Search by content name',

    choose: 'please choose',
    allUsers: 'All users',
    alRecipientSelected: 'No recipient selected',
    expire: 'timing send expires, please re-select',
    chooseConfirm: 'Please choose a content or add new content',
    contentNoEmpty: 'Content cannot be empty.',
    textNoExceed: 'Cannot exceed 600 characters.',
    massSendConfirm: 'Mass Send Confirm',
    confirmContent: 'Cannot be revoked after mass sending, is it confirmed?',
    noRepeat: 'please wait patiently and do not send repeatedly',
    failedReason: 'reason',
    noTemplateTip: 'No template',

    /* 发送消息 */
    sendMessage: 'Send',

    /* 发送完成 */
    sendSuccess: 'Send completed',

    /* 已发送 */
    status: 'Status',
    originalGraphic: 'Non-original graphic processing',
    reasonFailure: 'cause',
    setting: 'Sent setting',
    operation: 'Options',
    success: 'success:',
    failure: 'failure:',
    causeFailure:'non-original, stop sending',
    tobeSend: 'to be send',
    keepSend:'Keep sending',
    sendStop:'Stop sending',
    read: 'read',
    like: 'like',
    Users: 'users',
    messageName: 'Message name',
    resendTimes: 'Resend times',
    timingSendTime: 'Timing send time',
    resend: 'Resend',
    refresh: 'Refresh',
    resends: 'Resend',
    notDelete: 'Send and pending data cannot be deleted',
    selectTime: 'Please select time',
    sendTimeToast: 'Please input send time of timing send ',
    sedFailure: 'Send failure,reason for failure:(',
    functionDisabledTip: 'The current WeChat official account is a subscription account which does not support template message!',
    /*发送中*/
    sending:'sending',

    // Pall中国限定 菜单消息相关
    invalidGroup: 'invalid group',
    invalidLabel: 'invalid label',

    delgruop: 'Delete mass',
    confirm: 'Are you sure to delete this sending record?',
    selectMessage: 'Select app message',
    selectVideo: 'Select video',
    videoTip: 'Please select the video graphic that needs to be deleted',
    textTip: 'Please select the group-posted graphic that needs to be deleted',
    sendingPart: 'Delete part of the group',
    sendingAlready: 'Group post deleted',
    delOk: 'The following pictures and texts will be deleted, are you sure?',
    deleted: 'Deleted'
};
