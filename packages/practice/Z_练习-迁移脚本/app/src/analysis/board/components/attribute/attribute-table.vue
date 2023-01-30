<template>
    <div class="overview-table-content">
        <div class="overview-table">
            <div class="search-box">
                <div class="table-search">
                    <div class="search-box md">
                        <input type="text" placeholder="筛选列" v-model.trim="copyListKeyWord"
                               @keyup.enter="immediatelySearch" @input="lazySearchKeyword()">
                        <svg aria-hidden="true" v-if="copyListKeyWord !== ''" @click="clearKeyWord('column')">
                            <use xlink:href="#icon-round-close"></use>
                        </svg>
                        <svg aria-hidden="true" @click="immediatelySearch">
                            <use xlink:href="#icon-search"></use>
                        </svg>
                    </div>

                    <div class="search-box md" v-if="dataGroup.length > 1">
                        <input type="text" placeholder="筛选行" v-model.trim="copyTitleKeyWord"
                               @keyup.enter="immediatelySearch" @input="lazySearchKeyword()">
                        <svg aria-hidden="true" v-if="copyTitleKeyWord !== ''" @click="clearKeyWord('row')">
                            <use xlink:href="#icon-round-close"></use>
                        </svg>
                        <svg aria-hidden="true" @click="immediatelySearch">
                            <use xlink:href="#icon-search"></use>
                        </svg>
                    </div>
                </div>
            </div>
            <div class="table-box" v-show="!dataEmpty">
                <div class="table-content" ref="table"></div>
            </div>

            <block-empty v-if="dataEmpty"/>

            <div class="pages-text">最多展示100条数据</div>
        </div>
    </div>

</template>
<script>
    /**
     * sendObj
     * @param measures
     * @param byFields
     * @param unit
     * @param filter
     * @param byFieldsFilter
     */

    /**
     * change
     * @param measures
     * @param byFields
     * @param byFieldsFilter
     */
    /*
    * 外部组件通过this.$refs.xxx.setDate(data)传入数据;
    * */
    import {addArrow, originalHorizontalTable} from '../../../attribute-analysis/table-handle';
    import MegaTable from '../../../../common/utils/MegaTable';
    import debounce from 'lodash/debounce';

    // 表格行列筛选功能使用
    const lazySearchKeyword = debounce(function (async) {
        this.searchKeyWord(async);
    }, 3000);
    export default {
        name: '',
        model: {
            prop: 'value',
            event: 'change'
        },
        props: {
            sendObj: Object
        },
        computed: {
            measures() {
                return this.sendObj.measures;
            },
            byFields() {
                return this.sendObj.byFields;
            }
        },
        data() {
            return {
                _table: null,
                copyTitleKeyWord: '',
                copyListKeyWord: '',
                allReportData: {},
                isSendSearchKeyWord: false,
                listKeyWord: '',
                titleKeyWord: '',
                listKeyWordCache: '',
                titleKeyWordCache: '',
                sortValue: 'asc',
                dataEmpty: false,
            };
        },
        methods: {

            setDate(originalData) {
                if (originalData.rows.length === 0) return;
                this.allReportData = originalData;
                this.dataEmpty = originalData.rows.length === 0;
                let fieldNames = this.byFields.map(list => list.attrName);
                let measureNames = this.measures.map(list => list.attrName);
                let horizontalTable = [];
                let _this = this;
                // 默认表格：上侧多出1行表头+1行合计、左侧多出1列表头
                horizontalTable = originalHorizontalTable(fieldNames, measureNames, originalData);
                if (!this._table) {
                    this._table = new MegaTable(this.$refs.table, {
                        className: 'table',
                        data: horizontalTable,
                        clickHandler: function (cell, {col, row, /*data*/}) {
                            if (row === 0 && col === 0) {
                                _this.sortValue = _this.sortValue === 'asc' ? 'desc' : 'asc';
                                _this.$set(_this.byFields[0], 'order', _this.sortValue);
                                _this.$emit('change', {
                                    byFields: _this.byFields,
                                    measures: _this.measures,
                                    byFieldsFilter: _this.sendObj.byFieldsFilter
                                });
                            }
                        }
                    });
                } else {
                    this._table.setData(horizontalTable);
                }
                addArrow(this.$refs.table.getElementsByTagName('table')[0].rows[0].cells[0], this.sortValue);
            },
            clearKeyWord(direction) {
                let async = true;
                if (direction === 'row') {
                    this.copyTitleKeyWord = '';
                } else {
                    this.copyListKeyWord = '';
                }
                if (!this.allReportData.truncated && !this.isSendSearchKeyWord) {
                    async = false;
                }
                this.lazySearchKeyword(async);
            },
            immediatelySearch() {
                if (lazySearchKeyword.cancel) lazySearchKeyword.cancel();
                this.searchKeyWord();
            },
            lazySearchKeyword: lazySearchKeyword,
            // 筛选行、列
            searchKeyWord(_async) {
                let async = true;
                if (_async !== undefined) {
                    async = _async;
                } else {
                    if (this.allReportData.truncated) { // 现有数据为部分数据
                        async = true;
                    } else {
                        if (this.isSendSearchKeyWord) {
                            if (this.copyListKeyWord.includes(this.listKeyWord)
                                && this.copyTitleKeyWord.includes(this.titleKeyWord)) {
                                async = false;
                            }
                        } else {
                            if (this.copyListKeyWord.includes(this.listKeyWordCache)
                                && this.copyTitleKeyWord.includes(this.titleKeyWordCache)) {
                                async = false;
                            }
                        }
                    }
                }

                this.listKeyWord = this.copyListKeyWord;
                this.titleKeyWord = this.copyTitleKeyWord;

                let byFieldsFilter = [this.listKeyWord, this.titleKeyWord];
                if (async) {
                    this.isSendSearchKeyWord = true;
                }
                this.$emit('change', {
                    byFields: this.byFields,
                    measures: this.measures,
                    byFieldsFilter: byFieldsFilter,
                    reportType: 'reportChart'
                });
            },

        },
        watch: {},
    };
</script>
<style lang="scss" type="text/scss" rel="stylesheet/scss">
    @import "../../../../common/scss/components/overview-table";
</style>
