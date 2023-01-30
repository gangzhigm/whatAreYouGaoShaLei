// API RETURN : {
//     sentences: [
//       {
//         trans: 'To confirm, register, log in, cancel, please enter the email address, please enter the login password, the email format is incorrect, the password length is 6-12 characters, only 6-12 digits and uppercase and lowercase English letters are supported, welcome back, ',
//         orig: '确认,注册,登录,取消,请输入电子邮箱地址,请输入登录密码,邮箱格式不正确,密码长度在6 到12 个字符,仅支持6-12位的数字及大小写英文字母,欢迎回来,',
//         backend: 3,
//         model_specification: [Array],
//         translation_engine_debug_info: [Array]
//       }
//     ],
//     src: 'zh-CN',
//     spell: {}
// }

const fs = require("fs");
const path = require("path");
const http = require("http") 
const request = require('request');
// 中文原始文件
const originDataPath = "./ch.js";
let originData = {};
// 原始结构索引对象
const originList = [[],[],[]]
// 翻译查询对象
const textList = []
// 翻译后文案对象
const translateList = []
// 接口url
const url = `http://translate.google.cn/translate_a/single?client=gtx&dt=t&dj=1&ie=UTF-8&sl=zh_CN&tl=en&q=` 
// 检查文件是否存在
function checkUp(){
    try{
        if(fs.statSync(path.resolve(originDataPath)) && fs.statSync(path.resolve(originDataPath)).isFile() === true){
            console.info("检查原始文件通过")
            originData= require(originDataPath);
        }
        else{
            console.info(`路径指向非文件`);
            return false;
        }
    }
    catch(err){
        console.info(`路径文件不存在`);
        return false;
    }
}
// 根据中文字库创建查询对象 // 根据中文字库创建索引对象
function init(){
    originList[0] = Object.keys(originData);
    originList[0].forEach((item, index) => {
        originList[1][index] = Object.keys(originData[item]);
        originList[2][index] = Object.keys(originData[item]);
    })
    originList[0].forEach((item0, index0) => {
        originList[1][index0].forEach((item1, index1) => {
            originList[2][index0][index1] = originData[item0][item1];
            textList.push(originData[item0][item1])
        })
    })
}
// 查询所有翻译项，以供比对，避免接口访问过多阻止调用
function searchAll(){
    http.get(`${url}${textList}`,(res)=>{
        res.on("data",(data)=>{
            // 执行全量数据的后续处理保存操作
            try{
                const interfaceData = JSON.parse(data.toString());
                saveAll(interfaceData);
            }
            catch(err){
                console.info(data.toString());
                console.info("获取全量接口错误，请稍后再试");
                return false;
            }
        })
        res.on("end",()=>{})
    }).on("error",(e)=>{
        console.log(`接口获取数据失败: ${e.message}`)
    })
}
// 执行全量数据的后续处理保存操作
function saveAll(data){
    let JSON_DATA = {} 
    if(!data){
        console.info("全量接口数据未返回");
        return false;
    }
    else{
        JSON_DATA = data;
    }

    // 保存接口原始数据
    writeAllData_JSON(JSON_DATA);

    // 保存接口原始数据清洗后的文段数据
    const cleanData = new Array("", "");
    JSON_DATA.sentences.forEach(item => {
        cleanData[0] += item.orig;
        cleanData[1] += item.trans;
    })
    writeAll_data_STRING(cleanData);
}
// 保存接口原始数据
function writeAllData_JSON(JSON_DATA){
    fs.writeFile('allData.json', JSON.stringify(JSON_DATA),  function(err) {
        if (err) {
            return console.error(err);
        }
        console.log("全量接口原始数据写入成功！");
    });
}
// 保存接口原始数据清洗后的文段数据
function writeAll_data_STRING(cleanData){
    fs.writeFile('allData.txt', cleanData.join("\n"),  function(err) {
        if (err) {
            return console.error(err);
        }
        console.log("清洗后的全量文段数据写入成功！");
    });
}
// 遍历查询所有翻译项
function searchStep(){
    textList.forEach((item,index)=>{
        setTimeout(()=>{
            http.get(`${url}${item}`,(res)=>{
                res.on("data",(data)=>{
                    try{
                        const interfaceData = JSON.parse(data);
                        translateList[index] = [interfaceData.sentences[0].orig,interfaceData.sentences[0].trans];
                        console.info(`${[interfaceData.sentences[0].orig,interfaceData.sentences[0].trans]} : ${translateList.length}/${textList.length}` )
                        if(textList.length === translateList.length && translateList.findIndex(item => item === (void 0)) === -1){
                            saveStep(translateList);
                        }
                    }
                    catch(err){
                        console.info(data.toString());
                        console.info("接口解析错误,暂保存已翻译文案，请稍侯");
                        saveStep(translateList);

                    }
                })
                res.on("end",()=>{})
            }).on("error",(e)=>{
                console.log(`获取数据失败: ${e.message}`)
            })
        },getStepTime(index))
    })
}
// 执行遍历数据的后续处理保存操作
function saveStep(data=[]){
    if(data.length === 0 ){
        console.info("已翻译文案为空")
        return false;
    }
    writeSingle_data_JSON(data);

    originList[3] = originList[2];
    let translateData = JSON.stringify(originList[3]);
    data.forEach(item=>{
        translateData = translateData.replace(item[0], item[1]);
    })
    originList[3] = JSON.parse(translateData);
    const cleanObject = {};
    originList[0].forEach((item0,index0)=>{
        cleanObject[item0]={};
        originList[1][index0].forEach((item1,index1)=>{
            cleanObject[item0][item1]=originList[3][index0][index1];
        })
    })
    writeSingle_data_JS(cleanObject);
}
// 获取执行遍历数据的延时器的方案
function getStepTime(index){
    return 1000*10*index+parseInt(Math.random()*(30000-10000)+10000)
}
// 保存遍历接口清洗后数据
function writeSingle_data_JSON(JSON_DATA){
    fs.writeFile('single_data.json', JSON.stringify(JSON_DATA),  function(err) {
        if (err) {
            return console.error(err);
        }
        console.log("遍历接口清洗后数据写入成功！");
    });
}
// 保存遍历接口清洗后对象数据
function writeSingle_data_JS(JSON_DATA){
    fs.writeFile('single_data.js', ` module.exports = ${JSON.stringify(JSON_DATA)}`,  function(err) {
        if (err) {
            return console.error(err);
        }
        console.log("遍历接口清洗后对象数据写入成功！");
    });
}


