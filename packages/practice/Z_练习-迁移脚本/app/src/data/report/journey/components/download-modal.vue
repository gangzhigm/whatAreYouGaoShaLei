<template>
    <confirm :title="$t('form.downloadDetail')" class="download-modal" @cancel="clear" @confirm="confirm">
        <div class="form-field">
            <label class="label">{{'data.formatType' | t}}</label>
            <radio :source="0" v-model="fileType">Excel</radio>
            <radio :source="1" v-model="fileType">CSV</radio>
        </div>
        <div class="form-field" v-if="fileType === 1">
            <label class="label">{{'swarm.dataFormat' | t}}</label>
            <radio :source="1" v-model="dataType">UTF-8</radio>
            <radio :source="0" v-model="dataType">Gb18030</radio>
        </div>
        <div class="form-field">
            <label class="label">{{'controller.email_subject' | t}}</label>
            <input type="text" class="input" v-model.trim="theme" maxlength="100">
        </div>
        <div class="form-field">
            <label class="label">{{'data.receivingMailbox' | t}}</label>
            <input type="text" class="input" v-model.trim="sendEmail">
        </div>
    </confirm>
</template>

<script>
    import {EMAIL_ADDRESS_REGEXP} from '@/common/utils/regs';
    export default {
        name: 'download-modal',
        props: {
            inputTheme: {
                type: String,
                default: ''
            }
        },
        data() {
            return {
                fileType: 0, // 下载文件类型
                dataType: 1, // 数据格式
                theme: '', // 邮件主题
                sendEmail: this.$store.state.user.email // 默认登录邮箱
            };
        },
        mounted() {
            this.theme = `${this.inputTheme}`;
        },
        methods: {
            clear() {
                this.fileType = 1;
                this.dataType = 1;
                this.theme = '';
                this.sendEmail = '';
                this.$emit('cancel');
            },
            confirm() {
                if (!EMAIL_ADDRESS_REGEXP.test(this.sendEmail)) return this.$toast(this.$t('data.validEmail'),'warn');
                let selectData = {
                    fileType: this.fileType,
                    dataType: this.fileType === 1 ? this.dataType : '',
                    theme: this.theme,
                    sendEmail: this.sendEmail
                };
                this.$emit('confirm', selectData);
                this.clear();
            }
        }
    };
</script>

<style lang="scss">

</style>