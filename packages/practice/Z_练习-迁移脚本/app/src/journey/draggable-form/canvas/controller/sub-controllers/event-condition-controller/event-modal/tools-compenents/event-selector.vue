<template>
    <div class="event-selector">
        <selector v-model="eventId" :options="options" @select="selectEventOpt($event)"></selector>
    </div>
</template>

<script type="text/ecmascript-6">
    export default {
        props: {
            options: Array,
            restoreValue: Object
        },
        data() {
            return {
                eventId: '',
            };
        },
        created() {
            this.restore();
        },
        methods: {
            selectEventOpt(e) {
                this.$emit('change', {operator: 'value', value: e.id, name: e.name});
            },
            restore() {
                this.eventId = this.restoreValue.value;
            },
            reset() {
                this.eventId = '';
                this.$emit('change', {
                    operator: 'value',
                    value: '',
                    name: '',
                    errMsg: this.$t('controller.completeCondition')
                });
            },
        }
    };
</script>
