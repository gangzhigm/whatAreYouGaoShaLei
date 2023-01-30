<template>
    <div class="data-sharing-form">
        <div class="content-view padding margin white-bg">
            <div class="create-title">
                {{($route.params.id && $route.params.id != 0) ? $t('sharing.editRule') : $t('sharing.addRule')}}
                <button type="button"
                        class="save-btn btn btn-md btn-theme"
                        @click="saveRule">
                    {{'common.save' | t}}
                </button>
            </div>
            <div class="create-content">
                <!-- 规则名称 -->
                <div class="field-group-label">{{'sharing.rulesName' | t}}</div>
                <div class="form-field">
                    <input class="input md"
                           type="text"
                           maxlength="100"
                           :class="{error: rulesNameErrorText}"
                           @click="rulesNameErrorText = ''"
                           v-title:top.warn.line="rulesNameErrorText"
                           v-model.trim="rulesName"
                           :placeholder="$t('sharing.enterRulesName')">
                    <switch-button v-model="openStatus" :has="$has('enterprise_share_activate_rule')"></switch-button>
                </div>
                <!-- 共享数据 -->
                <div class="field-group-label">{{'sharing.sharedData' | t}}</div>
                <div class="form-field" v-if="!loading">
                    <!-- <condition-bunch ref="conditionGroup" @valid="handleCondition" :bunchData="conditions">
                    </condition-bunch> -->
                    <swarm-condition-group ref="conditionGroup" @valid="handleCondition" :swarmJson="conditions">
                        </swarm-condition-group>
                </div>
                <!-- 共享给 -->
                <!--安全组-->
                <div class="field-group-label">{{'EnterPrise.configureSecurityGroup' | t}}</div>
                <div class="form-field flex">
                    <shuttle-box v-bind="shuttleInfo" v-model="roleIds"/>
                </div>
            </div>
        </div>
    </div>
