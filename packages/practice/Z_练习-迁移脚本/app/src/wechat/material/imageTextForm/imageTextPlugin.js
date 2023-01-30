//图文素材编辑页-富文本编辑器-自定义插件
import $ from 'jquery';
import { MATERIAL_STORE, SET_TEXTCOLOR, SET_BGCOLOR } from '@/store/vuex/modules/imgTextStore';

// 获取 wangEditor 构造函数
let E = window.wangEditor;
// 文字颜色
export function textColorPickerMenu(editor,store) {
    let loadNum = 0;
    E.createMenu(() => {
        loadNum++;
        if (loadNum === 1) {
            let menuId = 'fontcolor';
            let lang = editor.config.lang;
            
            // 创建 menu 对象
            let menu = new E.Menu({
                editor: editor,
                id: menuId,
                title: lang.forecolor,
                $domNormal: $('<a href="#" tabindex="-1"><i class="wangeditor-menu-img-pencil"></i></a>'),
                $domSelected: $('<a href="#" tabindex="-1" class="selected"><i class="wangeditor-menu-img-pencil"></i></a>')
            });
            menu.$domSelected.click(() => {
                let rgba = $(editor.getRangeElem()).css('color');
                let rgbaArr = rgba.slice(4,-1).split(', ');
                let color = '#';
                rgbaArr.forEach(str => {
                    let code = Number(str).toString(16);
                    if (code.length < 2) {
                        code = '0' + code;
                    }
                    color += code;
                });
                store.commit(SET_TEXTCOLOR, color);
            });
            
            // 创建 dropPanel
            let $content = $('<div></div>');
            $content.append($('.pick-color'));
            $('#editor').mousedown(e => {
                if ($content.parent().css('display') === 'block') e.preventDefault();
            });
            $(document).mouseup(e => {
                let panel = $content.parent();
                setTimeout(() => {
                    if (store.state[MATERIAL_STORE] &&
                        store.state[MATERIAL_STORE].textColor &&
                        panel.css('display') === 'none' &&
                        !panel.find(e.target).length) {
                        // 执行命令
                        let commandValue = store.state[MATERIAL_STORE].textColor;
                        if (menu.selected && editor.isRangeEmpty()) {
                            // 当前处于选中状态，并且选中内容为空
                            editor.commandForElem('font[color]', e, 'forecolor', commandValue);
                        } else {
                            // 当前未处于选中状态，或者有选中内容。则执行默认命令
                            editor.command(e, 'forecolor', commandValue);
                        }
                        store.commit(SET_TEXTCOLOR, '');
                    }
                },100);
            });
            menu.dropPanel = new E.DropPanel(editor, menu, {
                $content: $content,
                width: 263,
                height: 320
            });
            
            // 定义 update selected 事件
            menu.updateSelectedEvent = () => {
                let rangeElem = editor.getRangeElem();
                rangeElem = editor.getSelfOrParentByName(rangeElem, 'font[color]');
                if (rangeElem) {
                    return true;
                }
                return false;
            };
            
            // 增加到editor对象中
            editor.menus[menuId] = menu;
        }
    });
}

// 背景颜色
export function bgColorPickerMenu(editor,store) {
    let loadNum = 0;
    E.createMenu(() => {
        loadNum++;
        if (loadNum === 1) {
            let menuId = 'bgfontcolor';
            let lang = editor.config.lang;
            
            // 检查元素是否有 background-color: 内联样式
            let checkElemFn = (elem) => {
                let cssText;
                if (elem && elem.style && elem.style.cssText != null) {
                    cssText = elem.style.cssText;
                    if (cssText && cssText.indexOf('background-color:') >= 0) {
                        return true;
                    }
                }
                return false;
            };
            
            // 创建 menu 对象
            let menu = new E.Menu({
                editor: editor,
                id: menuId,
                title: lang.bgcolor,
                $domNormal: $('<a href="#" tabindex="-1"><i class="wangeditor-menu-img-brush"></i></a>'),
                $domSelected: $('<a href="#" tabindex="-1" class="selected"><i class="wangeditor-menu-img-brush"></i></a>')
            });
            menu.$domSelected.click(() => {
                let rgba = $(editor.getRangeElem()).css('background-color');
                let rgbaArr = rgba.slice(4,-1).split(', ');
                let color = '#';
                rgbaArr.forEach(str => {
                    let code = Number(str).toString(16);
                    if (code.length < 2) {
                        code = '0' + code;
                    }
                    color += code;
                });
                store.commit(SET_BGCOLOR, color);
            });
            
            // 创建 dropPanel
            let $content = $('<div></div>');
            $content.append($('.pick-color-bg'));
            $('#editor').mousedown(e => {
                if ($content.parent().css('display') === 'block') e.preventDefault();
            });
            $(document).mouseup(e => {
                let panel = $content.parent();
                setTimeout(() => {
                    if (store.state[MATERIAL_STORE] &&
                        store.state[MATERIAL_STORE].bgColor &&
                        panel.css('display') === 'none' &&
                        !panel.find(e.target).length) {
                        // 执行命令
                        let commandValue = store.state[MATERIAL_STORE].bgColor;
                        if (menu.selected && editor.isRangeEmpty()) {
                            // 当前处于选中状态，并且选中内容为空。使用 commandForElem 执行命令
                            editor.commandForElem({
                                selector: 'span,font',
                                check: checkElemFn
                            }, e, 'BackColor', commandValue);
                        } else {
                            // 当前未处于选中状态，或者有选中内容。则执行默认命令
                            editor.command(e, 'BackColor', commandValue);
                        }
                        store.commit(SET_BGCOLOR, '');
                    }
                },100);
            });
            menu.dropPanel = new E.DropPanel(editor, menu, {
                $content: $content,
                width: 263,
                height: 320
            });
            
            // 定义 update selected 事件
            menu.updateSelectedEvent = () => {
                let rangeElem = editor.getRangeElem();
                rangeElem = editor.getSelfOrParentByName(rangeElem, 'span,font', checkElemFn);
                if (rangeElem) {
                    return true;
                }
                return false;
            };
            
            // 增加到editor对象中
            editor.menus[menuId] = menu;
        }
    });
}

