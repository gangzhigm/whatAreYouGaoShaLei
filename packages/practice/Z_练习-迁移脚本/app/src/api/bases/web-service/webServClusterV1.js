import Model from 'web-model';
import LINKS from '@/LINKS';

export default new Model({
    base: LINKS.WEB_SERVICE_API_BASE + '/api/cluster/v1',
    api: {
        
        /**
         * 获取分群分组列表
         */
        getClusters() {
            return this.request
                .get('/cluster');
        },
        
        
        /**
         * 新建分群分组
         * @param name
         * @return {Request|*|void}
         */
        createCluster(name) {
            return this.request
                .post('/cluster')
                .send({name});
        },
        
        
        /**
         * 更新分群分组
         * @param id
         * @param name
         */
        updateCluster({id, name}) {
            return this.request
                .put(`/cluster/${id}`)
                .send({name});
        },
        
        
        /**
         * 分群分组排序
         * @param ids
         * @return {Request|*|void}
         */
        sortClusters({ids}) {
            return this.request
                .put('/order')
                .send({ids});
        },
        
        
        /**
         * 删除分群分组
         * @param id
         * @param recursion
         */
        deleteCluster(id, recursion) {
            return this.request
                .delete(`/cluster/${id}`)
                .query({recursion});
        },
        
    }
});
