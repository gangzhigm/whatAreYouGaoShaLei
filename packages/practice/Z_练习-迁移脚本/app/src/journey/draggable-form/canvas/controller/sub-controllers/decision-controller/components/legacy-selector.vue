<template>
    <div class="selector legacy-selector" v-blur="hideList">
        <label class="select-text" @click="!disabled && toggleList()" :class="{disabled, active: show}">
            <span v-if="selectedOpt[nameAlias]">{{translate ? $t(selectedOpt[nameAlias]) : selectedOpt[nameAlias]}}</span>
            <span v-else class="placeholder">{{'swarm.OtherInteractive' | t}}</span>
            <span class="select-icon icon icon-arrow-down"></span>
        </label>
        <transition name="drop">
            <div class="list-container" v-show="show">
                <ul class="select-list">
                    <li v-for="opt in options" class="option"
                        :title="translate ? $t(opt[nameAlias]) : opt[nameAlias]">
                        <p class="option-text"
                           :disabled="opt.disabled || opt.isTitle"
                           :class="{selected: opt[idAlias] === selectedOpt[idAlias] , 'group-title': opt.isTitle}"
                           @mousedown="change(opt)">
                            {{translate ? $t(opt[nameAlias]) : opt[nameAlias]}}
                        </p>
                    </li>
                </ul>
            </div>
        </transition>

    </div>
</template>
<script type="text/babel">

    export default {
        name: 'legacy-selector',
        props: {
            translate: {
                'default': false
            },
            //下拉列表项
            options: {
                type: Array,
                required: true
            },
            placeholder: String,
            disabled: {
                default: false
            },
            nameAlias: {
                // 使用自定义字段代替name字段
                type: String,
                default: 'name'
            },
            idAlias: {
                // 使用自定义字段代替id字段
                type: String,
                default: 'id'
            },
            //默认选中的选项
            value: '',
        },
        data() {
            return {
                show: false,
                selectedIndex: ''
            };
        },
        computed: {
            selectedOpt() {
                let temp = {};
                temp[this.nameAlias] = '';
                temp[this.idAlias] = '';
                return this.options.$getByKey(this.value) || this.options[this.selectedIndex] || temp;
            }
        },
        methods: {
            showList() {
                this.show = true;
            },
            hideList() {
                this.show = false;
            },
            toggleList() {
                this.show ? this.hideList() : this.showList();
            },
            // 选择一个列表项
            change(option) {
                if (option.disabled || option.isTitle) {
                    // 禁用选项、分组标题不能被选择
                    return;
                }
                this.$nextTick(() => {
                    if (JSON.stringify(option) === '{}') {
                        this.selectedIndex = -1;
                    } else {
                        this.selectedIndex = this.options.findIndex(opt => opt[this.idAlias] === option[this.idAlias]);
                    }
                });
                this.hideList();
                this.$emit('input', option[`${this.idAlias}`]);
                this.$emit('select', option);
            }
        }
    };
</script>
<style lang="scss" type="text/scss" rel="stylesheet/scss">

    @import '../../../../../../../common/scss/base/variables';
    @import '../../../../../../../common/scss/base/mixin';

    // controller by selector.vue

</style>
