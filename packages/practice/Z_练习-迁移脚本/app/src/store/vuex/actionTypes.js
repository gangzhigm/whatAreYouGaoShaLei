/**
 * Created by naeemo on 2017/4/7.
 */
export const RECOVER_USER_INFO = 'RECOVER_USER_INFO';
export const SIGN_IN = 'SIGN_IN';           // 主动登录
export const SIGNED_IN = 'SIGNED_IN';       // 被动登录（其他标签页登录时，解锁当前视图）
export const SIGN_OUT = 'SIGN_OUT';         // 主动登出
export const SIGNED_OUT = 'SIGNED_OUT';     // 锁定当前视图（其它标签页登出, 访问接口403, etc）
export const LOGIN_IN = 'LOGIN_IN';         // 其他 tab 页，login页登录操作
export const UPDATE_ACCOUNT_BALANCE = 'UPDATE_ACCOUNT_BALANCE';           // 更新账户余量
export const UPDATE_WECHAT_ACCOUNT_INFO = 'UPDATE_WECHAT_ACCOUNT_INFO';   // 更新微信公众号授权信息
export const UPDATE_MINI_PROGRAM_INFO = 'UPDATE_MINI_PROGRAM_INFO'; //更新小程序授权信息
export const GET_TOKEN = 'GET_TOKEN';           // 获取短信报告token
export const UPDATE_MENU_AUTH = 'UPDATE_MENU_AUTH';     // 更新菜单权限
export const FETCH_BOARDS = 'FETCH_BOARDS';   // 看板
export const FETCH_BOOKMARKS = 'FETCH_BOOKMARKS';
export const FETCH_EVALUATES = 'FETCH_EVALUATES';

// journey 相关
export const RESTORE_JOURNEY = 'RESTORE_JOURNEY';
export const CLEAR_JOURNEY_STORE = 'CLEAR_JOURNEY_STORE';
export const CLEAR_JOURNEY_CONTROLLER = 'CLEAR_JOURNEY_CONTROLLER';
export const SAVE_JOURNEY = 'SAVE_JOURNEY';
export const CHECK_JOURNEY_NEW_VERSION = 'CHECK_JOURNEY_NEW_VERSION';
export const COMPLETE_DRAGGING_NEW_CONTROLLER = 'COMPLETE_DRAGGING_NEW_CONTROLLER'; // 拖拽新增控件
export const CHECK_CONTROLLER_SUMMARY = 'CHECK_CONTROLLER_SUMMARY'; // 查看一个控件的统计信息
export const REFRESH_TASKS = 'REFRESH_TASKS';

// i18n
export const RECOVER_LANGUAGE = 'RECOVER_LANGUAGE';
export const LOAD_LANGUAGE = 'LOAD_LANGUAGE';

export const RESTORE_SIDE_BAR = 'RESTORE_SIDE_BAR'; // 恢复侧边栏全局折叠状态
