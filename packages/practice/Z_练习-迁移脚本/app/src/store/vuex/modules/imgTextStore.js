/**
 * Created by naeemo on 2017/6/6.
 */

import Vue from 'vue';

// store name
export const MATERIAL_STORE = 'MATERIAL_STORE';

// mutations
const SET_MATERIALS = 'SET_MATERIALS';
const SET_MAINID = 'SET_MAINID';
export const SET_ACTIVE_MATERIAL = 'SET_ACTIVE_MATERIAL';
export const SORT_UP = 'SORT_UP';
export const SORT_DOWN = 'SORT_DOWN';
export const DELETE_A_SUB_MATERIAL = 'DELETE_A_SUB_MATERIAL';   // 删除一个子素材
export const SET_COVER_IMG = 'SET_COVER_IMG';       // 图文消息更换封面
const VALIDATE_WARN = 'VALIDATE_WARN';
const VALIDATE_PASS = 'VALIDATE_PASS';
export const SAVE_MATERIAL = 'SAVE_MATERIAL';
export const SAVED_MATERIAL = 'SAVED_MATERIAL';
export const RESET_MATERIAL = 'RESET_MATERIAL';
export const SET_TEXTCOLOR = 'SET_TEXTCOLOR';
export const SET_BGCOLOR = 'SET_BGCOLOR';
export const SET_ACTIVE = 'SET_ACTIVE';

// actions
export const GET_MATERIALS = 'GET_MATERIALS';           // 获取素材列表
export const ADD_NEW_MATERIAL = 'ADD_NEW_MATERIAL';     // 添加一个子素材
export const SAVE_AND_QUIT = 'SAVE_AND_QUIT';
import { WechatApiV1 } from '@/api';

// 自动保存
const Guard = {
    _guard(e) {
        let confirmationMessage = '现在离开，图文消息将会丢失';

        (e || window.event).returnValue = confirmationMessage;     //Gecko + IE
        return confirmationMessage; //Webkit, Safari, Chrome etc.
    },
    activate() {
        window.addEventListener('beforeunload', Guard._guard);
    },
    deactivate() {
        window.removeEventListener('beforeunload', Guard._guard);
    }
};

const VALIDATION_KEYS = ['title', 'thumbMediaUrl'];

function validate(material) {
    let result = true;
    for (let key of VALIDATION_KEYS) {
        if (!(result = result && material[key])) break;
    }
    return result;
}

function materialHandler (mainMaterial) {
    const materials = mainMaterial.materialItems.sort((a, b) => a.sort - b.sort);
    delete mainMaterial.materialItems;
    mainMaterial.sort = 0;
    materials.unshift(mainMaterial);
    materials.map(material => {
        for (let key in material) {
            if (material[key] === null) material[key] = '';
        }
        material.invalid = false;
        return material;
    });
    return materials;
}

