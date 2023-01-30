<template>
    <div class="new-scoring-create">
        <!-- 面包屑导航 -->
        <div class="content-view">
            <crumbs :crumbs="crumbs" />
        </div>
        <div class="page-head">
            <div class="content-view">
                <h1>{{'newScoring.createComputeModel' | t}}</h1>
            </div>
        </div>
        <div class="content-view create-model">
            <p class="create-model-title">{{'newScoring.selectComputeModel' | t}}</p>
            <div class="compute-model">
                <!-- 用户评分矩阵模型 -->
                <div class="model-box matrix-model pull-left" @click="showSelectDesign = true">
                    <p>{{'newScoring.userMatrixModel' | t}}</p>
                    <div class="matrix-box"></div>
                </div>
                <!-- 预留其他模型 -->
                <div class="model-box more-model pull-right">
                    <p>{{'newScoring.moreModel' | t}}</p>
                    <img class="modal-model-img" :src="moreModelSrc">
                </div>
            </div>
        </div>
        <!-- 选择设计模式 -->
        <modal :title="$t('newScoring.selectDesignModel')" v-if="showSelectDesign" @close="showSelectDesign = false">
            <div class="modal-model-box">
                <!-- 便捷模式 -->
                <div class="modal-model-type" @click="selectDesignModel('quick')">
                    <svg aria-hidden="true" class="icon icon-a-11111-01" v-title:top="$t('newScoring.quickModel')">
                        <use xlink:href="#icon-a-11111-01"></use>
                    </svg>
                    <p>{{'newScoring.quickModel' | t}}</p>
                </div>
                <!-- 专家模式 -->
                <div class="modal-model-type" @click="selectDesignModel('expert')">
                    <svg aria-hidden="true" class="icon icon-a-2-5-02" v-title:top="$t('newScoring.expertModel')">
                        <use xlink:href="#icon-a-2-5-02"></use>
                    </svg>
                    <p>{{'newScoring.expertModel' | t}}</p>
                </div>
            </div>
        </modal>
        <!-- 便捷模式：导入系统预置模型 -->
        <modal :title="$t('newScoring.importSysPresetModel')" v-if="createModelType === 'quick'" @close="createModelType = ''">
            <div class="modal-model-box">
                <!-- 企业用户 -->
                <div class="modal-model-type" @click="selectPresetModel('company')">
                    <svg aria-hidden="true" class="icon icon-a-2-5-03" v-title:top="$t('newScoring.companyUserModel')">
                        <use xlink:href="#icon-a-2-5-03"></use>
                    </svg>
                    <p>{{'newScoring.companyUserModel' | t}}</p>
                </div>
                <!-- 个人消费者 -->
                <div class="modal-model-type" @click="selectPresetModel('individual')">
                    <svg aria-hidden="true" class="icon icon-a-2-5-04" v-title:top="$t('newScoring.individualUserModel')">
                        <use xlink:href="#icon-a-2-5-04"></use>
                    </svg>
                    <p>{{'newScoring.individualUserModel' | t}}</p>
                </div>
            </div>
        </modal>
        <!-- 专家模式：基本配置 -->
        <modal :title="$t('newScoring.baseConfig')" v-if="createModelType === 'expert'" @close="createScoringCancel">
            <!-- 模型名称 -->
            <div class="form-field">
                <label class="label">{{'newScoring.modelName' | t}}</label>
                <input type="text" class='input' v-model.trim="form.modelName"
                    :placeholder="$t('newScoring.enterUpTo100Characters')" maxLength="100">
                <p class="error" v-if="showError" style="margin-left:130px;">{{errorMsg}}</p>
            </div>
            <!-- 评分范围 -->
            <div class="form-field">
                <label class="label">{{'newScoring.scoringRange' | t}}</label>
                <div class="contacts-radio">
                    <radio :source=1 v-model="form.isAllContacts">{{'newScoring.allContacts' | t}}</radio>
                    <radio :source=0 v-model="form.isAllContacts">
                        {{'newScoring.newContactsFront' | t}}
                        <number-input class='input' v-model="form.scoringDay" :max=365 :min=1
                            @sync="scoringDayChange" />
                        {{'newScoring.newContactsAfter' | t}}
                        <span class="icon icon-help" v-title="$t('newScoring.newContactsHover')"></span>
                    </radio>
                </div>
            </div>
            <!-- 运行机制 -->
            <div class="form-field how-to-work">
                <label class="label">{{'newScoring.howToWork' | t}}</label>
                <p>{{'newScoring.howToWorkContent' | t}}</p>
            </div>
            <template v-slot:buttons>
                <input type="button" class="btn btn-md btn-theme-border" :value="$t('common.cancel')"
                    @click="createScoringCancel">
                <input type="button" class="btn btn-md btn-theme" :value="$t('common.confirm')"
                    @click="createScorinConfirm">
            </template>
        </modal>
    </div>
</template>

