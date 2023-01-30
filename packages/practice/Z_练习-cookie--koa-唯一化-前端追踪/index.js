// const https = require('https');
const http = require('http');
// 导入koa，和koa 1.x不同，在koa2中，我们导入的是一个class，因此用大写的Koa表示:
const Koa = require('koa');
//注意require('koa-router')返回的是函数:
const router = require('koa-router')();
//设置跨域
const cors = require('koa2-cors'); //跨域处理
//导入post请求参数处理的插件
const bodyParser = require('koa-bodyparser');
// 引入静态资源中间件，静态web服务
const staticResource = require('koa-static');
// 引入node的path模块
const path = require('path')
const fs = require('fs');
const enforceHttps = require('koa-sslify').default;
// 创建一个Koa对象表示web app本身:
const app = new Koa();
app.use(cors({
    credentials: true
}));
const options = {
    key: fs.readFileSync('./public/a.b.cn-key.pem'),
    cert: fs.readFileSync('./public/a.b.cn.pem')
  }
// app.use(enforceHttps());

app.use(async (ctx, next)=> {
    ctx.set('Access-Control-Allow-Origin', '*');
    ctx.set('Access-Control-Allow-Credentials', 'true');
    ctx.set('Access-Control-Allow-Headers', 'Content-Type');
    await next();
});
// add router middleware:
app.use(bodyParser());

//获取get请求的参数的方法
router.get('/initCookie', async (ctx, next) => {
    console.info("try")
    //  domain=.mmstat.com; SameSite=none; Secure
    // ctx.cookies.set('testCookie', ctx.request.query.UUID,{ httpOnly: false,sameSite: 'none', secure: false});
    ctx.cookies.set('testCookie', ctx.request.query.UUID,{ httpOnly: false,sameSite: 'none',  secure: true});
    // ctx.cookies.set('testCookie', ctx.request.query.UUID,{ httpOnly: false,sameSite: 'none', secure: false});
    // ctx.cookies.set('testCookie', ctx.request.query.UUID,{ httpOnly: false,sameSite: 'none', domain: '.a.b.test.com', secure: false});
    // sameSite: 'Lex'
    // console.info(ctx.request.query.cookie.toString());
    // console.info(ctx.cookies.get(ctx.request.query.cookie.toString()));
	// var text=`getCookie success: ${ctx.cookies.get(ctx.request.query.cookie.toString())}`;
	var text=`getCookie success:`;
    ctx.response.body = text;   //响应体data中的信息
});

//获取get请求的参数的方法
router.get('/getCookie', async (ctx, next) => {
    
    const cookie = ctx.cookies.get('testCookie');
    console.info(cookie); 
    // console.info(ctx.request.query.cookie.toString());
    // console.info(ctx.cookies.get(ctx.request.query.cookie.toString()));
	// var text=`getCookie success: ${ctx.cookies.get(ctx.request.query.cookie.toString())}`;
	var text=`getCookie success:`;
    ctx.response.body = text;   //响应体data中的信息
});


//获取post请求的参数的方法
router.post('/setCookie', async (ctx, next) => {
    ctx.cookies.set(ctx.request.body.cookie[0], ctx.request.body.cookie[1]);
    console.info(ctx.cookies);
	var text=`setCookie success: ${ctx.cookies.get(ctx.request.body.cookie[0].toString())}`;
    ctx.response.body = text;   //响应体data中的信息
});

app.use(router.routes());

//配置静态资源中间件
app.use(staticResource(path.join(__dirname,'public')))
// 在端口3000  3001监听:
// https.createServer(options,app.callback()).listen(3000);
http.createServer(app.callback()).listen(3000);
http.createServer(app.callback()).listen(3001);