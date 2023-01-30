<template>
    <modal class="material-view-label" :title="title" size="lg" @close="close" v-if="visible">
        <inline-loading v-if="loading"/>
        <template v-else>
            <div class="views">
                <template v-for="topLabel in labelList">
                    <div class="view" :class="{expanded:!topLabel.expanded}">
                        <div class="view-left" :title="topLabel.name">{{topLabel.name}}</div>
                        <div class="view-right" ref="labelsHeightRef">
                            <div class="right-label" :class="{close: topLabel.showOpreate && !topLabel.expanded}"
                                 v-for="label in topLabel.secondList"
                                 :title="label.name">{{label.name}}
                            </div>
                        </div>
                        <div class="view-opreate" v-if="topLabel.showOpreate" @click="showLabel(topLabel)">
                            <svg class="nav-link-group-arrow" :class="{expanded: !topLabel.expanded}" aria-hidden="true">
                                <use xlink:href="#icon-arrow-down"></use>
                            </svg>
                            {{topLabel.expanded ? $t('material.collapse') : $t('material.more')}}
                        </div>
                    </div>
                </template>
                <div class="no-data" v-if="labelList.length <= 0">{{'common.noData' | t}}</div>
            </div>
            <div class="view-line"></div>
        </template>
        <template v-slot:buttons>
            <button type="button" class="btn btn-md btn-white" @click="close">{{'common.cancel' | t}}</button>
        </template>
    </modal>
</template>
<script type="text/babel">

    import { JourneyMaterialApiV1 } from '@/api';

    export default {
        data() {
            return {
                loading: true,  // loading
                visible: true, // 显示
                material: {},   // 素材
                labelList: [],  // 素材的标签
                industry: {}, // 行业标签
                product: {},  // 产品标签
                solution: {}, // 解决方案标签
            };
        },
        computed: {
            // 标签数量
            count() {
                let count = 0;
                if (this.labelList.length > 0) {
                    this.labelList.map(l => {
                        count += l.secondList ? l.secondList.length : 0;
                    });
                }
                return count;
            },
            title() {
                return this.$t('material.viewLabel') + '(' + this.count + ')';
            },
        },
        mounted() {
            this.initial();
        },
        watch: {
            visible(value) {
                if (value) {
                    this.initial();
                }
            }
        },
        methods: {
            // 显示标签
            showLabels() {
                this.loading = false;
                if (this.labelList && this.labelList.length > 0) {
                    this.labelList.map((topLabel, index) => {
                        this.$set(topLabel, 'expanded', false); // 更多、收起
                        this.$set(topLabel, 'showOpreate', false); // 显示按钮
                        this.$nextTick(() => {
                            let refs = this.$refs.labelsHeightRef;
                            if (refs[index].offsetHeight > 38) {
                                this.$set(topLabel, 'showOpreate', true); // 显示按钮
                            }
                        });
                    });
                }
            },
            // 预览
            previewLabel() {
                let labels = [];
                let programs = this.labelList.filter(v => v.topName === 'Program');
                let contents = this.labelList.filter(v => v.topName === 'Content');
                let campaigns = this.labelList.filter(v => v.topName === 'Campaign');
                let languages = this.labelList.filter(v => v.topName === 'Language');
                // program 标签
                if (programs.length > 0) {
                    labels.push({
                        id: programs[0].topId,
                        name: programs[0].topName,
                        secondList: programs,
                    });
                }
                // content 标签
                if (contents.length > 0) {
                    labels.push({
                        id: contents[0].topId,
                        name: contents[0].topName,
                        secondList: contents,
                    });
                }
                // campaign 标签
                if (campaigns.length > 0) {
                    labels.push({
                        id: campaigns[0].topId,
                        name: campaigns[0].topName,
                        secondList: campaigns,
                    });
                }
                // language 标签
                if (languages.length > 0) {
                    labels.push({
                        id: languages[0].topId,
                        name: languages[0].topName,
                        secondList: languages,
                    });
                }
                // 内容标签
                let industries = this.labelList.filter(v => v.topId === this.industry.id);  // 行业标签
                let products = this.labelList.filter(v => v.topId === this.product.id);     // 产品标签
                let solutions = this.labelList.filter(v => v.topId === this.solution.id);   // 解决方案标签
                let topics = this.labelList.filter(v => v.topName === 'Topic tag');    // Topic tag
                if (industries.length > 0) {
                    labels.push({
                        id: this.industry.id,
                        name: this.industry.name,
                        secondList: industries,
                    });
                }
                if (products.length > 0) {
                    labels.push({
                        id: this.product.id,
                        name: this.product.name,
                        secondList: products,
                    });
                }
                if (solutions.length > 0) {
                    labels.push({
                        id: this.solution.id,
                        name: this.solution.name,
                        secondList: solutions,
                    });
                }
                if (topics.length > 0) {
                    labels.push({
                        id: topics[0].topId,
                        name: topics[0].topName,
                        secondList: topics,
                    });
                }
                this.labelList = labels;
            },
            close() {
                this.labelList = [];
                this.visible = false;
            },
            /**
             * 展示、隐藏标签
             * @param topLabel 标签
             */
            showLabel(topLabel) {
                topLabel.expanded = !topLabel.expanded;
            },
            initial() {
                // otherList 行业标签，产品标签，解决方案标签，
                JourneyMaterialApiV1
                    .getLabelList('', 'other')
                    .then(res => {
                        let otherList = res.body.data.labelList;
                        this.industry = otherList.filter(o => o.name === '行业标签' || o.name === 'Industry Tag')[0];
                        this.product = otherList.filter(o => o.name === '产品标签' || o.name === 'Product Tag')[0];
                        this.solution = otherList.filter(o => o.name === '解决方案标签' || o.name === 'Solution Tag')[0];

                        // labelList 是否有secondList  有-eye预览  无-预览按钮预览
                        let formatData = this.labelList.every(l => l.secondList);
                        if (!formatData) { // 预览按钮预览
                            this.previewLabel();
                        }
                        this.showLabels();
                    });
            }
        }
    };
