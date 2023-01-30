<template>
    <div>
        <h3>{{'dataCenter.download' | t}}SDK</h3>
        <br/>
        <a href="#" @click="downloadSDK">{{'dataCenter.download' | t}}SDK</a>
        <br/><br/>

        <h3>{{'dataCenter.config' | t}}</h3>
        <div>
            <h4>1.{{'dataCenter.addDep' | t}}Fastjson</h4>
            &lt;dependency><br/>
            &lt;groupId>com.alibaba&lt;/groupId><br/>
            &lt;artifactId>fastjson&lt;/artifactId><br/>
            &lt;version>1.2.31&lt;/version><br/>
            &lt;/dependency>

            <h4>2.{{'dataCenter.downloadJar' | t}}</h4>

            /src/main/resources/lib<br/>

            <h4>3.{{'dataCenter.configuration' | t}}pom.xml</h4>

            &lt;dependency><br/>
            &lt;groupId>com.qdum&lt;/groupId><br/>
            &lt;artifactId>sdk&lt;/artifactId><br/>
            &lt;version>1.0&lt;/version><br/>
            &lt;scope>system&lt;/scope><br/>
            &lt;systemPath>${project.basedir}/src/main/resources/lib/java_sdk.jar&lt;/systemPath><br/>
            &lt;/dependency>
        </div>
        <br/><br/>

        <h3>SDK{{'dataCenter.interface' | t}}</h3>
        <br/>
        <h3>{{'dataCenter.interfaceCategory' | t}}</h3>
        <br/>
        <table>
            <tr>
                <td>{{'dataCenter.interfaceType' | t}}</td>
                <td class="indent">{{'dataCenter.interfaceName' | t}}</td>
                <td class="indent">{{'dataCenter.paramList' | t}}</td>
            </tr>
            <tr>
                <td>{{'dataCenter.userDataInterface' | t}}</td>
                <td class="indent">user</td>
                <td class="indent">{{'dataCenter.userProperty' | t}}</td>
            </tr>
            <tr>
                <td>{{'dataCenter.deleteInterface' | t}}</td>
                <td class="indent">userDelete</td>
                <td class="indent">{{'dataCenter.keyUserAttr' | t}}</td>
            </tr>
            <tr>
                <td>{{'dataCenter.eventInterface' | t}}</td>
                <td class="indent">event</td>
                <td class="indent">{{'dataCenter.eventName' | t}}</td>
            </tr>
        </table>
        <br/><br/>


        <h3>{{'dataCenter.paramDes' | t}}</h3>
        <br/>
        <div>
            <div>{{'dataCenter.oneValue' | t}}</div>

            <div>{{'dataCenter.specialNote' | t}}</div>
            <div>
                1. {{'dataCenter.note1' | t}}<br/>
                2. {{'dataCenter.note2' | t}}
            </div>

        </div>

        <br/>
        <h3>{{'dataCenter.use' | t}}</h3>
        <br/>
        <h3>{{'dataCenter.userDataSample' | t}}</h3>
        <br/>
        <div>
            <div>// {{'dataCenter.statement' | t}}</div>
            <div>
                <span>JavaSdk sdk = new JavaSdk("</span>
                <span>{{sdk.secret}}</span>
                <span>");</span>
            </div>
            <br/>
            <div>// {{'dataCenter.model' | t}}</div>
            <div>sdk.setDebug(true);</div>
            <br/>
            <div>/* {{'dataCenter.importUserStart' | t}} */</div>
            <div>JSONObject properties = new JSONObject();</div>
            <br/>
            <div>// phone, email {{'dataCenter.isUserKey' | t}}</div>
            <div>properties.put("phone", "183****6527");</div>
            <div>properties.put("email", "tianshl@qdum.com");</div>
            <br/>
            <div>// username, age {{'dataCenter.isUserNormal' | t}}</div>
            <div>properties.put("username", "tianshl");</div>
            <div>properties.put("age", 80);</div>
            <br/>
            <div>// {{'dataCenter.sendRequest' | t}}</div>
            <div>String response = sdk.user(properties);</div>
            <div>// {{'dataCenter.outPut' | t}}</div>
            <div>System.out.println(response);</div>
            <div>/* {{'dataCenter.importEnd' | t}} */</div>
        </div>
        <br/><br/>

        <h3>{{'dataCenter.eventSample' | t}}</h3>
        <br/>
        <div>
            <div>// {{'dataCenter.statement' | t}}</div>
            <div>
                <span>JavaSdk sdk = new JavaSdk("</span>
                <span>{{sdk.secret}}</span>
                <span>");</span>
            </div>
            <br/>
            <div>// {{'dataCenter.model' | t}}</div>
            <div>sdk.setDebug(true);</div>
            <br/>
            <div>/* {{'dataCenter.importEventStart' | t}} */</div>
            <div>JSONObject properties = new JSONObject();</div>
            <br/>
            <div>// phone, email {{'dataCenter.isUserKey' | t}}</div>
            <div>properties.put("phone", "183****6527");</div>
            <div>properties.put("email", "tianshl@qdum.com");</div>
            <br/>
            <div>// orderId, orderTime, amount {{'dataCenter.isEventNormal' | t}}</div>
            <div>properties.put("orderId", "20180808080800001");</div>
            <div>properties.put("orderTime", "2018-08-08 08:08:08");</div>
            <div>properties.put("amount", 998);</div>
            <br/>
            <div>// eventId, create_time {{'dataCenter.extraParam' | t}}</div>
            <div>properties.put("event_id", "20180808080800001");</div>
            <div>properties.put("create_time", "2018-08-08 08:08:08");</div>
            <br/>
            <div>// {{'dataCenter.sendRequest' | t}}</div>
            <div>String response = sdk.event("orderDetail", properties);</div>
            <div>// {{'dataCenter.outPut' | t}}</div>
            <div>System.out.println(response);</div>
            <div>/* {{'dataCenter.importEventEnd' | t}} */</div>
        </div>
        <br/><br/>

        <h3>{{'dataCenter.deleteUserSample' | t}}</h3>
        <br/>
        <div>// {{'dataCenter.statement' | t}}</div>
        <div>
            <span>JavaSdk sdk = new JavaSdk("</span>
            <span>{{sdk.secret}}</span>
            <span>");</span>
        </div>
        <br/>
        <div>// {{'dataCenter.model' | t}}</div>
        <div>sdk.setDebug(true);</div>
        <br/>
        <div>/* {{'dataCenter.deleteStart' | t}} */</div>
        <div>JSONObject properties = new JSONObject();</div>
        <br/>
        <div>// phone, email {{'dataCenter.isUserKey' | t}}</div>
        <div>properties.put("phone", "183****6527");</div>
        <div>properties.put("email", "tianshl@qdum.com");</div>
        <br/>
        <div>// {{'dataCenter.sendRequest' | t}}</div>
        <div>String response = sdk.userDelete(properties);</div>
        <div>// {{'dataCenter.outPut' | t}}</div>
        <div>System.out.println(response);</div>
        <div>/* {{'dataCenter.deleteEnd' | t}} */</div>
        <br/><br/>

        <h3>{{'dataCenter.back' | t}}</h3>
        <br/>
        <h3>{{'dataCenter.correct' | t}}</h3>
        <br/>
        <div>{"errcode":0,"errmsg":"{{'dataCenter.requestSuccess' | t}}"}</div>
        <br/>
        <h3>{{'dataCenter.errorBack' | t}}</h3>
        <br/>
        <div>{"errcode":10001,"errmsg":"{{'dataCenter.jsonFailed' | t}}"}</div>
        <br/>
        <h3>{{'dataCenter.codeDesc' | t}}</h3>
        <br/>
        <table>
            <tr>
                <td>{{'dataCenter.returnCode' | t}}</td>
                <td class="indent">{{'dataCenter.desc' | t}}</td>
            </tr>
            <tr>
                <td>0</td>
                <td class="indent">{{'dataCenter.requestSuccess' | t}}</td>
            </tr>
            <tr>
                <td>10000</td>
                <td class="indent">{{'dataCenter.systemErr' | t}}</td>
            </tr>
            <tr>
                <td>10001</td>
                <td class="indent">{{'dataCenter.jsonFailed' | t}}</td>
            </tr>
            <tr>
                <td>10002</td>
                <td class="indent">{{'dataCenter.notIlle' | t}}</td>
            </tr>
            <tr>
                <td>10003</td>
                <td class="indent">{{'dataCenter.abcent' | t}}</td>
            </tr>
            <tr>
                <td>10004</td>
                <td class="indent">{{'dataCenter.listEmpty' | t}}</td>
            </tr>
            <tr>
                <td>20000</td>
                <td class="indent">{{'dataCenter.verifyFailed' | t}}</td>
            </tr>
            <tr>
                <td>20001</td>
                <td class="indent">{{'dataCenter.noKey' | t}}</td>
            </tr>
            <tr>
                <td>20002</td>
                <td class="indent">{{'dataCenter.needOneKey' | t}}</td>
            </tr>
            <tr>
                <td>20003</td>
                <td class="indent">{{'dataCenter.checkFailed' | t}}</td>
            </tr>
        </table>
        <br/><br/>
        <h3>{{'dataCenter.remark' | t}}</h3>
        <br/>
        <div>{{'dataCenter.remarkDetail' | t}}</div>
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
                EtlApiV1.downloadSDK()
                    .then(res => {
                        downloadArrayBufferAsFile('java_sdk.jar', res.body, 'application/octet-stream')
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
</style>
