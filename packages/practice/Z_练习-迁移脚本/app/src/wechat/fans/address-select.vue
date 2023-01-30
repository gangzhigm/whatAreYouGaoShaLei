<template>
    <div class="address-select" v-blur="close">
        <label class="text" @click="toggle" :class="{active: showDistrict}">
            {{'follower.selectDistrict' | t}}
            <span class="select-icon icon icon-arrow-down"></span>
        </label>
        <!-- 选择地区 -->
        <transition name="drop">
            <div class="district" v-if="showDistrict">
                <div class="dis-head">
                    <div v-for="(item,index) in district" class="dis-tab"
                         :class="{active : active === index}" @click="getindex(index)"
                         :key="index">{{item}}
                    </div>
                </div>
                <div class="dis-content" v-if="active==0">
                    <div v-if="!load">
                        <inline-loading></inline-loading>
                    </div>
                    <div v-else>
                        <ul v-if="country.length!=0 && load">
                            <li v-for=" (countryChild,index) in country" :key="index"
                                :class="{allactive : countryIndex===index}"
                                style="cursor: pointer"
                                @click="getProvence(countryChild,index)">{{countryChild}}
                            </li>
                        </ul>
                        <p class="disabled-text" v-else>{{'follower.noCountry' | t}}</p>
                    </div>

                </div>
                <div class="dis-content" v-else-if="active==1">
                    <div v-if="provenceLoad">
                        <inline-loading></inline-loading>
                    </div>
                    <div v-else>
                        <ul v-if="province.length!=0 && !provenceLoad">
                            <li v-for=" (provinceChild,index) in province" :key="index"
                                :class="{allactive : provenceIndex===index}"
                                @click="getCity(provinceChild,index)" style="cursor: pointer">
                                {{provinceChild}}
                            </li>

                        </ul>
                        <p class="disabled-text" v-else>{{'follower.noProvince' | t}}</p>
                    </div>
                </div>
                <div class="dis-content" v-else-if="active==2">
                    <div v-if="cityLoad">
                        <inline-loading></inline-loading>
                    </div>
                    <div v-else>
                        <ul v-if="city.length!=0 && !cityLoad">
                            <li v-for="(cityChild,index) in city" :key="index"
                                :class="{allactive : cityIndex===index}"
                                @click="getCityIndex(cityChild,index)" style="cursor: pointer">
                                {{cityChild}}
                            </li>
                        </ul>
                        <p class="disabled-text" v-else>{{'follower.noCity' | t}}</p>
                    </div>
                </div>
                <div class="dis-footer">
                    <button type="button" class="btn btn-theme btn-md button" @click="add">{{'follower.add' | t}}</button>
                </div>
                <svg aria-hidden="true" class="iconPosition" @click="close">
                    <use xlink:href="#icon-round-close"></use>
                </svg>
            </div>
        </transition>
    </div>
