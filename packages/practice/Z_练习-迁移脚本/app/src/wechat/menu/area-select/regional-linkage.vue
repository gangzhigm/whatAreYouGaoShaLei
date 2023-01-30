<template>
    <!--地区选择-->
    <div class="distpicker" @click.stop>
        <div class="input-text" :class="{selectActive:multistageFlag}"
             :title="areaTitle"
             @click="toSelectArea">
            <div class="con-pro-city">
                <span v-text="lang==='en' ? country.enName : country.znName"></span>
                <span v-text="lang==='en' ? province.enName : province.znName"></span>
                <span v-text="lang==='en' ? city.enName : city.znName"></span>
            </div>
            <span class="select-icon icon icon-arrow-down" :class="{iconActive:multistageFlag}"></span>
        </div>
        <div class="multistage" v-if="multistageFlag">
            <div class="options country-options" v-show="countryFlag">
                <ul>
<!--                    全部-->
                    <li class="select-options" :class="{active: currentCountry == 3 }" v-if="pageStatus"
                        @click="selectCountry(viewAllAreaOption[0], true)">
                        <span v-text="lang === 'en' ? viewAllAreaOption[0].enName : viewAllAreaOption[0].znName"></span>
                    </li>
<!--                    不限-->
                    <li class="select-options" :class="{active: currentCountry == 2 }"
                        @click="selectCountry(unlimitedOption[0], true)">
                        <span v-text="lang === 'en' ? unlimitedOption[0].enName : unlimitedOption[0].znName"></span>
                    </li>
                    <!--中国-->
                    <li class="select-options" :class="{active: currentCountry == 1 }"
                        @click="selectCountry(chinaOption[0], true)">
                        <span v-text="lang === 'en' ? chinaOption[0].enName : chinaOption[0].znName"></span>
                        <span class="icon icon-fanhui"></span>
                    </li>
                </ul>
            </div>
            <div class="options province-options" v-show="provinceFlag">
                <label class="search-field">
                    <input type="text" v-model.trim="searchProvince" @keyup.enter="toSearchProvince"
                           :placeholder="$t('menu.searchContent')" autofocus>
                    <span class="icon icon-search" @click="toSearchProvince"></span>
                </label>
                <ul class="area-select">
                    <li class="select-options" v-for="(pro,index) in provinceList" :key="index"
                        :class="{active:province.id === pro.id}"
                        @click="selectProvince(pro, true)">
                        <span v-text="lang==='en' ? pro.enName : pro.znName"></span>
                        <span v-if="pro.children.length > 0" class="icon icon-fanhui"></span>
                    </li>
                    <li class="no-data" v-if="provinceList.length===0">
                        {{'components.without' | t}}{{searchProvince}}{{'components.relevant' | t}}
                    </li>
                </ul>
            </div>
            <div class="options city-options" v-if="cityFlag">
                <label class="search-field">
                    <input type="text" v-model.trim="searchCity" @keyup.enter="toSearchCity"
                           :placeholder="$t('menu.searchContent')" autofocus>
                    <span class="icon icon-search" @click="toSearchCity"></span>
                </label>
                <ul class="area-select">
                    <li class="select-options" v-for="(cty,index) in cityList" :key="index"
                        :class="{active:city.id === cty.id}"
                        @click="selectCity(cty)">
                        <span v-text="lang==='en'?cty.enName:cty.znName"></span>
                    </li>
                    <li class="no-data" v-if="cityList.length===0">
                        {{'components.without' | t}}{{searchCity}}{{'components.relevant' | t}}
                    </li>
                </ul>
            </div>
        </div>
        <div class="btn-wrapper" v-if="btnFlag">
            <button class="btn btn-md btn-theme-border" @click="selectResult(1)" :disable="country===''">{{'common.cancel' | t}}</button>
            <button class="btn btn-md btn-theme" @click="selectResult(2)" :disable="country === ''">{{'common.confirm' | t}}</button>
        </div>
    </div>
</template>

