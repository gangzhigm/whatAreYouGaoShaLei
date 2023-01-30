
<template>
    <modal :title="title ? title : $t('common.defaultConfirmTitle')" @close="cancel" :size="size" :readonly="readonly">
        <slot></slot>
        <template v-if="showBtn" v-slot:buttons>
            <input type="button" class="btn btn-md btn-theme-border" @click.stop="cancel"
                   :value="cancelText"/>
            <input type="button" class="btn btn-md btn-theme" tabindex="1" autofocus @click.stop="sure"
                   :value="confirmText"/>
        </template>
    </modal>
</template>
<script type="text/ecmascript-6">
    export default {
        name: 'confirm',
        props: {
            title: {
                type: String,
            },
            size: String,
            // 自动focus回车确认
            autoConfirm: {
                type: Boolean,
                default: true
            },
            recall: {
                type: String,
                default: ''
            },
            determine: {
                type: String,
                default: ''
            },
            readonly: Boolean,
            // 显示确认按钮
            showBtn: {
                type: Boolean,
                default: true
            }
        },
        data() {
            return {
                // 另写字段是因为prop default注入时， i18n未注入
                cancelText: '',
                confirmText: '',
            };
        },
        mounted() {
            window.addEventListener('keydown', this.keyDown, false);
            this.cancelText = this.recall !== '' ? this.recall : this.$t('common.cancel');
            this.confirmText = this.determine !== '' ? this.determine : this.$t('common.confirm');
        },
        beforeDestroy() {
            window.removeEventListener('keydown', this.keyDown, false);
        },
        methods: {
            keyDown(e) {
                if (e.keyCode === 13 && this.autoConfirm === true) {
                    e.preventDefault();
                    e.stopPropagation();
                    this.sure();
                }
            },
            cancel() {
                this.$emit('cancel');
            },
            sure() {
                this.$emit('confirm');
            }
        }
    };
</script>
