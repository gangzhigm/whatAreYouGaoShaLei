<template>
    <div class='journey-picker' v-blur="close">
        <label @click="toggle">
            <span class="journey-name" :title="text">{{text}}</span>
            <span class="select-icon icon icon-arrow-down"></span>
        </label>
        <transition name="drop">
            <div v-if='showList' class='drop-down-list'>
                <template>
                    <ul>
                        <!-- <input type="text" v-model="searchGroupName" placeholder="请输入关键词"
                               @input="getGroupList"/> -->
                        <!-- <span class="icon icon-search"  @click="getGroupList"></span> -->
                        <inline-loading v-if="groupLoading"/>
                        <li v-else-if='groupList.length === 0'>{{'material.noGroup' | t}}</li>
                        <li v-else v-for='group in groupList' @click='selectGroup(group.id)'
                            :title='group.name'
                            :class='{active: group.id === groupId}'>
                            <span class="group-name">{{group.name}}</span>
                            <span class="icon icon-arrow-right"></span>
                        </li>
                    </ul>
                    <ul v-load="loadMore">
                        <input type="text" v-model="searchJourneyName" :placeholder="$t('common.selectKeywordHolder')"
                               @keydown.enter="selectGroup(groupId, 1)"/>
                        <span class="icon icon-search"  @click="selectGroup(groupId)"></span>
                        <inline-loading v-if="journeyLoading"/>
                        <li v-if='journeyList.length === 0&&!journeyLoading'>{{'common.noData' | t}}</li>
                        <li v-else v-for='paper in journeyList' @click='selectJourney(paper)'
                            :class='{active: paper.id === value}'
                            :title='paper.journeyName'>{{paper.journeyName}}
                        </li>
                    </ul>
                </template>
            </div>
        </transition>
    </div>
</template>
<script type="text/ecmascript-6">
    import { JourneyApiV3 } from '@/api';
    export default {
        props: {
            value: Number,
            //taskType 字段值需放在参数最后* 2021-10-14 2.5.15版本增加
            //0:邮件 1:短信 2:微信 3:彩信 4:线索传递(华为订制) 6：nike批次邮件 5:添加会员标签
            //9:移除会员标签 7:添加粉丝标签 8:移除粉丝标签 10.企业微信。
            //此字段存在数据，则只会返回存在对应任务的旅程列表。
            taskType: {
                type: [Number, String],
                default: ''
            }
        },
        data() {
            return {
                showList: false,
                groupList: [],
                journeyList: [],
                groupId: -1,
                text: '',
                groupLoading: true,
                journeyLoading: false,
                pageNumber: 1,
                totalPage: 1,
                searchJourneyName: '',
            };
        },
        mounted() {
            this.getGroupList();
        },
        methods: {
            toggle() {
                this.showList = !this.showList;
            },
            close() {
                this.showList = false;
            },
            getGroupList() {
                this.groupLoading = true;
                // 获取所有旅程分组
                JourneyApiV3
                    .getGroups()
                    .then((res) => {
                        this.groupLoading = false;
                        this.groupList = res.body.data.groupList;
                        if (this.value) {
                            // 根据旅程id获取所在分组id
                            JourneyApiV3
                                .getJourney(this.value)
                                .then((res) => {
                                    this.groupId = res.body.data.journey.groupId;
                                    this.text = res.body.data.journey.journeyName;
                                    this.$emit('select', res.body.data.journey);
                                    this.checker([], this.value);
                                    this.groupLoading = false;
                                    this.$emit('getCurGroup', this.groupId);

                                    this.$emit('sendJourneyType', res.body.data.journey.journeyType);
                                })
                                .catch(() => {
                                    this.text = this.$t('data.selectJourneyTip');
                                    this.groupLoading = false;
                                });
                        } else {
                            this.text = this.$t('data.selectJourneyTip');
                            this.groupLoading = false;
                        }
                    });
            },
            // 请求表单列表
            selectGroup(groupId) {
                this.pageNumber = 1;
                this.totalPage = Infinity;
                this.groupId = groupId;
                this.journeyList = [];
                this.$nextTick(() => {
                    this.loadMore();
                });
                this.$emit('getCurGroup', this.groupId);
            },
            selectJourney(paper) {
                this.text = paper.journeyName;
                let paperTimeZone = paper.timeZone ? paper.timeZone : '';
                let paperCreateDate = paper.createDate ? paper.createDate : '';
                localStorage.setItem('LOCAL_TIME_ZONE_SHOW', paperTimeZone);
                localStorage.setItem('LOCAL_TIME_ZONE_DATE', paperCreateDate);
                this.$emit('input',paper.id,{timeZone: paperTimeZone,date: paperCreateDate});
                this.showList = false;
                this.$emit('sendJourneyType', paper.journeyType);
            },
            checker(journeyList = [], id) {
                const vm = this;
                let target;
                // recover journey
                target = journeyList.find(journey =>
                    journey.id === id
                );
                if (id && vm.totalPage >= vm.pageNumber && !target) {
                    return vm.loadMore(this.checker);
                }
                if (target) {
                    vm.journeyId = id;
                }
            },
            loadMore(checker) {
                if (this.journeyLoading) return;
                if (this.pageNumber > this.totalPage) return;
                this.journeyLoading = true;
                JourneyApiV3
                    .getJourneys({
                        groupId: this.groupId,
                        pageNumber: this.pageNumber++,
                        journeyType: [0,1,2],
                        journeyStatus: 4,
                        journeyName: this.searchJourneyName,
                        journeyTemplateIds: this.value,
                        taskType: this.taskType,
                    })
                    .then((res) => {
                        this.journeyLoading = false;
                        let list = res.body.data.list;
                        this.journeyList = this.journeyList.concat(list);
                        this.totalPage = res.body.data.totalPage;
                        this.$nextTick(() => {
                            if (typeof checker === 'function') {
                                this.checker(list, this.journeyId);
                            }
                        });
                    })
                    .catch(() =>{
                        this.pageNumber--;
                        this.$nextTick(() => {
                            this.journeyLoading = false;
                        });
                    });
            }
        },
        filters: {
            ellipsis: function (value, n) {
                return value.length > n
                    ? value.substring(0, n - 1) + ' ..'
                    : value;
            }
        }
    };
