<template>
    <div class="invalid-template-list">
        <div class="table-head">
            {{'template.allTemplate' | t}}<span class="theme-text">&nbsp;{{totalRow}}&nbsp;</span>{{'template.count' | t}}
            <div class="pull-right search-box">
                <input type="text" :placeholder="$t('template.search')" v-model.trim="keyword">
                <svg aria-hidden="true">
                    <use xlink:href="#icon-search"></use>
                </svg>
            </div>
        </div>
        <div class="simplify-table auto-width">
            <table>
                <thead>
                <tr>
                    <!--<td><span>联系人ID</span></td>-->
                    <td><span>{{'template.order' | t}}</span></td>
                    <td><span>{{'template.id' | t}}</span></td>
                    <td><span>{{'template.title' | t}}</span></td>
                    <td><span>{{'template.industry' | t}}</span></td>
                    <td><span>{{'template.subIndustries' | t}}</span></td>
                    <td><span>{{'template.status' | t}}</span></td>
                    <td><span>{{'template.operation' | t}}</span></td>
                </tr>
                </thead>
                <tbody>
                <tr v-for="(TemplateList,index) in filteredTemplates">
                    <!--<td><span>{{contact.customerId}}</span></td>-->
                    <td><span>{{index+1}}</span></td>
                    <td><span>{{TemplateList.templateId}}</span></td>
                    <td><span>{{TemplateList.title}}</span></td>
                    <td><span>{{TemplateList.primaryIndustry}}</span></td>
                    <td><span>{{TemplateList.deputyIndustry}}</span></td>
                    <td v-if="TemplateList.status === 2">
                        <span class="icon icon-warn red-text">
                            <span style="color: #000000">{{'template.invalidId' | t}}</span>
                        </span>
                    </td>
                    <td>
                        <svg class="action-icon icon-search" @click="gotoDetail(TemplateList.id)" v-title="$t('template.view')">
                            <use xlink:href="#icon-search"></use>
                        </svg>
                        <svg class="action-icon icon-delete" @click="deleteTemplate(TemplateList.id)" v-title="$t('common.del')">
                            <use xlink:href="#icon-delete"></use>
                        </svg>
                    </td>
                </tr>
                </tbody>
            </table>
            <inline-loading v-if="loading"/>
            <list-empty v-else-if="filteredTemplates.length === 0 && keyword === ''"/>
            <list-search-empty v-else-if="filteredTemplates.length === 0 && keyword !== ''"/>
        </div>
    </div>
</template>
<script type="text/babel">
    import { WechatApiV1 } from '@/api';
    import filterArrayByName from '../../common/utils/filterArrayByName';
    import {trackEvent} from '../../monitor';

    export default {
        data() {
            return {
                totalRow: '',
                wxTemplateList: [],
                keyword: '',
                loading: false,
            };
        },
        computed: {
            officialId() {
                return this.$store.state.user.authorizerInfoId;
            },
            filteredTemplates() {
                return filterArrayByName(this.wxTemplateList, this.keyword, 'title');
            }
        },
        mounted() {
            this.getTemplates();
            this.$parent.$on('remark', () => {
                this.upLoseData();
            });
        },
        beforeRouteLeave(to, from, next) {
            this.$parent.$off('remark');
            next();
        },
        methods: {
            getTemplates() {
                this.loading = true;
                WechatApiV1
                    .templateList(this.officialId, '', 2)
                    .then(res => {
                        this.loading = false;
                        this.wxTemplateList = res.body.data.wxTemplateList;
                        this.totalRow = res.body.data.totalRow;
                    })
                    .catch(() => {
                        this.loading = false;
                    });
            },
            deleteTemplate(templateId) {
                this.$confirm('删除模板', '确定删除模板么？，删除后模板ID将失效不可恢复,使用模板ID的程序也将失效')
                    .then(sure => {
                        if (sure)
                            WechatApiV1
                                .templateDelete(templateId)
                                .then(() => {
                                    this.$toast(this.$t('common.deleteSuccess'), 'success');
                                    trackEvent('微信管理-模板管理-删除失效模板');
                                    this.getTemplates();
                                });
                    });
            },
            upLoseData() {
                this.$loading();
                WechatApiV1
                    .synchronization(this.officialId)
                    .then(() => {
                        this.getTemplates();
                        trackEvent('微信管理-模板管理-获取更新');
                        this.$loaded();
                    })
                    .catch(() => {
                        this.$loaded();
                    });
            },
            gotoDetail(templateId) {
                this.$router.push({
                    name: 'invalidTemplateDetail',
                    query: {id: templateId}
                });
            }
        }
    };
</script>
<style lang="scss" type="text/scss" rel="stylesheet/scss">
    @import '../../common/scss/base/variables';
    @import '../../common/scss/base/mixin';

    .invalid-template-list {
        @import "./template";
    }
</style>
