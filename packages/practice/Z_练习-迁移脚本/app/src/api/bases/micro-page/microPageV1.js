import Model from 'web-model';
import LINKS from '@/LINKS';


export default new Model({
    base: LINKS.WECHAT_API_BASE + '/api/wechat/v1/microPage',
    api: {
        /***** 微页面-start *****/
        /**
         * 拉取微页面列表全部数据
         * @param  {Number} value 搜索活码名称关键词
         */
        getMicroPageList({value}){
            return this.request
                .get('/getMicroPageListNoPage')
                .query({value});
        },
        /**预览与发布 start */
        /**
         *  上传分享图片
         *  @param {Object} file 图片对象
         */
        uploadImage(file) {
            return this.request
                .post('/uploadImage')
                .attach('file', file);
        },
        /**
         *  保存并发布
         *  @param {String} shareTitle 分享标题
         *  @param {String} shareDescription 分享描述
         *  @param {String} sharePictures 分享图片url
         *  @param {Number} id 微页面id
         *  @param {Number} status 微页面状态 0 保存 1 保存并发布
         */
        setStatus(obj) {
            return this.request
                .post('/setStatus')
                .send(obj);
        },
        /**
         *  微页面详情
         *  @param {Number} id 微页面id
         */
        showPage({id}) {
            return this.request
                .get('/show')
                .query({id});
        },
        /**预览与发布 end */
        findMicroPageList (params) {
            return this.request
                .get('/findList')
                .query(params);
        },

        /**
         * 复制微页面
         */
        copyMicroPage (params) {
            return this.request
                .post('/copy')
                .query(params);
        },

        /**
         * 删除微页面
         * @param {*} params 
         * @returns 
         */
        delMicroPage (params) {
            return this.request
                .del('')
                .query(params);
        },

        /**
         * 微页面下线
         * @param {*} params 
         * @returns 
         */
        offlineMicroPage (params) {
            return this.request
                .get('/offLine')
                .query(params);
        },

        /**
         * 批量移动分组
         * @param {*} params 
         * @returns 
         */
        batchMoveGroup (params) {
            return this.request
                .post('/batchMove')
                .send(params);
        },

        /**
         * 批量删除
         * @param {*} params 
         * @returns 
         */
        batchDel (params) {
            return this.request
                .post('/batchDel')
                .send(params);
        },

        /**
         * 查看微页面
         * @param {*} params 
         * @returns 
         */
        viewMicroPage (params) {
            return this.request
                .get('')
                .query(params);
        }

        /***** 微页面-end *****/
    }
});
