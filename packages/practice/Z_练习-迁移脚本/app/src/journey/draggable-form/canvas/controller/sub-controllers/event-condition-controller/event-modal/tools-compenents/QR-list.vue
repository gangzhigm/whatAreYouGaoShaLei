<template>
    <div class="QR-list">
        <selector v-model="selectorId1" :options="options" @select="selectEventOpt"
                  :search="options && options.length > 10"/>
        <selector v-model="selectorId2" :options="secOption" @select="outputResult"
                  :search="secOption && secOption.length > 10"/>
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
                selectorId1: '',
                selectorId2: '',
                secOption: []
            };
        },
        created() {
            // this.reset();
            this.restore();
        },
        methods: {
            selectEventOpt(e) {
                this.secOption = e.quickMarkList.map((item) => {
                    item.id = item.quickMarkId;
                    item.name = item.quickMarkName;
                    return item;
                });
                this.selectorId2 = '';
            },
            outputResult(e) {
                this.$emit('change', {
                    operator: 'value',
                    groupValue: this.selectorId1,
                    value: e.id,
                    name: e.quickMarkName
                });
            },
            restore() {
                this.selectorId1 = this.restoreValue.groupValue;
                for (let item of this.options) {
                    if (item.id === this.selectorId1) {
                        this.secOption = item.quickMarkList.map((x) => {
                            x.id = x.quickMarkId;
                            x.name = x.quickMarkName;
                            return x;
                        });
                    }
                }
                this.selectorId2 = this.restoreValue.value;
            },
            reset() {
                this.selectorId1 = '';
                this.selectorId2 = '';
                this.secOption = [];
            },
        },
    };
</script>
