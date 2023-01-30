/**
 * 模板管理
 * 多语言
 * 🇨🇳中文翻译
 */
export default {
    __name__: 'template',

    // 列表页
    myTemplate: '我的模板',
    invalidTemplate: '失效模板',
    invalidDetails: '失效详情',
    editTemplate: '模板编辑',
    allTemplate: '模板消息',
    count: '条',
    update: '获取更新',
    order: '序号',
    id: '模板ID',
    title: '标题',
    industry: '一级行业',
    subIndustries: '二级行业',
    status: '状态',
    operation: '操作',
    search: '请输入标题搜索',
    paramNot: '参数未赋值',
    paramHas: '参数已赋值',
    view: '查看',
    useMsg: '使用须知：',
    msg1: '1. 使用微信公众号模板消息必须绑定认证服务号，订阅号不提供此功能；',
    msg2: '2. 请在微信公众号后台开通“模板消息”功能；',
    msg3: '3. 在本平台进行公众号模板消息推送前，需要先对模板内容参数进行赋值；',
    msg4: '4. 如在微信公众号后台删除某个模板消息，则本平台对应的模板消息即会失效无法发送。',
    invalidId: '模板ID已失效',

    // 详情页
    tempStatus: '模板状态',
    wechatAccount: '公众号',
    // id: '模板ID',
    clickJump: '点击跳转',
    notSet: '小程序暂未设置',
    noSetting: '无设置内容',

    // jump to
    jumpTo: '跳转',
    jumpSet: '跳转设置',
    toUrl: '模板跳转URL',
    urlAddr: 'URL地址',
    url: '跳转的url',
    toApplet: '模板跳转小程序',
    appletId: '小程序appid',
    appId: '跳转的小程序appid',
    appletAddr: '小程序跳转地址',
    appUrl: '跳转的小程序url',
    appletMsg: '仅支持跳转已绑定公众账号的小程序，<br>旧版微信客户端无法支持小程序，<br>用户点击菜单时将会打开备用网页，<br>可不填',
    toForm: '模板跳转表单',
    jumpForm: '跳转的表单',
    alternatePage: '备用网页',
    alternatePageUrl: '备选网页地址',
    inputAppid: '请输入小程序appid',
    inputUrl: '请输入小程序路径',
    inputAlternatePage: '请输入备用网页',

    // content
    content: '内容',
    contentEdit: '内容编辑',
    tempContent: '模板内容',
    tempValue: '模板赋值',
    insertField: '插入自定义字段',

    detail: '详细内容',
    detailMsg1: '约',
    detailMsg2: '字，超过',
    detailMsg3: '字无法发送；字段参数占用字数，以实际发送为准。',
    example: '模板示例',
    tempIndustry: '行业',
    // title: '标题',
    warnMsg1: '请自觉遵守',
    warnMsg2: '《微信官方模板消息规范》',
    warnMsg3: '如发送不正当内容将会导致微信封号。',

    // test
    test: '测试',
    tempTest: '模板测试',
    targetAccount: '目标公众号',
    fans: '粉丝列表',
    testSearch: '输入关键词搜索...',
    fansMsg1: '目前共选',
    fansMsg2: '个粉丝，最多可选10个',
    clear: '清空选择',
    noFans: '暂无粉丝列表',
    nowTest: '立即测试',
    sending: '发送中',

    // toast
    contentWarn: '模板内容不能超过1000字符',
    lessThan1000: '不能超过1000个字符',
    choiceFans: '请选择发送测试的粉丝',
    mostFans: '最多选择10个粉丝',
    urlWarn: '请选择填写跳转的URL',
    appletSet: '请填写小程序相关配置',
    alternativeAppUrl: '请输入正确url ',
    formWarn: '请选择跳转表单',
    contentTooLong: '输入的内容过长',
    functionDisabledTip: '当前微信公众号为订阅号，不支持模板消息相关功能！'
};
