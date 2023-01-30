<template>
    <div class="baseInfo">
        <div class="form-field">
            <label for="safetyGroupName" class="label">{{'privilege.groupName' | t}}</label>
            <input type="text" id="group-name" class="input" v-model.trim="value.roleName"
                   :class="{error: errorText}" v-title:right.line.warn="errorText"
                   @focusin="errorText = ''" maxlength="100">
        </div>
        <div class="form-field">
            <label for="groupName" class="label">{{'privilege.selectFolder' | t}}</label>
            <selector v-model="value.groupId" :options="securityGroup" class="lg"></selector>
        </div>
        <div class="form-field">
            <label for="SafetyDescribe" class="label">{{'privilege.description' | t}}</label>
            <textarea class="textarea full-width" ref="textarea" v-model="value.describe"></textarea>
        </div>
    </div>
</template>

<script>
    import {COMMON_NAME_REGEXP} from '../../../common/utils/regs.js';

    export default {
        name: 'baseInfo',
        props: {
            value: Object,
            securityGroup: Array,
        },
        data() {
            return {
                errorText: '', // 分群校验信息
            };
        },
        methods: {
            /**
             * 保存前的校验
             */
            valid() {
                if (this.value.roleName === undefined || this.value.roleName.trim() === '') {
                    this.errorText = this.$t('privilege.namenoEmpty');
                    this.$toast(this.$t('privilege.namenoEmpty'), 'warn');
                    this.$emit('valid');
                    return false;
                }
                if (!COMMON_NAME_REGEXP.test(this.value.roleName)) {
                    this.errorText = this.$t('privilege.nameReg');
                    this.$toast(this.$t('privilege.nameReg'), 'warn');
                    this.$emit('valid');
                    return false;
                }
                if (!this.value.groupId) {
                    this.$toast(this.$t('privilege.groupNoEmpty'), 'warn');
                    return false;
                }
                return true;
            }
        }
    };
</script>

<style lang="scss">
</style>
