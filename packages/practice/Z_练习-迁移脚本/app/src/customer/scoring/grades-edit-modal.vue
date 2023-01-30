<template>
    <!--    等级管理弹窗-->
    <div class="grades-edit-modal">
        <modal :title="$t('scoring.gradesTable')" @close="cancelGrades">
            <div class="score-modal-content">
                <p class="notice">{{'scoring.addMax' | t}}</p>
                <p class="notice">{{'scoring.minMaxScore' | t}}</p>
                <div class="grades-header">
                    <p class="title">{{'scoring.scoringLeve' | t}}</p>
                    <p class="title">{{'scoring.scoreRange' | t}}</p>
                </div>
                <ul class="grades-score-range">
                    <li class="range-wrapper" v-for="(grade,index) in grades">
                        <div>
                            <input type="text" maxlength="20" class="input" v-model.trim="grade.gradeName">
                            <p class="error-color" v-if="!grade.verify&&grade.gradeName===''">{{ $t('scoring.dataRequired') }}</p>
                        </div>
                        <div class="num-range">
                            <input type="number" class="input score-input" v-model.trim="grade.min"
                                   @focus="initialNumber(index)"
                                   @blur="numberRange(grade, index, 'min')">
                            <span> ～ </span>
                            <input type="number" class="input score-input" v-model.trim="grade.max"
                                   @focus="initialNumber(index)"
                                   @blur="numberRange(grade,index, 'max')">
                        </div>
                        <div class="grades-opt">
                            <svg aria-hidden="true" class="cursor-pointer" @click="addGrades(grade,index)">
                                <use xlink:href="#icon-add"></use>
                            </svg>
                            <svg aria-hidden="true" class="cursor-pointer" v-if="(index!=0)&&(index!=grades.length-1)"
                                 @click="delGrade(grade,index)">
                                <use xlink:href="#icon-shanchu"></use>
                            </svg>
                        </div>
                    </li>
                </ul>
            </div>
            <template v-slot:buttons>
                <button slot="buttons" class="btn btn-md btn-theme-border" @click="cancelGrades">{{'common.cancel' | t}}</button>
                <button slot="buttons" class="btn btn-md btn-theme" @click="confirmGrades">{{'common.confirm' | t}}</button>
            </template>
        </modal>
    </div>

</template>

<script>
import cloneDeep from 'lodash/cloneDeep';
import {ScoringV1} from '@/api';

