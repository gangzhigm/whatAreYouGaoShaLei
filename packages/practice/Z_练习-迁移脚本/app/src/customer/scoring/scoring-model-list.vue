<template>
    <div class="content-container scoring-model-list">
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
            <!-- 启用上限and说明 -->
            <div class="upper-limit">
                <span>{{'scoring.activatedOrUpperLimit' | t}}：{{remain}} / {{limit}}</span>
                <span>
                    {{'scoring.scoringModelDescribeFront' | t}}
                    <span @click="factorShow=true">{{'scoring.actorTemplatesLibrary' | t}}</span>
                    {{'scoring.scoringModelDescribeAfter' | t}}
                </span>
            </div>

            <!-- 列表 -->
            <div class="content-view table-content">
                <div class="table-head">
                    <button type="button" class="btn btn-md btn-theme create-user" @click="openCreateScoringModel"
                        :disabled="$has('datacentre_scorerating_create')">
                        <svg aria-hidden="true">
                            <use xlink:href="#icon-plus"></use>
                        </svg>
                        {{'scoring.createScoringModel' | t}}
                    </button>
                    <div class="search-box search-name">
                        <input type="text" v-model.trim="searchName" @keyup.enter="search"
                            :placeholder="$t('scoring.searchByModelName')">
                        <svg aria-hidden="true" @click="search">
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
                                        <th width='40%'>{{'scoring.modelName' | t}}</th>
                                        <th width='6%'>
                                            {{'scoring.status' | t}}
                                            <FilterDrop :value="status" :list="statusList" @valueChange="statusChange">
                                            </FilterDrop>

                                        </th>
                                        <th width='10%'>{{'scoring.scoringProcess' | t}}
                                            <span class="icon icon-help"
                                                v-title="$t('scoring.scoringProcessHover')"></span>
                                        </th>
                                        <th width='11%'>{{'scoring.scoredDate' | t}}</th>
                                        <th width='10%'>{{'scoring.updatedBy' | t}}</th>
                                        <th width='11%'>{{'scoring.updatedAt' | t}}</th>
                                        <th width='12%'>{{'scoring.actions' | t}}</th>
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
                                                    v-title:top="$t('scoring.activate')">
                                                    <use xlink:href="#icon-kaishi"></use>
                                                </svg>
                                            </button>
                                            <!-- 停用 -->
                                            <button class="btn" v-if="l.status===statusList[1].source"
                                                :disabled="$has('datacentre_scorerating_active')"
                                                @click="inactiveEvent(l.modelId)">
                                                <svg aria-hidden="true" class="action-icon icon-pause"
                                                    v-title:top="$t('scoring.deactivate')">
                                                    <use xlink:href="#icon-pause"></use>
                                                </svg>
                                            </button>
                                            <!-- 编辑 -->
                                            <button class="btn" :disabled="$has('datacentre_scorerating_edit')"
                                                v-if="l.scoringProgress!==processList[1].id&&l.scoringProgress!==processList[0].id"
                                                @click="editEvent(l.modelId)">
                                                <svg aria-hidden="true" class="action-icon icon-round-pencil"
                                                    v-title:top="$t('scoring.edit')">
                                                    <use xlink:href="#icon-round-pencil"></use>
                                                </svg>
                                            </button>
                                            <!-- 报告 -->
                                            <button class="btn" v-if="l.status!==statusList[3].source"
                                                :disabled="$has('datacentre_scorerating_report')"
                                                @click="reportEvent(l.modelId)">
                                                <svg aria-hidden="true" class="action-icon icon-pie"
                                                    v-title:top="$t('scoring.report')">
                                                    <use xlink:href="#icon-pie"></use>
                                                </svg>
                                            </button>
                                            <!-- 复制 -->
                                            <button class="btn" @click="copyEvent(l.modelId)"
                                                :disabled="$has('datacentre_scorerating_copy')">
                                                <svg aria-hidden="true" class="action-icon icon-copy"
                                                    v-title:top="$t('scoring.copy')">
                                                    <use xlink:href="#icon-copy"></use>
                                                </svg>
                                            </button>
                                            <!-- 删除 -->
                                            <button class="btn" :disabled="$has('datacentre_scorerating_del')"
                                                v-if="(l.scoringProgress!==processList[1].i&&l.scoringProgress!==processList[0].id)&&l.status!==statusList[1].source"
                                                @click="delEvent(l.modelId)">
                                                <svg aria-hidden="true" class="action-icon icon-delete"
                                                    v-title:top="$t('scoring.delete')">
                                                    <use xlink:href="#icon-round-close"></use>
                                                </svg>
                                            </button>
                                        </td>
                                    </tr>
                                </tbody>
                            </table>
                            <list-empty v-if="list.length === 0&&!loading&&!searchName"
                                :name="$t('scoring.scoringModel')" />
                            <list-search-empty v-if="list.length === 0&&!loading&&searchName" />
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
                <modal :title="$t('scoring.deleteScoringModel')" v-if="delModal" @close="delCancel">
                    <div class="form-field">
                        <p>{{'scoring.deleteScoringNote' | t}}</p>
                    </div>
                    <div class="form-field del-confirm">
                        <checkbox v-model="isDel"></checkbox>
                        <p @click="isDel=!isDel">{{'scoring.confirmToDeleteThisModel' | t}}</p>
                    </div>
                    <template v-slot:buttons>
                        <input type="button" class="btn btn-md btn-theme-border" :value="$t('common.cancel')"
                            @click="delCancel">
                        <input type="button" class="btn btn-md btn-theme" :value="$t('common.confirm')"
                            :disabled="!isDel" @click="delConfirm">
                    </template>
                </modal>
                <!-- 新建评分模型 -->
                <modal :title="$t('scoring.createScoringModel')" v-if="createScoringModel" @close="createScorinCancel">
                    <!-- 模型名称 -->
                    <div class="form-field">
                        <label class="label">{{'scoring.modelName' | t}}</label>
                        <input type="text" class='input' v-model.trim="form.modelName"
                            :placeholder="$t('scoring.enterUpTo100Characters')" maxLength="100">
                        <p class="error" v-if="showError" style="margin-left:130px;">{{errorMsg}}</p>
                    </div>
                    <!-- 评分范围 -->
                    <div class="form-field">
                        <label class="label">{{'scoring.scoringRange' | t}}</label>
                        <div class="contacts-radio">
                            <radio :source=1 v-model="form.isAllContacts">{{'scoring.allContacts' | t}}</radio>
                            <radio :source=0 v-model="form.isAllContacts">
                                {{'scoring.newContactsFront' | t}}
                                <number-input class='input' v-model="form.scoringDay" :max=365 :min=1
                                    @sync="scoringDayChange" />
                                {{'scoring.newContactsAfter' | t}}
                                <span class="icon icon-help" v-title="$t('scoring.newContactsHover')"></span>
                            </radio>
                        </div>
                    </div>
                    <!-- 运行机制 -->
                    <div class="form-field how-to-work">
                        <label class="label">{{'scoring.howToWork' | t}}</label>
                        <p>{{'scoring.howToWorkContent' | t}}</p>
                    </div>
                    <template v-slot:buttons>
                        <input type="button" class="btn btn-md btn-theme-border" :value="$t('common.cancel')"
                            @click="createScorinCancel">
                        <input type="button" class="btn btn-md btn-theme" :value="$t('common.confirm')"
                            @click="createScorinConfirm">
                    </template>
                </modal>
                <!-- 评分因子 -->
                <scoring-factor-modal v-if="factorShow" @close="factorShow=false" />
            </div>
        </div>

    </div>
