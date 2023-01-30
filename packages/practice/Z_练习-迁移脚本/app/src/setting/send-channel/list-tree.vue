<!--发送通道list树形图-->
<template>
    <div class="department-list-tree">
        <div class="parent"
             v-for="item in list"
             :key="item.id">
            <div class="department-list">
                <ul class="right-department-list">
                    <li>
                        <span v-if="item.parentId === 0"> - </span>
                        <span v-if="item.parentId !== 0">{{item.departmentName}}</span>
                    </li>
<!--                    邮件-->
                    <li>
                        <span v-if="item.parentId === 0"> - </span>
                        <span v-if="item.parentId !== 0">{{item.emailSendCount}}</span>
                        <span class="allocation" v-if="item.parentId !== 0">
                            <button class="btn allocation-btn" 
                                id="enterprise_aisle_email_aisle"
                                :disabled="$has('enterprise_aisle_email_aisle')"
                                @click="showSentManage(item,sendType = 0)">{{'sendChannel.manage' | t}}
                            </button>
                        </span>
                    </li>
<!--                    短信-->
                    <li>
                        <span v-if="item.parentId === 0"> - </span>
                        <span v-if="item.parentId !== 0">{{item.smsSendCount}}</span>
                        <span v-if="item.parentId !== 0">
                            <button class="btn allocation-btn"
                                id="enterprise_aisle_sms_aisle"
                                :disabled="$has('enterprise_aisle_sms_aisle')"
                                @click="showSentManage(item,sendType = 1)">{{'sendChannel.manage' | t}}
                            </button>
                        </span>
                    </li>
<!--                    彩信-->
                    <li>
                        <span v-if="item.parentId === 0"> - </span>
                        <span v-if="item.parentId !== 0">{{item.mmsSendCount}}</span>
                        <span v-if="item.parentId !== 0"  >
                            <button class="btn allocation-btn" 
                                id="enterprise_aisle_mms_aisle"
                                :disabled="$has('enterprise_aisle_mms_aisle')"
                                @click="showSentManage(item,sendType =2)">{{'sendChannel.manage' | t}}
                            </button>
                        </span>
                    </li>
<!--                    微信公众号-->
                    <li>
                        <span v-if="item.parentId === 0"> - </span>
                        <span v-if="item.parentId !== 0">{{item.wechatCount}}</span>
                        <span v-if="item.parentId !== 0"  >
                            <button class="btn allocation-btn"
                                :disabled="$has('enterprise_configure_official_accounts')"
                                 @click="showSentManage(item,sendType =3)">
                                {{'sendChannel.manage' | t}}
                            </button>
                        </span>
                    </li>
                </ul>
            </div>
            <div v-if="item.children" class="children-item" v-show="item.spread">
                <span></span>
                <list-tree :list="item.children" @selectItem="handleClick" @showModel="showSentManage"></list-tree>
            </div>
            <div>
            </div>
        </div>
    </div>
</template>
<script>
    export default {
        name: 'ListTree',
        props: {
            list: Array,
            parentSelect: {
                type: Boolean,
                'default': true
            },
        },
        data() {
            return {
                arrow: 'arrow',
            };
        },
        methods: {
            //初始化数据
            initDt: function (dt) {
                for (let i = 0; i < dt.length; i++) {
                    let item = dt[i];
                    item.checked = false;
                    if (item.children) {
                        this.initDt(item.children);
                    }
                }
            },
            handleTitleClick: function (item) {
                //初始化
                this.initDt(this.list);
                item.checked = true;
                this.$emit('selectItem', item);
            },
            handleClick: function (item) {
                this.handleTitleClick(item);
            },
            showSentManage(item, sendType){
                let type = 'sendType';
                item[type] = sendType;
                this.$emit('showModel', item, sendType);
            },
        },
    };
</script>

<style type="text/css" lang="scss">
    @import '../../common/scss/base/variables';
    @import '../../common/scss/base/mixin';

    .department-list-tree {
        .parent, .children-item {
            line-height: 40px;
            font-size: 13px;
            white-space: nowrap;
            width: 100%;
        }
        .parent span {
            cursor: pointer;
            vertical-align: middle;
        }
        .parent {
            .department-list {
                overflow: hidden;
                height: 40px;
                line-height: 40px;
                .right-department-list {
                    float: left;
                    width: 100%;
                    background-color: white;
                    box-sizing: border-box;
                    overflow: auto;
                    li {
                        float: left;
                        width: 19%;
                        @include clearfix();
                        overflow: hidden;
                        text-overflow: ellipsis;
                        white-space: nowrap;
                        padding-left: 12px;
                        height: 40px;

                        &:nth-child(1){
                            padding-left: 10px;
                        }
                        // span {
                        //     &:nth-child(2) {
                        //         color: $theme;
                        //     }
                        //     cursor: pointer;
                        // }
                        .allocation-btn{
                            &:not([disabled]) {
                                color: $theme;
                            }
                        }
                       
                    }
                    &:hover,
                    &.active {
                        background-color: $select-bg;
                    }
                }
            }
        }
    }
</style>