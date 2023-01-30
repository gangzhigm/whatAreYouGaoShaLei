<template>
    <div class="single-selector">
        <selector class="xl" v-model="couponSelected" :options="members" @select="getCouponSelected"></selector>

        <div class="select-check-box" v-blur="hideList" v-if="couponSelected > 1">
            <div class="select-check-item" @click="toggle">
                <div class="value-item" v-for="item in chooseList" :key="item.id">
                    <div class="value-item-text" :title="getShowText(item)">{{getShowText(item)}}</div>
                    <button @click.stop="cleanItem(item.id)" ref="button" tabindex="-1" class="icon icon-close"></button>
                </div>
            </div>
            <transition name="drop">
                <div class="select-check-list" v-show="switchList">
                    <label class="search-field">
                        <input type="text" :placeholder="searchPlaceholder" autofocus v-model.trim="keyword"
                               :disabled="loading" @keyup.enter="updateSearch" ref="searchInput">
                        <svg class="search-icon" aria-hidden="true">
                            <use xlink:href="#icon-search"></use>
                        </svg>
                    </label>
                    <div class="form-field flex flex-direction-column select-check-form">
                        <inline-loading v-if="loading" offset="md"></inline-loading>
                        <template v-else>
                            <div class="configuration-module-license" v-for="item in showList" :key="item.id">
                                <checkbox v-model="selshowList" :source="item.id" :disabled="false" @input="choose">
                                    {{getShowText(item)}}
                                </checkbox>
                            </div>
                        </template>
                    </div>
                </div>
            </transition>
        </div>
    </div>
</template>
<script type="text/babel">
    import { DepartmentApiV1 } from '@/api';
    import {debounce} from 'lodash';

    export default {
        computed: {
            searchPlaceholder() {
                return this.$t('board.searchKeywords') + ' , ' + this.$t('material.enterToSearch');
            }
        },
        data() {
            return {
                switchList: false, // 下拉列表显隐开关
                couponSelected: '',// 当前对象选择项
                keyword: '', // 搜索关键字
                showList: [], // 当前总数据
                selshowList: [], // 当前选中项
                allShowList: [], // 全部数据
                chooseList: [], // 转换后的当前选中的数据
                members: [
                    {id: 1, name: this.$t('material.allMembers')},
                    {id: 2, name: this.$t('material.someMembers')},
                    {id: 3, name: this.$t('material.someDepartments')},
                    {id: 4, name: this.$t('material.partialSecurityGroup')},
                ],
                loading: false
            };
        },
        methods: {
            // 按下了搜索，搜索数据
            updateSearch: debounce(function () {
                const KEY_WORD = this.keyword;
                this.getModelList(KEY_WORD);
            }, 500),
            // 返回了显示的文案
            getShowText(item) {
                switch (parseInt(this.couponSelected)) {
                    case 2:
                        return item.email;
                    case 3:
                        return item.departmentName;
                    case 4:
                        return item.cName;
                }
                return '';
            },
            // 选项列表显示、隐藏
            toggle() {
                this.switchList = !this.switchList;
            },
            // 隐藏选项列表
            hideList() {
                this.switchList = false;
            },
            // 清除当前选中项
            cleanItem(id) {
                this.selshowList = this.selshowList.filter(item => item !== id);
                this.choose();
            },
            // 更新选中项
            choose() {
                this.chooseList = this.allShowList.filter(
                    item => this.selshowList.some(itemId => itemId === item.id) === true);
                this.$emit('getMemberChooseList', [this.couponSelected, this.selshowList]);
            },
            // 获取共享分类
            getCouponSelected() {
                this.keyword = '';
                this.showList = [];
                this.chooseList = [];
                this.selshowList = [];
                this.getModelList();
            },
            // 获取成员列表
            getModelList(KEY_WORD = '') {
                this.loading = true;
                this.$emit('getMemberChooseList', [this.couponSelected, this.selshowList]);
                const self = this;
                switch (parseInt(this.couponSelected)) {
                    case 2:
                        DepartmentApiV1
                            .searchUserByCompanyId(KEY_WORD)
                            .then((res) => {
                                self.showList = res.body.data.userList;
                                if (self.allShowList.length === 0) {
                                    self.allShowList = res.body.data.userList;
                                }
                                res.body.data.userList.filter(item => {
                                    if (self.allShowList.findIndex(items => items.id === item.id) < 0) {
                                        self.allShowList.push(item);
                                    }
                                });
                                this.doneRequest();
                            })
                            .catch((res) => {
                                self.showList = res.body.data.userList ? res.body.data.userList : [];
                                this.doneRequest();
                            });
                        break;
                    case 3:
                        DepartmentApiV1
                            .searchDepartmentByCompanyId(KEY_WORD)
                            .then((res) => {
                                self.showList = res.body.data.departmentList;
                                if (self.allShowList.length === 0) {
                                    self.allShowList = res.body.data.departmentList;
                                }
                                res.body.data.departmentList.filter(item => {
                                    if (self.allShowList.findIndex(items => items.id === item.id) < 0) {
                                        self.allShowList.push(item);
                                    }
                                });
                                this.doneRequest();
                            })
                            .catch((res) => {
                                self.showList = res.body.data.departmentList ? res.body.data.departmentList : [];
                                this.doneRequest();
                            });
                        break;
                    case 4:
                        DepartmentApiV1
                            .searchRoleByCompanyId(KEY_WORD)
                            .then((res) => {
                                self.showList = res.body.data.roleList;
                                if (self.allShowList.length === 0) {
                                    self.allShowList = res.body.data.roleList;
                                }
                                res.body.data.roleList.filter(item => {
                                    if (self.allShowList.findIndex(items => items.id === item.id) < 0) {
                                        self.allShowList.push(item);
                                    }
                                });
                                this.doneRequest();
                            })
                            .catch((res) => {
                                self.showList = res.body.data.roleList ? res.body.data.roleList : [];
                                this.doneRequest();
                            });
                        break;
                }
            },
            doneRequest() {
                this.loading = false;
                this.$nextTick(() => {
                    this.$refs.searchInput.focus();
                });
            }
        }
    };

