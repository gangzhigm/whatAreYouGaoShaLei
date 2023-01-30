<template>
    <div class="content-container user-group">
        <div class="content-view">
            <div class="toolbar">
                <crumbs class="pull-left"/>
            </div>
        </div>
        <div class="page-head">
            <div class="content-view">
                <h1>{{$route.meta.name | t}}</h1>
            </div>
        </div>
        <div class="user-group-content content-view">
            <!--左侧导航-->
            <div class="user-group-list">
                <div class="keyword-search">
                    <svg aria-hidden="true">
                        <use xlink:href="#icon-search"></use>
                    </svg>
                    <input type="text" v-model.trim="keyword" :placeholder="$t('userGroup.findSome')" maxlength="30">
                </div>
                <div class="user-group-list-content">
                    <!-- 默认分群分组 -->
                    <div class="cluster" :title="defaultCluster.name"
                         :class="{active: group.userGroupClusterId === defaultCluster.id}">
                        <button type="button" class="toggle-action-btn" @click="toggleCluster(defaultCluster.id)"
                                :class="{open: openViews.clusterIds.includes(defaultCluster.id)}">
                            <svg aria-hidden="true">
                                <use xlink:href="#icon-right"></use>
                            </svg>
                        </button>
                        {{defaultCluster.name}}
                    </div>
                    <div class="cluster-content">
                        <draggable v-model="defaultCluster.userGroups" @change="changeOverHives($event, defaultCluster)"
                                   v-if="openViews.clusterIds.includes(defaultCluster.id)"
                                   :class="{empty: defaultCluster.userGroups.length === 0}"
                                   :group="{name: 'default', put: ['default','custom']}" :animation="150"
                                   :no-group="$t('userGroup.noGroup')">
                            <router-link v-for="group in filteredDefaultGroups" :key="group.id"
                                         :to="{name: 'userGroup', params: {id: group.id}}" :title="group.name">
                                {{group.name}}
                            </router-link>
                        </draggable>
                        <button type="button" class="create-btn" @click="addUserGroup(defaultCluster.id)"
                                v-if="openViews.clusterIds.includes(defaultCluster.id)">
                            <svg aria-hidden="true">
                                <use xlink:href="#icon-plus"></use>
                            </svg>
                            {{'userGroup.createUserGroup' | t}}
                        </button>
                    </div>
                    <!-- 自定义分群分组 -->
                    <draggable v-model="customClusters" :group="{name: 'customCluster', put:['customCluster']}"
                               :animation="150" @change="sortOverhiveClusters">
                        <div v-for="(cluster,clusterIdx) in filteredCustomClusters">
                            <div class="cluster" :title="cluster.name"
                                 :class="{active: group.userGroupClusterId === cluster.id}">
                                <button type="button" class="toggle-action-btn" @click="toggleCluster(cluster.id)"
                                        :disabled="clusterForm && editingCluster.id === cluster.id"
                                        :class="{open:openViews.clusterIds.includes(cluster.id)}">
                                    <svg aria-hidden="true">
                                        <use xlink:href="#icon-right"></use>
                                    </svg>
                                </button>
                                <div class="delete-action-btn" :class="{active: cluster.id === deletingClusterId}">
                                    <svg aria-hidden="true" @click.stop="deletingClusterId = cluster.id">
                                        <use xlink:href="#icon-round-close"></use>
                                    </svg>
                                    <inline-confirm v-if="deletingClusterId === cluster.id"
                                                    @confirm="deleteCluster(cluster)"
                                                    @cancel="deletingClusterId = ''"
                                                    :text="cluster.userGroups.length ? $t('userGroup.afterDelete') : $t('userGroup.confirmDel')"/>
                                </div>
                                <button type="button" class="edit-action-btn"
                                        @click.stop="editCluster(cluster, clusterIdx)">
                                    <svg aria-hidden="true">
                                        <use xlink:href="#icon-pencil"></use>
                                    </svg>
                                </button>
                                {{cluster.name}}
                            </div>
                            <creator v-if="clusterForm && editingCluster.id === cluster.id"
                                     v-model="editingCluster.name" @clear="clusterErrorText = ''"
                                     :error-text="clusterErrorText" @confirm="saveCluster"
                                     @cancel="cancelClusterModal"/>
                            <!-- 分组中的分群列表 -->
                            <div class="cluster-content" v-if="openViews.clusterIds.includes(cluster.id)">
                                <draggable v-model="cluster.userGroups" @change="changeOverHives($event, cluster)"
                                           :class="{empty: cluster.userGroups.length === 0}"
                                           :group="{name: 'custom', put: ['default','custom']}" :animation="150"
                                           :no-group="$t('userGroup.noGroup')">
                                    <router-link v-for="group in cluster.userGroups" :key="group.id"
                                                 :to="{name: 'userGroup', params: {id: group.id}}" :title="group.name">
                                        {{group.name}}
                                    </router-link>
                                </draggable>
                                <button type="button" class="create-btn" @click="addUserGroup(cluster.id)">
                                    <svg aria-hidden="true">
                                        <use xlink:href="#icon-plus"></use>
                                    </svg>
                                    {{'userGroup.createUserGroup' | t}}
                                </button>
                            </div>
                        </div>
                    </draggable>
                    <!-- 新增分组 -->
                    <creator v-if="clusterForm && !editingCluster.id" v-model="editingCluster.name"
                             @clear="clusterErrorText = ''"
                             :error-text="clusterErrorText" @confirm="saveCluster" @cancel="cancelClusterModal"/>
                    <button type="button" class="create-btn" @click="createCluster">
                        <svg aria-hidden="true">
                            <use xlink:href="#icon-plus"></use>
                        </svg>
                        {{'userGroup.addGroup' | t}}
                    </button>
                    <block-empty v-if="listEmpty" :search="keyword"/>
                </div>
            </div>

            <!-- 分群内容 -->
            <div class="user-group-detail">
                <template v-if="group.id && userGroups.length">
                    <!--显示名和分群名部分-->
                    <div class="group-head">
                        <switch-button class="pull-right" :value="group.enable" @input="setEnableGroup(group.id)"
                                       :disabled="storeLoading" v-if="typeof group.id === 'number'">
                            {{group.enable ? $t('userGroup.using') : $t('userGroup.closed')}}
                        </switch-button>
                        <button type="button" :disabled="!group.validCount" class="user-list-link" @click="pushRouter">
                            {{typeof group.validCount === 'number' ? group.validCount : $t('common.noData')}}
                        </button>
                        <span class="pull-right disabled-text">{{'userGroup.wholePeople' | t}}：</span>
                        <span class="pull-right light-content-text update-time">{{group.updateTime}}</span>
                        <span class="pull-right disabled-text " v-if="group.updateTime">{{'eventAnalysis.dataUpdateTime' | t}}：</span>
                    </div>
                    <!--主条件区域-->
                    <div class="user-group-container">
                        <div class="group-name">
                            <label class="label" for="group-name">{{'userGroup.groupingName' | t}}</label>
                            <input type="text" id="group-name" class="input lg" v-model.trim="group.name"
                                   :class="{error: errorText}" v-title:right.line.warn="errorText"
                                   @focusin="errorText = ''" maxlength="30">
                        </div>
                        <p class="user-group-notice">{{'userGroup.satisfiedRule' | t}}</p>
                        <condition-group :key="group.id"
                                         :autoValidation="autoValidation"
                                         :user-attrs="userAttrs"
                                         :user-groups="availableGroups"
                                         :events="events"
                                         :user-filter.sync="userFilter"
                                         :done-filters.sync="doneFilters"
                                         :relations.sync="group.relations"/>
                        <template v-if="extraContentVisible">
                            <button type="button" class="group-relation-btn"
                                    @click="group.extraGroupRelation = group.extraGroupRelation === 'or' ? 'and' : 'or'">
                                {{group.extraGroupRelation === 'or' ? $t('common.and') : $t('common.or')}}
                            </button>
                            <condition-group v-for="(contentGrp, index) in extraContentGroups"
                                             :key="group.id + '_' + index"
                                             :autoValidation="autoValidation"
                                             :user-attrs="userAttrs"
                                             :user-groups="availableGroups"
                                             :events="events"
                                             :user-filter="contentGrp.userFilter"
                                             @update:userFilter="updateExtraUserFilter($event, index)"
                                             :done-filters="contentGrp.doneFilters"
                                             @update:doneFilters="updateExtraDoneFilters($event, index)"
                                             :relations="contentGrp.relations"
                                             @update:relations="updateExtraRelations($event, index)"/>
                        </template>
                        <button type="button" class="btn btn-md btn-blue-border extra-condition-btn"
                                @click="toggleExtraGroup"
                                :class="{open: extraContentVisible}">
                            <svg aria-hidden="true">
                                <use xlink:href="#icon-arrow-down"></use>
                            </svg>
                            {{extraContentVisible ? $t('userGroup.closeCluster') : $t('userGroup.expandCluster')}}
                        </button>
                        <!--备注-->
                        <div class="comment">
                            <span class="comment-name">{{'userGroup.mark' | t}}</span>
                            <textarea class="textarea" v-model.trim="group.desc" maxlength="255"
                                      :placeholder="$t('userGroup.groupingMark')"></textarea>
                        </div>
                        <!--保存-->
                        <div class="save">
                            <button class="pull-left btn btn-md btn-red-border" type="button"
                                    v-if="typeof group.id === 'number'"
                                    :disabled="groupDepended" @click="delUserGroup">
                                {{'userGroup.deleteGrouping' | t}}
                                <!-- v-if条件解释：新增的分群id是一个临时的字符串，保存过的就是数字了，以此作区分 -->
                            </button>

                            <button class="btn btn-md btn-blue" type="button" :title="errorText"
                                    @click="saveUserGroup(1)">{{'userGroup.execute' | t}}
                            </button>
                            <button class="btn btn-md btn-theme" type="button" :title="errorText"
                                    :disabled="storeLoading"
                                    @click="saveUserGroup(0)">{{'common.save' | t}}
                            </button>
                            <p class="dependency-tip" v-if="groupDepended">{{groupDependedTip}}</p>
                        </div>
                    </div>
                </template>
                <block-empty v-else-if="userGroups.length === 0"/>
                <back-top ref="backTop"/>
            </div>
        </div>
        <kudu-modal></kudu-modal>
    </div>
