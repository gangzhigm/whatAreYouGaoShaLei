import Model from 'web-model';

export const importantModel = new Model({
    base: 'https://gate.dmartech.cn/etl/api/v1',
    api: {
        eventTag(data) {
            return this.request
                .post('/api/import?secret=dad4727a-57fb-451f-8df0-084f2ea7112e')
                .send(data);
        }

    }
});
