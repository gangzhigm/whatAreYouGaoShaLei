import { logError } from '@/monitor.js';
import { WechatApiV1 } from '@/api';

/**
 * subType类型说明：0群发图文，1客服图文，2模版消息，3客服文字，4，客服图片，5客服音频，6客服视频，7外部页面，8表单，9小程序卡片
 *                10群发文字，11群发图片，12群发音频，13群发视频
 * 
 * wechatType类型说明：template-模版消息，picText-群发图文（原群发消息），service-客服图文（原客服消息），
 *                   [md = mass delivery(群发)] pics/mdPics(图片消息)，audio/mdAudio(语音消息)，
 *                   video/mdVideo(视频消息),sheet/mdSheet(文字消息)，external(外部页)，form(表单)，miniProgramCard(小程序卡片)
 * meterial-editor.vue组件类型说明：1图片, 2语音, 3视频, 'text'文本, 5图文, 6外部页, 7表单, 8小程序卡片
 */


/**
 * 微信拖拽控件列表初期化
 * @description 旅程左侧选择素材时，微信分类下有多个类型，该逻辑用于给不同类型素材列表添加初期类型配置
 * @param {boolean} isMass true群发消息 false客服消息
 * @param {number} wType 微信类子组件 5图文 4文本 1图片 2语音 3视频 6外部页 7表单 8小程序卡片
 */
function initDragItem (isMass, wType) {
    let config = {};
    switch (wType) {
        case 1:
            config.subType = isMass ? 11 : 4;
            config.wechatType = isMass ? 'mdPics' : 'pics';
            break;
        case 2:
            config.subType = isMass ? 12 : 5;
            config.wechatType = isMass ? 'mdAudio' : 'audio';
            break;
        case 3:
            config.subType = isMass ? 13 : 6;
            config.wechatType = isMass ? 'mdVideo' : 'video';
            break;
        case 4:
            config.subType = isMass ? 10 : 3;
            config.wechatType = isMass ? 'mdSheet' : 'sheet';
            break;
        case 5:
            config.subType = isMass ? 0 : 1;
            config.wechatType = isMass ? 'picText' : 'service';
            break;
        case 6:
            config.subType = 7;
            config.wechatType = 'external';
            break;
        case 7:
            config.subType = 8;
            config.wechatType = 'form';
            break;
        case 8:
            config.subType = 9;
            config.wechatType = 'miniProgramCard';
            break;
        default:
            logError(`[营销旅程] <channels /> getWechatMaterials 微信消息子类型无法识别`);
            break;
    }
    return config;
}

/**
 * 新任务接口配置初期化
 * @description 旅程任务控件拖拽完成，新增任务保存接口的配置生成
 * @param {object} controller VUEX暂存的当前controller对象
 * @param {object} target 需要增加配置的目标对象
 */
function initTaskInfo (controller, target) {
    const { wechatType } = controller;
    let config = {};
    switch (wechatType) {
        case 'picText':
        case 'service':
        case 'template':
        case 'pics':
        case 'mdPics':
        case 'audio':
        case 'mdAudio':
        case 'video':
        case 'mdVideo':
            config.materialId = controller.id; // 预置素材id
            break;
        case 'sheet':
        case 'mdSheet':
            config.wxContext = ''; // 文本内容
            break;
        case 'external':
            // webUrl链接、title标题、description描述、picUrl封面图片url
            Object.assign(config, {
                webUrl: '',
                title: '',
                description: '',
                picUrl: '',
                materialCoverId: null
            });
            break;
        case 'form':
            // formType表单回复类型 3文字 4web页 
            // 新建默认 formType===3 保存replyString表单回复文字、content文本框内容有且仅有一项
            // formType===4 web页类型：保存webUrl链接、title标题、description描述、picUrl封面图片url
            Object.assign(config, {
                formType: 3,
                replyString: '',
                wxContext: ''
            });
            break;
        case 'miniProgramCard':
            // title标题、miniAppId小程序的appid、pagePath小程序的页面路径、materialId图片id
            Object.assign(config, {
                title: '',
                miniAppId: '',
                pagePath: '',
                materialId: null
            });
    }
    Object.assign(target, config);
}