</script>
<style lang="scss" type="text/scss" rel="stylesheet/scss">
    @import "../../common/scss/base/variables";
    @import "../../common/scss/base/mixin";

    .single-selector {
        .value-item {
            display: inline-block;
            border: 1px solid $purple;
            margin-right: 10px;
            margin-bottom: 4px;
            padding-left: 5px;
            border-radius: 3px;
            cursor: pointer;
            white-space: nowrap;
            @include transition();
            background-color: #f2f0ff;
            color: $purple;

            &:hover {
                background-color: #dbd5fb;
            }

            .value-item-text {
                display: inline-block;
                vertical-align: middle;
                max-width: 260px;
                @include ellipsis();
            }

            button {
                padding: 0 3px;
                cursor: pointer;
                border: 1px solid transparent;
                line-height: 18px;
                border-bottom-right-radius: 3px;
                border-top-right-radius: 3px;
                color: $purple;
                background-color: transparent;
                @include transition();

                &:hover {
                    background-color: #ef6266;
                    color: white;
                }
            }
        }

        .search-field {
            display: block;
            position: relative;
            height: $input-field-height;
            border-bottom: 1px solid $select-border;
            background-color: $title-bg;
            color: $color-light-content;

            input {
                @include box-sizing();
                height: $input-field-height;
                padding: 0 8px 0 30px;
                width: 100%;
                border: none;
                background-color: transparent;

                &:hover {
                    background-color: $select-bg;
                }

                &:focus {
                    background-color: white;
                }

                &:disabled {
                    background-color: #f0f2f5;
                    pointer-events: unset;
                }
            }

            .search-icon {
                position: absolute;
                left: 10px;
                width: 14px;
                height: 14px;
                fill: $disabled;
                top: ($input-field-height - 14px)/2;
            }
        }

        .org-member-form {
            .create-title {
                font-size: 16px;
                height: 48px;
                line-height: 48px;
                padding: 0 20px;
                border: 1px solid $select-border;
                position: relative;

                .save-btn {
                    position: absolute;
                    right: 20px;
                    top: 9px;
                }
            }

            .create-content {
                width: 800px;
                margin: auto;
                padding-top: 50px;
                @include box-sizing();
            }

            .field-group-label {
                font-size: 14px;
                font-weight: bold;
                padding-left: 65px;
                margin-top: 0.5em;
                margin-bottom: 0.5em;
            }

            .flex-direction-column {
                flex-direction: column;
            }

            .configuration-module-license {
                margin-left: 126px;
            }

            .login-name {
                display: inline-block;
                width: 670px;
            }

            .resetPwd {
                cursor: pointer;
                color: $green;
                margin-left: 16px;
            }

            .reset-pwd-field {
                label.checkbox {
                    margin-right: 10px;
                }
            }
        }

        .flex {
            flex-direction: column;
        }

        .member-select-el {
            margin: 10px 0;
            padding: 4px;
            height: 30px;
            display: inline-block;
            position: relative;
            text-align: left;
            vertical-align: middle;
            width: 145px;
            color: #595959;
        }

        .select-check-box {
            width: 277px;
            position: relative;
            margin-top: 8px;
        }

        .select-check-item {
            border: 1px solid $border-color;
            padding: 10px;
            min-height: 8px;
            max-height: 100px;
            overflow-y: auto;
            @include border-radius(4px);
        }

        .select-check-list {
            position: absolute;
            width: 100%;
            height: 200px;
            background: #fff;
            border: 1px solid $border-color;
            border-top: 0;
            box-sizing: border-box;
            overflow: hidden;
        }

        .select-check-form {
            background: #fff;
            width: 100%;
            padding: 4px;
            margin: 0;
            box-sizing: border-box;
            height: 168px;
            overflow-y: auto;
            text-overflow: ellipsis;
            white-space: nowrap;
        }
    }
</style>
