"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const vue_1 = __importDefault(require("vue"));
const vuex_1 = __importDefault(require("vuex"));
const user_1 = __importDefault(require("./modules/user"));
vue_1.default.use(vuex_1.default);
const store = new vuex_1.default.Store({
    modules: {
        user: user_1.default
    }
});
exports.default = store;
