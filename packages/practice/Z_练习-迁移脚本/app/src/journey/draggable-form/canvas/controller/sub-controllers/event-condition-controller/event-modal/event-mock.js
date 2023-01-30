let a = {
    'operatorCommon': {
        'str': [
            {
                'limitSize': 1,
                'index': 0,
                'id': 1,
                'type': 1,
                'operatorCn': '等于',
                'limitType': 0,
                'operator': 'eq'
            },
            {
                'limitSize': 1,
                'index': 1,
                'id': 2,
                'type': 1,
                'operatorCn': '不等于',
                'limitType': 0,
                'operator': 'ne'
            },
            {
                'limitSize': 1,
                'index': 2,
                'id': 3,
                'type': 1,
                'operatorCn': '包含',
                'limitType': 0,
                'operator': 'in'
            },
            {
                'limitSize': 1,
                'index': 3,
                'id': 4,
                'type': 1,
                'operatorCn': '不包含',
                'limitType': 0,
                'operator': 'nin'
            },
            {
                'limitSize': 0,
                'index': 4,
                'id': 5,
                'type': 1,
                'operatorCn': '有值',
                'limitType': 0,
                'operator': 'exists'
            }
        ],
        'dat': [
            {
                'limitSize': 2,
                'index': 0,
                'id': 14,
                'type': 3,
                'operatorCn': '绝对时间',
                'limitType': 0,
                'operator': 'absoluteTime'
            },
            {
                'limitSize': 1,
                'index': 1,
                'id': 15,
                'type': 3,
                'operatorCn': '相对当前时间点',
                'limitType': 0,
                'operator': 'currentRelativeTime'
            },
            {
                'limitSize': 0,
                'index': 2,
                'id': 17,
                'type': 3,
                'operatorCn': '有值',
                'limitType': 0,
                'operator': 'exists'
            }
        ],
        'num': [
            {
                'limitSize': 1,
                'index': 0,
                'id': 7,
                'type': 2,
                'operatorCn': '等于',
                'limitType': 0,
                'operator': 'eq'
            },
            {
                'limitSize': 1,
                'index': 1,
                'id': 8,
                'type': 2,
                'operatorCn': '大于',
                'limitType': 0,
                'operator': 'gt'
            },
            {
                'limitSize': 1,
                'index': 2,
                'id': 9,
                'type': 2,
                'operatorCn': '小于',
                'limitType': 0,
                'operator': 'lt'
            },
            {
                'limitSize': 1,
                'index': 3,
                'id': 10,
                'type': 2,
                'operatorCn': '不等于',
                'limitType': 0,
                'operator': 'ne'
            },
            {
                'limitSize': 0,
                'index': 4,
                'id': 11,
                'type': 2,
                'operatorCn': '有值',
                'limitType': 0,
                'operator': 'exists'
            },
            {
                'limitSize': 2,
                'index': 6,
                'id': 13,
                'type': 2,
                'operatorCn': '区间',
                'limitType': 0,
                'operator': 'range'
            }
        ]
    },
    'filterOperator': {
        'eventTrigger': [
            {
                'limitSize': 0,
                'index': 2,
                'operatorCn': '微信事件',
                'limitType': 1,
                'childForm': 0,
                'operator': 'wechatEvent',
                'child': [
                    {
                        'limitSize': 1,
                        'index': 0,
                        'operatorCn': '关注公众号',
                        'limitType': 1,
                        'childForm': 4,
                        'operator': 'subscribe'
                    },
                    {
                        'limitSize': 1,
                        'index': 1,
                        'operatorCn': '取消关注公众号',
                        'limitType': 1,
                        'childForm': 4,
                        'operator': 'unSubscribe'
                    },
                    {
                        'limitSize': 1,
                        'index': 2,
                        'operatorCn': '点击公众号菜单',
                        'limitType': 1,
                        'childForm': 4,
                        'operator': 'clickLink'
                    },
                    {
                        'limitSize': 1,
                        'index': 3,
                        'operatorCn': '向公众号发消息',
                        'limitType': 1,
                        'childForm': 4,
                        'operator': 'replyMessage'
                    },
                    {
                        'limitSize': 1,
                        'index': 4,
                        'operatorCn': '扫描带参二维码',
                        'limitType': 1,
                        'childForm': 20,
                        'operator': 'scan'
                    },
                    {
                        'limitSize': 1,
                        'index': 5,
                        'operatorCn': '收到模板消息',
                        'limitType': 1,
                        'childForm': 17,
                        'operator': 'templateNews'
                    },
                    {
                        'limitSize': 1,
                        'index': 6,
                        'operatorCn': '收到客服消息',
                        'limitType': 1,
                        'childForm': 17,
                        'operator': 'customerNews'
                    }
                ]
            },
            {
                'limitSize': 0,
                'index': 3,
                'operatorCn': '表单事件',
                'limitType': 1,
                'childForm': 0,
                'operator': 'fromEvent',
                'child': [
                    {
                        'limitSize': 1,
                        'index': 0,
                        'operatorCn': '打开表单',
                        'limitType': 1,
                        'childForm': 15,
                        'operator': 'opend'
                    },
                    {
                        'limitSize': 1,
                        'index': 1,
                        'operatorCn': '提交表单',
                        'limitType': 1,
                        'childForm': 15,
                        'operator': 'submit'
                    }
                ]
            }
        ],
        'eventChange': [
            {
                'limitSize': 0,
                'index': 4,
                'operatorCn': '标签事件',
                'limitType': 1,
                'childForm': 0,
                'operator': 'labelEvent',
                'child': [
                    {
                        'limitSize': 1,
                        'index': 0,
                        'operatorCn': '新增标签',
                        'limitType': 1,
                        'childForm': 16,
                        'operator': 'add'
                    },
                    {
                        'limitSize': 1,
                        'index': 1,
                        'operatorCn': '移除标签',
                        'limitType': 1,
                        'childForm': 16,
                        'operator': 'remove'
                    }
                ]
            },
            {
                'limitSize': 0,
                'index': 5,
                'operatorCn': '属性变化事件',
                'limitType': 1,
                'childForm': 6,
                'operator': 'attributeChangeEvent',
                'child': ''
            }
        ],
        'eventCommon': [
            {
                'limitSize': 0,
                'index': 0,
                'operatorCn': '邮件事件',
                'limitType': 1,
                'childForm': 0,
                'operator': 'emailEvent',
                'child': [
                    {
                        'limitSize': 1,
                        'index': 0,
                        'operatorCn': '收到邮件',
                        'limitType': 1,
                        'childForm': 1,
                        'operator': 'arrived'
                    },
                    {
                        'limitSize': 1,
                        'index': 1,
                        'operatorCn': '打开邮件',
                        'limitType': 1,
                        'childForm': 1,
                        'operator': 'opend'
                    }
                ]
            },
            {
                'limitSize': 0,
                'index': 1,
                'operatorCn': '短信事件',
                'limitType': 1,
                'childForm': 0,
                'operator': 'mobileEvent',
                'child': [
                    {
                        'limitSize': 1,
                        'index': 0,
                        'operatorCn': '收到短信',
                        'limitType': 1,
                        'childForm': 2,
                        'operator': 'arrived'
                    },
                    {
                        'limitSize': 1,
                        'index': 1,
                        'operatorCn': '点击短链',
                        'limitType': 1,
                        'childForm': 2,
                        'operator': 'opend'
                    }
                ]
            },
            {
                'limitSize': 0,
                'index': 2,
                'operatorCn': '微信事件',
                'limitType': 1,
                'childForm': 0,
                'operator': 'wechatEvent',
                'child': [
                    {
                        'limitSize': 1,
                        'index': 0,
                        'operatorCn': '关注公众号',
                        'limitType': 1,
                        'childForm': 4,
                        'operator': 'subscribe'
                    },
                    {
                        'limitSize': 1,
                        'index': 1,
                        'operatorCn': '取消关注公众号',
                        'limitType': 1,
                        'childForm': 4,
                        'operator': 'unSubscribe'
                    },
                    {
                        'limitSize': 1,
                        'index': 2,
                        'operatorCn': '点击公众号菜单',
                        'limitType': 1,
                        'childForm': 4,
                        'operator': 'clickLink'
                    },
                    {
                        'limitSize': 1,
                        'index': 3,
                        'operatorCn': '向公众号发消息',
                        'limitType': 1,
                        'childForm': 4,
                        'operator': 'replyMessage'
                    },
                    {
                        'limitSize': 1,
                        'index': 4,
                        'operatorCn': '扫描带参二维码',
                        'limitType': 1,
                        'childForm': 20,
                        'operator': 'scan'
                    },
                    {
                        'limitSize': 1,
                        'index': 5,
                        'operatorCn': '收到模板消息',
                        'limitType': 1,
                        'childForm': 17,
                        'operator': 'templateNews'
                    },
                    {
                        'limitSize': 1,
                        'index': 6,
                        'operatorCn': '收到客服消息',
                        'limitType': 1,
                        'childForm': 17,
                        'operator': 'customerNews'
                    }
                ]
            },
            {
                'limitSize': 0,
                'index': 3,
                'operatorCn': '表单事件',
                'limitType': 1,
                'childForm': 0,
                'operator': 'fromEvent',
                'child': [
                    {
                        'limitSize': 1,
                        'index': 0,
                        'operatorCn': '打开表单',
                        'limitType': 1,
                        'childForm': 15,
                        'operator': 'opend'
                    },
                    {
                        'limitSize': 1,
                        'index': 1,
                        'operatorCn': '提交表单',
                        'limitType': 1,
                        'childForm': 15,
                        'operator': 'submit'
                    }
                ]
            },
            {
                'limitSize': 1,
                'index': 4,
                'operatorCn': '自定义事件',
                'limitType': 1,
                'childForm': 19,
                'operator': 'customEvent',
            },
        
        ]
    }
};


export default a;