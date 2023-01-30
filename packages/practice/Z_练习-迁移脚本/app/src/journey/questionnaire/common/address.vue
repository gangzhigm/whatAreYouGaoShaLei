<template>
    <div class="form-address">
        <carouse v-if="settings.includes(1)" :options="addressList" v-model="addressValue"
                 @select="getSelectedAddress"/>
        <input v-if="showDetailAddress" type="text" class="input" v-model="addressDetail"
               @input="emitDefault" @blur="updateTemplate">
    </div>
</template>

<script>
    import Carouse from '../../../common/components/carouse.vue';

    export default {
        name: 'form-address',
        props: {
            value: String,
            // 地址字段配置信息 [1: 省， 2： 市， 3： 区， default: 地址详情]
            settings: Array,
            address: Array,
            templateAddressValue: Object
        },
        components: {
            Carouse
        },
        computed: {
            showDetailAddress() {
                return this.settings.includes('default');
            }
        },
        data() {
            return {
                // 详细地址
                addressDetail: '',
                // 可选地址列表
                addressList: [],
                // 省市区地址Ids
                addressValue: '',
                // 临时省市区内容
                templateValue: '',
                // 地址选择器选择的原始格式数据
                selectValue: ''
            };
        },
        mounted() {
            this.addressDetail = this.templateAddressValue.detail;
            this.selectValue = this.templateAddressValue.selectValue;
            // 原地址字段只包含输入框， 无省市区。
            if (!this.templateAddressValue.detail && this.showDetailAddress && this.value && !this.settings.includes(1)) {
                this.addressDetail = this.value;
                // 重新保存后，改为现有逻辑
                this.templateAddressValue.detail = this.addressDetail;
                this.updateTemplate();
            }
            // 当配置项由包含省市区变为仅详情， 旧数据详情回显完整地址
            if (this.selectValue && !this.settings.includes(1)) {
                this.addressDetail = this.value;
                this.selectValue = '';
                this.updateTemplate();
            }
            // 配置由包含详情变为无详情， 清空详情数据
            if (!this.showDetailAddress && this.addressDetail) {
                this.addressDetail = '';
                this.updateTemplate();
                this.$emit('input', this.selectValue.replace(/\//g, ' '));
            }
            if (this.address.length > 0) {
                this.getAddress(this.templateAddressValue.selectValue);
            }
        },
        methods: {
            getSelectedAddress(e) {
                this.selectValue = e.valueStr.replace(/\s/g, '/');
                this.updateTemplate();
                this.$emit('input', e.valueStr + ' ' + this.addressDetail);
            },
            // 获取地址
            getAddress(names) {
                let times;
                if (this.showDetailAddress) {
                    times = this.settings.length - 1;
                } else {
                    times = this.settings.length;
                }

                this.addressList = this.getAreaData(this.address, times, 0);
                if (this.value.length) this.addressValue = this.getAddressIds(names);

                // 表单字段配置更改， 省、市、区配置项减少, 以防地址内容未修改， 手动更新
                // note：当前编辑数据提交时包含省市区， 现在编辑， 发现配置去掉了市区，当前字段未修改的情况下，保存应只传省
                if (names !== '') {
                    const addressWithoutEnter = names.split('/');
                    const checkedL = addressWithoutEnter.length;
                    if (checkedL > this.addressValue.length && this.settings.includes(1)) {
                        const value = this.showDetailAddress ? this.templateValue + ' ' + this.addressDetail : this.templateValue;
                        this.selectValue = value.replace(/\s/g, '/');
                        this.updateTemplate();
                        this.$emit('input', value);
                    }
                }
            },
            /**
             * @param list      源数据
             * @param times     层级数
             * @param doTimes   已处理完的层数
             * @param result    整理过后的数据
             */
            getAreaData(list, times, doTimes, result = []) {
                if (doTimes < times) {
                    doTimes += 1;
                    result = list.map(elm => {
                        return {
                            id: elm.id,
                            name: elm.name,
                            children: this.getAreaData(elm.children, times, doTimes, result)
                        };
                    });
                }
                return result;
            },
            // 获取地址Id集合
            getAddressIds(names) {
                let target,result = [];
                names.split('/').forEach(name => {
                    let list = target ? target.children ? target.children : [] : this.addressList;
                    target = this.getTarget(list, name);
                    if (target) {
                        result.push(target.id);
                        // 用于配置变更， 更新数据
                        if (this.templateValue) {
                            this.templateValue = this.templateValue + ' ' + target.name;
                        } else {
                            this.templateValue = target.name;
                        }
                    }
                });
                return result;
            },
            getTarget(list, name) {
                return list.find(elm => elm.name === name);
            },
            // 输入详情
            emitDefault() {
                if (!this.settings.includes(1)) {
                    this.$emit('input', this.addressDetail);
                } else {
                    let names = this.selectValue.split('/');
                    names = names.toString();
                    this.$emit('input', names.replace(/,/g, ' ') + ' ' + this.addressDetail);
                }
            },
            // 更新原始数据字段
            updateTemplate() {
                this.$emit('updateTemplate', {selectValue: this.selectValue, detail: this.addressDetail});
            }
        }
    };
</script>

<style lang="scss">
    @import '../../../common/scss/base/variables';
    @import '../../../common/scss/base/mixin';

    .form-address {
        display: inline-block;

        .input {
            width: 100%;
            @include box-sizing(border-box);
            margin-top: 8px;
        }
        .carouse {
            width: 100%;
        }
    }
</style>