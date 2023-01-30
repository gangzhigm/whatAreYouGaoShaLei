const WebSocket = require("ws");

class ws {
    static online = 0 // online
    static ws = WebSocket.Server // normal
    static init(server) {
        if(!(request.url.includes('/**/**/websockets'))){
            return ws.close();
        }
        this.online = this.ws._server._connections;
        console.log(`socket当前在线${this.online}个连接`)
        const {
            query: { id }
        } = quertString.parseUrl(request.url);
        if (!id) {
            return ws.close();
        } 
        try {
           //do something
           // 这里可以做一些加强判断查询数据库等行为

            ws.id = id // 添加ws实例的唯一标识
            const obj = {"message":"连接成功","retCode": 200}
            ws.send(JSON.stringify(obj))
        } catch (error) {
            console.log('websocket connection error',error)
            return ws.close();
        }
    }
    static sendToCliect(Data) {
        let iskeep = false // 加个变量做下发成功判断
        if (!(this.ws instanceof WebSocket.Server)) {
            return iskeep;
        }
        const {id } = Data
        this.ws.clients.forEach((client) => {
            if (client.readyState === WebSocket.OPEN && client.id === id) { 
                // 发送给指定匹配id
                client.send(JSON.stringify(Data));
                iskeep = true
            }
        });
        return iskeep; 
    }
}

module.exports = ws