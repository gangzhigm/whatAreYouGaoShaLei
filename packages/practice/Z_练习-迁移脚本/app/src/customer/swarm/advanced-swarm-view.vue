<template>
    <div class="advanced-swarm-view content-container">
        <div v-if="!swarmID" class="content-view">
            <crumbs :crumbs="crumbs"/>
        </div>
        <!-- 新建/编辑高级分群 头部 -->
        <div v-if="!swarmID" class="page-head">
            <div class="content-view">
                <div class="form-field pull-left">
                    <label class="label">{{'swarm.groupName' | t}}</label>
                    <input class="input name-input lg" type="text" v-model="advancedJson.name" readonly>
                </div>
                <div class="form-field pull-left">
                    <label class="label placeholder" for="pId">{{'swarm.selectGroup'|t}}</label>
                    <input class="input group-input lg" type="text" v-model="treeParams.parentGroupName" readonly>
                </div>
                <button class="pull-right btn btn-md btn-white" @click="advancedCancel">
                    {{'common.back' | t}}
                </button>
                <svg class="pull-right advanced-icon" aria-hidden="true" v-title:left="$t('swarm.advancedIcon')">
                    <use xlink:href="#icon-help"></use>
                </svg>
            </div>
        </div>
        <div class="page-content">
            <!-- 左侧子分群列表 -->
            <div class="left-side">
                <!-- 列表头部 -->
                <div class="swarm-item pull-left" v-if="!listLoading">
                    <div class="item-left">
                        <span v-if="authInfo.id === advancedJson.createBy">{{ advancedJson.status === 2 ? advancedJson.total : '/' }}</span>
                        <span v-if="authInfo.id !== advancedJson.createBy">/</span>
                        <span>{{'swarm.currentNumber' | t}}</span>
                    </div>
                    <template>
                        <div class="item-calculationTime"
                             v-if="authInfo.id === advancedJson.createBy && advancedJson.updateDate && advancedJson.status === 2">
                            ({{'swarm.lastCalculationTime' | t}}{{advancedJson.updateDate}})
                        </div>
                        <div class="item-calculationTime" v-else>({{'swarm.lastCalculationTime' | t}} /)</div>
                    </template>
                </div>
                <!-- 子分群列表 -->
                <div class="swarm-item item-list pull-left"
                     v-if="!listLoading"
                     :class="{active: swarm.id === item.id}"
                     v-for="(item,index) in advancedJson.contactSwarmDtoList"
                     :key="item.id">
                    <div class="item-left" @click="selectSwarm(item)">
                        <span class="item-name">{{item.name}}</span>
                        <span v-if="item.operation === 0" class="item-include">{{'swarm.include' | t}}</span>
                        <span v-if="item.operation === 1" class="item-exclude">{{'swarm.exclude' | t}}</span>
                        <div class="item-num pull-right">
                            <span v-if="!item.calculating && item.total >= 0">{{item.total}}</span>
                            <span v-if="!item.calculating && item.total !== 0 && !item.total">{{'swarm.unCalculate' | t}}</span>
                            <svg class="pull-right" aria-hidden="true" v-title="$t('swarm.swarmNumUpdate')">
                                <use xlink:href="#icon-help"></use>
                            </svg>
                            <i v-if="item.calculating" class="icon icon-loading pull-right"></i>
                        </div>
                    </div>
                </div>
                <!--无子分群-->
                <span class="no-data" v-if="swarmNum === 0">{{'common.noData' | t}}</span>
                <!--子分群列表加载-->
                <inline-loading class="list-loading" v-if="listLoading"/>
            </div>
            <!--子分群条件簇及条件-->
            <div class="right-side" v-if="swarm.id">
                <!--条件展示-->
                <condition-bunch v-if="bunchSwitch"
                                 ref="conditionBunch"
                                 :writable="false"
                                 :bunchData="swarm.swarmJson">
                </condition-bunch>
            </div>
            <!--无子分群，条件编辑为空-->
            <div class="right-side" v-if="swarmNum === 0">
                <span class="no-data">{{'common.noData' | t}}</span>
            </div>
        </div>
    </div>
</template>
<script type="text/ecmascript-6">
import { ContactApiV1 } from '@/api';
import {translate as t} from '@/locales';
import conditionBunch from '../../common/components/condition-bunch/conditionBunch.vue';

