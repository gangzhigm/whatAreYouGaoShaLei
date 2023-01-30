<template>
  <div class="open-platform-api">
    <!-- API调取统计 -->
    <div class="total">
        <p class="api-title">{{ "openPlat.apiStatistics" | t }}</p>
        <ul class="title-summary">
            <li>
            <div class="hreficon">
                <svg aria-hidden="true">
                <use xlink:href="#icon-lianjie"></use>
                </svg>
            </div>
            <div class="api-data">
                <p class="num" @click="apiInfoList">
                {{ apiTotalData.availableApiCount }}/{{
                    apiTotalData.allApiCount
                }}
                </p>
                <p>{{ "openPlat.totalRequest" | t }}</p>
            </div>
            </li>
            <li>
            <div class="hreficon">
                <svg aria-hidden="true">
                <use xlink:href="#icon-lianjie"></use>
                </svg>
            </div>
            <div class="api-data">
                <p>{{ apiTotalData.apiLimitCount ? apiTotalData.apiLimitCount : "/" }}</p>
                <p>{{ "openPlat.tunableApi" | t }}</p>
            </div>
            </li>
            <li>
            <div class="timeicon">
                <svg aria-hidden="true">
                <use xlink:href="#icon-time"></use>
                </svg>
            </div>
            <div class="api-data">
                <p>{{ apiTotalData.resetDate ? apiTotalData.resetDate : "/"}}</p>
                <p>{{ "openPlat.setTimes" | t }}</p>
            </div>
            </li>
        </ul>
    </div>
    <!-- API认证信息 -->
    <div class="total">
        <p class="api-title">
            {{ "openPlat.authentication" | t }}
            <a
            class="num"
            href="https://open.dmartech.cn"
            target="_blank"
            >{{ "openPlat.doc" | t }}</a>
            <a
            class="num"
            href="https://doc.dmartech.cn/api-kai-fang-ping-tai/kai-fa-qian-bi-du/jie-kou-tiao-yong-xian-zhi-shuo-ming"
            target="_blank"
            >{{ "openPlat.description" | t }}</a>
        </p>
        <p class="securitytip red-text">{{ "openPlat.security" | t }}</p>
        <p class="securitytip red-text tips">{{ "openPlat.tip" | t }}</p>
        <div class="key">
            <span>access-key</span
            ><input
            type="text"
            class="inputbg input"
            readonly="value"
            v-model="apiAuth.accessKey"
            />
        </div>
        <div class="key access">
            <span>accessKeySecret</span>
            <input class="input" :type="type" v-model="apiAuth.accessSecret" readonly="value" />
            <svg
            aria-hidden="true"
            v-if="type === 'text'"
            @click="type = 'password'"
            :class="{
                'icon-disable': $has('openPlatform_accessKeySecret_viewOrHide'),
            }"
            >
            <use xlink:href="#icon-eye"></use>
            </svg>
            <svg
            aria-hidden="true"
            v-if="type === 'password'"
            @click="type = $has('openPlatform_accessKeySecret_viewOrHide') ? 'password' : 'text'"
            :class="{
                'disabled' : $has('openPlatform_accessKeySecret_viewOrHide')
            }"
            >
            <use xlink:href="#icon-eye-closed"></use>
            </svg>
            <div class="num margin-text accessBlock" :class="{ 'disabled' : $has('openPlatform_accessKeySecret_reset') }" @click="resetaccessKey">{{
            "openPlat.reset" | t
            }}</div>
        </div>
    </div>
    <!-- 白名单 -->
    <div class="total">
        <p class="api-title">{{ "openPlat.white" | t }}</p>
        <p class="securitytip white-tip">{{ "openPlat.noteLeast" | t }}</p>
        <p class="white-tip margintip">{{ "openPlat.nohttp" | t }}</p>
        <p class="white-tip margintip">{{ "openPlat.noteMost" | t }}</p>
        <button
            class="btn btn-theme btn-md addbtn"
            @click="openapiModal"
            :disabled="
            whiteListData.length >= 5 || $has('openPlatform_ipOrDomain_add')
            "
        >
            {{ "openPlat.addIp" | t }}
        </button>
        <div class="simplify-table">
            <table>
            <thead>
                <tr>
                <td>{{ "openPlat.type" | t }}</td>
                <td>{{ "openPlat.content" | t }}</td>
                <td>{{ "openPlat.operating" | t }}</td>
                </tr>
            </thead>
            <tbody v-for="(item, index) in whiteListData" :key="index">
                <!-- 0:ip 1 :域名 -->
                <tr class="hover-default">
                <td>
                    {{ item.type === 0 ? "openPlat.IP" : "openPlat.domain" | t }}
                </td>
                <td>{{ item.content }}</td>
                <td>
                    <button
                    class="num btns"
                    @click="delipMmodelShow(item)"
                    :class="{ 'disabled': $has('openPlatform_ipOrDomain_delete') }"
                    >
                    {{ "openPlat.delete" | t }}
                    </button>
                </td>
                </tr>
            </tbody>
            </table>
        </div>
        <list-empty
            v-if="whiteListData.length === 0"
            :name="$t('openPlat.data')"
            class="empty"
        />
        <div class="bot"></div>
    </div>
    <!-- 调用接口总数 -->
    <modal
        v-if="requestModal"
        :title="$t('openPlat.apiTitle')"
        @close="requestModal = false"
        size="lg"
    >
      <p>{{ "openPlat.underline" | t }}</p>
      <div class="tablemodel">
        <ul class="tabth">
            <li class="topnone leftnone">{{ "openPlat.model" | t }}</li>
            <li class="topnone litow">{{ "openPlat.request" | t }}</li>
            <li class="topnone">{{ "openPlat.limit" | t }}</li>
            <li class="topnone">{{ "openPlat.frequency" | t }}</li>
        </ul>
        <ul v-for="(item, index) in apiInfo" :key="index">
            <li class="leftnone">
                {{ language === "zh-CN" ? item.name : item.enName }}
            </li>
            <div class="tabtow">
                <li
                class="litow"
                v-for="(ite, inde) in item.apiInfoList"
                :key="inde"
                :class="ite.type === 0 ? 'underline' : ''"
                >
                {{ language === "zh-CN" ? ite.name : ite.enName }}
                </li>
            </div>
            <div class="tabtow">
                <li v-for="(ite, inde) in item.apiInfoList" :key="inde">
                <p v-if="ite.type === 1 && language === 'zh-CN'">
                    <span class="redtext"
                    >{{ ite.speedLimitDate }}
                    <span v-if="ite.speedLimitDateType === 1">天</span>
                    <span v-if="ite.speedLimitDateType === 2">周</span>
                    <span v-if="ite.speedLimitDateType === 3">月</span>
                    </span>
                    内最大调取
                    <span class="redtext">{{
                    ite.speedLimitCount.toLocaleString()
                    }}</span>
                    次
                </p>
                <p v-if="ite.type === 1 && language === 'en'">
                    Maximum
                    <span class="redtext">{{ ite.speedLimitCount.toLocaleString() }}</span>
                    in
                    <span class="redtext"
                    >{{ ite.speedLimitCount.toLocaleString() }}
                    <span v-if="ite.speedLimitDateType === 1">days</span>
                    <span v-if="ite.speedLimitDateType === 2">weeks</span>
                    <span v-if="ite.speedLimitDateType === 3">month</span>
                    </span>
                </p>
                <p v-if="ite.type === 0">/</p>
                </li>
            </div>
            <div class="tabtow">
                <li v-for="(ite, inde) in item.apiInfoList" :key="inde">
                <p v-if="ite.type === 1">
                    <span :class="[ite.surplusCount == 0 ? 'redtext' : '']">
                    {{ ite.useCount.toLocaleString() }}/
                    {{ ite.surplusCount.toLocaleString() }}
                    </span>
                </p>
                <p v-if="ite.type === 0">/</p>
                </li>
            </div>
        </ul>
      </div>
      <list-empty
            v-if="apiInfo.length === 0"
            :name="$t('openPlat.data')"
            class="empty"
       />
      <div class="btnflex">
            <button
            class="btn btn-theme btn-md margin-text"
            @click="requestModal = false"
            >
            {{ "openPlat.ok" | t }}
            </button>
      </div>
    </modal>
    <!-- 重置 accessKeySecret -->
    <confirm
        v-if="accessModal"
        :title="$t('openPlat.reset')"
        @cancel="accessModal = false"
        @confirm="accessConfirm"
        >
        <p>
            <span>{{ "openPlat.sure" | t }}</span>
            <span class="red-text">{{ "openPlat.reset" | t }}</span>
            <span>{{ "openPlat.resetKey" | t }}</span>
        </p>
    </confirm>
    <!-- 添加IP或域名 -->
    <confirm
        v-if="apiModal"
        :title="$t('openPlat.addIp')"
        @cancel="apiModal = false"
        @confirm="apiConfirm"
    >
      <div class="form-field">
            <span class="margin-text">{{ "openPlat.type" | t }}</span>
            <!-- 0:ip 1 :域名 -->
            <radio :source="0" v-model="sourceType" @input="selectApi">IP</radio>
            <radio :source="1" v-model="sourceType" @input="selectApi">{{
            "openPlat.domain" | t
            }}</radio>
      </div>
      <div class="form-field">
            <label class="margin-text">{{ "openPlat.content" | t }}</label>
            <input class="input" type="text" v-model.trim="ipInput" />
      </div>
    </confirm>
    <!-- 删除ip或域名 -->
    <confirm
        v-if="delModal"
        :title="$t('openPlat.del')"
        @cancel="delModal = false"
        @confirm="delConfirm()"
        >
        <p class="modulauto">{{ "openPlat.confirmDelete" | t }}</p>
    </confirm>
  </div>
