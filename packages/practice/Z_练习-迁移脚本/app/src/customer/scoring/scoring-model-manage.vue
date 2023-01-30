<template>
    <!--    评分模版新建/编辑-->
    <div class="content-container scoring-manage">
        <div class="content-view">
            <crumbs :crumbs="crumbs"/>
        </div>
        <div class="page-head">
            <div class="content-view opt-head">
                <div class="left-opt">
                    <svg aria-hidden="true" class="cursor-pointer" @click="$router.push({name:'scorerating'})">
                        <use xlink:href="#icon-fanhui1"></use>
                    </svg>
                    <span class="model-name" :title="modelName">{{ modelName }}</span>
                    <svg aria-hidden="true" class="cursor-pointer" @click="openModelName">
                        <use xlink:href="#icon-pencil"></use>
                    </svg>
                </div>
                <div class="right-opt">
                    <i class="icon icon-kaishi cursor-pointer" :title="$t('scoring.activate')"
                       :class="{'icon-disable':$has('datacentre_scorerating_active')}"
                       v-if="status===0||status===2" @click="modelStatus(1)" ></i>
                    <i class="icon icon-pause cursor-pointer" :title="$t('scoring.deactivate')"
                       :class="{'icon-disable':$has('datacentre_scorerating_active')}"
                       v-if="status===1" @click="modelStatus(0)"></i>
                </div>
            </div>
        </div>
        <div class="page-content">
            <div class="content-scoring-list">
                <div class="scoring-opt-about">
                    <div class="score">
                        <p class="bold">{{ fullScore }}</p>
                        <p>{{ $t('scoring.fullScore') }}</p>
                    </div>
                    <div class="score-num">
                        <p class="bold">{{ gradesCount }}</p>
                        <span>{{ $t('scoring.grades') }}
                            <span class="theme-text cursor-pointer" @click="gradesFlag=true">{{
                                    $t('scoring.manageEdit')
                                }} </span>
                        </span>
                    </div>
                    <div class="score-range">
                        <div class="bold scoring-mech">
                            <span class="left-span">{{ scoringRange }}</span>
                            <span class="right-span">
                                /{{ $t('scoring.scoringADay') }}
                                <i class="icon icon-help" v-title="$t('scoring.scoreEveryDay')"></i>
                            </span>
                        </div>
                        <div class="scoring-mech">
                            <span class="left-span">{{ $t('scoring.scoringRange') }}</span>
                            <span class="right-span">/{{ $t('scoring.howToWork') }}</span>
                        </div>
                    </div>
                </div>
                <div class="scoring-list">
                    <div class="score-list-head">
                        <div class="hidden-menu-trigger">
                            <span class="title-text cursor-pointer">{{ $t('scoring.batchAction') }}</span>
                            <div class="hidden-menu">
                                <button class="btn" @click="readyDel(1,'')"
                                        :disabled="$has('datacentre_scorerating_dels')">{{ $t('scoring.batchDel') }}
                                </button>
                            </div>
                        </div>
                        <div class="pull-right">
                            <div class="search-box md">
                                <input type="text" :placeholder="$t('scoring.search')" v-model.trim="keyword"
                                       @keyup.enter="searchFactor">
                                <svg aria-hidden="true" @click="searchFactor">
                                    <use xlink:href="#icon-search"></use>
                                </svg>
                            </div>
                            <button class="btn btn-theme new-score-btn" @click="readyCreate">
                                +{{ $t('scoring.addScoringFactor') }}
                            </button>
                        </div>
                    </div>
                    <!--                因子列表-->
                    <div class="simplify-table scoring-list-table">
                        <table>
                            <thead>
                            <tr>
                                <th width="50">
                                    <choose-all-action @choosePage="choosePageData" @clear="clearChoose"/>
                                </th>
                                <th>{{ $t('scoring.factorName') }}</th>
                                <th>
                                    {{ $t('scoring.fieldsAndEvents') }}
                                    <div class="filter-box" v-blur="closeStatus">
                                        <svg aria-hidden="true" class="cursor-pointer"
                                             @click="chooseStatus = !chooseStatus">
                                            <use
                                                v-bind:xlink:href="'#icon-' + (chooseStatus ? 'shaixuan-tianchong' : 'shaixuan')"></use>
                                        </svg>
                                        <transition name="drop">
                                            <!---全部，属性因子 事件因子-->
                                            <div class="drop-list" v-if="chooseStatus">
                                                <radio v-model="scoringStatus" :source="''" @input="filterFactor('')">
                                                    {{ 'form.allStatus' | t }}
                                                </radio>
                                                <radio v-model="scoringStatus" :source="0" @input="filterFactor">
                                                    {{ $t('scoring.attributeFactor') }}
                                                </radio>
                                                <radio v-model="scoringStatus" :source="1" @input="filterFactor">
                                                    {{ $t('scoring.eventFactor') }}
                                                </radio>
                                            </div>
                                        </transition>
                                    </div>
                                </th>
                                <th>{{ $t('scoring.rules') }}</th>
                                <th>{{ $t('scoring.scoringRange') }}</th>
                                <th>{{ $t('scoring.action') }}</th>
                            </tr>
                            </thead>
                            <tbody>
                            <tr v-if="loading">
                                <td colspan="11">
                                    <inline-loading/>
                                </td>
                            </tr>
                            <tr v-else-if="scoringFactorList.length === 0">
                                <td colspan="11" class="slim-cell">
                                    <list-search-empty v-if="keyword !== ''"/>
                                    <list-empty v-else :name="$t('scoring.scoreFactor')"/>
                                </td>
                            </tr>
                            <tr v-else v-for="(item,index) in scoringFactorList" :key="item.id"
                                :class="{active:checkedItem.indexOf(item.id) !== -1}">
                                <td>
                                    <checkbox :source="item.id" v-model="checkedItem"/>
                                </td>
                                <td>{{ item.name }}</td>
                                <td>
                                    <div class="icon-field-name">
                                        <customer-icon v-if="item.type===1&&fieldEventName(item).flag"
                                                       :eventGroupName="fieldEventName(item).iconName"
                                                       :eventName="fieldEventName(item).eventName"></customer-icon>
                                        <svg aria-hidden="true" v-if="item.type===0&&fieldEventName(item).flag"
                                             class="attribute-icon">
                                            <use xlink:href="#icon-shuxing"></use>
                                        </svg>
                                        <span :class="{'red-text' : !fieldEventName(item).flag}"
                                              v-text="fieldEventName(item).fieldName"></span>
                                    </div>
                                </td>
                                <td>{{ item.rulesCount }}</td>
                                <td>{{ item.scoreFloor }} ～ {{ item.scoreCeil }}</td>
                                <td>
                                    <div class="list-actions">
                                        <button class="btn" :title="$t('scoring.edit')" @click="editFactor(item)">
                                            <svg aria-hidden="true" class="theme-icon icon-round-pencil">
                                                <use xlink:href="#icon-round-pencil"></use>
                                            </svg>
                                        </button>
                                        <button class="btn move-up" v-if="index!==0" :title="$t('scoring.moveUp')"
                                                @click="factorMove('up', index, item)">
                                            <svg aria-hidden="true" class="theme-icon icon-xiayi">
                                                <use xlink:href="#icon-xiayi"></use>
                                            </svg>
                                        </button>
                                        <button class="btn" v-if="index!==scoringFactorList.length-1"
                                                :title="$t('scoring.moveDown')"
                                                @click="factorMove('down', index, item)">
                                            <svg aria-hidden="true" class="theme-icon icon-xiayi">
                                                <use xlink:href="#icon-xiayi"></use>
                                            </svg>
                                        </button>
                                        <button class="btn" @click="readyFactorTem(item)"
                                                :disabled="$has('datacentre_scorerating_template')"
                                                :title="$t('scoring.saveTemplate')">
                                            <svg aria-hidden="true" class="theme-icon icon-save">
                                                <use xlink:href="#icon-save"></use>
                                            </svg>
                                        </button>
                                        <button class="btn" :title="$t('scoring.copy')" @click="copyFactor(item.id)">
                                            <svg aria-hidden="true" class="icon-copy">
                                                <use xlink:href="#icon-copy"></use>
                                            </svg>
                                        </button>
                                        <button class="btn" @click="readyDel(0, item)"
                                                :disabled="$has('datacentre_scorerating_deltemplate')"
                                                :title="$t('scoring.delete')">
                                            <svg aria-hidden="true" class="icon-shanchu">
                                                <use xlink:href="#icon-shanchu"></use>
                                            </svg>
                                        </button>
                                    </div>
                                </td>
                            </tr>
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>

        <!--        模型名称命名弹窗-->
        <modal :title="$t('scoring.rename')" v-if="nameModelFlag" class="rename" @close="cancelEditName">
            <div class="form-field">
                <label class="label">{{ $t('scoring.modelName') }}</label>
                <input type="text" class="input lg" maxlength="100" v-model.trim="editedName" @click="modelNameErr=''">
                <p class="name-err">{{ editedName === '' ? modelNameErr : '' }}</p>
            </div>
            <template v-slot:buttons>
                <button slot="buttons" class="btn btn-md btn-theme-border" @click="cancelEditName">
                    {{ $t('common.cancel') }}
                </button>
                <button slot="buttons" class="btn btn-md btn-theme" @click="editModelName">{{
                        $t('common.confirm')
                    }}
                </button>
            </template>
        </modal>

        <!-- 批量/单个 删除评分因子-->
        <confirm :title="$t('scoring.delScoringFactor')" v-if="batchDel" @cancel="batchDel=false"
                 @confirm="delFactor">
            <div class="form-field">
                <span v-if="singleBatchDel">{{ $t('scoring.confirmDelete') }} [ {{
                        checkedItem.length
                    }} ] {{ $t('scoring.NFactor') }}</span>
                <span v-if="!singleBatchDel">{{ $t('scoring.singleScore') }}</span>
            </div>
        </confirm>
        <!--        保存为模版-->
        <confirm :title="$t('scoring.saveTemplate')" v-if="saveFactorFlag" @cancel="saveFactorFlag=false"
                 @confirm="saveFactorToTem">
            <div class="form-field">
                <span>{{ $t('scoring.confirmTemplate') }}</span>
            </div>
        </confirm>
        <!--        等级管理-->
        <gradesEditModal v-if="gradesFlag" @closeGrades="closeGrades" :modelId="modelId"></gradesEditModal>
        <!--        新建评分因子弹窗-->
        <modal :title="$t('scoring.addScoringFactor')" v-if="factorFlag" @close="factorClose(0)" class="create-scoring">
            <div>
                <div class="tab-links">
                    <span class="tab-link" :class="{active:newScoreType === 0}"
                          @click="choseCreatScoreType(0)">{{ $t('scoring.createBlank') }}</span>
                    <span class="tab-link" :class="{active:newScoreType === 1}"
                          @click="choseCreatScoreType(1)">{{ $t('scoring.createTemplate') }}</span>
                </div>
