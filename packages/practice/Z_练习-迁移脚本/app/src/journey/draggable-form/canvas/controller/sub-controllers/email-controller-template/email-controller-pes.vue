<template>
    <modal class="email-modal" :title="$t('controller.persBlock')" size="lg" @close="cancel()">
        <p v-if="controller.id === validationResult.errorId" class="error-message">
            {{validationResult.errorMessage}}
        </p>
        <div class="email-controller-mesg">
            <div class="form-field flex">
                <div class="label left">
                    <div class="leftB">{{$t('controller.blockSequence')}}</div>
                    <div v-for="(item,index) in sortstudents" :key="item.id" class="leftA">
                        <div class="leftD">
                            <span @click="top(index)" v-if="index !== 0" class="leftE icon icon-shangyi"></span>
                            <span @click="down(index)" class="leftF icon icon-xiayi"></span>
                        </div>
                        <div :title="item.name" class="leftG">{{item.nameNum}}</div>
                        <div @click="del(index)" class="leftH icon icon-shanchu"></div>
                    </div>
                </div>
                <div class="field-group">
                    <div class="email-content">
                        <div class="leftC">{{$t('controller.mailView')}}</div>
                        <div v-html="html" ref="htmlCont" class="leftI"></div>
                        <!-- <material-store :value="task.materialId" @input="pickMaterial" type="email" ref="materialStore"/> -->
                    </div>
                </div>
            </div>
            <!-- 保存 -->
            <div class="footer">
                <div @click="modifyBatchTask()" class="saveMail">确定</div>
            </div>
        </div>
    </modal>
</template>

