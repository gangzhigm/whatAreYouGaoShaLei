import Model from 'web-model';
import LINKS from '@/LINKS';

export default new Model({
    base: LINKS.ETL_API_BASE + '/api/v2',
    api: {

        /**
         *  v2 SFTP 上传CSV
         *  /etl/api/v2/sftp/upload
         */
        uploadCSV (csvFile) {
            return this.request
                .post(`/sftp/upload`)
                .attach('file', csvFile);
        },

        /**
         * 预览 CSV
         * @param {String} fileKey
         * @param {String} charset default utf8
         * @param {String} headers
         * @param {String} objective
         * /etl/api/v2/sftp/preview
         */
        csvPreview (fileKey, charset, headers, objective) {
            return this.request
                .get(`/sftp/preview`)
                .query({
                    charset,
                    fileKey,
                    headers,
                    objective
                });
        },

        /**
         * 拆解CSV 开始导入
         * @param {String} charset
         * @param {String} fileKey
         * @param {Array<String>} headers
         * @param {String} labelId
         * @param {String} objective 上传目的
         * @param {number} uploadMode 上传模式: 正常0,极速1
         * @return {*}
         */
        csvExhaust (charset, fileKey, headers, labelId, objective, uploadMode) {
            return this.request
                .post(`/sftp/unpack`)
                .send({
                    charset,
                    fileKey,
                    headers,
                    labelId,
                    objective,
                    uploadMode
                });
        },
    }
});
