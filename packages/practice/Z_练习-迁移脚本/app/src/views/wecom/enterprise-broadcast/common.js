import { translate as t } from '@/locales';

//群发方式 1 企业群发 2 应用消息
const methodList = [{
    source: '',
    name: t('enterpriseBroadcast.all')
}, {
    source: 1,
    name: t('enterpriseBroadcast.groupMsg')
}, {
    source: 2,
    name: t('enterpriseBroadcast.agentMsg')
}];
//群发类型 1 联系人 2 企业群
const typeList = [{
    source: '',
    name: t('enterpriseBroadcast.all')
}, {
    source: 1,
    name: t('enterpriseBroadcast.contact')
}, {
    source: 2,
    name: t('enterpriseBroadcast.enterpriseGroup')
}];
//发送类型 1 立即发送 2 定时发送 
const sendTypeList = [{
    source: '',
    name: t('enterpriseBroadcast.all')
}, {
    source: 1,
    name: t('enterpriseBroadcast.sendImmediately')
}, {
    source: 2,
    name: t('enterpriseBroadcast.timedSend')
}];
//群发状态 0 待发送 1 发送中 2 已完成(已发送)  3 已取消
const statusList = [{
    source: '',
    name: t('enterpriseBroadcast.all')
}, {
    source: 0,
    name: t('enterpriseBroadcast.toBeSent')
}, {
    source: 1,
    name: t('enterpriseBroadcast.sending')
}, {
    source: 2,
    name: t('enterpriseBroadcast.sent')
}, {
    source: 3,
    name: t('enterpriseBroadcast.canceled')
}];

/**
 * 根据选项的值获取选项名称
 * @param {*} type 
 * @param {*} v 
 * @returns 
 */
const optionsRender = function (type, v) {
    let name = '';
    switch (type) {
        case 'sendMode'://群发方式 1 企业群发 2 应用消息
            name = methodList.filter(e => { return e.source === v })[0].name;
            break;
        case 'sendType'://群发类型 1 客户 2 客户群
            name = typeList.filter(e => { return e.source === v })[0].name;
            break;
        case 'messageType'://消息类型 1 立即发送 2 定时发送
            name = sendTypeList.filter(e => { return e.source === v })[0].name;
            break;
        case 'sendStatus'://群发状态 0 待发送 1 发送中 2 已完成 3 已取消
            name = statusList.filter(e => { return e.source === v })[0].name;
            break;
        default:
            name = '';
    }
    return name;
};

//对表格中字段进行排序
const filedsSort = function (list, fileds) {
    let sortList = [];
    list.forEach(e => {
        let obj = {};
        fileds.forEach(f => {
            obj[f] = e[f];
        });
        sortList.push(obj);
    });
    return sortList;
};

/**
 * 数组去重
 * @params list 需要去重的数组
 * 根据id 去重
 */
const arrayReduce = function (list) {
    let obj = {};
    let listReduce = list.reduce((cur, next) => {
        obj[next.id] ? '' : obj[next.id] = true && cur.push(next);
        return cur;
    }, []); //设置cur默认类型为数组，并且初始值为空的数组
    return listReduce;
};

/**************  群发详情 *******************/

//企业群发相关的字段
const fieldsBroadcast = [
    'chatName',//群聊名称
    'owner',//群主
    'msg',//状态
    'totalCount',//总群聊数
    'sendCount',//发送群聊数
    'errCount'//未发群聊数]
];

//联系人相关的字段
const fieldsContact = [
    'customerName',//联系人名称
    'userName',//员工名称
    'errMsg',//未发送/已发送/非好友/已收到其他消息
    'finishCount',//已发送联系人
    'undeliveredCount',//未发送联系人
    'unFriendCount',//非好友人数
    'rejectionSentCount',//已接收其他消息
];

//数据统计的图标
const cardsTypeList = ['#icon-qiyeweixin', '#icon-qunzu', '#icon-carriedOut', '#icon-user1', '#icon-warn'];