</template>
<script type="text/ecmascript-6">
import { ScoringV1 } from '@/api';
import { translate as t } from '@/locales';
import ScoringFactorModal from '@/customer/scoring/component/scoring-factor-modal.vue';

export default {
    components: {
        ScoringFactorModal
    },
    data () {
        return {
            remain: 0,//可启用的数量
            limit: 0,//上限的数量
            searchName: '',
            loading: true,
            list: [],
            status: '',
            //状态0停用 1启用2草稿
            statusList: [{
                source: '',
                name: t('scoring.allStatus')
            },
            {
                source: 1,
                name: t('scoring.active')
            },
            {
                source: 0,
                name: t('scoring.inactive')
            },
            {
                source: 2,
                name: t('scoring.draft')
            }],
            //评分进度:1排队中,2评分中,3已完成,0从未评分
            processList: [{
                id: 1,
                name: t('scoring.inQueue')
            }, {
                id: 2,
                name: t('scoring.processing')
            }, {
                id: 3,
                name: '100%'
            }, {
                id: 0,
                name: '-'
            }],
            delModal: false,
            delId: '',//要被删除信息的id
            isDel: false,
            createScoringModel: false,
            form: {
                isAllContacts: 1,// 1全部联系人，0新建联系人
                scoringDay: 30,
                modelName: ''
            },
            // 是否展示错误信息
            showError: false,
            isSubmit: false,//正在提交
            totalRow: 0,//总数
            totalPage: 1,// 分页数
            size: 10,//每页展示数量
            pageNumber: 1,//当前页数
            companyId: '',//公司ID
            errorMsg: '',//错误提示
            factorShow: false//因子模板库
        };
    },
    methods: {
        search () {
            const params = {
                searchName: this.searchName,
                pageNumber: this.pageNumber,
                size: this.size,
                status: this.status
            };
            this.loading = true;
            ScoringV1.getScoringModelList(params)
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
        statusChange (val) {
            this.status = val;
            this.pageNumber = 1;
            this.search();
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
            ScoringV1.activeScoringModel({ modelId, status })
                .then(() => {
                    this.isSubmit = false;
                    this.$toast(this.$t(status ? 'scoring.activatedSuccessfully' :
                        'scoring.deactivatedSuccessfully'), 'success');
                    this.search();
                })
                .catch(({ body }) => {
                    this.isSubmit = false;
                    if (body.errorCode === 'MODEL_DOES_NOT_EXIST') {
                        this.$toast(this.$t('scoring.operationFailed'), 'warn');
                        this.search();
                    }
                });
        },
        //停用
        inactiveEvent (modelId) {
            if (this.isSubmit) return;
            this.$confirm(this.$t('scoring.deactivateScoringModel'), this.$t('scoring.deactivateScoringContent'))
                .then(sure => {
                    if (sure) {
                        this.activeEvent(modelId, 0);
                    }
                });
        },
        //编辑
        editEvent (modelId) {
            this.$router.push({ query: { modelId: modelId }, name: 'scoringManage' });
        },
        //报告
        reportEvent (modelId) {
            this.$router.push({ query: { modelId: modelId }, name: 'scoringReport' });
        },
        //复制
        copyEvent (modelId) {
            if (this.isSubmit) return;
            this.isSubmit = true;
            ScoringV1.copyScoringModel({ modelId })
                .then(() => {
                    this.isSubmit = false;
                    this.$toast(this.$t('common.copySuccess'), 'success');
                    this.search();
                })
                .catch(({ body }) => {
                    this.isSubmit = false;
                    if (body.errorCode === 'MODEL_DOES_NOT_EXIST') {
                        this.$toast(this.$t('scoring.operationFailed'), 'warn');
                        this.search();
                    }
                });
        },
        //删除
        delEvent (modelId) {
            this.delId = modelId;
            this.delModal = true;
        },
        //确认删除
        delConfirm () {
            if (this.isSubmit) return;
            this.isSubmit = true;
            ScoringV1.delScoringModel({ modelId: this.delId })
                .then(() => {
                    this.isSubmit = false;
                    this.$toast(this.$t('scoring.deletedSuccessfully'), 'success');
                    if (this.list.length === 1 && this.pageNumber !== 1) {
                        this.pageNumber -= 1;
                    }
                    this.delCancel();
                    this.search();
                })
                .catch(({ body }) => {
                    this.isSubmit = false;
                    if (['MODEL_DOES_NOT_EXIST', 'MODEL_ENABLE_CANNOT_BE_DELETED'].includes(body.errorCode)) {
                        this.delModal = false;
                        this.$toast(this.$t('scoring.operationFailed'), 'warn');
                        this.search();
                    }
                });
        },
        //关闭删除提示页面
        delCancel () {
            this.isDel = false;
            this.delModal = false;
        },
        //关闭‘新建评分模型’
        createScorinCancel () {
            this.createScoringModel = false;
            this.showError = false;
            this.isSubmit = false;
        },
        //保存‘新建评分模型’
        createScorinConfirm () {
            if (this.isSubmit) return;
            this.isSubmit = true;
            if (!this.form.modelName) {
                this.showError = true;
                this.errorMsg = this.$t('scoring.dataRequired');
                this.isSubmit = false;
                return;
            }
            const params = {
                scoringRange: this.form.isAllContacts === 1 ? 0 : this.form.scoringDay,
                modelName: this.form.modelName
            };
            ScoringV1.addScoringModel(params)
                .then(({ body: { data } }) => {
                    this.$toast(this.$t('common.createSuccess'), 'success');
                    this.createScorinCancel();
                    this.$router.push({ query: { modelId: data.modelId }, name: 'scoringManage' });
                })
                .catch(({ body }) => {
                    this.isSubmit = false;
                    if (body.errorCode === 'MODEL_NAME_DUPLICATION') {
                        this.showError = true;
                        this.errorMsg = this.$t('scoring.modelNamesCannotBeDuplicated');
                    }
                });
        },
        scoringDayChange (val) {
            if (val === '') {
                this.form.scoringDay = 1;
            }
        },
        // 新建评分模型
        openCreateScoringModel () {
            this.createScoringModel = true;
            this.form.modelName = '';
            this.form.scoringDay = 30;
            this.form.isAllContacts = 1;
        },
        //页码变动
        handlePage (e) {
            this.pageNumber = e;
            this.search();
        }
    },
    created () {
        this.search();
    }
};
</script>

<style lang="scss" type="text/scss" rel="stylesheet/scss">
@import '../../common/scss/base/_variables';
@import '../../common/scss/base/_mixin';
.scoring-model-list {
    .page-foot {
        height: calc(100% - 112px);
        overflow-y: auto;
        .upper-limit {
            display: inline-block;
            width: calc(94% - 20px);
            margin: 0 3%;
            min-width: 1000px;
            background: #fff;
            margin-top: 20px;
            padding: 10px;
            line-height: 26px;
            > span {
                display: block;
                span {
                    color: #57c3aa;
                    &:hover {
                        cursor: pointer;
                        text-decoration-line: underline;
                    }
                }
            }
        }
        .table-content {
            width: 94%;
            background: #fff;
            display: inline-block;
            margin-top: 10px;
            .table-head {
                padding: 10px;
                display: flex;
                flex-direction: row-reverse;
                .search-box {
                    margin-right: 10px;
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
                    .pager-wrapper {
                        display: flex;
                        justify-content: space-between;

                        .amount {
                            line-height: 64px;
                        }
                    }
                }
            }

            .form-field {
                .error {
                    color: $light-red;
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
            .how-to-work {
                p {
                    width: 440px;
                    display: inline-block;
                }
            }
            .contacts-radio {
                width: 440px;
                display: inline-block;
                .radio {
                    input {
                        width: 30px;
                        margin: 0 5px;
                    }
                }
                .radio:nth-child(1) {
                    margin-right: 300px;
                }
                .radio + .radio {
                    margin-left: 0;
                }
            }
        }
    }
}
</style>