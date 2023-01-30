<template>
    <svg aria-hidden="true" class="icon event-icon">
        <use v-bind:xlink:href="'#' + eventGroup"></use>
    </svg>
</template>
<script type="text/babel">

    export default {
        name: 'customer-icon',  // 联系人详情-信息流视图-事件分组（图标）
        props: {
            eventGroupName: String, // 事件分组名称
            eventName: String,      // 事件名称
        },
        computed: {
            eventGroup() {
                let icon;
                switch (this.eventGroupName) {
                    case 'email':   // 邮件
                        return 'icon-youjian';
                    case 'mobile':  // 短信
                    case 'mms':     // 彩信
                        return 'icon-duanxin';
                    case 'wechat':  // 微信
                        return 'icon-weixin';
                    case 'form':    // 表单
                        return 'icon-biaodan';
                    case 'label':   // 标签
                        return 'icon-biaoqian';
                    case 'attributeChange':
                        if (this.eventName === 'attribute_change') { // 属性变更 
                            icon = 'icon-shuxing';
                        } else if (this.eventName === 'global_unsubscribe') { // 全局退订
                            icon = 'icon-quanjutd';
                        } else if (this.eventName === 'global_subscribe') { // 全局订阅
                            icon = 'icon-dingyue';
                        } else if (this.eventName === 'eval_rank_change') { // 评级变更
                            icon = 'icon-diyshijian';
                        } else {
                            console.error('[联系人管理]<customer-icon> 里出现了不能识别的事件分组', this.eventGroupName);
                        }
                        return icon;
                    case 'order':   // 订单
                        return 'icon-dingdan';
                    case 'user':    // 用户
                        return 'icon-yonghu';
                    case 'wecom':   //企业微信
                        return 'icon-qiyeweixin';
                    default:        //自定义事件
                        return 'icon-diyshijian';
                }
            },
        },
    };
</script>
<style lang="scss" type="text/scss" rel="stylesheet/scss">

    @import '../../common/scss/base/variables';
    @import '../../common/scss/base/mixin';

    .event-icon {
        margin-left: 8px;
        width: 24px;
        height: 24px;
    }

</style>
