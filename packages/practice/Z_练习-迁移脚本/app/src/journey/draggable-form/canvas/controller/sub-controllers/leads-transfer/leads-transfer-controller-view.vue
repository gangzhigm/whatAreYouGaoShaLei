<template>
    <div class="leads-transform-controller-view">
        <modal v-if="!showDataTable" class="data-view"
               :title="$t('dragJourney.leadTag')" @close="close">
            <div class="people-in">
                <h1>{{filterNumber}}</h1>
                <p>{{'controller.entries' | t}}</p>
            </div>
            <div class="send-number">
                <h1>{{sendNumber}}</h1>
                <p>{{'controller.transfer' | t}}</p>
                <p @click="showStatistical">{{'controller.statisticalTransmission' | t}}</p>
            </div>
        </modal>

        <!--传递统计列表-->
        <modal v-if="showDataTable" :title="$t('controller.statisticalTransmission')"
               @close="closeDataTable" size="lg">
            <div class="form-field search-area">
                <input type="text" class="input" v-model.trim="keywordTem"
                       :placeholder="$t('controller.searchByEmail')" @keyup.enter="searchTransfer">
                <button class="btn btn-md btn-theme" @click="searchTransfer">{{'controller.searchTip' | t}}</button>
            </div>
            <div class="simplify-table">
                <table>
                    <thead>
                        <tr>
                            <th>{{'journeyList.options' | t}}</th>
                            <th class="filter-item">
                                {{'sharing.status' | t}}
                                <div class="filter-box" v-blur="closeStatus">
                                    <svg aria-hidden="true" @click="chooseStatus = !chooseStatus">
                                        <use v-bind:xlink:href="'#icon-' +
                                        (chooseStatus ? 'shaixuan-tianchong' : 'shaixuan')"></use>
                                    </svg>
                                    <transition name="drop">
                                        <div class="drop-list" v-if="chooseStatus" @click="transferStatusChange">
                                            <radio v-model="transferStatus" :source="null">
                                                {{'journeyList.statusAll' | t}}
                                            </radio>
                                            <radio v-model="transferStatus" :source="1">
                                                {{'controller.transferFailure' | t}}
                                            </radio>
                                            <radio v-model="transferStatus" :source="0">
                                                {{'controller.transmittingSuccess' | t}}
                                            </radio>
                                        </div>
                                    </transition>
                                </div>
                            </th>
                            <th width="30%">
                                {{'controller.transferTime' | t}}
                                <button type="button" class="table-sort-button" @click="timeSort">
                                    <svg aria-hidden="true"
                                         class="asc"
                                         :class="{active: sortOrder === 'asc'}">
                                        <use xlink:href="#icon-caret-down"></use>
                                    </svg>
                                    <svg aria-hidden="true"
                                         class="desc"
                                         :class="{active: sortOrder === 'desc'}">
                                        <use xlink:href="#icon-caret-down"></use>
                                    </svg>
                                </button>
                            </th>
                            <th width="30%">{{'contact.email' | t}}</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr v-for="(list, index) in transferList" :key="index">
                            <td>
                                <span v-if="list.sendStatus === 0 || list.reTrying">/</span>
                                <span v-else class="retry" @click="reTransfer(list)">{{'controller.reTry' | t}}</span>
                            </td>
                            <td>
                                <i v-if="list.reTrying" class="icon icon-loading"></i>
                                <span v-else>
                                    {{getStatusName(list.sendStatus)}}
                                    <i v-if="list.sendStatus === 1" class="icon icon-cuowu1"
                                       v-title:bottom="list.errorMessage"></i>
                                </span>
                            </td>
                            <td>{{list.sendTime}}</td>
                            <td class="show-all">{{list.email}}</td>
                        </tr>
                        <tr v-if="!transferList.length && !loading">
                            <td colspan="4" class="empty">
                                <list-search-empty v-if="keyword !== ''"></list-search-empty>
                                <list-empty v-else></list-empty>
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>
            <pager :total="transferTotalPage" :now="transferPageNumber" @page="pageChange"></pager>
        </modal>
    </div>
</template>

