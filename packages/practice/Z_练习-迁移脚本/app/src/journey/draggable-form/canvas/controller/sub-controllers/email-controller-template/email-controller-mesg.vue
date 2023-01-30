<template>
    <modal :title="$t('controller.preview')" size="lg" @close="cancel()">
        <p v-if="controller.id === validationResult.errorId" class="error-message">
            {{validationResult.errorMessage}}
        </p>
        <div class="email-controller-mesg">
            <div class="form-field flex">
                <div class="label left">
                    <div v-for="item in task" :key="item.id" @click="actived(item.id,item.materialCopy.htmlContent)" :class="[act === item.id ? 'acted' :'']"  :title="item.taskName" class="leftA">{{item.taskNameNum}}</div>
                </div>
                <div class="field-group">
                    <div class="email-content">
                        <div class="email-content-box" v-html="materialCopysId"></div>
                    </div>
                </div>
            </div>
        </div>
    </modal>
</template>

<script type="text/ecmascript-6">
    import {DRAGGABLE_JOURNEY_STORE_NAME} from '@/store/vuex/modules/canvasStore';
    import { NikeJourneyV3 } from '@/api';
    import { mapState } from 'vuex';

    export default {
        props: {
            controller: Object,
            panelShow: {
                type: Boolean
            },
        },
        data() {
            return {
                milestone: 0,
                task: {},
                material: {},
                act: '',
                materialCopysId: ''
            };
        },
        mounted() {
            this.getBatchTask();
        },
        methods: {
            cancel() {
                this.$emit('close');
            },
            // 获取批次任务详情信息
            getBatchTask(){
                let stateID = this.stateID;
                let activeControllerId = this.activeControllerId;
                NikeJourneyV3
                    .getBatchTask(stateID,activeControllerId,false)
                    .then( res => {
                        const data = res.body.data;
                        if (data && data.task){
                            let taskDetailsDTOS = data.task.taskDetailsDTOS;
                            this.task = taskDetailsDTOS;
                            for (let a = 0;a < this.task.length; a++) {
                                if (this.task[a].taskName.length > 5){
                                    this.task[a].taskNameNum = this.task[a].taskName.substring(0,5) + '...';
                                } else {
                                    this.task[a].taskNameNum = this.task[a].taskName;
                                }
                            }
                            this.act = taskDetailsDTOS[0].id;
                            this.materialCopysId = taskDetailsDTOS[0].materialCopy.htmlContent;
                        }
                    });
            },
            actived(id,htmlContent){
                this.act = id;
                this.materialCopysId = htmlContent;
            },  
            
        },
        computed: {
            ...mapState({
                validationResult: state => state[DRAGGABLE_JOURNEY_STORE_NAME].validationResult,
                stateID: state => state.canvasStore.journeyInformation.id,
                activeControllerId: state => state.canvasStore.activeControllerId
            }),
        },
    };
</script>

<style lang="scss">
    @import "../../../../../../common/scss/base/variables";

    .email-controller-mesg {
        .mail-subject-ad-prefix {
            display: inline-block;
            padding: 0 8px;
            color: $light-green;
            background-color: $content-bg;
            border-radius: 4px;
        }

        .email-content {
            position: relative;
            height: 400px;
            border: 1px solid $border-color;
            overflow: auto;
        }
        .btn-icon-group{
            display: none;
        }
        .left{
            height: 400px;
            margin: 0;
            border: 1px solid #e0e5ea;
            border-right: none;
        }
    }
    .task-material-store.preview{
        padding-right: 0px;
    }
    .leftA{
        text-align: center;
        cursor: pointer;
    }
    .acted{
        background-color: #e4e4e4;
        border-top: 1px solid rgba(210, 218, 224, 1);
        border-bottom: 1px solid rgba(210, 218, 224, 1)；
    }
    .email-content-box{
        width: 590px;
        margin: 0 auto;
    }
</style>
