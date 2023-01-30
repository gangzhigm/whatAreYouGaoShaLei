import Model from 'web-model';
import LINKS from '@/LINKS';

export default new Model({
    base: LINKS.QUESTIONNAIRE_API_BASE + '/api/questionnaire/v1/jinshuju',
    api: {

        /**
         * 获取金数据绑定情况
         */
        findJinByApi() {
            return this.request
                .get(`/findByCompanyId`);
        },


        /**
         * 创建金数据API
         * @param {String} apiKey 金数据API Key
         * @param {String} apiSecret 金数据API Secret
         * @param {Number} packageType 套餐类型（1 个人套餐 2 企业套餐）
         * @param url
         */
        createKingApi({apiKey, apiSecret, packageType, url}) {
            return this.request
                .post()
                .send({apiKey, apiSecret, packageType, url});
        },


        /**
         * 修改金数据API
         * @param {String} id 修改的金数据id
         * @param {String} apiKey
         * @param {String} apiSecret
         * @param {String} packageType
         * @param {String} url
         */
        editKingApi({id, apiKey, apiSecret, packageType, url}) {
            return this.request
                .put(`/${id}`)
                .send({apiKey, apiSecret, packageType, url});
        }
    },
});