</template>
<script type="text/babel">
    import { PermitAllApi } from '@/api';
    import cascadingSelector from '../../customer/swarm/cascading-selector.vue';
    import {COMMON_NAME_REGEXP} from '../../common/utils/regs';
    import swarmConditionGroup from '../../customer/swarm/condition-group.vue';
    import isEqual from 'lodash/isEqual';
    // import conditionBunch from '../../common/components/condition-bunch/conditionBunch.vue'; //新数据结构组件，暂时冻结，待更新
    const beforeLeave = new Map();
    const leaveAfter = new Map();
    export default {
        components: {
            cascadingSelector, swarmConditionGroup
        },
        data() {
            return {
                rulesName: '', //规则名
                openStatus: true, //开启状态
                rulesNameErrorText: '', //规则名报错提示
                conditions: [], //条件簇数据
                allList: [],//所有安全组
                roleIds: '',//已选择的安全组
                synced: false,//保存状态，用于路由钩子判断是否返回
                loading: true
            };
        },
        beforeRouteLeave(to, from, next) {
            
            leaveAfter.set('rulesName', this.rulesName)
                .set('openStatus', this.openStatus)
                .set('roleIds',this.roleIds);
            let ruleName = ( beforeLeave.get('rulesName') === undefined ? '' : beforeLeave.get('rulesName')) === leaveAfter.get('rulesName');
            let openStatu = (beforeLeave.get('openStatus') === undefined ? true : beforeLeave.get('openStatus')) === leaveAfter.get('openStatus');
            let beforeArr = beforeLeave.get('conditions') === undefined ? [] : beforeLeave.get('conditions')[0].rules;
            let afterArr = this.$refs.conditionGroup.obj[0].rules;
            let condition = this.equalArray(beforeArr, afterArr);
            let roleId = this.judgeResultFun(beforeLeave.get('roleIds') === undefined ? [''] : beforeLeave.get('roleIds').split(','), leaveAfter.get('roleIds').split(','));
            if (!this.synced) {
                if (ruleName && openStatu && roleId && condition) {
                    next();
                } else {
                    this.$confirm(this.$t('sharing.leaveConfirm'), this.$t('sharing.leaveReminder'))
                        .then(sure => {
                            next(sure);
                        });
                }
            } else {
                next();   
            }
            
        },
        computed: {
            shuttleInfo() {
                return {
                    titles: [this.$t('EnterPrise.allSecurityGroup'), this.$t('EnterPrise.selectSecurityGroup')],
                    dataList: this.allList,
                    selectedVal: this.roleIds,
                    fromPage: 'setting',
                    search: true,
                };
            },
            ruleId() {
                return this.$route.params.id;
            }
        },
        mounted() {
            /*eslint-disable-next-line*/
            if (this.$route.params.id != 0) {
                this.getRule();
                this.getRole();
            } else {
                this.getRoleList();
                this.loading = false;
            }
        },
        methods: {
            /**
             * @description: 对比两个不确定深度的数组对象是否相同
             * @param {*} oldData
             * @param {*} newData
             * @return {boolean}
             */             
            equalArray(oldData, newData) {
                const oldArr = [];
                const newArr = [];
                const oldValue = [];
                const newValue = [];
                if (oldData.length === newData.length) {
                    oldData.forEach((item, index, array) => {
                        for (let property in item) {                       
                            oldArr.push(property + index);
                            oldValue.push(item[property]);                           
                        }
                    });
                    newData.forEach((ite, inde, arr) => {
                        delete ite.searchResultList;
                        for (let propertys in ite) {
                            newValue.push(ite[propertys]);
                            newArr.push(propertys + inde);
                        }
                    });
                    if (isEqual(oldArr, newArr)) {
                        if (isEqual(oldValue, newValue)) {
                            return true;
                        }
                        return false;
                    }
                    return false;
                }
                return false;
            },
            /**
             * @description: 对比顺序不同的两个数组元素是否相同
             * @param {array} arr1
             * @param {array} arr2
             * @return {boolean}
             */ 
            judgeResultFun(arr1, arr2) {
                let flag = true;
                if (arr1 === arr2) {
                    flag = true;
                } else {
                    if (arr1.length !== arr2.length) {
                        flag = false;
                    } else {
                        arr1.forEach(item => {
                            if (arr2.indexOf(item) === -1) {
                                flag = false;
                            }
                        });
                    }
                }
                return flag;
            },
            // 获取所有安全组
            getRoleList() {
                this.$loading();
                PermitAllApi
                    .getAllRole()
                    .then(res => {
                        this.allList = res.body.data.allRoleList;
                        this.handleAllList();
                        this.$loaded();
                    })
                    .catch(() => {
                        this.$loaded();
                    });
            },
            //获取已选安全组
            getRole() {
                this.$loading();
                PermitAllApi
                    .getRole(this.$route.params.id)
                    .then(res => {
                        if (res.body.data.roleList) {
                            let roleList = res.body.data.roleList;
                            this.roleIds = roleList.map(item => {
                                return item.id;
                            })
                                .join(',');
                            this.getRoleList();
                        } else {
                            this.roleIds = '';
                            this.getRoleList();
                        }
                        this.$loaded();
                        beforeLeave.set('roleIds', this.roleIds);
                    })
                    .catch(() => {
                        this.$loaded();
                    });
            },
            //编辑时获取单条规则详情
            getRule() {
                this.$loading();
                PermitAllApi
                    .getRules(this.$route.params.id)
                    .then(res => {
                        let data = res.body.data;
                        if (data.id) {
                            this.rulesName = data.name;
                            this.openStatus = data.openStatus;
                            this.conditions = JSON.parse(data.conditionJson);
                            this.loading = false;
                        }
                        beforeLeave.set('rulesName', this.rulesName)
                            .set('openStatus', this.openStatus)
                            .set('conditions',this.conditions);
                        this.$loaded();
                    })
                    .catch(() => {
                        this.$loaded();
                        this.loading = false;
                    });
            },
            //处理安全组，全部和已选数据
            handleAllList() {
                let ary = this.roleIds.split(',')
                    .map(item => Number(item));
                for (let i = 0; i < this.allList.length; i++) {
                    let item = this.allList[i];
                    this.$set(item, 'sel', false);
                    for (let x = 0; x < ary.length; x++) {
                        if (ary[x] === item.id) {
                            item.sel = true;
                        }
                    }
                }
            },
            // 校验
            valid() {
                this.rulesNameErrorText = '';
                if (this.rulesName === '') {
                    this.rulesNameErrorText = this.$t('sharing.nameNoEmpty');
                    return false;
                } else if (!COMMON_NAME_REGEXP.test(this.rulesName)) {
                    this.rulesNameErrorText = this.$t('sharing.ruleNameReg');
                    return false;
                } else if (this.roleIds === '') {
                    this.$toast(this.$t('sharing.groupNoEmpty'), 'warn');
                    return false;
                }
                return true;
            },
            saveRule() {
                this.$refs.conditionGroup.valid();
            },
            // 条件组件校验通过后调用的方法
            handleCondition (str) {
                this.conditions = JSON.parse(str);
                leaveAfter.set('conditions',this.conditions);
                if (this.valid()) {
                    this.$nextTick(() => {
                        this.$loading();
                        PermitAllApi
                            .saveRules({
                                conditionJson: str,
                                id: this.ruleId,
                                name: this.rulesName,
                                openStatus: this.openStatus,
                                roleIds: this.roleIds
                            })
                            .then(() => {
                                this.$loaded();
                                /*eslint-disable-next-line*/
                                if (this.$route.params.id == 0) {
                                    this.$toast(this.$t('common.saveSuccess'), 'success');
                                } else {
                                    this.$toast(this.$t('common.updateSuccess'), 'success');
                                }
                                this.synced = true;
                                this.$router.replace({
                                    name: 'dataSharing',
                                    params: {tab: 1},
                                    query: {
                                        tabbar: 1,
                                        curPage: this.$route.query.curPage,
                                        keyWords: this.$route.query.keyWords
                                    }
                                });
                            })
                            .catch(() => {
                                this.$loaded();
                            });
                    });
                }
            },
        },
    };