// JSON 只查询全量
async function onlyAllJsonData(){
    await checkUp()
    await init();
    await searchAll();
}

// JSON 只查询分量
async function onlyStepJsonData(){
    await checkUp()
    await init();
    await searchStep();
}

// JSON 全部查询
async function allJsonData(){
    await checkUp()
    await init();
    await searchAll();
    await searchStep();
}

// 从文件检查写入翻译
async function checkFileText(){
    const taqDataPath = require("./en");
    await checkUp()
    await init();
    Object.keys(originData).forEach(item1=>{
        Object.keys(originData[item1]).forEach(item2=>{
            Object.keys(taqDataPath).forEach(item3=>{
                if(taqDataPath[item3][item2] !== (void 0)){
                    originData[item1][item2] = taqDataPath[item3][item2]; 
                }
            })
        })
    })
    console.info(originData);
    // 保存遍历接口清洗后对象数据
    fs.writeFile('single_data_from_file.js', ` module.exports = ${JSON.stringify(originData)}`,  function(err) {
        if (err) {
            return console.error(err);
        }
        console.log("检察文件后对象数据写入成功！");
    });
}



// 从文件检查写入翻译
// checkFileText();
// 注意 全量查询长度有限制，如果翻译文案过多，请直接走只查询分量
// JSON 全部查询
// allJsonData();
// JSON 只查询分量
onlyStepJsonData();
// JSON 只查询全量
// onlyAllJsonData();
