import Model from 'web-model';
import LINKS from '@/LINKS';

export default new Model({
    base: LINKS.QUESTIONNAIRE_API_BASE + '/api/web-api/',
    api: {

        /**
         * 获取国家
         */
        getAllCountry() {
            return this.request
                .get('area/getWorldCountryList');
        },
        /**
         *  获取省市区
         */
        getAllArea() {
            return this.request
                .get('area/getCountryListAll');
        }
    }
});