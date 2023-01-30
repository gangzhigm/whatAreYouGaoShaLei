<template>
    <transition-group name="list" mode="in-out" tag="div" class="report-source" v-blur="close">
        <div class="journey-tag" v-for="(j, index) in selectedJourneys" :key="j.id" :title="j.journeyName">
            {{j.name}}<i class="icon icon-close" @click="remove(j, index)"></i>
        </div>
        <div class="journey-select" key="picker">
            <label class="icon icon-plus" @click="toggle">&nbsp; {{'data.addReportSource' | t}}</label>
            <transition name="drop">
                <ul class="journey-list" v-if="open" v-load="fetchMore">
                    <li class="search-field" @click.stop>
                        <input type="text" ref="search" v-model.trim="search"
                               :placeholder="$t('journey.searchKeyword') + '…'" autofocus
                               @keydown.enter="searchReports" @input="searchReports">
                        <span class="icon icon-search" @click="searchReports"></span>
                    </li>
                    <li v-for="(journey, index) in journeys" :title="journey.name" >
                        <input type="text" readonly :value="journey.name"
                               :class="{selected: value.includes(journey.id)}"
                               @mousedown="choose(journey)">
                    </li>
                    <li v-if="journeys.length==0" class="disabled-text">暂无数据源</li>
                </ul>
            </transition>
        </div>
    </transition-group>
</template>
<script type="text/babel">
    import { JourneyApiV2 } from '@/api';
    import debounce from 'lodash/debounce';


    export default {
        props: {
            value: Array,
            dateRange: {
                type: Object,
                required: false,
            }
        },
        data() {
            return {
                open: false,
                journeys: [],
                search: '',
                pageNumber: 1,
                totalPage: Infinity,
                loading: false,
                selectedJourneys: []
            };
        },
        async mounted() {
            // recover all selected journeys
            let selected = [];
            do {
                const partial = await this.fetchMore();
                if (this.value.length && partial && partial.length) {
                    const partialSelected = partial.filter(journey => this.value.includes(journey.id));
                    selected = selected.concat(partialSelected);
                }
            } while (this.value.length > selected.length && this.pageNumber <= this.totalPage);
            this.selectedJourneys = selected;
            // emit update event with all the journey selected, so the campaignIds and names get recovered too.
            this.$emit('update', this.selectedJourneys);
        },
        beforeDestroy() {
            this.close();
        },
        methods: {
            toggle() {
                this.open = !this.open;
            },
            close() {
                this.open = false;
            },
            // 选择一个列表项
            choose(journey) {
                if (this.value.length >= 5) {
                    this.$toast('同时最多选择 5 个旅程', 'warn');
                    return;
                }
                if (!this.value.includes(journey.id)) {
                    this.selectedJourneys.push(journey);
                    this.$emit('input', this.value.concat(journey.id));
                    this.$emit('update', this.selectedJourneys);
                }
                this.open = false;
            },
            remove(journey, index) {
                const i = this.value.indexOf(journey.id),
                    copy = this.value.slice();
                copy.splice(i, 1);
                this.selectedJourneys.splice(index, 1);
                this.$emit('input', copy);
                this.$emit('update', this.selectedJourneys);
            },
            searchReports: debounce(function () {
                this.pageNumber = 1;
                this.totalPage = Infinity;
                this.journeys = [];
                this.fetchMore();
            }, 500),
            async fetchMore() {
                if (this.loading) return;
                if (this.pageNumber > this.totalPage) return;
                this.loading = true;
                try {
                    const search = this.search;
                    let dates = this.dateRange && this.dateRange.dates.length > 0 ? 
                            this.dateRange.dates : null,
                        startDate = this.dateRange && this.dateRange.startDate || null,
                        endDate = this.dateRange && this.dateRange.endDate || null;
                    const {body: {data: {journeyTemplateList, totalPage}}} =
                        await JourneyApiV2.getJourneys(dates, endDate, null, this.pageNumber++, search, startDate);
                    if (search === this.search) {
                        this.journeys = this.journeys.concat(journeyTemplateList);
                        this.totalPage = totalPage;
                    }
                    this.$nextTick(() => {
                        this.loading = false;
                    });
                    return journeyTemplateList;
                } catch (err) {
                    this.pageNumber--;
                    this.$nextTick(() => {
                        this.loading = false;
                    });
                }
            }
        },
        watch: {
            // 每次显示旅程列表时，清空已存在的关键字，并显示全部旅程
            open(val) {
                if (val) {
                    this.pageNumber = 1;
                    this.totalPage = Infinity;
                    this.journeys = [];
                    this.search = '';
                    this.fetchMore();
                }
            },
            dateRange: {
                handler(value) {
                    if (value.dates && value.dates.length > 0) {
                        this.pageNumber = 1;
                        this.totalPage = Infinity;
                        this.fetchMore();
                    }
                },
                deep: true
            }
        }
    };
