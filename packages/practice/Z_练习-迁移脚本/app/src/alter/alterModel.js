import Model from 'web-model';
// 配置个人信息接口（获取、保存用户信息）
export default new Model({
    base: 'https://gate.dmacloud.com/thgn/config/v1/',
    api: {
        //get请求，获取用户信息
        getAlter() {
            return this.request
                .get('config')
                .query({ key: 'username' });
        },
        getAlterPsd() {
            return this.request
                .get('config')
                .query({ key: 'password' });
        },
        getAlterScore() {
            return this.request
                .get('config')
                .query({ key: 'score' });
        },
        //点击保存，将保存的用户信息传给后台
        saveAlter(AlterUserName){
            return this.request
                .post('config')
                .send({ key: 'username', value:AlterUserName});
        },
        saveAlterPsd(AlterPassWord){
            return this.request
                .post('config')
                .send({ key: 'password', value:AlterPassWord});
        },
        saveAlterScore(AlterScore){
            return this.request
                .post('config')
                .send({ key: 'score', value:AlterScore});
        }
    }
});
