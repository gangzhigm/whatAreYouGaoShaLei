<template>
    <div>
        <!--普通账号 在线客服-->
        <div class="customer-service-button" v-show="visible && !isHw" @click="hideButton" @mouseenter="toggle(true)">
            {{'home.hide' | t}}
        </div>
        <!--华为账号 在线客服-->
        <div class="hw-customer-service-button" v-show="visible && isHw" @click="hideButton" @mouseenter="toggle(true)">
            {{'home.hide' | t}}
        </div>
    </div>
</template>
<script>
    import debounce from 'lodash/debounce';
    import {logError} from '@/monitor';
    import { mapState } from 'vuex';


    export default {
        name: 'customer-service-button',
        data() {
            return {
                visible: false,
                eventBinderTimer: null,
                round: 1
            };
        },
        watch: {
            $route(newRoute, oldRoute) {
                if (newRoute.name !== oldRoute.name) {
                    this.showButton();
                }
            },
        },
        computed: {
            ...mapState(['user']),
            // 华为账号
            isHw() {
                return this.user.companyType === 1;
            }
        },
        mounted() {
            // 华为账号
            if (this.isHw) {
                this.bindHwEvents();
            } else {
            // 普通账号
                this.bindEvents();
            }
        },
        beforeDestroy() {
            this.unbindEvents();
            this.unbindHwEvents();
        },
        methods: {
            bindEvents() {
                const customerServiceButton = document.getElementById('kf5-support-btn');
                if (customerServiceButton) {
                    customerServiceButton.addEventListener('mouseenter', this.mouseEnter, false);
                    customerServiceButton.addEventListener('mouseleave', this.mouseLeave, false);
                } else {
                    this.round = this.round + 1;
                    if (this.round < 5) {
                        this.eventBinderTimer = setTimeout(this.bindEvents, 1000);
                    } else {
                        logError(`[客服插件-按钮隐藏功能] 没有定位到 id 为 kf5-support-btn 的客服按钮`);
                    }
                }
            },
            unbindEvents() {
                const customerServiceButton = document.getElementById('kf5-support-btn');
                clearTimeout(this.eventBinderTimer);
                if (customerServiceButton) {
                    customerServiceButton.removeEventListener('mouseenter', this.mouseEnter, false);
                    customerServiceButton.removeEventListener('mouseleave', this.mouseLeave, false);
                }
            },
            // 华为账号
            bindHwEvents() {
                const hwButton = document.querySelector('#launcher');
                if (hwButton) {
                    hwButton.addEventListener('mouseenter', this.mouseEnter, false);
                    hwButton.addEventListener('mouseleave', this.mouseLeave, false);
                } else {
                    this.round = this.round + 1;
                    if (this.round < 10) {
                        this.eventBinderTimer = setTimeout(this.bindHwEvents, 1000);
                    } else {
                        logError(`[客服插件-按钮隐藏功能] 没有定位到 id 为 zEWidget 的客服按钮`);
                    }
                }
            },
            // 华为账号
            unbindHwEvents() {
                const hwButton = document.querySelector('#launcher');
                clearTimeout(this.eventBinderTimer);
                if (hwButton) {
                    hwButton.removeEventListener('mouseenter', this.mouseEnter, false);
                    hwButton.removeEventListener('mouseleave', this.mouseLeave, false);
                }
            },
            mouseEnter() {
                this.toggle(true);
            },
            mouseLeave() {
                this.toggle(false);
            },
            toggle: debounce(function (display) {
                this.visible = !!display;
            }, 200, {trailing: true}),
            hideButton() {
                this.visible = false;
                if (this.isHw) { // 华为账号
                    /*eslint-disable*/
                    zE(function () {
                        zE.hide();
                    });
                } else { // 普通账号
                    window.KF5SupportBoxAPI.hideButton();
                }
            },
            showButton() {
                this.visible = false;
                if (this.isHw) { // 华为账号
                    /*eslint-disable*/
                    zE(function () {
                        zE.show();
                    });
                    // 推送邮箱
                    /*eslint-disable*/
                    zE('webWidget', 'identify', {
                        email: this.user.email,
                    });
                } else { // 普通账号
                    if (window.KF5SupportBoxAPI) {
                        window.KF5SupportBoxAPI.showButton();
                    }
                }
            },
        }
    };
</script>
<style lang="scss">
    @import "../../common/scss/base/variables";
    @import "../../common/scss/base/mixin";

    .customer-service-button {
        $size: 56px;
        $offset: 50px;
        position: fixed;
        line-height: $input-field-height;
        bottom: $size + $offset;
        right: $offset + $size / 2;
        padding: 0 1em;
        border-radius: 4px;
        @include transform(translateX(50%));
        cursor: pointer;
        color: white;
        background-color: #4677C1;
    }

    .hw-customer-service-button {
        position: fixed;
        line-height: $input-field-height;
        bottom: 62px;
        right: 89px;
        padding: 0 1em;
        border-radius: 4px;
        @include transform(translateX(50%));
        cursor: pointer;
        color: white;
        background-color: #0cc2a9;
    }
</style>