</script>
<style lang="scss" type="text/scss" rel="stylesheet/scss">
    @import "../../../../common/scss/base/variables";
    @import "../../../../common/scss/base/mixin";

    .journey-picker {
        display: inline-block;
        vertical-align: middle;
        position: relative;
        width: 465px;
        .journey-name {
            display: inline-block;
            width: 92%;
            @include ellipsis();
        }

        label {
            display: block;
            position: relative;
            width: 465px;
            height: $input-field-height - 2px;
            line-height: $input-field-height - 2px;
            border: 1px solid $border-color;
            border-radius: 4px;
            padding-right: 8px;
            cursor: pointer;
            padding-left: 1em;

            &:hover {
                border-color: $light-green;
            }

            .icon {
                float: right;
            }
        }
        .drop-down-list {
            position: absolute;
            z-index: 1;
            display: flex;
            left: 0;
            top: 100%;
            margin-top: 4px;
            width: 485px;
            height: 160px;
            background-color: white;
            border: 1px solid $border-color;
            border-radius: 4px;

            ul {
                flex: 1;
                height: 100%;
                overflow: auto;
                position: relative;

                + ul {
                    border-left: 1px solid $border-color;
                }

                li {
                    padding: 0 8px 0 16px;
                    height: $input-field-height;
                    line-height: $input-field-height;
                    @include ellipsis();
                    cursor: pointer;

                    &:hover {
                        background-color: $hover-bg;
                    }

                    .icon {
                        float: right;
                    }
                    .group-name {
                        display: inline-block;
                        width: 88px;
                        @include ellipsis();
                    }
                }
                .active {
                    background-color: $select-bg;

                    &:hover {
                        background-color: $select-bg;
                    }
                }
            }
            input {
                height: $input-field-height;
                padding: 0 8px 0 28px;
                width: calc(100% - 38px);
                border: none;
                background-color: transparent;

                &:hover {
                    background-color: $select-bg;

                    & + .icon-search {
                        background-color: $select-bg;
                    }
                }

                &:focus {
                    background-color: #fff;

                    & + .icon-search {
                        background-color: #fff;
                    }
                }
            }
            .icon-search {
                $offset: ($input-field-height - 14px) / 2;
                position: absolute;
                width: 26px;
                height: $input-field-height - 2px;
                line-height: $input-field-height;
                text-align: center;
                left: 1px;
                top: 1px;
                background-color: transparent;
            }
        }
    }
</style>
