<template>
    <div class="right-group-content">
        <!--分组导航-->
        <div class="tab-links">
            <span class="tab-link" :class="{active: journeyType == 0}" @click="navSelectType(0)">{{'journeyList.allJoureny' | t}}</span>
            <span class="tab-link" :class="{active: journeyType == 1}" @click="navSelectType(1)">{{'journeyList.realTimeJourney' | t}}</span>
            <span class="tab-link" :class="{active: journeyType == 2}" @click="navSelectType(2)">{{'journeyList.singleCyclesJoureny' | t}}</span>
            <span class="tab-link building-solutions"  @click="openModal">{{'journeyList.journeyBuildingSolutions' | t}}>></span>
            <button class="pull-right btn btn-md btn-round btn-theme" type="button"
                    @click="openDragJourney({id: 0},'add')"
                    :disabled="$has('journey_manage_add_journey')">
                <svg aria-hidden="true">
                    <use xlink:href="#icon-plus"></use>
                </svg>
                {{'journeyList.add' | t}}
            </button>
            <div class="pull-right search-box">
                <input type="text" v-model.trim="journeyName" :placeholder="$t('journey.searchKeyword') + '…'"
                       @keydown.enter="search">
                <svg aria-hidden="true" @click="search">
                    <use xlink:href="#icon-search"></use>
                </svg>
            </div>
        </div>
        <div class="operate hidden-menu-trigger batch-actions">
            <svg aria-hidden="true">
                <use xlink:href="#icon-batch"></use>
            </svg>
            <span class="button-action">{{'journeyList.batchAction' | t}}</span>
            <div class="hidden-menu">
                <button class="btn move-group" :disabled="$has('journey_manage_batch_move')"
                        @click="openGroupModal">{{'journeyList.toGroup' | t}}
                </button>
                <button class="btn" v-if="groupId" :disabled="$has('journey_manage_test_groups')"
                        @click="removeJourneysFromGroup">{{'journeyList.removeFromGroup' | t}}
                </button>
            </div>
        </div>
        <!--  旅程列表  -->
        <table class="simplify-table journey-list-table ">
            <tr>
                <th width=40>
                    <div class="choose-all-actions hidden-menu-trigger">
                        <svg aria-hidden="true">
                            <use xlink:href="#icon-menu"></use>
                        </svg>
                        <ul class="hidden-menu">
                            <li @click="chooseCurrentPage">{{'journeyList.nowPageAll' | t}}</li>
                            <li @click="clearChoose">{{'journeyList.clear' | t}}</li>
                        </ul>
                    </div>
                </th>
                <th width=130>
                    <span>{{'journeyList.name' | t}}</span>
                    <button type="button" class="table-sort-button" @click="listSort('name')"
                            :title="$t('material.sortLetter')">
                        <svg aria-hidden="true"
                             class="asc"
                             :class="{active:  sortValue === 'name' && sortOrder === 0}">
                            <use xlink:href="#icon-caret-down"></use>
                        </svg>
                        <svg aria-hidden="true"
                             class="desc"
                             :class="{active: sortValue === 'name' && sortOrder === 1}">
                            <use xlink:href="#icon-caret-down"></use>
                        </svg>
                    </button>
                </th>
                <th width=80>{{'journeyList.entries' | t}}</th>
                <th width=80>{{'time.duration' | t}}</th>
                <th width=50>{{'journeyList.type' | t}}</th>
                <th width=100>{{'journeyList.status' | t}}({{matchJourneyStatus(journeyStatus)}})
                    <div class="filter-box" v-blur="closeStatus">
                        <svg aria-hidden="true" @click="chooseStatus = !chooseStatus">
                            <use v-bind:xlink:href="'#icon-' + (chooseStatus ? 'shaixuan-tianchong' : 'shaixuan')"></use>
                        </svg>
                        <transition name="drop">
                            <div class="drop-list" v-if="chooseStatus">
                                <radio v-model="journeyStatus" :source="4">{{'journeyList.statusAll' | t}}</radio>
                                <radio v-model="journeyStatus" :source="0">{{'journeyList.draft' | t}}</radio>
                                <radio v-model="journeyStatus" :source="1">{{'journeyList.running' | t}}</radio>
                                <radio v-model="journeyStatus" :source="2">{{'journeyList.completed' | t}}</radio>
                                <radio v-model="journeyStatus" :source="3">{{'journeyList.cancelled' | t}}</radio>
                                <radio v-model="journeyStatus" :source="5">{{'journeyList.paused' | t}}</radio>
                                <radio v-model="journeyStatus" :source="6">{{'journeyList.testing' | t}}</radio>
                                <radio v-model="journeyStatus" :source="7">{{'journeyList.inReview' | t}}</radio>
                                <radio v-if="this.canApproval && this.approvalState" v-model="journeyStatus"
                                       :source="9">{{'journeyList.pending' | t}}
                                </radio>
                                <radio v-if="this.canApproval && this.approvalState" v-model="journeyStatus"
                                       :source="10">{{'journeyList.rejected' | t}}
                                </radio>
                            </div>
                        </transition>
                    </div>
                </th>
                <th width=150>{{'material.updater'| t}}</th>
                <th width=130>
                    <span>{{'journeyList.updateTime' | t}}</span>
                    <button type="button" class="table-sort-button" @click="listSort('updateDate')"
                            :title="$t('material.sortUpdateData')">
                        <svg aria-hidden="true"
                             class="asc"
                             :class="{active:  sortValue === 'updateDate' && sortOrder === 0}">
                            <use xlink:href="#icon-caret-down"></use>
                        </svg>
                        <svg aria-hidden="true"
                             class="desc"
                             :class="{active: sortValue === 'updateDate' && sortOrder === 1}">
                            <use xlink:href="#icon-caret-down"></use>
                        </svg>
                    </button>
                </th>
                <th width=150>{{'journeyList.creator' | t}}</th>
                <th width=130>
                    <span>{{'material.createData' |t}}</span>
                    <button type="button" class="table-sort-button" @click="listSort('createDate')"
                            :title="$t('material.sortCreateData')">
                        <svg aria-hidden="true"
                             class="asc"
                             :class="{active:  sortValue === 'createDate' && sortOrder === 0}">
                            <use xlink:href="#icon-caret-down"></use>
                        </svg>
                        <svg aria-hidden="true"
                             class="desc"
                             :class="{active: sortValue === 'createDate' && sortOrder === 1}">
                            <use xlink:href="#icon-caret-down"></use>
                        </svg>
                    </button>
                </th>
                <th width=150>{{'journeyList.options' | t}}</th>
            </tr>
            <tr v-if="loading">
                <td colspan="11">
                    <inline-loading/>
                </td>
            </tr>
            <tr v-else-if="strictEmpty">
                <td colspan="11">
                    <div class="begin-journey-slogan" v-if="strictEmpty">
                        <h5>“{{'journey.emptySlogan' | t}}”</h5>
                    </div>
                </td>
            </tr>
            <tr v-else-if="journeys.length === 0">
                <td colspan="11">
                    <list-search-empty/>
                </td>
            </tr>
            <tr v-else v-for="journey in journeys" :key="journey.id"
                @click="openDragJourney(journey,'tr')">
                <td @click.stop>
                    <checkbox v-model="ids" :source="journey.id"></checkbox>
                </td>
                <td :title="journey.journeyName">{{journey.journeyName}}</td>
                <td>{{journey.count}}</td>
                <td>{{journey.take ? journey.take + $t('common.day') : '-'}}</td>
                <td v-text="matchJourneyType(journey.journeyType)"></td>
                <td v-text="matchJourneyStatus(journey.journeyStatus)"></td>
                <td :title="journey.updateName">{{journey.updateName}}</td>
                <td>{{journey.updateDate.substring(0, 16)}}</td>
                <td :title="journey.createName">{{journey.createName}}</td>
                <td :title="journey.createDate">{{journey.createDate.substring(0, 16)}}</td>
                <td @click.stop class="edit">
                    <journey-action-button v-for="number in computeJourneyOperations(journey)" :key="number"
                                           @click="journeyOperate(number, journey)" :actionNO="number"/>
                </td>
            </tr>
        </table>
        <div class="pager-wrapper">
            <div class="amount">{{'journey.totalCount' | t}}
                <span class="theme-text">{{totalCount ? totalCount : 0}}</span>
                {{'journey.totalUnit' | t}}
            </div>
            <pager :total="totalPage" :now="pageNumber" @page="switchPage"/>
        </div>
        <back-top ref="topper"/>
        <!-- 批量移动分组 -->
        <group-change-modal v-if="groupMoveModalOpen"
                            :ids="ids"
                            @move="moveGroup"
                            @close="closeGroupMoveModal"/>
         <building-solutions-modal ref='buildingSolutionsModal' v-if="buildingSolutionShow" @closeModal="closeModal"/>
    </div>
