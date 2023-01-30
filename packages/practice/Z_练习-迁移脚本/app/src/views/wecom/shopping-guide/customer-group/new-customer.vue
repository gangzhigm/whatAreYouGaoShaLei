<template>
    <div class="new-channel-code">
        <div class="content-view">
            <crumbs :crumbs="crumbs" />
        </div>
        <!-- 头部标题 -->
        <div class="page-head">
            <div class="content-view" v-if="customerId === ''">
                <h1>{{ 'shoppingGuide.customerGroupAdd' | t }}</h1>
            </div>
            <div class="content-view" v-else>
                <h1>{{ 'shoppingGuide.customerGroupEdit' | t }}</h1>
            </div>
        </div>
        <div class="page-content">
            <div class="content-view white-bg padding margin form-container">
                <!-- 分组信息 -->
                <p class="basic">{{ 'shoppingGuide.groupingInformation' | t }}</p>
                <!-- 分组名称 -->
                <div class="form-field">
                    <label class="label placeholder" for="use">{{ 'shoppingGuide.groupName' | t }}</label>
                    <input
                        class="input"
                        type="text"
                        :placeholder="$t('shoppingGuide.pleaseEnter')"
                        v-model.trim="getInfo.name"
                        :disabled="~~this.$route.params.id !== 0"
                        v-title:top.line.warn="errorTitle"
                        :class="{ error: errorTitle }"
                        @focusin="errorTitle = ''"
                        maxlength="18"
                    />
                </div>
                <!-- 选择客户标签 -->
                <div class="form-field flex">
                    <label class="label">
                        {{ 'shoppingGuide.selectCustomerLabel' | t }}
                    </label>
                    <div class="field-group">
                        <selector-tree
                            :options="groupList"
                            @checkOptions="checked($event)"
                            v-model="checkedContactItem"
                            :maxlength="200"
                        />
                    </div>
                </div>
                <!-- 预计客户数量 -->
                <div class="form-field flex">
                    <label class="label">
                        {{ 'shoppingGuide.estimatedCustomers' | t }}
                    </label>
                    <div class="field-group">
                        <span type="button" :class="isdisabledFn ? 'customers' : 'estimate'" @click="stomers">{{
                            estimated
                        }}</span>
                        <span type="button" class="calculates" @click="calculate">{{
                            'shoppingGuide.calculates' | t
                        }}</span>
                    </div>
                </div>
                <!-- 保存取消按钮 -->
                <template>
                    <div class="preservation">
                        <input
                            type="button"
                            class="preservation btn btn-md btn-theme-border cance"
                            :value="$t('shoppingGuide.cancel')"
                            @click="cancel"
                        />
                    </div>
                    <div class="preservation">
                        <button class="btn btn-md btn-theme cance" :disabled="saveLoading" @click="save">
                            {{ 'shoppingGuide.preservation' | t }}
                        </button>
                    </div>
                </template>
            </div>
            <!--客户分组标签人数详情-->
            <modal :title="$t('shoppingGuide.tagNumber')" v-if="createPageShow" @close="closeCreatePage">
                <div class="roll">
                    <div class="yond" v-for="(item, index) in people" :key="index">
                        <span class="Beyond">{{ item.name }}</span>
                        <span class="persons" @click="number">{{ item.labelPerson }}</span>
                    </div>
                </div>
                <p class="typeface">{{ 'shoppingGuide.promptcopy' | t }}</p>
                <template v-slot:buttons>
                    <input
                        type="button"
                        class="btn btn-md btn-theme-border"
                        :value="$t('shoppingGuide.cancel')"
                        @click="opcancel"
                    />
                    <input
                        type="button"
                        class="btn btn-md btn-theme"
                        :value="$t('common.confirm')"
                        @click="saveCreatePage"
                    />
                </template>
            </modal>
        </div>
    </div>