<script type="text/ecmascript-6">
import { ScoringV2 } from '@/api';
import moreModelSrc from './image/more_model.png';
export default {
    data () {
        return {
            moreModelSrc: moreModelSrc,    //更多模型图片
            showSelectDesign: false,    //选择设计模式弹窗
            createModelType: '',    //选择的设计模式
            form: {
                isAllContacts: 1,// 1全部联系人，0新建联系人
                scoringDay: 30,
                modelName: ''
            },
            showError: false,   // 是否展示错误信息
            errorMsg: '',//错误提示
            isSubmit: false,//正在提交
        };
    },
    computed: {
        crumbs() {
            return [
                {name: 'index', text: 'Dmartech'},
                {name: 'scorerating', text: this.$t('newScoring.newScoring')},
                Object.assign({}, this.$route, {text: this.$t('newScoring.createComputeModel')})
            ];
        }
    },
    methods: {
        // 选择设计模式
        selectDesignModel(type) {
            this.showSelectDesign = false;
            this.createModelType = type;
        },
        //快捷模式选择预置模型
        selectPresetModel(type) {
            this.$router.push({
                name: 'newScoreRatingQuick',
                query: {
                    modeType: type
                }
            });
        },
        //关闭专家模式
        createScoringCancel () {
            this.createModelType = '';
            this.showError = false;
            this.isSubmit = false;
            this.form = {
                isAllContacts: 1,
                scoringDay: 30,
                modelName: ''
            };
        },
        //确认新建专家模型
        createScorinConfirm () {
            if (this.isSubmit) return;
            if (!this.form.modelName) {
                this.showError = true;
                this.errorMsg = this.$t('scoring.dataRequired');
                return;
            }
            const params = {
                scoringRange: this.form.isAllContacts === 1 ? 0 : this.form.scoringDay,
                modelName: this.form.modelName,
                type: 1,
                mode: 2
            };
            this.isSubmit = true;
            ScoringV2.addScoringModel(params)
                .then(({ body: { data } }) => {
                    this.isSubmit = false;
                    this.$toast(this.$t('common.createSuccess'), 'success');
                    this.$router.push({ name: 'editNewScoreRating', query: { modelId: data.modelId } });
                })
                .catch(({ body }) => {
                    this.isSubmit = false;
                    if (body.errorCode === 'MODEL_NAME_DUPLICATION') {
                        this.showError = true;
                        this.errorMsg = this.$t('scoring.modelNamesCannotBeDuplicated');
                    }
                });
        },
        scoringDayChange (val) {
            if (val === '') {
                this.form.scoringDay = 1;
            }
        },
    }
};
</script>

<style lang="scss" type="text/scss" rel="stylesheet/scss">
    @import "../../common/scss/base/_variables";
    @import "../../common/scss/base/_mixin";

    .new-scoring-create {
        .create-model {
            height: calc(100vh - #{$header-height + $toolbar-height + $page-head-height + 100px});
            margin-top: 20px;
            padding: 30px;
            background: #ffffff;
            overflow: hidden;

            p {
                font-size: 18px;
                line-height: 32px;
                text-align: center;
                margin-bottom: 15px;
            }

            .compute-model {
                display: flex;
                justify-content: center;
                margin-top: calc((100vh - #{$header-height + $toolbar-height + $page-head-height + 471px}) / 3);

                .model-box {
                    width: 281px;
                    height: 345px;
                    padding: 12px;
                    text-align: center;
                    border: 1px solid $form-border;
                    margin: 0 18px;
                    overflow: hidden;

                    .btn-white {
                        color: $theme;
                        border-color: $theme;
                        padding: 0 30px;
                    }
                }

                .matrix-model {
                    cursor: pointer;

                    .matrix-box {
                        width: 281px;
                        height: 281px;
                        background: url('./image/martix-model.png') -4px -4px no-repeat;
                        background-size: 290px;
                    }
                    
                    &:hover {
                        border: 2px solid $theme;
                        margin: -1px 17px;
                    }
                }

                .more-model {
                    img {
                        width: 281px;
                        height: 281px;
                    }
                }
            }
        }

        .modal {
            margin-top: calc((100vh - 440px) / 2);
            
            .modal-head {
                border: none;
            }

            .modal-model-box {
                display: flex;
                justify-content: center;
                font-size: 16px;
                margin-top: -25px;

                .modal-model-type {
                    width: 220px;
                    margin: 15px;
                    border: 1px solid $form-border;
                    border-radius: 5px;
                    cursor: pointer;

                    &:hover {
                        border: 2px solid $theme;
                        margin: 14px;
                    }

                    .icon {
                        display: block;
                        width: 100px;
                        margin: 50px auto 0;
                    }

                    p {
                        text-align: center;
                        margin: 50px auto;
                    }
                }
            }
            
            .form-field {
                .error {
                    color: $light-red;
                }
            }

            .how-to-work {
                p {
                    width: 440px;
                    display: inline-block;
                }
            }

            .contacts-radio {
                width: 440px;
                display: inline-block;

                .radio {
                    input {
                        width: 30px;
                        margin: 0 5px;
                    }
                }

                .radio:nth-child(1) {
                    margin-right: 300px;
                }

                .radio + .radio {
                    margin-left: 0;
                }
            }
        }
    }
</style>