// 隐藏原本hover时的toolbar，设置自定义链接hover
export function linkHoverPlugin(editor,t,modifyMini) {
    let $txt = $('#editor');    //编辑区域
    let $currentLink;   //当前hover的链接
    
    let $toolbar = $('<div class="link-hover"></div>');
    let $hoverContent = $('<div>' +
        '            <span class="hover-info"></span>' +
        '            <input type="button"' +
        '                   class="btn hover-btn btn-modify"' +
        '                   value="' + t('form.modify') + '"/>' +
        '            <input type="button"' +
        '                   class="btn hover-btn btn-del"' +
        '                   value="' + t('wechatContent.clean') + '"/>' +
        '        </div>');
    let $hoverTit = $hoverContent.find('.hover-info');
    let $hoverModifyBtn = $hoverContent.find('.btn-modify');
    let $hoverDelBtn = $hoverContent.find('.btn-del');
    let isRendered;     //弹窗init
    let isShow = false;     //记录当前的显示/隐藏状态
    let showTimeoutId, hideTimeoutId, showTimeoutIdByToolbar;   //延时显示/隐藏hover弹窗
    
    //修改和清除按钮
    $hoverDelBtn.click(() => {
        $currentLink.replaceWith($currentLink.html());
        $toolbar.hide();
    });
    $hoverModifyBtn.click(() => {
        if ($currentLink.hasClass('mini-program')) {
            // 小程序修改(文字和图片)
            let isImage = $currentLink.find('img');
            let miniData = {
                insertType: isImage.length ? 'image' : 'text',
                title: isImage.length ? '' : $currentLink.text(),
                appid: $currentLink.attr('data-miniprogram-appid'),
                appPath: $currentLink.attr('data-miniprogram-path'),
                alternatePage: isImage.length ? '' : $currentLink.attr('href'),
                name: isImage.length ? isImage.attr('data-name') : '',
                date: isImage.length ? isImage.attr('data-date') : '',
                url: isImage.length ? isImage.attr('src') : ''
            };
            modifyMini(miniData,$currentLink);
        } else {
            // 普通链接修改
            editor.restoreSelectionByElem($currentLink.get(0));
            setTimeout(() => {
                editor.menus['link'].clickEvent();
            },30);
        }
        $toolbar.hide();
    });
    
    // 渲染 dom
    function render() {
        if (isRendered) {
            return;
        }
        $toolbar.append($hoverContent);
        $('.wangEditor-container').append($toolbar);
        isRendered = true;
    }
    
    // 定位
    function setPosition() {
        if (!$currentLink) {
            return;
        }
        let position = $currentLink.position();
        let left = position.left;
        let top = position.top;
        let height = $currentLink.height();
        // 初步计算top值
        let topResult = top + height;
        // 判断 toolbar 是否超过了编辑器区域的下边界
        let menuHeight = $('.wangEditor-menu-container').height();
        let txtHeight = $txt.outerHeight();
        if (topResult > menuHeight + txtHeight) {
            topResult = menuHeight + txtHeight;
        }
        $toolbar.css({
            top: topResult,
            left: left
        });
    }
    
    // 显示 toolbar
    function show() {
        if (isShow) {
            return;
        }
        if (!$currentLink) {
            return;
        }
        // 设置链接
        let href = $currentLink.attr('href');
        let appPath = $currentLink.attr('data-miniprogram-path') || '';
        $hoverTit.html(appPath || href);
        //初始化并显示hover弹窗
        render();
        $toolbar.show();
        // 定位
        setPosition();
        isShow = true;
    }
    
    // 隐藏 toolbar
    function hide() {
        if (!isShow) {
            return;
        }
        if (!$currentLink) {
            return;
        }
        $toolbar.hide();
        isShow = false;
    }
    
    // $txt 绑定事件
    $txt.on('mouseenter', 'a', function (e) {
        // 延时 300ms 显示toolbar
        if (showTimeoutId) {
            clearTimeout(showTimeoutId);
        }
        showTimeoutId = setTimeout(() => {
            $currentLink = $(e.currentTarget);
            let $img = $currentLink.children('img');
            if ($img.length) {
                // 图片点击时，隐藏toolbar
                $img.click(() => {
                    hide();
                });
                if ($img.hasClass('clicked')) {
                    // 图片还处于clicked状态，则不显示toolbar
                    return;
                }
            }
            show();
        }, 300);
    }).on('mouseleave', 'a', () => {
        // 延时 300ms 隐藏toolbar
        if (hideTimeoutId) {
            clearTimeout(hideTimeoutId);
        }
        hideTimeoutId = setTimeout(hide, 300);
    })
        .on('click keydown scroll', () => {
            setTimeout(hide, 100);
        });
    // $toolbar 绑定事件
    $toolbar.on('mouseenter', () => {
        // 先中断掉 $txt.mouseleave 导致的隐藏
        if (hideTimeoutId) {
            clearTimeout(hideTimeoutId);
        }
    }).on('mouseleave', () => {
        // 延时 300ms 显示toolbar
        if (showTimeoutIdByToolbar) {
            clearTimeout(showTimeoutIdByToolbar);
        }
        showTimeoutIdByToolbar = setTimeout(hide, 300);
    });
}
