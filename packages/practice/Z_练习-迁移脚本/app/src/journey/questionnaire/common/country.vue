<template>
    <div class="form-country">
        <country-selector :custom-country="countryList"
                          :dom-id="domId"
                          v-model="countrySelected" @input="selectCountry" />
    </div>
</template>

<script>
    import CountrySelector from '../../../common/components/country-selector/country-selector.vue';
    export default {
        name: 'country',
        props: {
            value: String,
            settings: Array,
            country: Array,
            domId: String
        },
        components: {
            CountrySelector
        },
        data() {
            return {
                // 可选国家列表
                countryList: [],
                // 选择的国家
                countrySelected: '',
                // 展示的语言
                language: '',
                // 配置的国家 （不限、 具体国家）
                defaultCountry: '',
            };
        },
        watch: {
            // 当国家列表为异步获取
            country(value) {
                if (value.length) this.setCountryList();
            }
        },
        mounted() {
            [this.defaultCountry, this.language] = this.settings;
            // 表单配置的灵活修改， 会导致提交值与可选值不同语言，这里展示语言不随配置变更， 根据提交值展示中英文
            if (this.value) this.language = /[\u4e00-\u9fa5]/.test(this.value) ? 'cn' : 'en';
            if (this.country.length) this.setCountryList();
        },
        methods: {
            // 设置国家相关字段数据
            setCountryList() {
                let list = this.country;
                let defaultValue = '';
                // -100 代表可选国家不限制
                if (this.defaultCountry !== -100) {
                    list = this.country.filter(elm => elm.id === this.defaultCountry);
                    defaultValue = list[0] ? this.language === 'cn' ? list[0].name : list[0].abbreviation : '';
                }
                this.countryList = list.map(elm => {
                    return {
                        name: this.language === 'en' ? elm.abbreviation : elm.name,
                        iso2: elm.iso2
                    };
                });

                // 配置由不限制改为限制， 展示限制值
                this.countrySelected = defaultValue !== '' ? defaultValue : this.value;
                if (this.value === '' && defaultValue !== this.value) this.selectCountry(defaultValue);
            },
            // 选择国家
            selectCountry(e) {
                this.$emit('input', e);
            }
        }
    };
</script>
<style lang="scss">
    .form-country {
        display: inline-block;

        .country-selector {
            width: 100%;
            .country-select {
                width: 100%;
            }
        }
    }
</style>