</template>
<script lang="jsx" type="text/ecmascript-6">
    import JourneyProgress from './progress.vue';
    import groupChangeModal from './group-operation-modal/group-change-modal.vue';
    import { JourneyApiV3 } from '@/api';
    import {logError} from '../../monitor.js';
    import {trackEvent} from '../../monitor';
    import {translate} from '@/locales';
    import BuildingSolutionsModal from './journey-building-solutions/building-solutions-modal.vue';
    import { mapState } from 'vuex';

    const LOCAL_JOURNEY_DATA = 'LOCAL_JOURNEY_DATA';

    // 添加按钮权限修改 2019-09-02
    const JOURNEY_ACTION_MAP = {
        // 复制
        0: {
            name: translate('common.copy'),
            icon: 'icon-copy',
            id: 'journey_manage_copy_journey',
            disabled: ''
        },
        // 编辑
        1: {
            name: translate('common.edit'),
            icon: 'icon-pencil',
            id: 'journey_manage_edit_journey',
            disabled: ''
        },
        // 删除
        2: {
            name: translate('common.del'),
            icon: 'icon-delete',
            id: 'journey_manage_delete_journey',
            disabled: ''
        },
        // 查看报告
        3: {
            name: translate('journeyList.checkReport'),
            icon: 'icon-shuju',
            id: 'journey_manage_search_report',
            disabled: ''
        },
        // 继续
        4: {
            name: translate('journeyList.continue'),
            icon: 'icon-kaishi',
            id: 'journey_manage_restart_journey',
            disabled: ''
        },
        // 暂停
        5: {
            name: translate('journeyList.pause'),
            icon: 'icon-pause',
            id: 'journey_manage_pause_journey',
            disabled: '',
        },
        // 测试
        6: {
            name: translate('journeyList.test'),
            icon: 'icon-flask',
            id: 'journey_manage_test_journey',
            disabled: ''
        },
        // 测试结束
        7: {
            name: translate('journeyList.testCompleted'),
            icon: 'icon-success',
            id: 'journey_manage_test_end',
            disabled: ''
        },
        // 测试详情
        8: {
            name: translate('journeyList.testDetails'),
            icon: 'icon-log',
            id: 'journey_manage_test_details',
            disabled: ''
        },
        // 测试结束编辑
        9: {
            name: translate('sharing.testEndEditor'),
            icon: 'icon-bianji',
            id: 'journey_manage_test_edit',
            disabled: ''
        },
        // 查看
        10: {
            name: translate('journeyList.check'),
            icon: 'icon-eye',
            id: 'journey_manage_search_journey',
            disabled: ''
        }
    };

    export default {
        data() {
            return {
                chooseType: false,  // 旅程类型筛选
                chooseStatus: false,// 旅程状态筛选
                ids: [], // 已选中旅程ids
                journeys: [],   //旅程
                loading: true, //加载
                loadingSign: 0,  // timestamp
                totalCount: 0,  //旅程total
                totalPage: 0, //旅程total page
                journeyName: '', // 关键字
                groupMoveModalOpen: false, // 移动分组弹出层

                journeyType: '',    //旅程类型
                sortOrder: '',//排序顺序（0:升序，1:降序）
                sortValue: '',//排序字段（name,createDate,updateDate）
                buildingSolutionShow: false//是否显示旅程搭建方案
            };
        },
        computed: {
            ...mapState({
                //  可否审批
                canApproval: state => state.user.canApproval,
                //  审批状态
                approvalState: state => state.user.approvalState
            }),
            //  分组id
            groupId() {
                return this.$route.params.groupId ? parseInt(this.$route.params.groupId) : 0;
            },
            // journeyStatus: 4, // 状态： 0:未开始 1:进行中 2:已结束 3:已取消 4:全部
            journeyStatus: {
                get() {
                    if (typeof this.$route.query.journeyStatus === 'string' || typeof this.$route.query.journeyStatus === 'number') {
                        return parseInt(this.$route.query.journeyStatus);
                    }
                    return 4;
                },
                set(journeyStatus) {
                    if (journeyStatus !== this.journeyStatus) {
                        let newQuery = Object.assign({}, this.$route.query, {journeyStatus, pageNumber: 1});
                        this.$router.replace({
                            name: 'journeyRecords',
                            params: this.$route.params,
                            query: newQuery
                        });
                        this.fetchJourneys();
                    }
                }
            },
            // 页码
            pageNumber() {
                if (typeof this.$route.query.pageNumber === 'string' || typeof this.$route.query.pageNumber === 'number') {
                    return parseInt(this.$route.query.pageNumber);
                }
                return 1;
            },

            strictEmpty() {
                return this.journeys.length === 0 &&
                    !this.$route.query.journeyName &&
                    this.journeyStatus === 4 &&
                    this.pageNumber === 1;
            },

            user() {
                return this.$store.state.user;
            },
            // 华为类型账号
            isHw() {
                return this.user.companyType === 1;
            }
        },
        props: {
            journeyContentId: {
                type: [String, Number]
            }
        },
        watch: {
            //fix-4910  将原本对groupId的监听 更改为父组件传参
            journeyContentId(newVal) {
                this.$router.replace({
                    name: 'journeyRecords',
                    params: {groupId: newVal},
                    query: {pageNumber: 1, journeyName: '', journeyType: this.journeyType, groupId: newVal}
                });
                this.fetchJourneys();
            }
        },
        beforeRouteUpdate(to, from, next) {
            if (to.query.journeyName || to.query.journeyType) {
                this.fetchJourneys();
            }
            next();
        },
        created() {
            this.journeyType = this.$route.query.journeyType;
        },
        mounted() {
            this.journeyName = this.$route.query.journeyName || '';
            this.journeyType = this.$route.query.journeyType || 0;

            this.fetchJourneys();

            for (let i = 0; i <= Object.keys(JOURNEY_ACTION_MAP).length - 1; i++) {
                JOURNEY_ACTION_MAP[i].disabled = this.$has(JOURNEY_ACTION_MAP[i].id);
            }

            //华为埋码-营销旅程-多渠道营销旅程
            if (this.isHw) {
                //UEM埋码
                window.hwa('trackPageView', 'P120319930FAC96');
            }
        },
        methods: {
            //打开旅程搭建案例页面
            openModal() {
                this.buildingSolutionShow = true;
            },
            closeModal() {
                this.buildingSolutionShow = false;
            },
            //  移动分组
            moveGroup() {
                this.closeGroupMoveModal();
                this.$nextTick(() => {
                    this.fetchJourneys();
                    this.ids = [];
                });
            },
            // 全选当前页
            chooseCurrentPage() {
                this.ids = this.journeys.map(({id}) => id);
            },
            // 清空当前所选
            clearChoose() {
                this.ids = [];
            },
            // 关闭旅程类型筛选
            closeChooseType() {
                this.chooseType = false;
            },
            // 关闭旅程状态筛选
            closeStatus() {
                this.chooseStatus = false;
            },
            // 关闭移动分组弹窗
            closeGroupMoveModal() {
                this.groupMoveModalOpen = false;
            },
            // 分组弹窗
            openGroupModal() {
                if (this.ids.length === 0) {
                    return this.$toast(this.$t('journeyList.noMarketing'), 'warn');
                }
                this.groupMoveModalOpen = true;
            },
            // 从分组中移除
            removeJourneysFromGroup() {
                if (this.ids.length === 0) {
                    return this.$toast(this.$t('journeyList.noMarketing'), 'warn');
                }
                JourneyApiV3
                    .moveGroup({
                        groupId: this.groupId,
                        journeyIds: this.ids,
                        status: 0, // 全选（0：NO，1：YES）
                        type: 1 // 0：移进，1：移出
                    })
                    .then(() => {
                        this.$toast(this.$t('journeyList.moveSuccess'), 'success');
                        trackEvent('旅程移出分组');
                        this.$nextTick(() => {
                            this.fetchJourneys();
                            this.ids = [];
                        });
                    });
            },
            /**
             * 新建旅程，编辑旅程，测试详情，测试结束编辑
             * @param journey {object} 旅程
             * @param operate {string} 操作类型
             * 操作类型：新建旅程add、编辑旅程edit、测试详情testDetail、测试结束编辑testEdit、点击旅程条目进入旅程tr
             */
            openDragJourney(journey, operate) {
                switch (operate) {
                    case 'add':
                    case 'edit':
                    case 'testDetail':
                    case 'testEdit':
                        this.$router.push({
                            name: 'draggableJourney',
                            params: {id: journey.id, groupId: this.groupId},
                            query: {
                                groupId: this.groupId,
                                pageNumber: this.pageNumber,
                                journeyType: this.journeyType
                            }
                        });
                        break;
                    case 'tr':
                        // 有编辑(测试结束编辑)按钮，受编辑按钮(测试结束编辑按钮)权限的控制
                        // 无编辑(测试结束编辑)按钮，不受权限控制，所有状态下都可以点 tr(例如进行中的可以点 tr 进行查看)

                        // 有编辑按钮、无编辑权限
                        if (journey.editBtn && this.$has('journey_manage_edit_journey')) return;
                        // 旅程测试结束状态（有测试结束编辑按钮），无"测试结束后编辑"权限
                        if (journey.journeyStatus === 7 && this.$has('journey_manage_test_edit')) return;

                        this.$router.push({
                            name: 'draggableJourney',
                            params: {id: journey.id, groupId: this.groupId},
                            query: {
                                groupId: this.groupId,
                                pageNumber: this.pageNumber,
                                journeyType: this.journeyType
                            }
                        });
                        break;
                }
            },
            // 搜索
            search() {
                let newQuery = Object.assign({}, this.$route.query, {journeyName: this.journeyName, pageNumber: 1});
                this.$router.push({
                    name: 'journeyRecords',
                    params: this.$route.params,
                    query: newQuery
                });
                this.fetchJourneys();
            },
            /**
             * 切换页面
             * @param pageNumber
             */
            switchPage(pageNumber) {
                let newQuery = Object.assign({}, this.$route.query, {journeyName: this.journeyName, pageNumber});
                this.$router.push({
                    name: 'journeyRecords',
                    params: this.$route.params,
                    query: newQuery
                });

                this.fetchJourneys();
            },
            /*
            * 控制显示可操作的操作btn
            * @param journey {Object} 旅程
            * */
            computeJourneyOperations(journey) {
                // 旅程类型：单次旅程0 实时旅程1 循环（周期）旅程2
                // 按钮含义：复制0 编辑1 删除2 查看报告3 继续4 暂停5 测试6 测试结束7 测试详情8 测试结束编辑9 查看10

                let temp = [];
                // 实时旅程
                if (journey.journeyType === 2) {
                    switch (journey.journeyStatus) {
                        case 0:  // 未开始
                        case 3:  // 已取消
                        case 10: // 审批被拒
                            temp.push(0, 1, 10, 2);   // 复制0、编辑1、查看10、删除2
                            this.$set(journey, 'editBtn', true); // 旅程有编辑按钮
                            break;
                        case 1: // 进行中
                            temp.push(5, 0, 3, 10);  // 暂停5、复制0、查看报告3、查看10
                            this.$set(journey, 'editBtn', false); // 旅程没有编辑按钮
                            break;
                        case 2: // 已完成
                            temp.push(1, 10);   // 编辑1、查看10
                            this.$set(journey, 'editBtn', true); // 旅程有编辑按钮
                            break;
                        case 5: // 暂停中
                            temp.push(0, 3, 10, 2);   // 复制0、查看报告3、查看10、删除2
                            this.$set(journey, 'editBtn', false); // 旅程没有编辑按钮
                            break;
                        case 6: // 测试中
                            temp.push(7, 0, 10);   // 测试结束7、复制0、查看10
                            this.$set(journey, 'editBtn', false); // 旅程没有编辑按钮
                            break;
                        case 7: // 测试结束
                            temp.push(9, 8, 0, 10, 2);   // 测试结束9、测试详情8、复制0、查看10、删除2
                            this.$set(journey, 'editBtn', false); // 旅程没有编辑按钮
                            break;
                        case 8: // 测试结束(测试详情)
                            temp.push(0, 1, 10);   // 复制0、编辑1、查看10
                            this.$set(journey, 'editBtn', true); // 旅程有编辑按钮
                            break;
                        case 9: // 待审批
                            temp.push(0, 10);   // 复制0、查看10
                            this.$set(journey, 'editBtn', false); // 旅程没有编辑按钮
                            break;
                        default:
                            logError(`[营销旅程] <journey-group-content /> computeJourneyOperations 出现了无法识别的旅程状态{journeyStatus:${journey.journeyStatus}} :343`);
                            break;
                    }
                } else if (journey.journeyType === 0) {
                    //单次旅程
                    switch (journey.journeyStatus) {
                        case 0:  // 未开始
                        case 3:  // 已取消
                        case 5:  // 暂停
                        case 10: // 审批被拒
                            temp.push(0, 1, 10, 2);   // 复制0、编辑1、查看10、删除2
                            this.$set(journey, 'editBtn', true); // 旅程有编辑按钮
                            break;
                        case 1: // 进行中
                        case 2: // 已完成
                        case 6: // 测试中
                        case 7: // 测试结束
                        case 8: // 测试结束（测试详情）
                            temp.push(0, 1, 10);   // 复制0、编辑1、查看10
                            this.$set(journey, 'editBtn', true); // 旅程有编辑按钮
                            break;
                        case 9: // 待审批
                            temp.push(0, 10);   // 复制0、查看10
                            this.$set(journey, 'editBtn', false); // 旅程没有编辑按钮
                            break;
                        default:
                            logError(`[营销旅程] <journey-group-content /> computeJourneyOperations 出现了无法识别的旅程状态{journeyStatus:${journey.journeyStatus}} :343`);
                            break;
                    }
                } else {
                    // 循环旅程
                    switch (journey.journeyStatus) {
                        case 0: // 未开始
                        case 1: // 进行中
                        case 2: // 已完成
                        case 6: // 测试中
                        case 7: // 测试结束
                        case 8: // 测试结束
                            temp.push(0, 1, 10);   // 复制0、编辑1、查看10
                            this.$set(journey, 'editBtn', true); // 旅程有编辑按钮
                            break;
                        case 3: // 已取消
                        case 5: // 暂停
                        case 10: // 审批被拒
                            temp.push(0, 1, 10, 2);   // 复制0、编辑1、查看10、删除2
                            this.$set(journey, 'editBtn', true); // 旅程有编辑按钮
                            break;
                        case 9: // 待审批
                            temp.push(0, 10);   // 复制0、查看10
                            this.$set(journey, 'editBtn', false); // 旅程没有编辑按钮
                            break;
                        default:
                            logError(`[营销旅程] <journey-group-content /> computeJourneyOperations 出现了无法识别的旅程状态{journeyStatus:${journey.journeyStatus}} :343`);
                            break;
                    }
                }
                return temp;
            },
            /**
             *  旅程操作
             *  @param actionNO {Number}
             *  @param journey {Object} 旅程详情
             */
            journeyOperate(actionNO, journey) {
                let journeyData = {
                    dataSourceId: 1,
                    journeyId: journey.id
                };
                switch (actionNO) {
                    case 0: // 复制
                        trackEvent('复制旅程');
                        JourneyApiV3.copyJourney(journey.id)
                            .then(() => {
                                this.fetchJourneys();
                            });
                        break;
                    case 1: // 编辑
                        this.openDragJourney(journey, 'edit');
                        break;
                    case 2: // 删除
                        trackEvent('删除旅程');
                        this.$confirm(this.$t('journeyList.optionsSure'), this.$t('journeyList.deleteMarketing'))
                            .then(sure => {
                                if (sure) {
                                    JourneyApiV3.deleteJourney(journey.id)
                                        .then(() => {
                                            this.fetchJourneys();
                                        });
                                }
                            });

                        break;
                    case 3: // 查看旅程报告
                        trackEvent('查看旅程报告');
                        localStorage.setItem(LOCAL_JOURNEY_DATA, JSON.stringify(journeyData));
                        this.$router.push({
                            name: 'journeyReviewReport'
                        });
                        break;
                    case 4: // 开始旅程
                        trackEvent('开始旅程');
                        JourneyApiV3.startJourney(journey.id)
                            .then(() => {
                                this.fetchJourneys();
                            });
                        break;
                    case 5: // 暂停旅程
                        trackEvent('暂停旅程');
                        JourneyApiV3.pauseJourney(journey.id)
                            .then(() => {
                                this.fetchJourneys();
                            });
                        break;
                    // case 6:
                    //     JourneyApiV3.testJourney(journey).then(() => {
                    //         this.fetchJourneys();
                    //     });
                    //     break;
                    case 7: // 结束旅程测试
                        trackEvent('结束旅程测试');
                        JourneyApiV3.stopTest(journey.id)
                            .then(() => {
                                this.$toast(this.$t('journey.endTest'), 'success');
                                this.fetchJourneys();
                            });
                        break;
                    case 8: // 测试详情
                        this.openDragJourney(journey, 'testDetail');
                        break;
                    case 9: // 测试结束编辑
                        JourneyApiV3.testEdit(journey.id)
                            .then(() => {
                                this.openDragJourney(journey, 'testEdit');
                            });
                        break;
                    case 10: // 查看
                        this.checkJourney(journey.id);
                        break;
                    default:
                        logError(`[营销旅程] <journey-group-content /> journeyOperate 出现了无法处理的旅程操作{operation:${actionNO}} :419`);
                }
            },
            /**
             * 导航选择旅程类型
             *  @param type 类型
             */
            navSelectType(type) {
                if (this.journeyType !== type) this.journeyType = type;
                this.journeyName = '';
                this.$router.replace({
                    name: this.$route.name,
                    query: Object.assign({}, this.$route.query, {
                        journeyName: this.journeyName,
                        pageNumber: 1,
                        journeyType: this.journeyType,
                    }),
                    params: {groupId: this.groupId},
                });
                this.fetchJourneys();
            },
            /**
             * 列表排序
             * @param sortValue {Number} 升降排序
             */
            listSort(sortValue) {
                this.sortValue = sortValue;
                this.sortOrder = this.sortOrder ? 0 : 1;
                this.fetchJourneys();
            },
            // 获取旅程
            fetchJourneys() {
                const signature = (new Date).getTime();
                this.loading = true;
                this.loadingSign = signature;
                JourneyApiV3
                    .getJourneys({
                        // journeyType: this.journeyType === 3 ? [0, 1, 2] : [this.journeyType],
                        journeyType: this.journeyType,
                        journeyStatus: this.journeyStatus,
                        journeyName: this.journeyName,
                        pageNumber: this.pageNumber,
                        groupId: this.groupId,
                        sortOrder: this.sortOrder,
                        sortValue: this.sortValue
                    })
                    .then(({body: {data: {list, totalRow, totalPage}}}) => {
                        if (signature === this.loadingSign) {
                            this.journeys = list;
                            this.totalCount = totalRow;
                            this.totalPage = totalPage;
                            this.loading = false;
                            this.$nextTick(() => {
                                if (this.$refs.topper) this.$refs.topper.backTop();
                            });
                        }
                    })
                    .catch(() => {
                        this.loading = false;
                    });

            },
            /**
             * 匹配旅程类型
             * @param journeyType {Number} 旅程类型
             */
            matchJourneyType(journeyType) {
                if (journeyType === 0) return this.$t('journeyList.simple'); // 单次
                if (journeyType === 1) return this.$t('journeyList.recurring'); // 重复
                if (journeyType === 2) return this.$t('journeyList.realTime'); // 实时
                // if (journeyType === 3) return this.$t('journeyList.all');   // 全部
                logError(`[营销旅程] <journey-group-content /> matchJourneyType 无法识别的旅程类型{journeyType:${journeyType}} :463`);
            },
            /**
             *  匹配旅程状态
             *  @param journeyStatus {Number} 旅程状态
             */
            matchJourneyStatus(journeyStatus) {
                if (journeyStatus === 0) {
                    return this.$t('journeyList.draft');
                }
                if (journeyStatus === 1) {
                    return this.$t('journeyList.running');   //进行中
                }
                if (journeyStatus === 2) {
                    return this.$t('journeyList.completed'); //已完成
                }
                if (journeyStatus === 3) {
                    return this.$t('journeyList.cancelled'); //已取消
                }
                if (journeyStatus === 4) {
                    return this.$t('journeyList.all');      // 全部
                }
                if (journeyStatus === 5) {
                    return this.$t('journeyList.paused');    //已暂停
                }
                if (journeyStatus === 6) {
                    return this.$t('journeyList.testing');   //测试中
                }
                if (journeyStatus === 7 || journeyStatus === 8) {
                    return this.$t('journeyList.inReview');  //测试结束
                }
                if (journeyStatus === 9) {
                    return this.$t('journeyList.pending');  // 待审批
                }
                if (journeyStatus === 10) {
                    return this.$t('journeyList.rejected');  // 审批被拒
                }

                logError(`[营销旅程] <journey-group-content /> matchJourneyStatus 无法识别的旅程过程状态{journeyStatus:${journeyStatus}} :490`);
            },
            /**查看旅程
             * @param id 旅程id
             */
            checkJourney(id) {
                // this.$store.state[DRAGGABLE_JOURNEY_STORE_NAME].commit(UPDATE_CHECK, true);
                this.$router.push({
                    name: 'draggableJourney',
                    params: {id, groupId: this.groupId},
                    query: {
                        groupId: this.groupId,
                        pageNumber: this.pageNumber,
                        journeyType: this.journeyType,
                        isChecking: true,
                    }
                });
            }
        },
        components: {
            JourneyProgress,
            groupChangeModal,
            BuildingSolutionsModal,
            journeyActionButton: {
                functional: true,
                props: {
                    actionNO: Number
                },
                /* eslint no-unused-vars: 0 */
                render(h, context) {
                    const action = JOURNEY_ACTION_MAP[context.props.actionNO];
                    const directives = [
                        {name: 'title', value: action.name, arg: 'top'}
                    ];
                    const clickHandler = context.listeners['click'];
                    return (
                        /* eslint indent: 0 */
                        <button class="btn" id={action.id} disabled={action.disabled} onClick={clickHandler}>
                            <svg aria-hidden="true" disabled={action.disabled}
                                 class={'action-icon ' + action.icon} {...{directives}}>
                                <use href={'#' + action.icon}></use>
                            </svg>
                        </button>
                    );
                }
            }
        }
    };