/**
 * 微信任务弹窗 素材参数存储
 * @description 旅程中的微信消息分类下，区别于旧式的图文消息（原群发消息，客服消息）仅需传送materialId，
 *             [图片，音频，视频，文字，表单，外部页面，微信小程序卡片]七个类型与微信模块的微信素材共用一套组件，
 *              该参数传送逻辑，将以上七个参数组件的参数，转化后用于编辑微信控件的弹窗保存
 * @param {string} type 当前处理的素材类型
 * @param {object} material 素材编辑器参数对象
 */
function materialMapper (type, material) {
    const config = {};
    switch (type) {
        case 'pics':
        case 'audio':
        case 'video':
        case 'mdPics':
        case 'mdAudio':
        case 'mdVideo':
            config.materialId = material.id; // 素材id
            break;
        case 'sheet':
        case 'mdSheet':
            config.wxContext = material.content; // 文本内容
            break;
        case 'external':
            // webUrl链接、title标题、description描述、picUrl封面图片url
            config.webUrl = material.exUrl;
            config.title = material.exTitle;
            config.description = material.exDescribe;
            config.picUrl = material.url;
            // 前端显示用 
            config.materialCoverId = material.id; // 图片封面id
            break;
        case 'form':
            // formType表单回复类型 3文字 4web页 
            // 新建默认 formType===3 保存replyString表单回复文字、wxContext文本框内容有且仅有一项  external
            // formType===4 web页类型：保存webUrl链接、title标题、description描述、picUrl封面图片url
            if (material.formReplyType === 'sheet') {
                config.formType = 3;
                // 清空 formType===4 web页类型专用的参数
                config.webUrl = '';
                config.title = '';
                config.description = '';
                config.picUrl = '';
                config.materialCoverId = null;

                if (material.content) {
                    // hasContent 1表示输入框内有内容 0无内容
                    config.hasContent = 1;
                    // 文本输入框有内容
                    if (material.content.indexOf('href="http') > -1) {
                        // 内容有插入链接
                        config.wxContext = '';
                        config.replyString = material.content;
                    } else {
                        // 纯文本
                        config.replyString = '';
                        config.wxContext = material.content;
                    }
                } else {
                    config.hasContent = 0;
                    config.wxContext = '';
                    // 文本输入框无内容
                    if (material.customSheetUrl) {
                        // 选择了扩展字段
                        config.replyString = material.customSheetUrl;
                    } else if (material.sheetUrl) {
                        config.replyString = material.sheetUrl;
                    } else {
                        config.replyString = '';
                    }
                }
            } else {
                config.formType = 4;
                // 清空 formType===3 文字页类型专用的参数
                config.replyString = '';
                config.wxContext = '';
                // web页类型表单，没有content输入框
                config.hasContent = 0;

                config.description = material.externalDescription;
                config.picUrl = material.externalImageUrl;
                config.title = material.externalTitle;
                // 如果有子表单，取其url，否则取一级表单url
                config.webUrl = material.customSheetUrl ? material.customSheetUrl : material.sheetUrl;
                // 仅前端显示用 material-form同名参数
                config.materialCoverId = material.materialCoverId;
            }
            // 仅前端显示用
            config.formId = material.id; // 选择的表单id
            config.customFormId = material.customFormId; // 二级定制表单id
            config.extensionValueId = material.extensionValueId; // 扩展字段id
            config.customSheetUrl = material.customSheetUrl;
            config.sheetUrl = material.sheetUrl;
            break;
        case 'miniProgramCard':
            // title标题、miniAppId小程序的appid、pagePath小程序的页面路径、materialId图片id
            config.title = material.miniprogramTitle;
            config.miniAppId = material.miniprogramAppid;
            config.pagePath = material.pagePath;
            config.materialId = material.id;
            break;
    }
    return config;
}

