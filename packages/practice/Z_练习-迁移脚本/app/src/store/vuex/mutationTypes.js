/**
 * Created by naeemo on 2017/4/7.
 */
/**
 * 账户登录
 * @type {string}
 */
export const SET_USER_INFO = 'SET_USER_INFO';           // 设置用户信息
export const UPDATE_USER_INFO = 'UPDATE_USER_INFO';     // 更新用户信息部分字段
export const CLEAR_USER_INFO = 'CLEAR_USER_INFO';       // 清空用户信息
export const SET_AUTH_LOCK = 'SET_AUTH_LOCK';           // 设置权限锁定信息
export const SET_PLUGIN_ROUTES = 'SET_PLUGIN_ROUTES';                 // 记录路由
export const SET_TOKEN = 'SET_TOKEN';                    //短信报告接口请求所需token

// loading
export const LOADING = 'LOADING';
export const LOADED = 'LOADED';

// i18n
export const SET_LANGUAGE = 'SET_LANGUAGE';             // 设置语言
export const ADD_A_TRANSLATION = 'ADD_A_TRANSLATION';   // 添加一条翻译


/**
 * 数据看板
 */
export const SET_BOARDS = 'SET_BOARDS';
export const CHANGE_BOARDS_ORDER = 'CHANGE_BOARDS_ORDER';
export const ADD_BOARD = 'ADD_BOARD';
export const UPDATE_BOARD = 'UPDATE_BOARD';
export const REMOVE_BOARD = 'REMOVE_BOARD';

// 书签
export const SET_BOOKMARK = 'SET_BOOKMARK';
export const REMOVE_BOOKMARKS = 'REMOVE_BOOKMARKS';
export const UPDATE_BOOKMARK = 'UPDATE_BOOKMARK';
export const ADD_BOOKMARK = 'ADD_BOOKMARK';


/**
 * 评估模型
 */
export const SET_EVALUATES = 'SET_EVALUATES';

/**
 * 子状态树：事件分析
 */
// query 1/3 指标
export const ADD_MEASURE = 'ADD_MEASURE';
export const UPDATE_MEASURE = 'UPDATE_MEASURE';
export const REMOVE_MEASURE = 'REMOVE_MEASURE';
export const ADD_MEASURE_FILTER_CONDITION = 'ADD_MEASURE_FILTER_CONDITION';
export const ADD_GENERAL_FILTER_CONDITION = 'ADD_GENERAL_FILTER_CONDITION';
export const UPDATE_MEASURE_ORDERS = 'UPDATE_MEASURE_ORDERS';
// query 2/3 分组
export const ADD_GROUP = 'ADD_GROUP';
export const UPDATE_GROUP = 'UPDATE_GROUP';
export const REPLACE_GROUPS = 'REPLACE_GROUPS';
export const REMOVE_GROUP = 'REMOVE_GROUP';
export const UPDATE_GROUP_ORDERS = 'UPDATE_GROUP_ORDERS';
// query 2/3 分组
// query 3/3 筛选条件
export const UPDATE_GENERAL_FILTER = 'UPDATE_GENERAL_FILTER';
// query additional attrInfoList
export const UPDATE_ATTR_INFO_LIST = 'UPDATE_ATTR_INFO_LIST';
// 替换query，恢复书签内容、恢复本地缓存时
export const REPLACE_QUERY = 'REPLACE_QUERY';
// 设置条件下拉框是否展开
export const SHOW_SEARCH = 'SHOW_SEARCH';
export const CLOSE_SEARCH = 'CLOSE_SEARCH';


/**
 * 子状态树：Journey
 */
