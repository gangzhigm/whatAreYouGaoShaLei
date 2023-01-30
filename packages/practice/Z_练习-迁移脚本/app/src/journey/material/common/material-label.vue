<template>
    <div class="material-label" v-if="expanded">
        <div class="field">
            <label class="label">
                Program
                <span class="star">*</span>
            </label>
            <selector :class="{error: error.program}" slot="name" :options="programs" v-model="programLabel.id"
                      :title="programLabel.name" v-title:top.line.warn="error.program" @focus="error.program"
                      @select="selectLabel($event,'Program')"></selector>
        </div>
        <div class="field">
            <label class="label">Content
                <span class="star">*&nbsp;&nbsp;</span>
            </label>
            <selector slot="name" :class="{error: error.content}" :options="contents" v-model="contentLabel.id"
                      :title="contentLabel.name" v-title:top.line.warn="error.content" @focus="error.content"
                      @select="selectLabel($event,'Content')"></selector>
        </div>
        <div class="field" :class="{mt: screenW < 1300}">
            <label class="label">
                Campaign
                <span class="star">*</span>
            </label>
            <selector slot="name" :class="{error: error.campaign}" :options="campaigns" v-model="campaignLabel.id"
                      :title="campaignLabel.name" v-title:top.line.warn="error.campaign" @focus="error.campaign"
                      @select="selectLabel($event,'Campaign')"></selector>
        </div>
        <div class="field">
            <label class="label">
                Language
                <span class="star">*</span>
            </label>
            <selector slot="name" search :class="{error: error.language}" :options="languages"
                      v-model="languageLabel.id"
                      :title="languageLabel.name" v-title:top.line.warn="error.language" @focus="error.language"
                      @select="selectLabel($event,'Language')"></selector>
        </div>
        <!--内容标签-->
        <div class="field">
            <label class="label">
                {{'material.contentLabel' | t}}
            </label>
            <content-label-selector v-if="requestDone" class="ml-selector" v-model="contentLabels"
                                    @input="selectContentTags"></content-label-selector>
        </div>
        <div class="field">
            <div class="preview" @click="previewLabel">
                <svg class="nav-link-group-arrow" aria-hidden="true">
                    <use xlink:href="#icon-eye"></use>
                </svg>
            </div>
        </div>
    </div>
</template>