/**
 * 群发详情-表头字段
 * @param {*} sendMode 1:企业群发 2：应用消息
 * @param {*} sendType 1:联系人2 企业群
 * @param {*} tabType 1：选中第一个tab,2：选中第二个tab
 * @returns
 */
const theadRender = function (sendMode, sendType, tabType) {
    let list = [];
    if (sendType === 1) {
        if (tabType === 1) {
            list = [{
                name: t('enterpriseBroadcast.employee'),
                field: fieldsContact[1]
            }, {
                name: t('enterpriseBroadcast.sendStatus'),
                field: fieldsContact[2]
            }, {
                name: t('enterpriseBroadcast.deliveredToContact'),
                field: fieldsContact[3]
            }, {
                name: t('enterpriseBroadcast.undeliveredContact'),
                field: fieldsContact[4]
            }];
            if (sendMode === 1) {
                const addList = [{
                    name: t('enterpriseBroadcast.nonFriendsFail'),
                    field: fieldsContact[5]
                }, {
                    name: t('enterpriseBroadcast.receivedOtherMessagesFail'),
                    field: fieldsContact[6]
                }];
                list = [...list, ...addList];
            }
        } else {
            list = [{
                name: t('enterpriseBroadcast.contactName'),
                field: fieldsContact[0]
            }, {
                name: t('enterpriseBroadcast.employee'),
                field: fieldsContact[1]
            }, {
                name: t('enterpriseBroadcast.sendStatus'),
                field: fieldsContact[2]
            }];
        }
    } else {
        if (tabType === 1) {
            list = [{
                name: t('enterpriseBroadcast.groupChatName'),
                field: fieldsBroadcast[0]
            }, {
                name: t('enterpriseBroadcast.lord'),
                field: fieldsBroadcast[1]
            }, {
                name: t('enterpriseBroadcast.sendStatus'),
                field: fieldsBroadcast[2]
            }];
        } else {
            list = [{
                name: t('enterpriseBroadcast.lord'),
                field: fieldsBroadcast[0]
            }, {
                name: t('enterpriseBroadcast.sendStatus'),
                field: fieldsBroadcast[2]
            }, {
                name: t('enterpriseBroadcast.numberOfGroupChats'),
                field: fieldsBroadcast[3]
            }];
            if (sendMode === 1) {
                list.push({
                    name: t('enterpriseBroadcast.numberOfSentGroupChats'),
                    field: fieldsBroadcast[4]
                }, {
                    name: t('enterpriseBroadcast.groupChatsNotSent'),
                    field: fieldsBroadcast[5]
                });
            } else {
                list.push({
                    name: t('enterpriseBroadcast.numberOfDeliveredGroupChats'),
                    field: fieldsBroadcast[4]
                }, {
                    name: t('enterpriseBroadcast.undeliveredGroupChats'),
                    field: fieldsBroadcast[5]
                });
            }
        }
    }
    return list;
};

/**
 * 群发详情-获取表格数据的类型
 * @param {*} sendType 1:联系人2 企业群
 * @returns 
 */
const getTabLink = function (sendType) {
    let list = [];
    if (sendType === 1) {
        list = [{
            name: t('enterpriseBroadcast.employeeDetails'),
            checked: true
        }, {
            name: t('enterpriseBroadcast.sendingDetails'),
            checked: false
        }];
    } else {
        list = [{
            name: t('enterpriseBroadcast.groupChatDetails'),
            checked: true
        }, {
            name: t('enterpriseBroadcast.groupOwnerDetails'),
            checked: false
        }];
    }
    return list;
};

/**
 * 获取表格需要展示的字段
 * @param {*} sendMode 1:企业群发 2：应用消息
 * @param {*} sendType 1:联系人2 企业群
 * @param {*} tabType 1：选中第一个tab,2：选中第二个tab
 */
