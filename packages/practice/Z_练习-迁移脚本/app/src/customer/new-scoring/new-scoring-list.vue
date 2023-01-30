<template>
    <div class="content-container new-scoring-list">
        <!-- 面包屑 -->
        <div class="content-view">
            <crumbs />
        </div>
        <!-- 标题 -->
        <div class="page-head">
            <div class="content-view">
                <h1>{{'home.customerScoring' | t}}</h1>
            </div>
        </div>

        <div class="page-foot">
            <!-- 列表 -->
            <div class="content-view table-content">
                <div class="table-head">
                    <span class="up-limit">{{'newScoring.activatedOrUpperLimit' | t}}：{{remain}} / {{limit}}</span>
                    <button type="button" class="btn btn-md btn-theme pull-right" @click="openCreateScoringModel"
                        :disabled="$has('datacentre_scorerating_create')">
                        <!-- <svg aria-hidden="true">
                            <use xlink:href="#icon-plus"></use>
                        </svg> -->
                        {{'newScoring.createScoringModel' | t}}
                    </button>
                    <div class="search-box search-name">
                        <input type="text" v-model.trim="searchName" @keyup.enter="searchModel"
                            :placeholder="$t('newScoring.searchByModelName')">
                        <svg aria-hidden="true" @click="searchModel">
                            <use xlink:href="#icon-search"></use>
                        </svg>
                    </div>
                </div>
                <!-- 表格 -->
                <div class="page-content">
                    <div class="content-view padding margin white-bg scoring-table">
                        <div class="table">
                            <table>
                                <thead>
                                    <tr>
                                        <th width='30%'>{{'newScoring.modelName' | t}}</th>
                                        <th width='10%'>{{'newScoring.type' | t}}</th>
                                        <th width='6%'>
                                            {{'newScoring.status' | t}}
                                            <FilterDrop :value="status" :list="statusList" @valueChange="statusChange">
                                            </FilterDrop>

                                        </th>
                                        <th width='10%'>{{'newScoring.scoringProcess' | t}}
                                            <span class="icon icon-help"
                                                v-title="$t('newScoring.scoringProcessHover')"></span>
                                        </th>
                                        <th width='11%'>{{'newScoring.scoredDate' | t}}</th>
                                        <th width='10%'>{{'newScoring.updatedBy' | t}}</th>
                                        <th width='11%'>{{'newScoring.updatedAt' | t}}</th>
                                        <th width='12%'>{{'newScoring.actions' | t}}</th>
                                    </tr>
                                </thead>
                                <tbody class="table-word-break">
                                    <tr v-if="loading" class="no-hover">
                                        <td colspan="24" class="slim-cell">
                                            <inline-loading />
                                        </td>
                                    </tr>
                                    <tr v-for="(l,i) in list" :key="i" v-else>
                                        <td width='40%'>
                                            <p>{{l.modelName}}</p>
                                        </td>
                                        <td width='10%'>
                                            <p>{{(l.type === 1 ? $t('newScoring.scoreMatrix') : '-')}}</p>
                                        </td>
                                        <td width='6%'>
                                            <p :class="statusClass(l.status)">{{statusRender(l.status)}}</p>
                                        </td>
                                        <td width='10%'>
                                            <span class="process-class-p">
                                                <span class="scoring-process"
                                                    v-if="l.scoringProgress!=processList[3].id">
                                                    <div :class="processClass(l.scoringProgress)"></div>
                                                </span>
                                                <span>{{scoringProgressRender(l.scoringProgress)}}</span>
                                            </span>
                                        </td>
                                        <td width='11%'>
                                            <p>{{l.calculateDate || '-'}}</p>
                                        </td>
                                        <td width='10%'>
                                            <p>{{l.updateName}}</p>
                                        </td>
                                        <td width='11%'>
                                            <p>{{l.updateDate}}</p>
                                        </td>
                                        <td width='12%'>
                                            <!-- 启用 -->
                                            <button class="btn" @click="activeEvent(l.modelId)"
                                                :disabled="$has('datacentre_scorerating_active')"
                                                v-if="l.status===statusList[2].source||l.status===statusList[3].source">
                                                <svg aria-hidden="true" class="action-icon icon-kaishi"
                                                    v-title:top="$t('newScoring.activate')">
                                                    <use xlink:href="#icon-kaishi"></use>
                                                </svg>
                                            </button>
                                            <!-- 停用 -->
                                            <button class="btn" v-if="l.status===statusList[1].source"
                                                :disabled="$has('datacentre_scorerating_active')"
                                                @click="inactiveEvent(l.modelId)">
                                                <svg aria-hidden="true" class="action-icon icon-pause"
                                                    v-title:top="$t('newScoring.deactivate')">
                                                    <use xlink:href="#icon-pause"></use>
                                                </svg>
                                            </button>
                                            <!-- 编辑 -->
                                            <button class="btn" :disabled="$has('datacentre_scorerating_edit')"
                                                @click="editEvent(l)">
                                                <svg aria-hidden="true" class="action-icon icon-round-pencil"
                                                    v-title:top="$t('newScoring.edit')">
                                                    <use xlink:href="#icon-round-pencil"></use>
                                                </svg>
                                            </button>
                                            <!-- 报告 -->
                                            <button class="btn" v-if="l.status!==statusList[3].source"
                                                :disabled="$has('datacentre_scorerating_report')"
                                                @click="reportEvent(l.modelId)">
                                                <svg aria-hidden="true" class="action-icon icon-pie"
                                                    v-title:top="$t('newScoring.report')">
                                                    <use xlink:href="#icon-pie"></use>
                                                </svg>
                                            </button>
                                            <!-- 复制 -->
                                            <button class="btn" @click="copyEvent(l.modelId)"
                                                :disabled="$has('datacentre_scorerating_copy')">
                                                <svg aria-hidden="true" class="action-icon icon-copy"
                                                    v-title:top="$t('newScoring.copy')">
                                                    <use xlink:href="#icon-copy"></use>
                                                </svg>
                                            </button>
                                            <!-- 删除 -->
                                            <button class="btn" :disabled="$has('datacentre_scorerating_del')"
                                                @click="delEvent(l)">
                                                <svg aria-hidden="true" class="action-icon icon-delete"
                                                    v-title:top="$t('newScoring.delete')">
                                                    <use xlink:href="#icon-round-close"></use>
                                                </svg>
                                            </button>
                                        </td>
                                    </tr>
                                </tbody>
                            </table>
                            <list-search-empty v-if="list.length === 0&&!loading&&searchName" />
                            <!-- 没有模型 -->
                            <div v-if="list.length === 0&&!loading&&!searchName" class="no-models">
                                <div class="no-models-l">
                                    <p>{{'newScoring.newScoring' | t}}</p>
                                    <span>{{'newScoring.noModelDisplayA' | t}}</span>
                                    <span>{{'newScoring.noModelDisplayB' | t}}</span>
                                    <button type="button" class="btn btn-md btn-theme" @click="openCreateScoringModel"
                                        :disabled="$has('datacentre_scorerating_create')">
                                        <!-- <svg aria-hidden="true">
                                            <use xlink:href="#icon-plus"></use>
                                        </svg> -->
                                        {{'newScoring.createScoringModel' | t}}
                                    </button>
                                </div>
                                <img class="banner-img" :src="bannerImg">
                            </div>
                        </div>
                        <div class="pager-wrapper">
                            <div class="amount">{{'pagination.totalCount' | t}} <span
                                    class="theme-text">{{totalRow}}</span>
                                {{'pagination.totalUnit' | t}}
                            </div>
                            <pager :total="totalPage" :now="pageNumber" @page="handlePage"></pager>
                        </div>
                    </div>
                </div>

                <!-- 删除的提示框 -->
                <modal :title="$t('newScoring.deleteScoringModel')" v-if="delModal" @close="delCancel">
                    <div class="form-field">
                        <p>{{'newScoring.deleteScoringNote' | t}}</p>
                    </div>
                    <div class="form-field del-confirm">
                        <checkbox v-model="isDel"></checkbox>
                        <p @click="isDel=!isDel">{{'newScoring.confirmToDeleteThisModel' | t}}</p>
                    </div>
                    <template v-slot:buttons>
                        <input type="button" class="btn btn-md btn-theme-border" :value="$t('common.cancel')"
                            @click="delCancel">
                        <input type="button" class="btn btn-md btn-theme" :value="$t('common.confirm')"
                            :disabled="!isDel" @click="delConfirm">
                    </template>
                </modal>
            </div>
        </div>

    </div>