export default {
    name: 'advancedSwarmView',
    components: {conditionBunch},
    props: {
        swarmID: {
            type: Number,
            default: ''
        }
    },
    data () {
        return {
            treeParams: {               // 树组件参数
                parentGroupName: '',
                groupSelectShow: false,
                treeActiveGid: '',
                searchSelectTree: {}
            },
            listLoading: false,         //子分群列表加载
            groupList: [],              //分组列表
            advancedId: '',             //高级分群ID
            advancedJson: {},           //高级分群信息
            swarm: {                    //当前子分群
                name: '',               //子分群名称
                swarmJson: [],          //子分群条件
                id: '',                 //子分群ID
                calculating: false,     //子分群是否计算中状态
            },
            bunchSwitch: false,         //子分群切换加载
        };
    },
    mounted () {
        this.advancedId = this.$route.query.id || this.swarmID;
        this.treeParams.treeActiveGid = parseInt(this.$route.query.groupId) || 0;
        this.swarmID || this.getSwarmGroup();
        this.getAdvancedList('init');
    },
    computed: {
        crumbs() { // 面包屑导航
            return [
                {name: 'home', text: 'Dmartech'},
                {name: 'swarm', text: t('home.customerSwarm'), query: { groupId: 0}},
                {name: 'advancedSwarmView', text: t('swarm.swarmView')}
            ];
        },
        //子分群数量
        swarmNum() {
            return this.advancedJson.contactSwarmDtoList ? this.advancedJson.contactSwarmDtoList.length : '';
        },
        //用户信息，用来判断是否分享的高级分群
        authInfo() {
            return this.$store.state.user;
        },
    },
    methods: {
        //请求用户分组列表
        getSwarmGroup() {
            const tree = [];
            ContactApiV1
                .getGroupList()
                .then(res => {
                    if (res.body.data && res.body.data.rootGroup) {
                        let data = JSON.parse(
                            JSON.stringify(res.body.data.rootGroup)
                        );
                        this.groupList.push(data);
                        this.$traverseTree(this.groupList, tree);
                        this.groupList = tree;
                        //初始化分组
                        this.$nextTick(() => {
                            this.initGroup();
                        });
                    }
                });
        },
        //初始化分组选择
        initGroup() {
            //默认选中"默认分组"
            if (
                this.treeParams.treeActiveGid !== 0 &&
                this.treeParams.treeActiveGid !== -2 &&
                this.treeParams.treeActiveGid !== -99
            ) {
                let curGroup = this.$getPartById(this.treeParams.treeActiveGid, this.groupList);
                this.treeParams.parentGroupName = curGroup.name;
                this.treeParams.searchSelectTree = curGroup;
            } else {
                let deftGroup = this.$getCurrentPart(1, this.groupList);
                this.treeParams.parentGroupName = deftGroup.name;
                this.treeParams.treeActiveGid = deftGroup.id;
            }
        },
        /**
         * 获取高级分群数据
         * @param init {String} 获取列表后需要的操作 init:初始化页面时自动选择第一个子分群
         */
        getAdvancedList(init) {
            this.listLoading = true;
            ContactApiV1
                .getAdvanced(this.advancedId)
                .then((res) => {
                    let data = res.body.data;
                    data.contactSwarmDtoList = data.contactSwarmDtoList.map(e => {
                        e.calculating = false;
                        e.unValid = false;
                        return e;
                    });
                    this.advancedJson = data;
                    this.advancedName = data.name;
                    this.listLoading = false;
                    if (init === 'init' && this.advancedJson.contactSwarmDtoList.length) {
                        this.selectSwarm(this.advancedJson.contactSwarmDtoList[0]);
                    }
                });
        },
        /**
         * 选择子分群
         * @param swarm 选择的子分群
         */
        selectSwarm(swarm) {
            if (this.swarm.id === swarm.id) {
                return;
            }
            ContactApiV1
                .swarmDetail(swarm.id)
                .then((res) => {
                    let json = res.body.data.swarmJson ? JSON.parse(res.body.data.swarmJson) : [];
                    this.bunchSwitch = false;
                    this.swarm = {
                        name: swarm.name,
                        swarmJson: json,
                        id: swarm.id,
                        operation: swarm.operation,
                        calculating: swarm.calculating
                    };
                    this.$nextTick(() => {
                        this.bunchSwitch = true;
                    });
                });
        },
        //返回
        advancedCancel() {
            this.$router.go(-1);
        }
    }
};
</script>
<style lang="scss" type="text/scss" rel="stylesheet/scss">
@import '../../common/scss/base/variables';
@import '../../common/scss/base/mixin';