</script>
<style lang="scss" type="text/scss" rel="stylesheet/scss">

    @import '../../../../common/scss/base/variables';
    @import '../../../../common/scss/base/mixin';

    $option-height: $input-field-height;
    .report-source {
        display: inline-block;
        margin-left: 10px;
        vertical-align: top;

        .journey-select {
            display: inline-block;
            margin-left: 10px;
            line-height: $input-field-height;
            position: relative;
            z-index: 1;

            .icon-plus {
                color: $theme;
                cursor: pointer;
                @include user-select(none);

                &:hover {
                    text-decoration: underline;
                }

                &:active {
                    color: $dark-theme;
                }
            }

            .journey-list {
                position: absolute;
                z-index: 1;
                @include box-sizing();
                max-width: 400px;
                min-width: 200px;
                top: $option-height;
                left: 0;
                max-height: $option-height * 5 + 6px;
                overflow: auto;
                padding: 3px 10px;
                border: 1px solid $border-color;
                border-radius: 2px;
                background-color: white;
                @include box-shadow(0 3px 3px rgba(#030000, .07));
                @include transform-origin(top);
                .disabled-text {
                    color: $disabled;
                    font-style: italic;
                }
            }

            .search-field {
                position: relative;
                margin: 3px 0;

                .icon-search {
                    $offset: ($option-height - 14px) / 2;
                    position: absolute;
                    width: $option-height - 2px;
                    height: $option-height - 2px;
                    line-height: $option-height - 2px;
                    text-align: center;
                    border-top-right-radius: 2px;
                    border-bottom-right-radius: 2px;
                    right: 1px;
                    top: 1px;
                    font-size: 14px;
                    background-color: white;
                }
            }

            li {
                display: block;
                height: $option-height;
            }

            input[type='text'] {
                display: block;
                @include box-sizing();
                width: 100%;
                padding: 0 1em;
                text-align: left;
                color: $color-light-content;
                @include ellipsis();

                &[readonly] {
                    border: 0;
                    cursor: pointer;
                    line-height: $option-height;

                    &:hover {
                        color: $color-content;
                        background-color: #fafafa;
                    }

                    &.selected {
                        color: $dark-theme;
                        background-color: #f0f0f0;
                    }
                }

                &:not([readonly]) {
                    border: 1px solid #e0e0e0;
                    padding: 7px 8px 8px;
                    line-height: $option-height - 17px;
                    border-radius: 2px;

                    &:focus {
                        border-color: $border-color;
                    }
                }
            }
        }

        .journey-tag {
            display: inline-block;
            position: relative;
            line-height: 24px;
            vertical-align: top;
            max-width: 8em;
            @include ellipsis();
            margin: ($input-field-height - 24px - 2px)/2;
            padding: 0 25px 0 10px;
            border-radius: 3px;

            &.list-enter {
                @include transform(translateY(100px));
            }

            &:nth-of-type(1) {
                border: 1px solid #0bb8d8;
                background-color: #d2f0f7;
            }
            &:nth-of-type(2) {
                border: 1px solid #84e1d6;
                background-color: #e6f9f7;
            }
            &:nth-of-type(3) {
                border: 1px solid #6347c2;
                background-color: #e0daf2;
            }
            &:nth-of-type(4) {
                border: 1px solid #ffa664;
                background-color: #ffc9a5;
            }
            &:nth-of-type(5) {
                border: 1px solid #cccccc;
                background-color: #f7f7f7;
            }
        }

        .icon-close {
            position: absolute;
            top: 6px;
            right: 5px;
            width: 12px;
            height: 12px;
            line-height: 12px;
            color: $color-light-content;
            cursor: pointer;
            @include transform(scale(.9));

            &:hover {
                color: $color-content;
            }
        }
    }

</style>