</template>
<script>
    import { WebServClusterApiV1, webServUserGroupApiV1, WebServAttrApiV1, WebServEventApiV1 } from '@/api';
    import cloneDeep from 'lodash/cloneDeep';
    import debounce from 'lodash/debounce';
    import delay from 'lodash/delay';
    import ConditionGroup from './condition-group.vue';
    import filterArrayByName from '@/common/utils/filterArrayByName';
    import {ARBITRARY_EVENT_ID} from '../components/ANALYSIS_QUERY_RULES';
    import intersectionBy from 'lodash/intersectionBy';
    import groupDependencyTree, {getDepIds, TreeNode} from './DependencyTree';
    import {KEY_PREFIXES} from '@/store/vuex/modules/analysisStore';
    import {SET_AUTH_LOCK} from '@/store/vuex/mutationTypes';
    import isEqual from 'lodash/isEqual';
    import isPlainObject from 'lodash/isPlainObject';
    import {COMMON_NAME_REGEXP} from '@/common/utils/regs';
    import Creator from './creator.vue';
    import {logError, trackEvent} from '@/monitor';
    import KuduModal from '../kudumodal.vue';
    import { mapState } from 'vuex';

    //展开分群分组
    const CLUSTER_OPEN_VIEWS = 'CLUSTER_OPEN_VIEWS';
    // 新用户组构造 id 的前缀
    const NEW_GROUP_ID_PREFIX = 'NEW_GROUP_ID_PREFIX';
    // 用户分群条件簇内content.contentType
    const USER_ATTR_FILTER = 'user';    // "用户属性满足"
    const DONE_EVENT_FILTER = 'event';  // "做过…"

    /**
     * 生成一个用户属性筛选条件结构
     */
    function userFilterContentFactory() {
        return {
            contentType: USER_ATTR_FILTER,
            userFilter: {
                filter: {
                    relation: 'and',
                    conditions: []
                }
            }
        };
    }

    /**
     * 生成一个新的用户组
     * @return {{id: string, name: string, createTime: string, validCount: string, contents: *[]}}
     */
    function groupFactory() {
        const newUserFilterContent = userFilterContentFactory();
        return {
            id: NEW_GROUP_ID_PREFIX + Date.now(),
            type: 0,    // 区分用户分群由前端创建/报告系统保存
            name: '',
            createTime: '',
            validCount: '',
            eventIds: [],   // 选择任意事件时，事件id列表
            // 第一个表示最外层的and/or, content之间的关系
            // 第二个参数表示多个event事件之间的关系，
            // 第三个参数表示多个行为序列之间的关系
            // 第四个参数表示多个评估定义之间的关系
            relations: ['and', 'and', 'and', 'and'],
            contents: [newUserFilterContent],
            extraGroupRelation: 'and',  // 所有条件簇之间的关系
            extraContents: [],          // 其它条件簇
            enable: false,   //是否启用，默认false
            userGroupClusterId: '',   //分组ID,如果有默认分组，就存默认分组的分组ID，新建分群的时候赋值

        };
    }

    /**
     * 生成一个新的条件簇
     */
    function conditionGroupFactory() {
        const newUserFilterContent = userFilterContentFactory();
        return {
            // 第一个表示最外层的and/or, content之间的关系
            // 第二个参数表示多个event事件之间的关系，
            // 第三个参数表示多个行为序列之间的关系
            // 第四个参数表示多个评估定义之间的关系
            relations: ['and', 'and', 'and', 'and'],
            contents: [newUserFilterContent],
        };
    }

    /**
     * 生成一个"做过"条件组
     */
    export const DoneFilterUtils = {
        /**
         * 创建一个新的"做过"条件组，接口可用的结构
         */
        create() {
            return {
                // 做过
                contentType: DONE_EVENT_FILTER,
                havingFilter: {
                    aggreator: '',
                    function: '',
                    attrId: '',
                    attrGenre: '',
                    numberPrecision: '',
                    params: [],
                    paramsInterval: ['include', 'include'],
                    valid: false,
                },
                eventFilter: {
                    eventId: '',        // 0 代表任意事件
                    filter: {
                        relation: 'and',
                        conditions: []
                    },
                    fromDate: '',
                    toDate: '',
                    timeType: '', // dynamic 动态时间
                    dynamicTimeParams: [],  // [-5,0,'day']
                    virtualCode: ''
                }
            };
        },
        /**
         * 转化为组件可用的结构
         */
        flatten: (
            {
                havingFilter: {
                    aggreator,
                    'function': f,
                    attrId,
                    attrGenre,
                    numberPrecision,
                    params,
                    paramsInterval,
                    valid = true,
                },
                eventFilter: {
                    eventId,        // 0 代表任意事件
                    filter,
                    fromDate,
                    toDate,
                    timeType, // dynamic 动态时间
                    dynamicTimeParams,  // [-5,0,'day']
                    virtualCode
                },
                ...otherFields
            }
        ) => ({
            fromDate, toDate, timeType, dynamicTimeParams, eventId, 'function': f, params, paramsInterval, valid,
            attrId, attrGenre, aggreator, numberPrecision, filter, virtualCode, ...otherFields
        }),
        /**
         * 转化为接口可用的结构
         */
        reverse: (
            {
                fromDate, toDate, timeType, dynamicTimeParams, eventId,
                'function': f, params, paramsInterval, attrId, attrGenre,
                aggreator, numberPrecision, filter, virtualCode, valid, ...otherFields
            }
        ) => ({
            contentType: DONE_EVENT_FILTER,
            havingFilter: {
                aggreator,
                'function': f,
                attrId,
                attrGenre,
                numberPrecision,
                params,
                paramsInterval,
                valid,
            },
            eventFilter: {
                eventId,        // 0 代表任意事件
                filter,
                fromDate,
                toDate,
                timeType, // dynamic 动态时间
                dynamicTimeParams,  // [-5,0,'day']
                virtualCode
            },
            ...otherFields
        })
    };

    /**
     * 把接口返回的用户分群结构转换为组件可用的结构
     * @param userGroupFromApi
     * @return {{} & any & any & {key: string}}
     */
    function parseGroup(userGroupFromApi) {
        const partial = JSON.parse(userGroupFromApi.astrictStr);
        delete userGroupFromApi.astrictStr;
        delete partial.enable;
        delete partial.id;

        // 1. remove dependency user groups' detail JSON
        delete partial.groupInfoList;

        // 2. 属性、事件分析页面转化成的分群结构不完整，在此初始化
        // 2.1 ensure there is one and only one userFilterContent inside partial.contents
        if (!partial.contents.some(content => content.contentType === USER_ATTR_FILTER)) {
            partial.contents.push(userFilterContentFactory());
        }

        // 2.2 ensure group.relations is ready: exist and long enough
        // 第一个表示最外层的and/or, 第二个参数表示多个event事件之间的关系，
        // 第三个参数表示多个行为序列之间的关系，第四个参数表示多个评估定义之间的关系
        if (!partial.relations) {
            partial.relations = [
                partial.userWithEventRelation || 'and',
                partial.eventRelation || 'and',
                partial.eventSequenceRelation || 'and',
                partial.evaluateRelation || 'and',
            ];
        } else if (partial.relations.length !== 4) {
            partial.relations = [
                partial.relations[0] || partial.userWithEventRelation || 'and',
                partial.relations[1] || partial.eventRelation || 'and',
                partial.relations[2] || partial.eventSequenceRelation || 'and',
                partial.relations[3] || partial.evaluateRelation || 'and',
            ];
        }
        delete partial.userWithEventRelation;
        delete partial.eventRelation;
        delete partial.eventSequenceRelation;
        delete partial.evaluateRelation;

        // 2.3.1 重新整理主条件簇 contents 的顺序，保证: '用户属性满足' -> '做过' -> ……
        const eventContents = [], userContents = [];
        partial.contents
            .forEach(content => {
                switch (content.contentType) {
                    case USER_ATTR_FILTER:
                        userContents.push(content);
                        break;
                    case DONE_EVENT_FILTER:
                        eventContents.push(content);
                        break;
                    default:
                        logError(`[数据分析-用户分群] <user-group/> parseGroup 发现一个尚未识别的条件簇内容类型：${content.contentType}`);
                }
            });
        partial.contents = userContents.concat(eventContents);
        // 2.3.2 "做过"条件组 done-filter 可能缺失一些字段，这里补足
        eventContents.forEach(content => {
            if (!content.havingFilter.paramsInterval) {
                content.havingFilter.paramsInterval = ['include', 'include'];
            }
        });

        // 2.4 ensure extraContents' structure is valid
        partial.extraContents.forEach(conditionGroup => {
            // 2.4.1 conditionGroup.contents same action as 2.1
            if (!conditionGroup.contents) {
                conditionGroup.contents = [userFilterContentFactory()];
            } else if (!conditionGroup.contents.some(content => content.contentType === USER_ATTR_FILTER)) {
                conditionGroup.contents.push(userFilterContentFactory());
            }
            // 2.4.2 conditionGroup.relations same action as 2.2
            if (!conditionGroup.relations) {
                conditionGroup.relations = [
                    conditionGroup.userWithEventRelation || 'and',
                    conditionGroup.eventRelation || 'and',
                    conditionGroup.eventSequenceRelation || 'and',
                    conditionGroup.evaluateRelation || 'and',
                ];
            } else if (conditionGroup.relations.length !== 4) {
                conditionGroup.relations = [
                    conditionGroup.relations[0] || conditionGroup.userWithEventRelation || 'and',
                    conditionGroup.relations[1] || conditionGroup.eventRelation || 'and',
                    conditionGroup.relations[2] || conditionGroup.eventSequenceRelation || 'and',
                    conditionGroup.relations[3] || conditionGroup.evaluateRelation || 'and',
                ];
            }
            delete conditionGroup.userWithEventRelation;
            delete conditionGroup.eventRelation;
            delete conditionGroup.eventSequenceRelation;
            delete conditionGroup.evaluateRelation;
            // 2.4.3 "做过"条件组 done-filter may lack some fields, same action as 2.3
            // 2.4.3.1 重新整理主条件簇 contents 的顺序，保证: '用户属性满足' -> '做过' -> ……
            const eventContents = [], userContents = [];
            conditionGroup.contents
                .forEach(content => {
                    switch (content.contentType) {
                        case USER_ATTR_FILTER:
                            userContents.push(content);
                            break;
                        case DONE_EVENT_FILTER:
                            eventContents.push(content);
                            break;
                        default:
                            logError(`[数据分析-用户分群] <user-group/> parseGroup 发现一个尚未识别的条件簇内容类型：${content.contentType}`);
                    }
                });
            conditionGroup.contents = userContents.concat(eventContents);
            // 2.4.3.2 "做过"条件组 done-filter 可能缺失一些字段，这里补足，同2.3.2
            eventContents.forEach(content => {
                if (!content.havingFilter.paramsInterval) {
                    content.havingFilter.paramsInterval = ['include', 'include'];
                }
            });
            // 2.4.4 remove conditionGroup.cid cuz it's not necessary and causing this.modified() inaccurate;
            delete conditionGroup.cid;
        });

        // 完成修补、转化，返回可用的userGroup
        return Object.assign({}, userGroupFromApi, partial, {
            key: KEY_PREFIXES.USER_GROUP + userGroupFromApi.id,
            validCount: userGroupFromApi.validCount,
            // according to ANALYSIS_QUERY_RULES.FUNCTION_MAP, userGroup behaves like a boolean genre
            attrGenre: 4
        });
    }

    export default {
        components: {Creator, ConditionGroup, KuduModal},
        data() {
            return {
                keyword: '',
                group: {
                    astrictStr: '',//条件
                    desc: '',  //备注
                    enable: false, //是否启用
                    name: '',
                    status: '',
                    type: '',
                    userGroupClusterId: '',
                    // 当前选中的group, 结构参照 groupFactory
                },
                extraContentVisible: false,
                events: [],     // 事件列表
                userAttrs: [],  // 用户属性列表
                autoValidation: false, // 自动校验

                errorText: '',          // 分群校验信息
                clusterErrorText: '',   // 分组校验信息
                clusterForm: false, // 分群分组的表单弹出层
                editingCluster: {}, // 正在编辑的分群分组
                currentClusterNum: null,
                deletingClusterId: '',  // 删除中的分组id
                defaultCluster: {
                    id: '',
                    name: this.$t('userGroup.defaultGrouping'),    // 默认组
                    userGroups: []
                },
                customClusters: [],     // 自定义分群分组列表
                // 各个分组的展开、收起状态
                openViews: {
                    clusterIds: [],
                },
            };
        },
        computed: {
            ...mapState({
                userId: state => state.user.cid,
                storeLoading: state => state.loading
            }),
            // 搜索无数据时
            listEmpty() {
                return this.filteredDefaultGroups.length === 0 && this.filteredCustomClusters.length === 0;
            },
            // 默认分组中分群的搜索展示
            filteredDefaultGroups() {
                return filterArrayByName(this.defaultCluster.userGroups, this.keyword);
            },
            //自定义分群和分组名称的搜索
            filteredCustomClusters() {
                if (this.keyword) {
                    let customClusters = cloneDeep(this.customClusters);
                    //筛选分群
                    for (let i = 0; i < customClusters.length; i++) {
                        customClusters[i].userGroups = filterArrayByName(customClusters[i].userGroups, this.keyword);
                        if (customClusters[i].userGroups.length === 0 && !customClusters[i].name.includes(this.keyword)) {
                            customClusters.splice(i--, 1);
                        }
                    }
                    return customClusters;
                }
                return this.customClusters;
            },
            userGroups() {
                return this.defaultCluster.userGroups.concat(
                    ...this.customClusters.map(cluster => cluster.userGroups)
                );
            },
            availableGroups() {
                return this.userGroups.filter(grp => {
                    // 当前分群不出现在列表中
                    if (grp.id === this.group.id)
                        return false;

                    // 未启用的分群不出现在列表中
                    if (!grp.enable)
                        return false;

                    let node = groupDependencyTree.getNode(grp.id);
                    if (node) {
                        // 依赖当前分群的分群不能在下拉框中被选择；
                        grp.disabled = node.dependsOn(this.group.id);
                        return true;
                    }
                    // 不存在依赖树中，证明其为新分群，不出现在列表中
                    return false;
                });
            },
            groupDepended() {
                const node = groupDependencyTree.getNode(this.group.id);
                return node ? node.necessary() : false;
            },
            groupDependedTip() {
                const node = groupDependencyTree.getNode(this.group.id);
                const superiors = node ? node.superiors : [];
                if (superiors.length) {
                    let firstSuperiorGroup = this.userGroups.find(group => group.id === superiors[0].id);
                    if (firstSuperiorGroup) {
                        return superiors.length > 1
                            ? `${this.$t('userGroup.groupRepeat')}【' + firstSuperiorGroup.name + '】${this.$t('userGroup.notDeletes')}`
                            : `${this.$t('userGroup.groupRepeat')}【' + firstSuperiorGroup.name + '】${this.$t('userGroup.notDelete')}`;
                    }
                }
                return '';
            },
            userFilter: {
                get() {
                    const userFilterContent = this.group.contents.find(content => content.contentType === USER_ATTR_FILTER);
                    if (!userFilterContent) {
                        logError(`[数据分析-用户分群] <user-group/> userFilter.get 当前分群定义缺少用户属性条件簇`);
                    }
                    return userFilterContent.userFilter.filter;
                },
                set(filter) {
                    const userFilterContent = this.group.contents.find(content => content.contentType === USER_ATTR_FILTER);
                    userFilterContent.userFilter.filter.relation = filter.relation;
                    userFilterContent.userFilter.filter.conditions = filter.conditions;
                }
            },
            doneFilters: {
                get() {
                    return this.group.contents
                        .filter(content => content.contentType === DONE_EVENT_FILTER)
                        .map(DoneFilterUtils.flatten);
                },
                set(filters) {
                    const reverseFilters = filters.map(DoneFilterUtils.reverse);
                    const userFilters = this.group.contents.filter(content => content.contentType === USER_ATTR_FILTER);
                    this.group.contents = userFilters.concat(reverseFilters);
                }
            },
            // 条件簇列表
            extraContentGroups() {
                return this.group.extraContents
                    .map(({relations, contents}) => {
                        const userFilterContent = contents.find(content => content.contentType === USER_ATTR_FILTER);
                        return {
                            relations,
                            userFilter: userFilterContent.userFilter.filter,
                            doneFilters: contents
                                .filter(content => content.contentType === DONE_EVENT_FILTER)
                                .map(DoneFilterUtils.flatten)
                        };
                    });
            }
        },
        async mounted() {
            // 获取属性列表
            await WebServAttrApiV1
                .getAttributes({
                    attrType: 0, // 0用户属性 2事件属性
                    isFilter: '',
                    isResult: '',
                    isDataAnalysis:true
                })
                .then(({body: {data: {attributeList}}}) => {
                    this.userAttrs = attributeList.map(attribute => {
                        attribute.name = attribute.meaning;
                        attribute.key = 'user_' + attribute.id;
                        return attribute;
                    });
                });
            // 获取事件列表
            await WebServEventApiV1
                .getEventList(this.userId,'',true)
                .then(({body: {data: {eventList}}}) => {
                    const events = eventList.map(event => {
                        event.name = event.meaning;
                        event.attributes.forEach(attr => {
                            attr.name = attr.meaning;
                            // init key for event.attributes
                            switch (attr.attrType) { // 0:用户, 1:商品，2:行为，undefined 用户分群
                                case 0: // 用户属性
                                    attr.key = KEY_PREFIXES.USER_ATTR + attr.id;
                                    break;
                                case 1: // 商品属性 暂无
                                    break;
                                case 2: // 行为 AKA 事件属性
                                    attr.key = KEY_PREFIXES.EVENT_ATTR + attr.id;
                                    break;
                                case undefined: // fixme 用户分群
                                    attr.key = KEY_PREFIXES.USER_GROUP + attr.id;
                                    break;
                                default:
                                    console.warn('事件分析：遍历指标内的筛选条件可用选项时，以下属性没有合适的分组：');
                                    break;
                            }

                        });
                        return event;
                    });
                    const arbitraryEvent = {
                        name: this.$t('eventAnalysis.anyEvent'),
                        id: ARBITRARY_EVENT_ID,
                        attributes: intersectionBy(...(events.map(event => event.attributes)), attr => attr.key)
                    };

                    events.unshift(arbitraryEvent);
                    this.events = events;
                });
            // 获取分群分组列表
            WebServClusterApiV1
                .getClusters()
                .then(({body: {data: {clusters}}}) => {
                    // 1. 拆分默认分组和其他分组，生成分群依赖树
                    groupDependencyTree.destroy();
                    for (let cluster of clusters) {    //默认的
                        // 1.1 生成依赖树、转化数据结构
                        cluster.userGroups = cluster.userGroups.map(userGroup => {
                            const depIds = getDepIds(userGroup.astrictStr);
                            const node = new TreeNode(
                                userGroup.id,
                                depIds
                            );
                            groupDependencyTree.feed(node);
                            return parseGroup(userGroup);
                        });
                        // 1.2 拆分
                        if (cluster.isDefault) {
                            this.defaultCluster = cluster;
                            if (this.defaultCluster.name === '')
                                this.defaultCluster.name = this.$t('userGroup.defaultGrouping');
                        } else {
                            this.customClusters.push(cluster);   //自定义的
                        }
                    }
                    groupDependencyTree.digest();

                    // 2. 恢复 展开/关闭 状态
                    const swarmCache = sessionStorage.getItem(CLUSTER_OPEN_VIEWS);
                    if (swarmCache) {
                        this.openViews = JSON.parse(swarmCache);
                    }

                    // 3. 选中一个分群：url中id > 第一个可选分群
                    this.$nextTick(() => {
                        if (String(this.$route.params.id)
                            .includes(NEW_GROUP_ID_PREFIX)) {
                            this.$router.replace({name: 'userGroup'});
                        } else if (this.$route.params.id) {
                            let groupId = Number(this.$route.params.id);
                            let group = this.userGroups.find(group => group.id === groupId);

                            if (groupId && group) {
                                this.checkoutGroup(groupId);
                            } else {
                                this.$store.commit(SET_AUTH_LOCK, {
                                    title: this.$t('common.noData'),
                                    message: this.$t('userGroup.noId') + groupId + this.$t('userGroup.noIdNext')
                                });
                            }
                        } else if (this.userGroups.length !== 0) {  //默认分组第一条分群
                            let firstGroup = this.userGroups[0];
                            this.$router.replace({
                                name: 'userGroup',
                                params: {id: firstGroup.id}
                            });
                        }
                    });
                });

            // 离开页面前检查是否有未保存分群
            window.addEventListener('beforeunload', this.leaveGuard);
        },

        beforeRouteLeave(to, from, next) {
            this.leaveGuard(next);
        },

        beforeRouteUpdate(to, from, next) {
            if (from.params.id) {
                this.leaveGuard(next, to);
            } else {
                next(true);
                this.checkoutGroup(to.params.id);
            }
        },

        beforeDestroy() {
            window.removeEventListener('beforeunload', this.leaveGuard);
        },

        methods: {
            // 切换分群的启用状态
            setEnableGroup(id) {
                this.group.enable = !this.group.enable;
                webServUserGroupApiV1
                    .enableGroup(id)
                    .catch(() => {
                        this.group.enable = !this.group.enable;
                    });
            },
            // 用户分群是否发生改变
            modified() {
                if (String(this.group.id)
                    .includes(NEW_GROUP_ID_PREFIX)) {
                    return false;
                }
                const originalGroup = this.userGroups.find(group => group.id === this.group.id);
                if (!originalGroup) {
                    return false;
                }

                // 比较两个分群是否相同时，valid/eventIds/key 等这些字段不做比较
                // 复制一个对象，并移除该对象上对userGroup不重要的字段
                const omitKeys = [
                    'valid', 'key', 'eventIds', 'disabled', 'attrGenre', '_exact', 'userGroupClusterId', 'enable'
                ];

                function filterFields(object) {
                    const target = {};
                    for (let key in object) {
                        if (object.hasOwnProperty(key) && !omitKeys.includes(key)) {
                            let value = object[key];
                            if (isPlainObject(value)) {
                                target[key] = filterFields(value);
                            } else if (Array.isArray(value)) {
                                target[key] = value.map(o => filterFields(o));
                            } else {
                                target[key] = value;
                            }
                        }
                    }

                    return target;
                }

                //originalGroup.desc => null   this.group.desc => 空
                //备注无内容，写上后又删除（相当于没修改），点别的分群会弹出编辑过的弹框
                if (isEqual(filterFields(originalGroup), filterFields(this.group))) {   //什么也没改
                    return false;
                } else if (!isEqual(filterFields(originalGroup), filterFields(this.group))  //别的没改。desc写了又删掉
                    && this.group.desc === '') {   // ‘==’ desc写了又删掉
                    return false;
                } else if (!isEqual(filterFields(originalGroup), filterFields(this.group))
                    && this.group.desc !== '') {  //改动了
                    return true;
                }
                // return !isEqual(filterFields(originalGroup), filterFields(this.group));
            },
            leaveGuard(nextOrEvent, to) {
                // 是否为新建的分群
                const creating = String(this.group.id)
                    .includes(NEW_GROUP_ID_PREFIX);
                const modified = this.modified();

                let confirmationMessage = '';
                if (creating) {
                    confirmationMessage = this.$t('userGroup.warnSaveLeave');
                } else if (modified) {
                    confirmationMessage = this.$t('userGroup.warnEditLeave');
                }

                if (typeof nextOrEvent === 'function') {
                    if (creating || modified) {
                        this.$confirm(this.$t('userGroup.confirmLeave'), confirmationMessage)
                            .then(sure => {
                                nextOrEvent(sure);
                                if (creating) { // 离开正在新增的分群之后，把未保存的分群移除掉
                                    let targetCluster = this.group.userGroupClusterId === this.defaultCluster.id
                                        ? this.defaultCluster
                                        : this.customClusters.find(cluster => cluster.id === this.group.userGroupClusterId);
                                    let targetIndex = targetCluster.userGroups
                                        .findIndex(group => group.id === this.group.id);
                                    targetCluster.userGroups.splice(targetIndex, 1);
                                }
                                if (sure && to && to.name === this.$route.name && to.params.id) {
                                    this.checkoutGroup(to.params.id);
                                }
                            });
                    } else {
                        nextOrEvent(true);
                        if (to && to.name === this.$route.name && to.params.id) {
                            this.checkoutGroup(to.params.id);
                        }
                    }
                } else {
                    if (creating || modified) {
                        (nextOrEvent || window.event).returnValue = confirmationMessage;     //Gecko + IE
                        return confirmationMessage; //Webkit, Safari, Chrome etc.
                    }
                }
            },

            pushRouter() {
                const key = this.userId + 'USER_GROUP_CACHE';
                localStorage.setItem(key, JSON.stringify({
                    queryObj: {
                        sliceByValues: '',
                        titleList: '',
                        markName: this.group.name,
                        value: this.group.validCount,
                    },
                    sendDataObj: {
                        id: this.group.id,
                        cid: this.userId,
                    },
                    userListData: {}
                }));

                this.$router.push({
                    name: 'groupUserList',
                    params: {id: this.group.id},
                    query: {
                        'timeStamp': key
                    }
                });
            },

            // 新增用户分群
            addUserGroup(clusterId) {
                const newGroup = groupFactory();  // 新增一个前端可用的分群
                newGroup.userGroupClusterId = clusterId;
                const targetCluster = clusterId === this.defaultCluster.id
                    ? this.defaultCluster
                    : this.customClusters.find(cluster => cluster.id === clusterId);
                targetCluster.userGroups.push(newGroup);
                this.$router.replace({name: 'userGroup', params: {id: newGroup.id}});
            },

            // 跳转路由后修改用户分群数据
            checkoutGroup(id) {
                let group = this.userGroups.find(group => group.id === id);
                this.group = cloneDeep(group);
                this.extraContentVisible = !!this.group.extraContents.length;
                this.autoValidation = false;
                this.errorText = '';
                this.$nextTick(() => {
                    this.$refs.backTop && this.$refs.backTop.backTop();
                });
            },

            toggleExtraGroup() {
                if (this.group.extraContents.length === 0) {
                    this.group.extraContents.push(conditionGroupFactory());
                }
                this.extraContentVisible = !this.extraContentVisible;
            },
            updateExtraUserFilter(newUserFilter, index) {
                const {relations, contents} = this.group.extraContents[index];
                const userFilterContentIdx = contents.findIndex(content => content.contentType === USER_ATTR_FILTER);
                const contentsCopy = cloneDeep(contents);
                contentsCopy[userFilterContentIdx].userFilter.filter = newUserFilter;
                this.group.extraContents.splice(index, 1, {
                    relations,
                    contents: contentsCopy
                });
            },
            updateExtraDoneFilters(newDoneFilters, index) {
                const reverseFilters = newDoneFilters.map(DoneFilterUtils.reverse);
                const {contents} = this.group.extraContents[index];
                const userFilters = contents.filter(content => content.contentType === USER_ATTR_FILTER);
                const newContents = userFilters.concat(reverseFilters);
                this.$set(this.group.extraContents[index], 'contents', newContents);
            },
            updateExtraRelations(newRelations, index) {
                this.$set(this.group.extraContents[index], 'relations', newRelations);
            },

            // 删除用户分群
            delUserGroup() {
                this.$confirm(this.$t('common.delete'), this.$t('userGroup.confirmDelGroup'))
                    .then(sure => {
                        if (sure) {
                            const targetCluster = this.group.userGroupClusterId === this.defaultCluster.id
                                ? this.defaultCluster
                                : this.customClusters.find(cluster => cluster.id === this.group.userGroupClusterId);
                            const targetIndex = targetCluster.userGroups.findIndex(group => group.id === this.group.id);
                            webServUserGroupApiV1
                                .del(this.group.id)
                                .then(() => {
                                    this.$toast(this.$t('common.deleteSuccess'), 'success');
                                    trackEvent('数据分析-用户分群-删除分群', {id: this.group.id});
                                    groupDependencyTree.drop(this.group.id);
                                    // 删除之后选中第一个分群
                                    targetCluster.userGroups.splice(targetIndex, 1);
                                    this.$nextTick(() => {
                                        if (this.userGroups.length !== 0) {  //默认分组第一条分群
                                            let firstGroup = this.userGroups[0];
                                            this.$router.replace({
                                                name: 'userGroup',
                                                params: {id: firstGroup.id}
                                            });
                                        } else {
                                            this.$router.replace({name: 'userGroup'});
                                        }
                                    });
                                });
                        }
                    });
            },
            // 分群的校验
            valid() {
                this.errorText = '';
                if (!this.autoValidation) {
                    return true;
                }
                //分群
                if (this.group.name.trim() === '') {
                    this.errorText = this.$t('userGroup.groupNameNoEmpty');
                    return false;
                } else if (!COMMON_NAME_REGEXP.test(this.group.name)) {
                    this.errorText = `${this.$t('eventAnalysis.groupName')}${this.$t('common.nameSpecial')}`;
                    return false;
                }
                // 用户属性满足
                let userFilterValid = this.userFilter.conditions
                    .every(condition => condition.valid === undefined || condition.valid);
                if (!userFilterValid) {
                    return false;
                }

                // "做过"事件满足
                let doneFiltersValid = this.doneFilters.every(doneFilter => (
                    doneFilter.valid === undefined || doneFilter.valid !== false)
                    && doneFilter.filter.conditions.every(condition => condition.valid === undefined || condition.valid)
                );
                if (!doneFiltersValid) {
                    return false;
                }

                // 额外条件的部分
                for (const group of this.extraContentGroups) {
                    // 用户属性满足
                    userFilterValid = group.userFilter.conditions
                        .every(condition => condition.valid === undefined || condition.valid);
                    if (!userFilterValid) {
                        return false;
                    }

                    // "做过"事件满足
                    doneFiltersValid = group.doneFilters.every(doneFilter => (
                        doneFilter.valid === undefined || doneFilter.valid !== false)
                        && doneFilter.filter.conditions.every(condition => condition.valid === undefined || condition.valid)
                    );
                    if (!doneFiltersValid) {
                        return false;
                    }
                }

                return true;
            },
            // 分组的校验
            verify() {
                this.clusterErrorText = '';
                if (!COMMON_NAME_REGEXP.test(this.editingCluster.name)) {
                    this.clusterErrorText = `${this.$t('eventAnalysis.groupName')}${this.$t('common.nameSpecial')}`;
                    return false;
                }

                if (this.customClusters.some(
                    cluster => cluster.id !== this.editingCluster.id && this.editingCluster.name === cluster.name
                )) {
                    this.clusterErrorText = this.$t('userGroup.groupNameNotRepeat');
                    return false;
                }

                return true;
            },
            // 删除分群分组
            deleteCluster(cluster) {
                // 删除分组保留其中的分群
                cluster.userGroups.forEach(group => {
                    // update astrictStr
                    group.userGroupClusterId = this.defaultCluster.id;
                    let groupForServer = this.transformGroupForSever(group);
                    // edit
                    webServUserGroupApiV1
                        .updateGroup(groupForServer);
                    // 在页面中先把要删除的分组中的分群push到默认分组中
                    this.defaultCluster.userGroups.push(group);
                });
                // 删除分组
                WebServClusterApiV1
                    .deleteCluster(cluster.id)
                    .then(() => {
                        this.customClusters.$deleteByKey(cluster.id);
                        this.deletingClusterId = '';
                        this.cancelClusterModal();
                        this.$toast(this.$t('userGroup.groupDeleted'), 'info');
                        trackEvent('数据分析-用户分群-删除分组', {id: cluster.id});
                    });
            },
            transformGroupForSever(userGroup, status) {
                const group = cloneDeep(userGroup);
                // 1 cid
                group.cid = this.userId;
                // 2 eventIds
                let astrictStr = JSON.stringify(group); // 字符串方便匹配依赖分群id、事件id
                let eventIds = [];
                const r = /"eventId":\s?(\d+)/g;
                let match = [];
                while (match) {
                    match = r.exec(astrictStr);
                    if (!match) break;
                    eventIds.push(match[1]);
                }
                const arbitrary = eventIds.map(Number)
                    .some(id => id === 0);
                group.eventIds = (
                    arbitrary
                        ? this.events.slice(1)
                            .map(event => event.id)
                        : eventIds
                ).map(Number);
                // 3 remove key
                delete group.key;
                // 4 新增分群移除前端构造的 id
                if (String(group.id)
                    .includes(NEW_GROUP_ID_PREFIX)) {
                    delete group.id;
                }
                // 5 astrictStr
                group.astrictStr = JSON.stringify(group);
                // 6 status
                if (status !== undefined)
                    group.status = status;
                // 7 type
                group.type = 0; //  区分用户分群由前端创建/报告系统保存

                return group;
            },
            /**
             * 保存，保存并执行
             * @param status 0:保存 1:保存并执行
             */
            saveUserGroup(status) {
                this.autoValidation = true;
                if (this.storeLoading) return;
                this.$loading();
                delay(() => {
                    if (!this.valid()) {
                        this.$nextTick(() => {
                            this.$refs.backTop && this.$refs.backTop.backTop();
                        });
                        this.$loaded();
                        return false;
                    }

                    const group = this.transformGroupForSever(this.group, status);
                    const targetCluster = group.userGroupClusterId === this.defaultCluster.id
                        ? this.defaultCluster
                        : this.customClusters.find(cluster => cluster.id === group.userGroupClusterId);

                    if (this.group.id && !String(this.group.id)
                        .includes(NEW_GROUP_ID_PREFIX)) {
                        // edit
                        webServUserGroupApiV1
                            .updateGroup(group)
                            .then(({body: {data: {userGroup}}}) => {
                                if (status === 0) {
                                    this.$toast(this.$t('common.saveSuccess'), 'success');
                                } else {
                                    this.$toast(this.$t('userGroup.executeSuccess'), 'success');
                                }
                                trackEvent('数据分析-用户分群-修改分群');
                                // update dependency
                                const depIds = getDepIds(userGroup.astrictStr);
                                groupDependencyTree.update(userGroup.id, depIds);

                                //因为astrictStr中的更新时间没变，所以还有再更新一下
                                // update astrictStr.updateTime
                                let newAstrictStr = JSON.parse(userGroup.astrictStr);
                                newAstrictStr.updateTime = userGroup.updateTime;
                                userGroup.astrictStr = JSON.stringify(newAstrictStr);
                                webServUserGroupApiV1
                                    .updateGroup(userGroup)
                                    .catch(() => {
                                        this.$loaded();
                                    });

                                // update user group
                                const targetIndex = targetCluster.userGroups.findIndex(group => group.id === userGroup.id);
                                targetCluster.userGroups.splice(targetIndex, 1, parseGroup(userGroup));
                                this.checkoutGroup(userGroup.id);

                                this.$nextTick(() => {
                                    this.$loaded();
                                });
                            })
                            .catch(() => {
                                this.$nextTick(() => {
                                    this.$loaded();
                                });
                            });
                    } else {
                        // 新增分群：1. 保存并执行新分群；2. 保存新分群。新的分群由于没有id，所以不能直接执行，需要先保存，在调用执行接口。
                        // 新增分群：a. 保存
                        group.status = 0;
                        webServUserGroupApiV1
                            .createGroup(group)
                            .then(({body: {data: {userGroup}}}) => {
                                if (status === 0) {
                                    this.$toast(this.$t('common.createSuccess'), 'success');
                                    trackEvent('数据分析-用户分群-新增分群');
                                }
                                // update astrictStr
                                let newAstrictObj = JSON.parse(userGroup.astrictStr);
                                newAstrictObj.id = userGroup.id;
                                userGroup.astrictStr = JSON.stringify(newAstrictObj);
                                userGroup.status = status;

                                // 用新增接口返回的的分群替换掉前端临时创建的userGroup
                                // 替换必须在进一步更新之前，不然userGroup中的astrictStr就变了
                                const targetIndex = targetCluster.userGroups.findIndex(grp => grp.id === this.group.id);
                                targetCluster.userGroups.splice(targetIndex, 1, userGroup);

                                // b. 更新 id、status（分群）
                                webServUserGroupApiV1
                                    .updateGroup(userGroup)
                                    .then(({body: {data: {userGroup}}}) => {
                                        if (status === 1) {
                                            this.$toast(this.$t('userGroup.executeSuccess'), 'success');
                                        }
                                        trackEvent('数据分析-用户分群-更新分群');
                                        const depIds = getDepIds(userGroup.astrictStr);
                                        const node = new TreeNode(
                                            userGroup.id,
                                            depIds
                                        );
                                        groupDependencyTree.feed(node);
                                        // update user group
                                        targetCluster.userGroups.splice(targetIndex, 1, parseGroup(userGroup));
                                        this.checkoutGroup(userGroup.id);

                                        this.$nextTick(() => {
                                            this.$router.replace({name: 'userGroup', params: {id: userGroup.id}});
                                            this.$loaded();
                                        });
                                    })
                                    .catch(() => {
                                        this.$loaded();
                                    });
                            })
                            .catch(() => {
                                this.$nextTick(() => {
                                    this.$loaded();
                                });
                            });
                    }
                }, 400);
            },

            createCluster() {
                this.clusterForm = true;
                this.editingCluster = {
                    name: ''
                };
            },
            // 关闭分组弹窗
            cancelClusterModal() {
                this.clusterForm = false;
                this.editingCluster = {};
                this.currentClusterNum = null;
                this.clusterErrorText = '';
            },

            // 保存分群分组
            saveCluster() {
                // if (e.isComposing) return;
                if (!this.verify()) {
                    this.$nextTick(() => {
                        this.$refs.backTop && this.$refs.backTop.backTop();
                    });
                    return;
                }
                if (this.editingCluster.id) {   //编辑分群分组
                    if (this.customClusters[this.currentClusterNum].name === this.editingCluster.name)
                        return this.cancelClusterModal();
                    WebServClusterApiV1
                        .updateCluster(this.editingCluster)
                        .then(() => {
                            this.customClusters[this.currentClusterNum].name = this.editingCluster.name;
                            this.cancelClusterModal();
                            this.$toast(this.$t('userGroup.updateSuccess'), 'success');
                            trackEvent('数据分析-用户分群-修改分群分组');
                        });

                } else {    //新建分群分组
                    WebServClusterApiV1
                        .createCluster(this.editingCluster.name)
                        .then(({body: {data: {cluster}}}) => {
                            this.customClusters.push(cluster);
                            this.cancelClusterModal();
                            this.$toast(this.$t('userGroup.addGroupSuccess'), 'success');
                            trackEvent('数据分析-用户分群-新建分群分组');
                            this.sortOverhiveClusters();
                        });
                }
            },

            // 编辑自定义分群分组名称
            editCluster(cluster, index) {
                this.clusterErrorText = '';
                this.editingCluster = cloneDeep(cluster);
                this.currentClusterNum = index;
                const idx = this.openViews.clusterIds.findIndex(id => id === cluster.id);
                if (idx !== -1) {
                    this.openViews.clusterIds.splice(idx, 1);
                    sessionStorage.setItem(CLUSTER_OPEN_VIEWS, JSON.stringify(this.openViews));
                }
                this.clusterForm = true;
            },

            //分群分组列表展示
            toggleCluster(clusterId) {
                //分组中的分群的userGroupClusterId是否有和分组id相同的
                const index = this.openViews.clusterIds.findIndex(id => id === clusterId);
                index === -1
                    ? this.openViews.clusterIds.push(clusterId)
                    : this.openViews.clusterIds.splice(index, 1);
                sessionStorage.setItem(CLUSTER_OPEN_VIEWS, JSON.stringify(this.openViews));
            },

            // 分组中的分群有变化时
            changeOverHives(changes, cluster) {
                if (changes.added) {
                    let target = cloneDeep(changes.added.element);
                    let index = changes.added.newIndex;

                    // 更新astrictStr
                    target.userGroupClusterId = cluster.id;
                    target = this.transformGroupForSever(target);

                    this.$nextTick(() => {
                        // 分群的更新
                        webServUserGroupApiV1
                            .updateGroup(target)
                            .then(() => {
                                cluster.userGroups[index].userGroupClusterId = cluster.id;
                                trackEvent('数据分析-用户分群-修改分群');
                            });
                        // 拖拽完，修改展示的分群的userGroupClusterId，否则，拖拽完点保存，分群会又回到原分组
                        if (target.id === this.group.id) {
                            this.group.userGroupClusterId = cluster.id;
                        }
                    });
                }
                this.sortOverHives();
            },

            //分群排序
            sortOverHives: debounce(function () {
                const ids = [this.defaultCluster, ...this.customClusters]
                    .reduce((acc, crt) => acc.concat(...(crt.userGroups.map(o => o.id))), [])
                    .filter(id => typeof id === 'number');
                webServUserGroupApiV1.sortOverHives({ids});
            }, 100),

            // 分组排序
            sortOverhiveClusters() {
                const ids = this.customClusters.map(cluster => cluster.id);
                WebServClusterApiV1.sortClusters({ids});
            },
        }
    };
</script>
<style lang="scss" type="text/scss" rel="stylesheet/scss">
    @import "user-group";
</style>
