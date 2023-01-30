<template>
    <div class="wechat-fans">
        <p>{{'follower.filter' | t}}</p>
        <br>
        <!-- jira9833: 移除“性别”、“地区”、“语言”的选项 -->
        <!-- <div class="form-field bg">
            <label class="label">{{'follower.sex' | t}}</label>
            <span class="btn btn-sm btn-theme-border" :class="{active: index === indexs}"
                  v-for="(sex,index) in sexList" :key="sex.name"
                  @click="check(sex.value, index)">{{sex.name}}</span>
        </div>
        <div class="form-field">
            <label class="label">{{'follower.region' | t}}</label>
            <div class="area" v-for="(child,index) in arryShow" :key="child">
                <span class="pull-left btn btn-sm btn-round btn-theme">{{child}}</span>
                <button type="button" class="action-icon icon icon-close" @click="del(child, index)"></button>
            </div>
            <address-select @select="selectAddress"></address-select>
        </div>
        <div class="form-field bg">
            <label class="label">{{'follower.language' | t}}</label>
            <span class="btn btn-sm btn-theme-border" :class="{active: index === LanguageIndex}"
                  v-for="(language,index) in languageList" :key="language.name"
                  @click="checkLanguage(language.value,index)">{{language.name}}</span>
        </div> -->
        <div class="form-field">
            <label class="label">{{'follower.tag' | t}}</label>
            <span class="btn btn-sm btn-theme-border" :class="{active: tagsId.length === 0}"
                  @click="clearLength">{{'follower.all' | t}}</span>
            <span class="btn btn-sm btn-theme-border tag-btn"
                  v-for="(tag,index) in tags"
                  v-if="index < 5"
                  :class="{active: tagsId.includes(tag.tagId)}"
                  @click="checkTag(tag.tagId)"
                  :key="tag.name">{{tag.name}}</span>
            <div class="extra-tags-box" v-if="tags.length > 5" v-blur="closeTags" key="extra-tags-box">
                <div class="extra-tags-trigger" :class="{active: showlist}" @click="toggleTags">
                    {{(showlist ? 'follower.lessTag' : 'follower.moreTag') | t}}
                    <svg aria-hidden="true" class="icon-caret-down">
                        <use xlink:href="#icon-caret-down"></use>
                    </svg>
                </div>
                <transition name="drop">
                    <div class="extra-tags-drop" v-if="showlist">
                        <div class="btn btn-sm btn-theme-border tag-btn" :class="{active: tag.ids == 1}"
                             v-for="tag in tags" @click="checkTag(tag.tagId)" :key="tag.name">
                            {{tag.name}}
                        </div>
                    </div>
                </transition>
            </div>
            {{'follower.chosenA' | t}}
            <span class="theme-text">&nbsp;{{tagsId.length}}&nbsp;</span>
            {{'follower.chosenB' | t}}
        </div>
        <div class="form-field bg">
            <label class="label">{{'follower.interaction' | t}}</label>
            <span class="btn btn-sm btn-theme-border" :class="{active: !checkOne && !checkTwo}"
                  @click="clearTrue">{{'follower.all' | t}}</span>
            &nbsp;
            <checkbox v-model="checkOne">{{'follower.interactWithin48Hours' | t}}</checkbox>
            &nbsp;
            <checkbox v-model="checkTwo">{{'follower.noInteractionA' | t}}</checkbox>
            <selector :options="days" v-model="day" :disabled="!checkTwo"></selector>
            {{'follower.noInteractionB' | t}}
        </div>
        <div class="form-field">
            <div class="search-box pull-right">
                <input v-model.trim="searchValue" @keyup.enter="searchUser" type="text"
                       :placeholder="$t('follower.nickNameOrRemarks')">
                <svg aria-hidden="true" @click="searchUser">
                    <use xlink:href="#icon-search"></use>
                </svg>
            </div>
            <span class="label placeholder"></span>
            <button type="button" class="btn btn-theme btn-md"
                    id="wechat_fans_filtrate_label"
                    :disabled="$has('wechat_fans_filtrate_label')"
                    @click="sureFilte">
                {{'follower.filterBtn' | t}}
            </button>
        </div>
        <!--粉丝列表-->
        <div class="fans-list-head">
            <div class="pull-right">
                <button type="button" class="btn btn-theme btn-md icon icon-tianjia"
                        id="wechat_fans_add_result"
                        :disabled="$has('wechat_fans_add_result')"
                        @click="addtags(0)">
                    {{'follower.tagTheFollowers' | t}}
                </button>
                <button type="button" class="btn btn-md btn-red-border icon icon-iconless"
                        id="wechat_fans_delete_result"
                        :disabled="$has('wechat_fans_delete_result')"
                        @click="addtags(1)">
                    {{'follower.deleteTag' | t}}
                </button>
            </div>

            <h3>{{'follower.followerList' | t}}
                <!-- 导出全量粉丝 -->
                <button type="button" class="btn btn-sm btn-white export-all" :disabled="$has('wechat_export_all_fans')"
                        id="wechat_export_all_fans" @click="exportDwnloadClick">
                    {{'follower.exportAllFans' |t}}
                </button>
                <span class="main-text"><i class="icon icon-help"
                                           v-title:right="$t('follower.exportAllFansTip')"></i></span>
            </h3>
            <span>{{'follower.total' | t}} {{totalRowCount}} {{'follower.person' | t}}</span>
            &nbsp;{{'follower.afterFilter' | t}}
            <span class="theme-text">&nbsp;{{user.totalRow}}&nbsp;</span>
            {{'follower.person' | t}}
            {{'follower.selected' | t}}
            <span class="theme-text">{{fansId.length !== 0 ? fansId.length : chooseNum}}</span>
            {{'follower.person' | t}}
            <!-- 标签进度提示 -->
            <div class="icon icon-menu progress-detail hidden-menu-trigger"
                 v-if="progressList.length > 0">
                <span class="icon-processing progress-pic"></span>
                {{progressList[0].name}}
                <span class="theme-text">{{progressList[0].progress}}%</span>
                <ul class="hidden-menu" v-if="progressList.length > 1">
                    <li v-for="pro in progressList.slice(0,5)">
                        {{pro.name}}
                        <span class="theme-text">{{pro.progress}}%</span>
                    </li>
                    <li v-if="progressList.length > 5" @click="showLog">{{'follower.checkMore' | t}}</li>
                </ul>
            </div>
            <!-- 日志按钮 -->
            <button type="button"
                    id="wechat_fans_search_log"
                    :disabled="$has('wechat_fans_search_log')"
                    class="btn btn-sm btn-theme-border"
                    @click="showLog">
                {{'tag.journal' | t}}
            </button>
        </div>
        <!--list-->
        <div class="following-user-content">
            <div v-if="loadings">
                <div class="present-group">
                    <div class="icon icon-menu btnsa hidden-menu-trigger">
                        <ul class="hidden-menu">
                            <li @click="nowData">{{'follower.allSelectedNowPage' | t}}</li>
                            <li @click="allData(true)">{{'follower.allSelected' | t}}</li>
                            <li @click="clearData">{{'follower.clearAll' | t}}</li>
                        </ul>
                    </div>
                    <span> {{'follower.allFollowers' | t}} </span>
                    <div class="remarks">{{'follower.operation' | t}}</div>
                    <div class="remarks">{{'follower.latestInteractionTime' | t}}</div>
                    <div class="remarks openid">Openid</div>
                </div>
                <ul class="user-list">
                    <li v-for="(user,index) in fansList" :key="index" class="box">
                        <checkbox style="vertical-align: middle;margin-top: 16px;margin-right: 35px;"
                                  v-model="fansId" :source="user.openid"
                                  @input="delElement(user.openid)"></checkbox>
                        <img :src="user.headimgurl" alt="">
                        <div class="user-name">
                            <span class="name">
                                <span v-if="user.nickname !== user.remark">{{user.remark}}</span>
                                <span>
                                    <span v-if="user.nickname !== user.remark">(</span>
                                    {{user.nickname}}
                                    <span v-if="user.nickname !== user.remark">)</span>
                                </span>
                            </span>
                            <div class="no-tags" v-if="user.tags.length === 0">{{'components.noTags' | t}}</div>
                            <div class="tags" v-if="user.tags.length !== 0 && index < 5"
                                 v-for="(tag,index) in user.tags" :key="index">{{tag.name}}
                            </div>
                            <div class="redundant-tags" v-if="user.tags.length > 5">
                                {{'follower.total' | t}}{{user.tags.length}}{{'follower.tags' | t}}
                            </div>
                            <div class="icon-sele">
                                <button class="btn" :disabled="$has('wechat_fans_add_onefans')">
                                    <input type="text" class="selectBox"
                                           :class="{'icon-disable':$has('wechat_fans_add_onefans')}"
                                           @focus="showTagsBox(user)"
                                           @blur="hideTagsBox(user,index)">
                                    <span class="icon--icon" :class="{'icon-disable':$has('wechat_fans_add_onefans')}"></span>
                                </button>
                                <div class="tags-box" @mousedown.prevent v-show="isShowTagsBox === user.openid">
                                    <checkbox v-for="tag in tags" :key="tag.id" :source="tag.id"
                                              v-model="user.tagIds">{{tag.name}}
                                    </checkbox>
                                    <br>
                                    <p class="tag-hint" v-if="user.tagIds.length > 20">{{'follower.max20Tag' | t}}</p>
                                    <div class="btns">
                                        <div class="btn btn-md btn-theme-border"
                                             @click="cancelTagChange(user,index)">{{'common.cancel' | t}}
                                        </div>
                                        <div class="btn btn-md btn-theme"
                                             @click="updateUserTag(user,index)">{{'common.confirm' | t}}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div class="remarks openid">{{user.openid}}</div>
                        <div class="remarks">{{user.eventTime}}</div>
                        <div class="remarks">
                            <button class="btn" :disabled="$has('wechat_fans_edit_remark')">
                                <svg aria-hidden="true" class="way" v-title="$t('follower.editRemark')"
                                    @click="remark(1,user.id,index, user.remark, user.nickname)"
                                    :class="{'icon-disable':$has('wechat_fans_edit_remark')}">
                                    <use xlink:href="#icon-pencil"></use>
                                </svg>
                            </button>
                            <button class="btn" :disabled="$has('wechat_fans_Link_contact')">
                                <svg aria-hidden="true" class="way" v-title="$t('follower.linkContact')"
                                    @click="contact(user)"
                                    :class="{'icon-disable':$has('wechat_fans_Link_contact')}">
                                    <use xlink:href="#icon-lianxiren"></use>
                                </svg>
                            </button>
                        </div>
                    </li>
                    <li v-if="fansList.length === 0 && loadings">
                        <list-empty :name="$t('follower.follower')"/>
                    </li>
                </ul>
            </div>
            <inline-loading v-else></inline-loading>
        </div>
        <pager :total="user.totalPage" :now="user.page" @page="handlePage"></pager>

        <!-- 日志弹窗 -->
        <modal v-if="logModalOpen" :title="this.$t('tag.journal')" @close="logModalOpen = false" size="lg">
            <div class="log-tips">{{'follower.remind' | t}}</div>
            <div class="simplify-table auto-width">
                <table>
                    <thead>
                    <tr>
                        <td>{{'time.date' | t}}</td>
                        <td>{{'tag.content' | t}}</td>
                        <td>{{'tag.schedule' | t}}</td>
                        <td>{{'tag.proTarget' | t}}</td>
                        <td>{{'tag.succTarget' | t}}</td>
                        <td>{{'tag.handlingErrors' | t}}</td>
                        <td>{{'follower.operation' | t}}</td>
                    </tr>
                    </thead>
                    <tbody>
                    <tr v-if="logsLoading || logList.length === 0">
                        <td colspan="7">
                            <inline-loading v-if="logsLoading"/>
                            <list-empty v-else/>
                        </td>
                    </tr>
                    <template v-else v-for="log in logList">
                        <tr :class="{'no-hover': log.progress != 100 || log.errorCount <= 0}"
                            @click="openErrorMsg(log)"
                            :key="log.id">
                            <td>{{log.startTime}}</td>
                            <td>
                                {{log.name}}
                                <div class="pull-right action-text hidden-menu-trigger"
                                     v-if="log.typeName === '1' || log.typeName === '2'">
                                    ({{'follower.tagDetail' | t}})
                                    <!-- 标签明细 -->
                                    <div class="hidden-menu log-detail-tags">
                                        {{'follower.tagDetail' | t}}:
                                        <ul>
                                            <li v-for="(label,i) in log.fansLabelList" :key="i"
                                                :title="label.name">
                                                {{label.name}}
                                            </li>
                                        </ul>
                                    </div>
                                </div>
                            </td>
                            <td>
                                <div v-if="log.typeName==='7'">
                                    <!--取消粉丝属性任务 -->
                                    <span v-if="log.status===2">{{'follower.waitingSync' | t}}</span>
                                    <span v-if="log.status===3">{{'follower.Syncing' | t}}</span>
                                    <span v-if="log.status===4">{{'follower.completeSync' | t}}</span>
                                </div>
                                <div v-else>
                                    <span v-if="log.typeName==='6'&&log.status===0">{{'follower.exporting' | t}}</span>
                                    <span v-else>{{log.progress}}%</span>
                                </div>
                            </td>

                            <td>{{log.totalCount}}</td>
                            <td>{{log.finishCount}}</td>
                            <td>
                                {{log.errorCount}}
                                <a :href="log.errorFileUrl"
                                   target="_blank"
                                   v-if="log.progress == 100 && log.errorCount > 0"
                                   class="action-text">{{'common.download' | t}}</a>
                            </td>
                            <td>
                                <svg aria-hidden="true" class="action-icon icon-arrow-down"
                                     v-if="(log.progress == 100 && log.errorCount > 0)&&log.typeName!='7'"
                                     :class="{open: activeLog.id === log.id}">
                                    <use xlink:href="#icon-arrow-down"></use>
                                </svg>
                                <span class="cancel-task" v-if="log.typeName==='7'&&log.status===2"
                                      @click="readyCancelTask(log)">{{'follower.cancelTask' | t}}</span>
                            </td>
                        </tr>
                        <!--错误信息显示 start-->
                        <tr v-if="activeLog.id === log.id" class="no-hover">
                            <td colspan="7">
                                <div class="error-msg">
                                    <div class="error-details">
                                        {{'dataCenter.errDataMsg' | t}}
                                    </div>
                                    <div class="error-table">
                                        <table>
                                            <thead>
                                            <tr class="no-hover">
                                                <td>{{'dataCenter.sort' | t}}</td>
                                                <td>{{'dataCenter.errType' | t}}</td>
                                                <td>{{'dataCenter.errData' | t}}</td>
                                            </tr>
                                            </thead>
                                            <tbody>
                                            <tr v-for="(err, errIndex) in logErrs" :key="errIndex">
                                                <td>{{errIndex + 1}}</td>
                                                <td :title="err.errorType">{{err.errorType}}</td>
                                                <td :title="err.errorMessage">{{err.errorMessage}}</td>
                                            </tr>
                                            </tbody>
                                        </table>
                                        <list-empty v-if="logErrs.length === 0"
                                                    :name="$t('dataCenter.errData')"/>
                                    </div>
                                    <pager :now="errPageNumber" :total="errTotalPage"
                                           @page="toErrPage($event)"/>
                                </div>
                            </td>
                        </tr>
                        <!--错误信息显示 end-->
                    </template>
                    </tbody>
                </table>
                <pager :now="logPageNumber" :total="logTotalPage" @page="changeLogPage">
                    {{logList.length > 0 ? 1 : 0}}-{{logList.length}}{{'tag.logs' | t}},
                    {{'common.total' | t}}&nbsp;{{logList.length}}&nbsp;{{'tag.logs' | t}}&nbsp;
                </pager>
            </div>
            <template v-slot:buttons>
                <input type="button" class="btn btn-md btn-white" :value="$t('common.close')"
                       @click="logModalOpen = false">
            </template>
        </modal>

        <!-- 打标签确认框 -->
        <confirm :title="confirmTitle" v-if="confirm" @cancel="cancel" @confirm="sureTags">
            <div class="form-field">
                <label for="confirmValue" class="label">{{'follower.tagName' | t}}</label>
                <input class="input" id="confirmValue" v-model.trim="confirmValue" type="text">
            </div>
        </confirm>
        <!--<Popover titleContent="删除标签" v-if="popovers" @sures="sures" @closebox="closebox"></Popover>-->
        <confirm :title="titleContent" v-if="popovers" @cancel="closebox" @confirm="sures" size="lg">
            <div class="form-field">
                <label class="label">{{'follower.followerInfo' | t}}</label>
                {{'follower.selected' | t}}
                <span class="theme-text">&nbsp;{{fansId.length === 0 ? user.totalRow : fansId.length}}&nbsp;</span>
                {{'follower.fans' | t}}
            </div>
            <div class="form-field">
                <label class="label">{{'follower.groupFilter' | t}}</label>
                <multi-select :options="fildtadList"
                              v-model="fildtags"
                              @input="select"
                              drop-direction="bottom"
                              :shortcut-action="false"
                              :auto-width="false"/>
                <button type="button" class="btn btn-theme btn-md" :disabled="!fildCanLoad" @click="fildCan">
                    {{fildCanLoad ? $t('follower.useFilter') : $t('follower.filtering')}}
                </button>
                <br>
                <label class="label placeholder"></label>
                <span class="light-content-text">
                    {{'follower.used' | t}}
                    <span v-if="chooseName.length === 0">&nbsp;0&nbsp;{{'follower.ge' | t}}</span>
                    <span v-else v-for="name in chooseName">{{name}}</span>
                    {{'follower.filtered' | t}}<span class="theme-text">&nbsp;{{fansNumber || 0}}&nbsp;</span> {{'follower.fans' | t}}
                </span>
            </div>
            <div class="form-field">
                <label class="label">{{'follower.labelList' | t}}</label>
                {{'follower.selectedFans' | t}}
                {{types == '0' ? $t('follower.adds') : $t('follower.delete')}}{{'follower.label' | t}}：
                <div class="search-box input-search" v-if="types===0">
                    <input type="text" v-model.trim="tagKeywords" :placeholder="$t('tag.tagKeyword')">
                    <svg aria-hidden="true" @click="searchTags">
                        <use xlink:href="#icon-search"></use>
                    </svg>
                </div>
            </div>
            <div class="form-field flex">
                <label class="label placeholder"></label>
                <div class="tagbox">
                    <span class="tag" :class="{active: child.ids == 2}"
                          v-for="(child, index) in fildchooseFans" @click="checkAddTag(child.id)"
                          :title="child.name" :key="index">
                        {{child.name}}
                    </span>
                </div>
            </div>
        </confirm>
        <!-- 导出全量粉丝 -->
        <download-detail-modal v-if="exportDwnload" :themeModules="'fanDataExportNotice'" :emailDownload="true"
                             @cancel="cancelDownload" @okDownload="getExportFans"  :formatTypeSet="formatTypeSet"
                            :customizeModalTitle="$t('follower.exportAllFans')"/>
        <!--取消 '粉丝同步属性'-->
        <modal :title="$t('follower.cancelTask')" @close="celTaskFlag=false" v-if="celTaskFlag">
            <div class="cancel-text">{{'follower.confirmCancel' | t}}</div>
            <template v-slot:buttons>
                <button class="btn btn-md btn-white" @click="celTaskFlag=false">{{'common.cancel' | t}}</button>
                <button class="btn btn-md btn-theme" @click="cancelTaskSync">{{'common.confirm' | t}}</button>
            </template>
        </modal>
    </div>