</template>
<script type="text/babel">
import { I18N_STORE_NAME } from '@/locales';
import { ManageApi } from '@/api';
export default {
    name: 'api',
    data() {
        return {
            apiTotalData: '', //api统计数据
            apiAuth: '', //api认证信息
            apiInfo: '', // api接口总数居
            whiteListData: '', //白名单列表数据
            type: 'password', // accessKeySecret是否可见
            authCode: '',
            // 添加ip或域名
            sourceType: 0,
            ipInput: '',
            //删除IP或域名
            delData: '',
            // 弹窗
            requestModal: false, //调用接口总数
            accessModal: false, //重置accessKeySecret
            apiModal: false, // 添加ip或域名
            delModal: false, // 删除ip或域名
        };
    },
    mounted() {
        this.authInfo();
    },
    computed: {
        // 获取当前语言环境
        language() {
            return this.$store.state[I18N_STORE_NAME].lang;
        },
        // 重置 accessKeySecret点击权限
        acceskeyFlag() {
            return this.$has('openPlatform_accessKeySecret_reset');
        },
        // 添加ip或域名权限
        addIpflag() {
            return this.$has('openPlatform_ipOrDomain_add');
        },
        // 删除ip或域名权限
        delIpflag() {
            return this.$has('openPlatform_ipOrDomain_delete');
        },
    },
    methods: {
        // 获取api统计数据
        apiTotal() {
            ManageApi.statisticalData().then((res) => {
                this.apiTotalData = res.body.data;
            });
        },
        // 调用接口总数
        apiInfoList() {
            this.requestModal = true;
            ManageApi.apiInfoList().then((res) => {
                this.apiInfo = res.body.data.resultList;
            });
        },
        // 获取api认证信息
        authInfo() {
            ManageApi.authInfo().then((res) => {
                if (res.body.data) this.apiAuth = res.body.data;
                // 新账号必须先调此接口初始化开发平台信息才可以调用其他接口
                if (res.body.code === 200) {
                    this.apiTotal();
                    this.whiteList();
                }
            });
        },
        // 重置 accessKeySecret 弹窗显示
        resetaccessKey() {
            if (this.acceskeyFlag) return;
            this.accessModal = true;
        },
        // 确定重置 accessKeySecret
        accessConfirm() {
            ManageApi.resetAccessSecret().then((res) => {
                if (res.body.data.accessSecret) this.apiAuth.accessSecret = res.body.data.accessSecret;
                this.accessModal = false;
                this.$toast(this.$t('openPlat.resetSucc'), 'success');
            })
                .catch(() => {
                    this.$toast(this.$t('openPlat.resetFail'), 'warn');
                });
        },
        // 获取白名单列表
        whiteList() {
            ManageApi.whiteList().then((res) => {
                if (res.body.data.resultList.length >= 0) {
                    this.whiteListData = res.body.data.resultList;
                }
            });
        },
        // 切换ip和域名
        selectApi() {
            this.ipInput = '';
        },
        // 添加ip或域名
        openapiModal() {
            if (this.addIpflag) return;
            this.ipInput = '';
            this.sourceType = 0;
            this.apiModal = true;
        },
        apiConfirm() {
            if (this.ipInput === '') {
                this.$toast(this.$t('openPlat.contentEmpty'), 'warn');
            } else {
                if (this.sourceType === 0) {
                    const IPREG4 = /((2(5[0-5]|[0-4]\d))|[0-1]?\d{1,2})(\.((2(5[0-5]|[0-4]\d))|[0-1]?\d{1,2})){3}/;
                    const IPREG6 = /^\s*((([0-9A-Fa-f]{1,4}:){7}([0-9A-Fa-f]{1,4}|:))|(([0-9A-Fa-f]{1,4}:){6}(:[0-9A-Fa-f]{1,4}|((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3})|:))|(([0-9A-Fa-f]{1,4}:){5}(((:[0-9A-Fa-f]{1,4}){1,2})|:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3})|:))|(([0-9A-Fa-f]{1,4}:){4}(((:[0-9A-Fa-f]{1,4}){1,3})|((:[0-9A-Fa-f]{1,4})?:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}))|:))|(([0-9A-Fa-f]{1,4}:){3}(((:[0-9A-Fa-f]{1,4}){1,4})|((:[0-9A-Fa-f]{1,4}){0,2}:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}))|:))|(([0-9A-Fa-f]{1,4}:){2}(((:[0-9A-Fa-f]{1,4}){1,5})|((:[0-9A-Fa-f]{1,4}){0,3}:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}))|:))|(([0-9A-Fa-f]{1,4}:){1}(((:[0-9A-Fa-f]{1,4}){1,6})|((:[0-9A-Fa-f]{1,4}){0,4}:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}))|:))|(:(((:[0-9A-Fa-f]{1,4}){1,7})|((:[0-9A-Fa-f]{1,4}){0,5}:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}))|:)))(%.+)?\s*$/;
                    if (!(IPREG4.test(this.ipInput) || IPREG6.test(this.ipInput))) {
                        this.$toast(this.$t('openPlat.ipnot'), 'warn');
                    } else {
                        ManageApi
                            .createWhiteList(this.sourceType, this.ipInput)
                            .then(() => {
                                this.apiModal = false;
                                this.$toast(this.$t('openPlat.addsucc'), 'success');
                                this.whiteList();
                            })
                            .catch((res) => {
                                this.$toast(res.body.message, 'warn');
                            });
                    }
                }
                if (this.sourceType === 1) {
                    const APIREG = /^[a-zA-Z0-9][-a-zA-Z0-9]{0,62}(\.[a-zA-Z0-9][-a-zA-Z0-9]{0,62})+\.?/g;
                    const APICH = /[\u3002|\uff1f|\uff01|\uff0c|\u3001|\uff1b|\uff1a|\u201c|\u201d|\u2018|\u2019|\uff08|\uff09|\u300a|\u300b|\u3008|\u3009|\u3010|\u3011|\u300e|\u300f|\u300c|\u300d|\ufe43|\ufe44|\u3014|\u3015|\u2026|\u2014|\uff5e|\ufe4f|\uffe5]/;
                    if (APICH.test(this.ipInput)) {
                        this.$toast(this.$t('openPlat.domainnot'), 'warn');
                    } else {
                        if (!APIREG.test(this.ipInput)) {
                            this.$toast(this.$t('openPlat.domainnot'), 'warn');
                        } else {
                            ManageApi
                                .createWhiteList(this.sourceType, this.ipInput)
                                .then(() => {
                                    this.apiModal = false;
                                    this.$toast(this.$t('openPlat.addsucc'), 'success');
                                    this.whiteList();
                                })
                                .catch((res) => {
                                    this.$toast(res.body.message, 'warn');
                                });
                        }
                    }

                }
            }
        },
        // 删除ip或域名Model框展示
        delipMmodelShow(item) {
            if (this.delIpflag) return;
            this.delModal = true;
            this.delData = item;
        },
        // 删除ip或域名
        delConfirm() {
            ManageApi
                .deleteWhiteList(this.delData.type, this.delData.content)
                .then(() => {
                    this.delModal = false;
                    this.$toast(this.$t('openPlat.delsucc'), 'success');
                    this.whiteList();
                })
                .catch(() => {
                    this.$toast(this.$t('openPlat.delfail'), 'warn');
                });
        },
    },
};
</script>
<style lang="scss" type="text/scss" rel="stylesheet/scss" scoped>
    @import "../../common/scss/base/variables";
    @import "../../common/scss/base/mixin";
    .open-platform-api {
        .total {
            background-color: white;
            padding: 0 24px;
            .bot {
                width: 100%;
                height: 20px;
                background: white;
            }
            .pointer {
                cursor: pointer;
            }
            .num {
                cursor: pointer;
                color: #3bc2a9;
                &:hover {
                    color: #41d7bc;
                }
            }
            .accessBlock {
                display: inline-block;
                width: 140px;
            }
            .btns {
                border: none;
                background-color: white;
            }
            .disabled {
                color: #8c8c8c;
                &:hover {
                    color: #8c8c8c;
                    cursor: not-allowed;
                }
            }
            .api-title {
                font-size: 18px;
                color: #8c8c8c;
                height: 32px;
                padding: 20px 0 10px 15px;
                a {
                    font-size: 14px;
                    padding: 0 10px;
                }
            }
            .title-summary {
                display: flex;
                justify-content: space-around;
                margin-bottom: 16px;
                padding-bottom: 20px;
                li {
                    position: relative;
                    flex: 1 1 200px;
                    margin: 10px 45px 10px 15px;
                    border: 1px solid #d1d6e0;
                    .hreficon {
                        width: 30px;
                        height: 30px;
                        display: flex;
                        justify-content: center;
                        align-items: center;
                        margin: 33px 32px;
                        border: 2px solid #0cc2a9;
                        border-radius: 50% 50%;
                        float: left;
                        svg {
                            width: 20px;
                            height: 20px;
                            color: #0cc2a9;
                            fill: #0cc2a9;
                        }
                    }
                    .timeicon {
                        width: 60px;
                        height: 60px;
                        display: flex;
                        justify-content: center;
                        align-items: center;
                        margin: 20px 15px;
                        float: left;
                        svg {
                            width: 34px;
                            height: 34px;
                            color: #0cc2a9;
                            fill: #0cc2a9;
                        }
                    }

                    .api-data {
                        float: left;
                        p:nth-of-type(1) {
                            font-weight: bold;
                            font-size: 16px;
                            padding: 20px 0;
                        }
                    }
                }
            }
            .hover-default {
                &:hover {
                    background-color: white;
                    cursor: default;
                }
            }
        }
        .redtext {
            color: #f64d4f;
        }
        .securitytip {
            padding: 5px 10px;
        }
        .tips {
            padding-left: 70px;
            margin-bottom: 20px;
        }
        .key {
            padding: 25px 5px;
            display: block;
            span:nth-of-type(1) {
                width: 200px;
                float: left;
                line-height: 30px;
            }
            input {
                float: left;
                width: 250px;
                border: 1px solid #d1d6e0;
            }
            svg {
                width: 25px;
                height: 25px;
                float: left;
                margin: 5px 10px;
                color: #0cc2a9;
                fill: #0cc2a9;
                cursor: pointer;
            }
        }
        .access {
            margin-bottom: 20px;
        }
        .empty {
            border: 1px solid #d1d6e0;
            border-top: none;
        }
        .addbtn {
            margin: 20px 0;
        }
        .margin-text {
            margin: 10px;
        }
        .margin-lab {
            margin: 20px 0 0 40px;
        }
        .white-tip {
            color: #aaa;
        }
        .margintip {
            margin: 0 0 10px 34px;
        }
        .white {
            margin: 10px 0 22px 22px;
        }
        .inputbg {
            background-color: #f0f2f5;
            border: 1px solid #d1d6e0;
        }
        .tablemodel {
            box-sizing: border-box;
            width: 100%;
            height: 400px;
            overflow: auto;
            border: 1px solid #d1d6e0;
            margin-top: 20px;
            .litow {
                width: 360px;
            }
            .tabth {
                background-color: #f0f2f5;
            }
            ul {
                display: flex;
                justify-content: flex-start;
                li {
                    border-left: 1px solid #d1d6e0;
                    border-top: 1px solid #d1d6e0;
                    width: 200px;
                    height: 32px;
                    text-align: center;
                    line-height: 32px;
                }
            }
            .tabtow {
                display: flex;
                flex-flow: column;
                flex-wrap: wrap;
            }
            .topnone {
                border-top: none;
            }
            .leftnone {
                border-left: none;
            }
            .underline {
                text-decoration: line-through;
                color: #d1d6e0;
            }
        }
        .btnflex {
            display: flex;
            justify-content: flex-end;
        }
        .modulauto {
            display: flex;
            justify-content: center;
            align-items: center;
        }
    }
</style>
