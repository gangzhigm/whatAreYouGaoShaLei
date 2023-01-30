<template>
    <div class="export-original-data">
        <div class="links" :class="{'links-width':language==='en'}">
            <div class="links-view" v-for="link in linksList" :key="link.id">
                <h4>{{link.itemName}}</h4>
                <ul v-for="item in link.items" :key="item.name">
                    <li class="tab-link" :class="{active: filterOption.currentName === item.name
                            && filterOption.currentItemName === link.itemName}"
                        @click="showExportView(link,item)">{{item.name}}
                    </li>
                </ul>
            </div>
        </div>
        <!--邮件-->
        <template v-if="filterOption.currentItemKey === 'email'">
            <!--邮件营销原始数据-->
            <exportEmailData v-if="filterOption.currentKey === 'original'" :journeyData="journeyData"
                             @changeJourney="changeJourney" @changeToOldData="changeToOldData"/>
            <!--邮件发送明细-->
            <exportOldEmailData v-if="filterOption.currentKey === 'old'"
                                @changeJourney="changeJourney"/>
            <!--邮件比较数据-->
            <emailDataCompare v-if="filterOption.currentKey === 'compare'" :exportPKData="exportPKData"/>
            <!--华为定制 邮件定时任务-->
            <emailTimeTask v-if="filterOption.currentKey === 'timing'"></emailTimeTask>
            <!--nike-->
            <nickReport v-if="filterOption.currentKey === 'nick'"/>
        </template>


        <!--短信-->
        <template v-if="filterOption.currentItemKey === 'SMS'">
            <!--上行数据-->
            <exportUpstreamData v-if="filterOption.currentKey === 'Upstream'"
                                :dataType="filterOption.currentItemKey" :emailSubject="emailSubject"/>
            <!--nike-->
            <nickReport v-if="filterOption.currentKey === 'nickSMSAndMMS'" :exportType="filterOption.currentKey"/>
        </template>


        <!--短信，彩信-->
        <template v-if="filterOption.currentItemKey === 'SMS' || filterOption.currentItemKey === 'MMS'">
            <!--营销原始数据-->
            <exportSMSOrMMSData v-if="filterOption.currentKey === 'original'" :dataType="filterOption.currentItemKey"
                                :journeyData="journeyData" @changeJourney="changeJourney"
                                @changeToOldData="changeToOldData"/>
            <!--点击短链数据-->
            <exportSMSOrMMSClickData v-if="filterOption.currentKey === 'click'" :dataType="filterOption.currentItemKey"
                                     :itemKeys="filterOption.currentKey" :journeyData="journeyData"/>
            <!--API数据-->
            <exportAPiOriginalData v-if="filterOption.currentKey === 'api'" :apiDataType="filterOption.currentItemKey"
                                   :itemKeys="filterOption.currentKey" :emailSubject="emailSubject"/>
        </template>
    </div>
</template>