// 拖拽旅程
export const SET_JOURNEY = 'SET_JOURNEY';               // 录入当前正在编辑的journey对象
export const CLEAN_JOURNEY = 'CLEAN_JOURNEY';               // journey退出时清空控件详情展示id
export const UPDATE_JOURNEY = 'UPDATE_JOURNEY';         // 更新旅程
export const SET_SAVE_NOTICE = 'SET_SAVE_NOTICE';       // 旅程保存提示
export const SET_CANVAS = 'SET_CANVAS';                 // 存入拖拽旅程画布信息
export const EXPAND_CANVAS = 'EXPAND_CANVAS';           // 扩展画布尺寸
export const CHANGE_RATIO = 'CHANGE_RATIO';             // 调整缩放比例
export const CLOSE_GUIDE = 'CLOSE_GUIDE';               // 关闭指引弹出层
export const SET_LAST_UPDATE_DATE = 'SET_LAST_UPDATE_DATE'; // 设置最近一次更细时间
export const UPDATE_SAVE_TASK_STATUS = 'UPDATE_SAVE_TASK_STATUS'; // 更新保存任务状态
export const UPDATE_SAVE_JOURNEY_STATUS = 'UPDATE_SAVE_JOURNEY_STATUS'; // 更新保存旅程状态
// 控件
export const DRAGGING_NEW_CONTROLLER = 'DRAGGING_NEW_CONTROLLER';   // 记录拖拽中的新控件
export const CANCEL_NEW_CONTROLLER = 'CANCEL_NEW_CONTROLLER';       // 取消拖拽新控件
export const ADD_NEW_CONTROLLER = 'ADD_NEW_CONTROLLER';             // 添加一个新控件(拖拽完成)
export const UPDATE_CONTROLLER = 'UPDATE_CONTROLLER';               // 更新控件信息
export const SELECT_CONTROLLER = 'SELECT_CONTROLLER';               // 选中一个控件
export const CANCEL_SELECT_CONTROLLER = 'CANCEL_SELECT_CONTROLLER'; // 取消选择一个控件
export const SET_ACTIVE_CONTROLLER = 'SET_ACTIVE_CONTROLLER';       // 编辑或查看一个控件的详情
export const MOVE_CONTROLLER = 'MOVE_CONTROLLER';                   // 移动一个控件
export const DELETE_CONTROLLER = 'DELETE_CONTROLLER';               // 删除一个控件
export const SET_SUMMARY_CONTROLLER_ID = 'SET_SUMMARY_CONTROLLER_ID'; // 查看一个控件的统计信息
export const CHECK_CONTROLLER_SUMMARY_DETAIL = 'CHECK_CONTROLLER_SUMMARY_DETAIL'; // 查看一个控件的详细统计信息
export const ADD_MILESTONE = 'ADD_MILESTONE';                       // 添加一个里程牌
export const REMOVE_MILESTONE = 'REMOVE_MILESTONE';                 // 移除一个里程牌
export const PAGE_WILL_BE_DESTROY = 'PAGE_WILL_BE_DESTROY';
// 连接线
export const CREATING_ARROW = 'CREATING_ARROW';                     // 开始创建一条连接线
export const CANCEL_CREATING_ARROW = 'CANCEL_CREATING_ARROW';       // 取消创建
export const ADD_ARROW = 'ADD_ARROW';                               // 添加一条连接线
export const DELETE_ARROW = 'DELETE_ARROW';                         // 删除一条连接线
export const SET_READONLY_CONTROLLER_IDS = 'SET_READONLY_CONTROLLER_IDS';   // 定时旅程里不可编辑的控件 ids
export const SET_VALIDATION_ERROR = 'SET_VALIDATION_ERROR';         // 存入旅程校验错误信息
export const SET_START_METHOD = 'SET_START_METHOD';                 // 保存实时旅程的处理方式
export const SET_TEST_SWARM_ID = 'SET_TEST_SWARM_ID';               // 实时旅程-测试-保存用户测试分群id
export const UPDATE_CHECK = 'UPDATE_CHECK';                         // 更新是否处于查看状态
export const UPDATE_PANEL_AUTHORIZERINFO_ID = 'UPDATE_PANEL_AUTHORIZERINFO_ID';   // 旅程左侧所选公众号

// 微前端状态库
export const SET_APP_ERR = 'SET_APP_ERR'; // 存入子应用挂载异常状态
export const RESET_APP_ERR = 'RESET_APP_ERR'; // 重置子应用挂载异常状态

export const SWITCH_SIDE_BAR = 'SWITCH_SIDE_BAR'; // 切换侧边栏全局折叠状态
export const SHOW_SIDE_BAR = 'SHOW_SIDE_BAR'; // 切换侧边栏全局折叠状态