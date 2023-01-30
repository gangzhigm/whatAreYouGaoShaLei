<template>
    <modal :title="$t('journey.othersSet')" @close="$emit('close')">
        <div class="form-field flex">
            <label class="label">{{'newJourney.language' | t}}</label>
            <span v-if="isChecking">
                {{languageId ?  languageList.$getByKey(languageId).name : ''}}
            </span>
            <selector v-else class="xl" :options="languageList" v-model="languageId"
                      :placeholder="$t('newJourney.selectLng')"></selector>
            <i class="icon icon-yiwen1" v-title:left.line="$t('newJourney.languageTip')"></i>
        </div>
        <!--定时旅程可用-->
        <div class="form-field flex" v-if="journeyType !== 2">
            <label class="label">{{'newJourney.timeFormat' | t}}</label>
            <div class="field-group">
                <div class="fixed-width-radio-box">
                    <radio v-model="timeType" :source="0" :disabled="isChecking">{{'newJourney.dateTime' | t}}</radio>
                </div>
                <span class="light-content-text">{{'newJourney.example' | t}} 2017/01/08 15:30</span>
                <br>
                <div class="fixed-width-radio-box">
                    <radio v-model="timeType" :source="1" :disabled="isChecking">{{'newJourney.relativeTime' | t}}</radio>
                </div>
                <template v-if="timeType === 1">
                    <span v-if="isChecking">{{relativeDate}}</span>
                    <calendar v-else
                              v-model="relativeDate"
                              :start="start"
                              :placeholder="$t('newJourney.startDate')"/>
                </template>
                <span class="light-content-text">{{'newJourney.firstDay' | t}} 15:30</span>
                <br>
                {{'newJourney.timeFormatChangeNotice' | t}}
            </div>
        </div>
        <div class="form-field flex" v-if="journeyType !== 2">
            <restrictions ref='restrictions' v-if="isHw" :showLog='true'></restrictions>
        </div>
        
        <template v-if="!isChecking" v-slot:buttons>
            <button class="btn btn-md btn-theme" @click.stop="switchDateFormatType()">
                {{'common.confirm' | t}}
            </button>
        </template>
        <template v-else v-slot:buttons>
            <button class="btn btn-md btn-white" @click.stop="$emit('close')">
                {{'common.close' | t}}
            </button>
        </template>
    </modal>
</template>
<script type="text/ecmascript-6">
    import format from 'date-fns/format';
    import {DRAGGABLE_JOURNEY_STORE_NAME} from '@/store/vuex/modules/canvasStore';
    import {UPDATE_JOURNEY} from '@/store/vuex/mutationTypes';
    import {REFRESH_TASKS, SAVE_JOURNEY} from '@/store/vuex/actionTypes';
    import restrictions from '../../restrictions.vue';
    import { mapMutations, mapState, mapActions } from 'vuex';

    export default {
        components:{
            restrictions
        },
        data() {
            return {
                timeType: 0,    // 0 绝对时间; 1 相对时间
                relativeDate: '',   // 相对时间起始时间
                start: format(new Date(), 'YYYY-MM-DD'),
                // 语言列表
                languageList: [
                    {id: 0, name: this.$t('newJourney.all')},
                    {id: 1, name: this.$t('newJourney.chinese')},
                    {id: 2, name: this.$t('newJourney.others')}
                ],
                languageId: 0,
                journeyType: ''
            };
        },
        watch: {
            timeType(type) {
                if (type === 0) {
                    this.relativeDate = '';
                }
            }
        },
        created() {
            const journey = this.journeyInformation;
            this.timeType = journey.timeType;
            this.languageId = journey.language || 0;
            this.journeyType = journey.journeyType;
            if (journey.relativeDate) {
                this.relativeDate = journey.relativeDate.split(' ')[0];
            }
        },
        methods: {
            ...mapMutations([
                UPDATE_JOURNEY
            ]),
            ...mapActions([
                SAVE_JOURNEY,
                REFRESH_TASKS
            ]),
            async switchDateFormatType() {

                switch (this.journeyType) {
                    case 2: // 实时旅程
                        this.UPDATE_JOURNEY({
                            language: this.languageId
                        });
                        break;
                    default: // 其他旅程
                        if (this.timeType === 1 && !this.relativeDate) {
                            this.$toast(this.$t('controller.relativeTimeNeeded'), 'warn');
                            return false;
                        }
                        this.UPDATE_JOURNEY({
                            timeType: this.timeType,
                            relativeDate: this.relativeDate ? (this.relativeDate + ' 00:00') : this.relativeDate,
                            language: this.languageId,
                            qualification:this.$refs.restrictions ? this.$refs.restrictions.$data.qualification : null,
                            hwContactNull:this.$refs.restrictions ? this.$refs.restrictions.$data.hwContactNull : null
                        });
                        break;
                }
                await this.SAVE_JOURNEY();
                await this.REFRESH_TASKS();
                this.$emit('close');
            }
        },
        computed: {
            ...mapState({
                user: state => state.user,
                storeName: state => state[DRAGGABLE_JOURNEY_STORE_NAME]
            }),
            // 华为类型账号
            isHw() {
                return this.user.companyType === 1;
            },
            journeyInformation() {
                return this.storeName.journeyInformation;
            },
            isChecking() {
                return this.storeName.isChecking;
            }
        }
    };
</script>
<style lang="scss">
    @import "../../../common/scss/base/variables";

    .fixed-width-radio-box {
        display: inline-block;
        width: $input-field-height * 3;
    }
    .icon-yiwen1 {
        margin-left: 5px;
        font-size: 15px;
    }
    .field-group {
        .calendar {
            margin-top: 0;
        }
    }
</style>