</script>
<style lang="scss">
    @import "../../../common/scss/base/variables";
    @import "../../../common/scss/base/mixin";

    .material-view-label {

        .views {
            height: 300px;
            overflow-y: auto;
            border: 1px solid $border-color;

            .no-data {
                position: absolute;
                text-align: center;
                top: 30%;
                left: 50%;
            }

            .view {
                display: flex;
                flex-wrap: wrap;
                margin-left: 8px;
                position: relative;

                &.expanded {
                    line-height: 32px;
                    overflow: hidden;
                    height: 32px;
                }

                &:not(.expanded) {
                    line-height: 32px;
                }

                .view-left {
                    width: 140px;
                }

                .view-right {
                    padding-left: 8px;
                    width: 720px;

                    .right-label {
                        display: inline-block;
                        line-height: 17px;
                        margin: 4px 4px 0 0;
                        padding: 4px;
                        border: 1px solid #826dee;
                        color: #826dee;
                        background-color: #f2f0ff;
                        @include border-radius(4px);
                    }

                    .close {
                        max-width: 150px;
                        @include ellipsis();
                    }
                }

                .view-opreate {
                    height: 32px;
                    cursor: pointer;
                    display: flex;
                    align-items: center;
                    position: absolute;
                    top: 0;
                    right: 8px;

                    svg {
                        width: 12px;
                        height: 12px;
                        fill: $disabled;
                        margin-right: 5px;

                        &:not(.expanded) {
                            @include transform(rotate(180deg));
                        }
                    }
                }
            }
        }

        .view-line {
            position: relative;
            top: -300px;
            margin-left: 8px;
            width: 140px;
            height: 300px;
            border-right: 1px solid $border-color;
        }
    }
</style>