export default {
    name: 'grades-edit-modal',
    data() {
        return {
            originalGrades: [],//初始等级列表
            grades: [],//深拷贝原始等级列表
            initialGrade: {}, //分数input获取焦点时深拷贝当前等级
            // gradeNameErr: '此项未必填',
        };
    },
    props: {
        modelId: {
            type: Number
        },
    },
    mounted() {
        this.getGrades();
    },
    methods: {
        //获取等级
        getGrades() {
            ScoringV1
                .getGrades(this.modelId)
                .then((res) => {
                    this.originalGrades = res.body.data.grades;
                    this.grades = cloneDeep(this.originalGrades);
                    this.grades.forEach(item => {
                        this.$set(item, 'verify', true);
                    });
                })
                .catch((err) => {
                    if (err.body.errorCode === 'MODEL_DOES_NOT_EXIST') {
                        this.$toast(err.body.message, 'warn');
                        this.$router.push({name: 'scorerating'});
                    }
                });
        },
        cancelGrades() {
            this.$emit('closeGrades');
        },
        //确定等级更改
        confirmGrades() {
            let verify = this.grades.every(item => item.gradeName !== '');
            if (verify) {
                this.grades.forEach(item => {
                    delete item.verify;
                });
                ScoringV1
                    .editGrades(this.modelId, this.grades)
                    .then(() => {
                        this.$emit('closeGrades');
                    })
                    .catch((err) => {
                        if (err.body.errorCode === 'MODEL_DOES_NOT_EXIST') {
                            this.$toast(err.body.message, 'warn');
                            this.$router.push({name: 'scorerating'});
                        }
                    });
            } else {
                this.grades.forEach(item => {
                    if (item.gradeName === '') item.verify = false;
                });
            }

        },
        //input 获取焦点时获取初始min/max
        initialNumber(index) {
            this.initialGrade = cloneDeep(this.grades[index]);
        },
        //第1个等级的最低分可设置为-9999，最后1个等级的最高分可设置为9999；
        //编辑起始分min/结束分max
        numberRange(grade, index, type) {
            if (index === 0 && type === 'min') {//修改第一个等级的min
                grade.min = Number(grade.min);
                if (grade.min < -9999) grade.min = -9999;
                if (grade.min > grade.max) grade.min = this.initialGrade.min;
            } else if (index === this.grades.length - 1 && type === 'max') {//修改最后一个等级的max
                grade.max = Number(grade.max);
                if (grade.max > 9999) grade.max = 9999;
                if (grade.max <= this.grades[index - 1].min) grade.max = this.initialGrade.max;
            } else { //修改中间等级
                let prevGrade = this.grades[index - 1];
                let nextGrade = this.grades[index + 1];
                if (type === 'min') {
                    if (grade.min === '') {
                        grade.min = '';
                    } else {
                        grade.min = Number(grade.min);
                    }
                    //一个等级的[最低分]允许范围：上一个等级[最低分+1]（第1个等级忽略下限分）至 当前等级[最高分]；
                    if (grade.min !== '' && grade.min <= this.grades[index].max && grade.min > prevGrade.min) {
                        grade.min = Number(grade.min);
                        this.grades[index - 1].max = grade.min - 1;
                    } else {
                        this.grades[index] = this.initialGrade;
                    }
                } else {
                    if (grade.max === '') {
                        grade.max = '';
                    } else {
                        grade.max = Number(grade.max);
                    }
                    //一个等级的[最高分]允许范围：当前等级[最低分] 至 下一个等级[最高分-1]（最后1个等级忽略上限分）
                    if (grade.max !== '' && grade.max >= this.grades[index].min && grade.max < nextGrade.max) {
                        grade.max = Number(grade.max);
                        this.grades[index + 1].min = grade.max + 1;
                    } else {
                        this.grades[index] = this.initialGrade;
                    }
                }
            }
        },
        //添加一个等级
        addGrades(grade, index) {
            if (this.grades.length >= 20) {
                this.$toast(this.$t('scoring.addMax'), 'warn');
                return;
            }
            if (grade.min === grade.max) {
                this.$toast(this.$t('scoring.gradeRangThanOne'), 'warn');
                return;
            }
            this.grades[index].max = this.grades[index].max - 1;
            let newGrade = {gradeName: '', min: grade.max + 1, max: grade.max + 1, verify: true};
            this.grades.splice(index + 1, 0, newGrade);
        },
        //删除一个等级
        delGrade(grade, index) {
            this.grades.splice(index, 1);//删除选中的等级
            this.grades[index - 1].max = this.grades[index].min - 1;
        },
    }
};
</script>

<style lang="scss" type="text/scss" rel="stylesheet/scss">
@import '../../common/scss/base/_variables';
@import '../../common/scss/base/_mixin';

.grades-edit-modal {
    .score-modal-content {
        .notice {
            line-height: 24px;
            font-size: 14px;
        }

        .grades-header {
            background-color: $content-bg;
            display: flex;
            margin: 10px 0;
            padding: 5px;

            .title {
                line-height: 24px;
                width: 228px;
                font-size: 14px;
                color: #000;
            }
        }

        .grades-score-range {
            max-height: 400px;
            overflow-y: scroll;

            .range-wrapper {
                margin-bottom: 20px;
                display: flex;

                .error-color {
                    color: $light-red;
                }

                .num-range {
                    margin: 0 10px 0 80px;

                    .score-input {
                        width: 35px;
                    }
                }

                .grades-opt {
                    svg {
                        width: 16px;
                        height: 16px;
                        fill: $theme;
                        margin: 7px 7px 0 0;
                    }
                }
            }
        }
    }
}

</style>
