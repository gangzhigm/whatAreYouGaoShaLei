<template>
    <modal :title="$t('controller.ABTest')" :size="'lg'" @close="$emit('close')" class="controller-detail">
        <div class="form-field">
            <label class="label">{{'controller.stepName' | t}}</label>
            <span>{{controllers.name}}</span>
        </div>
        <div class="form-field">
            <label class="label">{{'controller.sendOptions' | t}}</label>
            <span>{{controllers.options}}</span>
        </div>
        <div class="form-field flex test-quota">
            <label class="label">{{'controller.testIndex' | t}}</label>
            <span v-if="controllers.index === 0">{{'controller.emailOpenNum' | t}}</span>
            <span v-if="controllers.index === 1">{{'controller.emailClickNum' | t}}</span>
            <div v-if="controllers.index === 2" class="links">
                {{'controller.specialLinks' | t}}{{'common.total' | t}}
                <span class="links-text" @click.stop="showLinks">{{controllers.links.length}}{{'controller.links' | t}}</span>
                <div class="links-detail" v-if="showLinksDetail" v-blur="hiddenLinksDetail">
                    <ul class="links-list">
                        <li class="links-item" v-for="links in controllers.links"
                            :title="links" :key="links">{{links}}</li>
                    </ul>
                </div>
            </div>
        </div>
        <div class="form-field">
            <label class="label">{{'journey.sendProfile' | t}}</label>
            <div class="simplify-table">
                <table>
                    <thead>
                        <tr>
                            <td width="20%">{{'controller.batchList' | t}}</td>
                            <td>{{'data.timeZone' | t}}</td>
                            <td width="15%">{{'massSend.sendTime' | t}}</td>
                            <td>{{'data.sendNum' | t}}</td>
                            <td :title="$t('data.sendSum')">{{'data.sendSum' | t}}</td>
                            <td :title="$t('data.independenceOpen')">{{'data.independenceOpen' | t}}</td>
                            <td>{{'data.clicked' | t}}</td>
                            <td>{{'data.Actions' | t}}</td>
                        </tr>
                    </thead>
                    <tbody>
                        <tr v-for="sendDetail in controllers.sendDetailList" :key="sendDetail.taskId">
                            <td :title="sendDetail.taskName">{{sendDetail.taskName}}</td>
                            <td :title="timeZone ? timer.$getByKey(timeZone).name : ''">
                                {{timeZone ? 'GMT' + timeZone : ''}}
                            </td>
                            <td :title="sendDetail.taskDate">{{sendDetail.taskDate}}</td>
                            <td>{{sendDetail.sendCount}}</td>
                            <td>{{sendDetail.deliveryCount}}</td>
                            <td>{{sendDetail.ownOpen}}</td>
                            <td>{{sendDetail.ownClick}}</td>
                            <td>
                                <svg aria-hidden="true" class="action-icon first-icon icon-eye"
                                     @click="reviewEmail(sendDetail)" v-title="$t('common.preview')">
                                    <use xlink:href="#icon-eye"></use>
                                </svg>
                                <svg aria-hidden="true" class="action-icon icon-pie"
                                     @click="report(sendDetail)" v-title="$t('dragJourney.report')">
                                    <use xlink:href="#icon-pie"></use>
                                </svg>
                            </td>
                        </tr>
                    </tbody>
                </table>
                <list-empty v-if="!controllers.sendDetailList.length&&!loading"></list-empty>
                <inline-loading v-if="loading"></inline-loading>
            </div>
        </div>
    </modal>
</template>