<script>
    import { JourneyMaterialApiV1 } from '@/api';
    import contentLabelSelector from './content-label-selector.vue';
    import debounce from 'lodash/debounce';
    import {differenceBy} from 'lodash';

    export default {
        name: 'material-label', // 华为cdp标签
        components: {
            contentLabelSelector
        },
        props: {
            // 显示
            expanded: {
                type: Boolean,
                default: true,
            },
            value: {
                type: Array,
                required: true
            },
            // 错误提示
            error: {
                type: Object,
                required: true
            },
            allTags: {
                type: Array,
            }
        },
        data() {
            return {
                selectList: [{id: 0, name: this.$t('tag.select')}], // 请选择
                programs: [], // Program
                topProgramLabel: { // Program顶级标签
                    id: '',
                    name: '',
                },
                topContentLabel: { // Content顶级标签
                    id: '',
                    name: '',
                },
                topCampaignLabel: { // Campaign顶级标签
                    id: '',
                    name: '',
                },
                topLanguageLabel: {// Language顶级标签
                    id: '',
                    name: '',
                },
                programLabel: { // 选中的Program标签
                    id: '',
                    name: '',
                },
                contents: [], // Content
                contentLabel: { // 选中的Content标签
                    id: '',
                    name: '',
                },
                campaigns: [], // Campaign
                campaignLabel: { // 选中的Campaign标签
                    id: '',
                    name: '',
                },
                languages: [], // Language
                languageLabel: {// 选中的Language标签
                    id: '',
                    name: '',
                },
                contentLabels: [], // 内容标签,
                requestDone: false,
                screenW: 0,
                industry: {}, // 行业标签
                product: {},  // 产品标签
                solution: {}, // 解决方案标签
                othersTopicTags: [],
                topicId: null
            };
        },
        mounted() {
            this.fetchLabels();
            this.screenW = document.body.clientWidth;
            window.addEventListener('resize', this.resize, false);

            // otherList 行业标签，产品标签，解决方案标签，
            JourneyMaterialApiV1
                .getLabelList('', 'other')
                .then(res => {
                    let otherList = res.body.data.labelList;
                    this.industry = otherList.filter(o => o.name === '行业标签' || o.name === 'Industry Tag')[0];
                    this.product = otherList.filter(o => o.name === '产品标签' || o.name === 'Product Tag')[0];
                    this.solution = otherList.filter(o => o.name === '解决方案标签' || o.name === 'Solution Tag')[0];
                });
        },
        destroyed() {
            this.programs = [];
            window.removeEventListener('resize', this.resize, false);
        },
        methods: {
            /**
             * 获取标签列表
             */
            async fetchLabels() {
                const program = await JourneyMaterialApiV1.getLabelList('', 'Program', '');
                const Campaign = await JourneyMaterialApiV1.getLabelList('', 'Campaign', '');
                const Content = await JourneyMaterialApiV1.getLabelList('', 'Content', '');
                const Language = await JourneyMaterialApiV1.getLabelList('', 'Language', '');

                this.topProgramLabel = program.body.data.labelList[0];
                this.programs = this.selectList.concat(program.body.data.labelList[0].childList);

                this.contents = this.selectList.concat(Content.body.data.labelList[0].childList);
                this.topContentLabel = Content.body.data.labelList[0];

                this.topCampaignLabel = Campaign.body.data.labelList[0];
                this.campaigns = this.selectList.concat(Campaign.body.data.labelList[0].childList);

                this.languages = this.selectList.concat(Language.body.data.labelList[0].childList);
                this.topLanguageLabel = Language.body.data.labelList[0];

                // 标签回显
                if (this.value.length) {
                    // 必填项回显
                    this.programLabel.id = this.value.filter(elm => elm.topId === this.topProgramLabel.id)[0].id;
                    this.contentLabel.id = this.value.filter(elm => elm.topId === this.topContentLabel.id)[0].id;
                    this.campaignLabel.id = this.value.filter(elm => elm.topId === this.topCampaignLabel.id)[0].id;
                    this.languageLabel.id = this.value.filter(elm => elm.topId === this.topLanguageLabel.id)[0].id;
                    // 内容标签回显
                    this.showContentLabels();
                    // 联动
                    this.tagsLinkage(this.programLabel.id, 'Campaign', this.topCampaignLabel.id);
                    this.tagsLinkage(this.campaignLabel.id, 'Program', this.topProgramLabel.id);
                } else {
                    this.requestDone = true;
                }
            },
            /**
             * 选择标签
             * @param label 标签
             * @param type 类型
             */
            selectLabel(label, type) {
                let materialTags = this.value;
                switch (type) {
                    case 'Program':
                        if (label.id !== 0) {
                            this.programLabel.name = label.name;
                            this.tagsLinkage(label.id, 'Campaign', this.topCampaignLabel.id);
                        } else {
                            this.campaignLabel = {id: 0, name: this.$t('tag.select')};
                            this.tagsLinkage('', 'Campaign', '');
                            this.tagsLinkage('', 'Program', '');
                            materialTags = this.dataRange(materialTags, this.campaignLabel, this.topCampaignLabel);
                        }
                        materialTags = this.dataRange(materialTags, label, this.topProgramLabel);
                        break;
                    case 'Content':
                        this.contentLabel.name = label.name;
                        materialTags = this.dataRange(materialTags, label, this.topContentLabel);
                        break;
                    case 'Campaign':
                        if (label.id !== 0) {
                            this.campaignLabel.name = label.name;
                            this.tagsLinkage(label.id, 'Program', this.topProgramLabel.id);
                        } else {
                            this.programLabel = {id: 0, name: this.$t('tag.select')};
                            this.tagsLinkage('', 'Program', '');
                            this.tagsLinkage('', 'Campaign', '');
                            materialTags = this.dataRange(materialTags, this.programLabel, this.topProgramLabel);
                        }
                        materialTags = this.dataRange(materialTags, label, this.topCampaignLabel);
                        break;
                    case 'Language':
                        this.languageLabel.name = label.name;
                        materialTags = this.dataRange(materialTags, label, this.topLanguageLabel);
                        break;
                }

                this.$emit('input', materialTags);
            },
            /**
             *  处理选中数据
             *  @param originalData {array} 已选择的数据`
             *  @param label {Object} 当前选择的Label
             *  @param topLabel {Object} 当前选择的父级Label
             *  return {array} 返回所选择的数据
             */
            dataRange(originalData, label, topLabel) {
                let orIndex = originalData.findIndex(ids => ids.topId === topLabel.id);
                let addItem = {
                    id: label.id,
                    name: label.name,
                    parentId: topLabel.id,
                    topId: topLabel.id,
                    topName: topLabel.name,
                };
                if (orIndex > -1) {
                    originalData.splice(orIndex, 1, addItem);
                } else {
                    originalData.push(addItem);
                }
                return originalData;
            },
            // 预览
            previewLabel() {
                let programs = this.value.filter(v => v.topName === 'Program' && v.id !== 0);
                let contents = this.value.filter(v => v.topName === 'Content' && v.id !== 0);
                let campaigns = this.value.filter(v => v.topName === 'Campaign' && v.id !== 0);
                let languages = this.value.filter(v => v.topName === 'Language' && v.id !== 0);
                let labelList = [];
                // program 标签
                if (this.programLabel.id !== '' && this.programLabel.id !== 0 && programs.length > 0) {
                    labelList.push({
                        id: programs[0].topId,
                        name: programs[0].topName,
                        secondList: programs,
                    });
                }
                // content 标签
                if (this.contentLabel.id !== '' && this.contentLabel.id !== 0 && contents.length > 0) {
                    labelList.push({
                        id: contents[0].topId,
                        name: contents[0].topName,
                        secondList: contents,
                    });
                }
                // campaign 标签
                if (this.campaignLabel.id !== '' && this.campaignLabel.id !== 0 && campaigns.length > 0) {
                    labelList.push({
                        id: campaigns[0].topId,
                        name: campaigns[0].topName,
                        secondList: campaigns,
                    });
                }
                // language 标签
                if (this.languageLabel.id !== '' && this.languageLabel.id !== 0 && languages.length > 0) {
                    labelList.push({
                        id: languages[0].topId,
                        name: languages[0].topName,
                        secondList: languages,
                    });
                }
                // 内容标签
                labelList = this.previewContent(labelList);
                this.$viewLabel({material: {}, labelList});
            },
            // 选择内容标签
            selectContentTags() {
                let materialTags = this.value.filter(elm =>
                    elm.topId === this.topLanguageLabel.id || elm.topId === this.topCampaignLabel.id ||
                    elm.topId === this.topContentLabel.id || elm.topId === this.topProgramLabel.id);
                materialTags = materialTags.concat(this.contentLabels);
                this.$emit('input', materialTags);
            },
            // 内容标签回显
            showContentLabels() {
                if (this.topLanguageLabel.id && this.topCampaignLabel.id && this.topContentLabel.id
                    && this.topProgramLabel.id) {
                    this.contentLabels = this.value.filter(elm =>
                        elm.topId !== this.topLanguageLabel.id && elm.topId !== this.topCampaignLabel.id &&
                        elm.topId !== this.topContentLabel.id && elm.topId !== this.topProgramLabel.id);
                    this.requestDone = true;

                    let allOtherContentTags = this.allTags.filter(tag => tag.id !== this.topCampaignLabel.id &&
                        tag.id !== this.topContentLabel.id && tag.id !== this.topLanguageLabel.id &&
                        tag.id !== this.topProgramLabel.id);

                    // 筛选非当前账号，当前素材标签
                    let otherTopics = allOtherContentTags.filter(elm => elm.name === 'Topic tag');
                    let topics = this.value.filter(v => v.topName === 'Topic tag');
                    this.topicId = topics.length ? topics[0].topId : null;
                    this.othersTopicTags = otherTopics.length ? differenceBy(otherTopics[0].secondList, topics, 'id') : [];

                    this.$emit('getOthersTopicTags', this.othersTopicTags);
                } else {
                    setTimeout(() => {
                        this.showContentLabels();
                    }, 200);
                }
            },
            resize: debounce(function () {
                this.screenW = document.body.clientWidth;
            }, 100),

            // 必填项联动
            async tagsLinkage(id, type, linkageTopId) {
                const {body: {data: {labelList}}} = await JourneyMaterialApiV1.getLabelList(id, type, linkageTopId);

                if (type === 'Program') {
                    this.topProgramLabel = labelList[0];
                    this.programs = this.selectList.concat(labelList[0].childList);
                } else if (type === 'Campaign') {
                    this.topCampaignLabel = labelList[0];
                    this.campaigns = this.selectList.concat(labelList[0].childList);
                }
            },
            // 预览内容标签整合
            previewContent(labelList) {
                // 内容标签
                let industries = this.value.filter(v => v.topId === this.industry.id);  // 行业标签
                let products = this.value.filter(v => v.topId === this.product.id);     // 产品标签
                let solutions = this.value.filter(v => v.topId === this.solution.id);   // 解决方案标签
                let topics = this.value.filter(v => v.topName === 'Topic tag');    // Topic tag

                if (industries.length > 0) {
                    labelList.push({
                        id: this.industry.id,
                        name: this.industry.name,
                        secondList: industries,
                    });
                }
                if (products.length > 0) {
                    labelList.push({
                        id: this.product.id,
                        name: this.product.name,
                        secondList: products,
                    });
                }
                if (solutions.length > 0) {
                    labelList.push({
                        id: this.solution.id,
                        name: this.solution.name,
                        secondList: solutions,
                    });
                }
                if (topics.length > 0) {
                    let fusionTags = topics;
                    if (this.othersTopicTags.length) {
                        fusionTags = topics.concat(this.othersTopicTags);
                    }
                    labelList.push({
                        id: topics[0].topId,
                        name: topics[0].topName,
                        secondList: fusionTags
                    });
                } else if (this.othersTopicTags.length) {
                    labelList.push({
                        id: this.topicId,
                        name: 'Topic tag',
                        secondList: this.othersTopicTags
                    });
                }
                return labelList;
            }
        },
    };
</script>

<style lang="scss" type="text/scss" rel="stylesheet/scss">
    @import "../../../common/scss/base/variables";
    @import "../../../common/scss/base/mixin";

    $material-label-height: 90px;
    .material-label {
        position: relative;
        top: 8px;
        display: flex;
        flex-wrap: wrap;

        .ml-selector {
            margin-left: 14px;
        }

        .field {
            margin: 8px 32px 0 0;

            .star {
                color: $dark-red;
            }

            .selector {
                margin-left: 5px;
                width: 320px;
            }

            .preview {
                height: 32px;

                svg {
                    width: 15px;
                    height: 15px;
                    fill: $theme;
                }
            }
        }

        .selector.error .select-text {
            border-color: $light-red;
            background-color: rgba($light-red, .2);

            &:hover {
                border-color: $red;
            }

            &:focus {
                border-color: $dark-red;
                @include box-shadow(0 0 4px rgba($red, .35))
            }
        }

        .lang {
            margin-left: -8px;
        }
    }

</style>
