const commonTranslation = {
    __name__: 'common',
    loading: 'loading',
    today: 'today',
    tomorrow: 'tomorrow',
    dayAfterTomorrow: 'the day after tomorrow',
    day: 'day',
    week: 'week',
    month: 'month',
    noOfTimes: 'Frequency_times',
    noOfDays: 'After',
    absoluteDate: 'On',
    monday: 'Monday',
    tuesday: 'Tuesday',
    wednesday: 'Wednesday',
    thursday: 'Thursday',
    friday: 'Friday',
    saturday: 'Saturday',
    sunday: 'Sunday',
    edit: 'edit',
    detail: 'detail',
    del: 'delete',
    create: 'create',
    search: 'search',
    preview: 'preview',
    copy: 'Copy',
    select: 'select',
    zoom: 'zoom',
    close: 'close',
    total: 'total',
    clear: 'clear',
    notice: 'notice',
    remind: 'Remind',
    upload: 'upload',
    download: 'download',
    high: 'high',
    file: 'file',
    import: 'import',
    // 列表空状态
    noResult: 'No matching result',
    checkAll: 'view all',
    noData: 'no data',
    or: 'or',
    and: 'and',
    to: 'to',
    yes: 'Yes',
    no: 'No',
    noAny: 'Currently, there aren\'t any',
    unknown: '[Unknown]',
    // 选中状态
    allSelected: 'All selected',
    cancelAll: 'Cancel all selected',
    invert: 'Invert',
    // confirm
    cancel: 'Cancel',
    confirm: 'Confirm',
    previous: 'Previous',
    next: 'Next',
    complete: 'Complete',
    back: 'Back',
    defaultConfirmTitle: 'Operation confirm',
    save: 'Save',
    send: 'Send',
    sendValidateCode: 'Send verification code',
    ok: 'OK',
    submit: 'Submit',
    // toast
    saving: 'saving',
    createSuccess: 'Created successfully',
    updateSuccess: 'Update completed',
    updateFailed: 'Update failed',
    saveSuccess: 'Saved',
    configSuccess: 'Settings saved',
    deleteSuccess: 'Delete successfully',
    deleteFailed: 'Delete failed',
    sendSuccess: 'Send Successfully',
    sending: 'sending',
    sendFailed: 'Send failed',
    cancelSuccess: 'Cancelled',
    nameSpecial: 'cannot contain special symbols such as ^ & = ~ ‘ ’ ！· | / < > % ! + * .  \' `',
    accountExpire: 'Your account will expire soon',
    accountExpireA: 'This Dmartech account will expire on ：',
    accountExpireB: 'Please renew your account in time. Overdue accounts will not be able to log in to Dmartech.',
    accountExpireSub: 'After the expiration date, you will not be able to continue to use, please contact the enterprise administrator to deal with it.',
    // multi-select
    selectedA: 'Selected',
    selectedB: ' ',
    // select
    selectHolder: 'please select',
    selectKeywordHolder: 'Search',
    keyWord: 'Keyword',
    // 确认操作
    delete: 'Delete confirm',
    deleteSure: 'Cannot be retrieved after deletion.',
    confirmCancel: 'Confirm to cancel',
    cancelSure: 'Cannot be retrieved after cancellation.',
    // 登录
    needLogin: 'Need to login',
    reLogin: 'You have logged out, please login again',
    expired: 'Login information expired, please login again',
    needToLogin: 'Please login to get related data',
    needAuth: 'Need more authorization',
    noAuth: 'There is no enough authorization to get data:',
    // 排序
    cerateTimeSortDrop: 'Descending by creation time',
    cerateTimeSortUp: 'Ascending by creation time',
    updateTimeSortDrop: 'Descending order by update time',
    updateTimeSortUp: 'In ascending order of update time',
    nameSortDrop: 'Descending order by name',
    nameSortUp: 'In ascending order by name',

    // 多层分组
    // left-sidebar
    allGroups: 'All grouping',
    newGroup: 'New group',
    editGroup: 'Edit group',
    delGroup: 'Delete group',
    groupName: 'Group Name',
    parentGroup: 'Choose superior',
    pleaseChoose: 'Please choose',
    confirmDelFir: 'confirm delete [ ',
    confirmDelSed: '] ? Unable to recover after deletion',
    UnableDel: 'Subgroups or content exist in a group and cannot be deleted',
    groupNameNotNull: 'Group name cannot be empty',
    notCurrentGroup: 'Please reselect the  group. The current group cannot be selected',
    notLowlevelGroup: 'Please re-select the  group. The higher group cannot move to the lower group',
    UpToFour: 'Please re-select the grouping, the grouping level is up to ',
    level: ' level',
    notDefaultGroup: 'Groups cannot be created by default',
    filterName: 'The group name cannot contain special symbols such as ^ & = ~ ‘ ’ ！· | / < > % ! + * .  \' `',
    // search
    searchGroup: 'Search group',
    // tree-menu
    new: 'New',

    // 两步验证
    codeLogin: 'SMS verification code login',
    accountNo: 'account',
    twoFactorMsg1: 'Has been activated for two-factor verification. ',
    twoFactorMsg2: 'Please set up a mobile phone number first and log in to Dmartech ' +
        'using the SMS verification code received by the mobile phone.',

    //时区下拉
    GMT01: '(GMT-11:00) Eniwetok, Kwajalein, Midway Island, Samoa',
    GMT02: '(GMT-10:00) Hawaii',
    GMT03: '(GMT-09:00) Alaska',
    GMT04: '(GMT-08:00) Pacific Time (US & Canada); Tijuana',
    GMT05: '(GMT-07:00) Arizona',
    GMT06: '(GMT-06:00) Central America, Central America (US & Canada), Mexico City,Saskatchewan',
    GMT07: '(GMT-05:00) Bogota, Lima, Quito, Eastern Time (US & Canada), Indiana (East)',
    GMT08: '(GMT-04:00) Atlantic Time (Canada), Caracas, La Paz, Santiago',
    GMT09: '(GMT-03:00) Newfoundland, Buenos Aires, Georgetown, Greenland',
    GMT10: '(GMT-02:00) Mid-Atlantic',
    GMT11: '(GMT-01:00) Azores, Cape Verde Is.',
    GMT12: '(GMT) Greenwich Mean Time: Dublin, Edinburgh, Lisbon, London, Casablanca, Monrovia, ',
    GMT13: '(GMT+01:00) Amsterdam, Berlin, Bern, Rome, Stockholm, Vienna, Belgrade, Bratislava, Budapest, Ljubljana, Prague, Brussels, Copenhagen, Madrid, Paris, Sarajevo, Skopje, Sofija, Vilnius, Warsaw, Zagreb, West Central Africa',
    GMT14: '(GMT+02:00) Athens, Minsk, Bucharest, Cairo, Harare, Pretoria, Helsinki, Riga, Tallinn, Jerusalem',
    GMT15: '(GMT+03:00) Istanbul, Baghdad, Kuwait, Riyadh, Nairobi',
    GMT16: '(GMT+03:30) Tehran',
    GMT17: '(GMT+04:00) Abu Dhabi, Muscat, Baku, Tbilisi, Yerevan, Moscow, St. Petersburg, Volgograd ',
    GMT18: '(GMT+04:30) Kabul',
    GMT19: '(GMT+05:00) Ekaterinburg, Islamabad, Karachi, Tashkent',
    GMT20: '(GMT+05:30) Calcutta, Chennai, Mumbai, New Delhi',
    GMT21: '(GMT+05:45) Kathmandu',
    GMT22: '(GMT+06:00) Almaty, Novosibirsk, Astana, Dhaka, Sri Jayawardenepura',
    GMT23: '(GMT+06:30) Rangoon',
    GMT24: '(GMT+07:00) Bangkok, Hanoi, Jakarta, Krasnoyarsk',
    GMT25: '(GMT+08:00) Beijing, Chongqing, Hongkong, Urumqi, Taipei,Kuala Lumpur, Singapore, Perth, Irkutsk, Ulaan Bataar',
    GMT26: '(GMT+09:00) Osaka, Sapporo, Tokyo, Seoul, Yakutsk',
    GMT27: '(GMT+09:30) Adelaide, Darwin',
    GMT28: '(GMT+10:00) Brisbane, Canberra, Melbourne, Sydney, Guam, Port Moresby, Hobart, Vladivostok',
    GMT29: '(GMT+11:00) Magadan, Solomon Is., New Caledonia',
    GMT30: '(GMT+12:00) Auckland, Wellington, Fiji, Kamchatka, Marshall Is.',
    GMT31: '(GMT+13:00) Nuku\'alofa',

    /**语言*/
    Unlimited:'Unlimited',
    zh_cn: 'Chinese',
    zh_TW: 'Traditional Chinese TW',
    zh_HK: 'Traditional Chinese HK',
    English:'English',
    Indonesian:'Indonesian',
    Malay:'Malay',
    Spanish:'Spanish',
    Korean:'Korean',
    Italian:'Italian',
    Japanese:'Japanese',
    Polish:'Polish',
    Portuguese:'Portuguese',
    Russian:'Russian',
    Thai:'Thai',
    Vietnamese:'Vietnamese',
    Arabic:'Arabic',
    Hindi:'Hindi',
    Hebrew:'Hebrew',
    Turkish:'Turkish',
    German:'German',
    French:'French',

    /**性别*/
    man:'Male',
    woman:'Female',
    /**地区*/
    UnlimitCountry: 'No Limit',
    China: 'China',
    //四川
    Sichuan: 'Sichuan',
    Liangshan:'Liangshan Yi Autonomous Prefecture',
    Ziyang: 'Ziyang',
    Chengdu: 'Chengdu',
    Zigong: 'Zigong',
    Luzhou: 'Luzhou',
    Panzhihua: 'Panzhihua',
    Mianyang: 'Mianyang',
    Deyang: 'Deyang',
    Suining:'Suining',
    Guangyuan: 'Guangyuan',
    Leshan:'Leshan',
    Neijiang:'Neijiang',
    Nancong:'Nancong',
    Yibin:'Yibin',
    Meishan:'Meishan',
    Dazhou: 'Dazhou',
    GuangAn: 'Guang\'an',
    Bazhong:'Bazhong',
    YaAn:'Ya\'an',
    Garze:'Garze Tibetan Autonomous Prefecture',
    Aba:'Aba Tibetan-Qiang Autonomous Prefecture',
    //重庆
    Chongqing: 'Chongqing',
    Youyang:'Youyang Tujia-Miao Autonomous Country',
    Pengshui:'Pengshui',
    Hechuan:'Hechuan',
    Yongchuan:'Yongchuan',
    Jiangjin:'Jiangjin',
    Tongliang:'Tongliang',

    //    Shaanxi
    Shaanxi:'Shaanxi',
    Shangluo:'Shangluo',
    XiAn:'Xi\'an',
    Baoji:'Baoji',
    emailTypeWaring: 'The suffix must be huawei.com',
    restrictions:'Restrictions',//限制条件
    openRestrictions:'On',//开启限制条件
    closeRestrictions:'Off',//关闭限制条件
    checkboxRestrictions:'Allow sending of contacts whose "I_agree_that_Huawei_contact_me" is null',
    restrictionsCloseTitle:'Turn Off：any contact can enter the journey<br/>Turn On: Only allow contacts with "I_agree_that_Huawei_contact_me equal to Y" to enter the journey<br/>Selected：Allow contacts with "I_agree_that_Huawei_contact_me is null" to enter the journey<br/>Unselected: Contacts with "I_agree_that_Huawei_contact_me is null" are not allowed to enter the journey',//限制条件的提示文字
    restrictionsRecord:'Record',
    shortOnUnchecked:'Restrictions:Allow contacts whose field value is Y to enter the journey',//限制条件:允许值为Y进入
    shortOnchecked:'Restrictions:Allow contacts whose field value is Y or empty to enter the journey',//限制条件:允许值为Y或空值进入
    shortOffchecked:'Restrictions:Any contact can enter the journey',//限制条件:任何联系人都可进入旅程
    checkboxRestrictionsReadonly:'Turn On: Only allow contacts with "I_agree_that_Huawei_contact_me equal to Y" to enter the journey',//'仅允许"I_agree_that_Huawei_contact_me等于Y"的联系人进入旅程'
    onAndUnChecked:'Only allow contacts with "I_agree_that_Huawei_contact_me equal to Y" to enter the journey',
    onAndChecked:'Allow contacts with "I_agree_that_Huawei_contact_me equal to Y or null" to enter the journey',
    offRestrictions:'Any contact can enter the journey',
    restrictionsOnOffTip:'Restrictions:Restrict users with only "I_agree_that_Huawei_contact_me equal to Y" to enter simple  and periodic journeys<br/>Selected: restriction can be modified<br/>Unselected: restriction cannot be modified',
    restrictionsCheckedTip:'Whether to allow users with "I_agree_that_Huawei_contact_me is null" to enter the journey<br/>Selected： status can be modified<br/>Unselected: status cannot be modified',
    operation:'Operation',
    operatorTime:'Operation time',
    operatorName:'Operator',
    copySuccess: 'Copy successfully',
    copyError: 'Automatic replication is not supported in this browser',
    nothingToCopy: 'There is nothing to copy',
    // 企业微信相关
    groupChatNameNotSet: 'Group chat name not set',
    //批量操作
    batchOperation: 'batch operation',
    //目标分组
    targetGroup: 'Target group',
    moveGroup: 'Move to group',
    successOperate: 'Successful operation',
    selected: 'Selected impression column',
    unselected: 'Unselected impression column',

    //校验提示
    mostSelectA: 'Select up to ',
    mostSelectB: ' more options',
    dataRequired: 'this field is required',
    globallySearch: 'globally search',
    groupingQuery: 'grouping query',

    // 公共
    all: 'all'
};


/**
 * 标点符号
 */
const punctuationTranslation = {
    __name__: 'punctuation',
    colon: ':',
    comma: ',',
    semicolon: ';',
    period: '.',
    leftParenthesis: '(',
    rightParenthesis: ')',
    openParenthesis: '[',
    closeParenthesis: ']',
    openQuote: '"',
    closeQuote: '"',
};

/**
 * 分页
 */
const paginationTranslation = {
    __name__: 'pagination',
    page: 'page',
    pages: 'pages',
    visibleMaximum: 'display up to',
    scrollForMore: 'scroll to load more',
    totalCount: 'total',
    totalUnit: 'records'
};

/*
* 华为2.4.6期 下载详情
* */
const downloadDetailsTranslation = {
    __name__: 'downloadDetails',
    title: 'Download details',
    download: 'Download data',
    dataType: 'Data type',
    weChatMsg: 'WeChat message export notification',
    fansLog: 'Follower log export notification',
    dataCenter: 'Data source export notification',
    formReport: 'Form report export notification'
};

export {
    commonTranslation,
    punctuationTranslation,
    paginationTranslation,
    downloadDetailsTranslation
};
