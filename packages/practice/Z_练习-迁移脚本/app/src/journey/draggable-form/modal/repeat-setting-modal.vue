<template>
    <modal :title="$t('journey.repeatConfigTitle')" @close="$emit('close')">
        <div class="repeat-modal-wrapper">
            <div class="form-field">
                <span class="label">{{'journey.repeatType' | t}}</span>
                <span v-if="isChecking">{{repeatType ? repeatTypes.$getByKey(repeatType).name : ''}}</span>
                <selector v-else :options="repeatTypes" v-model="repeatType" @select="changeRepeatType"></selector>
            </div>
            <div class="form-field flex" v-show="repeatType !== 'noRepeat'">
                <label class="label" for="frequency">{{'journey.repeatFrequency' | t}}</label>
                <div class="field-group">
                    {{'journey.every' | t}}
                    <span v-if="isChecking">{{repeatNumber}}</span>
                    <number-input v-else class="input tiny" :min="1" v-model="repeatNumber" maxlength="3" id="frequency"/>
                    {{frequencyUnit}}
                </div>
            </div>
            <div class="form-field flex" v-show="repeatType !== 'noRepeat'">
                <label class="label">{{'journey.repeatEndDate' | t}}</label>
                <span v-if="isChecking">
                    {{endType ? endTypes.$getByKey(endType).name : ''}}
                    <span v-if="endType === 'times' || endType === 'days'">{{repeatEndNumber}}</span>
                    <span v-if="endType === 'times'">{{'journey.times' | t}}</span>
                    <span v-if="endType === 'days'">
                        {{'common.day' | t}}{{repeatEndDate}}
                    </span>
                </span>
                <div v-else class="field-group">
                    <selector class="md" :options="endTypes" v-model="endType" @select="selectEndType"></selector>
                    <number-input v-if="endType === 'times' || endType === 'days'" class="input tiny" :min="1"
                                  v-model="repeatEndNumber" maxlength="3"/>
                    <span v-if="endType === 'times'">{{'journey.times' | t}}</span>
                    <span v-if="endType === 'days'">{{'common.day' | t}}</span>
                    <calendar class="calendar" v-if="endType === 'date'" v-model="repeatEndDate" :start="start"
                              format="yyyy-mm-dd hh:ii"></calendar>
                    {{'newJourney.info' | t}}
                    <!-- <checkbox v-model="targetRepeatParticipate"></checkbox><span class="check-text">目标受众可以重复参与旅程</span> -->
                </div>
            </div>
        </div>
        <template v-if="!isChecking" v-slot:buttons>
            <button class="btn btn-md btn-theme" @click="save">{{'common.confirm' | t}}</button>
        </template>
        <template v-else v-slot:buttons>
            <button class="btn btn-md btn-white" @click="$emit('close')">{{'common.close' | t}}</button>
        </template>
    </modal>
</template>