<!--                从空白处创建-->
                <div v-if="newScoreType===0">
                    <div class="form-field">
                        <label class="label">{{ $t('scoring.factorType') }}</label>
                        <radio :source="0" v-model="type">{{ $t('scoring.attributeFactor') }}</radio>
                        <radio :source="1" v-model="type">{{ $t('scoring.eventFactor') }}</radio>
                    </div>
                    <div class="form-field">
                        <label class="label">{{
                                type === 0 ? $t('scoring.selectField') : $t('scoring.selectEvent')
                            }}</label>
                        <cascading v-show="type===0" :placeholder="$t('common.selectHolder')" :list="userAttrGroups"
                                   @click="selectFactorErr=''"
                                   @select="changePriceIdList($event, 0)"
                                   :value="userValue"></cascading>
                        <cascading v-show="type===1" :placeholder="$t('common.selectHolder')" :list="eventFieldList"
                                   @click="selectFactorErr=''"
                                   @select="changePriceIdList($event, 1)"
                                   :value="eventValue"></cascading>
                        <label class="label"></label>
                        <p class="err-code">{{ selectFactorErr !== '' ? selectFactorErr : '' }}</p>
                    </div>
                </div>
<!--                从模版库中选择-->
                <div class="form-field" v-if="newScoreType===1">
                    <label class="label">{{ $t('scoring.selectTemplate') }}</label>
                    <selector :options="scoringFactorTemList" v-model="templateFactorId"
                              :placeholder="$t('common.selectHolder')" @click="selectFactorErr=''"
                              @load="loadMore" @select="selectFactorTem" search="async"
                              @search="searchFactorTem"></selector>
                    <p class="err-code">{{ selectFactorErr !== '' ? selectFactorErr : '' }}</p>
                </div>
            </div>
            <template v-slot:buttons>
                <button slot="buttons" class="btn btn-md btn-theme-border" @click="factorClose(0)">
                    {{ $t('common.cancel') }}
                </button>
                <button slot="buttons" class="btn btn-md btn-theme" @click="factorClose(1)">{{
                        $t('common.confirm')
                    }}
                </button>
            </template>
        </modal>
        <!--        因子编辑弹窗-->
        <scoringFactorModal v-if="factorEditFlag" :factorRule="createFactorRule"
                            @close="closeScoreEdit"></scoringFactorModal>
