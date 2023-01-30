#!/usr/bin/env node
"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TEXT = exports.GITGNORE = exports.PLUGIN_LIST = exports.MODEL_LIST = exports.SHORT_SENTENCE = exports.SYMBOL = void 0;
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const model_json_1 = __importDefault(require("../lib/model.json"));
const symbol_json_1 = __importDefault(require("../lib/symbol.json"));
const child_process_1 = __importDefault(require("child_process"));
const chapters_json_1 = __importDefault(require("../lib/chapters.json"));
const gitgnore_json_1 = __importDefault(require("../lib/gitgnore.json"));
const SYMBOL = symbol_json_1.default.symbol;
exports.SYMBOL = SYMBOL;
const MODEL_LIST = model_json_1.default.model;
exports.MODEL_LIST = MODEL_LIST;
const PLUGIN_LIST = model_json_1.default.plugin;
exports.PLUGIN_LIST = PLUGIN_LIST;
const GITGNORE = Object.keys(gitgnore_json_1.default);
exports.GITGNORE = GITGNORE;
const SHORT_SENTENCE = symbol_json_1.default.shortSentence;
exports.SHORT_SENTENCE = SHORT_SENTENCE;
const OBJ = {
    path: './',
    name: '',
    deep: 1,
    type: 'directory',
    objItemFileTreeMd: '',
    children: []
};
const TEXT = [
    chapters_json_1.default['preface'],
    chapters_json_1.default['one'],
    chapters_json_1.default['two'],
    chapters_json_1.default['three'],
    chapters_json_1.default['four'],
    chapters_json_1.default['five'],
    chapters_json_1.default['six'],
    chapters_json_1.default['seven'],
    chapters_json_1.default['eight'],
    chapters_json_1.default['nine'],
    chapters_json_1.default['ten'],
    chapters_json_1.default['eleven'],
    chapters_json_1.default['twelve'],
    chapters_json_1.default['thirteen']
];
exports.TEXT = TEXT;
let originPath = '';
let fileTreeArray = [];
let packageDevdependencies = {};
function displayFileOne() {
    // 1.赋值项目名
    TEXT[0][0] += path_1.default.resolve(SYMBOL[0]).substring(path_1.default.resolve(SYMBOL[0]).lastIndexOf(SYMBOL[7]) + 1, path_1.default.resolve(SYMBOL[0]).length);
    // 2.赋值目录名
    const chapterArray = [].concat(TEXT);
    chapterArray.splice(0, 1);
    for (let [index, item] of chapterArray.entries()) {
        TEXT[0].splice(TEXT[0].length - 1, 0, `${SYMBOL[6]}`);
        TEXT[0].splice(TEXT[0].length - 1, 0, `${SYMBOL[8]}${chapterArray[index][2].substring(chapterArray[index][2].indexOf(SYMBOL[2]) + SYMBOL[2].length, chapterArray[index][2].lastIndexOf(SYMBOL[2]))}${SYMBOL[9]}${chapterArray[index][1].substring(chapterArray[index][1].lastIndexOf(SYMBOL[1]) + SYMBOL[1].length, chapterArray[index][1].length)}${SYMBOL[10]}`);
        TEXT[0].splice(TEXT[0].length - 1, 0, `${SYMBOL[6]}`);
    }
    // 3.赋值开发语言
    if (Object.keys(packageDevdependencies).length === 0) {
        TEXT[3].push(`${SYMBOL[11]}[语言名]${SYMBOL[12]}[版本号]`);
        TEXT[3].push(SYMBOL[6]);
    }
    for (let i of Object.keys(packageDevdependencies)) {
        if (MODEL_LIST.find((item) => item[0] === i)) {
            const VERSION = packageDevdependencies[i].indexOf('^') === 0
                ? packageDevdependencies[i].substring(1)
                : packageDevdependencies[i];
            TEXT[3].push(`${SYMBOL[11]}${i}${SYMBOL[12]}${VERSION}${SYMBOL[13]}${MODEL_LIST.find((item) => item[0] === i)[1]}`);
            TEXT[3].push(SYMBOL[6]);
        }
    }
    // 4.赋值分支
    const BRANCH = child_process_1.default.execSync(SHORT_SENTENCE[0])
        .toString()
        .split('\n')
        .filter((item) => item.includes('remotes/origin/') && !item.includes(' -> '))
        .map((item) => item.substring(item.lastIndexOf(SYMBOL[15]) + SYMBOL[15].length, item.length));
    for (let i of BRANCH) {
        TEXT[4].push(SYMBOL[6]);
        TEXT[4].push(`${SYMBOL[11]}${i}`);
        TEXT[4].push(SHORT_SENTENCE[2]);
        TEXT[4].push(SYMBOL[6]);
    }
    // 10.赋值第三方插件
    if (Object.keys(packageDevdependencies).length === 0) {
        TEXT[10].push(`<<<<-`);
        TEXT[10].push(`${SYMBOL[11]}[插件名]${SYMBOL[12]}[版本号]`);
        TEXT[10].push(`|`);
        TEXT[10].push(`此项目无第三方插件`);
        TEXT[10].push(`->>>>`);
        TEXT[10].push(SYMBOL[6]);
    }
    for (let i of Object.keys(packageDevdependencies)) {
        if (PLUGIN_LIST.find((item) => item[0] === i)) {
            const VERSION = packageDevdependencies[i].indexOf('^') === 0
                ? packageDevdependencies[i].substring(1)
                : packageDevdependencies[i];
            TEXT[10].push(`${SYMBOL[11]}${i}${SYMBOL[12]}${VERSION}${SYMBOL[13]}${PLUGIN_LIST.find((item) => item[0] === i)[1]}`);
            TEXT[10].push(SYMBOL[6]);
        }
    }
    // 5.赋值文件路径
    displayFile(OBJ);
    let fileTreeRegex = '';
    const FIRE_TREE_INTERVAL = setInterval(() => {
        if (fileTreeRegex === JSON.stringify(fileTreeArray)) {
            clearInterval(FIRE_TREE_INTERVAL);
            let mdItemLen = 0;
            for (let i of fileTreeArray) {
                mdItemLen = i.length > mdItemLen ? i.length : mdItemLen;
            }
            for (let i = 0; i < mdItemLen; i++) {
                for (let j = fileTreeArray.length - 1; j >= 0; j--) {
                    if (fileTreeArray[j][i] === SYMBOL[19]) {
                        for (let z = j - 1; z >= 0; z--) {
                            if (fileTreeArray[z][i] &&
                                fileTreeArray[z][i] !== SYMBOL[6] &&
                                fileTreeArray[z][i] !== SYMBOL[20]) {
                                break;
                            }
                            if (fileTreeArray[z][i] === SYMBOL[6]) {
                                const TEMPORARY_ARRAY = fileTreeArray[z].split('');
                                TEMPORARY_ARRAY[i] = SYMBOL[21];
                                fileTreeArray[z] = TEMPORARY_ARRAY.join('');
                            }
                        }
                    }
                }
            }
            for (let i = 0; i < fileTreeArray.length; i++) {
                fileTreeArray[i] += SYMBOL[22];
            }
            TEXT[5] = TEXT[5].concat(fileTreeArray);
            TEXT[5].push(SYMBOL[16]);
            TEXT[5].push(SYMBOL[6]);
            writeFile();
        }
        else {
            fileTreeRegex = JSON.stringify(fileTreeArray);
        }
    }, 1000);
}
function writeFile() {
    fs_1.default.writeFileSync(SHORT_SENTENCE[3], '', SHORT_SENTENCE[4]);
    for (let i of TEXT) {
        for (let j of i) {
            fs_1.default.appendFileSync(SHORT_SENTENCE[3], `${j}${SYMBOL[14]}`, SHORT_SENTENCE[4]);
        }
    }
}
function displayFile(objTree) {
    // 生成绝对路径
    const PARAMS = objTree.path.indexOf(SYMBOL[0]) === 0 ? path_1.default.resolve(objTree.path) : objTree.path;
    // 循环检索路径
    fs_1.default.stat(PARAMS, function (err, stats) {
        if (err) {
            throw err;
        }
        if (GITGNORE.filter((item) => PARAMS === `${originPath}${SYMBOL[7]}${item}` ||
            PARAMS.indexOf(`${originPath}${SYMBOL[7]}${item}${SYMBOL[7]}`) === 0).length === 0) {
            if (OBJ.name === '') {
                originPath = PARAMS;
            }
            let objFileTree = '';
            if (objTree.deep === 1) {
                objFileTree = `${PARAMS.substring(PARAMS.lastIndexOf(SYMBOL[7]) + 1, PARAMS.length)}`;
            }
            else if (objTree.isLast && objTree.isLast === true) {
                objFileTree = `${SYMBOL[5]}${PARAMS.substring(PARAMS.lastIndexOf(SYMBOL[7]) + 1, PARAMS.length)}`;
            }
            else {
                objFileTree = `${SYMBOL[4]}${PARAMS.substring(PARAMS.lastIndexOf(SYMBOL[7]) + 1, PARAMS.length)}`;
            }
            for (let i = 2; i < PARAMS.replace(originPath, '').split(SYMBOL[7]).length; i++) {
                objFileTree = `${SYMBOL[3]}${objFileTree}`;
            }
            let items = {
                children: [],
                path: PARAMS,
                objItemFileTreeMd: objFileTree,
                deep: PARAMS.replace(originPath, '').split(SYMBOL[7]).length,
                type: stats.isDirectory() ? SHORT_SENTENCE[5] : SHORT_SENTENCE[6],
                name: PARAMS.substring(PARAMS.lastIndexOf(SYMBOL[7]) + 1, PARAMS.length)
            };
            if (stats.isDirectory()) {
                const ITEM_DIR_ARRAY = fs_1.default.readdirSync(PARAMS);
                for (let i = 0; i < ITEM_DIR_ARRAY.length; i++) {
                    const absolutePath = path_1.default.resolve(path_1.default.join(PARAMS, ITEM_DIR_ARRAY[i]));
                    if ((fs_1.default.statSync(absolutePath).isDirectory() &&
                        GITGNORE.filter((item) => absolutePath.includes(`${originPath}${SYMBOL[7]}${item}`)).length === 0) ||
                        !fs_1.default.statSync(absolutePath).isDirectory()) {
                        items.children.push({
                            deep: items.deep + 1,
                            path: absolutePath,
                            isLast: i + 1 === ITEM_DIR_ARRAY.length ? true : false,
                            name: absolutePath.substring(absolutePath.lastIndexOf(SYMBOL[7]) + 1, absolutePath.length),
                            type: fs_1.default.statSync(absolutePath).isDirectory()
                                ? SHORT_SENTENCE[5]
                                : SHORT_SENTENCE[6],
                            children: []
                        });
                    }
                }
            }
            // eslint-disable-next-line no-param-reassign
            const newObjTree = Object.assign(objTree, items);
            fileTreeArray = [];
            deepTraversal(OBJ);
            for (let i of newObjTree.children) {
                displayFile(i);
            }
        }
    });
}
function deepTraversal(node) {
    if (node !== null) {
        let childrens = node.children;
        fileTreeArray.push(node.objItemFileTreeMd);
        if (!node.objItemFileTreeMd) {
            fileTreeArray.push(node.name);
        }
        if (node.type === 'directory') {
            for (let i of childrens) {
                deepTraversal(i);
            }
        }
    }
}
// 检查当前依赖
function findModel() {
    const ALL_MODEL = MODEL_LIST.concat(PLUGIN_LIST);
    if (fs_1.default.readdirSync('./').includes('package.json') &&
        JSON.parse(fs_1.default.readFileSync('./package.json', 'utf-8')).devDependencies &&
        JSON.parse(fs_1.default.readFileSync('./package.json', 'utf-8')).dependencies) {
        packageDevdependencies = Object.assign(JSON.parse(fs_1.default.readFileSync('./package.json', 'utf-8')).devDependencies, JSON.parse(fs_1.default.readFileSync('./package.json', 'utf-8')).dependencies);
    }
    else if (fs_1.default.readdirSync('./').includes('package.json') &&
        JSON.parse(fs_1.default.readFileSync('./package.json', 'utf-8')).devDependencies &&
        !JSON.parse(fs_1.default.readFileSync('./package.json', 'utf-8')).dependencies) {
        packageDevdependencies = JSON.parse(fs_1.default.readFileSync('./package.json', 'utf-8'))
            .devDependencies;
    }
    else if (fs_1.default.readdirSync('./').includes('package.json') &&
        !JSON.parse(fs_1.default.readFileSync('./package.json', 'utf-8')).devDependencies &&
        JSON.parse(fs_1.default.readFileSync('./package.json', 'utf-8')).dependencies) {
        packageDevdependencies = JSON.parse(fs_1.default.readFileSync('./package.json', 'utf-8'))
            .dependencies;
    }
    let missingModule = [];
    for (let i of Object.keys(packageDevdependencies)) {
        if (!ALL_MODEL.find((item) => item[0] === i)) {
            missingModule.push(i);
        }
    }
    switch (missingModule.length) {
        case 0:
            return true;
        default:
            output();
            return false;
    }
    function output() {
        console.info('若缺少此模块会造成无法开发，请添加至 MODEL_LIST 。');
        console.info('若缺少此模块会造成某功能模块无法使用，请添加至 PLUGIN_LIST 。');
        console.info('缺少以下模块描述，请按描述添加至 MODEL_LIST 或 PLUGIN_LIST:');
        for (let i of missingModule) {
            console.info(i);
        }
    }
}
// 开始编写
function line() {
    if (findModel()) {
        displayFileOne();
    }
}
line();
