<template>
    <div class="task-compare-selector">
        <selector class="lg" :options="dataSourceList" v-model="dataSource" @select="selectType"></selector>
        <date-range format="YYYY-MM-DD" :start="dateRange.startDate" :end="dateRange.endDate"
                    @change="changeDate" v-if="!dataSource" :partCuts="partCuts"/>
        <multi-journey-task-selector v-model="selectJourneyTasks" :typeDate="!dataSource"
                                     :dateRange="dateRange" :taskType="taskType"
                                     @input="input" ref="multiTask"/>
    </div>
</template>

<script>
    import {eachDay, format, subDays} from 'date-fns';
    import multiJourneyTaskSelector from './multi-journey-task-selector.vue';
    export default {
        name: 'task-compare-selector',
        components: {
            multiJourneyTaskSelector
        },
        props: {
            taskType: {
                type: [Number,String],
                default: ''
            }
        },
        data() {
            return {
                // 旅程选择类别
                dataSourceList: [
                    {name: this.$t('data.byJourneyFirstTime'),id: 0},
                    {name: this.$t('data.byJourney'),id: 1}
                ],
                dataSource: 0,
                dateRange: {
                    startDate: this.$route.query.sendDate || format(subDays(new Date(),30),'YYYY-MM-DD'),
                    endDate: this.$route.query.endDate || format(subDays(new Date(),1),'YYYY-MM-DD'),
                    changeTimes: 0
                },
                partCuts: ['YESTERDAY', 'TODAY', 'LAST_WEEK', 'THIS_WEEK', 'LAST_7_DAYS', 'LAST_30_DAYS', 'LAST_HALF_YEAR'],
                selectJourneyTasks: ''
            };
        },
        created() {
            let NumSourceId = Number(this.$route.query.dataSourceId);
            this.dataSource = NumSourceId > 0 ? NumSourceId : 0;
        },
        methods: {
            changeDate(date) {
                let dateLength = eachDay(date.start, date.end).length;
                if (dateLength > 180){
                    this.dateRange = {startDate: '', endDate: ''};
                    return this.$toast(this.$t('data.noMoreThan180Days'),'warn');
                }
                this.dateRange.startDate = date.start;
                this.dateRange.endDate = date.end;
                this.dateRange.changeTimes += 1;
            },
            input() {
                let postData = {
                    sourceType: '',
                    ...this.selectJourneyTasks,
                    dateRange:this.dateRange
                };
                postData.sourceType = this.dataSource;
                this.$emit('input',postData);
            },
            selectType(opt) {
                this.dataSource = opt.id;
                this.$refs.multiTask.changeTypeDate(!this.dataSource);
            }
        }
    };
</script>

<style lang="scss">
    @import "../../../../common/scss/base/variables";
    @import "../../../../common/scss/base/mixin";

    .task-compare-selector {
        display: inline-flex;
        .date-range {
            margin-left: 5px;
        }
        .multi-journey-task-selector {
            margin-left: 5px;
        }
    }
</style>
