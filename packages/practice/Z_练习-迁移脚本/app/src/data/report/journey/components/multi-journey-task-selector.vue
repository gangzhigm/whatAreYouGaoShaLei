<template>
    <div class="multi-journey-task-selector" v-blur="close">
        <label @click="toggle" class="labels">
            <span v-if="!textList.length" class="select-journey-name">{{'data.selectJourneyTip' | t}}</span>
            <template v-else>
                <span class="journey-name" v-for="text in textList" :key="text.id" :title="text.name">
                    {{text.name}}
                    <i class="icon icon-close" @click="delSelectTask(text.id)"></i>
                </span>
            </template>
            <span class="select-icon icon icon-arrow-down"></span>
        </label>
        <transition name="drop">
            <div v-if='showList' class='drop-down-list'>
                <template>
                    <div class="content" v-if="!typeDate">
                        <ul class="max-height">
                            <!-- <input type="text" v-model="searchGroupName" placeholder="请输入关键词"
                                   @input="getGroupList"/> -->
                            <!-- <span class="icon icon-search"  @click="getGroupList"></span> -->
                            <inline-loading :offset="'sm'" v-if="groupLoading"/>
                            <li v-if='groupList.length === 0 && !groupLoading'>{{'material.noGroup' | t}}</li>
                            <li v-else v-for="group in groupList" :key="group.id" @click='selectGroup(group.id)'
                                :title='group.name' :class="{'active': currentGroupId === group.id}">
                                <span class="group-name">{{group.name}}</span>
                                <span class="icon icon-arrow-right"></span>
                            </li>
                        </ul>
                    </div>
                    <div class="content">
                        <label class="search-area">
                            <input type="text" class="search-input" v-model.trim="searchJourneyName" :placeholder="$t('common.selectKeywordHolder')"
                                   @keydown.enter="selectGroup(currentGroupId)"/>
                            <span class="icon icon-search"  @click="selectGroup(currentGroupId)"></span>
                        </label>
                        <ul v-load="loadMoreJourney">
                            <inline-loading :offset="'sm'" v-if="journeyLoading"/>
                            <li v-if='journeyList.length === 0 && !journeyLoading'>{{'common.noData' | t}}</li>
                            <li v-else v-for="journey in journeyList" :key="journey.id" @click='selectJourney(journey.id)'
                                :title='journey.journeyName' :class="{'active': currentJourneyId === journey.id}">
                                <span class="group-name">{{journey.journeyName}}</span>
                                <span class="icon icon-arrow-right"></span>
                            </li>
                        </ul>
                    </div>
                    <div class="content">
                        <label class="search-area">
                            <input type="text" class="search-input" v-model.trim="searchTaskName" :placeholder="$t('common.selectKeywordHolder')"
                                   @keydown.enter="selectJourney(currentJourneyId)"/>
                            <span class="icon icon-search"  @click="selectJourney(currentJourneyId)"></span>
                        </label>
                        <ul v-if="currentJourneyId" v-load="loadMoreTask">
                            <inline-loading :offset="'sm'" v-if="taskLoading"/>
                            <li v-if='taskList.length === 0 && !taskLoading'>{{'common.noData' | t}}</li>
                            <li v-else v-for="task in taskList" :key="task.id" :title='task.name'>
                                <checkbox :source="task.id" @input='selectTask(task)'
                                          v-model="taskValues" class="group-name">{{task.name}}</checkbox>
                            </li>
                        </ul>
                        <span class="no-data-padding" v-else>{{'common.noData' | t}}</span>
                    </div>
                </template>
            </div>
        </transition>
    </div>
</template>

