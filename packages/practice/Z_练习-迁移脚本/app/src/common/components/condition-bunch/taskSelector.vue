<template>
    <div class='cascading' v-blur="close" :disabled="disabled">
        <label class="select-text" :class="{'disabled': disabled, 'view-mode': viewMode}" @click="toggle">
            <span v-if="taskName" class="text-select-name" :title="taskName">{{taskName}}</span>
            <span v-else class="placeholder">{{$t('swarm.taskPlaceholder')}}</span>
            <span class="select-icon icon icon-arrow-down"></span>
        </label>
        <transition name="drop">
            <div class="csedes" v-if="showList">
                <inline-loading v-if="loading"/>
                <div v-if='!loading' class="drop-down-list">
                    <ul>
                        <li>
                            <label class="search-field">
                                <input type="text" ref="search" v-model.trim="keyword" :placeholder="$t('common.selectKeywordHolder')"
                                       @input="search()">
                                <span class="icon icon-search" @click="search()"></span>
                            </label>
                        </li>
                        <li v-if="lists.length === 0">{{'common.noData' | t}}</li>
                        <li v-else v-for="(parent,parentIndex) in lists" @click="getJourneyList(parent)"
                            :class="{active: parent.id === selectJourneyGroup}" :title="parent.name">
                            <span class="position-span"><span class="icon icon-arrow-right"></span></span>
                            {{parent.name}}
                            <inline-loading class="journey-loading" v-show="journeyLoading"/>
                            <ul v-if="parent.id === selectJourneyGroup && !journeyLoading" @click.stop>
                                <li v-if="parent && parent.child.length === 0">{{'common.noData' | t}}</li>
                                <li v-for="item in parent.child" @click.stop="selectJourney(item.id)"
                                    :class="{active: item.id === selectJourneyID}" :title="item.journeyName">
                                    <span class="position-span"><span class="icon icon-arrow-right"></span></span>
                                    {{item.journeyName}}
                                </li>
                            </ul>
                            <ul v-if="selectJourneyGroup === '' && parentIndex === 0" @click.stop>
                                <li><em>{{'swarm.pickAGroup' | t}}</em></li>
                            </ul>
                            <div class="secSearch" v-if="parent.id === selectJourneyGroup" @click.stop>
                                <label class="search-field">
                                    <input type="text" ref="search" v-model.trim="secKeyword" :placeholder="$t('common.selectKeywordHolder')"
                                           :disabled="journeyLoading" @input="search(parentIndex)">
                                    <span class="icon icon-search" @click="search(parentIndex)"></span>
                                </label>
                            </div>
                        </li>
                    </ul>
                    <div class="taskList" v-if="selectJourneyID && selectJourneyID !== '' && !journeyLoading">
                        <inline-loading class="task-loading" v-if="taskLoading"/>
                        <span v-if="taskSearchList.length === 0 && !taskLoading">{{'common.noData' | t}}</span>
                        <div class="thiSearch">
                            <label class="search-field">
                                <input type="text" ref="search" v-model.trim="thiKeyword" :placeholder="$t('common.selectKeywordHolder')"
                                       :disabled="taskLoading" @input="taskSearch()">
                                <span class="icon icon-search" @click="taskSearch()"></span>
                            </label>
                        </div>
                        <ul v-if="taskSearchList.length && !taskLoading">
                            <li v-for="(item,index) in taskSearchList" :key="index" @click.stop="selectTask(item)"
                                :class="{active: item.id === selectTaskID}" :title="item.taskName">{{item.taskName}}</li>
                        </ul>
                    </div>
                </div>
            </div>
        </transition>
    </div>
