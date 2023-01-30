const commonTranslation = {
    __name__: 'common',
    loading: '加载中',
    today: '今天',
    tomorrow: '明天',
    dayAfterTomorrow: '后天',
    day: '天',
    week: '周',
    month: '月',
    noOfTimes: '按次数',
    noOfDays: '按天数',
    absoluteDate: '绝对日期',
    monday: '周一',
    tuesday: '周二',
    wednesday: '周三',
    thursday: '周四',
    friday: '周五',
    saturday: '周六',
    sunday: '周日',
    edit: '编辑',
    detail: '详情',
    del: '删除',
    create: '创建',
    search: '搜索',
    preview: '预览',
    copy:'复制',
    select: '选择',
    zoom: '放大',
    close: '关闭',
    total: '共',
    clear: '清空',
    notice: '提示',
    remind: '提醒',
    upload: '上传',
    download: '下载',
    high: '高',
    file: '文件',
    import: '导入',
    // 列表空状态
    noResult: '无匹配结果',
    checkAll: '查看全部',
    noData: '暂无数据',
    or: '或',
    and: '且',
    to: '至',
    yes: '是',
    no: '否',
    noAny: '当前没有任何',
    unknown: '[未知]',
    // 选中状态
    allSelected: '全选',
    cancelAll: '取消全选',
    invert: '反选',
    // confirm
    cancel: '取消',
    confirm: '确定',
    previous: '上一步',
    next: '下一步',
    complete: '完成',
    back: '返回',
    defaultConfirmTitle: '确认操作',
    save: '保存',
    send: '发送',
    sendValidateCode: '获取验证码',
    ok: '确定',
    submit: '提交',
    // toast
    saving: '正在保存',
    createSuccess: '创建成功',
    updateSuccess: '更新成功',
    updateFailed: '更新失败',
    saveSuccess: '保存成功',
    configSuccess: '设置成功',
    deleteSuccess: '删除成功',
    deleteFailed: '删除失败',
    sendSuccess: '发送成功',
    sending: '发送中',
    sendFailed: '发送失败',
    cancelSuccess: '已取消',
    nameSpecial: '不能包含^ & = ~ ‘ ’ ！· | / < > % ! + * .  \' `等特殊符号',
    accountExpire: '账号即将过期',
    accountExpireA: '当前账号有效期至：',
    accountExpireB: '为了不影响正常使用，请及时续费。逾期账户将无法登入平台。',
    accountExpireSub: '为了不影响正常使用，请及时联系企业管理员进行处理。逾期账号将无法登入平台。',
    // multi-select
    selectedA: '已选择',
    selectedB: '个',
    // select
    selectHolder: '请选择',
    selectKeywordHolder: '关键字搜索',
    keyWord: '关键字',
    // 确认操作
    delete: '删除确认',
    deleteSure: '删除后不可恢复',
    confirmCancel: '确认取消？',
    cancelSure: '取消后不可恢复',
    // 登录
    needLogin: '需要登录',
    reLogin: '您已登出，请重新登录',
    expired: '登录信息过期，请重新登录',
    needToLogin: '您需要登录才能继续获取相关数据',
    needAuth: '需要更多权限',
    noAuth: '没有足够的权限获取接口数据：',
    // 排序
    cerateTimeSortDrop: '按创建时间降序',
    cerateTimeSortUp: '按创建时间升序',
    updateTimeSortDrop: '按更新时间降序',
    updateTimeSortUp: '按更新时间升序',
    nameSortDrop: '按名称降序',
    nameSortUp: '按名称升序',

    // 多层分组
    // left-sidebar.vue
    allGroups: '全部分组',
    newGroup: '新建分组',
    editGroup: '编辑分组',
    delGroup: '删除分组',
    groupName: '分组名称',
    parentGroup: '选择上级',
    pleaseChoose: '请选择',
    confirmDelFir: '确定删除【',
    confirmDelSed: '】？删除后无法恢复',
    UnableDel: '分组存在子分组或者内容，无法删除',
    groupNameNotNull: '分组名称不能为空',
    notCurrentGroup: '请重新选择分组，不能选择当前分组',
    notLowlevelGroup: '请重新选择分组，高级分组不能向低级分组移动',
    UpToFour: '请重新选择分组，分组层级最多为 ',
    level: ' 级',
    notDefaultGroup: '默认分组下不可创建分组',
    filterName: '分组名不能包含^ & = ~ ‘ ’ ！· | / < > % ! + * .  \' `等特殊符号',
    // search.vue
    searchGroup: '搜索分组',
    // tree-menu.vue
    new: '新建',

    // 两步验证
    codeLogin: '短信验证码登录',
    accountNo: '账号',
    twoFactorMsg1: '开通了两步验证，',
    twoFactorMsg2: '请先设置手机号，使用手机收到的短信验证码登录Dmartech。',

    //时区下拉
    GMT01: '（GMT-11：00）埃尼威托克岛，夸贾林，萨摩亚中途岛',
    GMT02: '（GMT-10：00）夏威夷',
    GMT03: '（GMT-09：00）阿拉斯加州',
    GMT04: '（GMT-08：00）太平洋时间（美国和加拿大），蒂华纳',
    GMT05: '（GMT-07：00）亚利桑那州',
    GMT06: '（GMT-06：00）中美洲, 中美洲（美国和加拿大），墨西哥城，萨斯喀彻温省',
    GMT07: '（GMT-05：00）波哥大，利马，基多，东部时间（美国和加拿大），印第安纳州（东部）',
    GMT08: '（GMT-04：00）大西洋时间（加拿大），加拉加斯，拉巴斯，圣地亚哥',
    GMT09: '（GMT-03：00）纽芬兰，布宜诺斯艾利斯，乔治城，格陵兰岛',
    GMT10: '（GMT-02：00）大西洋中部',
    GMT11: '（GMT-01：00）亚速尔群岛，佛得角群岛',
    GMT12: '（GMT）格林尼治标准时间，都柏林，爱丁堡，里斯本，伦敦，蒙罗维亚，卡萨布兰卡',
    GMT13: '（GMT+01：00）阿姆斯特丹，柏林，伯尔尼，罗马，斯德哥尔摩，维也纳，贝尔格莱德，布拉迪斯拉发，布达佩斯，卢布尔雅那，布拉格，布鲁塞尔，哥本哈根，马德里，巴黎，萨拉热窝，斯科普里，索菲亚，维尔纽斯，华沙，萨格勒布，中非西部',
    GMT14: '（GMT+02：00）雅典，明斯克，布加勒斯特，开罗，比勒陀利亚哈拉雷，赫尔辛基，里加，塔林，耶路撒冷',
    GMT15: '（GMT+03：00）伊斯坦布尔，巴格达，科威特，利雅得，内罗毕',
    GMT16: '（GMT+03：30）德黑兰',
    GMT17: '（GMT+04：00）阿布扎比，马斯喀特，巴库，第比利斯，埃里温，莫斯科，圣彼得堡，伏尔加格勒',
    GMT18: '（GMT+04：30）喀布尔',
    GMT19: '（GMT+05：00）叶卡捷琳堡，伊斯兰堡，卡拉奇，塔什干',
    GMT20: '（GMT+05：30）加尔各答，钦奈，孟买，新德里',
    GMT21: '（GMT+05：45）加德满都',
    GMT22: '（GMT+06：00）阿拉木图，新西伯利亚，达卡阿斯塔纳，斯里贾亚瓦德纳普拉',
    GMT23: '（GMT+06：30）仰光',
    GMT24: '（GMT+07：00）曼谷，河内，雅加达，克拉斯诺亚尔斯克',
    GMT25: '（GMT+08：00）北京，重庆，香港，乌鲁木齐，台北，吉隆坡，新加坡，珀斯，伊尔库茨克，乌兰巴塔尔',
    GMT26: '（GMT+09：00）大阪，札幌，东京，首尔，雅库茨克',
    GMT27: '（GMT+09：30）阿德莱德，达尔文',
    GMT28: '（GMT+10：00）布里斯班，堪培拉，墨尔本，悉尼，关岛，莫尔兹比港，霍巴特，符拉迪沃斯托克',
    GMT29: '（GMT+11：00）马加丹，所罗门群岛，新喀里多尼亚',
    GMT30: '（GMT+12：00）惠灵顿奥克兰，斐济，堪察加，马歇尔群岛',
    GMT31: '（GMT+13：00）努库阿洛法',

    /**性别*/
    man:'男',
    woman:'女',
    /**语言*/
    Unlimited:'不限',
    zh_cn: '简体中文',
    zh_TW: '繁体中文TW',
    zh_HK: '繁体中文HK',
    English:'英文',
    Indonesian:'印尼语',
    Malay:'马来语',
    Spanish:'西班牙语',
    Korean:'韩语',
    Italian:'意大利语',
    Japanese:'日语',
    Polish:'波兰语',
    Portuguese:'葡萄牙语',
    Russian:'俄语',
    Thai:'泰语',
    Vietnamese:'越南语',
    Arabic:'阿拉伯语',
    Hindi:'北印度语',
    Hebrew:'希伯来语',
    Turkish:'土耳其语',
    German:'德语',
    French:'法语',
    /**地区*/
    UnlimitCountry: '不限',
    China: '中国',
    //四川
    Sichuan: '四川',
    Liangshan:'凉山',
    Ziyang: '资阳',
    Chengdu: '成都',
    Zigong: '自贡',
    Luzhou: '泸州',
    Panzhihua: '攀枝花',
    Mianyang: '绵阳',
    Deyang: '德阳',
    Suining:'遂宁',
    Guangyuan: '广元',
    Leshan:'乐山',
    Neijiang:'内江',
    Nancong:'南充',
    Yibin:'宜宾',
    Meishan:'眉山',
    Dazhou: '达州',
    GuangAn: '广安',
    Bazhong:'巴中',
    YaAn:'雅安',
    Garze:'甘孜',
    Aba:'阿坝',
    //重庆
    Chongqing: '重庆',
    Youyang:'酉阳',
    Pengshui:'彭水',
    Hechuan:'合川',
    Yongchuan:'永川',
    Jiangjin:'江津',
    Tongliang:'南川',

    //    Shaanxi
    Shaanxi:'陕西',
    Shangluo:'商洛',
    XiAn:'西安',
    Baoji:'宝鸡',
    emailTypeWaring: '仅支持后缀是huawei.com的邮箱号',
    //旅程限制条件
    restrictions:'限制条件',//限制条件
    openRestrictions:'开启',//开启限制条件
    closeRestrictions:'关闭',//关闭限制条件
    checkboxRestrictions:'允许发送"I_agree_that_Huawei_contact_me "为空值的联系人',
    restrictionsCloseTitle:'关闭：任何联系人都可进入旅程<br/>开启：仅允许"I_agree_that_Huawei_contact_me 等于 Y"的联系人进入旅程<br/>选中允许发送"I_agree_that_Huawei_contact_me "为空值的联系人：允许"I_agree_that_Huawei_contact_me 为空值"的联系人进入旅程<br/>不选中允许发送"I_agree_that_Huawei_contact_me "为空值的联系人：不允许"I_agree_that_Huawei_contact_me 为空值"的联系人进入旅程',//限制条件的提示文字
    restrictionsRecord:'记录',
    shortOnUnchecked:'限制条件:允许值为Y进入',//限制条件:允许值为Y进入
    shortOnchecked:'限制条件:允许值为Y或空值进入',//限制条件:允许值为Y或空值进入
    shortOffchecked:'限制条件:任何联系人都可进入旅程',//限制条件:任何联系人都可进入旅程
    checkboxRestrictionsReadonly:'仅允许"I_agree_that_Huawei_contact_me等于Y"的联系人进入旅程',
    onAndUnChecked:'仅允许“I_agree_that_Huawei_contact_me 等于 Y”的联系人进入旅程',
    onAndChecked:'允许“I_agree_that_Huawei_contact_me 等于 Y或者为空值”的联系人进入旅程',
    offRestrictions:'任何联系人都可进入旅程',
    restrictionsOnOffTip:'限制条件：限制仅"I_agree_that_Huawei_contact_me 等于 Y"的用户进入单次和周期旅程<br/>选中：旅程内可修改限制条件<br/>未选中：旅程内不可修改限制条件',
    restrictionsCheckedTip:'是否允许"I_agree_that_Huawei_contact_me 为空值"的用户能进入旅程<br/>选中：可修改状态<br/>不选中：无法修改状态',
    operation:'操作',
    operatorTime:'操作时间',
    operatorName:'操作人',
    copySuccess: '复制完毕',
    copyError: '该浏览器不支持自动复制',
    nothingToCopy:'没有可复制的内容',
    // 企业微信相关
    groupChatNameNotSet: '未命名的群聊',
    //批量操作
    batchOperation: '批量操作',
    //目标分组
    targetGroup: '目标分组',
    moveGroup: '移至分组',
    successOperate: '操作成功',
    selected: '已选择展示列',
    unselected: '未选择展示列',

    //校验提示
    mostSelectA: '最多同时多选',
    mostSelectB: '个选项',
    dataRequired: '此项为必填',
    globallySearch: '全局搜索',
    groupingQuery: '分组查询',

    // 公共
    all: '全部'
};


/**
 * 标点符号
 */
const punctuationTranslation = {
    __name__: 'punctuation',
    colon: '：',
    comma: '，',
    semicolon: '；',
    period: '。',
    leftParenthesis: '（',
    rightParenthesis: '）',
    openParenthesis: '【',
    closeParenthesis: '】',
    openQuote: '“',
    closeQuote: '”',
};

/**
 * 分页
 */
const paginationTranslation = {
    __name__: 'pagination',
    page: '页',
    pages: '页',
    visibleMaximum: '最多展示',
    scrollForMore: '滚动加载更多',
    totalCount: '共',
    totalUnit: '条记录'
};

/*
* 华为2.4.6期 下载详情
* */
const downloadDetailsTranslation = {
    __name__: 'downloadDetails',
    title: '下载详情',
    download: '下载数据',
    dataType: '数据类型',
    weChatMsg: '微信消息导出通知',
    fansLog: '粉丝日志导出通知',
    dataCenter: '数据源导出通知',
    formReport: '表单统计报告导出通知'
};

export {
    commonTranslation,
    punctuationTranslation,
    paginationTranslation,
    downloadDetailsTranslation
};