<script>
    import exportAPiOriginalData from './export-api-original-data.vue';
    import exportUpstreamData from './export-Upstream-data.vue';
    import nickReport from './nike-report.vue';
    import exportOldEmailData from './export-old-email-data.vue';
    import emailDataCompare from './email-data-compare.vue';
    import exportEmailData from './export-email-data.vue';
    import exportSMSOrMMSData from './export-sms-or-mms-data.vue';
    import exportSMSOrMMSClickData from './export-sms-or-mms-click-data.vue';
    import emailTimeTask from './email-time-task.vue';
    import {I18N_STORE_NAME} from '@/locales';


    const LOCAL_JOURNEY_DATA = 'LOCAL_JOURNEY_DATA';

    export default {
        data() {
            return {
                filterOption: {
                    currentName: this.$t('data.rawData'),
                    currentItemName: this.$t('data.Email'),
                    currentItemKey: 'email',
                    currentKey: 'original'
                },
                linksList: [
                    {
                        itemName: this.$t('data.Email'),
                        itemKey: 'email',
                        items: [
                            {name: this.$t('data.rawData'), itemsKey: 'original', emailSubject: 'emailOriginal'},
                            {name: this.$t('data.oldVersion'), itemsKey: 'old', emailSubject: 'emailOld'},
                            {name: this.$t('data.mailCompare'), itemsKey: 'compare', emailSubject: 'emailCompare'}
                        ]
                    },
                    {
                        itemName: this.$t('material.sms'),
                        itemKey: 'SMS',
                        items: [
                            {name: this.$t('data.rawData'), itemsKey: 'original', emailSubject: 'smsOriginal'},
                            {name: this.$t('data.click'), itemsKey: 'click', emailSubject: 'smsClick'},
                            {name: this.$t('data.response'), itemsKey: 'Upstream', emailSubject: 'smsUpstream'},
                            {name: this.$t('data.api'), itemsKey: 'api', emailSubject: 'smsApi'},
                        ]
                    },
                    {
                        itemName: this.$t('dragJourney.mms'),
                        itemKey: 'MMS',
                        items: [
                            {name: this.$t('data.rawData'), itemsKey: 'original', emailSubject: 'mmsOriginal'},
                            {name: this.$t('data.click'), itemsKey: 'click', emailSubject: 'mmsClick'},
                            // 删除彩信上行回复 2019-07-29
                            // {name: this.$t('data.response'),itemsKey: 'Upstream'},
                            {name: this.$t('data.api'), itemsKey: 'api', emailSubject: 'mmsApi'},
                        ]
                    },
                ],
                journeyData: {},
                exportPKData: '',
                emailSubject: 'emailOriginal',
            };
        },
        computed: {
            //正式748 测试207
            cId() {
                return this.$store.state.user.cid;
            },
            // 是否是 nike 账号
            isNike() {
                return this.$store.state.user.isNikeCount;
            },
            // 华为类型账号
            isHw() {
                return this.$store.state.user.companyType === 1;
            },
            language() {
                return this.$store.state[I18N_STORE_NAME].lang;
            }
        },
        mounted() {
            // 有nike批次数据管理权限
            if (!this.$has('datacentre_marketing_export_nike')) {
                // nike 账号
                if (this.isNike) {
                    this.linksList[0].items.push({name: this.$t('data.nikeData'), itemsKey: 'nick'});
                    this.linksList[1].items.push({name: this.$t('data.nickSmsAndMmsReport'), itemsKey: 'nickSMSAndMMS'});
                }
            }
            //华为定制 "邮件定时任务"
            if (this.isHw) {
                this.linksList[0].items.push({name: this.$t('data.timeEmailTitle'), itemsKey: 'timing', emailSubject: 'emailTiming'});
            }
            this.journeyData = this.$route.params.noLocal ? {} : JSON.parse(localStorage.getItem(LOCAL_JOURNEY_DATA));
            switch (Number(this.$route.query.type)) {
                case 1: //短信
                    this.filterOption = {
                        currentName: this.$t('data.rawData'),
                        currentItemName: this.$t('material.sms'),
                        currentItemKey: 'SMS',
                        currentKey: 'original'
                    };
                    break;
                case 3: //彩信
                    this.filterOption = {
                        currentName: this.$t('data.rawData'),
                        currentItemName: this.$t('dragJourney.mms'),
                        currentItemKey: 'MMS',
                        currentKey: 'original'
                    };
                    break;
                case 6:
                    this.filterOption = {
                        currentName: this.$t('data.mailCompare'),
                        currentItemName: this.$t('data.Email'),
                        currentItemKey: 'email',
                        currentKey: 'compare'
                    };
                    this.exportPKData = this.$route.query.journey;
                    break;
                default:
                    this.filterOption = {
                        currentName: this.$t('data.rawData'),
                        currentItemName: this.$t('data.Email'),
                        currentItemKey: 'email',
                        currentKey: 'original'
                    };
                    break;
            }
        },
        beforeRouteLeave(to, from, next) {
            localStorage.removeItem(LOCAL_JOURNEY_DATA);
            next();
        },
        methods: {
            showExportView(links, item) {
                localStorage.removeItem(LOCAL_JOURNEY_DATA);
                this.journeyData = {};
                this.filterOption = {
                    currentName: item.name,
                    currentItemName: links.itemName,
                    currentItemKey: links.itemKey,
                    currentKey: item.itemsKey
                };
                this.emailSubject = item.emailSubject;
            },
            changeJourney() {
                localStorage.removeItem(LOCAL_JOURNEY_DATA);
                this.journeyData = {};
            },
            changeToOldData() {
                localStorage.removeItem(LOCAL_JOURNEY_DATA);
                this.journeyData = {};
                this.filterOption = {
                    currentName: this.$t('data.oldVersion'),
                    currentItemName: this.$t('data.Email'),
                    currentItemKey: 'email',
                    currentKey: 'old'
                };
            }
        },
        components: {
            exportAPiOriginalData,
            exportUpstreamData,
            nickReport,
            exportOldEmailData,
            emailDataCompare,
            exportEmailData,      // 邮件-营销原始数据
            exportSMSOrMMSData,   // 短信，彩信-营销原始数据
            exportSMSOrMMSClickData, // 短信，彩信-点击短链数据
            emailTimeTask, //华为定制 - 邮件定时任务
        },
    };
</script>
<style lang="scss">
    @import "../../../../common/scss/base/variables";
    @import "../../../../common/scss/base/mixin";

    .export-original-data {
        display: flex;
        height: 550px;

        .links {
            width: 130px;
            overflow: auto;
            .links-view {
                .tab-link {
                    line-height: 32px;
                    font-size: 14px;
                    color: #8c8c8c;
                    cursor: pointer;

                    &.active {
                        color: $theme;
                    }
                }
            }
        }
        .links-width{
            width: 210px;
        }
    }
</style>
