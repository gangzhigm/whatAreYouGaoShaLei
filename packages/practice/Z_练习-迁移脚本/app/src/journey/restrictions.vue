<template>
    <div :class="restrictionsClass">
        <div class="restrictionsLeft">
            <p>{{ 'common.restrictions' | t }}</p>
            <i class="action-icon icon icon-help" v-title:right="$t('common.restrictionsCloseTitle')"></i>
        </div>
        <div class="restrictionsRight">
            <!-- 可编辑 -->
            <div class="switch" v-if="!isReadonly">
                <switch-button v-model="isON" @input="onOrOFff"
                    :has="$has('journey_manage_lift_restrictions') && journeyType != 2 && journey.journeyType != 2">
                    {{ isON ? $t('common.openRestrictions') : $t('common.closeRestrictions') }}
                </switch-button>
                <i v-if="showLog" class="action-icon icon icon-rizhi" v-title:right="$t('common.restrictionsRecord')"
                    @click="modalOpen"></i>
            </div>
            <checkbox class="keep-all" v-if="isON && !isReadonly" v-model="isChecked" :source="true"
                :disabled="$has('journey_manage_configure_null')">{{ 'common.checkboxRestrictions' | t }}</checkbox>
            <!-- 可编辑 end-->
            <!-- 不可编辑 -->
            <div class="switch" :class="startController?'switch-start':''" v-if="isReadonly">
                <p class="keep-all" v-if="journey.qualification === 0">{{ 'common.offRestrictions' | t }}</p>
                <p class="keep-all"
                    v-if="journey.qualification === 1 && journey.hwContactNull === 0">
                    {{ 'common.onAndUnChecked' | t }}
                </p>
                <p class="keep-all" v-if="journey.qualification === 1 && journey.hwContactNull === 1">
                    {{ 'common.onAndChecked' | t }}</p>
                <i class="action-icon icon icon-rizhi" v-title:right="$t('common.restrictionsRecord')"
                    @click="modalOpen"></i>
            </div>
            <!-- 不可编辑end -->
        </div>
        <restrictionsRocord v-if="modalShow" ref="restrictionsRocord"></restrictionsRocord>
    </div>
</template>

<script>
import restrictionsRocord from './restrictionsRecord.vue';
import { DRAGGABLE_JOURNEY_STORE_NAME } from '@/store/vuex/modules/canvasStore';
import { I18N_STORE_NAME } from '@/locales';
import { mapState } from 'vuex';

export default {
    components: { restrictionsRocord },
    props: {
        restrictionsWidth: {
            type: Number
        },
        //新建旅程的类型
        journeyType: {
            type: Number
        },
        //限制类型
        restrictionsType: {
            type: String
        },
        //是否显示日志
        showLog: {
            type: Boolean
        },
        //是否只读
        isReadonly: {
            type: Boolean
        },
        marginLeft0: {
            type: Boolean
        },
        //判断是否是开始设置的预览控件进入的
        startController: {
            type: Boolean,
            default: false
        }
    },
    data () {
        return {
            isON: true,//是否开启限制条件
            isChecked: false,//是否选中复选框
            qualification: 1,//是否开启
            hwContactNull: 0,//是否勾选
            modalShow: false//记录弹窗是否开启
        };
    },
    computed: {
        ...mapState({
            // 旅程
            journey: state => state[DRAGGABLE_JOURNEY_STORE_NAME].journeyInformation,
            language: state => state[I18N_STORE_NAME].lang
        }),
        restrictionsClass () {
            if (this.marginLeft0) {
                return 'restrictions marginLeft0';
            } else if (this.language === 'en') {
                return 'restrictions restrictionsEN';
            }
            return 'restrictions';
        }
    },
    watch: {
        isON (val) {
            this.qualification = val ? 1 : 0;
        },
        isChecked (val) {
            this.hwContactNull = val ? 1 : 0;
        }
    },
    created () {
        /**
          * journeyType 2:实时触发 0：单次活动 1：周期活动
          */
        // 是否是新建旅程
        if (this.restrictionsType === 'newJourey') {
            if (this.journeyType === 2) {
                //实时旅程
                this.isON = false;
            } else {
                //其他旅程
                this.isON = this.$has('journey_manage_lift_restrictions');
            }

        } else {
            //非新建旅程 如果类型是实时旅程，限制条件默认则为false
            if (this.journey.journeyType) {
                this.isON = this.journey.journeyType === 2 ? false : true;
            }
            this.$nextTick(() => {
                this.isON = this.journey.qualification === 1 ? true : false;
                this.isChecked = this.journey.hwContactNull === 1 ? true : false;
            });
        }
    },
    methods: {
        //如果限制条件关闭的话，下面复选框要取消勾选
        onOrOFff () {
            if (!this.isON) {
                this.isChecked = false;
            }
        },
        //打开限制条件的操作记录
        modalOpen () {
            this.modalShow = true;
            this.$nextTick(() => {
                this.$refs.restrictionsRocord.getList();
            });
        }
    }
};
</script>

<style lang="scss" scoped>
.restrictions {
    width: 100%;
    display: flex;
    margin-left: 50px;
}

.marginLeft0 {
    margin-left: 0;
}

.restrictionsLeft {
    display: flex;
    justify-content: flex-end;
    p {
        line-height: 24px;
    }
    i {
        line-height: 24px;
        margin: 0 0 0 10px;
    }
}

.restrictionsEN {
    margin-left: 0px;
    .restrictionsLeft {
        width: 114px;
    }
}

.restrictionsRight {
    display: flex;
    flex-direction: column;
    margin-left: 10px;
}

.switch {
    display: flex;
    margin-bottom: 10px;
    line-height: 24px;
    i {
        line-height: 24px;
        margin: 0 0 0 5px;
    }
}

.switch-start {
    p {
        max-width: 430px;
    }
}

.keep-all {
    word-break: keep-all;
}

.list-show {
    width: 100%;
    overflow: hidden;
    background: #fff;
}

.simplify-table {
    td {
        width: 150px;
    }
}

.table-head {
    overflow: hidden;
    tr {
        &:nth-child(1) {
            border-bottom: 0;
        }
    }
}

.table-body {
    overflow: auto;
    height: 500px;
}
</style>