const fieldRender = function (sendMode, sendType, tabType) {
    let field = [];
    // 联系人
    if (sendType === 1) {
        if (tabType === 1) {
            field = fieldsContact.filter((e, i) => { return i > 0 && i < 5 });
            if (sendMode === 1) {
                field = [...field, ...[fieldsContact[5], fieldsContact[6]]];
            }
        } else {
            field = fieldsContact.filter((e, i) => { return i < 3 });
        }
    } else {
        //企业群
        if (tabType === 1) {
            field = fieldsBroadcast.filter((e, i) => { return i < 3 });
        } else {
            field = fieldsBroadcast.filter((e, i) => { return i > 0 });
        }
    }
    return field;
};


/**
 * 详情中的表格中的筛选条件 TODO
 * @param {*} typeSelect  tab 选中的项 
 * @param {*} sendMode  群发方式 1 企业群发 2 应用消息
 * @param {*} sendType 群发类型  1 客户  2 客户群
 * @param {*} select 下拉项
 * @returns 
 */
const filterRender = function (typeSelect, sendMode, sendType, select) {
    let list = [];
    //全部
    let all = [{
        name: t('enterpriseBroadcast.all'),
        id: ''
    }];
    //企业群发+联系人
    if (sendMode === 1 && sendType === 1) {
        //1:员工详情 2发送详情
        list = [{
            name: fieldsContact[1],
            show: false,
            select: all,
            value: ''
        }];
        if (select && select.length > 0) list[0].select = [...all, ...select];
        if (typeSelect === 2) {
            const status = [{
                name: fieldsContact[2],
                show: false,
                select: [{
                    name: t('enterpriseBroadcast.all'),
                    id: ''
                }, {
                    name: t('enterpriseBroadcast.undelivered'),
                    id: 0
                }, {
                    name: t('enterpriseBroadcast.delivered'),
                    id: 1
                }, {
                    name: t('enterpriseBroadcast.nonFriendsFail'),
                    id: 2
                }, {
                    name: t('enterpriseBroadcast.receivedOtherMessagesFail'),
                    id: 3
                }],
                value: ''
            }];
            list = [...list, ...status];
        }
    } else if (sendMode === 1 && sendType === 2) {
        //企业群发+企业群

        //1:群聊详情 2群主详情
        list = [{
            name: fieldsBroadcast[2],
            show: false,
            select: [{
                name: t('enterpriseBroadcast.all'),
                id: ''
            }, {
                name: t('enterpriseBroadcast.notSent'),
                id: 0
            }, {
                name: t('enterpriseBroadcast.sent'),
                id: 1
            }],
            value: ''
        }];
        if (typeSelect === 1) {
            list[0].select.push({
                name: t('enterpriseBroadcast.failedToSend'),
                id: 2
            });
            //状态 0 未送达 1 已送达 2 发送失败
            const options = [{
                name: fieldsBroadcast[1],
                show: false,
                select: all,
                value: ''
            }];
            list = [...list, ...options];
            if (select && select.length > 0) list[1].select = [...all, ...select];
        }
    } else if (sendMode === 2 && sendType === 2) {
        //应用消息+企业群
        if (typeSelect === 1) {
            //群聊详情
            list = [{
                name: fieldsBroadcast[1],
                show: false,
                select: all,
                value: ''
            }, {
                name: fieldsBroadcast[2],
                show: false,
                select: [{
                    name: t('enterpriseBroadcast.all'),
                    id: ''
                }, {
                    name: t('enterpriseBroadcast.undelivered'),
                    id: 0
                }, {
                    name: t('enterpriseBroadcast.delivered'),
                    id: 1
                }],
                value: ''
            }];
            if (select && select.length > 0) list[0].select = [...all, ...select];
        }
    } else {
        //应用消息+联系人

        //1.员工详情 2.发送详情
        list = [{
            name: fieldsContact[1],
            show: false,
            select: all,
            value: ''
        }];
        if (select && select.length > 0) list[0].select = [...all, ...select];
        if (typeSelect === 2) {
            const status = [{
                name: fieldsContact[2],
                show: false,
                select: [{
                    name: t('enterpriseBroadcast.all'),
                    id: ''
                }, {
                    name: t('enterpriseBroadcast.undelivered'),
                    id: 0
                }, {
                    name: t('enterpriseBroadcast.delivered'),
                    id: 1
                }],
                value: ''
            }];
            list = [...list, ...status];
        }
    }
    return list;
};