</template>
<script>
    import { WechatApiV1 } from '@/api';

    export default {
        name: 'address-select',
        data() {
            return {
                showDistrict: false,
                load: false,
                provenceLoad: false,
                cityLoad: false,
                district: [this.$t('follower.country'), this.$t('follower.province'), this.$t('follower.city')],
                active: 0,
                city: [],
                country: [],
                province: [],
                provenceIndex: null,
                cityIndex: null,
                countryIndex: null,
                sendCountry: '',
                sendProvence: '',
                sendCity: '',
            };
        },
        methods: {
            getProvence(e, index) {
                this.provenceLoad = true;
                this.province = [];
                this.city = [];
                this.sendProvence = '';
                this.sendCity = '';
                this.provenceIndex = '';
                this.countryIndex = index;
                this.sendCountry = e;
                //                获取省份
                WechatApiV1.getProvinceList(e).then(res => {
                    this.province = res.body.data.provinceList;
                    this.provenceLoad = false;
                });
                //
                this.getindex(1);
            },
            getCity(e, index) {
                this.cityLoad = true;
                this.cityIndex = '';
                this.city = [];
                this.sendCity = '';
                this.provenceIndex = index;
                this.sendProvence = e;
                WechatApiV1.getCityList(e).then(res => {
                    this.city = res.body.data.cityList;
                    this.cityLoad = false;
                });

                //               this.ProvenceRepetition.push(this.sendProvence);
                //                this.sendDataProvence=[...new Set(this.ProvenceRepetition)];
                ////                this.sendDataProvence.push(this.sendProvence);
                //                this.ProvenceString = this.sendDataProvence.join(',');
                this.getindex(2);
            },
            //获取当前的city index
            getCityIndex(e, index) {
                this.cityIndex = index;
                this.sendCity = e;
                //                this.CityRepetition.push(this.sendCity);
                //                this.sendDataCity=[...new Set(this.CityRepetition)];
                //                this.CityString = this.sendDataCity.join(',');
            },
            getindex(index) {
                this.active = index;
            },
            // 添加地区
            add() {
                if (this.sendCountry + this.sendProvence + this.sendCity === '') {
                    return;
                }
                this.$emit('select', this.sendCountry, this.sendProvence, this.sendCity);
                this.showDistrict = false;
            },
            toggle() {
                if (this.showDistrict) {
                    this.showDistrict = false;
                } else {
                    this.showDistrict = true;
                    this.load = false;
                    this.country = [];
                    this.province = [];
                    this.city = [];
                    this.active = 0;
                    this.provenceIndex = '';
                    this.cityIndex = '';
                    this.countryIndex = '';
                    WechatApiV1
                        .getCountryList()
                        .then(({body: {data: {countryList}}}) => {
                            this.country = countryList;
                            this.load = true;
                        });
                }
            },
            close() {
                this.showDistrict = false;
            }
        }
    };
</script>
<style lang="scss">
    @import "../../common/scss/base/variables";
    @import "../../common/scss/base/mixin";

    .address-select {
        display: inline-block;
        position: relative;
        text-align: left;
        vertical-align: middle;
        width: 145px;

        /*选择地区代码结束*/
        .text {
            width: 150px;
            @include border-radius(4px);
            position: relative;
            display: block;
            @include box-sizing();
            padding-right: $input-field-height - 2px;
            height: $input-field-height;
            line-height: $input-field-height - 2px;
            border: 1px solid $form-border;
            text-indent: .8em;
            @include user-select(none);
            color: $disabled;
            background-color: white;
            cursor: pointer;

            &:hover {
                border-color: $theme;
            }

            &.active {
                border-color: $theme;
                @include box-shadow(0 1px 3px rgba($theme, .35));

                .select-icon:before {
                    border-top-color: $theme;
                }
            }

            .select-icon {
                height: $input-field-height - 2px;
                width: $input-field-height - 2px;
                position: absolute;
                top: 0;
                right: 0;
                font-size: 12px;
                color: $color-light-content;
            }
        }

        /*地区选择*/
        .district {
            position: absolute;
            left: 0;
            top: $input-field-height + 4px;
            width: 400px;
            border-radius: 4px;
            overflow: hidden;
            border: 1px solid $theme;
            background-color: white;
            z-index: $index-menu - 1;

            .allactive {
                background-color: #ecf4f2;
            }
            .iconPosition {
                position: absolute;
                width: 16px;
                height: 16px;
                fill: white;
                right: ($input-field-height - 16px)/2;
                top: ($input-field-height - 16px)/2;
                cursor: pointer;
            }

            .dis-head {
                cursor: pointer;
                height: $input-field-height;
                background-color: $theme;
                color: #fff;

                .dis-tab {
                    text-align: center;
                    width: 70px;
                    height: 32px;
                    line-height: 32px;
                    float: left;
                    &.active {
                        background-color: #fff;
                        color: #0cc2a9;
                    }
                }
            }

            .dis-content {
                height: 207px;
                padding: 16px 8px;
                overflow-y: auto;

                ul {
                    li {
                        color: #666;
                        line-height: 36px;
                        height: 36px;
                        padding-left: 10px;
                        width: 370px;
                        &:hover {
                            background-color: #ecf4f2;
                        }
                    }
                }
            }

            .dis-footer {
                height: 46px;
                background-color: #ecf4f2;
                position: relative;

                .button {
                    width: 90px;
                    height: 30px;
                    line-height: 30px;
                    position: absolute;
                    top: 8px;
                    right: 10px;
                }
            }
        }
    }
</style>