<!--        停用二次确认-->
        <confirm :title="$t('scoring.deactivateScoringModel')" v-if="pauseFlag" @cancel="pauseFlag=false"
                 @confirm="pauseModel">
            <div class="form-field">
                <span>{{'scoring.deactivateScoringContent' | t}}</span>
            </div>
        </confirm>
    </div>
</template>
<script type="text/ecmascript-6">
import {ContactApi, ContactApiV1, ScoringV1} from '@/api';
import gradesEditModal from './grades-edit-modal.vue';
import cascading from '@/common/components/condition-bunch/cascading.vue';
import scoringFactorModal from './component/scoring-factor-edit.vue';
import customerIcon from '@/customer/list/customer-icon.vue';
import {I18N_STORE_NAME} from '@/locales';
import { mapState } from 'vuex';

export default {
    props: {},
    data() {
        return {
            fullScore: 0, //满分
            scoringFactorList: [], //评分因子list
            scoringFactorTemList: [], //模版评分因子列表
            curFactor: '',//当前选中的因子
            templateFactorId: '', //从模版库中选择 - 模版因子id
            checkedItem: [],        // 批量删除因子列表Id集合
            singleBatchDel: '',//true批量，false单个
            chooseStatus: false,// 状态筛选
            scoringStatus: '',//全部''，属性因子0，事件因子1
            loading: true,    // 请求因子列表过渡显隐
            nameModelFlag: false, //重命名弹窗显隐
            pauseFlag: false, //模型的启用/暂停flag
            batchDel: false, //批量删除弹窗显隐
            gradesFlag: false, //等级编辑弹窗显隐
            factorFlag: false, //新建评分因子弹窗显隐
            saveFactorFlag: false,//因子保存为模版显隐
            factorEditFlag: false, //编辑因子弹窗flag

            //因子info
            createFactorRule: {
                scoringModelId: '',// 评分模型id
                id: '', // 评分因子id，有值则为编辑，空值则为新建
                isTemplate: '',
                type: '', //评分因子类型。0:属性因子 1:事件因子
                attributeOrEventId: '', // 属性或事件id
                attributeOrEventInfo: {} // 属性或事件需要传的详情对象
            },

            newScoreType: 0, //0:从空白新建 ,1:从模板库中选择
            type: 0, //评分因子类型。0:属性因子 1:事件因子
            userAttrGroups: [], //所有联系人属性 属性因子
            eventFieldList: [], //事件因子列表
            customerFieldList: [],//属性因子列表
            userValue: '',
            eventValue: '',
            modelId: '',//模型id
            modelName: '', //模型name
            editedName: '', //编辑时name
            modelNameErr: '', //编辑模型name为空时错误提示
            selectFactorErr: '', //因子为空时错误提示
            gradesCount: '', //等级数量
            scoringRange: '',//评分范围:0全部,其他:最近多少天创建
            keyword: '', //因子列表 关键字
            templateKey: '',//因子模版列表 关键字
            status: 1, // 状态:0停用 1启用 2草稿

            //因子
            pageNumber: 1,
            totalPage: 1,

            //模版因子
            temPageNumber: 1,
            temTotal: 1,
        };
    },
    components: {
        gradesEditModal,
        cascading,
        scoringFactorModal,
        customerIcon,
    },
    computed: {
        //面包屑
        crumbs() {
            return [
                {name: 'index', text: 'Dmartech'},
                {name: 'scorerating', text: this.$t('home.customerScoring')},
                Object.assign({}, this.$route, {text: this.modelName})
            ];
        },
        ...mapState({
            // 语言状态
            lang: state => state[I18N_STORE_NAME].lang === 'zh-CN'
        })
    },
    watch: {
        newScoreType() {
            this.templateFactorId = '';
            this.eventValue = '';
            this.userValue = '';
            this.templateKey = '';
            this.scoringFactorTemList = [];
            this.getScoringList(true);
        },
        type() {
            if (this.type === 0) this.eventValue = '';
            if (this.type === 1) this.userValue = '';
            this.selectFactorErr = '';
        }
    },
    created() {
        this.checkedItem = [];
    },
    mounted() {
        this.modelId = Number(this.$route.query.modelId);
        this.getRelationshipList();
        this.eventFieldHandler();
        this.getModelInfo();
    },
    methods: {
        openModelName() {
            this.nameModelFlag = true;
            this.editedName = this.modelName;
        },
        //修改模型name
        editModelName() {
            if (this.editedName === '') {
                this.modelNameErr = this.$t('scoring.dataRequired');
                return;
            }
            ScoringV1
                .editModelName(this.modelId, this.editedName)
                .then(() => {
                    this.getModelInfo();
                    this.$toast(this.$t('menu.synSuccess'), 'success');
                })
                .catch((err) => {
                    if (err.body.errorCode === 'MODEL_DOES_NOT_EXIST') {
                        this.$toast(err.body.message, 'warn');
                        this.$router.push({name: 'scorerating'});
                    }
                });
            this.nameModelFlag = false;
            this.modelNameErr = '';
        },
        cancelEditName() {
            this.nameModelFlag = false;
            this.modelNameErr = '';
        },
        //修改模型状态 - 暂停/启用
        modelStatus(stu) {
            if (stu === 0) {
                this.pauseFlag = true;
                return;
            }
            this.ChangeModelStatus(stu);
        },
        ChangeModelStatus(st) {
            ScoringV1
                .modelStatus(this.modelId, st)
                .then((res) => {
                    this.status = res.body.data.status;
                    this.$toast(this.$t('menu.synSuccess'), 'success');
                })
                .catch((err) => {
                    if (err.body.errorCode === 'MODEL_DOES_NOT_EXIST') {
                        this.$toast(err.body.message, 'warn');
                        this.$router.push({name: 'scorerating'});
                    }
                });
        },
        //停用模型
        pauseModel() {
            this.pauseFlag = false;
            this.ChangeModelStatus(0);
        },
        // 获取自定义字段
        async getRelationshipList() {
            // 获取自定义字段
            await ContactApiV1.customWorld(0, 1, '', 1)
                .then(res => {
                    let wechatAttr = [];
                    let othAttr = [];
                    let rating = [];
                    this.customerFieldList = res.body.data.customerFieldList;
                    res.body.data.customerFieldList.map(e => {
                        let tag = {};
                        tag.name = this.lang ? e.fieldCn : e.nameEn;
                        tag.id = e.id;
                        tag.type = e.fieldType;
                        tag.fieldName = e.fieldName;
                        e.isWechat ? wechatAttr.push(tag) : e.isScoring ? rating.push(tag) : othAttr.push(tag);
                    });
                    let len = othAttr.length;
                    let basic = [], member = [], tag = [], wecomAttr = [], consume = [], senior = [], etc = [];
                    for (let i = 0; i < len; i++) {
                        switch (Boolean(othAttr[i])) {
                            //case /^openid_wx/.test(othAttr[i].fieldName):
                            case [
                                'mobile', 'email', '微信openid', 'unionid', 'customer_id', 'name',
                                'sex', 'address', 'create_date', 'update_date', 'job_title_dmt',
                                'company_type_dmt', 'number_of_Employees_dmt', 'budget_amount', 'sex_dmt', 'annual_revenue', 'company_name_dmt'
                            ].includes(othAttr[i].fieldName):
                                basic.push(othAttr[i]);
                                break;
                            case [
                                'member_id', 'integral', '会员等级', '会员加入日期', 'member_grade',
                                'member_date', '会员状态', 'customer_create_date'
                            ].includes(othAttr[i].fieldName):
                                member.push(othAttr[i]);
                                break;
                            case [
                                '微信标签', '系统标签', '会员标签',
                                '粉丝标签', 'label_ids'
                            ].includes(othAttr[i].fieldName):
                                tag.push(othAttr[i]);
                                break;
                            case [
                                'sale_count', 'sale_total',
                                'first_sale_date', 'last_sale_date'
                            ].includes(othAttr[i].fieldName):
                                consume.push(othAttr[i]);
                                break;
                            case [
                                'price_index', 'active_index', 'consume_index',
                                'wechat_influence_date', 'sms_influence_date', 'mail_influence_date'
                            ].includes(othAttr[i].fieldName):
                                senior.push(othAttr[i]);
                                break;
                            case [
                                'wecom_sex', 'wecom_name', 'wecom_corp_full_name',
                                'wecom_staff_name', 'wecom_staff_mobile', 'wecom_staff_email',
                                'wecom_group_name', 'wecom_source', 'wecom_channel_code',
                                'external_userid'].includes(othAttr[i].fieldName):
                                wecomAttr.push(othAttr[i]);
                                break;
                            default:
                                etc.push(othAttr[i]);
                                break;
                        }
                    }
                    this.userAttrGroups = [
                        {name: this.$t('swarm.basicInfo'), id: 0, child: basic},
                        {name: this.$t('swarm.memberInfo'), id: 1, child: member},
                        {name: this.$t('swarm.labelInfo'), id: 2, child: tag},
                        {name: this.$t('swarm.consumerInfo'), id: 3, child: consume},
                        {name: this.$t('swarm.advancedInfo'), id: 4, child: senior},
                        {name: this.$t('swarm.wechatInfo'), id: 5, child: wechatAttr},
                        {name: this.$t('home.wecom'), id: 7, child: wecomAttr},
                        {name: this.$t('swarm.customInfo'), id: 6, child: etc},
                        {name: this.$t('swarm.scoringInfo'), id: 8, child: rating}
                    ];
                });
        },
        //获取事件属性
        async eventFieldHandler() {
            await ContactApi.getEventGroupList()
                .then((res) => {
                    let reqNum = 0;
                    let intervalNum = 0;
                    this.eventFieldList = res.body.data.contactEvnentsGroupDTO.map((e) => {
                        let eventGroup = {};
                        eventGroup.id = e.id;
                        eventGroup.fieldName = e.name;
                        eventGroup.name = this.lang ? e.nameCn : e.nameEn;
                        eventGroup.child = [];
                        ContactApi
                            .getEventList(e.id)
                            .then(ress => {
                                eventGroup.child = ress.body.data.contactEvnentsDTO.map(v => {
                                    let events = {};
                                    events.id = v.id;
                                    events.fieldName = v.name;
                                    events.name = this.lang ? v.nameCn : v.nameEn;
                                    events.event_group = e.name;
                                    events.event_group_id = v.evnentsGroupId;
                                    return events;
                                });
                                reqNum += 1;
                            });
                        return eventGroup;
                    });
                    this.getScoringList(false);
                    let numInterval = setInterval(() => {
                        intervalNum += 1;
                        if (reqNum === this.eventFieldList.length) {
                            clearInterval(numInterval);
                        }
                    }, 100);
                    if (intervalNum > 300) {
                        clearInterval(numInterval);
                    }
                });
        },
        changePriceIdList(e, type) {
            if (type === 0) {
                this.userValue = e.id;
            } else if (type === 1) {
                this.eventValue = e.id;
            }
            this.createFactorRule = {
                scoringModelId: this.modelId,
                id: '',
                type: type,
                isTemplate: false,
                attributeOrEventId: e.id,
                attributeOrEventInfo: e,
            };
        },
        // 隐藏状态筛选
        closeStatus() {
            this.chooseStatus = false;
        },
        //关闭评分等级表
        closeGrades() {
            this.gradesFlag = false;
            this.getModelInfo();
        },
        //关闭因子编辑弹窗
        closeScoreEdit() {
            this.factorEditFlag = false;
        },
        //获取模版详情
        getModelInfo() {
            ScoringV1
                .getModelInfo(this.modelId)
                .then((res) => {
                    this.modelName = res.body.data.modelName;
                    this.editedName = res.body.data.modelName;
                    this.gradesCount = res.body.data.gradesCount;
                    this.status = res.body.data.status;
                    let range = res.body.data.scoringRange;
                    this.scoringRange = range === 0 ? this.$t('scoring.allContacts') :
                        this.$t('scoring.before') + range + this.$t('scoring.pastContacts');
                })
                .catch((err) => {
                    if (err.body.errorCode === 'MODEL_DOES_NOT_EXIST') {
                        this.$toast(err.body.message, 'warn');
                        this.$router.push({name: 'scorerating'});
                    }
                });
        },
        //因子列表 关键字搜索
        searchFactor() {
            this.getScoringList(false);
        },
        //因子列表 筛选因子 全部/属性因子/事件因子
        filterFactor() {
            this.pageNumber = 1;
            this.totalPage = 1;
            this.getScoringList(false);
        },
        fieldEventName(factor) {
            let scoreRules = JSON.parse(factor.scoreRules);
            let obj = {
                iconName: '',
                fieldName: '',
                eventName: '',
                flag: true,
            };
            if (factor.type === 0) {//属性因子
                let attribute = this.customerFieldList.find((item) => {
                    return item.id === factor.attributeOrEventId;
                });
                if (!attribute) {
                    obj.fieldName = this.$t('scoring.fieldAvailable');
                    obj.flag = false;
                } else {
                    obj.fieldName = attribute.fieldCn + '( ' + attribute.fieldName + ' )';
                    obj.flag = true;
                }
                obj.iconName = '';
                obj.eventName = '';
                return obj;
            }
            if (factor.type === 1) {//事件因子
                let eventGroupId = scoreRules.rules[0].eventGroupId;
                let eventId = scoreRules.rules[0].eventId;
                let groupObj = this.eventFieldList.find((item) => {
                    return item.id === eventGroupId;
                });
                if (!groupObj) {
                    obj.fieldName = this.$t('scoring.eventAvailable');
                    obj.flag = false;
                    return obj;
                }
                let event = groupObj.child.find((item) => {
                    return item.id === eventId;
                });
                if (!event) {
                    obj.fieldName = this.$t('scoring.eventAvailable');
                    obj.flag = false;
                } else {
                    obj.fieldName = event.name + '( ' + event.fieldName + ' )';
                    obj.iconName = event.event_group;
                    obj.eventName = event.fieldName;
                    obj.flag = true;
                }
                return obj;
            }
        },
        /**获取因子list
         * @param true:获取模版因子列表 false:获取因子列表
         */
        getScoringList(flag) {
            this.loading = true;
            if (flag) {
                //获取模版因子列表
                ScoringV1
                    .getScoringList({
                        scoringModelId: '',
                        type: '',
                        keyword: this.templateKey,
                        isTemplate: true,
                        pageNumber: this.temPageNumber,
                        pageSize: 10
                    })
                    .then((res) => {
                        this.scoringFactorTemList =
                            this.scoringFactorTemList.concat(res.body.data.factorList);
                        this.temTotal = res.body.data.totalPage;
                        this.loading = false;
                    })
                    .catch((err) => {
                        if (err.body.errorCode === 'MODEL_DOES_NOT_EXIST') {
                            this.$toast(err.body.message, 'warn');
                            this.$router.push({name: 'scorerating'});
                        }
                    });
            } else {
                ScoringV1
                    .getScoringList({
                        scoringModelId: this.modelId,
                        type: this.scoringStatus,
                        keyword: this.keyword,
                        isTemplate: false,
                        pageNumber: this.pageNumber,
                        pageSize: 50
                    })
                    .then((res) => {
                        this.fullScore = res.body.data.fullScore || 0;
                        this.scoringFactorList = res.body.data.factorList;
                        this.totalPage = res.body.data.totalPage;
                        this.loading = false;
                    })
                    .catch((err) => {
                        if (err.body.errorCode === 'MODEL_DOES_NOT_EXIST') {
                            this.$toast(err.body.message, 'warn');
                            this.$router.push({name: 'scorerating'});
                        }
                    });
            }
        },
        //ready create factor
        readyCreate() {
            this.createFactorRule = {
                scoringModelId: '',
                id: '',
                type: '',
                isTemplate: '',
                attributeOrEventId: '',
                attributeOrEventInfo: {}
            };
            this.factorFlag = true;
            this.getScoringList(true);
        },
        //从模版库中选择
        loadMore() {
            if (this.temTotal > this.temPageNumber) {
                this.temPageNumber += 1;
                this.getScoringList(true);
            }
        },
        /**
         * 切换创建方式
         * 从空白中创建:0,从模版库中选择：1
         */
        choseCreatScoreType(type) {
            this.newScoreType = type;
            this.type = 0;
            this.userValue = '';
            this.eventValue = '';
            this.selectFactorErr = '';
            this.createFactorRule = {
                scoringModelId: '',
                id: '',
                type: '',
                isTemplate: '',
                attributeOrEventId: '',
                attributeOrEventInfo: {}
            };
        },
        //确定创建:1 / 取消创建:0
        factorClose(type) {
            if (type === 1 && (!this.createFactorRule.attributeOrEventId && !this.createFactorRule.id)) {
                this.selectFactorErr = this.$t('scoring.dataRequired');
                return;
            }
            if (type === 1) {
                this.factorEditFlag = true;
            }
            this.newScoreType = 0;
            this.type = 0;
            this.factorFlag = false;
            this.userValue = '';
            this.eventValue = '';
            this.selectFactorErr = '';

            //从模版库中选择 模版因子列表
            this.pageNumber = 1;
            this.totalPage = 1;

            this.templateKey = '';
            this.temPageNumber = 1;
            this.temTotal = 1;
            this.scoringFactorTemList = [];
        },
        //模版库中选择 - search模版因子
        searchFactorTem(keyWord) {
            this.scoringFactorTemList = [];
            this.templateKey = keyWord;
            this.temPageNumber = 1;
            this.temTotal = 1;
            this.getScoringList(true);
        },
        //从模版库中选择
        selectFactorTem(factor) {
            this.createFactorRule = {
                scoringModelId: this.modelId,
                id: factor.id,
                type: this.type,
                isTemplate: false,
                attributeOrEventId: factor.attributeOrEventId,
                newFactorFlag: true,
            };
        },
        //编辑因子
        editFactor(factor) {
            this.createFactorRule = {
                scoringModelId: this.modelId,
                id: factor.id,
                type: factor.type,
                isTemplate: factor.isTemplate,
                attributeOrEventId: factor.attributeOrEventId,
            };
            this.factorEditFlag = true;
        },
        //操作成功提示并刷新因子列表
        optSuccess() {
            this.$toast(this.$t('menu.synSuccess'), 'success');
            this.getScoringList(false);
        },
        //上移下移
        factorMove(type, next, factor) {
            let lastId = '', nextId = '';
            if (type === 'up') {//上移
                nextId = factor.id;
                lastId = this.scoringFactorList[next - 1].id;
            } else {//下移
                lastId = factor.id;
                nextId = this.scoringFactorList[next + 1].id;
            }
            ScoringV1
                .upAndDown(lastId, nextId, this.modelId)
                .then(() => {
                    this.optSuccess();
                })
                .catch((err) => {
                    if (err.body.errorCode === 'MODEL_DOES_NOT_EXIST') {
                        this.$toast(err.body.message, 'warn');
                        this.$router.push({name: 'scorerating'});
                    }
                    if (err.body.errorCode === 'FACTOR_DOES_NOT_EXIST') {
                        this.$toast(err.body.message, 'warn');
                        this.getScoringList(false);
                    }
                });
        },
        //ready to 保存为模版
        readyFactorTem(factor) {
            this.saveFactorFlag = true;
            this.curFactor = factor;
        },
        //保存为模版
        saveFactorToTem() {
            ScoringV1
                .saveFactorToTem(this.curFactor.id, this.modelId)
                .then(() => {
                    this.$toast(this.$t('openPlat.desenSave'), 'success');
                    this.getScoringList(false);
                    this.curFactor = '';
                })
                .catch((err) => {
                    if (err.body.errorCode === 'MODEL_DOES_NOT_EXIST') {
                        this.$toast(err.body.message, 'warn');
                        this.$router.push({name: 'scorerating'});
                    }
                    if (err.body.errorCode === 'FACTOR_DOES_NOT_EXIST') {
                        this.$toast(err.body.message, 'warn');
                        this.getScoringList(false);
                    }
                });
            this.saveFactorFlag = false;
        },
        //复制因子
        copyFactor(id) {
            ScoringV1
                .copyFactor(id, this.modelId)
                .then(() => {
                    this.optSuccess();
                })
                .catch((err) => {
                    if (err.body.errorCode === 'MODEL_DOES_NOT_EXIST') {
                        this.$toast(err.body.message, 'warn');
                        this.$router.push({name: 'scorerating'});
                    }
                    if (err.body.errorCode === 'FACTOR_DOES_NOT_EXIST') {
                        this.$toast(err.body.message, 'warn');
                        this.getScoringList(false);
                    }
                });
        },
        /**
         * ready del
         * @param type = 0单个删除/type=1:批量删除
         */
        readyDel(type, factor) {
            if (type === 1 && this.checkedItem.length === 0) {
                this.$toast(this.$t('scoring.leastScore'), 'warn');
                return;
            }
            this.batchDel = true;
            this.curFactor = factor;
            this.singleBatchDel = type === 0 ? false : true;
        },
        /**
         * 单个/批量删除因子
         */
        delFactor() {
            this.batchDel = false;
            let factorIdArray = [];
            if (this.singleBatchDel) {//批量
                factorIdArray = this.checkedItem;
            } else {
                factorIdArray.push(this.curFactor.id);
            }
            ScoringV1
                .delFactor(factorIdArray, this.modelId)
                .then(() => {
                    this.$toast(this.$t('scoring.deletedSuccessfully'), 'success');
                    this.getScoringList(false);
                })
                .catch((err) => {
                    if (err.body.errorCode === 'MODEL_DOES_NOT_EXIST') {
                        this.$toast(err.body.message, 'warn');
                        this.$router.push({name: 'scorerating'});
                    }
                    if (err.body.errorCode === 'FACTOR_DOES_NOT_EXIST') {
                        this.$toast(err.body.message, 'warn');
                        this.getScoringList(false);
                    }
                });
            this.checkedItem = [];
            this.curFactor = '';
        },
        // 全选当前页数据
        choosePageData() {
            this.checkedItem = this.scoringFactorList.map(item => item.id);
        },
        // 清空选中数据
        clearChoose() {
            this.checkedItem = [];
        }
    }
};
</script>

