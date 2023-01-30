<template>
    <div class="swarm-view-modal" :class="{ 'inline-box': (!writable && !isConfirm) || isCheck }">
        <div v-if="!loading" class="swarm-info"
            :class="{ 'hr-line': isConfirm, 'padding-left': !isConfirm && writable && !isCheck }">
            <template v-if="!deleteFlag && (!writable || isCheck || swarm.id)">
                <template v-if="!isConfirm">
                    <div class="info-box" :class="{ 'info-row': !writable}">
                        <span v-if="writable && !isCheck">
                            {{'swarm.currentNumber' | t}}
                            {{'punctuation.colon' | t}}
                        </span>
                        <span class="count-size" v-if="!fetching">{{totalCount}}</span>
                        <inline-spin v-else />
                        <!--查看分群-->
                        <svg aria-hidden="true" class="action-icon icon-eye swarm-modal-icon"
                            :class="{ 'icon-disable': $has('view_segment_criteria') }"
                            v-title:top="$t('swarm.viewSegments')" @click="openModalHandle">
                            <use xlink:href="#icon-eye"></use>
                        </svg>
                    </div>
                    <div v-if="!writable" class="info-row">
                        <div v-if="!fetching">
                            <span class="count-type">
                                {{'contact.Phone'| t}}
                                {{'punctuation.colon' | t}}
                                {{mobileCount}}
                            </span>
                            <span class="count-type">
                                {{'contact.Email'| t}}
                                {{'punctuation.colon' | t}}
                                {{emailCount}}
                            </span>
                            <span class="count-type">
                                {{'contact.Wechat'| t}}
                                {{'punctuation.colon' | t}}
                                {{weChatCount}}
                            </span>
                        </div>
                        <inline-spin v-else />
                    </div>
                    <div class="info-box">
                        <span class="disabled-text">
                            {{'controller.statisticsTime' | t}}
                            {{'punctuation.colon' | t}}
                        </span>
                        <span class="disabled-text" v-if="!fetching">{{statisticsTime}}</span>
                        <inline-spin v-else />
                    </div>
                </template>
                <template v-else>
                    <span class="title-text swarm-title">{{'dragJourney.recipients' | t}}</span>
                    <div class="pull-right">
                        <span class="disabled-text">
                                {{'controller.statisticsTime' | t}}
                                {{'punctuation.colon' | t}}
                        </span>
                        <span class="disabled-text" v-if="!fetching">{{statisticsTime}}</span>
                        <inline-spin v-else />
                    </div>
                    <ul class="swarm-list">
                        <li v-for="swarm in swarmList" :key="swarm.id">
                            <span :title="swarm.name">{{ swarm.name }}</span>
                            ({{ swarm.total || 0 }})
                            <svg aria-hidden="true" class="action-icon icon-eye swarm-modal-icon"
                                :class="{ 'icon-disable': $has('view_segment_criteria') }"
                                v-title:top="$t('swarm.viewSegments')" @click="handleSingleView(swarm)">
                                <use xlink:href="#icon-eye"></use>
                            </svg>
                        </li>
                    </ul>
                </template>
                <template v-if="!instanced">
                    <div  class="info-row">
                        <i class="icon icon-info"></i>
                        <span>{{'controller.currentTipsBefore' | t}}</span>
                        <span class="no-wrap">[{{createName}}]</span>
                        <span>{{'controller.currentTipsAfter' | t }}</span>
                    </div>
                    <div class="info-row">
                        <i class="icon icon-info"></i>
                        {{'controller.finalTips' | t}}
                    </div>
                </template>
                <div class="info-row" v-else>
                    <i class="icon icon-info"></i>
                    {{'controller.finishedTipsBefore' | t}}
                    <span class="no-wrap">[{{createName}}]</span>
                    {{'controller.finishedTipsAfter' | t}}
                </div>
            </template>
            <!--分群已删除-->
            <button v-else-if="!writable"
                    :disabled="$has('view_segment_criteria')"
                    :class="['btn', {'no-swarm-modal': !$has('view_segment_criteria')}]">
                {{'swarm.segmentDeleted' | t}}
            </button>
        </div>
        <!--查看分群弹窗-->
        <modal v-if="openModal" :title="$t('swarm.swarmView')" :class="{advanced: curSwarm.type === 8}" @close="openModal = false">
            <advanced-swarm-view v-if="curSwarm.type === 8" :swarmID="curSwarmId"></advanced-swarm-view>
            <condition-bunch v-else :bunchData="swarmData" :writable="false"></condition-bunch>
            <template v-slot:buttons>
                <input type="button" class="btn btn-md btn-theme-border" @click.stop="handleClose"
                       :value="$t('common.close')"/>
            </template>
        </modal>
    </div>
