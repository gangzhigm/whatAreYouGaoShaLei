const Koa = require('koa');
const http = require('http');
const router = require('koa-router')();
const cors = require('koa2-cors'); //跨域处理
const staticResource = require('koa-static');
const path = require('path')
const app = new Koa();
app.use(cors({ credentials: true }));
app.use(router.routes());
app.use(staticResource(path.join(__dirname,'public')))
http.createServer(app.callback()).listen(3000);