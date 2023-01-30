<template>
    <div>
        <h1>{{'dataCenter.download' | t}}SDK</h1>
        <br/>
        <a href="#" @click="downloadSDK">{{'dataCenter.download' | t}}SDK</a>
        <br/>
        <h1>SDK接口</h1>
        <h3>接口分类</h3>
        <table>
            <tr class="title">
                <td>{{'dataCenter.interfaceType' | t}}</td>
                <td class="indent">{{'dataCenter.interfaceName' | t}}</td>
                <td class="indent">{{'dataCenter.paramList' | t}}</td>
            </tr>
            <tr>
                <td>{{'dataCenter.userDataInterface' | t}}</td>
                <td class="indent">user</td>
                <td class="indent">signature, properties, callback</td>
            </tr>
            <tr>
                <td>{{'dataCenter.deleteInterface' | t}}</td>
                <td class="indent">userDelete</td>
                <td class="indent">signature, properties, callback</td>
            </tr>
            <tr>
                <td>{{'dataCenter.eventInterface' | t}}</td>
                <td class="indent">event</td>
                <td class="indent">signature, eventName, properties, callback</td>
            </tr>
        </table>
        <table>
            <tr class="title">
                <td>参数名称</td>
                <td class="indent">参数介绍</td>
            </tr>
            <tr>
                <td>signature</td>
                <td class="indent">签名</td>
            </tr>
            <tr>
                <td>properties</td>
                <td class="indent">属性列表</td>
            </tr>
            <tr>
                <td>eventName</td>
                <td class="indent">事件名称</td>
            </tr>
            <tr>
                <td>callback</td>
                <td class="indent">回调函数</td>
            </tr>
        </table>

        <h3>参数说明</h3><br>
        <p>properties中都需要"带主键标识的用户属性"且至少一个有值.</p><br>
        <p>特别说明:</p>
        <p class="indent">1. "带主键标识的用户属性": 在"数据中心-元数据-用户属性"中可以将某些属性设置为主键标识, 例如将手机号和邮箱设为主键标识, 在导入数据时会根据这两个属性查询用户并更新数据.</p>
        <p class="indent">2. 事件数据接口中需要两个额外的属性,"event_id"和"create_time",event_id为该事件数据的唯一标识,create_time为该事件发生的时间.</p><br>

        <h3>签名规则</h3><br>
        <p class="indent">1. 参与签名的字段:</p>
        <p class="sub-indent">1. id = 该条数据唯⼀标识(⽤户ID或订单号等)</p>
        <p class="sub-indent">2. timestamp = 时间戳(精确到毫秒)</p>
        <p class="sub-indent">3. delimiter = #</p>
        <p class="indent">2. 待签名的字符串str:</p>
        <p class="sub-indent">1. 若id存在:</p>
        <p class="thr-indent">str = ${id}${delimiter}${timestamp}</p>
        <p class="thr-indent">如: str = "20190701abc#1562219572078"</p>
        <p class="sub-indent">2. 若id不存在:</p>
        <p class="thr-indent">str = ${timestamp}</p>
        <p class="thr-indent">如: str = "1562219572078"</p>

        <p class="indent">3. 对str作AES加密:</p>
        <p class="sub-indent">1. 加密算法: "AES/ECB/PKCS5Padding"</p>
        <p class="sub-indent">2. 加密秘钥: sdk设置⻚⾯第⼆步中的 "key"</p>
        <p class="sub-indent">3. 对加密后的结果作Base64编码</p>
        <p class="indent">4. 对加密的后得到的签名进⾏URL转义</p>
        <p class="indent">例如:</p>
        <p class="sub-indent">1. 待签名的字符串</p>
        <p class="thr-indent">str = "20190701abc#1562219572078";</p>
        <p class="sub-indent">2. 设置中的秘钥</p>
        <p class="thr-indent">key = "#8UclAHu/BrI6mbD";</p>
        <p class="sub-indent">3. 使⽤key对str作AES加密得到初始签名</p>
        <p class="thr-indent">signature = "P8Pzm1NldevKPxG7FSm+FNBr8Wt2yNdEgI7/7NxJSyM=";</p>
        <p class="sub-indent">4. 对初始签名进⾏URL转义得到最终签名</p>
        <p class="thr-indent">signature = "P8Pzm1NldevKPxG7FSm%2BFNBr8Wt2yNdEgI7%2F7NxJSyM%3D";</p>
        <p class="indent">注意: 请妥善保管key, demo.html中的AES加密只是⽤于演示效果, 请勿在前端⻚⾯加密, 以防因key泄露导致被篡改或仿造的数据⼊库, ⼀经发现key泄露请⽴即重置.</p>

        <h1>使用SDK</h1><br>
        <h3>用户数据示例</h3><br>
        <p>// 声明SDK对象, 需要SECRET</p>
        <p>var sdk = new this.SDK("{{sdk.secret}}");</p><br>
        <p>// 调试模式:只校验格式不执行入库. 注意:默认值为false, 生产环境务必将此参数设置为false或注释掉该配置.</p>
        <p>sdk.setDebug(true);</p><br>
        <p>/*  导入用户示例  开始  */</p>
        <p>// phone, email 为主键标识的用户属性</p>
        <p>// username, age 为普通的用户属性</p>
        <p>var properties = {</p>
        <p class="indent">"phone": "183****6527",</p>
        <p class="indent">"email": "tianshl@qdum.com",</p>
        <p class="indent">"username": "tianshl",</p>
        <p class="indent">"age": 80</p>
        <p>};</p><br>
        <p>// 获取签名</p>
        <p>var signature = "后端获取";</p><br>
        <p>// 发送请求</p>
        <p>sdk.user(properties, function(resp){</p>
        <p class="indent">// this is the callback method</p>
        <p class="indent">console.log(resp);</p>
        <p>});</p>
        <p>/*  导入用户示例  结束  */</p><br>
        <h3>事件数据示例</h3>
        <p>// 声明SDK对象, 需要SECRET</p>
        <p>var sdk = new this.SDK("{{sdk.secret}}");</p><br>
        <p>// 调试模式:只校验格式不执行入库. 注意:默认值为false, 生产环境务必将此参数设置为false或注释掉该配置.</p>
        <p>sdk.setDebug(true);</p><br>
        <p>/*  导入事件示例  开始  */</p>
        <p>// phone, email 为主键标识的用户属性</p>
        <p>// orderId, orderTime, amount 为事件属性</p>
        <p>// eventId, create_time 为额外的参数</p>
        <p>var properties = {</p>
        <p class="indent">"phone": "183****6527",</p>
        <p class="indent">"email": "tianshl@qdum.com",</p>
        <p class="indent">"orderId": "20180808080800001",</p>
        <p class="indent">"orderTime": "2018-08-08 08:08:08",</p>
        <p class="indent">"amount": 998,</p>
        <p class="indent">"event_id": "20180808080800001",</p>
        <p class="indent">"create_time": "2018-08-08 08:08:08"</p>
        <p>};</p><br>
        <p>// 获取签名</p>
        <p>var signature = "后端获取";</p><br>
        <p>// 发送请求</p>
        <p>sdk.event("order_detail", properties, function(resp){</p>
        <p class="indent">// this is the callback method</p>
        <p class="indent">console.log(resp);</p>
        <p>});</p>
        <p>/*  导入事件示例  结束  */</p><br>
        <h3>删除用户示例</h3><br>
        <p>// 声明SDK对象, 需要SECRET</p>
        <p>var sdk = new this.SDK("{{sdk.secret}}");</p><br>
        <p>// 调试模式:只校验格式不执行入库. 注意:默认值为false, 生产环境务必将此参数设置为false或注释掉该配置.</p>
        <p>sdk.setDebug(true);</p><br>
        <p>/*  删除用户示例  开始  */</p>
        <p>// phone, email 为主键标识的用户属性</p>
        <p>var properties = {</p>
        <p class="indent">"phone": "183****6527",</p>
        <p class="indent">"email": "tianshl@qdum.com"</p>
        <p>};</p><br>
        <p>// 获取签名</p>
        <p>var signature = "后端获取";</p><br>
        <p>// 发送请求</p>
        <p>sdk.userDelete(properties, function(resp){</p>
        <p class="indent">// this is the callback method</p>
        <p class="indent">console.log(resp);</p>
        <p>})</p>
        <p>/*  删除用户示例  结束  */</p><br>
        <h1>返回结果</h1><br>
        <h3>正确时的返回JSON包如下</h3><br>
        <p>{"errcode":0,"errmsg":"请求成功"}</p><br>
        <h3>错误时的返回JSON包如下</h3><br>
        <p>{"errcode":10001,"errmsg":"json数据格式化失败"}</p><br>
        <h3>返回码说明</h3><br>
        <p>返回码 说明</p>
        <p>0&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;请求成功</p>
        <p>10000&nbsp;系统错误</p>
        <p>10001&nbsp;json数据格式化失败</p>
        <p>10002&nbsp;type取值不合法</p>
        <p>10003&nbsp;缺少secret参数</p>
        <p>10004&nbsp;属性列表为空</p>
        <p>20000&nbsp;身份验证失败</p>
        <p>20001&nbsp;缺少主键标识的用户属性</p>
        <p>20002&nbsp;至少需要一个主键标识的用户属性存在值</p>
        <p>20003&nbsp;数据校验失败</p>
        <p>20004&nbsp;签名校验失败</p><br>
        <h3>备注</h3><br>
        <p>该结果只是标识请求结果, 数据导入结果请查看系统中相关数据源的导入详情</p><br>
        <h1>UUID</h1><br>
        <h3>如何使用</h3><br>
        <p>var uuid = new UUID().createUUID();</p><br>
        <p>console.log(uuid)</p>
        <p>/* c89b0322-bd80-0001-64b4-9f601c0017af */</p>

    </div>
</template>

<script>
    import { EtlApiV1 } from '@/api';
    import {downloadArrayBufferAsFile} from '../../../common/utils/downloadUtils';

    export default {
        name: 'sdk-doc',
        props: {
            sdk: Object,
        },
        methods: {
            // 下载sdk
            downloadSDK() {
                this.$loading();
                EtlApiV1.downloadJsSDK()
                    .then(res => {
                        downloadArrayBufferAsFile('javascript_sdk.zip', res.body, 'application/octet-stream')
                            .catch(err => {
                                let msg = typeof err === 'string' ? err : this.$t('dataCenter.downloadsdkFailed');
                                this.$toast(msg, 'warn');
                            });
                        this.$loaded();
                    })
                    .catch(err => {
                        console.error(err);
                        this.$loaded();
                    });
            },
        },
    };
</script>

<style lang="scss" type="text/scss" rel="stylesheet/scss">
    @import "../scss/data-source-detail";

    .indent {
        text-indent: 16px;
    }
    .sub-indent {
        text-indent: 32px;
    }
    .thr-indent {
        text-indent: 48px;
    }
    table {
        .title {
            td {
                font-weight: 600;
            }
            
        }
    }
</style>
