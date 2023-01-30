import wecomComponents from './components';
import channelCode from './channelCode';
import enterpriseBroadcast from './entBroadcast';
import msgArch from './msgArch';
import shoppingGuide from './shoppingGuide';

export default [
    {
        __name__: 'wecom',
        goCfgTips: '请前往【企业设置-企业微信】成功配置自建应用后使用',
        goCfg: '去配置',
        skipCfg: '跳过，稍后配置'
    },
    wecomComponents, channelCode, enterpriseBroadcast, msgArch, shoppingGuide];