/**
 * 微信任务弹窗 素材参数回显
 * @param {object} task 编辑微信控件的任务参数对象
 */
function materialReMapper (task) {
    return new Promise(function (resolve) {
        let config = {};
        switch (task.wechatType) {
            case 'pics':
            case 'mdPics':
            case 'audio':
            case 'mdAudio':
            case 'video':
            case 'mdVideo':
                getMaterial(task.materialId, false)
                    .then(material => {
                        Object.assign(config, material);
                        resolve(config);
                    })
                    .catch(() => {
                        resolve(config);
                    });
                break;
            case 'sheet':
            case 'mdSheet':
                config.type = 'text';
                config.content = task.wxContext; // 文本内容
                resolve(config);
                break;
            case 'external':
                // webUrl链接、title标题、description描述、picUrl封面图片url
                config.type = 6;
                config.exUrl = task.webUrl;
                config.exTitle = task.title;
                config.exDescribe = task.description;
                config.url = task.picUrl;
                // 仅前端显示用
                config.id = task.materialCoverId || null;
                if (task.materialCoverId) {
                    getMaterial(task.materialCoverId)
                        .then(material => {
                            Object.assign(config, material);
                            resolve(config);
                        })
                        .catch(() => {
                            resolve(config);
                        });
                } else {
                    resolve(config);
                }
                break;
            case 'form':
                config.type = 7;
                config.replyType = 7;
                // 前端回显专用
                config.id = task.formId;
                config.customFormId = task.customFormId;
                config.extensionValueId = task.extensionValueId;
                config.customSheetUrl = task.customSheetUrl;
                config.sheetUrl = task.sheetUrl;
                if (task.formType === 3) {
                    // 文本型
                    config.formReplyType = 'sheet';
                    // 纯文本无任何链接
                    if (task.hasContent) {
                        // 保存时输入框有内容回显
                        if (task.wxContext) {
                            config.content = task.wxContext;
                        } else {
                            config.content = task.replyString;
                        }
                    }
                    resolve(config);
                } else {
                    config.formReplyType = 'external';
                    config.externalDescription = task.description;
                    config.externalImageUrl = task.picUrl;
                    config.externalTitle = task.title;
                    // 表单选项回显 前端显示用，接口仅存储
                    config.materialCoverId = task.materialCoverId;
                    if (task.materialCoverId) {
                        getMaterial(task.materialCoverId)
                            .then(material => {
                                // material-form历史字段定义错误，用materialId来存储封面图的mediaId，此处保持该逻辑
                                material.materialId = material.mediaId;
                                delete material.mediaId;
                                // 表单编辑器中，id表示选中表单的id，而不是封面图片素材id，因此删除
                                delete material.id;
                                Object.assign(config, material);
                                resolve(config);
                            })
                            .catch(() => {
                                resolve(config);
                            });
                    } else {
                        resolve(config);
                    }
                }
                break;
            case 'miniProgramCard':
                // title标题、miniAppId小程序的appid、pagePath小程序的页面路径、materialId图片id
                config.type = 8;
                config.miniprogramTitle = task.title;
                config.miniprogramAppid = task.miniAppId;
                config.pagePath = task.pagePath;
                config.id = task.materialId;
                if (task.materialId) {
                    config.materialId = task.materialId;
                    getMaterial(task.materialId)
                        .then(material => {
                            config = Object.assign(config, material);
                            config.materialId = task.id;
                            resolve(config);
                        })
                        .catch(() => {
                            resolve(config);
                        });
                } else {
                    resolve(config);
                }
                break;
        }
    });
}

/**
 * 重置素材
 * @param {string} type 当前处理的素材类型
 * 发送消息类型(1.图片 2.音频 3.视频 'text'文字 5.图文消息 6.外部页 7.跳转表单 8.小程序卡片 9.菜单消息)
 */
