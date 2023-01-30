const embeddedCode = () => {
    let env = 'pro';

    /**
     * let env = "beta"; // 测试环境
     * let isPro = window.location.hostname === "his.huawei.com"; // 是否是生产环境的判断逻辑
     * if (isPro) {
     *   env = "pro"; // 生产环境
     * }
     * @description 以上获取环境变量的代码仅供参考，请以您的实际环境判断为准！
     */

    // 埋码AppKey配置
    let uemAppKeys = {
        edition: 'his', // 红版"his" || 蓝版"heds"
        env: env,
        appKeys: {
            beta: '', //从UEM的beta环境获取的埋码Key
            pro: '3212a53647b76972d2f2a1830cd3ead4', //从UEM的生产环境获取的埋码Key
        },
        ABVersion: 'A', //AB版本标识(可选),取值 A或者B;A代表A版本,B代表B版本
        platform: 'web', //埋码应用的运行平台(可选,默认是web), PC页面: web; we码程序: welink; [default = "web"]
        forceSecureTracker: true, //强制开启https协议; [default = false]
        // logLevel: 'debug', //在F12控制台打印采集信息; [default = undefined]; 控制命令:window.hwa("setLogLevel", "debug" || null)
    };
    // 采集器初始化
    (function(w, d, u, n) {
        try {
            if (d.getElementById('uem_f')) {
                throw Error('请不要重复初始化UEM采集器');
            }
            u = JSON.parse(JSON.stringify(u));
            if (!w[n]) {
                w.GlobalHwaNamespace = w.GlobalHwaNamespace || [];
                w.GlobalHwaNamespace.push(n);
                w[n] = function() {
                    (w[n].q = w[n].q || []).push(arguments);
                };
                w.trackerload = function() {
                    (w[n].q = w[n].q && w[n].q.length ? w[n].q : []).unshift(arguments);
                };
                w[n].q = w[n].q || [];
            }
            let protocol, host, path, hostMap, hostArr, hostRoot;
            let fnHeds = function() {
                path = '/aiops/uem/agent';
                hostMap = u.tenant && u.tenant.webHost;
                hostArr = w.location.hostname.split('.');
                if (!hostMap && hostArr.length > 1) {
                    hostRoot = hostArr.slice(-2).join('.');
                    hostMap = {
                        beta: 'console.heds-beta2.' + hostRoot,
                        pro: 'console.heds.' + hostRoot,
                    };
                    u.tenant = u.tenant || {};
                    u.tenant.webHost = hostMap;
                } else {
                    hostMap = {};
                }
                host = hostMap[u.env] || '';
                if (!host) {
                    throw Error('请配置UEM.tenant.webHost或者改为二级域名以上的环境');
                }
            };
            if (u.edition === 'heds') {
                fnHeds();
            } else if (u.platform === 'welink') {
                u.forceSecureTracker = true;
                path = '/dist';
                hostMap = {
                    beta: 'mcloud-uat.huawei.com/mcloud/mag',
                    pro: 'w3m.huawei.com/mcloud/mag',
                };
                host = hostMap[u.env] || '';
                w.hwahost = host + '/ProxyForText/hwa_trackload';
                host += '/fg/ProxyForDownLoad/hwa_f';
            } else {
                path = '/dist';
                hostMap = {
                    beta: 'hwa-beta.his.huawei.com',
                    pro: 'hwa.his.huawei.com',
                };
                host = hostMap[u.env] || '';
            }
            protocol = u.forceSecureTracker === true || w.location.protocol === 'https:' ? 'https://' : 'http://';
            w.aids = u;
            w.space = n;
            let ts = new Date().toJSON()
                .split('T')[0];
            let script = d.createElement('script');
            script.id = 'uem_f';
            script.src = protocol + host + path + '/uem_f.js?_=' + ts;
            if (u.async !== false) {
                script.setAttribute('async', '1');
            }
            script.setAttribute('style', 'display:none;');
            let where =
                d.getElementsByTagName('head')[0].firstChild ||
                d.getElementsByTagName('head')[0].lastChild ||
                d.getElementsByTagName('script')[0];
            if (where) {
                where.parentNode.insertBefore(script, where);
            } else {
                d.getElementsByTagName('head')[0].appendChild(script);
            }
        } catch (e) {
            if (!w[n]) {
                w[n] = function() {
                    return undefined;
                };
            }
        }
    })(window, document, uemAppKeys, 'hwa');
};

export { embeddedCode };