</template>
<script type="text/babel">
    import { ContactApiV1, WechatApiV1 } from '@/api';
    import AddressSelect from './address-select.vue';
    import {trackEvent} from '../../monitor';

    export default {
        components: {AddressSelect},
        data() {
            return {
                searchValue: '',
                loadings: false,
                totalRowCount: 0,
                chooseName: [],
                fansNumber: 0,
                sendfildtags: [],
                fildtadList: [],
                fildtags: [],
                checkValue: [],
                titleContent: '',
                popovers: false,
                chooseNum: 0,
                showlist: false,
                fansId: [],
                fansCheck: [],
                sexList: [
                    {value: '', name: this.$t('follower.all')},
                    {value: 1, name: this.$t('follower.male')},
                    {value: 2, name: this.$t('follower.female')},
                    {value: 0, name: this.$t('follower.unknown')}
                ],
                languageList: [
                    {name: this.$t('follower.all'), value: ''},
                    {name: this.$t('follower.simplifiedChinese'), value: 'zh_CN'},
                    {name: this.$t('follower.english'), value: 'en'}
                ],
                value: '',
                indexs: 0,
                Language: '',
                LanguageIndex: 0,
                tagsId: [],
                test: null,
                indexsa: null,
                day: '',
                days: [
                    {name: 3, id: 3},
                    {name: 7, id: 7},
                    {name: 15, id: 15},
                    {name: 30, id: 30},
                    {name: 60, id: 60},
                    {name: 90, id: 90}
                ],
                checkOne: false,
                checkTwo: false,
                loading: false,
                fansList: [], // 全部粉丝列表
                allFansSelectFlag: false, // 全选粉丝标记
                selectAllDeleteArray: [],

                // 粉丝列表的方法
                updateCustomerIndex: 0, // 修改备注  联系人的下标
                tagname: this.$t('follower.allFans'),
                seleTag: '', // 当前选择的分组Id
                confirmTitle: '',
                index: '',
                markId: '', // 修改备注是联系人Id
                tags: [], // 选中的标
                originalTagIds: [], // 联系人标签
                confirm: false, // confirm
                confirmValue: '', // 输入框输入的内容
                user: {
                    userList: [],
                    loaded: true,
                    page: 1,
                    totalRow: 0,
                    totalPage: 1
                },
                isShowTagsBox: '', // 是否显示分组框

                arryShow: [],
                sendDataCountry: [],
                sendDataProvence: [],
                sendDataCity: [],
                CountryString: '',
                ProvenceString: '',
                CityString: '',
                tagsIdString: '',
                fildchooseFans: [],
                types: 0,
                fildCanLoad: true,
                choose: [],
                markValue: '',
                sendDataCitySave: [],
                CityStringSave: '',
                sendDataCountrySave: [],
                CountryStringSave: '',
                checkOneSave: false,
                LanguageSave: '',
                sendDataProvenceSave: [],
                ProvenceStringSave: '',
                valueSave: '',
                daySave: '',
                tagsIdStringSave: '',

                // 日志列表
                logModalOpen: false,
                logList: [],
                logsLoading: true,
                logPageNumber: 1,
                logTotalPage: 1,
                // 错误日志列表
                activeLog: {}, // 存储当前操作的log
                logErrs: [],
                errPageNumber: 1,
                errTotalPage: 1,
                progressList: [], // 进度列表详情
                proTimer: null, //定时请求getProgress
                exportDwnload: false, // 显示导出全量粉丝弹窗
                //导出全量粉丝的弹窗设置
                formatTypeSet: {
                    isExcel: false,
                    ExcelIsShow: false,
                    CSVIsShow: true
                },
                tagKeywords: '',//给筛选结果打标签前端检索
                celTaskFlag: false,//取消'粉丝同步属性'弹窗显隐
                gotCanceledTask: '',//准备取消的任务
                tagOptRefresh: false,//操作标签后标识
            };
        },
        watch: {
            checkOne(val) {
                if (val) {
                    this.checkTwo = false;
                    this.day = '';
                }
            },
            checkTwo(val) {
                if (val) {
                    this.checkOne = false;
                } else {
                    this.day = '';
                }
            },
            fansId() {
                if (this.fansId.length !== 0) {
                    if (this.chooseNum !== 0) {
                        this.chooseNum = 0;
                    }
                }
            }
        },
        computed: {
            cumpt() {
                if (this.fansNumber === 0 && this.sendfildtags.length === 0) {
                    return this.fansId.length === 0
                        ? this.user.totalRow
                        : this.fansId.length;
                }
                return this.fansNumber;
            }
        },
        mounted() {
            ContactApiV1
                .getSwarms()
                .then(({body: {data: {swarmList}}}) => {
                    this.fildtadList = swarmList;
                });

            // 获取标签列表
            this.getTagList();
            WechatApiV1
                .modifyRemark(
                    '',
                    '',
                    this.checkOne === false ? 1 : 0,
                    this.Language,
                    '',
                    this.user.page,
                    '',
                    this.value,
                    1,
                    '',
                    ''
                )
                .then(res => {
                    this.user.userList = res.body.data.customerList.map(user => {
                        user.tagIds = user.tags.map(tag => tag.id);
                        return user;
                    });
                    this.fansList = res.body.data.customerList;
                    this.user.totalPage = res.body.data.totalPage;
                    this.user.totalRow = res.body.data.totalRow;
                    this.totalRowCount = res.body.data.totalRowCount;
                    this.loadings = true;
                });
            // listen parent button clicks
            this.$parent.$on('remark', () => {
                this.remark(0, this.seleTag);
            });
            this.getProgress();
        },
        beforeRouteLeave(to, from, next) {
            clearTimeout(this.proTimer);
            this.proTimer = null;
            this.$parent.$off('remark');
            next();
        },
        methods: {
            //查看同步状态
            //1同步中 0未同步
            getExportFans(info) {
                WechatApiV1
                    .getExportFans()
                    .then(({body}) => {
                        if (body.code === 200) {
                            if (body.data.status === 0) {
                                this.download(info);
                            } else {
                                this.$toast(this.$t('follower.tipExportFans'), 'warn');
                            }
                        } else {
                            this.$toast(body.message, 'warn');
                        }
                    });
            },
            //点击全量粉丝按钮
            exportDwnloadClick() {
                WechatApiV1
                    .getExportFans()
                    .then(({body}) => {
                        if (body.code === 200) {
                            if (body.data.status === 0) {
                                this.exportDwnload = true;
                            } else {
                                this.$toast(this.$t('follower.tipExportFans'), 'warn');
                            }
                        } else {
                            this.$toast(body.message, 'warn');
                        }
                    });
            },
            // 取消下载二维码扫码记录
            cancelDownload() {
                this.exportDwnload = false;
            },
            // 确定下载二维码扫码记录
            download(info) {
                WechatApiV1
                    .exportAllfans({
                        emailSubject: info.emailSubject,
                        email: info.emailAddress,
                        dataFormat: info.dataFormat
                    })
                    .then(() => {
                        this.$toast(this.$t('follower.checkoutEmail'), 'success');
                        this.exportDwnload = false;
                    });
            },
            //获取标签列表
            getTagList() {
                WechatApiV1
                    .getTagList('', 0)
                    .then(res => {
                        this.tags = res.body.data.tagList;
                    });
            },
            // 根据粉丝获取历史操作记录
            getHistoryLog() {
                WechatApiV1
                    .getLog(this.logPageNumber)
                    .then(({body: {data: {logDtoList}}}) => {
                        this.logList = logDtoList.map(log => {
                            if (log.totalCount === 0)
                                log.progress = (100).toFixed(1);
                            else
                                log.progress = ((log.finishCount + log.errorCount) / log.totalCount * 100).toFixed(1);
                            switch (log.typeName) {
                                case '1':
                                    log.name = this.$t('follower.addFans');
                                    break;
                                case '2':
                                    log.name = this.$t('follower.delFans');
                                    break;
                                case '3':
                                    log.name = this.$t('follower.fansSync');
                                    break;
                                case '6':
                                    log.name = this.$t('follower.exportAllFans');
                                    break;
                                case '7':
                                    log.name = this.$t('follower.syncTitle');
                                    break;
                            }
                            return log;
                        });
                        if (logDtoList.length > 0)
                            this.logTotalPage = logDtoList[0].totalPage;
                        this.logsLoading = false;
                    });
            },
            // 获取本公司所有粉丝标签未完成添加进度
            getProgress() {
                WechatApiV1
                    .getProgress()
                    .then(({body: {data: {progressList}}}) => {
                        const USER_INFO = String(process.env.NODE_ENV).toUpperCase() + '_USER_INFO';
                        let wechatId = JSON.parse(localStorage.getItem(USER_INFO)).authorizerInfoId;
                        let exportList = [...progressList];//正在导出得进程数量
                        exportList = exportList.filter(pro => (pro.wxId === wechatId));
                        progressList = progressList.filter(pro => (pro.typeName !== '6'));//除了导出粉丝意外的数据
                        let logList = this.logList.filter(item => (item.typeName === '6' && item.status === 0));

                        //日志界面打开时，判断是否刷新当前数据
                        if (this.logModalOpen && logList.length !== 0 && exportList.length === 0) {
                            this.getHistoryLog();
                        }

                        this.progressList = progressList
                            .map(pro => {
                                if (pro.totalCount === 0)
                                    pro.progress = (100).toFixed(1);
                                else
                                    pro.progress = ((pro.finishCount + pro.errorCount) / pro.totalCount * 100).toFixed(1);
                                switch (pro.typeName) {
                                    case '1':
                                        pro.name = this.$t('follower.addFans') + this.$t('tag.schedule');
                                        break;
                                    case '2':
                                        pro.name = this.$t('follower.delFans') + this.$t('tag.schedule');
                                        break;
                                    case '3':
                                        pro.name = this.$t('follower.fansSync') + this.$t('tag.schedule');
                                        break;
                                }
                                return pro;
                            });

                        if (!this.progressList.length && this.tagOptRefresh) {
                            this.getFansList();
                            this.tagOptRefresh = false;
                        }

                        this.proTimer = setTimeout(this.getProgress, 5000);
                    });
            },

            // 搜索粉丝
            searchUser() {
                // 做个联系人是否点击搜索的标记
                this.markValue = this.searchValue;
                // 清除筛选的所有值恢复初始值状态
                this.sendDataCitySave = [];
                this.CityStringSave = '';
                this.sendDataCountrySave = [];
                this.CountryStringSave = '';
                this.checkOneSave = false;
                this.LanguageSave = '';
                this.sendDataProvenceSave = [];
                this.ProvenceStringSave = '';
                this.valueSave = '';
                this.daySave = '';
                this.tagsIdStringSave = '';
                this.sendDataCity = [];
                this.CityString = '';
                this.sendDataCountry = [];
                this.CountryString = '';
                this.checkOne = false;
                this.Language = '';
                this.sendDataProvence = [];
                this.ProvenceString = '';
                this.value = '';
                this.day = '';
                this.tagsIdString = '';
                this.tagsId = [];
                this.arryShow = [];
                this.indexs = 0;
                this.LanguageIndex = 0;
                this.checkTwo = false;
                this.tags.forEach(e => {
                    e.ids = '';
                });

                this.user.page = 1;
                this.getFansList();
            },
            fildCan() {
                if (this.types === 0) {
                    if (this.sendfildtags.length === 0) {
                        this.chooseName = [];
                        return;
                    }
                    this.choose = [];
                    for (let tag of this.sendfildtags) {
                        this.fildtadList.forEach((e, index) => {
                            if (tag === e.id) {
                                this.choose.push(this.fildtadList[index].name);
                            }
                        });
                    }
                    this.chooseName = [...new Set(this.choose)];
                    this.fildCanLoad = false;
                    WechatApiV1
                        .tagContactCount(
                            this.markValue,
                            this.sendDataCitySave.length === 0 ? '' : this.CityStringSave,
                            this.sendDataCountrySave.length === 0 ? '' : this.CountryStringSave,
                            this.checkOneSave === false ? 1 : 0,
                            this.LanguageSave,
                            this.allFansSelectFlag
                                ? this.selectAllDeleteArray.join(',')
                                : this.fansId.join(','),
                            this.sendDataProvenceSave.length === 0
                                ? ''
                                : this.ProvenceStringSave,
                            this.valueSave,
                            1,
                            this.daySave,
                            this.sendfildtags.length === 0 ? '' : this.sendfildtags.join(','),
                            this.tagsIdStringSave,
                            this.allFansSelectFlag ? 1 : 0
                        )
                        .then(res => {
                            this.fansNumber = res.body.data.count;
                            this.fildCanLoad = true;
                        })
                        .catch(() => {
                            this.fildCanLoad = true;
                            this.$toast(this.$t('follower.filterFailed'), 'warn');
                        });
                } else {
                    this.checkValue = [];
                    // 删除标签中筛选人数，更新标签列表
                    if (this.sendfildtags.length === 0) {
                        this.chooseName = [];
                        // 重新获取标签
                        if (this.fansId.length === 0) {
                            WechatApiV1
                                .deleteTagList(
                                    this.sendDataCitySave.length === 0 ? '' : this.CityStringSave,
                                    this.sendDataCountrySave.length === 0
                                        ? ''
                                        : this.CountryStringSave,
                                    this.checkOneSave === false ? 1 : 0,
                                    this.LanguageSave,
                                    this.markValue,
                                    null,
                                    this.sendDataProvenceSave.length === 0
                                        ? ''
                                        : this.ProvenceStringSave,
                                    this.valueSave,
                                    1,
                                    this.daySave,
                                    this.tagsId.length === 0 ? null : this.tagsIdStringSave
                                )
                                .then(res => {
                                    res.body.data.tagList.forEach(e => {
                                        e.ids = '';
                                    });
                                    this.$set(this.$data, 'fildchooseFans', res.body.data.tagList);
                                });
                        } else {
                            let str = this.fansId.join(',');
                            if (this.allFansSelectFlag) {
                                str = this.selectAllDeleteArray.join(',');
                            }
                            WechatApiV1.getTagList(str, this.type)
                                .then(res => {
                                    res.body.data.tagList.forEach(e => {
                                        e.ids = '';
                                    });
                                    this.$set(this.$data, 'fildchooseFans', res.body.data.tagList);
                                });
                        }
                        return;
                    }
                    this.choose = [];
                    for (let tag of this.sendfildtags) {
                        this.fildtadList.forEach((e, index) => {
                            if (tag === e.id) {
                                this.choose.push(this.fildtadList[index].name);
                            }
                        });
                    }
                    this.chooseName = [...new Set(this.choose)];
                    this.fildCanLoad = false;
                    WechatApiV1
                        .tagContactCount(
                            this.markValue,
                            this.sendDataCitySave.length === 0 ? '' : this.CityStringSave,
                            this.sendDataCountrySave.length === 0 ? '' : this.CountryStringSave,
                            this.checkOneSave === false ? 1 : 0,
                            this.LanguageSave,
                            this.allFansSelectFlag
                                ? this.selectAllDeleteArray.join(',')
                                : this.fansId.join(','),
                            this.sendDataProvenceSave.length === 0
                                ? ''
                                : this.ProvenceStringSave,
                            this.valueSave,
                            1,
                            this.daySave,
                            this.sendfildtags.length === 0 ? '' : this.sendfildtags.join(','),
                            this.tagsIdStringSave,
                            this.allFansSelectFlag ? 1 : 0
                        )
                        .then(res => {
                            this.fansNumber = res.body.data.count;
                            this.fildCanLoad = true;
                            res.body.data.tagList.forEach(e => {
                                e.ids = '';
                            });
                            this.$set(this.$data, 'fildchooseFans', res.body.data.tagList);
                        })
                        .catch(() => {
                            this.fildCanLoad = true;
                            this.$toast(this.$t('follower.filterFailed'), 'warn');
                        });
                }
            },
            select(e) {
                if (e.length > 3) {
                    let l = e.length;
                    this.$toast(this.$t('follower.selectThreeGroup'));
                    e.splice(3, l - 3);
                    this.sendfildtags = e;
                }
                this.sendfildtags = e;
            },
            // 添加标签
            addtags(e) {
                this.types = e;
                if (this.fansId.length === 0 && this.chooseNum === 0) {
                    this.$toast(this.$t('follower.selectFans'));
                    return false;
                }
                this.chooseName = [];
                this.fansNumber = 0;
                this.fildtags = [];
                this.sendfildtags = [];

                this.checkValue = [];
                this.sendfildtags = [];
                if (e === 0) {
                    this.titleContent = this.$t('follower.labeled');
                    WechatApiV1.getTagList('', this.types)
                        .then(res => {
                            res.body.data.tagList.forEach(e => {
                                e.ids = '';
                            });
                            this.$set(this.$data, 'fildchooseFans', res.body.data.tagList);
                        });
                } else {
                    // 删除筛选结果标签
                    if (this.fansId.length === 0) {
                        WechatApiV1
                            .deleteTagList(
                                this.sendDataCitySave.length === 0 ? '' : this.CityStringSave,
                                this.sendDataCountrySave.length === 0
                                    ? ''
                                    : this.CountryStringSave,
                                this.checkOneSave === false ? 1 : 0,
                                this.LanguageSave,
                                this.markValue,
                                null,
                                this.sendDataProvenceSave.length === 0
                                    ? ''
                                    : this.ProvenceStringSave,
                                this.valueSave,
                                1,
                                this.daySave,
                                this.tagsId.length === 0 ? null : this.tagsIdStringSave
                            )
                            .then(res => {
                                res.body.data.tagList.forEach(e => {
                                    e.ids = '';
                                });
                                this.$set(this.$data, 'fildchooseFans', res.body.data.tagList);
                                trackEvent('微信管理-粉丝管理-删除筛选结果标签');
                            });
                    } else {
                        let str = this.allFansSelectFlag
                            ? this.selectAllDeleteArray.join(',')
                            : this.fansId.join(',');
                        let type = this.allFansSelectFlag ? 1 : 0;

                        WechatApiV1.getTagList(str, type)
                            .then(res => {
                                res.body.data.tagList.forEach(e => {
                                    e.ids = '';
                                });
                                this.$set(this.$data, 'fildchooseFans', res.body.data.tagList);
                            });
                    }

                    this.titleContent = this.$t('follower.deleteLabel');
                }
                this.popovers = true;
            },
            //筛选标签
            searchTags() {
                WechatApiV1.getTagList('', 0)
                    .then(res => {
                        res.body.data.tagList.forEach(e => {
                            e.ids = '';
                        });
                        this.$set(this.$data, 'fildchooseFans', res.body.data.tagList);
                        if (this.checkValue.length !== 0) {
                            this.checkValue.forEach(item => {
                                let sindex = this.fildchooseFans.findIndex(card => card.id === item);
                                this.fildchooseFans[sindex].ids = 2;
                            });
                        }
                        this.fildchooseFans = this.fildchooseFans.filter(item =>
                            item.name.toLowerCase().indexOf(this.tagKeywords.toLowerCase()) !== -1);
                    });
            },
            closebox() {
                this.popovers = false;
                this.tagKeywords = '';
            },
            sures() {
                if (this.checkValue.length === 0) {
                    this.$toast(this.$t('follower.selectLabel'));
                    return false;
                }
                if (this.sendfildtags.length !== 0 && this.fansNumber === 0) {
                    this.$toast(this.$t('follower.fans0'));
                    return false;
                }
                if (this.checkValue.length > 20) {
                    this.$toast(this.$t('follower.max20Tag'));
                    return false;
                }
                if (this.types === 0) {
                    this.$confirm(
                        this.$t('follower.confirmAdd'),
                        this.$t('follower.confirm') +
                        this.cumpt +
                        this.$t('follower.fansAdd') +
                        this.checkValue.length +
                        this.$t('follower.labelAdd')
                    )
                        .then(sure => {
                            if (sure) {
                                WechatApiV1
                                    .saveUserTags(
                                        this.markValue,
                                        this.sendDataCitySave.length === 0 ? '' : this.CityStringSave,
                                        this.sendDataCountrySave.length === 0
                                            ? ''
                                            : this.CountryStringSave,
                                        this.checkOneSave === false ? 1 : 0,
                                        this.LanguageSave,
                                        this.allFansSelectFlag
                                            ? this.selectAllDeleteArray.join(',')
                                            : this.fansId.join(','), // 用户选择的数据
                                        this.sendDataProvenceSave.length === 0
                                            ? ''
                                            : this.ProvenceStringSave,
                                        this.valueSave,
                                        1,
                                        this.daySave,
                                        this.sendfildtags.length === 0
                                            ? ''
                                            : this.sendfildtags.join(','),
                                        this.checkValue.join(','),
                                        this.tagsIdStringSave,
                                        this.allFansSelectFlag ? 1 : 0
                                    )
                                    .then(() => {
                                        this.$toast(this.$t('follower.addSuucess'), 'success');
                                        this.popovers = false;
                                        this.tagKeywords = '';
                                        this.chooseNum = 0;
                                        this.fansId = [];
                                        this.selectAllDeleteArray = [];
                                        this.allFansSelectFlag = false;
                                        this.tagOptRefresh = true;
                                        trackEvent('微信管理-粉丝管理-批量打标签');
                                        WechatApiV1
                                            .modifyRemark(
                                                this.sendDataCitySave.length === 0
                                                    ? ''
                                                    : this.CityStringSave,
                                                this.sendDataCountrySave.length === 0
                                                    ? ''
                                                    : this.CountryStringSave,
                                                this.checkOneSave === false ? 1 : 0,
                                                this.LanguageSave,
                                                this.markValue,
                                                this.user.page,
                                                this.sendDataProvenceSave.length === 0
                                                    ? ''
                                                    : this.ProvenceStringSave,
                                                this.valueSave,
                                                1,
                                                this.daySave,
                                                this.tagsIdStringSave
                                            )
                                            .then(res => {
                                                this.user.userList = res.body.data.customerList.map(
                                                    user => {
                                                        user.tagIds = user.tags.map(tag => tag.id);
                                                        return user;
                                                    }
                                                );
                                                this.fansList = res.body.data.customerList;
                                                this.user.totalPage = res.body.data.totalPage;
                                                this.user.totalRow = res.body.data.totalRow;
                                                this.loadings = true;
                                            })
                                            .catch(() => {
                                                this.loadings = true;
                                            });
                                    });
                            }
                        });
                } else {
                    this.$confirm(
                        this.$t('follower.deleteConfirm'),
                        this.$t('follower.confirmDelete') +
                        this.cumpt +
                        this.$t('follower.deleteFans') +
                        this.checkValue.length +
                        this.$t('follower.deleteLabels')
                    )
                        .then(sure => {
                            if (sure) {
                                WechatApiV1
                                    .cancelTags(
                                        this.markValue,
                                        this.sendDataCitySave.length === 0 ? '' : this.CityStringSave,
                                        this.sendDataCountrySave.length === 0
                                            ? ''
                                            : this.CountryStringSave,
                                        this.checkOneSave === false ? 1 : 0,
                                        this.LanguageSave,
                                        this.allFansSelectFlag
                                            ? this.selectAllDeleteArray.join(',')
                                            : this.fansId.join(','), // 用户选择的数据
                                        this.sendDataProvenceSave.length === 0
                                            ? ''
                                            : this.ProvenceStringSave,
                                        this.valueSave,
                                        1,
                                        this.daySave,
                                        this.sendfildtags.length === 0
                                            ? ''
                                            : this.sendfildtags.join(','),
                                        this.checkValue.join(','),
                                        this.tagsIdStringSave,
                                        this.allFansSelectFlag ? 1 : 0
                                    )
                                    .then(() => {
                                        this.$toast(this.$t('common.deleteSuccess'), 'success');
                                        this.popovers = false;
                                        this.tagKeywords = '';
                                        this.chooseNum = 0;
                                        this.fansId = [];
                                        this.selectAllDeleteArray = [];
                                        this.allFansSelectFlag = false;
                                        this.tagOptRefresh = true;
                                        trackEvent('微信管理-粉丝管理-批量移除标签');
                                        WechatApiV1
                                            .modifyRemark(
                                                this.sendDataCitySave.length === 0
                                                    ? ''
                                                    : this.CityStringSave,
                                                this.sendDataCountrySave.length === 0
                                                    ? ''
                                                    : this.CountryStringSave,
                                                this.checkOneSave === false ? 1 : 0,
                                                this.LanguageSave,
                                                this.markValue,
                                                this.user.page,
                                                this.sendDataProvenceSave.length === 0
                                                    ? ''
                                                    : this.ProvenceStringSave,
                                                this.valueSave,
                                                1,
                                                this.daySave,
                                                this.tagsIdStringSave
                                            )
                                            .then(res => {
                                                this.user.userList = res.body.data.customerList.map(
                                                    user => {
                                                        user.tagIds = user.tags.map(tag => tag.id);
                                                        return user;
                                                    }
                                                );
                                                this.fansList = res.body.data.customerList;
                                                this.user.totalPage = res.body.data.totalPage;
                                                this.user.totalRow = res.body.data.totalRow;
                                                this.loadings = true;
                                            })
                                            .catch(() => {
                                                this.loadings = true;
                                            });
                                    });
                            }
                        });
                }
            },
            // 查询确认
            sureFilte() {
                this.user.page = 1;
                this.sendDataCitySave = this.sendDataCity;
                this.CityStringSave = this.CityString;
                this.sendDataCountrySave = this.sendDataCountry;
                this.CountryStringSave = this.CountryString;
                this.checkOneSave = this.checkOne;
                this.LanguageSave = this.Language;
                this.sendDataProvenceSave = this.sendDataProvence;
                this.ProvenceStringSave = this.ProvenceString;
                this.valueSave = this.value;
                this.daySave = this.day;
                this.tagsIdStringSave = this.tagsIdString;
                this.searchValue = '';
                this.markValue = '';
                this.allFansSelectFlag = false;
                this.selectAllDeleteArray = [];
                this.getFansList();
            },

            selectAddress(country, province, city) {
                this.arryShow.push(country + ' ' + province + ' ' + city);
                if (province === '') {
                    this.sendDataCountry.push(country);
                    this.CountryString = this.sendDataCountry.join(',');
                }
                if (city === '') {
                    if (province !== '') {
                        this.sendDataProvence.push(province);
                        this.ProvenceString = this.sendDataProvence.join(',');
                    }
                }
                if (
                    country !== '' &&
                    province !== '' &&
                    city !== ''
                ) {
                    this.sendDataCity.push(city);
                    this.CityString = this.sendDataCity.join(',');
                }
            },
            del(e, index) {
                // 删除选中的地区
                this.arryShow.splice(index, 1);
                let splitArryShow = e.split(' ');
                // splitArryShow content may String
                if (splitArryShow[2] === '' && splitArryShow[1] === '') {
                    let indexOne = this.sendDataCountry.findIndex(
                        /* eslint-disable-next-line*/
                        e => e == splitArryShow[0]
                    );
                    this.sendDataCountry.splice(indexOne, 1);
                    this.CountryString = this.sendDataCountry.join(',');
                }
                if (splitArryShow[2] === '') {
                    let indexTwo = this.sendDataProvence.findIndex(
                        /* eslint-disable-next-line*/
                        e => e == splitArryShow[1]
                    );

                    this.ProvenceString = this.sendDataProvence
                        .splice(indexTwo, 1)
                        .join(',');
                }
                if (splitArryShow[2] !== '') {
                    let indexThree = this.sendDataCity.findIndex(
                        /* eslint-disable-next-line*/
                        e => e == splitArryShow[2]
                    );
                    this.sendDataCity.splice(indexThree, 1);
                    this.CityString = this.sendDataCity.join(',');
                }
            },
            // 选择当前页全部数据
            nowData() {
                let aset = [];
                this.user.userList.forEach(e => {
                    aset.push(e.openid);
                });
                this.fansId = [...new Set(aset)];
                this.selectAllDeleteArray = [];
                this.allFansSelectFlag = false;
                this.chooseNum = 0;
            },
            // 全选数据
            allData(flag) {
                if (flag) {
                    this.selectAllDeleteArray = [];
                }
                this.allFansSelectFlag = true;
                let aset = [];
                this.user.userList.forEach(element => {
                    aset.push(element.openid);
                });
                this.fansId = [...new Set(aset)];
                this.fansId.length =
                    this.user.totalRow - (this.selectAllDeleteArray.length || 0);
                this.chooseNum = this.user.totalRow;
                if (this.allFansSelectFlag) {
                    this.delSource();
                }
            },
            delSource() {
                // 换页数据清除
                if (this.selectAllDeleteArray && this.allFansSelectFlag) {
                    for (let i = 0; i < this.selectAllDeleteArray.length; i++) {
                        for (let j = 0; j < this.fansId.length; j++) {
                            if (this.fansId[j] === this.selectAllDeleteArray[i]) {
                                this.fansId.splice(j, 1);
                                j = j - 1;
                            }
                        }
                    }
                }
                this.fansId.length =
                    this.user.totalRow - (this.selectAllDeleteArray.length || 0);
            },
            delElement(openid) {
                // 删除数据添加以及数据重组
                if (this.allFansSelectFlag) {
                    let index = this.selectAllDeleteArray.findIndex(i => i === openid);
                    if (index === -1) {
                        this.selectAllDeleteArray.push(openid);
                    } else {
                        this.selectAllDeleteArray.splice(index, 1);
                    }
                }
            },
            // 清除数据
            clearData() {
                // 否标记
                this.allFansSelectFlag = false;
                //   标记数组初始化
                this.selectAllDeleteArray = [];

                this.chooseNum = 0;
                this.fansId = [];
            },
            clearLength() {
                this.tagsId = [];
                this.tagsIdString = '';
                for (let item of this.tags) {
                    item.ids = '';
                }
            },
            clearTrue() {
                this.checkOne = false;
                this.checkTwo = false;
                this.day = '';
            },
            check(e, index) {
                this.indexs = index;
                this.value = e;
            },

            checkLanguage(e, index) {
                this.LanguageIndex = index;
                this.Language = e;
            },
            checkTag(e) {
                this.indexsa = this.tags.findIndex(card => card.tagId === e);
                this.tags[this.indexsa].ids = 1;
                this.test = this.tagsId.find(card => card === e);
                if (!this.test) {
                    this.tagsId.push(e);
                    this.tagsIdString = this.tagsId.join(',');
                } else {
                    let targetIndex = this.tagsId.findIndex(card => card === e);
                    let a = this.tags.findIndex(
                        card => card.tagId === this.tagsId[targetIndex]
                    );
                    this.tags[a].ids = '';
                    this.tagsId.splice(targetIndex, 1);
                    this.tagsIdString = this.tagsId.join(',');
                }
            },
            // 筛选打标签
            checkAddTag(e) {
                let sindex = this.fildchooseFans.findIndex(card => card.id === e);
                this.fildchooseFans[sindex].ids = 2;
                let tests = this.checkValue.find(card => card === e);
                if (!tests) {
                    this.checkValue.push(e);
                } else {
                    let targetIndexs = this.checkValue.findIndex(card => card === e);
                    let idsIndex = this.fildchooseFans.findIndex(
                        card => card.id === this.checkValue[targetIndexs]
                    );
                    this.fildchooseFans[idsIndex].ids = '';
                    this.checkValue.splice(targetIndexs, 1);
                }
            },
            // 获取列表 fansList
            getFansList() {
                this.loadings = false;
                this.chooseNum = 0;
                this.fansId = [];
                // 点击确定时，进行筛选将值保存
                WechatApiV1
                    .modifyRemark(
                        this.sendDataCity.length === 0 ? '' : this.CityString,
                        this.sendDataCountry.length === 0 ? '' : this.CountryString,
                        this.checkOne === false ? 1 : 0,
                        this.Language,
                        this.searchValue,
                        this.user.page,
                        this.sendDataProvence.length === 0 ? '' : this.ProvenceString,
                        this.value,
                        1,
                        this.day,
                        this.tagsIdString
                    )
                    .then(res => {
                        this.user.userList = res.body.data.customerList.map(user => {
                            user.tagIds = user.tags.map(tag => tag.id);
                            return user;
                        });
                        this.fansList = res.body.data.customerList;
                        this.user.totalPage = res.body.data.totalPage;
                        this.user.totalRow = res.body.data.totalRow;
                        this.loadings = true;
                    })
                    .catch(() => {
                        this.loadings = true;
                    });
            },
            // 切换页码
            handlePage(e) {
                this.user.page = e;
                // 使用点击筛选后的值
                this.loadings = false;
                this.chooseNum = 0;
                // 点击确定时，进行筛选将值保存
                WechatApiV1
                    .modifyRemark(
                        this.sendDataCitySave.length === 0 ? '' : this.CityStringSave,
                        this.sendDataCountrySave.length === 0 ? '' : this.CountryStringSave,
                        this.checkOneSave === false ? 1 : 0,
                        this.LanguageSave,
                        this.markValue,
                        this.user.page,
                        this.sendDataProvenceSave.length === 0 ? '' : this.ProvenceStringSave,
                        this.valueSave,
                        1,
                        this.daySave,
                        this.tagsIdStringSave
                    )
                    .then(res => {
                        this.user.userList = res.body.data.customerList.map(user => {
                            user.tagIds = user.tags.map(tag => tag.id);
                            return user;
                        });
                        this.fansList = res.body.data.customerList;
                        this.user.totalPage = res.body.data.totalPage;
                        this.user.totalRow = res.body.data.totalRow;
                        this.loadings = true;
                        if (this.allFansSelectFlag) {
                            this.allData();
                        }
                    })
                    .catch(() => {
                        this.loadings = true;
                    });
            },
            // 显示选择分组框
            showTagsBox(user) {
                if (this.isShowTagsBox === '') {
                    this.isShowTagsBox = user.openid;
                    this.originalTagIds = user.tagIds.slice();
                } else {
                    if (this.isShowTagsBox === user.openid) {
                        this.cancelTagChange(user);
                    } else {
                        this.isShowTagsBox = user.openid;
                        this.originalTagIds = user.tagIds.slice();
                    }
                }
            },
            // 隐藏选择分组框
            hideTagsBox(user, index) {
                let selectBox = document.querySelectorAll('.selectBox');
                selectBox[index].blur();
                this.isShowTagsBox = '';
            },
            cancelTagChange(user, index) {
                let selectBox = document.querySelectorAll('.selectBox');
                selectBox[index].blur();
                user.tagIds = this.originalTagIds;
                this.isShowTagsBox = '';
            },
            // 修改联系人标签
            updateUserTag(user, index) {
                if (user.tagIds.length > 20) {
                    return false;
                }
                let selectBox = document.querySelectorAll('.selectBox');
                selectBox[index].blur();
                this.isShowTagsBox = '';
                WechatApiV1.updateCustomerTag(user.tagIds, user.id)
                    .then(res => {
                        const newTags = this.tags.filter(tag => user.tagIds.includes(tag.id));
                        user.tags = newTags;
                        this.$toast(res.body.message, 'success');
                        trackEvent('微信管理-给联系人修改标签');
                        WechatApiV1.getTagList('')
                            .then(res => {
                                this.tags = res.body.data.tagList;
                            });
                        this.getFansList();
                    });
            },
            // index :  0 新建标签  1编辑备注 2重命名
            remark(index, id, updateCustomerIndex, name, nickname) {
                this.index = index;
                this.markId = id;
                this.updateCustomerIndex = updateCustomerIndex;
                this.confirm = true;
                if (this.index === 0 || this.index === -1) {
                    this.confirmTitle = this.$t('follower.newTag');
                    if (this.index === -1) {
                        this.isShowTagsBox = '';
                    }
                } else if (this.index === 1) {
                    this.confirmTitle = this.$t('follower.editRemark');
                    if (name === nickname) {
                        this.confirmValue = '';
                    } else {
                        this.confirmValue = name;
                    }
                } else if (this.index === 2) {
                    this.confirmTitle = this.$t('follower.reName');
                    this.confirmValue = this.tagname;
                }
            },
            //跳转联系人
            contact(user) {
                ContactApiV1.getCustomerId(user.appId, user.openid, 1).then(res => {
                    if (res.body.data.customerId) {
                        const custom = this.$router.resolve({
                            name: 'customerDetail',
                            query: {id: res.body.data.customerId}
                        });
                        window.open(custom.href, '_blank');
                    }
                });
            },
            // 取消
            cancel() {
                this.confirm = false;
                this.confirmValue = '';
            },
            // 确认打标签
            sureTags() {
                const RegCn = /[\u4e00-\u9fa5]/g;
                let value = this.confirmValue;
                value = value.replace(RegCn, 'aa');
                let confirmLength = value.length;
                if (this.index === 1) {
                    if (this.confirmValue === '') {
                        this.$toast(this.$t('follower.notEmpty'));
                        return;
                    }
                    if (confirmLength > 12) {
                        this.$toast(this.$t('follower.cannotOver6'));
                        return;
                    }
                    // 编辑备注
                    WechatApiV1.updateCustomer(this.confirmValue, this.markId)
                        .then(res => {
                            this.$toast(res.body.message, 'success');
                            this.user.userList[this.updateCustomerIndex].name =
                                res.body.data.name;
                            this.confirmValue = '';
                            this.confirm = false;
                            this.getFansList();
                            trackEvent('微信管理-给联系人修改备注');
                        });
                } else if (this.index === 0 || this.index === -1) {
                    // 新建标签
                    if (this.confirmValue === '') {
                        this.$toast(this.$t('follower.labelNameEmpty'));
                        return;
                    }
                    if (confirmLength > 12) {
                        this.$toast(this.$t('follower.cannotOver6'));
                        return;
                    }
                    WechatApiV1.addTag(this.confirmValue)
                        .then(res => {
                            this.$toast(res.body.message, 'success');
                            this.confirmValue = '';
                            this.confirm = false;
                            trackEvent('微信管理-新建标签');
                            WechatApiV1.getTagList('')
                                .then(res => {
                                    this.tags = res.body.data.tagList;
                                });
                            this.$emit('refreshTagList');
                        });
                } else if (this.index === 2) {
                    if (this.confirmValue === '' || confirmLength > 12) {
                        this.$toast(this.$t('follower.nameReg'));
                        return;
                    }
                    // 重命名
                    WechatApiV1.updateTagName(this.confirmValue, this.seleTag)
                        .then(() => {
                            this.$toast(this.$t('common.updateSuccess'), 'success');
                            WechatApiV1.getTagList('')
                                .then(res => {
                                    this.tagname = this.confirmValue;
                                    this.tags = res.body.data.tagList;
                                    this.confirmValue = '';
                                    this.confirm = false;
                                    trackEvent('微信管理-修改标签名称');
                                });
                        });
                }
            },
            // 展示、收起全部标签
            toggleTags() {
                this.showlist = !this.showlist;
            },
            closeTags() {
                this.showlist = false;
            },
            // 打开粉丝标签日志弹出层
            showLog() {
                this.logModalOpen = true;
                this.getHistoryLog();
            },
            changeLogPage(no) {
                this.logsLoading = true;
                this.logPageNumber = no;
                this.getHistoryLog();
            },

            toErrPage(no) {
                this.errPageNumber = no;
                this.fetchErr();
            },
            // 点击"更新失败"，展开错误信息
            openErrorMsg(log) {
                // 进行中、无错误的日志，不能查看错误信息
                if (log.progress !== 100 || log.errorCount <= 0) return;

                this.errPageNumber = 1;
                if (this.activeLog.id === log.id) {
                    this.$set(this.$data, 'activeLog', {});
                    this.logErrs = [];
                    this.errTotalPage = 1;
                } else {
                    this.$set(this.$data, 'activeLog', log);
                    this.fetchErr();
                }
            },
            // 获取文件的错误日志
            fetchErr() {
                WechatApiV1
                    .getErrorMessage({
                        labelProgressLogId: this.activeLog.id,
                        pageNumber: this.errPageNumber,
                        pageSize: 5
                    })
                    .then(({body: {data: {errorMessageList, totalPage}}}) => {
                        this.logErrs = errorMessageList;
                        // 最多显示前100页
                        this.errTotalPage = Math.min(totalPage, 100);
                    });
            },
            //ready取消 '粉丝同步属性' 任务
            readyCancelTask(log) {
                this.celTaskFlag = true;
                this.gotCanceledTask = log;
            },
            //确定取消'粉丝同步属性'任务
            cancelTaskSync() {
                this.celTaskFlag = false;
                WechatApiV1
                    .delSyncFansTask(this.gotCanceledTask.id)
                    .then(() => {
                        this.getHistoryLog();
                        this.$emit('refreshSyncStatus');
                        this.$toast(this.$t('follower.cancelSuccess'), 'success');
                    });
            }
        }
    };