</template>
<script type="text/ecmascript-6">
import { ScoringV2 } from '@/api';
import { translate as t } from '@/locales';
import bannerImg from './image/banner.png';

export default {
    data () {
        return {
            remain: 0,//可启用的数量
            limit: 0,//上限的数量
            searchName: '',
            loading: true,
            list: [],
            status: '',
            //状态: 0停用 1启用2草稿
            statusList: [{
                source: '',
                name: t('newScoring.allStatus')
            },
            {
                source: 1,
                name: t('newScoring.active')
            },
            {
                source: 0,
                name: t('newScoring.inactive')
            },
            {
                source: 2,
                name: t('newScoring.draft')
            }],
            //评分进度: 1排队中,2评分中,3已完成,0从未评分
            processList: [{
                id: 1,
                name: t('newScoring.inQueue')
            }, {
                id: 2,
                name: t('newScoring.processing')
            }, {
                id: 3,
                name: '100%'
            }, {
                id: 0,
                name: '-'
            }],
            delModal: false,//删除模型确认弹窗显示
            delId: '',//要被删除信息的id
            isDel: false,
            isSubmit: false,//正在提交
            totalRow: 0,//总数
            totalPage: 1,// 分页数
            size: 10,//每页展示数量
            pageNumber: 1,//当前页数
            companyId: '',//公司ID
            bannerImg: bannerImg,   //列表为空时，展示图片
        };
    },
    computed: {
        user() {
            return this.$store.state.user;
        },
        // 华为类型账号
        isHw() {
            return this.user.companyType === 1;
        }
    },
    mounted() {
        //华为埋码
        if (this.isHw) {
            //UEM埋码
            window.hwa('trackPageView', 'P120319979662D4');
        }
    },
    methods: {
        getModelList() {
            const params = {
                searchName: this.searchName,
                pageNumber: this.pageNumber,
                size: this.size,
                status: this.status
            };
            this.loading = true;
            ScoringV2.getScoringModelList(params)
                .then(({ body: { data } }) => {
                    this.loading = false;
                    let activateArr = data.list.filter(e => e.status === this.statusList[1].source);
                    let notActivateArr = data.list.filter(e => e.status !== this.statusList[1].source);
                    this.list = [...activateArr, ...notActivateArr];
                    this.totalPage = data.totalPage;
                    this.totalRow = data.totalRow;
                    this.limit = data.limit;
                    this.remain = data.remain;
                });
        },
        // 搜索列表
        searchModel() {
            this.pageNumber = 1;
            this.getModelList();
        },
        statusChange (val) {
            this.status = val;
            this.pageNumber = 1;
            this.getModelList();
        },
        statusRender (val) {
            const index = this.statusList.findIndex(e => e.source === val);
            return this.statusList[index].name;
        },
        statusClass (val) {
            let className = '';
            switch (val) {
                case this.statusList[1].source:
                    className = 'active-color';
                    break;
                case this.statusList[2].source:
                    className = 'inactive-color ';
                    break;
                default:
                    className;
            }
            return className;
        },
        scoringProgressRender (val) {
            const index = this.processList.findIndex(e => e.id === val);
            return index === -1 ? '' : this.processList[index].name;
        },
        processClass (val) {
            let className = '';
            switch (val) {
                case this.processList[1].id:
                    className = 'processing';
                    break;
                case this.processList[2].id:
                    className = 'complete';
                    break;
                default:
                    break;
            }
            return className;
        },
        /**
         * 启用/停用
         * modelId模型id
         * status 启用:1 停用:0
         */
        activeEvent (modelId, status = 1) {
            if (this.isSubmit) return;
            this.isSubmit = true;
            ScoringV2.activeScoringModel({ modelId, status })
                .then(() => {
                    this.isSubmit = false;
                    this.$toast(this.$t(status ? 'newScoring.activatedSuccessfully' :
                        'newScoring.deactivatedSuccessfully'), 'success');
                    this.getModelList();
                })
                .catch(({ body }) => {
                    this.isSubmit = false;
                    if (body.errorCode === 'MODEL_DOES_NOT_EXIST') {
                        this.$toast(this.$t('newScoring.operationFailed'), 'warn');
                        this.getModelList();
                    }
                });
        },
        //停用
        inactiveEvent (modelId) {
            if (this.isSubmit) return;
            this.$confirm(this.$t('newScoring.deactivateScoringModel'), this.$t('newScoring.deactivateScoringContent'))
                .then(sure => {
                    if (sure) {
                        this.activeEvent(modelId, 0);
                    }
                });
        },
        //编辑
        editEvent (l) {
            if (l.scoringProgress !== this.processList[1].id && l.scoringProgress !== this.processList[0].id) {
                this.$router.push({ query: { modelId: l.modelId }, name: 'editNewScoreRating' });
            } else {
                this.$toast(this.$t('newScoring.computing'), 'warn');
                this.getModelList();
            }
        },
        //报告
        reportEvent (modelId) {
            this.$router.push({ query: { modelId: modelId }, name: 'newScoreRatingReport' });
        },
        //复制
        copyEvent (modelId) {
            if (this.isSubmit) return;
            this.isSubmit = true;
            ScoringV2.copyScoringModel({ modelId })
                .then(() => {
                    this.isSubmit = false;
                    this.$toast(this.$t('common.copySuccess'), 'success');
                    this.getModelList();
                })
                .catch(({ body }) => {
                    this.isSubmit = false;
                    if (body.errorCode === 'MODEL_DOES_NOT_EXIST') {
                        this.$toast(this.$t('newScoring.operationFailed'), 'warn');
                        this.getModelList();
                    }
                });
        },
        //删除
        delEvent (l) {
            if (l.scoringProgress === this.processList[1].id || l.scoringProgress === this.processList[0].id) {
                this.$toast(this.$t('newScoring.computing'), 'warn');
                this.getModelList();
            } else if (l.status === this.statusList[1].source) {
                this.$toast(this.$t('newScoring.actionError'), 'warn');
                this.getModelList();
            } else {
                this.delId = l.modelId;
                this.delModal = true;
            }
        },
        //确认删除
        delConfirm () {
            if (this.isSubmit) return;
            this.isSubmit = true;
            ScoringV2.delScoringModel({ modelId: this.delId })
                .then(() => {
                    this.isSubmit = false;
                    this.$toast(this.$t('newScoring.deletedSuccessfully'), 'success');
                    if (this.list.length === 1 && this.pageNumber !== 1) {
                        this.pageNumber -= 1;
                    }
                    this.delCancel();
                    this.getModelList();
                })
                .catch(({ body }) => {
                    this.isSubmit = false;
                    if (['MODEL_DOES_NOT_EXIST', 'MODEL_ENABLE_CANNOT_BE_DELETED'].includes(body.errorCode)) {
                        this.delModal = false;
                        this.$toast(this.$t('newScoring.operationFailed'), 'warn');
                        this.getModelList();
                    }
                });
        },
        //关闭删除提示页面
        delCancel () {
            this.isDel = false;
            this.delModal = false;
        },
        // 新建评分模型
        openCreateScoringModel () {
            this.$router.push({
                name: 'createNewScoreRating'
            });
        },
        //页码变动
        handlePage (e) {
            this.pageNumber = e;
            this.getModelList();
        }
    },
    created () {
        this.getModelList();
    }
};
</script>