function resetMaterial (type) {
    let config = {};
    switch (type) {
        case 'pics':
        case 'mdPics':
            config.type = 1;
            config.id = null;
            break;
        case 'audio':
        case 'mdAudio':
            config.type = 2;
            config.id = null;
            break;
        case 'video':
        case 'mdVideo':
            config.type = 3;
            config.id = null;
            break;
        case 'sheet':
        case 'mdSheet':
            config.type = 'text';
            config.content = ''; // 文本内容
            break;
        case 'external':
            config.type = 6;
            config.exUrl = '';
            config.exTitle = '';
            config.exDescribe = '';
            config.url = '';
            config.id = null;
            config.materialCoverId = null;
            config.mediaId = null;
            break;
        case 'form':
            config.type = 7;
            config.formReplyType = 'sheet';
            config.content = '';
            config.id = null;
            config.customFormId = null;
            config.extensionValueId = null;
            config.hasContent = 0;
            config.customSheetUrl = '';
            config.sheetUrl = '';
            // web页类型参数清空
            config.externalDescription = '';
            config.externalImageUrl = '';
            config.externalTitle = '';
            config.materialCoverId = null;
            break;
        case 'miniProgramCard':
            config.type = 8;
            config.miniprogramTitle = '';
            config.miniprogramAppid = null;
            config.pagePath = '';
            config.id = null;
            config.materialId = null;
            break;
    }
    return config;
}

/**
 * 测试配置生成
 * @param {object} 旅程pushInfo
 * 
 */
function setTestConfig (pushInfo) {
    let config = {};
    config.materialId = pushInfo.materialId || 0;
    switch (pushInfo.wechatType) {
        case 'pics':
        case 'mdPics':
            config.type = 1;
            break;
        case 'audio':
        case 'mdAudio':
            config.type = 2;
            break;
        case 'video':
        case 'mdVideo':
            config.type = 3;
            break;
        case 'sheet':
        case 'mdSheet':
            config.type = 4;
            config.wxContext = pushInfo.wxContext; // 文本内容
            break;
        case 'picText':
        case 'service':
            config.type = 5;
            break;
        case 'external':
            // webUrl链接、title标题、description描述、picUrl封面图片url
            config.type = 6;
            config.webUrl = pushInfo.webUrl;
            config.title = pushInfo.title;
            config.description = pushInfo.description;
            config.picUrl = pushInfo.picUrl;
            break;
        case 'form':
            config.type = 7;
            config.formType = pushInfo.formType;
            if (pushInfo.formType === 3) {
                if (pushInfo.wxContext) {
                    config.wxContext = pushInfo.wxContext;
                } else {
                    config.replyString = pushInfo.replyString;
                }
            } else {
                config.webUrl = pushInfo.webUrl;
                config.description = pushInfo.description;
                config.picUrl = pushInfo.picUrl;
                config.title = pushInfo.title;
            }
            break;
        case 'miniProgramCard':
            config.type = 8;
            // title标题、miniAppId小程序的appid、pagePath小程序的页面路径、materialId图片id
            config.title = pushInfo.title;
            config.miniAppId = pushInfo.miniAppId;
            config.pagePath = pushInfo.pagePath;
            config.materialId = pushInfo.materialId;
            break;
    }
    return config;
}

/**
 * 设置预览素材类型
 * 将subType转换为微信素材模块使用的类型
 * @param {number} subType 旅程pushInfo中的subType类型
 */
function setEditorType (subType) {
    switch (subType) {
        case 3:
        case 10:
            return 'text';
        case 7:
            return 6;
        case 8:
            return 7;
        case 9:
            return 8;
        default:
            return '';
    }
}
/**
 * 根据素材id获取详情
 * @param {number} id 素材id 
 * @param {boolean} 是否删除获取的素材type
 */
function getMaterial (id, noType = true) {
    return new Promise(function (resolve, reject) {
        WechatApiV1
            .getMaterial(id)
            .then(({ body: { data: { material } } }) => {
                if (noType) {
                    delete material.type;
                }
                resolve(material);
            })
            .catch(() => {
                reject();
            });
    });
}

export {
    initDragItem,
    initTaskInfo,
    materialMapper,
    materialReMapper,
    resetMaterial,
    setTestConfig,
    setEditorType
};