<script type="text/ecmascript-6">
    import format from 'date-fns/format';
    import {UPDATE_JOURNEY} from '@/store/vuex/mutationTypes';
    import {DRAGGABLE_JOURNEY_STORE_NAME} from '@/store/vuex/modules/canvasStore';
    import {translate} from '@/locales';
    import {SAVE_JOURNEY} from '@/store/vuex/actionTypes';
    import { mapActions, mapMutations, mapState } from 'vuex';

    // 重复类型
    const REPEAT_FREQUENCY_OPTIONS = [
        {id: 'day', name: translate('common.day')},       // 天
        {id: 'week', name: translate('common.week')},      // 周
        {id: 'month', name: translate('common.month')},     // 月
        {id: 'noRepeat', name: translate('journey.noRepeat')}  // 不重复
    ];

    // 重复结束类型
    const REPEAT_END_OPTIONS = [
        {id: 'times', name: translate('common.noOfTimes')},     // 按次数
        {id: 'days', name: translate('common.noOfDays')},      // 按天数
        {id: 'date', name: translate('common.absoluteDate')}   // 按日期
    ];

    /**
     * 根据重复间隔天数计算重复类型和计数
     * frequency 为 60 时，60/30 = 2，则结果为：按月重复，每2个月重复一次
     * @param {Number} frequency
     * @return {*}
     */
    export function getRepeatCountAndType(frequency) {
        if (frequency === 0) {
            return {count: 0, type: REPEAT_FREQUENCY_OPTIONS[3]};
        } else if (frequency % 30 === 0) {
            return {count: frequency / 30, type: REPEAT_FREQUENCY_OPTIONS[2]};
        } else if (frequency % 7 === 0) {
            return {count: frequency / 7, type: REPEAT_FREQUENCY_OPTIONS[1]};
        }
        return {count: frequency, type: REPEAT_FREQUENCY_OPTIONS[0]};
    }

    export default {
        data() {
            return {
                repeatTypes: REPEAT_FREQUENCY_OPTIONS,
                repeatType: 'noRepeat',

                repeatNumber: 0,    // 重复间隔计数(重复频率)

                endTypes: REPEAT_END_OPTIONS,
                endType: 'times',   // 重复结束类型
                repeatCount: '',     // 重复按次数结束时，设定的重复次数
                relativeTime: '',    // 重复按天数结束时，设定的天数
                repeatEndDate: '',  // 重复按日期结束时，设定的结束日期

                start: format(new Date(), 'YYYY-MM-DD')
            };
        },
        created() {
            let {count, type} = getRepeatCountAndType(parseInt(this.journey.repeatFrequency || 0));
            this.repeatNumber = count || '';
            this.repeatType = type.id;
            this.repeatCount = parseInt(this.journey.repeatCount) || '';
            this.relativeTime = parseInt(this.journey.relativeTime) || '';
            this.repeatEndDate = this.journey.repeatEndDate;
            if (this.repeatCount) {
                this.endType = 'times';
            } else if (this.relativeTime) {
                this.endType = 'days';
            } else {
                this.endType = 'date';
            }
        },
        methods: {
            ...mapMutations([
                UPDATE_JOURNEY
            ]),
            ...mapActions([SAVE_JOURNEY]),
            changeRepeatType({id}) {
                if (id === 'noRepeat') {
                    this.repeatNumber = '';
                    this.repeatCount = '';     // 重复按次数结束时，设定的重复次数
                    this.relativeTime = '';    // 重复按天数结束时，设定的天数
                    this.repeatEndDate = '';  // 重复按日期结束时，设定的结束日期
                }
            },
            selectEndType() {
                this.repeatCount = '';     // 重复按次数结束时，设定的重复次数
                this.relativeTime = '';    // 重复按天数结束时，设定的天数
                this.repeatEndDate = '';  // 重复按日期结束时，设定的结束日期
            },
            save() {
                if (this.repeatType !== 'noRepeat') {
                    // 校验：重复间隔计数(重复频率)
                    if (!this.repeatNumber || isNaN(parseInt(this.repeatNumber))) {
                        this.$toast(this.$t('newJourney.repeatRate'), 'warn');
                        return false;
                    } else if (parseInt(this.repeatNumber) <= 0 || this.repeatNumber === '0') {
                        this.$toast(this.$t('newJourney.repeatRateA'), 'warn');
                        return false;
                    }
                    // 校验：重复结束设置
                    if (this.endType === 'date') {
                        if (!this.repeatEndDate) {
                            this.$toast(this.$t('newJourney.endLimit'), 'warn');
                            return false;
                        }
                    } else {
                        if (!this.repeatEndNumber || parseInt(this.repeatEndNumber) <= 0) {
                            this.$toast(this.$t('newJourney.endLimitA'), 'warn');
                            return false;
                        }
                    }
                }
                let frequency = this.repeatNumber;
                if (this.repeatType === 'month') {
                    frequency *= 30;
                } else if (this.repeatType === 'week') {
                    frequency *= 7;
                }
                this.UPDATE_JOURNEY({
                    repeatFrequency: frequency,         // 重复间隔天数，0代表不重复
                    repeatCount: this.repeatCount,      // 重复按次数结束时，设定的重复次数
                    relativeTime: this.relativeTime,    // 重复按天数结束时，设定的天数
                    repeatEndDate: this.repeatEndDate,  // 重复按日期结束时，设定的结束日期
                });
                this.SAVE_JOURNEY();
                this.$emit('close');
            },
        },
        computed: {
            ...mapState({
                storeName: state => state[DRAGGABLE_JOURNEY_STORE_NAME]
            }),
            frequencyUnit() {
                if (this.repeatType === 'day') return this.$t('common.day');
                if (this.repeatType === 'week') return this.$t('common.week');
                if (this.repeatType === 'month') return this.$t('common.month');
            },
            // 结束次数或天数
            repeatEndNumber: {
                get() {
                    if (this.endType === 'times') return this.repeatCount;
                    return this.relativeTime;
                },
                set(num) {
                    if (this.endType === 'times') {
                        this.repeatCount = num;
                    } else {
                        this.relativeTime = num;
                    }
                }
            },
            journey() {
                return this.storeName.journeyInformation;
            },
            isChecking() {
                return this.storeName.isChecking;
            }
        }
    };
</script>
<style lang="scss">
    .repeat-modal-wrapper {
        .field-group {
            .calendar {
                margin: 0;
                vertical-align: middle;
            }
        }
    }
</style>
