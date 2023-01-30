"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
const vue_property_decorator_1 = require("vue-property-decorator");
/**
 * Mixin test
 *
 * @export
 * @class TestMixin
 * @extends {Vue}
 */
let TestMixin = class TestMixin extends vue_property_decorator_1.Vue {
    constructor() {
        super(...arguments);
        this.testMixinArg = 'this is test mixin arg';
    }
    testMixinFunc() {
        console.log('this string is from test mixin console.log');
    }
};
TestMixin = __decorate([
    (0, vue_property_decorator_1.Component)({})
], TestMixin);
exports.default = TestMixin;