</template>
<script type="text/ecmascript-6">

    import { JourneyApiV3 } from '@/api';
    import filterArrayByName from '../../../common/utils/filterArrayByName';

    export default {
        props: {
            list: Array,        //旅程分组列表
            value: '',          //任务ID
            journey: '',        //旅程ID
            journeyGroup: '',   //旅程分组ID
            disabled: Boolean,
            viewMode: {
                type: Boolean,
                default: false
            }, //查看模式
        },
        data () {
            return {
                showList: false,            //列表是否打开
                lists: [],                  //当前展示的列表
                taskName: '',               //任务名称
                selectTaskID: '',           //选中的任务ID
                selectJourneyID: '',        //选中的旅程ID
                selectJourneyGroup: '',     //选中的旅程分组ID
                journeyLoading: false,      //旅程列是否加载中
                taskLoading: false,         //任务列是否加载中
                keyword: '',                //旅程分组搜索关键字
                secKeyword: '',             //旅程搜索关键字
                thiKeyword: '',             //任务搜索关键字
                childList: [],              //旅程列完整列表
                taskList: [],               //任务列完整列表
                taskSearchList: []          //当前任务列列表
            };
        },
        created() {
            //用于数据回显时加载数据
            let listTimes = 0;
            let loadList = setInterval(() => {
                listTimes = listTimes + 1;
                //父组件中对数据结构进行重组，list传递延迟，需多次判断
                if (this.list.length) {
                    clearInterval(loadList);
                    this.selectJourneyGroup = this.journeyGroup;
                    this.selectJourneyID = this.journey;
                    this.selectTaskID = this.value;
                    this.lists = this.list;
                    if (this.selectTaskID) {
                        for (let i = 0; i < this.lists.length; i++) {
                            if (this.lists[i].id === this.selectJourneyGroup) {
                                this.getJourneyList(this.lists[i], 'init');
                            }
                        }
                        this.selectJourney(this.selectJourneyID, 'init');
                    } else {
                        this.getJourneyList(this.lists[0]);
                    }
                }
                if (listTimes > 100) {
                    clearInterval(loadList);
                }
            },100);
        },
        computed: {
            loading() {
                if (this.lists) {
                    return false;
                }
                return true;
            }
        },
        watch: {
            showList(newVal, oldVal) {
                if (!newVal && newVal !== oldVal) {
                    if (this.list.length) {
                        //this.selectJourneyGroup = this.journeyGroup;
                        //this.selectJourneyID = this.journey;
                        //this.selectTaskID = this.value;
                        this.lists = this.list;
                        this.keyword = '';
                        this.secKeyword = '';
                        if (this.selectTaskID) {
                            for (let i = 0; i < this.lists.length; i++) {
                                if (this.lists[i].id === this.selectJourneyGroup) {
                                    this.getJourneyList(this.lists[i], 'init');
                                }
                            }
                            this.selectJourney(this.selectJourneyID, 'init');
                        } else {
                            this.getJourneyList(this.lists[0]);
                        }
                    }
                }
            },
            journeyGroup(newVal, oldVal) {
                if (oldVal && !newVal) {
                    this.selectJourneyGroup = '';
                    this.selectJourneyID = '';
                    this.selectTaskID = '';
                    this.taskName = '';
                }
            }
        },
        methods: {
            toggle() {
                if (this.disabled || this.viewMode) {
                    return;
                }
                this.showList = !this.showList;
            },
            close() {
                this.showList = false;
            },
            //根据旅程分组ID，获取旅程列表数据
            getJourneyList(group,init) {
                this.journeyLoading = true;
                this.selectJourneyGroup = group.id;
                if (init !== 'init') {
                    this.selectJourneyID = '';
                    this.thiKeyword = '';
                    this.taskList = [];
                    this.taskSearchList = [];
                }
                JourneyApiV3
                    .getAllJourneys({
                        groupId: group.id,
                        journeyStatus: 4,
                        journeyType: 0,
                        journeyName: ''
                    })
                    .then((res) => {
                        let journeyList = res.body.data.list.filter(item => item.journeyInstantiationIds.length);
                        group.child = journeyList;
                        this.childList = journeyList;
                        this.journeyLoading = false;
                    });
            },
            //选择旅程
            selectJourney(journeyID,init) {
                this.taskLoading = true;
                this.selectJourneyID = journeyID;
                JourneyApiV3
                    .prepositionTask({journeyId: journeyID,type: 0})
                    .then(res => {
                        let journeyList = res.body.data.taskList.filter(item => item.taskInstantiationIds.length);
                        this.taskList = journeyList;
                        this.taskSearchList = journeyList;
                        this.thiKeyword = '';
                        this.taskSearchList.forEach(item => {
                            if (item.id === this.selectTaskID) {
                                this.taskName = item.taskName;
                            }
                        });
                        if (init === 'init' && this.selectTaskID &&
                            this.taskSearchList.filter(item => (item.id === this.selectTaskID)).length === 0) {
                            this.$emit('noitem');
                        }
                        this.taskLoading = false;
                    });
            },
            //选择任务
            selectTask(task) {
                let journey = {};
                journey.selectJourneyGroup = this.selectJourneyGroup;
                journey.selectJourneyID = this.selectJourneyID;
                journey.name = task.taskName;
                journey.taskIDS = task.taskInstantiationIds;
                this.taskName = task.taskName;
                this.$emit('input', task.id);
                this.$emit('select', journey);
                this.showList = false;
            },
            //旅程分组和旅程列的搜索
            search(parentIndex) {
                this.thiKeyword = '';
                this.taskList = [];
                this.taskSearchList = [];
                this.selectJourneyID = '';
                if (parentIndex !== undefined) {
                    //旅程列的搜索
                    if (this.secKeyword === '') {
                        this.lists[parentIndex].child = this.childList;
                    } else {
                        this.lists[parentIndex].child =
                            filterArrayByName(this.childList,this.secKeyword,'journeyName');
                    }
                } else {
                    //旅程分组的搜索
                    this.secKeyword = '';
                    this.selectJourneyGroup = '';
                    for (let i = 0;i < this.lists.length;i++) {
                        if (this.lists[i].id === this.selectJourneyGroup) {
                            this.lists[i].child = [];
                        }
                    }
                    if (this.keyword === '') {
                        this.lists = this.list;
                    } else {
                        this.lists = filterArrayByName(this.list,this.keyword);
                    }
                }
            },
            //任务列的搜索
            taskSearch() {
                if (this.thiKeyword === '') {
                    this.taskSearchList = this.taskList;
                } else {
                    this.taskSearchList =
                        filterArrayByName(this.taskList,this.thiKeyword,'taskName');
                }
            },
        }
    };
