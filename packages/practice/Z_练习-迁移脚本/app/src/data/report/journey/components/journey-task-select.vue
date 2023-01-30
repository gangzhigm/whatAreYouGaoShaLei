<template>
    <div class="journey-task-select">
        <selector class="lg" :options="dataSourceList" v-model="sourceId" @select="selectType"/>
        <date-range format="YYYY-MM-DD" :start="dateRange.startDate" :end="dateRange.endDate"
                    @change="changeDate" v-if="!sourceId" :partCuts="partCuts"/>
        <template v-if="multi">
            <multi-select :options="journeyList" v-model="journeyIds"
                          :shortcutAction="false" ref="select"
                          :placeholder="$t('data.selectJourneyTip')"
                          :search="'async'"
                          :autoWidth="false"
                          :dropDirection="'bottom'" @input="changeJourney"
                          @load="loadMore" @search="searchJourney"></multi-select>
        </template>
        <template v-else>
            <journey-picker v-if="sourceId" :value="journeyId" @input="selectId" :taskType="taskType"
                            @getCurGroup="getCurGroup" @sendJourneyType="sendJourneyType"/>
            <selector class="hg" ref="select" :options="journeyList" v-model="journeyId" @search="searchJourney"
                      @load="loadMore" v-if="dateRange.startDate && !sourceId"
                      :placeholder="$t('data.selectJourneyTip')" @select="selectJourney"
                      search="async" @hide="hideJourneyList"/>
        </template>
    </div>
