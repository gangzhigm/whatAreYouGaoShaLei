"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
let state = {
    info: {
        data: 'store data from user'
    },
    auth: {}
};
const mutations = {};
const getters = {
    info: state => state.info
};
exports.default = {
    state,
    mutations,
    actions: {},
    getters
};
