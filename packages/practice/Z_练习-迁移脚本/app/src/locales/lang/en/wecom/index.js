import wecomComponents from './components';
import channelCode from './channelCode';
import enterpriseBroadcast from './entBroadcast';
import msgArch from './msgArch';
import shoppingGuide from './shoppingGuide';

export default [
    {
        __name__: 'wecom',
        goCfgTips: 'Please configure WeCom self-built app to your Dmartech account,so that you can use it in Dmartech.',
        goCfg: 'Click to configure',
        skipCfg: 'Skip,configure later'
    },
    wecomComponents, channelCode, enterpriseBroadcast, msgArch, shoppingGuide];