<script>
    import {I18N_STORE_NAME} from '@/locales';

    export default {
        name: 'regionalLinkage',
        data() {
            return {
                unlimitedOption:[],//不限 选项
                chinaOption:[],//中国 选项
                multistageFlag: false,//多级联动显隐
                country: {},//国家
                currentCountry:'',//当前选中的国家
                province:{},//省份
                city:{},//城市
                countryFlag:false,//国家list显隐
                provinceList:[],//省份list
                provinceFlag:false,//省份list显隐
                cityList:[],//城市list
                cityFlag:false,//城市list显隐

                searchProvince:'',//搜索省份
                searchCity:'',//搜索城市
                currentArea: {},
                viewAllAreaOption: [{//地区 "全部" 选项
                    children: [],
                    enName: 'All',
                    id: 3,
                    znName: '全部'
                }],
            };
        },
        component: {},
        computed:{
            areaTitle() {
                return `${this.lang === 'en' ? this.country.enName : this.country.znName} ${!Object.keys(this.province).length ? '' : this.lang === 'en' ? this.province.enName : this.province.znName} ${!Object.keys(this.city).length ? '' : this.lang === 'en' ? this.city.enName : this.city.znName}`;
            },
            lang() {
                return this.$store.state[I18N_STORE_NAME].lang;
            }
        },
        watch: {
            // 接收父组件回传的地区
            lastAreaSelect() {
                this.lastArea();
            }
        },
        props:{
            pageStatus: {//地区是否显示"全部"筛选项
                type: Boolean,
                default: false
            },
            areaList: {//城市列表
                type: Array
            },
            lastAreaSelect: {//父组件回传子组件上次选中的地区
                type: Object,
                default:{
                    country: '',
                    province: '',
                    city: ''
                }
            },
            btnFlag: {//底部按钮显隐
                type: Boolean,
                default: false
            }
        },
        mounted() {
            let limitOptions = {children: [],enName: 'No Limit', id: 2, parentId: 0, znName: this.$t('common.UnlimitCountry')};
            let allCountryOptions = {children: [], enName: 'All', id: 3, znName: '全部'};
            this.country = this.pageStatus ? allCountryOptions : limitOptions;
            this.currentCountry = this.pageStatus ? 3 : 2;
            // 接收父组件回传的地区
            this.lastArea();
            // 点击其他地方下拉菜单收起
            window.addEventListener('click', this.eventListener);
            this.unlimitedOption = this.areaList.filter(item => item.id === 2);
            this.chinaOption = this.areaList.filter(item => item.id === 1);
        },
        destroyed() {
            window.removeEventListener('click', this.eventListener);
        },
        methods: {
            lastArea() {
                if (this.lastAreaSelect.country) {
                    this.country = this.lastAreaSelect.country;
                    this.province = this.lastAreaSelect.province;
                    this.city = this.lastAreaSelect.city;
                    this.selectCountry(this.lastAreaSelect.country, true);
                    this.selectProvince(this.lastAreaSelect.province, true);
                    this.selectCity(this.lastAreaSelect.city);
                }
            },
            toSelectArea() {
                this.multistageFlag = !this.multistageFlag;
                this.countryFlag = true;
                this.searchCity = '';
                this.searchProvince = '';
            },
            /**
             * 选择国家
             * toEmpty 是否清空搜索关键字 true清空 false不清空
             * */
            selectCountry(country, toEmpty) {
                this.$emit('chosenArea', country, 'country');
                if (toEmpty) {
                    this.searchProvince = '';
                }
                this.country = country;
                this.currentCountry = country.id;
                this.provinceList = country.children ? country.children : [];
                this.provinceFlag = this.provinceList.length !== 0;
                this.cityFlag = false;
                this.province  = '';
                this.city = '';
            },
            // 选择省份
            selectProvince(province, toEmpty) {
                this.$emit('chosenArea', province, 'province');
                if (toEmpty) {
                    this.searchCity = '';
                }
                this.province = province;
                this.cityList = province.children ? province.children : [];
                this.cityFlag = this.cityList.length !== 0;
                this.city = '';
            },
            // 选择城市
            selectCity(city) {
                this.$emit('chosenArea', city, 'city');
                this.city = city;
            },
            /**
             * 地区选择结果
             * @param type 1取消选择 2确定选择
             */
            selectResult(type){
                if (type === 1) {
                    //取消
                    this.cityFlag = false;
                    this.provinceFlag = false;
                    this.city = '';
                    this.province = '';
                    this.country = '';
                }
                this.$emit('sureAreaSelect',{country:this.country, province:this.province, city:this.city});
                this.searchCity = '';
                this.searchProvince = '';
            },
            // 搜索省份
            toSearchProvince(){
                this.selectCountry(this.country, false);
                this.lang === 'en' ?
                    this.provinceList = this.provinceList.filter(
                        elm => elm.enName.toLowerCase().indexOf((this.searchProvince).toLowerCase()) !== -1
                    ) : this.provinceList = this.provinceList.filter(
                        elm => elm.znName.toLowerCase().indexOf((this.searchProvince).toLowerCase()) !== -1
                    );
            },
            // 搜索城市
            toSearchCity() {
                this.selectProvince(this.province, false);
                this.lang === 'en' ?
                    this.cityList = this.cityList.filter(
                        elm => elm.enName.toLowerCase().indexOf((this.searchCity).toLowerCase()) !== -1
                    ) : this.cityList = this.cityList.filter(
                        elm => elm.znName.toLowerCase().indexOf((this.searchCity).toLowerCase()) !== -1
                    );
            },
            // 通用方法 下拉菜单的收起
            eventListener() {
                this.multistageFlag = false;
                this.searchCity = '';
                this.searchProvince = '';
            },
        }
    };
