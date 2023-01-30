import Model from 'web-model';
import LINKS from '@/LINKS';

export default new Model({
    base: LINKS.NIKE_MATERIAL_API_BASE + '/api/material/v1',
    api: {

        /**
         * 修改某批次素材
         * @param id
         * @param materialContent
         * @param materialName
         */
        materialCopy(id,materialContent,materialName) {
            return this.request
                .put(`/materialCopy/${id}`)
                .send({
                    materialContent,
                    materialName
                });
        }
    }
});