export default {
    state: {
        materials: [{
            author: '',
            content: '',
            contentSourceUrl: '',
            digest: '',
            id: '',
            mediaId: '',
            name: '',
            showCoverPic: 1,
            thumbMediaId: '',
            title: '',
            type: 4,
            updateDate: '',
            url: ''
        }],
        activeId: '',
        mainId: '',
        textColor: '',
        bgColor: '',
        isActive: false
    },
    mutations: {
        [RESET_MATERIAL](state) {
            state.activeId = '';
            state.mainId = '';
            state.isActive = false;
            state.materials = [{
                author: '',
                content: '',
                contentSourceUrl: '',
                digest: '',
                id: '',
                mediaId: '',
                name: '',
                showCoverPic: 1,
                thumbMediaId: '',
                title: '',
                type: 4,
                updateDate: '',
                url: ''
            }];
        },
        [SET_MATERIALS](state, materials) {
            state.materials = materials;
        },
        [SET_MAINID](state, mainId) {
            state.mainId = mainId;
        },
        [SET_ACTIVE_MATERIAL](state, id) {
            state.activeId = id;
        },
        [DELETE_A_SUB_MATERIAL](state, id) {
            state.materials.$deleteByKey(id);
            WechatApiV1
                .delSubMaterial(id);
        },
        [SET_ACTIVE](state, isActive) {
            state.isActive = isActive;
        },
        [SAVED_MATERIAL](state, {index, newMaterial}) {
            state.materials.splice(index, 1, newMaterial);
        },
        [SET_COVER_IMG](state, material) {
            const target = state.materials.$getByKey(state.activeId);
            Vue.set(target, 'thumbMediaId', material.mediaId);
            Vue.set(target, 'thumbMediaUrl', material.url);
        },
        [VALIDATE_WARN](state, material) {
            const target = state.materials.$getByKey(material.id);
            Vue.set(target, 'invalid', true);
        },
        [VALIDATE_PASS](state, material) {
            const target = state.materials.$getByKey(material.id);
            Vue.set(target, 'invalid', false);
        },
        [SET_TEXTCOLOR](state, textColor) {
            state.textColor = textColor;
        },
        [SET_BGCOLOR](state, bgColor) {
            state.bgColor = bgColor;
        },
    },
    actions: {
        [GET_MATERIALS]({commit}, { materialId }) {
            if (materialId) {
                WechatApiV1
                    .getMaterial(materialId)
                    .then(({body: {data: {material: mainMaterial}}}) => {
                        commit(SET_MATERIALS, materialHandler(mainMaterial));
                        commit(SET_MAINID, mainMaterial.id);
                        commit(SET_ACTIVE_MATERIAL, materialId);
                        commit(SET_ACTIVE, false);
                        // 离开拦截
                        // Guard.activate()
                    });
            }
        },
        [ADD_NEW_MATERIAL]({state, commit}) {
            const materialsCopy = state.materials.slice();
            const newMaterial = {
                author: '',
                content: '',
                contentSourceUrl: '',
                digest: '',
                id: '',
                mediaId: '',
                name: '',
                showCoverPic: 1,
                thumbMediaId: '',
                title: '',
                type: 4,
                updateDate: '',
                url: '',
                sort: state.materials.length
            };
            materialsCopy.push(newMaterial);
            commit(SET_MATERIALS, materialsCopy);

            WechatApiV1
                .createSubMaterial(state.mainId)  // 主素材id
                .then(res => {
                    const materialJustCreate = Object.assign({}, newMaterial, {id: res.body.data.id});
                    const materialsCopy = state.materials.slice();
                    materialsCopy.pop();
                    materialsCopy.push(materialJustCreate);
                    commit(SET_MATERIALS, materialsCopy);
                });
        },
        [SAVE_AND_QUIT]({state, commit}) {
            return new Promise(function (resolve, reject) {
                // 1. 校验各个子素材
                for (let material of state.materials) {
                    if (!validate(material)) {
                        commit(VALIDATE_WARN, material);
                        reject();
                        return;
                    }
                }

                // 2. 同步整个图文消息到微信
                WechatApiV1
                    .syncImgTextToWechat(state.mainId)
                    .then(() => {
                        resolve();
                    });
                // 3. deactivate leave guard
                Guard.deactivate();
            });
        },
        [SAVE_MATERIAL]({state, commit}, newMaterial) {
            return new Promise((resolve) => {
                const index = state.materials.map(material => material.id)
                    .indexOf(newMaterial.id);
                if (validate(newMaterial)) newMaterial.invalid = false;
                if (index !== -1) {
                    commit(SAVED_MATERIAL, {index: index, newMaterial: newMaterial});
                    //预览不添加保存
                    WechatApiV1
                        .saveImgTextMaterial(newMaterial)
                        .then(() => {
                            resolve();
                        });
                }
            });
        },
        [SORT_UP]({state, commit, dispatch}, { index, id, material }) {
            commit(SET_ACTIVE, true);
            dispatch(SAVE_MATERIAL, material)
                .then(() => {
                    const top = state.materials[index - 1];
                    const down = state.materials[index];
        
                    WechatApiV1.sortSubMaterials(top, down)
                        .then(() => {
                            dispatch(GET_MATERIALS, {materialId: id });
                        });
                });
        },
        [SORT_DOWN]({state, commit, dispatch}, {index, id, material }) {
            commit(SET_ACTIVE, true);
            dispatch(SAVE_MATERIAL, material)
                .then(() => {
                    const top = state.materials[index];
                    const down = state.materials[index + 1];
        
                    WechatApiV1
                        .sortSubMaterials(top, down)
                        .then(() => {
                            dispatch(GET_MATERIALS, {materialId: id });
                        });
                });
        }
    }
};