</template>
<script>
    import { JourneyApiV2, JourneyApiV3 } from '@/api';
    import {eachDay, subDays, format} from 'date-fns';
    import JourneyPicker from './journey-picker.vue';
    import {difference} from 'lodash';

    export default {
        name: 'journey-task-select',
        components: {
            JourneyPicker
        },
        props: {
            // 'overview'（旅程概览）,'report'（发送报告）,'export'（导出数据）, 'export-compare'(邮件导出对比)
            // ‘export’不包含汇总选项 ，'export-compare'只选择时间时添加汇总选项
            useItems: {
                type: String,
                default: 'overview'
            },
            // 旅程Id
            id: {
                type: [Number, Array],
                require: true,
            },
            // 筛选时间
            date: {
                type: Object
            },
            source: {
                type: Number,
                default: 0
            },
            needRealTime: {
                type: Boolean,
                default: false,
            },
            // 启用多选框
            multi: {
                type: Boolean,
                default: false
            },
            // 重置数据
            clear: {
                type: Boolean,
                default: false
            },
            customizePartCuts: {
                type: Array,
                default: () => {
                    return [];
                }
            },
            //*字段值需放在参数最后* 2021-10-14 2.5.15版本增加
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
                dateRange: {
                    startDate: '',
                    endDate: '',
                },
                // 旅程选择类别
                dataSourceList: [
                    {name: this.$t('data.byJourneyFirstTime'), id: 0},
                    {name: this.$t('data.byJourney'), id: 1}
                ],
                sourceId: 0,
                partCuts: ['YESTERDAY', 'TODAY', 'LAST_WEEK', 'THIS_WEEK', 'LAST_7_DAYS', 'LAST_30_DAYS'],
                // 旅程
                journeyId: null,
                // 旅程列表
                journeyList: [],
                journeyTotalPage: 0,
                journeyPageNo: 1,
                journeyKeyWord: '',
                journeyIds: [],
                // curGroupId:'',//指定旅程状态下 数据页跳转前选中的分组
            };
        },
        mounted() {
            this.$nextTick(() => {
                if (this.customizePartCuts.length) this.partCuts = [...this.customizePartCuts];
                if (this.useItems === 'export-compare') {
                    this.partCuts = ['YESTERDAY', 'TODAY', 'LAST_WEEK', 'THIS_WEEK', 'LAST_7_DAYS', 'LAST_30_DAYS', 'LAST_HALF_YEAR'];
                }
                this.sourceId = this.source ? Number(this.source) : 0;
                this.dateRange = this.date && this.date.startDate ? this.date : {startDate: '', endDate: ''};

                if (!this.sourceId && !this.dateRange.startDate) {
                    this.dateRange = {
                        startDate: format(subDays(new Date(), 30), 'YYYY-MM-DD'),
                        endDate: format(subDays(new Date(), 1), 'YYYY-MM-DD'),
                    };
                }

                // 组件带参， 数据回显
                if (this.id) {
                    // 当展示 journey-picker时， 用组件自己的回显逻辑
                    if (!this.multi && this.sourceId) {
                        this.journeyId = this.id;
                        return ;
                    }
                    this.getJourney(true);
                } else {
                    // 组件正常初始化
                    this.getJourney();
                }
            });
        },
        computed: {
            sendData() {
                return {
                    selectType: this.sourceId,
                    id: this.multi ? this.journeyIds : this.journeyId,
                    dateRange: this.dateRange,
                };
            },
        },
        watch: {
            // 清空
            clear(value) {
                if (value) {
                    this.initialData();
                }
            },
        },
        methods: {
            selectType() {
                if (!this.sourceId) {
                    this.dateRange = {
                        startDate: format(subDays(new Date(), 30), 'YYYY-MM-DD'),
                        endDate: format(subDays(new Date(), 1), 'YYYY-MM-DD'),
                    };
                } else {
                    this.dateRange = {startDate: '', endDate: ''};
                }
                this.journeyId = null;
                this.journeyIds = [];
                localStorage.setItem('LOCAL_TIME_ZONE_SHOW', '');
                localStorage.setItem('LOCAL_TIME_ZONE_DATE', '');
                // if (this.multi) {
                //     this.journeyList = [];
                //     this.journeyTotalPage = 0;
                //     this.journeyPageNo = 1;
                //     this.getJourney();
                // }
                this.journeyList = [];
                this.journeyTotalPage = 0;
                this.journeyPageNo = 1;
                this.getJourney();
                this.$emit('select', this.sendData);
            },
            changeDate(date) {
                let dateLength = eachDay(date.start, date.end).length;
                if (dateLength > 30 && this.useItems !== 'export-compare' && !this.partCuts.includes('LAST_90_DAYS')) {
                    this.dateRange = {startDate: '', endDate: ''};
                    return this.$toast(this.$t('data.noMoreThan30Days'), 'warn');
                }
                if (dateLength > 90 && this.useItems !== 'export-compare' && this.partCuts.includes('LAST_90_DAYS')) {
                    this.dateRange = {startDate: '', endDate: ''};
                    return this.$toast(this.$t('data.noMoreThan90Days'), 'warn');
                }
                if (dateLength > 180 && this.useItems === 'export-compare') {
                    this.dateRange = {startDate: '', endDate: ''};
                    return this.$toast(this.$t('data.noMoreThan180Days'), 'warn');
                }
                this.dateRange.startDate = date.start;
                this.dateRange.endDate = date.end;
                this.journeyId = null;
                this.journeyList = [];
                this.journeyTotalPage = 0;
                this.journeyPageNo = 1;
                this.journeyIds = [];
                this.$emit('select', this.sendData);
                this.getJourney();
            },
            // 获取旅程
            getJourney(check) {
                // 包含实时旅程的旅程列表
                if (!this.needRealTime) {
                    // 当从其他页面跳转至导出页时， 传参templateId以id 为准， 由于查找数据问题，id值不能直接赋值到对应字段
                    // 从其他页跳转至到处， id为number类型；
                    let id = typeof this.id === 'number' ? this.id : null;
                    let selectedIds = this.journeyId ? [this.journeyId] : this.journeyIds.length ? this.journeyIds :
                        id ? id : null;
                    JourneyApiV2
                        .getJourneys(null, this.dateRange.endDate, selectedIds,
                            this.journeyPageNo, this.journeyKeyWord, this.dateRange.startDate, this.taskType)
                        .then(res => {
                            let list = res.body.data.journeyTemplateList;
                            if (this.journeyIds.indexOf(-1) > -1 && this.useItems === 'export-compare') {
                                list.forEach(journey => {
                                    journey.disabled = true;
                                });
                            }
                            this.journeyList = this.journeyList.concat(list);
                            let idx = this.journeyList.findIndex(journey => journey.id === -1);
                            // 从其他页跳转至此处
                            if (id) {
                                this.journeyList.forEach(item => {
                                    if (item.id === id) {
                                        this.$emit('currentJourneyType', item.journeyType);
                                    }
                                });
                            }
                            // 非导出模块需要添加 ‘一键全选’选项
                            if (this.useItems !== 'export' && this.useItems !== 'export-compare' && this.journeyList.length && idx < 0) {
                                this.journeyList.unshift({id: -1, name: this.$t('data.allJourneys')});
                            }
                            if (this.useItems === 'export-compare' && !this.sourceId && this.journeyList.length && idx < 0) {
                                this.journeyList.unshift({id: -1, name: this.$t('data.allJourneys')});
                            }
                            this.journeyTotalPage = res.body.data.totalPage;
                            // 轮询获取选中旅程
                            if (check) {
                                // 避免返回数据出错，这里journeyId逻辑仍轮询
                                let id = this.journeyId ? this.journeyId : this.id ? this.id : '';
                                if (id || id === 0) {
                                    // 其他页面跳转至导出， 无论旅程多选、单选， 旅程id 都为number
                                    if (typeof id !== 'number') {
                                        let allId = this.journeyList.map(list => list.id);
                                        let differ = difference(allId, id);
                                        // 当前列表中包含全部id的内容
                                        if (allId.length - differ.length === id.length) {
                                            this.journeyIds = id;
                                        } if (this.journeyTotalPage > this.journeyPageNo) {
                                            this.journeyPageNo += 1;
                                            this.getJourney(true);
                                        }
                                    } else {
                                        let target = this.journeyList.findIndex(journey => journey.id === id);
                                        // 其他页面跳转至导出， 无论旅程多选、单选， 旅程id 都为number, 多选旅程id为数据类型
                                        if (this.multi) this.journeyIds = [id];
                                        if (target > -1) {
                                            this.journeyId = id;
                                        } else if (this.journeyTotalPage > this.journeyPageNo) {
                                            this.journeyPageNo += 1;
                                            this.getJourney(true);
                                        }
                                    }
                                }
                            }
                        });
                } else {
                    this.getJourneyRealTime(check);
                }
            },
            getJourneyRealTime(check) {
                // 当从其他页面跳转至导出页时， 传参templateId以id 为准， 由于查找数据问题，id值不能直接赋值到对应字段
                // 从其他页跳转至到处， id为number类型；
                let id = typeof this.id === 'number' ? this.id : null;
                let selectedIds = this.journeyId ? [this.journeyId] : this.journeyIds.length ? this.journeyIds :
                    id ? id : null;
                JourneyApiV3
                    .getJourneysRealTime(null, this.dateRange.endDate, selectedIds,
                        this.journeyPageNo, this.journeyKeyWord, this.dateRange.startDate, this.taskType)
                    .then(res => {
                        let list = res.body.data.journeyTemplateList;
                        if (this.journeyIds.indexOf(-1) > -1 && this.useItems === 'export-compare') {
                            list.forEach(journey => {
                                journey.disabled = true;
                            });
                        }
                        this.journeyList = this.journeyList.concat(list);
                        let idx = this.journeyList.findIndex(journey => journey.id === -1);
                        // 从其他页跳转至此处
                        if (id) {
                            this.journeyList.forEach(item => {
                                if (item.id === id) {
                                    this.$emit('currentJourneyType', item.journeyType);
                                }
                            });
                        }
                        // 非导出模块需要添加 ‘一键全选’选项
                        if (this.useItems !== 'export' && this.useItems !== 'export-compare' && this.journeyList.length && idx < 0) {
                            this.journeyList.unshift({id: -1, name: this.$t('data.allJourneys')});
                        }
                        if (this.useItems === 'export-compare' && !this.sourceId && this.journeyList.length && idx < 0) {
                            this.journeyList.unshift({id: -1, name: this.$t('data.allJourneys')});
                        }
                        this.journeyTotalPage = res.body.data.totalPage;
                        // 轮询获取选中旅程
                        if (check) {
                            // 避免返回数据出错，这里journeyId逻辑仍轮询
                            let id = this.journeyId ? this.journeyId : this.id ? this.id : '';
                            if (id || id === 0) {
                                // 其他页面跳转至导出， 无论旅程多选、单选， 旅程id 都为number
                                if (typeof id !== 'number') {
                                    let allId = this.journeyList.map(list => list.id);
                                    let differ = difference(allId, id);
                                    if (allId.length - differ.length === id.length) {
                                        this.journeyIds = id;
                                    } else if (this.journeyTotalPage > this.journeyPageNo) {
                                        this.journeyPageNo += 1;
                                        this.getJourney(true);
                                    }
                                } else {
                                    let target = this.journeyList.findIndex(journey => journey.id === id);
                                    if (target > -1) {
                                        // 其他页面跳转至导出， 无论旅程多选、单选， 旅程id 都为number， 多选旅程id为数据类型
                                        if (this.multi) this.journeyIds = [id];
                                        this.journeyId = id;
                                    } else if (this.journeyTotalPage > this.journeyPageNo) {
                                        this.journeyPageNo += 1;
                                        this.getJourney(true);
                                    }
                                }
                            }
                        }
                    });
            },
            searchJourney(keyWord) {
                this.journeyKeyWord = keyWord;
                this.journeyPageNo = 1;
                this.journeyList = [];
                // 实时旅程选中不会返回在列表第一条
                if (!this.needRealTime) {
                    this.getJourney();
                } else {
                    this.getJourney(true);
                }
            },
            // 加载旅程
            loadMore() {
                if (this.journeyTotalPage > this.journeyPageNo && this.journeyList.length > 0) {
                    let target = this.$refs.select.$vnode.elm.childNodes[2];
                    let targetItem = this.multi ? target.childNodes[2] : target.childNodes[4];
                    if (targetItem.clientHeight + targetItem.scrollTop + 1 > targetItem.scrollHeight) {
                        this.journeyPageNo += 1;
                        this.getJourney();
                    }
                }
            },
            // 指定任务-选择旅程
            selectId(id, timeZone) {
                this.journeyId = id;
                this.$emit('select', this.sendData, timeZone);
            },
            // 指定时间段-选择旅程（旅程分页）
            selectJourney(journey) {
                this.journeyId = journey.id;
                // 重新拉取旅程列表，选中的旅程默认在旅程列表里第一页第一个(不需要轮询寻找来回显)
                this.journeyKeyWord = '';
                this.journeyPageNo = 1;
                this.journeyList = [];
                // 避免返回数据出错，这里逻辑仍轮询
                this.getJourney(true);
                this.$emit('select', this.sendData);
                this.$emit('currentJourneyType', journey.journeyType);
            },
            // 搜索未选择时，回显原有内容
            hideJourneyList() {
                if (this.journeyKeyWord) {
                    this.journeyKeyWord = '';
                    this.journeyPageNo = 1;
                    this.journeyList = [];
                    this.getJourney(true);
                }
            },
            // 待定（勿删）
            initialData() {
                this.dateRange = {
                    startDate: format(subDays(new Date(), 30), 'YYYY-MM-DD'),
                    endDate: format(subDays(new Date(), 1), 'YYYY-MM-DD'),
                };
                this.journeyId = null;
                this.sourceId = 0;
                this.journeyList = [];
                this.journeyTotalPage = 0;
                this.journeyPageNo = 1;
                this.journeyKeyWord = '';
                this.journeyIds = [];
                this.getJourney();
            },
            changeJourney(ids) {
                if (ids.indexOf(-1) > -1 && this.useItems === 'export-compare') {
                    this.journeyIds = [-1];
                    this.journeyList.forEach(journey => {
                        if (journey.id !== -1) journey.disabled = true;
                    });
                }
                if (ids.indexOf(-1) === -1 && this.useItems === 'export-compare') {
                    this.journeyList.forEach(journey => {
                        if (journey.id !== -1) journey.disabled = false;
                    });
                }
                this.$emit('select', this.sendData);
            },
            //获取子组件传参 当前选中的分组
            getCurGroup(curId) {
                // this.curGroupId = curId;
                this.$emit('groupIdQuery', curId);
            },
            //获取子组件传参 当前选中旅程类型
            sendJourneyType(journeyType) {
                this.$emit('currentJourneyType', journeyType);
            },
        }
    };
</script>

<style lang="scss">
    .journey-task-select {
        display: flex;

        .selector, .date-range {
            margin-right: 3px;
        }

        .multi-select {
            min-width: 220px;

            .select-text {
                .title {
                    width: auto;
                    font-size: 12px;
                }
            }
        }
    }

</style>