.advanced-swarm-view{
    .page-head{
        height: 32px;
        padding: 10px 0;
        overflow: hidden;
        .form-field + .form-field {
            margin: 0 0 0 1em;
        }
        .form-field {
            // .label {
            //     width: 80px;
            // }
            .name-input{
                background-color: $content-bg;
                margin-right: 30px;
            }
            .name-input:hover,.name-input:focus{
                border: 1px solid $form-border;
                box-shadow: none;
                -moz-box-shadow: none;
                -webkit-box-shadow: none;
            }
            .group-input{
                background-color: $content-bg;
                text-overflow: ellipsis;
                white-space: nowrap;
                overflow: hidden;
            }
        }
        .btn{
            width: 120px;
            margin-left: 10px;
        }
        .advanced-icon{
            display: inline-block;
            width: 18px;
            height: 18px;
            margin-top: 7px;
        }
    }
    .page-content{
        border-top: 1px solid #cccccc;
        background-color: #ffffff;
        .left-side{
            float: left;
            width: 300px;
            height: 100%;
            border-right: 1px solid #cccccc;
            overflow: auto;
            .swarm-item{
                display: inline-block;
                width: 100%;
                height: 70px;
                line-height: 24px;
                padding: 5px 10px;
                box-sizing: border-box;
                border-bottom: 1px solid $border-color;
                cursor: default;
                .item-left{
                    float: left;
                    width: 100px;
                    text-align: center;
                    padding: 6px 0;
                    span{
                        float: left;
                        display: inline-block;
                        width: 100%;
                        overflow: hidden;
                    }
                }
                .item-calculationTime{
                    width: 100%;
                    float: left;
                    color: $color-light-content;
                    margin-top: -15px;
                }
                &.active{
                    background-color: $select-bg;
                }
            }
            .item-list{
                position: relative;
                .item-left{
                    width: 270px;
                    text-align: left;
                    cursor: pointer;
                    line-height: 32px;
                    padding: 0 0 0 10px;
                    .item-name{
                        width: 245px;
                        overflow: hidden;
                        white-space: nowrap;
                        text-overflow: ellipsis;
                    }
                    .item-include,.item-exclude{
                        width: auto;
                        height: 18px;
                        line-height: 18px;
                        border-radius: 9px;
                        padding: 0 5px;
                        margin-top: 5px;
                    }
                    .item-include{
                        color: $light-green;
                        border: 1px solid $light-green;
                    }
                    .item-exclude{
                        color: $light-red;
                        border: 1px solid $light-red;
                    }
                    .item-num{
                        span{
                            width: auto;
                            font-size: 14px;
                            line-height: 24px;
                            max-width: 180px;
                            overflow: hidden;
                            white-space: nowrap;
                            text-overflow: ellipsis;
                        }
                        svg{
                            display: inline-block;
                            width: 18px;
                            height: 18px;
                            margin: 3px 5px;
                        }
                        .icon-loading{
                            float: right;
                            margin-top: -3px;
                        }
                    }
                }
            }
            .list-loading{
                margin: 38vh auto 0;
            }
        }
        .right-side {
            width: calc(100% - 305px);
            height: calc(100% - 2em - 1px);
            margin-top: 2em;
            padding-left: 2em;
            overflow: auto;
            box-sizing: border-box;
            .condition-main{
                width: 100%;
                .condition-bunch{
                    width: 950px;
                }
            }
            & > button{
                width: 100px;
                margin-top: 5em;
                margin-left: 2em;
            }
        }
        .no-data{
            display: block;
            width: 100%;
            height: 100%;
            font-size: 14px;
            line-height: calc(100vh - #{$header-height + $toolbar-height + $page-head-height + $input-field-height});
            text-align: center;
        }
    }
}
</style>