<script>
    import {SET_ACTIVE_CONTROLLER} from '@/store/vuex/mutationTypes';
    import { JourneyApiV3 } from '@/api';
    import {DRAGGABLE_JOURNEY_STORE_NAME} from '@/store/vuex/modules/canvasStore';
    import { mapMutations, mapState } from 'vuex';

    export default {
        name: 'leads-transfer-controller-view',
        props: {
            controller: Object
        },
        data() {
            return {
                filterNumber: 0,    // 进入人数
                sendNumber: 0,      // 传递人数
                showDataTable: false,   // 显示传递统计modal
                transferList: [],   // 传递详情列表
                keyword: '',        // 搜索邮箱关键词（最终）
                transferPageNumber: 1,  // 列表页码
                transferTotalPage: 0,   // 列表总页数
                chooseStatus: false,    // 传递状态筛选列表展示
                transferStatus: null,   // 传递状态
                sortOrder: '',          // 时间次序
                keywordTem: '',         // 输入的关键词
                loading: false,         // 请求过渡
            };
        },
        computed: {
            ...mapState({
                journeyInformation: state => state[DRAGGABLE_JOURNEY_STORE_NAME].journeyInformation,
                pushInfo(state) {
                    return state[DRAGGABLE_JOURNEY_STORE_NAME]
                        .canvasInformation.controllers[this.controller.id].pushInfo;
                },
            }),
            journeyId() {
                return this.journeyInformation.journeyInstantiationId;
            },
            taskId() {
                return this.pushInfo.taskInstantiationId;
            }
        },
        mounted() {
            // 实时旅程
            if (this.journeyInformation.journeyType === 2) {
                this.filterNumber = this.controller.enterCount;
                this.sendNumber = this.controller.sendCount;
            } else {
                // 定时旅程
                this.filterNumber = this.pushInfo.enterCount || 0;
                this.sendNumber = this.pushInfo.sendCount || 0;
            }
        },
        methods: {
            ...mapMutations([
                SET_ACTIVE_CONTROLLER
            ]),
            // 关闭控件
            close() {
                this.SET_ACTIVE_CONTROLLER('');
            },
            // 打开统计
            showStatistical() {
                this.showDataTable = true;
                this.getTransferList();
            },
            // 获取传递列表
            getTransferList() {
                this.loading = true;
                JourneyApiV3
                    .getClueRecord(this.keyword, this.journeyId,
                        this.transferPageNumber, this.transferStatus, this.sortOrder, this.taskId)
                    .then(res =>{
                        // 添加reTrying用于重试动画过渡
                        res.body.data.recordList.forEach(list =>{
                            list.reTrying = false;
                        });
                        this.transferList = res.body.data.recordList;
                        this.transferTotalPage = res.body.data.totalPage;
                        this.loading = false;
                    })
                    .catch(() =>{
                        this.loading = false;
                    });
            },
            // 搜索线索
            searchTransfer() {
                // 添加keywordTem 优化搜索后数据为空， 清空关键词未请求时，展示list-empty
                this.keyword = this.keywordTem;
                this.transferPageNumber = 1;
                this.getTransferList();
            },
            // 翻页
            pageChange(page) {
                this.transferPageNumber = page;
                this.getTransferList();
            },
            // 关闭传递统计modal
            closeDataTable() {
                this.showDataTable = false;
                this.initialData();
            },
            // 关闭传递状态列表
            closeStatus() {
                this.chooseStatus = false;
            },
            // 切换时间排序
            timeSort() {
                this.sortOrder = this.sortOrder === 'asc' ? 'desc' : 'asc';
                this.searchTransfer();
            },
            // 重新传递
            reTransfer(item) {
                if (item.reTrying === true) return;
                item.reTrying = true;
                JourneyApiV3
                    .retrySendClueToHW(item.customerId, item.email, this.journeyId, this.taskId, item.id)
                    .then(() =>{
                        item.reTrying = false;
                        this.getTransferList();
                    })
                    .catch(() =>{
                        item.reTrying = false;
                    });
            },
            // 状态码转换文本
            getStatusName(status) {
                return status === 1 ? this.$t('controller.transferFailure') :
                    this.$t('controller.transmittingSuccess');
            },
            // 状态筛选
            transferStatusChange() {
                this.searchTransfer();
            },
            // 初始化数据
            initialData() {
                this.keywordTem = '';
                this.keyword = '';
                this.transferPageNumber = 1;
                this.transferTotalPage = 0;
                this.transferStatus = null;
                this.sortOrder = '';
            }
        }
    };
</script>

<style lang="scss">
    @import "../../../../../../common/scss/base/variables";
    @import "../../../../../../common/scss/base/mixin";

    .leads-transform-controller-view {
        .data-view {
            .modal-content {
                display: flex;
                justify-content: space-around;
                div {
                    text-align: center;
                    p {
                        line-height: 25px;
                        font-size: 13px;
                    }
                }
                .send-number {
                    p:nth-of-type(2) {
                        cursor: pointer;
                        color: $theme;
                    }
                }
            }
        }
        .search-area {
            display: flex;
            justify-content: flex-end;
            margin: 15px 0;
            .input {
                margin-right: 8px;
            }
        }
        .simplify-table {
            .empty {
                padding: 0;
            }
            .filter-item {
                overflow: initial;
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
            }
            .retry {
                color: $theme;
                cursor: pointer;
            }
            .icon-loading {
                display: inline-block;
                font-size: 16px;
                @include animation(rotate 1s linear infinite);
            }
            .icon-cuowu1 {
                color: $light-red;
                font-size: 14px;
            }
            .show-all {
                text-overflow: initial;
                overflow: initial;
                word-break: break-all;
                white-space: initial;
            }
        }
        @keyframes rotate {
            from {
                @include transform(rotate(0deg));
            }
            to {
                @include transform(rotate(359deg));
            }
        }
    }
</style>