<script>
    import { JourneyApiV3, JourneyMaterialApiV1 } from '@/api';
    import {DRAGGABLE_JOURNEY_STORE_NAME} from '@/store/vuex/modules/canvasStore';
    import {TIME_ZONE_RNAGES} from '@/common/utils/timeZone';
    import { mapState } from 'vuex';
    const LOCAL_JOURNEY_DATA = 'LOCAL_JOURNEY_DATA';

    export default {
        name: 'new-AB-test-controller-detail',
        props: {
            controller: Object
        },
        data() {
            return {
                controllers: {
                    name: '',
                    options: '',
                    links: [],
                    sendDetailList: [],
                    index: '',
                },
                showLinksDetail: false,
                timer: TIME_ZONE_RNAGES,
                loading: false,
            };
        },
        computed: {
            ...mapState({
                journeyId: state => state[DRAGGABLE_JOURNEY_STORE_NAME].journeyInformation.id,
                journeyInstantiationId: state => state[DRAGGABLE_JOURNEY_STORE_NAME].journeyInformation
                    .journeyInstantiationId,
                timeZone: state => state[DRAGGABLE_JOURNEY_STORE_NAME].journeyInformation.timeZone,
                roleId: state => state.user.roleId,
                pushInfo(state) {
                    return state[DRAGGABLE_JOURNEY_STORE_NAME]
                        .canvasInformation.controllers[this.controller.id].pushInfo;
                }
            })
        },
        mounted() {
            let pushInfo = this.pushInfo;
            if (pushInfo) {
                this.controllers.name = pushInfo.name;
                this.controllers.options = `${pushInfo.sendName} ${pushInfo.sendAddress}`;
                this.controllers.index = pushInfo.index;
                if (pushInfo.links) {
                    this.controllers.links = pushInfo.links;
                }
            }
            this.getTableList();
        },
        methods: {
            getTableList(){
                this.loading = true;
                JourneyApiV3
                    .getABTestControllerDetail(this.controller.id,this.journeyInstantiationId)
                    .then(res =>{
                        if (res.body.data && res.body.data.taskList){
                            this.loading = false;
                            this.controllers.sendDetailList = res.body.data.taskList;
                        }
                    })
                    .catch(()=>{
                        this.loading = false;
                    });
            },
            // 预览
            reviewEmail(material) {
                if (!material.materialId) return;
                // 主账号不做任何限制
                if (this.roleId === 0 || this.roleId === '') {
                    // get e-mail html content
                    JourneyMaterialApiV1
                        .getMaterialCopy(material.materialId)
                        .then((res) => {
                            this.$preview({material: res.body.data.material, toolbar: false});
                        });
                    return;
                }
                // 权限校验
                JourneyMaterialApiV1
                    .sharingVerify({
                        materialId: material.materialId,
                        materialType: 1,
                        type: 2,
                        shareType: 4
                    })
                    .then(({body: {data: {isAccess}}}) => {
                        if (isAccess === 1) {
                            // get e-mail html content
                            JourneyMaterialApiV1
                                .getMaterialCopy(material.materialId)
                                .then((res) => {
                                    this.$preview({material: res.body.data.material, toolbar: false});
                                });
                        } else {
                            this.$toast(this.$t('material.sharingVerifyOption'), 'warn');
                        }
                    });
            },
            showLinks() {
                if (!this.showLinksDetail) {
                    this.showLinksDetail = true;
                }
            },
            hiddenLinksDetail() {
                this.showLinksDetail = false;
            },
            // 报告
            report(task) {
                if (task.taskId) {
                    let report = {
                        taskId: task.taskId,
                        journeyId: this.journeyId,
                        dataSourceId: 2
                    };
                    let {href} = this.$router.resolve({
                        name: 'emailSendReport',
                    });
                    localStorage.setItem(LOCAL_JOURNEY_DATA,JSON.stringify(report));
                    window.open(href);
                }
            }
        }
    };
</script>

<style lang="scss">
    @import "../../../../../../common/scss/base/variables";
    @import "../../../../../../common/scss/base/mixin";

    .controller-detail {
        .links-text {
            color: $green;
            cursor: pointer;
        }
        .simplify-table {
            .empty {
                padding: 0;
            }
            .first-icon {
                margin-left: 0;
            }
        }
        .test-quota {
            position: relative;
        }
        .links {
            position: relative;
        }
        .links-detail {
            width: 200px;
            height: 80px;
            padding: 5px 8px;
            border: 1px solid #e4e9ed;
            @include border-radius(5px);
            @include box-sizing(border-box);
            position: absolute;
            top: 33px;
            right: -78px;
            background: #fff;
            .links-list {
                width: 100%;
                height: 100%;
                overflow: auto;
                li {
                    overflow: hidden;
                    text-overflow: ellipsis;
                    white-space: nowrap;
                }
            }
            &:after {
                content: '';
                position: absolute;
                left: 50%;
                top: -19px;
                @include transform(translate(-50%,0));
                width: 0;
                height: 0;
                border: 10px solid transparent;
                border-bottom-color: #fff;
                z-index: 10;
            }
            &:before {
                content: '';
                position: absolute;
                left: 50%;
                top: -20px;
                @include transform(translate(-50%,0));
                width: 0;
                height: 0;
                border: 10px solid transparent;
                border-bottom-color: #e4e9ed;
                color: #e4e9ed;

            }
        }
    }
</style>