<script>
    import { JourneyApiV2, JourneyApiV3 } from '@/api';

    export default {
        name: 'multi-journey-task-selector',
        props: {
            typeDate: {
                type: Boolean,
                default: false
            },
            // 仅typeDate为true使用
            dateRange: {
                type: Object
            },
            taskType: {
                type: [Number,String],
                default: '',
            }
        },
        data() {
            return {
                showList: false, // 组件数据选择显示隐藏
                groupLoading: false, // 分组loading
                groupList: [],  // 分组列表
                journeyLoading: false, // 旅程 loading
                currentGroupId: '',
                journeyList: [],  //旅程列表
                searchJourneyName: '',  //搜索旅程
                currentJourneyId: '', //
                textList: [], // 选择的数据
                searchTaskName: '', // 搜索任务
                taskLoading: false, // 任务 loading
                taskList: [],  //任务列表
                taskValues: [],
                journeyPageNo: 1,  //旅程页码
                journeyTotalPage: 0, //
                taskPageNo: 1, // 任务页码
                taskTotalPage: 0, //
                originalData: [],
                taskIdList:[],
            };
        },
        watch: {
            'dateRange.changeTimes'() {
                if (this.typeDate) {
                    this.clear();
                    this.selectGroup('');
                }
            },
        },
        mounted() {
            if (this.$route.query.journeyId && this.$route.query.taskId.length > 0) {
                this.currentJourneyId = Number(this.$route.query.journeyId);
                if (typeof (this.$route.query.taskId) === 'string') {
                    this.taskIdList.push(Number(this.$route.query.taskId));
                } else {
                    this.taskIdList = this.$route.query.taskId;
                }
                if (Number(this.$route.query.dataSourceId) === 0) {
                    this.selectJourney(Number(this.$route.query.journeyId), 'mounted');
                } else {
                    this.selectGroup(Number(this.$route.query.currentGroup));
                    this.selectJourney(Number(this.$route.query.journeyId), 'mounted');
                }
            }
            if (!this.typeDate) {
                this.getAllJourneyGroup();
            } else {
                this.getDateJourney();
            }
        },
        methods: {
            changeTypeDate(value) {
                this.clear();
                if (value) {
                    this.getDateJourney();
                } else {
                    this.getAllJourneyGroup();
                }
                let returnData = {
                    name: [],
                    ids: [],
                    taskIds: []
                };
                this.$emit('input',returnData);
            },
            close() {
                this.showList = false;
            },
            toggle() {
                this.showList = !this.showList;
            },
            // 获取分组
            getAllJourneyGroup() {
                this.groupList = [];
                this.groupLoading = true;
                JourneyApiV3
                    .getGroups()
                    .then(({body: {data :{groupList}}}) =>{
                        this.groupList = groupList;
                        this.groupLoading = false;
                    })
                    .catch(() =>{
                        this.groupLoading = false;
                    });
            },
            // 选择分组
            selectGroup(id) {
                this.currentGroupId = id;
                this.journeyPageNo = 1;
                this.journeyList = [];
                this.journeyTotalPage = Infinity;
                // 清空任务
                this.currentJourneyId = '';
                this.taskPageNo = 1;
                this.taskList = [];
                this.taskTotalPage = Infinity;
                this.searchTaskName = '';
                this.$nextTick(() =>{
                    this.loadMoreJourney();
                });
            },
            /** 选择旅程
             * @param id 旅程id
             * @param type 是否是首次载入 'mounted'：首次载入，不传默认是非首次载入
             */
            selectJourney(id, type) {
                this.currentJourneyId = id;
                this.taskPageNo = 1;
                this.taskList = [];
                this.taskTotalPage = Infinity;
                this.$nextTick(() =>{
                    this.loadMoreTask(type);
                });
            },
            // 选择任务
            selectTask(task) {
                let curIndex = this.originalData.findIndex(original => original.id === task.id);
                if (this.taskValues.findIndex(id => id === task.id) === -1) {
                    this.originalData.splice(curIndex,1);
                } else {
                    this.originalData.push(task);
                }

                // this.textList = this.originalData.map(original => {
                //     return {name: `${original.journeyName} - ${original.name}（${original.sendDate}）`,id: original.id};
                // });
                this.textList = [];
                this.originalData.map(original => {
                    if (original.immediately !== 0 && original.immediately !== 1) {
                        this.textList.push({name: `${original.journeyName} - ${original.name}（${original.sendDate}）`,id: original.id});
                    } else {
                        this.textList.push({name: `${original.journeyName} - ${original.name}`,id: original.id});
                    }
                    return this.textList;
                });

                let returnData = {
                    name: this.textList,
                    ids: [...new Set(this.originalData.map(original => original.journeyTemplateId))],
                    taskIds: this.taskValues,
                    // 版本2.4.5导出邮件报告-图表数据PK需求参数(同一旅程不去重journeyId)
                    instantionIds: this.originalData.map(original => original.journeyInstantiationId),
                    templateId: this.originalData.map(original => original.journeyTemplateId)
                };
                
                this.$emit('input',returnData);
            },
            // 获取旅程
            loadMoreJourney() {
                if (this.journeyLoading) return;
                if (this.journeyPageNo > this.journeyTotalPage) return;
                if (!this.currentGroupId && !this.typeDate) return this.$toast(this.$t('privilege.groupNoEmpty'),'warn');
                this.journeyLoading = true;
                if (this.typeDate) {
                    this.getDateJourney();
                } else {
                    this.getJourney();
                }
            },
            // 获取任务
            loadMoreTask(type) {
                if (this.taskLoading) return;
                if (this.taskPageNo > this.taskTotalPage) return;
                if (!this.currentJourneyId) return this.$toast(this.$t('data.selectJourneyTip'),'warn');
                this.taskLoading = true;
                JourneyApiV2
                // 0:邮件,1:短信,2:微信
                    .getTasks([], '', [this.currentJourneyId], this.taskPageNo++, this.searchTaskName, '', 0,
                        this.taskIdList.length > 0 ? this.taskIdList : null, 50)
                    .then(({body: {data: {taskInstantiationList,totalPage}}}) => {
                        this.taskTotalPage = totalPage;
                        this.taskList = this.taskList.concat(taskInstantiationList);
                        this.taskLoading = false;
                        this.echoTask(this.taskList,type);
                    })
                    .catch(() =>{
                        this.taskLoading = false;
                        this.taskPageNo--;
                    });
            },
            //由邮件报告进入本页时，自动按指定旅程载入来源邮件报告页所选的旅程和邮件，如果之前选的是邮件报告汇总选项则无需自动载入为空
            echoTask(taskList, type) {
                if (type !== 'mounted' ) return;
                if (this.$route.query.journeyId && this.$route.query.taskId.length > 0) {
                    let curTaskId = [];
                    if (typeof (this.$route.query.taskId) === 'string') {
                        curTaskId.push(Number(this.$route.query.taskId));
                    } else {
                        curTaskId = this.$route.query.taskId;
                    }
                    // let curTaskId = this.$route.query.taskId;
                    let curTaskObj = taskList.filter((obj) => {
                        if (curTaskId.indexOf(obj.id) !== -1) {
                            return obj;
                        }
                    });
                    this.originalData.push(...curTaskObj);
                    //避免切换旅程时重复添加
                    curTaskId.forEach((i)=>{
                        if (this.taskValues.indexOf(i) === -1) {
                            this.taskValues.push(i);                       
                        }
                    });
                    // if (this.taskValues.indexOf(curTaskId) === -1) {
                    //     this.taskValues.push(curTaskObj.id);
                    //     this.originalData.push(curTaskObj);
                    // }
                    this.originalData.map(original => {
                        if (original.immediately !== 0 && original.immediately !== 1) {
                            this.textList.push({name: `${original.journeyName} - ${original.name}（${original.sendDate}）`,id: original.id});
                        } else {
                            this.textList.push({name: `${original.journeyName} - ${original.name}`,id: original.id});
                        }
                        return this.textList;
                    });
                    // this.textList = this.originalData.map(original => {
                    //     return {name: `${original.journeyName} - ${original.name}（${original.sendDate}）`,id: original.id};
                    // });
                }
            },
            // 删除选择的任务
            delSelectTask(id) {
                this.textList.splice(this.textList.findIndex(text => text.id === id), 1);
                this.taskValues.splice(this.taskValues.findIndex(task => task === id),1);
                this.originalData.splice(this.originalData.findIndex(original => original.id === id),1);

                let returnData = {
                    name: this.textList,
                    ids: [...new Set(this.originalData.map(original => original.journeyTemplateId))],
                    taskIds: this.taskValues,
                    // 版本2.4.5导出邮件报告-图表数据PK需求参数(同一旅程不去重journeyId)
                    instantionIds: this.originalData.map(original => original.journeyInstantiationId),
                    templateId: this.originalData.map(original => original.journeyTemplateId)
                };

                this.$emit('input',returnData);
            },
            // 时间段旅程获取
            getDateJourney() {
                this.journeyLoading = true;
                JourneyApiV3
                    .getJourneysRealTime(
                        null, this.dateRange.endDate, this.currentJourneyId,
                        this.journeyPageNo++, this.searchJourneyName,
                        this.dateRange.startDate, this.taskType)
                    .then(res => {
                        this.journeyLoading = false;
                        let list = res.body.data.journeyTemplateList.map(elm => {
                            return {id: elm.id,journeyName: elm.name};
                        });
                        this.journeyList = this.journeyList.concat(list);
                        this.journeyTotalPage = res.body.data.totalPage;
                    })
                    .catch(err =>{
                        this.$toast(err.message,'warn');
                        this.journeyLoading = false;
                    });
            },
            // 获取分组旅程
            getJourney() {
                JourneyApiV3
                    .getJourneys({
                        groupId: this.currentGroupId,
                        pageNumber: this.journeyPageNo++,
                        journeyType: [0,1,2],
                        journeyStatus: 4,
                        journeyName: this.searchJourneyName,
                        journeyTemplateIds: this.currentJourneyId,
                        taskType: this.taskType
                    })
                    .then(({body: {data}}) => {
                        this.journeyLoading = false;
                        this.journeyList = this.journeyList.concat(data.list);
                        this.journeyTotalPage = data.totalPage;
                    })
                    .catch(() =>{
                        this.journeyLoading = false;
                        this.journeyPageNo--;
                    });
            },
            clear() {
                // 清空旅程
                this.currentGroupId = '';
                this.journeyPageNo = 1;
                this.journeyList = [];
                this.journeyTotalPage = Infinity;
                this.searchJourneyName = '';
                // 清空任务
                this.currentJourneyId = '';
                this.taskPageNo = 1;
                this.taskList = [];
                this.taskTotalPage = Infinity;
                this.searchTaskName = '';
                // 清空需求数据
                this.textList = [];
                this.originalData = [];
                this.taskValues = [];
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

<style lang="scss">
    @import "../../../../common/scss/base/variables";
    @import "../../../../common/scss/base/mixin";

    .multi-journey-task-selector {
        display: inline-block;
        vertical-align: middle;
        position: relative;
        .journey-name {
            display: inline-block;
            max-width: 415px;
            border: 1px solid #826dee;
            margin: 2px 4px 2px 0;
            padding: 0 16px 0 5px;
            border-radius: 4px;
            background-color: #f2f0ff;
            color: #826dee;
            line-height: 25px;
            height: 25px;
            @include ellipsis();
            @include box-sizing();
            position: relative;

            .icon-close {
                position: absolute;
                right: 0;
                &:hover {
                    color: $light-red;
                }
            }
        }
        .select-journey-name {
            line-height: $input-field-height - 2px;
        }

        .labels {
            display: block;
            position: relative;
            width: 465px;
            min-height: $input-field-height - 2px;
            line-height: 0;
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
                margin: 0 3px;
            }

            .icon-arrow-down {
                height: 30px;
                line-height: 30px;
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

            .content {
                position: relative;
                width: 100%;
                overflow: hidden;
                + .content {
                    border-left: 1px solid $border-color;
                }
                ul {
                    height: calc(100% - 32px);
                }
                .max-height {
                    height: 100%;
                }
                .no-data-padding{
                    padding: 0 8px 0 16px;
                }
            }

            ul {
                flex: 1;
                overflow: auto;

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
                        width: 100%;
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

        }
        .search-area {
            flex: 1;
            .search-input {
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
