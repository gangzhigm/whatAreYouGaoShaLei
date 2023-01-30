import { WecomApiV1 } from '@/api';
/**
 * @description 检测是否配置企业微信自建应用，若已配置则继续跳转企业微信功能页面，否则跳转提示页
 * @param { * } next vue-router next方法
 */
export async function wecomChecker (next, toName) {
    const list = await WecomApiV1
        .getConfigList()
        .then(({ body: { data: { resultList } } }) => resultList)
        .catch(() => {
            next({ name: 'home' });
        });
    if (list && list.length > 0) {
        next();
    } else {
        next({ name: 'configWecomAgentNow', query: {name: toName} });
    }
}