<style lang="scss" type="text/scss" rel="stylesheet/scss">
@import '../../common/scss/base/_variables';
@import '../../common/scss/base/_mixin';

.scoring-manage {
    min-width: 900px;

    .cursor-pointer {
        cursor: pointer;
    }

    .page-head {
        .opt-head {
            display: flex;
            justify-content: space-between;

            .left-opt {
                max-width: 35em;
                display: flex;
                align-items: center; /*  子元素相对父元素垂直居中 */
                .model-name {
                    display: inline-block;
                    margin: 0 10px;
                    font-weight: bold;
                    font-size: 18px;
                    max-width: 18em;
                    text-overflow: ellipsis;
                    overflow: hidden;
                    white-space: nowrap;
                }

                svg {
                    width: 16px;
                    height: 16px;
                    fill: $theme;
                }
            }

            .right-opt {
                width: 35px;

                .icon {
                    display: inline-block;
                    border: 1px solid $border-color;
                    padding: 0 10px;
                }

                .icon-kaishi {
                    color: $theme;
                }

                .icon-pause {
                    color: $light-red;
                }
            }
        }
    }

    .page-content {
        .content-scoring-list {
            margin: 25px;

            .scoring-opt-about {
                display: flex;
                margin: 20px 0;

                .score, .score-num {
                    width: 20%;
                    margin-right: 10px;

                    .bold {
                        font-size: 20px;
                    }
                }

                .score-range {
                    width: 60%;

                    .scoring-mech {
                        display: flex;

                        span {
                            display: inline-block;
                            width: 48%;
                        }

                        .left-span {
                            text-align: right;
                        }

                        .right-span {
                            text-align: left;
                        }
                    }
                }

                .score, .score-num, .score-range {
                    background-color: white;
                    padding: 20px;
                    text-align: center;
                }

                .bold {
                    font-weight: bold;
                }
            }

            .scoring-list {
                background-color: white;
                padding: 20px 10px;

                .score-list-head {
                    display: flex;
                    justify-content: space-between;
                    margin-bottom: 15px;

                    .title-text {
                        line-height: 32px;
                    }

                    .new-score-btn {
                        height: 32px;
                    }
                }

                .scoring-list-table {
                    .list-actions {
                        display: flex;
                        align-items: center;

                        .btn {
                            display: inline-block;
                            padding: 0 3px;

                            svg {
                                width: 16px;
                                height: 16px;
                            }

                            .theme-icon {
                                fill: $theme;
                            }

                            .icon-copy {
                                fill: $blue;
                            }

                            .icon-shanchu {
                                fill: $light-red;
                            }
                        }

                        .move-up {
                            transform: rotate(180deg);
                        }

                        .btn + .btn {
                            margin: 0;
                        }
                    }

                    .filter-box {
                        display: inline-block;
                        position: relative;

                        svg {
                            fill: currentColor;
                            width: 14px;
                            height: 14px;
                            vertical-align: middle;
                            margin-left: 1px;
                        }

                        .radio {
                            padding: 0 10px;
                            display: block;
                            margin: 0;
                        }

                        .drop-list {
                            position: absolute;
                            z-index: 1;
                            left: 0;
                            top: 100%;
                            border-radius: 4px;
                            border: 1px solid $border-color;
                            background-color: $content-bg;
                            line-height: $input-field-height;
                            white-space: nowrap;
                        }
                    }

                    table {
                        tr {
                            th {
                                padding: 0 10px;
                            }
                        }

                        tbody {
                            tr {
                                td {
                                    white-space: normal;
                                }
                            }
                        }
                    }

                    th {
                        box-sizing: border-box;
                        overflow: visible;

                        &:not([width]) {
                            width: 100%;
                        }

                        &:last-child {
                            width: 180px;
                        }
                    }

                    .icon-field-name {
                        display: flex;
                        align-items: center;

                        .attribute-icon {
                            width: 24px;
                            height: 24px;
                        }

                        svg {
                            margin: 0 8px 0 0;
                            flex-shrink: 0;
                        }
                    }

                }
            }
        }
    }

    .create-scoring {
        .tab-links {
            margin-bottom: 20px;
        }

        .selector {
            width: 200px;
        }

        .err-code {
            color: $light-red;
            padding-left: 130px;
        }
    }

    .rename {
        .name-err {
            color: $light-red;
            padding-left: 130px;
        }
    }
}

</style>