/***
 * 统计模块，根据 群发类型 、群发对象进行处理
 */
const statisticsHandle = function (detail) {
    let list = [];
    const undelivered = t('enterpriseBroadcast.undelivered');//未送达
    const notSent = t('enterpriseBroadcast.notSent');//未发送
    const sentEmployees = t('enterpriseBroadcast.sentEmployees');//已发送员工
    //企业群发
    if (detail.sendMode === 1) {
        //联系人
        if (detail.sendType === 1) {
            list = [{
                color: null,
                icon: cardsTypeList[0],
                name: sentEmployees,
                undelivered: notSent,
                number: detail.sentCount || 0,
                undeliveredNum: detail.unSentCount || 0
            }, {
                color: '#0cc2a9',
                icon: cardsTypeList[2],
                name: t('enterpriseBroadcast.executedSentEmployees'),
                undelivered: t('enterpriseBroadcast.notExecuted'),
                number: detail.executeSentCount || 0,
                undeliveredNum: detail.unExecuteSentCount || 0
            }, {
                color: '#0cc2a9',
                icon: cardsTypeList[3],
                name: t('enterpriseBroadcast.deliveryContact'),
                undelivered: undelivered,
                number: detail.finishCount || 0,
                undeliveredNum: detail.undeliveredCount || 0
            }, {
                color: '#DE7722',
                icon: cardsTypeList[4],
                name: t('enterpriseBroadcast.reasonForNonDelivery'),
                nonFriends: t('enterpriseBroadcast.nonFriends'),
                receivedOtherMessages: t('enterpriseBroadcast.receivedOtherMessages'),
                number: detail.unFriendCount || 0,
                other: detail.rejectionSentCount || 0
            }];
        } else {
            //企业群
            list = [{
                color: null,
                icon: cardsTypeList[0],
                name: t('enterpriseBroadcast.sentToTheOwner'),
                undelivered: notSent,
                number: detail.sentCount || 0,
                undeliveredNum: detail.unSentCount || 0
            }, {
                color: '#0cc2a9',
                icon: cardsTypeList[1],
                name: t('enterpriseBroadcast.sentGroupChat'),
                undelivered: notSent,
                number: detail.finishCount || 0,
                undeliveredNum: detail.undeliveredCount || 0
            }, {
                color: '#DE7722',
                icon: cardsTypeList[4],
                name: t('enterpriseBroadcast.groupChatFailedToSend'),
                nonFriends: '',
                receivedOtherMessages: '',
                number: detail.errorCount || 0,
            }];
        }
    } else {
        if (detail.sendType === 2) {
            //应用消息+企业群
            list = [{
                color: null,
                icon: cardsTypeList[0],
                name: t('enterpriseBroadcast.sentToTheOwner'),
                undelivered: '',
                number: detail.sentCount || 0,
                undeliveredNum: ''
            }, {
                color: '#0cc2a9',
                icon: cardsTypeList[1],
                name: t('enterpriseBroadcast.deliveredToGroupChat'),
                undelivered: undelivered,
                number: detail.finishCount || 0,
                undeliveredNum: detail.undeliveredCount || 0
            }];
        } else {
            //应用消息+联系人
            list = [{
                color: null,
                icon: cardsTypeList[0],
                name: sentEmployees,
                undelivered: '',
                number: detail.sentCount,
                undeliveredNum: ''
            }, {
                color: '#0cc2a9',
                icon: cardsTypeList[1],
                name: t('enterpriseBroadcast.deliveredToContact'),
                undelivered: undelivered,
                number: detail.finishCount || 0,
                undeliveredNum: detail.undeliveredCount || 0
            }];
        }
    }
    return list;
};

/**************  群发详情end *******************/

export {
    optionsRender, theadRender, getTabLink, fieldRender, filedsSort,
    filterRender, methodList, typeList, sendTypeList, statusList, arrayReduce, statisticsHandle,
    cardsTypeList
};