</template>
<script type="text/babel">

    import { ContactApiV1 } from '@/api';
    import conditionBunch from '../../../../../../common/components/condition-bunch/conditionBunch.vue';
    import advancedSwarmView from '../../../../../../customer/swarm/advanced-swarm-view.vue';
    export default {
        name: 'swarm-view-modal',
        provide(){
            return {
                optimizeRelativeTime:true, //  用于判断相对时间是否需要添加提前/延后N天的条件，如果后面需要前部添加的话，则去掉此处的provide以及子组件的inject
            };
        },
        props: {
            swarm: {        //匹配到的分群详情（分群未删除且当前账号有数据权限）
                type: Object,
                default: () => {
                    return {id: '',swarmJson: ''};
                }
            },
            swarmID: {      //已选的分群ID
                type: Number,
                default: 0
            },
            writable: {     //是否可选择分群 (可编辑状态 且 非查看模式(writable === true && isChecking === false))
                type: Boolean,
                default: false
            },
            isCheck: {      //是否查看模式 isChecking
                type: Boolean,
                default: false
            },
            journey: {  // 旅程信息
                type: Object,
                default: null
            },
            isConfirm: { // 旅程确认/审批弹窗调用
                type: Boolean,
                default: false
            },
            swarmIds: { // 分群列表
                type: Array,
                default: () => []
            },
            groupInfo: {
                type: Object,
                default: null
            }
        },
        data() {
            return {
                openModal: false,    //是否打开查看分群弹窗
                deleteFlag: false,   //true 已删除，false 未删除
                loading: false,
                fetching: false,
                statisticsTime: '', // 统计时间
                createName: '', // 旅程创建者登陆邮箱
                swarmData: null, // 分群条件
                totalCount: 0, // 总人数
                emailCount: 0, // 邮件人数
                mobileCount: 0, // 短信人数
                weChatCount: 0, // 微信人数
                swarmList: [], // 分群列表,
                tempSwarm: null, // 当前预览的临时分群
                instanced: false // 当前单分群是否被任务调用过
            };
        },
        // computed: {
        //     // 获取具体条件详情
        //     swarmJSON() {
        //         return this.swarm.swarmJson ? JSON.parse(this.swarm.swarmJson) : [];
        //     }
        // },
        watch: {
            // 每次切换分群都会刷新人数和统计时间
            swarmID: {
                handler: function() {
                    if (this.journey && this.journey.journeyInstantiationId && !this.writable) {
                        this.getSnapshot();
                    } else {
                        this.getSwarmCount();
                    }
                },
                immediate: true
            }
        },
        computed: {
            curSwarm() {
                return this.isConfirm ? this.tempSwarm : this.swarm;
            },
            curSwarmId() {
                return this.isConfirm ? this.tempSwarm.swarmId : this.swarmID;
            },
        },
        mounted() {
            if (!this.swarm.id) {
                this.getSwarmDetail();
            }
        },
        methods: {
            // 获取实时分群人数，旅程开始第一个任务后，不调用此接口
            getSwarmCount() {
                this.fetching = true;
                const ids = this.isConfirm ? this.swarmIds.map(String).join(',') : this.swarmID.toString();
                ContactApiV1
                    .getSwarmCount({
                        journeyCreateBy: this.journey.createBy,
                        swarmIds: ids
                    })
                    .then(({ body: { data } }) => {
                        const { currentTime, userName, swarmList, haveHighSwarm } = data;
                        this.statisticsTime = currentTime;
                        this.createName = userName;
                        this.$emit('isAdvance', haveHighSwarm);
                        if (swarmList && swarmList.length > 0) {
                            if (!this.isConfirm) {
                                const { total, emailCount, mobileCount, weChatCount, swarmJson} = swarmList[0];
                                this.totalCount = total;
                                this.emailCount = emailCount;
                                this.mobileCount = mobileCount;
                                this.weChatCount = weChatCount;
                                this.swarmData = swarmJson ? JSON.parse(swarmJson) : [];
                            } else {
                                this.swarmList = swarmList.map(e => {
                                    e.swarmData = e.swarmJson ? JSON.parse(e.swarmJson) : [];
                                    delete e.swarmJson;
                                    return e;
                                });
                            }
                        }
                        this.fetching = false;
                    })
                    .catch(() => {
                        this.statisticsTime = '-';
                        this.createName = '-';
                        this.totalCount = '-';
                        this.emailCount = '-';
                        this.mobileCount = '-';
                        this.weChatCount = '-';
                        this.fetching = false;
                    });
            },
            // 获取分群人数快照，旅程开始后，第一个任务开始前 调用
            getSnapshot() {
                if (this.groupInfo) {
                    if (this.groupInfo.swarmId === this.swarmID) {
                        const { emailCount, mobileCount, statisticsTime, totalCount , weChatCount } = this.groupInfo;
                        if (totalCount === undefined
                            || totalCount === null
                            || statisticsTime === undefined
                            || statisticsTime === null) {
                            this.getSwarmCount();
                            return;
                        }
                        this.statisticsTime = statisticsTime ? statisticsTime : 0;
                        this.emailCount = emailCount ? emailCount : 0;
                        this.mobileCount = mobileCount ? mobileCount : 0 ;
                        this.totalCount = totalCount ? totalCount : 0;
                        this.weChatCount = weChatCount ? weChatCount : 0;
                        this.createName = this.journey.createName;
                        // 第一个任务开启后，预览的是快照里的联系人分群条件
                        this.swarmData = this.swarm.swarmJson ? JSON.parse(this.swarm.swarmJson) : '';
                        this.instanced = true;
                    } else {
                        this.getSwarmCount();
                    }
                } else {
                    // 任务开始了，但没有开启任何一个任务，则实时获取分群统计数
                    this.getSwarmCount();
                }
            },
            // 未匹配到分群详情时，判断分群是否已删除
            getSwarmDetail() {
                this.loading = true;
                ContactApiV1
                    .swarmDetailList({
                        swarmIds: [this.swarmID],
                        type: 1
                    })
                    .then((res) => {
                        let swarm = res.body.data.swarmList[0];
                        if (!this.writable || this.isCheck) {
                            this.deleteFlag = swarm.deleteFlag === 1 ? true : false;
                        }
                        this.loading = false;
                    })
                    .catch(() => {
                        this.loading = false;
                    });
            },
            // 查看分群条件（单条）
            async openModalHandle() {
                if (this.$has('view_segment_criteria')) return;
                let hasAuth = await ContactApiV1
                    .swarmCheckAction({
                        swarmId: this.swarmID,
                        actionType: 1005
                    })
                    .then((res) => {
                        return res.body.code;
                    });
                if (hasAuth !== 200) {
                    return;
                }
                this.openModal = true;
            },
            // 预览当前分群条件 （审批/开始窗口列表预览）
            handleSingleView(swarm) {
                this.tempSwarm = swarm;
                this.swarmData = swarm.swarmData;
                this.openModal = true;
            },
            // 关闭预览
            handleClose() {
                this.openModal = false;
                this.tempSwarm = null;
                this.swarmData = null;
            }
        },
        components: { conditionBunch, advancedSwarmView }
    };