<style lang="scss" type="text/scss" rel="stylesheet/scss">
@import '../../common/scss/base/_variables';
@import '../../common/scss/base/_mixin';
.new-scoring-list {
    .page-foot {
        height: calc(100% - 112px);
        overflow-y: auto;
        
        .table-content {
            width: 94%;
            background: #fff;
            display: inline-block;
            margin-top: 10px;

            .table-head {
                margin: 0 1%;
                padding: 16px 10px 10px;
                @include clearfix();

                .search-box {
                    float: right;
                    margin-right: 10px;
                }

                .up-limit {
                    float: left;
                    line-height: $input-field-height;
                }
            }

            .page-content {
                min-height: 400px;

                .scoring-table {
                    margin: 0 1%;
                    padding: 16px 10px 10px;

                    table {
                        border-top: 1px solid #e0e5ea;
                        border-left: 1px solid #e0e5ea;
                        border-right: 1px solid #e0e5ea;

                        button {
                            padding: 0;
                            margin: 0;

                            .action-icon {
                                width: 16px;
                                height: 16px;
                                margin: 6px 0;
                            }
                        }

                        tbody {
                            tr {
                                td {
                                    .active-color {
                                        color: #57c3aa;
                                    }

                                    .inactive-color {
                                        color: #f67d7d;
                                    }

                                    .process-class-p {
                                        display: flex;
                                        align-items: center;

                                        .scoring-process {
                                            position: relative;
                                            width: 26px;
                                            height: 12px;
                                            border-radius: 6px;
                                            background: #aaaaaa;
                                            display: inline-block;
                                            margin-right: 6px;

                                            .processing,
                                            .complete {
                                                position: absolute;
                                                top: 0;
                                                left: 0;
                                                bottom: 0;
                                                width: 50%;
                                                background: #02a7f0;
                                                border-radius: 6px;
                                            }

                                            .complete {
                                                width: 100%;
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }

                    .no-models {
                        display: flex;
                        justify-content: space-between;
                        width: 700px;
                        margin: 100px auto;

                        .no-models-l {
                            width: 430px;
                            padding: 18px 0;

                            p {
                                font-size: 16px;
                                color: $color-title;
                                line-height: 32px;
                                margin-bottom: 5px;
                            }

                            span {
                                display: inline-block;
                                width: 100%;
                                font-size: 14px;
                                color: $color-content;
                            }

                            .btn {
                                margin-top: 20px;
                            }
                        }

                        .banner-img {
                            width: 250px;
                            height: 171px;
                        }
                    }

                    .pager-wrapper {
                        display: flex;
                        justify-content: space-between;

                        .amount {
                            line-height: 64px;
                        }
                    }
                }
            }

            .del-confirm {
                display: flex;

                .checkbox {
                    margin-right: 6px;
                }

                p {
                    cursor: pointer;
                }
            }
        }
    }
}
</style>