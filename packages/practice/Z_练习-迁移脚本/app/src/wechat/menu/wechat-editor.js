import emojiList from '@/common/utils/emoji/emojiList';

/**
 * @description: 字符串转Unicode十六进制
 * @param {string} str 传入的字符串
 * @return {*} result 转出的十六进制码
 */
const strToUnicode = str => {
    let result = '';
    for (let i = 0; i < str.length; i++) {
        let code = str.codePointAt(i).toString(16);
        // eslint-disable-next-line no-useless-escape
        result += `\\u\{${code}\}`;
        if (code.length > 4) {
            i++; // 由于str.length也只能处理两个字节的文字，所以这里需要判断如果codePointAt得到多字符就得跳过一次循环
        }
    }
    return result;
};

/**
 * @description: 得到十六进制字节数
 * @param {*} str 十六进制码
 * @return {*} 字节数
 */
const getByteByHex = str => {
    if (str <= 0x007f) {
        return 1;
    } else if (str <= 0x07ff) {
        return 2;
    } else if (str <= 0xffff) {
        return 3;
    }
    return 4;
};

/**
 * @description: 截取指定字符数长度的文本 如果后一个字符截取后超出指定的长度，将不会截取该字符
 * @param {string} str 字符串
 * @param {number} maxLength 需要截取字节长度
 * @return {string} result 截取所需字节后的字符串
 */
const cutStr = (str, maxLength) => {
    let data = strToUnicode(str);
    let reg = new RegExp(/\\u\{[A-z0-9]+\}(\\u\{200d\}{1}\\u\{[A-z0-9]+\})*/, 'g'); // 使用正则表达式分割每个完整字符
    let datas = reg[Symbol.match](data);
    let result = '';
    let length = 0;

    for (let i in datas) {
        let value = datas[i].split('\\u').slice(1);
        // eslint-disable-next-line no-loop-func
        value = value.map(str => {
            let val = str.replace(/\\u/g, '').replace(/{/g, '')
                .replace(/}/g, '');
            const parseVal = parseInt(val, 16);
            length += getByteByHex(parseInt(val, 16));
            return parseVal;
        });
        if (length <= maxLength) {
            result += String.fromCodePoint(...value);
        } else break;
    }
    return result;
};

/**
 * @description: 根据类型 渲染素材
 * @param {*} targetMenu 素材
 * */
const menuRender = targetMenu => {
    //菜单类型:1.网页跳转 2.图文/图片/音频/视频 3.文字 6.外部页 7.表单 8.小程序卡片 9.菜单消息 10.原小程序
    const mType = [2, 3, 6, 7, 8, 9, 10];

    let mtl;
    const type = targetMenu.type;
    const m = targetMenu.material;
    switch (type) {
        //文字
        case mType[1]:
            mtl = {
                content: targetMenu.content,
                type: 'text',
                parentId: targetMenu.parentId,
                exDescribe: '',
                exTitle: '',
                exUrl: '',
            };
            break;
        //图文/图片/音频/视频
        case mType[0]:
            if (targetMenu.materialId) {
                mtl = {
                    name: m ? m.name : '',
                    content: m ? m.content : '',
                    type: m ? m.type : '',
                    digest: m ? m.digest : '',
                    mediaId: m ? m.mediaId : '',
                    articleId: m ? m.articleId : '',
                    thumbMediaId: m ? m.thumbMediaId : '',
                    thumbMediaUrl: m ? m.thumbMediaUrl : '',
                    title: m ? m.title : '',
                    url: m ? m.url : '',
                    parentId: m ? m.parentId : '',
                    id: targetMenu.materialId, //素材id
                };
            } else {
                mtl = {
                    type: 5,
                    url: targetMenu.url,
                    parentId: targetMenu.parentId,
                    id: targetMenu.materialId, //素材id
                };
            }
            break;
        //6.外部页
        case mType[2]:
            mtl = {
                exDescribe: targetMenu.externalDescription,
                type: targetMenu.type,
                exTitle: targetMenu.externalTitle,
                exUrl: targetMenu.externalUrl,
                url: targetMenu.externalImageUrl,
                mediaId: targetMenu.mediaId,
                name: targetMenu.name,
                parentId: targetMenu.parentId,
                id: targetMenu.materialId, //素材id
            };
            break;
        //7.表单
        case mType[3]:
            mtl = {
                type: targetMenu.type,
                content: targetMenu.sheetContent,
                materialCoverId: targetMenu.materialId,
                id: targetMenu.sheetId,
                externalDescription: targetMenu.externalDescription,
                externalImageUrl: targetMenu.externalImageUrl,
                externalTitle: targetMenu.externalTitle, //标题
                name: targetMenu.name,
                parentId: targetMenu.parentId,
                extensionValueId: targetMenu.extensionValueId,
                formReplyType: targetMenu.formReplyType,
                externalUrl: targetMenu.customSheetUrl
                    ? targetMenu.customSheetUrl
                    : targetMenu.sheetUrl
                        ? targetMenu.sheetUrl
                        : targetMenu.externalUrl,
            };
            break;

        //9.菜单消息
        case mType[5]:
            mtl = {
                parentId: targetMenu.parentId,
                type: targetMenu.type,
                menuMessage: targetMenu.menuMessage,
            };
            break;
        //8.小程序卡片
        case mType[4]:
            mtl = {
                miniprogramId: targetMenu.miniprogramId,
                miniprogramAppid: targetMenu.appid,
                miniprogramTitle: targetMenu.miniprogramTitle,
                pagePath: targetMenu.pagepath,
                type: targetMenu.type,
                parentId: targetMenu.parentId,
                id: targetMenu.materialId, //素材id
                materialId: m ? m.mediaId : '',
                url: m ? m.url : '',
                name: m ? m.name : '',
            };
            break;
        // 10.原小程序
        case mType[6]:
            mtl = {
                miniprogramAppid: targetMenu.appid,
                pagePath: targetMenu.pagepath,
                type: targetMenu.type,
                parentId: targetMenu.parentId,
                weChatUrl: targetMenu.weChatUrl,
            };
            break;
    }
    return mtl;
};