</script>
<style lang="scss" type="text/scss" rel="stylesheet/scss">
    @import "../../../common/scss/base/variables";
    @import "../../../common/scss/base/mixin";

    .cascading {
        .csedes{
            .drop-down-list {
                ul {
                    width: 150px;
                    background-color: white;
                    ul {
                        position: absolute;
                        top: 0;
                        left: 150px;
                    }
                    li:first-child{
                        top: 0;
                        left: 0;
                    }
                }
                .journey-loading {
                    position: absolute;
                    left: 205px;
                    top: 100px;
                    margin: 0;
                }

                .secSearch{
                    position: absolute;
                    left: 150px;
                    top: 0;
                    width: 150px;
                }

                .taskList{
                    position: absolute;
                    left: 300px;
                    top: -1px;
                    width: 151px;
                    height: 252px;
                    overflow-x: hidden;
                    overflow-y: auto;
                    border-bottom: 1px solid #cfd5df;
                    border-right: 1px solid #cfd5df;
                    border-top: 1px solid #cfd5df;
                    box-sizing: border-box;
                    background-color: white;
                    .task-loading{
                        position: absolute;
                        right: 55px;
                        top: 100px;
                        margin: 0;
                    }
                    &>span{
                        display: inline-block;
                        padding: 15px;
                        margin-top: 32px;
                    }
                    .thiSearch{
                        position: absolute;
                        left: 0;
                        top: 0;
                        width: 150px;
                        z-index: 1;
                        .search-field{
                            input:focus{
                                border-top: 1px solid #cfd5df;
                            }
                        }
                    }
                    ul{
                        padding: 32px 0 0;
                        li:first-child{
                            width: auto;
                            position: relative;
                            top: 0;
                            left: 0;
                            padding: 0 8px 0 16px;
                        }
                    }
                }
            }
        }
    }
</style>