</script>

<style lang="scss">
    @import "../../common/scss/base/variables";
    @import "../../common/scss/base/mixin";

    .right-group-content {
        @include clearfix();

        .tab-links {
            .building-solutions {
                padding-left: 42px;
                color: $blue;
                opacity: 0.5;
                &::after {
                    border-bottom: unset;
                }
            }
            .building-solutions:hover{
                opacity: 1;
            }
        }

        .operate {
            display: inline-block;
            height: $input-field-height;
            line-height: $input-field-height;
            font-size: 14px;
            cursor: pointer;
            padding-right: 16px;

            svg {
                display: inline-block;
                width: 14px;
                height: 14px;
                vertical-align: middle;
                fill: currentColor;
            }

            .btn {
                display: block;
                color: $color-light-content;
                border-radius: 0;

                &:hover {
                    color: $color-content;
                    background-color: #f0f0f0;
                }
            }

            .btn + .btn {
                margin: 0;
            }

            .move-group {
                width: 100%;
                text-align: left;
            }
        }

        .search-box {
            margin-right: 16px;
        }

        .journey-list-table {
            table-layout: fixed;
            width: 100%;
            margin-top: 16px;
            text-align: left;
            border-collapse: collapse;
            border-spacing: 0;

            th {
                box-sizing: border-box;

                &:not([width]) {
                    width: 100%;
                }
            }

            td {
                overflow: hidden;
                word-break: break-all;
                white-space: normal;
            }

            .btn {
                padding: 0;
            }

            .choose-all-actions {
                width: 14px;
                height: 14px;
                margin: 5px auto;
                padding: 3px;
                position: relative;
                cursor: pointer;

                svg {
                    display: block;
                    width: 14px;
                    height: 14px;
                    fill: currentColor;
                }

                &:hover {
                    color: $theme;
                }

                .hidden-menu {
                    top: 100%;
                    left: 0;
                    @include transform-origin(left top);
                }
            }

            .filter-box {
                display: inline-block;
                position: relative;

                svg {
                    fill: currentColor;
                    width: 14px;
                    height: 14px;
                    vertical-align: middle;
                    margin-left: 1px;
                }

                .radio {
                    padding: 0 10px;
                    display: block;
                    margin: 0;
                }

                .drop-list {
                    position: absolute;
                    z-index: 1;
                    left: 0;
                    top: 100%;
                    border-radius: 4px;
                    border: 1px solid $border-color;
                    background-color: $content-bg;
                    line-height: $input-field-height;
                    white-space: nowrap;
                }
            }

            tr {
                height: 40px;
                border-bottom: 1px solid $border-color;

                &:first-child {
                    background-color: $select-bg;
                }

                td:first-child {
                    text-align: center;
                }

                &:not(:first-child):hover {
                    background-color: $title-bg;
                }
            }

            .action-icon {
                width: 16px;
                height: 16px;
            }

            .edit {
                button:first-child {
                    svg {
                        margin-left: 0;
                    }
                }

                .btn + .btn {
                    margin: 0;
                }

                .icon-bianji {
                    color: $theme;

                    &:hover {
                        color: $dark-green;
                    }
                }
            }

            .operate {
                .btn {
                    padding: 0 10px;
                }
            }
        }

        .begin-journey-slogan {
            position: relative;
            width: 944/1280 * 100%;
            height: 434/1280 * 100vw;
            max-width: 944px;
            max-height: 434px;
            margin: 70px auto 0;
            background: url("./begin-journey-slogan.png") no-repeat center bottom;
            text-align: center;
            @include background-size(contain);

            h5 {
                position: absolute;
                top: 0;
                left: 0;
                right: 0;
                font-size: 26px;
                line-height: 30px;
                color: $color-light-content;
                font-weight: normal;
            }

            [type="button"] {
                position: absolute;
                bottom: 0;
                left: 50%;
                @include transform(translateX(-50%));
            }
        }

        .pager-wrapper {
            display: flex;
            justify-content: space-between;

            .amount {
                line-height: 64px;
            }
        }

        .batch-actions {
            svg {
                width: 16px;
                height: 16px;
                margin-top: -3px;
            }

            .button-action {
                font-size: 12px;
            }
        }
    }
</style>
