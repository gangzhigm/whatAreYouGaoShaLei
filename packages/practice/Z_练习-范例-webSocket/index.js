const app = new Koa();
const server = http.createServer(app.callback());
createSocketIO(server);

app.use((ctx): void =>{
    ctx.body = 'please connect use socket';
})

server.listen(port ,():void =>{
    console.info('server started at http://localhost:' + port )
})