</template>
<script type="text/babel">
import { WecomApiV1, ContactApiV1, GeteOriginApi } from '@/api';
import SelectorTree from '@/common/components/selector-tree.vue';
export default {
    components: {
        SelectorTree,
    },
    data () {
        return {
            isdisabledFn: false,
            estimated: '0',//客户标签的人数
            establish: '',//判断是否为编辑页面
            createPageShow: false,//创建页面是否显示
            groupSelectShow: false, // 分组显示
            groupList: [],  // 分组列表
            checkedContactItem: [], // 选择联系人标签list
            allLabelList: [], // 选择联系人标签列表
            getInfo: {
                name: '', // 客户分组名称
                contactLabelIds: [], // 联系人标签id列表
            },
            notadded: '',//未添加企业微信
            errorTitle: '', // 分组名称错误提示
            saveLoading: false, // 保存禁止点击
            calculation: [],//计算人数
            tagstions: [],//标签数组
            groupeId: '',
            people: [],//标签人数
            customerId: '',
            judgment: false,
        };
    },
    computed: {
        crumbs () {
            return [
                { name: 'wecom', text: 'Dmartech' },
                { name: 'shoppingGuide', text: this.$t('shoppingGuide.assistant') },
                { name: this.customerId !== '' ? 'customerGroupEdit' : 'customerGroupAdd', text: this.customerId !== '' ? this.$t('shoppingGuide.customerGroupEdit') : this.$t('shoppingGuide.customerGroupAdd') }
            ];
        },
    },
    watch: {
        // 获取被选中的联系人标签ID
        checkedContactItem (val) {
            this.getInfo.contactLabelIds = [];
            for (let i = 0; i < val.length; i++) {
                this.getInfo.contactLabelIds.push(val[i].id);
            }
        },
    },
    created () {
        GeteOriginApi
            .getGlobalConfByConfigName({ configName: 'journey_shoppingguide' })
            .then(({ body: { data } }) => {
                if (data.status !== 1) {
                    this.$router.push({ name: 'home', });
                }
            })
            .catch(() => {
                this.isAuthLoaded = true;
            });
    },
    mounted () {
        this.groupeIds = this.$route.query.groupId;
        this.customerId = this.$route.query.id || '';
        if (this.customerId !== '') {
            this.viewEvent(() => {
                this.getVipLabel();
            });
        } else {
            // 获取联系人标签
            this.getVipLabel();
        }
        // 点击其他地方下拉菜单收起
        window.addEventListener('click', this.eventListener);
        if (this.customerId !== '') {
            this.isdisabledFn = true;
        }
    },
    methods: {
        viewEvent (callback) {
            if (this.customerId !== '') {
                WecomApiV1.customerGroupSelect({ id: this.$route.query.id })
                    .then((res) => {
                        this.getInfo.name = res.body.data.customerGroup.name;
                        this.estimated = res.body.data.customerGroup.customerPerson;
                        this.notadded = res.body.data.customerGroup.noWechatPerson;
                        this.getInfo.contactLabelIds = res.body.data.customerGroup.labelIds.split(',');
                        callback && callback();
                    })
                    .catch(() => {
                        callback && callback();
                    });
            }

        },
        notification () {
            this.$toast(this.$t('shoppingGuide.results'), 'warn');
        },
        // 点击标签人数跳转
        number () {
            const url = this.$router.resolve({
                name: 'tagManage',
            });
            window.open(url.href, '_blank');
        },
        closeCreatePage () {
            this.createPageShow = false;
        },
        // 取消按钮
        cancel () {
            this.$router.push({
                name: 'customerGroup',
            });
        },
        // 弹窗的取消按钮
        opcancel () {
            this.closeCreatePage();
        },
        // 弹窗确认按钮
        saveCreatePage () {
            this.closeCreatePage();
        },
        // 预计客户数量
        stomers () {
            if (this.isdisabledFn && this.judgment) {
                this.notification();
                return;
            }
            if (this.isdisabledFn) {
                this.tagstions = [];
                this.checkedContactItem.forEach(item => {
                    this.tagstions.push(item.id);
                });
                WecomApiV1.numberTags({ labelIds: this.tagstions })
                    .then((res) => {
                        this.people = res.body.data.labelJson;
                        this.createPageShow = true;
                    });
            }
        },
        // 点击计算
        calculate () {
            //调用接口
            this.calculation = [];
            this.checkedContactItem.forEach(item => {
                this.calculation.push(item.id);
            });
            if (this.calculation.length === 0) {
                this.estimated = '0';
                this.isdisabledFn = false;
                return;
            }
            WecomApiV1.recalculates({ labelIds: this.calculation })
                .then((res) => {
                    this.estimated = res.body.data.customerPerson;
                    this.judgment = false;
                    this.isdisabledFn = true;
                    this.notadded = res.body.data.noWechatPerson;
                    this.$toast(this.$t('common.successOperate'), 'success');
                });
        },
        // 获取联系人标签
        getVipLabel () {
            this.$loading();
            ContactApiV1
                .getGroups({
                    sortType: this.sortType,
                    authorityType: 0
                })
                .then((res) => {
                    this.groupList = res.body.data.rootGroup.childs;
                    // 将选中的会员标签回显
                    if (this.getInfo.contactLabelIds.length > 0) {
                        this.allLabelList = [];
                        this.groupList.filter(item => {
                            if (item.labels.length > 0) {
                                this.allLabelList = this.allLabelList.concat(item.labels);
                            }
                            item.childs.filter(label => {
                                if (label.labels.length > 0) {
                                    this.allLabelList = this.allLabelList.concat(label.labels);
                                }
                                label.childs.filter(name => {
                                    if (name.labels.length > 0) {
                                        this.allLabelList = this.allLabelList.concat(name.labels);
                                    }
                                });
                            });
                        });
                        this.allLabelList.map(item => {
                            this.getInfo.contactLabelIds.map(contact => {
                                if (item.id === parseInt(contact)) {
                                    this.checkedContactItem = this.checkedContactItem.concat(item);
                                }
                            });
                        });
                    }
                    this.$loaded();
                })
                .catch(() => {
                    this.$loaded();
                });
        },
        // 选择联系人标签
        checked (val) {
            this.checkedContactItem = val;
            if (this.checkedContactItem) {
                this.judgment = true;
            }
        },
        // 下拉菜单的收起
        eventListener () {
            this.groupSelectShow = false;
        },

        // 保存前的校验
        check () {
            if (this.getInfo.name === '') {
                this.errorTitle = this.$t('shoppingGuide.customer');
                return true;
            }
            if (this.checkedContactItem.length === 0) {
                this.$toast(this.$t('shoppingGuide.customerLabel'), 'warn');
                return true;
            }
        },
        // 保存
        save () {
            if (!this.check()) {
                this.saveLoading = true;
                let permission = this.getInfo.contactLabelIds.join(',');
                let postData = {
                    id: this.customerId !== '' ? this.customerId : '',
                    name: this.getInfo.name,
                    groupId: this.groupeIds,
                    labelIds: permission,
                    customerPerson: this.estimated,
                    noWechatPerson: this.notadded,
                };
                WecomApiV1
                    .customerGroupSave(postData)
                    .then(() => {
                        this.$toast(this.$t('common.successOperate'), 'success');
                        this.$router.push({ name: 'customerGroup' });
                        this.saveLoading = false;
                    })
                    .catch(() => {
                        this.saveLoading = false;
                    });
            }
        }
    }
};
</script>
<style lang="scss" scoped>
@import '../../../../common/scss/base/variables';
@import '../../../../common/scss/base/mixin';
    .new-channel-code {
        h3 {
            margin: 30px;
        }
        // 修复宽度塌陷
        .form-container {
            min-width: 1350px;
        }
        .form-field {
            margin: 40px 0;
        }
        .form-field .label {
            width: 140px;
            text-align: left;
            font-size: 14px;
        }
        .roll {
            width: 80%;
            max-height: 100px;
            word-wrap: break-word;
            overflow-x: hidden;
            .yond {
                height: 30px;
                margin: 0 0 10px 20px;
                .Beyond {
                    display: inline-block;
                    width: 300px;
                    overflow: hidden;
                    text-overflow: ellipsis;
                    white-space: nowrap;
                }
                .persons {
                    display: inline-block;
                    margin-left: 25px;
                    cursor: pointer;
                    color: #0cc2a9;
                }
            }
        }

        .preservation {
            display: inline-block;
            margin-left: 9px;
        }
        .basic {
            margin: 10px 0 30px 0;
            font-size: 16px;
        }
        .customers {
            font-size: 14px;
            cursor: pointer;
            color: #0cc2a9;
        }
        .estimate {
            font-size: 14px;
            cursor: pointer;
            color: #595959;
        }
        .calculates {
            margin-left: 30px;
            font-size: 14px;
            cursor: pointer;
            color: #0cc2a9;
        }
        .typeface {
            color: #b3b3b3;
            font-size: 12px;
            margin: 12px 0 0 20px;
        }
        .choose-parent-wrapper {
            .choose-parent {
                display: inline-block;
                position: relative;
                flex-wrap: wrap;
                box-sizing: border-box;
                $option-height: $input-field-height;
                $border-radius: 4px;
                $hover-bg: #f8f9fa;
            }
        }
        .input {
            width: 312px;
        }
        .btn {
            margin: 0;
        }
    }
</style>
