<template>
    <div class="wecom-staff-auth" v-if="apiLoaded">
        <div class="auth-guide" v-if="responseCode == 200">
            <h6>
                <p>{{'员工敏感信息授权指南'}}</p>
                <p>{{'Sensitive Information Authorization Guidelines'}}</p>
            </h6>
            <div class="part">
                <p>{{'如果您是第一次通过个人敏感信息授权页面点击“同意”按钮跳转本页的，系统会自动获取一次您的敏感信息，无需手动操作。'}}</p>
                <p>{{'If you are jumping to this page for the first time by clicking the "Agree" button on the personal sensitive information authorization page, the system will automatically obtain your sensitive information once, no need to do it manually.'}}</p>
            </div>
            <div class="part">
                <p><span>{{'需要注意'}}</span>{{'，如果您在授权后修改了您的信息，需要按照以下步骤手动操作才能完成更新。'}}</p>
                <p><span>{{'It should be noted'}}</span>{{' that if you change your information after authorization, you will need to follow the steps below to update it manually.'}}</p>
            </div>
            <div class="part">
                <p>{{'如何再次更新您的敏感信息：'}}</p>
                <p>{{'How to update your sensitive information again:'}}</p>
            </div>
            <div class="part">
                <p>{{'1）在企微手机端找到工作台里的企业应用，点击进入的应用主页面。'}}</p>
                <p>{{'Find the application in Workbench on your WeCom, click and enter the main page of the application.'}}</p>
                <img :src="guidePics[0]">
                <p>{{'2）点击主页面右上角的“...”图标进入应用详情页面，如果点击后出现了弹窗则点击弹窗中的应用详情（未出现则忽略）。'}}</p>
                <p>{{'Click on the "..." in the upper right corner of the main page icon and enter the page of application details, and if a pop-up window appears after clicking on it, click on the application details in the pop-up window (ignore it if it does not appear).'}}</p>
                <img :src="guidePics[1]">
                <img :src="guidePics[2]">
                <p>{{'3）点击“个人敏感信息授权管理”菜单项进入管理页面，注意，“个人敏感信息授权管理”操作按钮只在企业微信4.0.8及更高版本内提供，请先确保企微升级到最新版本后再操作本步骤。'}}</p>
                <p>{{'Click "Personal sensitive information authorization management" to enter the management page, note that the "Personal sensitive information authorization management" is only available in WeCom 4.0.8 and higher versions, please make sure WeCom upgraded to the latest version before operation. This step.'}}</p>
                <img :src="guidePics[3]">
                <p>{{'4）点击右上角“管理”进入管理页面。'}}</p>
                <p>{{'Click "Manage" in the upper right corner to enter the management page.'}}</p>
                <img :src="guidePics[4]">
                <p>{{'5）勾选全部选项，点击保存即可完成更新。'}}</p>
                <p>{{'Check all options and click Save to complete the update'}}</p>
                <img :src="guidePics[5]">
            </div>
        </div>
        <div class="logo-fail" v-else>
            <img :src="logoFail">
            <p>{{'授权失败，您不在应用的可见范围内或您拒绝授权'}}</p>
            <p>{{'Authorization failed, You are not allowed user of this WeCom application，or denied to authorize.'}}</p>
        </div>
    </div>
</template>
<script>
    import LINKS from '@/LINKS';
    const getUrl = (url) => {
        return new URL(url, import.meta.url).href;
    };

    export default {
        name: 'wecomStaffAuth',
        data() {
            return {
                guidePics: [    // 授权指南图示
                    getUrl('./wecomStaffAuth-guide1.jpg'),
                    getUrl('./wecomStaffAuth-guide2.jpg'),
                    getUrl('./wecomStaffAuth-guide3.jpg'),
                    getUrl('./wecomStaffAuth-guide4.jpg'),
                    getUrl('./wecomStaffAuth-guide4-2.jpg'),
                    getUrl('./wecomStaffAuth-guide5.jpg'),
                ],
                logoFail: getUrl('./auth-fail.png'),   // 失败logo
                code: '',   // 重定向返回的code
                state: '',  // 重定向返回的state
                apiLoaded: false,   // 接口调用完成
                responseCode: '',   // 接口返回状态
            };
        },
        created() {
            window.document.body.style.height = window.innerHeight + 'px';
        },
        mounted() {
            this.code = this.$route.query.code;
            this.state = this.$route.query.state;
            let _this = this;

            // 获取参数后传参
            if (this.code) {
                let xmlhttp;
                if (window.XMLHttpRequest) {
                    //  IE7+, Firefox, Chrome, Opera, Safari 浏览器执行代码
                    xmlhttp = new XMLHttpRequest();
                } else {
                    // IE6, IE5 浏览器执行代码
                    xmlhttp = new ActiveXObject('Microsoft.XMLHTTP');
                }
                // request
                xmlhttp.timeout = 0;
                xmlhttp.open('GET', LINKS.WECOM_API_BASE + '/web-api/wecom/v1/getUserDetail?code=' + this.code + '&corpId=' + this.state, true);
                xmlhttp.responseType = 'json';
                xmlhttp.send();
                // response
                xmlhttp.onreadystatechange = function () {
                    if (xmlhttp.readyState === 4 && xmlhttp.status === 200) {
                        let response = '';
                        // IE Object响应结果为string类型
                        typeof xmlhttp.response === 'string' ? response = JSON.parse(xmlhttp.response) : response = xmlhttp.response;
                        _this.responseCode = response.code;
                        _this.apiLoaded = true;
                    }
                };
            } else {
                this.apiLoaded = true;
            }
        }
    };
</script>
<style lang="scss">
    @import "../../common/scss/base/variables";
    @import "../../common/scss/base/mixin";

    .wecom-staff-auth {
        width: 100%;
        height: 100%;
        background: #ffffff;
        overflow-y: scroll;
        font-size: 18px;
        padding: 0 15px;
        box-sizing: border-box;

        .auth-guide {
            font-size: 14px;
            line-height: 18px;

            h6 {
                font-size: 18px;
                text-align: center;
                font-weight: normal;
                margin: 20px auto;
            }

            .part {
                margin: 0 auto 30px;

                p {
                    margin: 10px auto;

                    span {
                        color: #ff0000
                    }
                }
                    
            }

            img {
                display: block;
                margin: 15px auto 30px;
                width: 75%;
            }
        }
        .logo-fail {
            padding: 0 15px;
            text-align: center;

            img {
                display: block;
                margin: 150px auto 20px;
                width: 137.5px;
                height: 105px;
            }
        }
    }
</style>