</script>
<style lang="scss" type="text/scss" rel="stylesheet/scss">
    @import '../../common/scss/base/variables';
    @import '../../common/scss/base/mixin';

    .data-sharing-form {
        .content-view {
            min-width: calc(1000px + 6%);
        }

        .create-title {
            font-size: 16px;
            height: 48px;
            line-height: 48px;
            padding: 0 20px;
            border: 1px solid #e4e9ed;
            position: relative;

            .save-btn {
                position: absolute;
                right: 20px;
                top: 9px;
            }
        }

        .create-content {
            width: 980px;
            margin: auto;
            padding-top: 50px;
            @include box-sizing();
        }

        .save {
            margin: 32px 0;
            text-align: center;
        }

        .field-group-label {
            font-size: 14px;
            font-weight: bold;
            // padding-left: 65px;
            margin-top: 2em;
            margin-bottom: 1em;
        }

        .shuttle-content {
            overflow: hidden;
            display: flex;
            flex-direction: row;
            width: 466px;
            padding: 8px;
            border: solid 1px $select-border;
            @include border-radius(4px);
            background-color: #fff;

            .attribute-list {
                @include ellipsis();
                display: flex;
                flex-direction: column;
                flex: 3;

                .head {
                    line-height: 32px;
                    text-align: center;
                    background-color: $light-green;
                    color: #fff;
                    border-top-left-radius: 4px;
                    border-top-right-radius: 4px;
                }

                .select-list {
                    border-bottom-left-radius: 4px;
                    border-bottom-right-radius: 4px;
                    border-left: 1px solid $border-color;
                    border-right: 1px solid $border-color;
                    border-bottom: 1px solid $border-color;
                    max-height: $input-field-height * 8;
                    overflow: auto;

                    .option {
                        line-height: $input-field-height;
                        padding: 0 8px;

                        &:last-child {
                            margin-bottom: 0;
                        }

                        &:not(.disabled):hover {
                            background-color: $hover-bg;
                        }

                        &.disabled {
                            color: $disabled;
                            cursor: not-allowed;
                        }

                        .checkbox {
                            display: block;
                            @include ellipsis();
                        }
                    }
                }
            }

            .btn-content {
                display: flex;
                flex: 1;
                flex-direction: column;
                justify-content: space-evenly;
                align-items: center;

                .btn {
                    margin: 0;
                }
            }
        }

        .input {
            margin-right: 10px;
        }
        .swarm-condition-group {
            width: 1000px;
        }
    }
</style>
