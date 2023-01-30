import { WebServiceApiV1, WebServiceBookmarkApiV1, WebServGradeApiV1 } from '@/api';
import {
    ADD_BOARD,
    ADD_BOOKMARK,
    CHANGE_BOARDS_ORDER,
    CLOSE_SEARCH,
    REMOVE_BOARD,
    REMOVE_BOOKMARKS,
    SET_BOARDS,
    SET_BOOKMARK,
    SET_EVALUATES,
    SHOW_SEARCH,
    UPDATE_BOARD,
    UPDATE_BOOKMARK
} from '@/store/vuex/mutationTypes';
import {FETCH_BOARDS, FETCH_BOOKMARKS, FETCH_EVALUATES} from '@/store/vuex/actionTypes';

export const ANALYSIS_STORE_NAME = 'ANALYSIS_STORE_NAME';

/**
 * 前端生成字段 key 时，需要的前缀
 */
export const KEY_PREFIXES = {
    EVENT_MEASURE: 'event_measure_',        // 事件指标
    EVALUATE_MEASURE: 'evaluate_measure_',  // 评估指标
    EVALUATE: 'evaluate_',                  // 评估内分值
    USER_ATTR: 'user_',                     // 用户属性
    EVENT_ATTR: 'event_',                   // 事件属性
    USER_GROUP: 'group_',                   // 用户分群
};


export default {
    state: {
        boards: [],         // 数据看板
        boardsOrder: 'updateTimeReverse', // 数据看板的排序：updateTime:按更新时间由近及远 updateTimeReverse:按更新时间由远及近 createTime:按创建时间由远及近 createTimeReverse:按创建时间由远及近
        bookmarks: [],  // 书签列表
        evaluates: [],  // 评估模型列表
        isDropdownSearch: false,
    },
    mutations: {
        [SET_BOARDS](state, boards) {
            state.boards = boards;
        },
        [CHANGE_BOARDS_ORDER](state, order) {
            state.boardsOrder = order;
        },
        [ADD_BOARD](state, newBoard) {
            state.boards.push(newBoard);
        },
        [UPDATE_BOARD](state, board) {
            const idx = state.boards.findIndex(b => b.id === board.id);
            state.boards.splice(idx, 1, board);
        },
        [REMOVE_BOARD](state, id) {
            state.boards.$deleteByKey(id);
        },
        [REMOVE_BOOKMARKS](state, id) {
            state.bookmarks.$deleteByKey(id);
        },
        [SET_BOOKMARK](state, bookmarks) {
            state.bookmarks = bookmarks;
        },
        [ADD_BOOKMARK](state, bookmark) {
            state.bookmarks.unshift(bookmark);
        },
        [UPDATE_BOOKMARK](state, bookmark) {
            const index = state.bookmarks.findIndex(b => b.id === bookmark.id);
            if (index !== -1) {
                state.bookmarks.splice(index, 1, bookmark);
            }
        },
        [SET_EVALUATES](state, evaluates) {
            state.evaluates = evaluates;
        },
        [SHOW_SEARCH](state) {
            state.isDropdownSearch = true;
        },
        [CLOSE_SEARCH](state) {
            state.isDropdownSearch = false;
        },
    },
    actions: {
        [FETCH_BOOKMARKS]({commit}) {
            return WebServiceBookmarkApiV1
                .getBookmarks()
                .then(({body: {data: {bookmarks}}}) => {
                    commit(SET_BOOKMARK, bookmarks);
                });
        },
        [FETCH_BOARDS]({commit, state}) {
            return WebServiceApiV1
                .getBoards(0, state.boardsOrder)
                .then(({body: {data: {boards}}}) => {
                    commit(SET_BOARDS, boards);
                });
        },
        [FETCH_EVALUATES]({commit}) {
            return WebServGradeApiV1
                .getScoreEvalList()
                .then(({body: {data: {evaluates}}}) => {
                    // 1.2 评估模型
                    evaluates = evaluates.filter(item => {
                        if (item.calculates.length) {
                            return true;
                        }
                        console.error('这个评估定义没有包含 calculates :');
                        return false;
                    });
                    evaluates.forEach(evaluate => {
                        evaluate.key = KEY_PREFIXES.EVALUATE_MEASURE + evaluate.id;
                        evaluate.attributes.forEach(attribute => {
                            if (attribute.name === 'evaluate_value') {
                                attribute.attrGenre = evaluate.valueType === 'text' ? 0 : 1;
                            } else if (attribute.name === 'evaluate_name') {
                                attribute.attrGenre = 0;
                            } else {
                                console.error('evaluate.attributes 里出现了 评估值、评估定义显示名称 之外的内容：', attribute);
                            }
                            // notice: overwrite attribute.name
                            attribute._name = attribute.name;
                            attribute.name = attribute.meaning;
                            attribute.key = KEY_PREFIXES.EVALUATE + attribute.id;
                        });
                    });
                    commit(SET_EVALUATES, evaluates);
                });
        }
    }
};