/**
 * @description: 发送消息的处理
 * @param {*} editingMenu 正在编辑的内容
 * @param {*} m 组件内容
 * */
const sendMsgRender = (editingMenu, m) => {
    const menu = Object.assign({}, editingMenu);
    let mtl;
    if (menu.parentId === 0 && menu.children && menu.children.length > 0) {
        mtl = {
            menuName: menu.menuName,
            sort: menu.sort,
            type: 2,
        };
    } else {
        mtl = Object.assign({}, m);
        if ([1, 2, 3, 5].includes(m.type)) {
            mtl.type = 2;
            mtl.materialId = mtl.id;
        }

        if (mtl.type === 'text') {
            mtl.type = 3;
        }

        if (mtl.type === 8) {
            mtl = {
                type: m.type,
                appid: m.miniprogramAppid,
                pagepath: m.pagePath,
                materialId: m.id,
                miniprogramTitle: m.miniprogramTitle,
                miniprogramId: m.miniprogramId,
                url: m.url,
            };
        }

        if (mtl.type === 6) {
            mtl = {
                type: m.type,
                externalTitle: m.exTitle,
                materialId: m.id,
                externalUrl: m.exUrl,
                externalImageUrl: m.url,
                externalDescription: m.exDescribe,
            };
        }

        if (mtl.type === 7) {
            mtl.sheetContent = m.content;
            mtl.materialId = m.materialCoverId;
            mtl.sheetId = m.id;
            mtl.externalUrl = m.customSheetUrl ? m.customSheetUrl : m.sheetUrl ? m.sheetUrl : m.externalUrl;
        }

        if (mtl.type === 10) {
            mtl = {
                type: m.type,
                appid: m.miniprogramAppid,
                pagepath: m.pagePath,
                weChatUrl: m.weChatUrl,
            };
        }

        mtl.menuName = editingMenu.menuName;
    }
    return mtl;
};

// 保存前，素材结构处理
const beforeSaveMaterial = (editingMenu, mtl,radioSource) => {
    let material;

    // 网页跳转
    if (radioSource === 1) {
        material = Object.assign({}, editingMenu);
        material.type = 1;
    } else {
        // 发送消息
        material = sendMsgRender(editingMenu, mtl);
    }

    return material;
};

/**
 * @description: emoji 转换
 * @param {*} m 组件内容
 * */
const emojiRender = m => {
    const Regexp = /\{\{.+?\}/g;
    let dataList = m.content.match(Regexp);
    if (dataList) {
        for (let a = 0; a < dataList.length; a++) {
            let index = dataList[a].substring(2, dataList[a].length - 1);
            try {
                emojiList[index].dataTitle;
            } catch (e) {
                return;
            }
            m.content = m.content.replace(/<img.+?>/, emojiList[index].dataTitle);
        }
    }
};

export { cutStr, menuRender, beforeSaveMaterial, emojiRender };
