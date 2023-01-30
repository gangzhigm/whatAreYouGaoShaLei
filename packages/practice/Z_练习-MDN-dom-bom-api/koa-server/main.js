// // 使用koa
// const koa = require('koa')
// const router = require('koa-router')()
// // koa-websocket是koa封装好的websocket功能
// const websocket = require('koa-websocket')
// // 实例化一个ws服务
// const app = websocket(new koa())

// // 用来存储建立了的链接，（真实项目中请使用数据库代替）
// let wsObj = {}

// // 监听koa/ws路由，是否有连接
// router.all('/koa/ws', (ctx) => {
//     // 客户端链接传过来的客户端身份
//     console.info(1232);
//     const { id } = ctx.query
//     // 将链接保存起来
//     wsObj[id] = ctx;
//     // 给客户端发送链接成功信息
//     ctx.websocket.send('连接成功');
//     // 监听客户端发送过来的信息
//     ctx.websocket.on('message', function(message) {
//         console.log(message);
//         // uid为接收方，将接收到的信息发送给接收方uid,可以根据自己的需求处理数据再发送
//         const uid = JSON.parse(message).uId;
//         if(!wsObj[uid]){
//             ctx.websocket.send(`${uid}未上线`)
//         }else{
//             wsObj[uid].websocket.send(message)
//         }
        
//     });
// })
// // 使用路由
// app.ws.use(router.routes()).use(router.allowedMethods())

// //端口号后面可采用动态的
// app.listen(3000, () =>
//     console.log('服务启动成功')
// )

const Koa = require('koa')
const logger = require('koa-logger');
const sslify = require('koa-sslify').default;//http强制HTTPS
const https = require('https');//node内置https server
const fs = require('fs');
const path = require('path');
const serve = require('koa-static');//koa 静态资源插件
const home = serve(path.resolve(__dirname, './public'));
const app = new Koa();

app.use(logger())

app.use(sslify())

app.use(home)




var options = {
    key: fs.readFileSync('./private_key.pem'),  //私钥文件路径
    cert: fs.readFileSync('./ca-cert.pem')  //证书文件路径
};
https.createServer(options, app.callback()).listen(9527, () => {
    console.log(`server running success at 9527`)
});