</script>
<style lang="scss" type="text/scss" rel="stylesheet/scss">
    @import '../../../../../../common/scss/base/variables';
    @import '../../../../../../common/scss/base/mixin';
    .swarm-view-modal {
        &.inline-box {
            display: inline-block;
            width: 430px;
        }
        .modal{
            width: 1130px;
            height: 770px;
            .modal-content{
                padding: 25px;
                height: 625px;
                overflow-y: scroll;
            }
        }
        .advanced{
            .modal{
                width: 1340px;
                height: 780px;
                .modal-content{
                    padding: 0 20px;
                    height: 675px;
                    overflow-y: scroll;
                    .advanced-swarm-view{
                        height: 100%;
                        .page-content{
                            height: 100%;
                            border-top: none;
                        }
                    }
                }
            }
        }
        .swarm-info{
            box-sizing: border-box;
            line-height: 32px;
            &.hr-line {
                border-top: double 1px #e0e5ea;
            }
            &.padding-left {
                padding-left: 125px;
            }
            .info-box {
                display: inline-block;
                box-sizing: border-box;
                overflow: hidden;
                height: 32px;
                vertical-align: middle;
                width: calc(50% - 2px);
                .count-size {
                    font-size: 16px;
                    vertical-align: bottom;
                }
            }
            .info-row {
                width: 100%;
                // padding-right: 50px;
                .no-wrap {
                    white-space: nowrap;
                }
                .count-type {
                    margin-right: 20px;
                }
            }
            .btn {
                padding: 0;
            }
            .no-swarm-modal{
                color: $red;
            }
            .swarm-modal-icon{
                width: 16px;
                height: 20px;
                vertical-align: top;
            }
            .swarm-title {
                font-size: 14px;
                line-height: 20px;
                font-weight: bold;
            }
            .swarm-list {
                @include box-sizing();
                margin-right: 50px;
                max-height: 160px;
                background-color: #fff;
                overflow-y: auto;

                li {
                    position: relative;
                    display: flex;
                    flex-direction: row;
                    justify-content: flex-start;

                    &:hover:not(.title) {
                        color: $color-content;
                        background-color: #f0f0f0;
                    }

                    & > span {
                        flex: 1;
                        display: inline-block;
                        @include ellipsis();
                    }

                    .swarm-view-modal{
                        position: absolute;
                        right: -100px;
                        top: -10px;
                    }
                }
            }
            .pull-right {
                float: right;
                padding-right: 50px;
            }
        }
    }
</style>