</script>

<style type="text/scss" lang="scss">
    @import '../../../common/scss/base/variables';
    @import '../../../common/scss/base/mixin';
    .drop-list{
        padding: 5px;
    }
    .distpicker{
        .input-text{
            width: 200px;
            display: flex;
            justify-content: space-between;
            background-color: #fff;
            padding: 0 5px;
            border-radius: 3px;
            border: 1px solid $border-color;
            cursor: pointer;
            &.selectActive{
                border-color: $green;
            }
            .select-icon{
                &.iconActive{
                    color: $green;
                }
            }
            .con-pro-city{
                overflow: hidden;
                white-space: nowrap;
                text-overflow: ellipsis;
            }
        }
        .multistage{
            display: flex;
            .options{
                border: 1px solid $border-color;
                background-color: #fff;
                min-width: 150px;
                flex-shrink: 1;
                .select-options{
                    display: flex;
                    justify-content: space-between;
                    cursor: pointer;
                    padding: 0 5px;
                    &.active{
                        background-color: $select-bg;
                    }
                    &:hover{
                        background-color: $select-bg;
                    }
                }

                .search-field {
                    position: relative;
                    display: flex;
                    align-items: center;
                    height: $input-field-height;
                    border-bottom: 1px solid $select-border;
                    background-color: $title-bg;
                    @include border-radius(0);
                    color: $color-light-content;

                    input {
                        height: $input-field-height;
                        padding: 0 8px 0 28px;
                        width: 100%;
                        min-width: 5em; // 否则placeholder显示不全
                        border: none;
                        background-color: transparent;

                        &:hover {
                            background-color: $select-bg;

                            & + .icon-search {
                                background-color: $select-bg;
                            }
                        }

                        &:focus {
                            background-color: #fff;

                            & + .icon-search {
                                background-color: #fff;
                            }
                        }
                    }

                    .icon-search {
                        $offset: ($input-field-height - 14px) / 2;
                        position: absolute;
                        width: 26px;
                        height: $input-field-height - 2px;
                        line-height: $input-field-height;
                        text-align: center;
                        left: 1px;
                        top: 1px;
                        background-color: transparent;
                    }
                }
            }
            .area-select{
                max-height: 189px;
                overflow-y: scroll;
                max-width: 210px;
                white-space: normal;
                .no-data{
                    text-align: center;
                    color: $disabled;
                }
            }
        }
        .btn-wrapper{
            display: flex;
            margin: 5px 0;
            justify-content: flex-end;
        }

    }
</style>
