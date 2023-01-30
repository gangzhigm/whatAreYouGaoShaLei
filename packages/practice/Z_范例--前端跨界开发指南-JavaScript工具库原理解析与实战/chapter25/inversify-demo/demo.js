"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const inversify_config_1 = require("./inversify.config");
const types_1 = require("./types");
const ninja = inversify_config_1.myContainer.get(types_1.TYPES.Warrior);
console.log(ninja.fight(), '期望结果: cut!');
console.log(ninja.sneak(), '期望结果: hit!');
