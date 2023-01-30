<template>
    <div class="template-list">
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
                    <!--<th>联系人ID</th>-->
                    <th width="30px">{{'template.order' | t}}</th>
                    <th>{{'template.id' | t}}</th>
                    <th>{{'template.title' | t}}</th>
                    <th>{{'template.industry' | t}}</th>
                    <th>{{'template.subIndustries' | t}}</th>
                    <th width="80px">{{'template.status' | t}}</th>
                    <th width="30px">{{'template.operation' | t}}</th>
                </tr>
                </thead>
                <tbody>
                <tr v-for="(template,index) in filteredTemplates">
                    <!--<td><span>{{contact.customerId}}</span></td>-->
                    <td><span>{{index + 1}}</span></td>
                    <td><span>{{template.templateId}}</span></td>
                    <td><span>{{template.title}}</span></td>
                    <td><span>{{template.primaryIndustry}}</span></td>
                    <td><span>{{template.deputyIndustry}}</span></td>
                    <td>
                        <template v-if="template.status === 0">
                            <span class="icon icon-warn orange-text"></span>
                            {{'template.paramNot' | t}}
                        </template>
                        <template v-else-if="template.status === 1">
                            <span class="icon icon-True theme-text"></span>
                            {{'template.paramHas' | t}}
                        </template>
                    </td>
                    <td>
                        <button class="btn" 
                                id="wechat_template_value_message"
                                :disabled="$has('wechat_template_value_message')"
                                @click="checkTemplateDetail(template.id)" v-title="$t('template.view')">
                            <svg class="action-icon icon-pencil">
                                <use xlink:href="#icon-pencil"></use>
                            </svg>
                        </button>
                    </td>
                </tr>
                </tbody>
            </table>
            <inline-loading v-if="loading"></inline-loading>
            <div v-else-if="filteredTemplates.length === 0">
                <list-empty v-if="wxTemplateList.length === 0"/>
                <list-search-empty v-else/>
            </div>
            <!--使用须知-->
            <div v-if="wxTemplateList.length" class="notices">
                <h3>{{'template.useMsg' | t}}</h3>
                <p>{{'template.msg1' | t}}</p>
                <p>{{'template.msg2' | t}}</p>
                <p>{{'template.msg3' | t}}</p>
                <p>{{'template.msg4' | t}}</p>
            </div>
        </div>
    </div>
</template>
<script type="text/babel">
    import { WechatApiV1 } from '@/api';
    import filterArrayByName from '../../common/utils/filterArrayByName';
    import {trackEvent} from '@/monitor';
    import { mapState } from 'vuex';

    export default {
        data() {
            return {
                totalRow: '',
                wxTemplateList: [],
                keyword: ''
            };
        },
        computed: {
            ...mapState(['user', 'loading']),
            officialId() {
                return this.user.authorizerInfoId;
            },
            filteredTemplates() {
                return filterArrayByName(this.wxTemplateList, this.keyword, 'title');
            }
        },
        mounted() {
            this.getTemplates();
            this.$parent.$on('remark', () => {
                this.upData();
            });
        },
        beforeRouteLeave(to, from, next) {
            this.$parent.$off('remark');
            next();
        },
        methods: {
            getTemplates() {
                this.$loading();
                WechatApiV1
                    .templateList(this.officialId, '', '')
                    .then(res => {
                        this.wxTemplateList = res.body.data.wxTemplateList;
                        this.totalRow = res.body.data.totalRow;
                        this.$nextTick(() => {
                            this.$loaded();
                        });
                    })
                    .catch(() => {
                        this.$loaded();
                    });
            },
            upData() {
                this.$loading();
                WechatApiV1
                    .synchronization(this.officialId)
                    .then(() => {
                        this.getTemplates();
                        this.$loaded();
                        trackEvent('微信管理-模板管理-获取更新');
                    })
                    .catch(() => {
                        this.$loaded();
                    });
            },
            checkTemplateDetail(id) {
                this.$router.push({
                    name: 'templateDetail',
                    query: {id}
                });
            }
        }
    };
</script>
<style lang="scss" type="text/scss" rel="stylesheet/scss">
    @import '../../common/scss/base/variables';
    @import '../../common/scss/base/mixin';

    .template-list {
        @import "./template";

        .notices {
            margin-top: 24px;
            margin-bottom: 24px;
            line-height: $input-field-height;
            color: $color-light-content;
        }
    }
</style>
