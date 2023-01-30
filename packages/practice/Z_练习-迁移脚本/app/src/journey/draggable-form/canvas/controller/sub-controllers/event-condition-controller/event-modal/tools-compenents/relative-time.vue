<template>
    <div class="relative-time">
        <number-input class="input" v-model="eventValue" :min="0" max="999" maxlength="3"/>
        {{'common.day' | t}}
        <selector v-model="relativeType" :options="options"></selector>
    </div>
</template>

<script type="text/ecmascript-6">
    import {translate} from '@/locales';

    export const RELATIVE_TYPES = [
        {id: 1, name: translate('tag.before')},
        {id: 0, name: translate('tag.within')}
    ];
    export default {
        props: {
            restoreValue: Object
        },
        data() {
            return {
                eventValue: '',
                relativeType: 0,
                options: RELATIVE_TYPES
            };
        },
        created() {
            this.restore();
            // this.output();
        },
        methods: {
            restore() {
                if (this.restoreValue.operator === 'value') {
                    this.relativeType = this.restoreValue.relativeType;
                    this.eventValue = this.restoreValue.value;
                }
            },
            reset() {
                this.eventValue = '';
                this.relativeType = 0;
            },
            output() {
                let errMsg = '';
                if (this.eventValue === '') {
                    errMsg = this.$t('controller.relativeTimeNeeded');
                }
                this.$emit('change', {
                    operator: 'value',
                    relativeType: this.relativeType,
                    value: this.eventValue,
                    errMsg: errMsg
                });
            },
        },
        watch: {
            eventValue() {
                this.output();
            },
            relativeType() {
                this.output();
            },
        }
    };
</script>
