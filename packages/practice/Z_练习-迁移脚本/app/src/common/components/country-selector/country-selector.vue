<template>
    <div class="country-selector">
        <input :id="domId" type="text" class=" input" readonly>
    </div>
</template>

<script>
import $ from 'jquery';
import country from './build/js/countrySelect.js';
country($, window, document);

export default {
    name: 'country-selector',
    props: {
        value: String,
        // 自定义国家数据
        customCountry: Array,
        domId: {
            type: String,
            default: 'country_selector'
        }
    },
    watch: {
        // 数据异步获取
        customCountry(list) {
            if (list.length > 0) {
                // 重置组件
                $('#' + this.domId).countrySelect('destroy');
                $('#' + this.domId).countrySelect.setCountryData(list);
                this.init();
            }
        }
    },
    mounted() {
        // 选中国家
        $('#' + this.domId).change((e) => {
            this.$emit('input', e.target.value);
        });
    },
    methods: {
        init() {
            const defaultValue = this.value ? this.getIso2() : 'cn';
            // 组件初始化
            $('#' + this.domId).countrySelect({
                // iso2数据
                // 默认选中数据
                defaultCountry: '',
                // 优先展示国家 （组件有默认值，此处清空）
                preferredCountries: [],
            });
            this.setData(defaultValue);
        },
        setData(country) {
            $('#' + this.domId).countrySelect('selectCountry', country);
        },
        // 根据国家名称获取iso2
        getIso2() {
            // 组件默认国家数据
            const list = $('#' + this.domId).countrySelect.getCountryData();
            const target = list.find(elm => elm.name === this.value);
            return target ? target.iso2 : 'cn';
        }
    }
};
</script>

<style lang="less">
    @import "./countrySelect.less";
    .country-selector {
        display: inline-block;

        .input {
            width: 100%;
        }

        .country-select {
            .country-list {
                margin-top: 5px;
                border-radius: 4px;
                .country {
                    &.active {
                        background-color: #e6fff7;
                        color: #595959;
                    }
                }
            }
        }
    }
</style>