</script>
<style lang="scss" type="text/scss" rel="stylesheet/scss">
    @import "../../common/scss/base/variables";
    @import "../../common/scss/base/mixin";

    .wechat-fans {
        .tag-btn {
            text-transform: none;
        }

        .multi-select {
            width: 400px;
        }

        .area {
            display: inline-block;
            margin-right: 16px;

            .btn {
                float: left;
                margin-top: ($input-field-height - 24px)/2;
            }
        }

        .selector {
            display: inline-block;
        }

        .router {
            display: inline-block;
            transform: rotate(180deg);
            -ms-transform: rotate(180deg); /* IE 9 */
            -moz-transform: rotate(180deg); /* Firefox */
            -webkit-transform: rotate(180deg); /* Safari 和 Chrome */
            -o-transform: rotate(180deg); /* Opera */
        }

        .bg {
            background-color: #fafafa;
        }

        .fans-list-head {
            margin-top: 16px;
            padding-top: 16px;
            border-top: 1px solid $border-color;
            line-height: $input-field-height;
            @include clearfix();

            > h3 {
                .export-all {
                    text-transform:none;
                    font-weight: normal;
                    font-size: 14px;
                    padding: 0 5px;
                }

                span {
                    font-size: 12px;
                }
            }

            .progress-detail {
                display: inline-block;
                position: relative;
                margin: 0 15px 0;
                cursor: default;

                .progress-pic {
                    margin-left: 15px;
                }
            }
        }

        .following-user-content {
            @include clearfix();
            margin-top: 12px;
            border: 1px solid $border-color;

            .present-group {
                padding-left: 30px;
                font-size: 16px;
                height: 50px;
                line-height: 50px;
                border-bottom: 0 solid $border-color;
                border-right: 1px solid $border-color;
                background-color: #fafafa;
                position: relative;
                @include clearfix();

                .btnsa {
                    position: relative;
                    vertical-align: middle;
                    font-size: 16px;
                    display: inline-block;
                    cursor: pointer;

                    &:hover {
                        color: #0dc1a8;
                    }

                    .hidden-menu {
                        top: 35px;
                        left: 0;
                    }
                }

                .iconPosition {
                    position: absolute;
                    left: 40px;
                    top: 72%;
                    z-index: 1000;
                    background-color: white;

                    div {
                        max-height: 30px;
                        line-height: 30px;
                        text-align: center;
                        cursor: pointer;
                        font-size: 12px;
                        padding: 0 15px;

                        &:hover {
                            background-color: #55d4c3;
                        }
                    }
                }

                span {
                    font-size: 14px;
                    color: $blue;

                    span {
                        margin-left: 8px;

                        &:hover {
                            cursor: pointer;
                            text-decoration: underline;
                        }
                    }
                }

                .remarks {
                    float: right;
                }
            }

            .user-list {
                border-right: 1px solid $border-color;

                li {
                    display: flex;
                    @include box-sizing();
                    border-top: 1px solid $border-color;
                    border-bottom: 1px solid $border-color;
                    padding: 10px 0 10px 40px;
                    @include clearfix();

                    .way {
                        display: inline-block;
                        width: 16px;
                        height: 16px;
                        fill: currentColor;
                        @include transition();
                        cursor: pointer;
                        margin-top: 12px;
                    }

                    img {
                        display: inline-block;
                        vertical-align: top;
                        width: 50px;
                        height: 50px;
                    }

                    .user-name {
                        flex: auto;
                        margin-left: 10px;
                        display: inline-block;
                        vertical-align: top;

                        .name {
                            display: block;
                            height: 18px;
                            font-size: 14px;
                            line-height: 18px;
                        }

                        .no-tags,
                        .tags {
                            display: inline-block;
                            vertical-align: top;
                            margin-top: 3px;
                            margin-right: 5px;
                            padding: 0 12px;
                            @include box-sizing();
                            height: 24px;
                            border: 1px solid $border-color;
                            @include border-radius(12px);
                            line-height: 22px;
                            text-align: center;
                        }

                        .redundant-tags {
                            display: inline-block;
                            vertical-align: top;
                            margin-top: 3px;
                            margin-right: 5px;
                            line-height: 24px;
                        }

                        .icon-sele {
                            position: relative;
                            display: inline-block;

                            button {
                                position: relative;

                                input {
                                    opacity: 0;
                                    margin: 8px 8px;
                                    position: absolute;
                                    z-index: 10;
                                    @include box-sizing();
                                    width: 12px;
                                    height: 12px;

                                    &:not(.icon-disable):hover {
                                        cursor: pointer;
                                    }
                                }

                                .icon--icon {
                                    position: relative;
                                    display: inline-block;
                                    vertical-align: top;
                                    margin: 8px 8px;
                                    width: 0;
                                    height: 0;
                                    border: 4px solid $color-light-content;
                                    @include transform(rotate(45deg));
                                    border-top-color: transparent;
                                    border-left-color: transparent;

                                    &:not(.icon-disable):hover {
                                        cursor: pointer;
                                    }
                                }
                            }

                            .tags-box {
                                @include box-sizing();
                                position: absolute;
                                z-index: 20;
                                top: 30px;
                                left: 50%;
                                margin-left: -210px;
                                padding: 16px;
                                width: 420px;
                                background: #fff;
                                border: 1px solid $border-color;

                                &:before {
                                    @include box-sizing();
                                    position: absolute;
                                    top: -7px;
                                    left: 50%;
                                    margin-left: -8px;
                                    content: "";
                                    width: 16px;
                                    height: 16px;
                                    background: #fff;
                                    border: 1px solid $border-color;
                                    @include transform(rotate(45deg));
                                    border-right-color: transparent;
                                    border-bottom-color: transparent;
                                }

                                div.btns {
                                    text-align: center;
                                    padding-top: 10px;
                                }

                                .tag-hint {
                                    color: $red;
                                }

                                .checkbox {
                                    width: 33%;
                                    line-height: $input-field-height;
                                    @include ellipsis();
                                }
                            }
                        }
                    }
                }
            }

            .group-list {
                @include box-sizing();
                float: left;
                width: 220px;
                height: 100%;

                ul {
                    li:nth-of-type(1) {
                        font-size: 16px;
                        padding-left: 30px;
                    }

                    li {
                        @include box-sizing();
                        width: 100%;
                        height: 40px;
                        font-size: 14px;
                        line-height: 40px;
                        padding-left: 50px;

                        &.sele {
                            background: #f4f5f9;
                        }

                        &:hover {
                            cursor: pointer;
                            background: #f4f4f4;
                        }
                    }
                }
            }

            .openid {
                width: 235px;
            }
        }

        .remarks {
            flex: none;
            @include box-sizing();
            min-width: 130px;
            min-height: 1px;
            padding: 0 6px;
            text-align: center;
            line-height: 49px;
            .btn {
                margin: 0;
                padding: 0;
                &:not([disabled]){
                    color: currentColor;
                    &:hover svg {
                        fill: $theme; 
                    }
                }
            }
        }

        .tagbox {
            display: inline-block;
            width: 770px;
            min-height: 225px;
            max-height: 400px;
            overflow: auto;
            border: 1px solid $border-color;
            border-radius: 5px;
            padding: 8px 8px 16px;
            background-color: $content-bg;

            .tag {
                display: inline-block;
                width: 6em;
                @include ellipsis();
                margin: 0 4px;
                padding: 0 .5em;
                text-align: center;
                border: 1px solid $border-color;
                border-radius: 4px;
                background-color: white;
                @include user-select(none);
                cursor: pointer;

                &:hover {
                    color: $theme;
                    border-color: $theme;
                }

                &.active,
                &:active {
                    color: white;
                    background-color: $theme;
                    border-color: $theme;
                }
            }
        }

        .extra-tags-box {
            display: inline-block;
            vertical-align: top;
            position: relative;
            margin-left: 16px;
            margin-right: 16px;
        }

        .extra-tags-trigger {
            @include user-select(none);
            cursor: pointer;
            @include transition();

            &:hover {
                color: $light-theme;
            }

            &:active,
            &.active {
                color: $theme;
            }

            &.active .icon-caret-down {
                @include transform(rotate(180deg));
            }

            .icon-caret-down {
                width: 14px;
                height: 14px;
                fill: currentColor;
                vertical-align: middle;
            }
        }

        .extra-tags-drop {
            overflow: auto;
            position: absolute;
            left: 0;
            top: $input-field-height + 4px;
            max-height: 200px;
            width: 440px;
            background-color: white;
            z-index: $index-menu - 1;
            border: 1px solid $theme;
            @include border-radius(4px);
            padding: 5px;
            box-sizing: border-box;
        }

        .log-tips {
            margin-bottom: 16px;
        }

        .log-detail-tags {
            display: inline-flex;
            padding: 10px;
            max-height: 20px + 35px*5;
            overflow: auto;
            white-space: normal;
            @include transform-origin(left top);

            ul {
                $width: 100px;
                width: $width * 2;
                @include user-select(text);

                li {
                    display: inline-block;
                    vertical-align: top;
                    @include box-sizing();
                    width: $width;
                    @include ellipsis();
                }
            }
        }

        .action-icon.open {
            @include transform(rotate(180deg));
        }

        .error-msg {
            margin-left: 24px;

            .error-details {
                margin: 16px 0;
                font-weight: bold;
            }

            .error-table {
                thead {
                    background-color: #feefef;
                    color: $red;
                    font-weight: bold;
                }

                tr {
                    td {
                        border-right: 1px solid $border-color;
                        border-bottom: none;
                    }

                    td:first-child {
                        width: 10%;
                        text-align: center;
                    }

                    td:not(:first-child) {
                        width: 45%;
                    }
                }
            }
        }

        .input-search {
            border-radius: 4px;
            margin-left: 280px;
        }
        .cancel-task {
            color: $theme;
        }
        .cancel-text {
            text-align: center;
            padding: 50px 0;
        }
    }
</style>