<script type="text/ecmascript-6">
    import {DRAGGABLE_JOURNEY_STORE_NAME} from '@/store/vuex/modules/canvasStore';
    import { NikeMaterialV1, NikeJourneyV3 } from '@/api';
    import {filterHTML} from '../../data';
    import { mapState } from 'vuex';

    export default {
        props: {
            controller: Object,
            panelShow: {
                type: Boolean
            }
        },
        data() {
            return {
                milestone: 0,
                task: {},
                material: {},
                lengthNum: Number,
                blockNames: [],
                arr: [],
                arry: [],
                taskDetailsDTOS: []
            };
        },
        methods: {
            cancel() {
                this.$emit('close');
            },
            // 获取批次任务详情信息
            getBatchTask(id) {
                this.blockNames = [];
                NikeJourneyV3
                    .getBatchTask(this.stateID, this.activeControllerId, false)
                    .then(({body: {data: {task}}}) => {
                        this.taskDetailsDTOS = task.taskDetailsDTOS;
                        this.lengthNum = this.taskDetailsDTOS.length;
                        for (let i = 0; i < this.taskDetailsDTOS.length; i++) {
                            if (id === this.taskDetailsDTOS[i].id) {
                                this.task = this.taskDetailsDTOS[i];
                                for (let j = 0; j < this.task.blockNames.length; j++) {
                                    let obj = {};
                                    obj.seq = j + 1;
                                    if (this.task.blockNames[j].length > 5) {
                                        obj.nameNum = this.task.blockNames[j].substring(0, 8) + '...';
                                    } else {
                                        obj.nameNum = this.task.blockNames[j];
                                    }
                                    obj.name = this.task.blockNames[j];
                                    this.blockNames.push(obj);
                                }
                            }
                        }
                        this.$nextTick(() => {
                            this.getList();
                        });
                    });
            },
            // 排序
            getList() {
                this.arry = [];
                let tab = this.$refs.htmlCont.getElementsByTagName('input');
                for (let k = 0; k < tab.length; k++) {
                    let obc = {};
                    obc.seb = k;
                    obc.tap = tab[k].parentElement;
                    this.arry.push(obc);
                }
            },
            down(index) {
                if (index < this.blockNames.length) {
                    this.blockNames[index].seq = this.blockNames[index].seq + 1;
                    this.blockNames[index + 1].seq = this.blockNames[index + 1].seq - 1;

                    this.arry[index].seb = this.arry[index].seb + 1;
                    this.arry[index + 1].seb = this.arry[index + 1].seb - 1;
                }
                this.htmlInner();
            },
            top(index) {
                if (index > 0) {
                    this.blockNames[index].seq = this.blockNames[index].seq - 1;
                    this.blockNames[index - 1].seq = this.blockNames[index - 1].seq + 1;

                    this.arry[index].seb = this.arry[index].seb - 1;
                    this.arry[index - 1].seb = this.arry[index - 1].seb + 1;
                }
                this.htmlInner();
            },
            // 页面拼接
            htmlInner() {
                this.sortByKey(this.arry, 'seb');
                let a = '';
                for (let k = 0; k < this.arry.length; k++) {
                    a = a + this.arry[k].tap.outerHTML;
                }
                this.task.materialCopy.htmlContent = `${this.task.materialCopy.htmlContent.substring(0, this.task.materialCopy.htmlContent.indexOf('<td>') + '<td>'.length)}${a}${this.task.materialCopy.htmlContent.substring(this.task.materialCopy.htmlContent.lastIndexOf('</td>'),)}`;
            },
            sortByKey(array, key) {
                return array.sort(function (a, b) {
                    let x = a[key];
                    let y = b[key];
                    return ((x < y) ? -1 : ((x > y) ? 1 : 0));
                });
            },
            del(index) {
                this.blockNames.splice(index, 1);
                this.arry.splice(index, 1);
                this.htmlInner();
            },
            //修改批次任务
            modifyBatchTask() {
                let htmled = filterHTML(JSON.stringify(this.task.materialCopy.htmlContent));
                let htmleg = htmled.substring(1, htmled.length - 1);
                NikeMaterialV1
                    .materialCopy(this.task.materialCopy.id,
                        htmleg,
                        this.task.materialCopy.materialName)
                    .then(() => {
                        this.taskDetailsDTOS = [];
                        this.$emit('close');
                    });
            },
        },
        computed: {
            ...mapState({
                validationResult: state => state[DRAGGABLE_JOURNEY_STORE_NAME].validationResult,
                stateID: state => state.canvasStore.journeyInformation.id,
                activeControllerId: state => state.canvasStore.activeControllerId
            }),
            sortstudents() {
                return this.sortByKey(this.blockNames, 'seq');
            },
            html() {
                if (this.task.materialCopy) {
                    return filterHTML(this.task.materialCopy.htmlContent);
                }
            }
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

        .btn-icon-group {
            display: none;
        }

        .left {
            width: 130px;
            height: 400px;
            margin: 0;
            border: 1px solid #e0e5ea;
            border-right: none;
            overflow: auto;
        }
    }

    .task-material-store.preview {
        padding-right: 0px;
    }

    .leftA {
        text-align: center;
        overflow: hidden;
    }

    .leftB, .leftC {
        text-align: left;
        padding-left: 5px;
        box-sizing: border-box;
        margin-bottom: 5px;
    }

    .leftD {
        width: 35px;
        margin: 9px 0 0 0;
        float: left;
        overflow: hidden;
    }

    .leftE, .leftF {
        display: block;
        float: left;
        width: 14px;
        height: 14px;
        border-radius: 50%;
        margin-left: 3px;
        text-align: center;
        line-height: 14px;
    }

    .leftA:last-child .leftF {
        display: none;
    }

    .leftG {
        width: 60px;
        margin-left: 10px;
        float: left;
        text-align: left;
    }

    .leftH {
        float: left;
        width: 14px;
        height: 14px;
        border-radius: 50%;
        margin: 9px 0 0 3px;
        text-align: center;
        line-height: 14px;
    }

    .leftI {
        width: 590px;
        margin: 0 auto;
    }

    .email-modal {
        padding: 24px 13px 55px;
    }

    .footer {
        width: 100%;
        display: flex;
        justify-content: flex-end;
    }

    .saveMail {
        width: 160px;
        height: 36px;
        border-radius: 3px;
        line-height: 36px;
        text-align: center;
        color: #fff;
        background-color: #27caa9;
        float: right;
        margin-top: 10px;
        cursor: pointer;
    }
</style>
