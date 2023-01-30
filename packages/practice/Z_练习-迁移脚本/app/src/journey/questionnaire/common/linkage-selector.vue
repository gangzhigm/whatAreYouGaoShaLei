<template>
    <div class="linkage-selector">
        <selector :options="options" v-model='firstLevel' @select="selectLevelOne" search></selector>
        <selector :options="secondList" v-model='secondLevel' @select="emit" search :placeholder='`\xa0`'></selector>
    </div>
</template>

<script>
    export default {
        props: {
            options: {
                type: Array
            },
            value: {
                type: Array
            }
        },
        name: 'linkage-selector',
        data() {
            return {
                secondList: [],
                firstLevel: '',
                secondLevel: ''
            };
        },
        watch: {
            value(newValue) {
                this.setData(newValue);
            }
        },
        mounted() {
            this.setData(this.value);
        },
        methods: {
            setData(newValue) {
                if (newValue.length > 0) {
                    this.firstLevel = newValue[0];
                    this.secondList = this.options.find(list => list.id === this.firstLevel).dataList;
                    this.secondLevel = newValue.length > 1 ? newValue[1] : '';
                }
            },
            selectLevelOne() {
                this.secondLevel = '';
                this.secondList = this.options.find(list => list.id === this.firstLevel).dataList;
                this.emit();
            },
            emit() {
                const levelOne = this.options.find(list => list.id === this.firstLevel);
                const levelTwo = this.secondList.find(list => list.id === this.secondLevel);
                if (levelTwo) {
                    this.$emit('select', [levelOne, levelTwo]);
                    this.$emit('input', [this.firstLevel, this.secondLevel]);
                } else {
                    this.$emit('select', [levelOne]);
                    this.$emit('input', [this.firstLevel]);
                }
            }
        }
    };
</script>

<style lang="scss">
    @import "../../../common/scss/base/variables";
    @import "../../../common/scss/base/mixin";

    .linkage-selector {
        display: inline-block;
    }
</style>