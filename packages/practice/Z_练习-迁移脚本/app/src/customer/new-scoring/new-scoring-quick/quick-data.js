
let individualAttr = [
    {
        scoringModelId: '',
        name: '',
        type: 0,
        attributeOrEventId: '',
        scoreRules: {
            type: 'contact',
            rules: [
                {
                    conditions: [
                        {
                            value: '1',
                            operation: 'exists',
                            field_name: 'mobile',
                            relative_type: 0,
                            limitSize: 1
                        }
                    ],
                    relation: 'and',
                    openStatus: true,
                    score: '15',
                    expectedNumber: 0,
                    id: Date.now().toString(36),
                    maxScore: '15'
                }
            ]
        }
    },
    {
        scoringModelId: '',
        name: '',
        type: 0,
        attributeOrEventId: '',
        scoreRules: {
            type: 'contact',
            rules: [
                {
                    conditions: [
                        {
                            value: '1',
                            operation: 'exists',
                            field_name: 'email',
                            relative_type: 0,
                            limitSize: 1
                        }
                    ],
                    relation: 'and',
                    openStatus: true,
                    score: '15',
                    expectedNumber: 0,
                    id: Date.now().toString(36),
                    maxScore: '15'
                }
            ]
        }
    },
    {
        scoringModelId: '',
        name: '',
        type: 0,
        attributeOrEventId: '',
        scoreRules: {
            type: 'contact',
            rules: [
                {
                    conditions: [
                        {
                            value: '1',
                            operation: 'exists',
                            field_name: 'sex_dmt',
                            relative_type: 0,
                            limitSize: 1
                        }
                    ],
                    relation: 'and',
                    openStatus: true,
                    score: '10',
                    expectedNumber: 0,
                    id: Date.now().toString(36),
                    maxScore: '10'
                }
            ]
        }
    },
    {
        scoringModelId: '',
        name: '',
        type: 0,
        attributeOrEventId: '',
        scoreRules: {
            type: 'contact',
            rules: [
                {
                    conditions: [
                        {
                            value: '1',
                            operation: 'exists',
                            field_name: 'address',
                            relative_type: 0,
                            limitSize: 1
                        }
                    ],
                    relation: 'and',
                    openStatus: true,
                    score: '10',
                    expectedNumber: 0,
                    id: Date.now().toString(36),
                    maxScore: '10'
                }
            ]
        }
    },
    {
        scoringModelId: '',
        name: '',
        type: 0,
        attributeOrEventId: '',
        scoreRules: {
            type: 'contact',
            rules: [
                {
                    conditions: [
                        {
                            value: '1',
                            operation: 'exists',
                            field_name: 'job_title_dmt',
                            relative_type: 0,
                            limitSize: 1
                        }
                    ],
                    relation: 'and',
                    openStatus: true,
                    score: '10',
                    expectedNumber: 0,
                    id: Date.now().toString(36),
                    maxScore: '10'
                }
            ]
        }
    },
    {
        scoringModelId: '',
        name: '',
        type: 0,
        attributeOrEventId: '',
        scoreRules: {
            type: 'contact',
            rules: [
                {
                    conditions: [
                        {
                            value: '1',
                            operation: 'exists',
                            field_name: 'annual_revenue',
                            relative_type: 0,
                            limitSize: 1
                        }
                    ],
                    relation: 'and',
                    openStatus: true,
                    score: '10',
                    expectedNumber: 0,
                    id: Date.now().toString(36),
                    maxScore: '10'
                }
            ]
        }
    },
    {
        scoringModelId: '',
        name: '',
        type: 0,
        attributeOrEventId: '',
        scoreRules: {
            type: 'contact',
            rules: [
                {
                    conditions: [
                        {
                            value: '1',
                            operation: 'exists',
                            field_name: 'company_name_dmt',
                            relative_type: 0,
                            limitSize: 1
                        }
                    ],
                    relation: 'and',
                    openStatus: true,
                    score: '10',
                    expectedNumber: 0,
                    id: Date.now().toString(36),
                    maxScore: '10'
                }
            ]
        }
    },
    {
        scoringModelId: '',
        name: '',
        type: 0,
        attributeOrEventId: '',
        scoreRules: {
            type: 'contact',
            rules: [
                {
                    conditions: [
                        {
                            value: '高级会员',
                            operation: 'eq',
                            field_name: 'member_grade',
                            relative_type: 0,
                            limitSize: 1
                        }
                    ],
                    relation: 'and',
                    openStatus: true,
                    score: '20',
                    expectedNumber: 0,
                    id: Date.now().toString(36) + 'a',
                    maxScore: '20'
                },
                {
                    conditions: [
                        {
                            value: '普通会员',
                            operation: 'eq',
                            field_name: 'member_grade',
                            relative_type: 0,
                            limitSize: 1
                        }
                    ],
                    relation: 'and',
                    openStatus: true,
                    score: '10',
                    expectedNumber: 0,
                    id: Date.now().toString(36) + 'b',
                    maxScore: '10'
                }
            ]
        }
    },
];
let companyAttr = [
    {
        scoringModelId: '',
        name: '',
        type: 0,
        attributeOrEventId: '',
        scoreRules: {
            type: 'contact',
            rules: [
                {
                    conditions: [
                        {
                            value: '总裁',
                            operation: 'eq',
                            field_name: 'job_title_dmt',
                            relative_type: 0,
                            limitSize: 1
                        }
                    ],
                    relation: 'and',
                    openStatus: true,
                    score: '25',
                    expectedNumber: 0,
                    id: Date.now().toString(36) + 'a',
                    maxScore: '25'
                },
                {
                    conditions: [
                        {
                            value: '总监',
                            operation: 'eq',
                            field_name: 'job_title_dmt',
                            relative_type: 0,
                            limitSize: 1
                        }
                    ],
                    relation: 'and',
                    openStatus: true,
                    score: '15',
                    expectedNumber: 0,
                    id: Date.now().toString(36) + 'b',
                    maxScore: '15'
                },
                {
                    conditions: [
                        {
                            value: '经理',
                            operation: 'eq',
                            field_name: 'job_title_dmt',
                            relative_type: 0,
                            limitSize: 1
                        }
                    ],
                    relation: 'and',
                    openStatus: true,
                    score: '5',
                    expectedNumber: 0,
                    id: Date.now().toString(36) + 'c',
                    maxScore: '5'
                }
            ]
        }
    },
    {
        scoringModelId: '',
        name: '',
        type: 0,
        attributeOrEventId: '',
        scoreRules: {
            type: 'contact',
            rules: [
                {
                    conditions: [
                        {
                            value: 'B2B',
                            operation: 'eq',
                            field_name: 'company_type_dmt',
                            relative_type: 0,
                            limitSize: 1
                        }
                    ],
                    relation: 'and',
                    openStatus: true,
                    score: '25',
                    expectedNumber: 0,
                    id: Date.now().toString(36) + 'a',
                    maxScore: '25'
                },
                {
                    conditions: [
                        {
                            value: 'B2C',
                            operation: 'eq',
                            field_name: 'company_type_dmt',
                            relative_type: 0,
                            limitSize: 1
                        }
                    ],
                    relation: 'and',
                    openStatus: true,
                    score: '15',
                    expectedNumber: 0,
                    id: Date.now().toString(36) + 'b',
                    maxScore: '15'
                },
                {
                    conditions: [
                        {
                            value: '非盈利',
                            operation: 'eq',
                            field_name: 'company_type_dmt',
                            relative_type: 0,
                            limitSize: 1
                        }
                    ],
                    relation: 'and',
                    openStatus: true,
                    score: '5',
                    expectedNumber: 0,
                    id: Date.now().toString(36) + 'c',
                    maxScore: '5'
                }
            ]
        }
    },
    {
        scoringModelId: '',
        name: '',
        type: 0,
        attributeOrEventId: '',
        scoreRules: {
            type: 'contact',
            rules: [
                {
                    conditions: [
                        {
                            value: '500',
                            operation: 'gt',
                            field_name: 'number_of_Employees_dmt',
                            relative_type: 0,
                            limitSize: 1
                        }
                    ],
                    relation: 'and',
                    openStatus: true,
                    score: '25',
                    expectedNumber: 0,
                    id: Date.now().toString(36) + 'a',
                    maxScore: '25'
                },
                {
                    conditions: [
                        {
                            value: {
                                start: '100',
                                end: '500'
                            },
                            operation: 'range',
                            field_name: 'number_of_Employees_dmt',
                            relative_type: 0,
                            limitSize: 2
                        }
                    ],
                    relation: 'and',
                    openStatus: true,
                    score: '15',
                    expectedNumber: 0,
                    id: Date.now().toString(36) + 'b',
                    maxScore: '15'
                },
                {
                    conditions: [
                        {
                            value: '100',
                            operation: 'lt',
                            field_name: 'number_of_Employees_dmt',
                            relative_type: 0,
                            limitSize: 1
                        }
                    ],
                    relation: 'and',
                    openStatus: true,
                    score: '5',
                    expectedNumber: 0,
                    id: Date.now().toString(36) + 'c',
                    maxScore: '5'
                }
            ]
        }
    },
    {
        scoringModelId: '',
        name: '',
        type: 0,
        attributeOrEventId: '',
        scoreRules: {
            type: 'contact',
            rules: [
                {
                    conditions: [
                        {
                            value: '10000',
                            operation: 'gt',
                            field_name: 'budget_amount',
                            relative_type: 0,
                            limitSize: 1
                        }
                    ],
                    relation: 'and',
                    openStatus: true,
                    score: '25',
                    expectedNumber: 0,
                    id: Date.now().toString(36) + 'a',
                    maxScore: '25'
                },
                {
                    conditions: [
                        {
                            value: {
                                start: '5000',
                                end: '10000'
                            },
                            operation: 'range',
                            field_name: 'budget_amount',
                            relative_type: 0,
                            limitSize: 2
                        }
                    ],
                    relation: 'and',
                    openStatus: true,
                    score: '15',
                    expectedNumber: 0,
                    id: Date.now().toString(36) + 'b',
                    maxScore: '15'
                },
                {
                    conditions: [
                        {
                            value: '5000',
                            operation: 'lt',
                            field_name: 'budget_amount',
                            relative_type: 0,
                            limitSize: 1
                        }
                    ],
                    relation: 'and',
                    openStatus: true,
                    score: '5',
                    expectedNumber: 0,
                    id: Date.now().toString(36) + 'c',
                    maxScore: '5'
                }
            ]
        }
    }
];
let individualEvent = [
    {
        type: 'event',
        rules:[
            {
                relation: 'and', // or:或 and:且；事件因子固定为and
                score: 5, // 得分，负分则为-1
                openStatus: true, // true:得分  false：扣分。方便用于回显
                maxScore: 10, // 得分上限
                expectedNumber: 0, // 预估人数，计算后用于回显
                eventGroup: '', //事件分组
                eventGroupId: '', // 事件分组id
                event: 'wx_subscribe', // 事件名称
                eventId: '', // 事件id
                isAppoint: 0,// false, // 是否为任意邮件 0任意 1 指定
                isCardinality: false, // 是否只计一次得分
                dynamicTime: 'day', // 时间单位，当前固定为day
                timeType: 'dynamic',//'dynamic', // 1 default：绝对时间  0 dynamic:相对时间
                fromDate: 90,  // 绝对时间的起始日期
                toDate: 0, // 绝对时间的结束日期
                conditions: [
                    {
                        // 'task_instantiation_id' // 任务实例id 'app_id' // 公众号 'event_key'// 微信扫码 ‘form_id //表单 ’label_id‘ // 标签 ’wecom_channel_code_id‘ // 企业微信活码
                        field_name: 'app_id',  // 不同事件对应不同字段
                        fieldType: 1,
                        operation: 'eq', // 当前固定为等于
                        value: '', // 任务实例id/公众号app_id/微信二维码id/表单id/标签id/企业微信活码
                        id: ''
                    }
                ],
            }
        ]
    },
    {
        type: 'event',
        rules:[
            {
                relation: 'and',
                score: -5,
                openStatus: false,
                maxScore: -10,
                expectedNumber: 0,
                eventGroup: '',
                eventGroupId: '',
                event: 'wx_unsubscribe',
                eventId: '',
                isAppoint: 0,
                isCardinality: false,
                dynamicTime: 'day',
                timeType: 'dynamic',
                fromDate: 90,
                toDate: 0,
                conditions:[
                    {
                        field_name: 'app_id',
                        fieldType: 1,
                        operation: 'eq',
                        value: '',
                        id: '',
                        isWarn: false,
                    }
                ]
            }
        ]
    },
    {
        type: 'event',
        rules:[
            {
                relation: 'and',
                score: 5,
                openStatus: true,
                maxScore: 15,
                expectedNumber: 0,
                eventGroup: '',
                eventGroupId: '',
                event: 'wx_scan',
                eventId: '',
                isAppoint: 0,
                isCardinality: false,
                dynamicTime: 'day',
                timeType: 'dynamic',
                fromDate: 90,
                toDate: 0,
                conditions:[
                    {
                        field_name: '',
                        fieldType: 1,
                        operation: 'eq',
                        value: '',
                        isWarn: false,
                    }
                ]
            }
        ]
    },
    {
        type: 'event',
        rules:[
            {
                relation: 'and',
                score: 10,
                openStatus: true,
                maxScore: 50,
                expectedNumber: 0,
                eventGroup: '',
                eventGroupId: '',
                event: 'place_an_order',
                eventId: '',
                isAppoint: 0,
                isCardinality: false,
                dynamicTime: 'day',
                timeType: 'dynamic',
                fromDate: 90,
                toDate: 0,
                conditions:[
                    {
                        field_name: '',
                        fieldType: 1,
                        operation: 'eq',
                        value: '',
                        isWarn: false,
                    }
                ]
            }
        ]
    },
    {
        type: 'event',
        rules:[
            {
                relation: 'and',
                score: 2,
                openStatus: true,
                maxScore: 10,
                expectedNumber: 0,
                eventGroup: '',
                eventGroupId: '',
                event: 'visit_website_dmt',
                eventId: '',
                isAppoint: 0,
                isCardinality: false,
                dynamicTime: 'day',
                timeType: 'dynamic',
                fromDate: 30,
                toDate: 0,
                conditions:[
                    {
                        field_name: '',
                        fieldType: 1,
                        operation: 'eq',
                        value: '',
                        isWarn: false,
                    }
                ]
            }
        ]
    },
    {
        type: 'event',
        rules:[
            {
                relation: 'and',
                score: 5,
                openStatus: true,
                maxScore: 15,
                expectedNumber: 0,
                eventGroup: '',
                eventGroupId: '',
                event: 'make_an_appointment',
                eventId: '',
                isAppoint: 0,
                isCardinality: false,
                dynamicTime: 'day',
                timeType: 'dynamic',
                fromDate: 30,
                toDate: 0,
                conditions:[
                    {
                        field_name: '',
                        fieldType: 1,
                        operation: 'eq',
                        value: '',
                        isWarn: false,
                    }
                ]
            }
        ]
    }
];
let companyEvent = [
    {
        type: 'event',
        rules:[
            {
                relation: 'and', // or:或 and:且；事件因子固定为and
                score: 1, // 得分，负分则为-1
                openStatus: true, // true:得分  false：扣分。方便用于回显
                maxScore: 5, // 得分上限
                expectedNumber: 0, // 预估人数，计算后用于回显
                eventGroup: '', //事件分组
                eventGroupId: '', // 事件分组id
                event: 'dmd_open', // 事件名称
                eventId: '', // 事件id
                isAppoint: 0,// false, // 是否为任意邮件 0任意 1 指定
                isCardinality: false, // 是否只计一次得分
                dynamicTime: 'day', // 时间单位，当前固定为day
                timeType: 'dynamic',//'dynamic', // 1 default：绝对时间  0 dynamic:相对时间
                fromDate: 30,  // 绝对时间的起始日期
                toDate: 0, // 绝对时间的结束日期
                conditions: [
                    {
                        // 'task_instantiation_id' // 任务实例id 'app_id' // 公众号 'event_key'// 微信扫码 ‘form_id //表单 ’label_id‘ // 标签 ’wecom_channel_code_id‘ // 企业微信活码
                        field_name: 'task_instantiation_id',  // 不同事件对应不同字段
                        fieldType: 2,
                        operation: 'eq', // 当前固定为等于
                        value: '', // 任务实例id/公众号app_id/微信二维码id/表单id/标签id/企业微信活码
                        task_instantiation_id: '',
                        journey_instantiation_id: '',
                        journey_group_id: ''
                    }
                ],
            }
        ]
    },
    {
        type: 'event',
        rules:[
            {
                relation: 'and',
                score: 5,
                openStatus: true,
                maxScore: 15,
                expectedNumber: 0,
                eventGroup: '',
                eventGroupId: '',
                event: 'dmd_click',
                eventId: '',
                isAppoint: 0,
                isCardinality: false,
                dynamicTime: 'day',
                timeType: 'dynamic',
                fromDate: 30,
                toDate: 0,
                conditions:[
                    {
                        field_name: 'task_instantiation_id',
                        fieldType: 2,
                        operation: 'eq',
                        value: '',
                        task_instantiation_id: '',
                        journey_instantiation_id: '',
                        journey_group_id: ''
                    }
                ]
            }
        ]
    },
    {
        type: 'event',
        rules:[
            {
                relation: 'and',
                score: -10,
                openStatus: false,
                maxScore: -10,
                expectedNumber: 0,
                eventGroup: '',
                eventGroupId: '',
                event: 'dmd_unsubscribe',
                eventId: '',
                isAppoint: 0,
                isCardinality: false,
                dynamicTime: 'day',
                timeType: 'dynamic',
                fromDate: 90,
                toDate: 0,
                conditions:[
                    {
                        field_name: '',
                        fieldType: 1,
                        operation: 'eq',
                        value: ''
                    }
                ]
            }
        ]
    },
    {
        type: 'event',
        rules:[
            {
                relation: 'and',
                score: 5,
                openStatus: true,
                maxScore: 25,
                expectedNumber: 0,
                eventGroup: '',
                eventGroupId: '',
                event: 'form_submit',
                eventId: '',
                isAppoint: 0,
                isCardinality: false,
                dynamicTime: 'day',
                timeType: 'dynamic',
                fromDate: 30,
                toDate: 0,
                conditions:[
                    {
                        field_name: 'form_id',
                        fieldType: 2,
                        operation: 'eq',
                        value: '',
                        task_instantiation_id: '',
                        journey_instantiation_id: '',
                        journey_group_id: ''
                    }
                ]
            }
        ]
    },
    {
        type: 'event',
        rules:[
            {
                relation: 'and',
                score: 5,
                openStatus: true,
                maxScore: 10,
                expectedNumber: 0,
                eventGroup: '',
                eventGroupId: '',
                event: 'wecom_employee_add_contact',
                eventId: '',
                isAppoint: 0,
                isCardinality: false,
                dynamicTime: 'day',
                timeType: 'dynamic',
                fromDate: 90,
                toDate: 0,
                conditions:[
                    {
                        field_name: '',
                        fieldType: 1,
                        operation: 'eq',
                        value: ''
                    }
                ]
            }
        ]
    },
    {
        type: 'event',
        rules:[
            {
                relation: 'and',
                score: 5,
                openStatus: true,
                maxScore: 15,
                expectedNumber: 0,
                eventGroup: '',
                eventGroupId: '',
                event: 'download_files_dmt',
                eventId: '',
                isAppoint: 0,
                isCardinality: false,
                dynamicTime: 'day',
                timeType: 'dynamic',
                fromDate: 90,
                toDate: 0,
                conditions:[
                    {
                        field_name: '',
                        fieldType: 1,
                        operation: 'eq',
                        value: ''
                    }
                ]
            }
        ]
    },
    {
        type: 'event',
        rules:[
            {
                relation: 'and',
                score: 10,
                openStatus: true,
                maxScore: 20,
                expectedNumber: 0,
                eventGroup: '',
                eventGroupId: '',
                event: 'participate_conference',
                eventId: '',
                isAppoint: 0,
                isCardinality: false,
                dynamicTime: 'day',
                timeType: 'dynamic',
                fromDate: 30,
                toDate: 0,
                conditions:[
                    {
                        field_name: '',
                        fieldType: 1,
                        operation: 'eq',
                        value: ''
                    }
                ]
            }
        ]
    },
    {
        type: 'event',
        rules:[
            {
                relation: 'and',
                score: 2,
                openStatus: true,
                maxScore: 10,
                expectedNumber: 0,
                eventGroup: '',
                eventGroupId: '',
                event: 'visit_website_dmt',
                eventId: '',
                isAppoint: 0,
                isCardinality: false,
                dynamicTime: 'day',
                timeType: 'dynamic',
                fromDate: 30,
                toDate: 0,
                conditions:[
                    {
                        field_name: '',
                        fieldType: 1,
                        operation: 'eq',
                        value: ''
                    }
                ]
            }
        ]
    }
];

export {individualAttr, companyAttr, individualEvent, companyEvent};
