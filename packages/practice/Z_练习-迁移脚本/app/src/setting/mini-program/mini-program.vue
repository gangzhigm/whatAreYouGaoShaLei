<template>
    <div v-if="isAuthLoaded">
        <!--    授权小程序-->
        <div class="mini-program" v-if="isAuthMicroPage || isAuthShoppingGuide">
            <div class="page-content">
                <div class="authorization" v-if="!wechatCode">
                    <div class="authorization-btn">
                        <button type="button" class="btn btn-md btn-theme add-btn"
                                @click="authMiniProgram">
                            <svg aria-hidden="true">
                                <use xlink:href="#icon-plus"></use>
                            </svg>
                            {{$t('microPage.miniProgramAuth')}}
                        </button>
                        <i :title="$t('microPage.HelpCenterSteps')" class="explain-step">
                            <svg aria-hidden="true" class="icon-help">
                                <use xlink:href="#icon-help">
                                </use>
                            </svg>
                        </i>
                    </div>
                    <p class="refresh-text">{{$t('microPage.AfterRefresh')}}</p>
                </div>
                <!--            授权小程序说明-->
                <div class="auth-mini">
                    <div class="auth-header">
                        {{$t('microPage.hasMiniProgram')}}
                        <span v-if="miniProgramDetail.subType && [2,3,4,5].includes(miniProgramDetail.codeAuditStatus)" class="auth-header-tab" :class="[miniProgramDetail.subType === 1 ? 'green' : 'blue']">
                            {{miniProgramDetail.subType === 1 ? 'home.microPage' : 'home.shoppingGuide' | t}}
                        </span>
                    </div>
                    <!-- 已授权小程序基本信息-->
                    <div class="program-info" v-if="wechatCode">
                        <div class="program-avatar">
                            <img :src="miniProgramDetail.headImg" v-if="miniProgramDetail.headImg">
                        </div>
                        <span class="program-name">{{ miniProgramDetail.nickName }}</span>
                        <div class="issue-status">
                            <span v-if="miniProgramDetail.releaseStatus===2" class="published">{{$t('microPage.Published')}}</span>
                            <div class="has-issue" v-if="miniProgramDetail.releaseStatus===1">
                                <span v-if="miniProgramDetail.codeAuditStatus===1" class="unreviewed status-text">{{$t('microPage.unchecked')}}</span>
                                <span v-if="miniProgramDetail.codeAuditStatus===2" class="unreviewed status-text">{{$t('microPage.Auditing')}}</span>
                                <span v-if="miniProgramDetail.codeAuditStatus===3" class="auditing status-text">{{$t('microPage.passAudi')}}</span>
                                <span v-if="miniProgramDetail.codeAuditStatus===4">
                                    <span  class="not-approved status-text">
                                    {{$t('microPage.Failed')}}
                                    </span>
                                    <i v-title:right="miniProgramDetail.codeErrmsg">
                                        <svg aria-hidden="true">
                                            <use xlink:href="#icon-help">
                                            </use>
                                        </svg>
                                    </i>
                                </span>
                                <span v-if="miniProgramDetail.codeAuditStatus===5" class="unreviewed status-text">{{$t('microPage.ReviewLater')}}</span>
                            </div>
                        </div>
                    </div>
                    <!--                已授权小程序nav -- 仅已授权成功小程序展示 -->
                    <div class="program-header" v-if="wechatCode">
                        <span class="header-nav" :class="{'active':navType===1}" @click="navType=1">{{$t('microPage.Information')}}</span>
                        <span v-if="miniProgramDetail.subType === 1" class="header-nav" :class="{'active':navType===2}" @click="getNavStyle">{{$t('microPage.NavigationSettings')}}</span>
                    </div>
                </div>
                <div class="simplify-table auto-width mini-wrapper" v-if="navType===1">
                    <table>
                        <thead>
                        <tr v-if="wechatCode">
                            <th>{{$t('microPage.info')}}</th>
                            <!--                        首次授权完毕页面 无"内容"一栏-->
                            <th>{{$t('microPage.Content')}}</th>
                            <th>{{$t('microPage.Notice')}}</th>
                            <th>{{$t('microPage.Status')}}</th>
                            <th>{{$t('microPage.modify')}}</th>
                        </tr>
                        </thead>
                        <tbody v-if="wechatCode">
                        <tr>
                            <td>{{$t('microPage.Name')}}</td>
                            <td>{{miniProgramDetail.nickName}}</td>
                            <td>{{$t('microPage.UnableModify')}}</td>
                            <td>
                                <span v-if="miniProgramDetail.nickNameAuditStatus===1">{{$t('microPage.notSet')}}</span>
                                <span v-if="miniProgramDetail.nickNameAuditStatus===3" class="theme-text">{{$t('microPage.alreadyPassed')}}</span>
                                <span v-if="miniProgramDetail.nickNameAuditStatus===2" class="not-pass">
                                    {{$t('microPage.Failed')}}
                                    <i :title="miniProgramDetail.nickNameErrmsg">
                                        <svg aria-hidden="true">
                                            <use xlink:href="#icon-help"></use>
                                        </svg>
                                    </i>
                                </span>
                            </td>
                            <td>
                                <div v-if="miniProgramDetail.nickNameAuditStatus===1">
                                    <button class="btn theme-text" @click="editProgramName">{{$t('microPage.fill')}}</button>
                                </div>
                                <div v-else>
                                    <button class="btn theme-text"
                                            :class="{'disabled-text': miniProgramDetail.releaseStatus===2||miniProgramDetail.nickNameAuditStatus===4}"
                                            :disabled="miniProgramDetail.releaseStatus===2||miniProgramDetail.nickNameAuditStatus===4"
                                            @click="editProgramName">
                                        {{$t('microPage.modify')}}
                                    </button>
                                </div>
                            </td>
                        </tr>
                        <tr>
                            <td>{{$t('microPage.Avatar')}}</td>
                            <td class="tr-avatar"><img :src="miniProgramDetail.headImg" v-if="miniProgramDetail.headImg"></td>
                            <td>{{$t('microPage.timesMonth')}}</td>
                            <td>
                                <span v-if="miniProgramDetail.headimageAuditStatus===1">{{$t('microPage.notSet')}}</span>
                                <span v-if="miniProgramDetail.headimageAuditStatus===3" class="theme-text">{{$t('microPage.alreadyPassed')}}</span>
                                <span v-if="miniProgramDetail.headimageAuditStatus===2" class="not-pass">
                                    {{$t('microPage.Failed')}}
                                    <i :title="miniProgramDetail.headimageAuditErrmsg">
                                        <svg aria-hidden="true">
                                            <use xlink:href="#icon-help"></use>
                                        </svg>
                                    </i>

                                </span>
                            </td>
                            <td>
                                <div v-if="miniProgramDetail.headimageAuditStatus===1">
                                    <button class="btn theme-text" @click="editProgramAvatar">{{$t('microPage.upload')}}</button>
                                </div>
                                <div v-else>
                                    <button class="btn theme-text" @click="editProgramAvatar"
                                            :class="{'disabled-text': miniProgramDetail.headimageAuditStatus===4}"
                                            :disabled="miniProgramDetail.headimageAuditStatus===4">{{$t('microPage.modify')}}
                                    </button>
                                </div>
                            </td>
                        </tr>
                        <tr>
                            <td>{{$t('microPage.Introduction')}}</td>
                            <td class="mini-signature">{{ miniProgramDetail.signature }}</td>
                            <td>{{$t('microPage.timesMonth')}}</td>
                            <td>
                                <span v-if="miniProgramDetail.signatureAuditStatus===1">{{$t('microPage.notSet')}}</span>
                                <span v-if="miniProgramDetail.signatureAuditStatus===3" class="theme-text">{{$t('microPage.alreadyPassed')}}</span>
                                <span v-if="miniProgramDetail.signatureAuditStatus===2" class="not-pass">
                                    {{$t('microPage.Failed')}}
                                    <i :title="miniProgramDetail.signatureErrmsg">
                                        <svg aria-hidden="true" >
                                            <use xlink:href="#icon-help"></use>
                                        </svg>
                                    </i>
                                </span>
                            </td>
                            <td>
                                <div v-if="miniProgramDetail.signatureAuditStatus===1">
                                    <button class="btn theme-text" @click="editProgramIntroduce">{{$t('microPage.fill')}}</button>
                                </div>
                                <div v-else>
                                    <button class="btn theme-text"
                                            :class="{'disabled-text':miniProgramDetail.signatureAuditStatus===4}"
                                            :disabled="miniProgramDetail.signatureAuditStatus===4"
                                            @click="editProgramIntroduce">
                                        {{$t('microPage.modify')}}
                                    </button>
                                </div>
                            </td>
                        </tr>
                        <tr>
                            <td>{{$t('microPage.Service')}}</td>
                            <td>
                                <p v-for="cate in miniProgramDetail.categories" v-if="cate.audit_status===3">
                                    {{cate.first_name}} > {{cate.second_name}}
                                </p>
                            </td>
                            <td>{{$t('microPage.timesMonth')}}</td>
                            <td>
                                <span v-if="miniProgramDetail.categoryAuditStatus===1">{{$t('microPage.notSet')}}</span>
                                <span v-if="miniProgramDetail.categoryAuditStatus===3" class="theme-text">{{$t('microPage.alreadyPassed')}}</span>
                                <span v-if="miniProgramDetail.categoryAuditStatus===2" class="not-pass">
                                    {{$t('microPage.Failed')}}
                                    <i :title="miniProgramDetail.categoryErrmsg">
                                       <svg aria-hidden="true" >
                                            <use xlink:href="#icon-help"></use>
                                        </svg>
                                    </i>
                                </span>
                            </td>
                            <td>
                                <div v-if="miniProgramDetail.categoryAuditStatus===1">
                                    <button class="btn theme-text" @click="editProgramCategory">{{$t('microPage.select')}}</button>
                                </div>
                                <div v-else>
                                    <button class="btn theme-text"
                                            :class="{'disabled-text':miniProgramDetail.categoryAuditStatus===4}"
                                            :disabled="miniProgramDetail.categoryAuditStatus===4"
                                            @click="editProgramCategory">
                                        {{$t('microPage.modify')}}
                                    </button>
                                </div>
                            </td>
                        </tr>
                        </tbody>
                    </table>
                    <div v-if="wechatCode">
                        <div v-if="miniProgramDetail.codeAuditStatus===1||miniProgramDetail.codeAuditStatus===4">
                            <button class="btn btn-theme btn-md submit-btn" @click="selectMiniTypeHandler"
                                    :disabled="sumbitAuditDisable">
                                {{$t('microPage.submitAudit')}}
                            </button>
                            <span class="notice-tr first-submit">{{$t('microPage.approvalDate')}}</span>
                        </div>
                        <div class="notice-tr red-text" v-if="miniProgramDetail.nickNameAuditStatus===2
                            ||miniProgramDetail.headimageAuditStatus===2||miniProgramDetail.signatureAuditStatus===2
                            ||miniProgramDetail.categoryAuditStatus===2">{{$t('microPage.resubmitAudit')}}</div>
                    </div>
                    <!--                无授权小程序-->
                    <list-empty v-if="!wechatCode"/>
                </div>
                <!--            导航设置-->
                <div v-if="navType===2" class="set-nav">
                    <div class="form-field">
                        <label class="label use-style">{{$t('microPage.GeneralStyle')}}</label>
                    </div>
                    <div class="form-field">
                        <label class="label">
                            {{$t('microPage.ThemeColor')}}
                            <i  :title="$t('microPage.topNavigationHelp')">
                                <svg aria-hidden="true">
                                    <use xlink:href="#icon-help"></use>
                                </svg>
                            </i>
                        </label>
                        <color-picker v-model="themeColor"></color-picker>
                    </div>
                    <div class="form-field">
                        <label class="label">
                            {{$t('microPage.navStyle')}}
                            <i :title="$t('microPage.bottomNavigationHelp')">
                                <svg aria-hidden="true">
                                    <use xlink:href="#icon-help"></use>
                                </svg>
                            </i>
                        </label>
                        <radio :source="1" v-model="navStyle">{{$t('microPage.Light')}}</radio>
                        <radio :source="2" v-model="navStyle">{{$t('microPage.Dark')}}</radio>
                    </div>
                    <div class="form-field">
                        <label class="label">
                            {{$t('microPage.fontStyle')}}
                            <i :title="$t('microPage.FontTop')">
                                <svg aria-hidden="true">
                                    <use xlink:href="#icon-help"></use>
                                </svg>
                            </i>
                        </label>
                        <radio :source="1" v-model="fontColor">{{$t('microPage.Light')}}</radio>
                        <radio :source="2" v-model="fontColor">{{$t('microPage.Dark')}}</radio>
                    </div>
                    <button class="btn btn-theme btn-md save-nav" @click="saveMiniprogramNav">{{$t('openPlat.save')}}</button>
                </div>
                <div class="no-auth" v-if="wechatCode">
                  {{$t('microPage.oneMinniProgram')}}
                    <button class="btn " :class="{'theme-text': miniProgramDetail.codeAuditStatus!==2}" @click="unbindFlag=true"
                            :disabled="miniProgramDetail.codeAuditStatus===2">
                        {{$t('wechatNo.unBind')}}
                    </button>
                    {{$t('microPage.curMini')}}
                </div>
            </div>
            <!--        选择授权小程序方式-->
            <modal :title="$t('microPage.miniProgramAuth')" @close="authWay=false" v-if="authWay">
                <div class="auth-modal">
                    <div class="wechat-icon">
                        <svg aria-hidden="true">
                            <use xlink:href="#icon-weixin">
                            </use>
                        </svg>
                    </div>
                    <h4>{{$t('microPage.wechatMini')}}</h4>
                    <p class="auth-explain">{{$t('microPage.needAuthMini')}}</p>
                    <button class="btn btn-theme btn-md" @click="readyReuse">{{$t('microPage.ReusePublic')}}</button>
                    <button class="btn btn-md btn-theme-border has-mini" @click="hasMiniProgramToAuth">{{$t('microPage.hasMiniToAuth')}}</button>
                    <a href="https://mp.weixin.qq.com/wxopen/waregister?action=step1" target="_blank" class="theme-text">
                        {{$t('microPage.commonRegister')}}
                    </a>
                </div>
            </modal>
            <!--        select 复用的公众号-->
            <modal :title="$t('microPage.reuseTitle')" @close="reuseFlag=false" v-if="reuseFlag">
                <div class="reuse-other-account">
                    <h4>{{$t('microPage.chooseHasMIni')}}</h4>
                    <ul>
                        <li v-if="bingingList.length===0">{{$t('microPage.noHasMIni')}}</li>
                        <li v-else v-for="item in bingingList" :key="item.authorizerInfoId"
                            @click="accountCreateProgram(item)">
                            <img :src="item.headImg" alt="" class="account-avatar">
                            <span class="account-name" :title="item.principalName">{{ item.principalName }}</span>
                        </li>
                    </ul>
                    <a class="theme-text reuse-mini" @click="reuseOther">{{$t('microPage.reuseOtherPublic')}}</a>
                </div>
            </modal>
            <!--        填写/修改 小程序name-->
            <modal :title="$t('microPage.Name')" @close="editNameFlag=false" v-if="editNameFlag" class="edit-name">
                <div class="form-field">
                    <label class="label">{{$t('microPage.Name')}}</label>
                    <input type="text" class="input" v-model.trim="deepMiniDetail.nickName">
                    <span class="check-name theme-text" @click="checkUsable">{{$t('microPage.checkUsable')}}</span>
                </div>
                <span class="name-rule">
                    {{$t('microPage.nameLimit')}}
                    <a href="https://kf.qq.com/faq/170109umMvm6170109MZNnYV.html" target="_blank"
                       class="theme-text">{{$t('microPage.nameRule')}}</a>
                </span>
                <div class="upload-license-img">
                    <h3>{{$t('microPage.Business')}}</h3>
                    <upload-id :uploadType="2" :imgTitle="$t('microPage.uploadBuessPhoto')" :appid="miniProgramDetail.appId"
                               @delImage="delImage" @getMaterial="getBusinessImage"></upload-id>
                </div>
                <template v-slot:buttons>
                    <input type="button" class="btn btn-md btn-theme-border" :value="$t('common.cancel')" @click="cancelEditName"/>
                    <input type="button" class="btn btn-md btn-theme" :value="$t('common.confirm')" @click="sureEditName"/>
                </template>
            </modal>
            <!--        修改小程序头像-->
            <modal :title="$t('microPage.Avatar')" @close="editAvatarFlag=false" v-if="editAvatarFlag">
                <div class="avatar-wrapper">
                    <div class="avatar-img"><img :src="headimageUrl" v-if="headimageUrl"></div>
                    <div class="upload-notice">
                        <upload-id :uploadType="1" :imgTitle="$t('controller.uploadImage')" :appid="miniProgramDetail.appId"
                                   @getAvatarMaterial="getAvatarMaterial"></upload-id>
                        <p>{{$t('microPage.png')}}</p>
                    </div>
                </div>
                <template v-slot:buttons>
                    <input type="button" class="btn btn-md btn-theme-border" :value="$t('common.cancel')" @click="cancelAvatar"/>
                    <input type="button" class="btn btn-md btn-theme" :value="$t('common.confirm')" @click="sureEditAvatar"/>
                </template>
            </modal>
            <!--        填写/修改小程序介绍-->
            <modal :title="$t('microPage.Introduction')" @close="editIntroduceFlag=false"
                   v-if="editIntroduceFlag" class="edit-introduce-modal">
                <div class="form-field signature-wrapper">
                    <label class="label">{{$t('microPage.Introduction')}}</label>
                    <textarea cols="50" rows="5" class="textarea" maxlength="120"
                              :placeholder="$t('microPage.introContent')"
                              v-model.trim="deepMiniDetail.signature"></textarea>
                    <span class="signature-num">
                        {{deepMiniDetail.signature ? deepMiniDetail.signature.length : 0 }}/120
                    </span>
                </div>
                <template v-slot:buttons>
                    <input type="button" class="btn btn-md btn-theme-border" :value="$t('common.cancel')" @click="cancelSignature"/>
                    <input type="button" class="btn btn-md btn-theme" :value="$t('common.confirm')" @click="sureSignature"/>
                </template>
            </modal>
            <!--        选择/修改小程序类目-->
            <category-editor v-if="editCategoryFlag" :appid="miniProgramDetail.appId"
                             @cancelEditCategory="cancelEditCategory" @getMiniDetail="cancelEditCategory"></category-editor>
            <!--            解绑小程序-->
            <!--ready解绑公众号-->
            <modal v-if="unbindFlag" :title="$t('microPage.Unbundle')" @close="cancelUnbind">
                <div>
                    <p class="unbind-DMT"> {{'wechatNo.readyUnbound' | t}}</p>
                    <checkbox v-model="agreeFlag">{{'wechatNo.unbindDMT' | t}}</checkbox>
                </div>
                <template v-slot:buttons>
                    <input type="button" class="btn btn-md btn-white" @click="cancelUnbind" :value="$t('common.cancel')"/>
                    <input type="button" class="btn btn-md btn-theme" :disabled="!agreeFlag"
                           @click="successUnbind" :value="$t('wechatNo.unbundleNow')"/>
                </template>
            </modal>
            <!--选择提交审核小程序类型-->
            <modal v-if="selectMiniType" class="select-minitype" :title="$t('miniProgram.selectAuditType')" @close="selectMiniType = false">
                <div class="mini-type">
                    <radio :source="'microPage'" v-model="miniType">{{'miniProgram.interactiveMini' | t}}</radio>
                    <radio :source="'shoppingGuide'" v-model="miniType">{{'miniProgram.shoppingGuideMini' | t}}</radio>
                </div>
                <button type="button" class="btn btn-md btn-theme" @click="sumbitAudit">{{'microPage.submitAudit' | t}}</button>
            </modal>
        </div>
        <div class="content-view margin padding white-bg" v-else>
            <span>{{ 'microPage.noMiniProgramAuth' | t }}</span>
        </div>
    </div>
</template>

<script>
import categoryEditor from './category-editor.vue';
import uploadId from './upload-documents.vue';
import  {WechatApiV1, GeteOriginApi } from '@/api';
import cloneDeep from 'lodash/cloneDeep';

export default {
    name: 'mini-program',
    data() {
        return {
            wechatCode: '', //是否有已绑定授权的小程序 true:已绑定 false：未绑定

            bingingList: [], //查询公众号list

            navType: 1, //1：注册信息 2：导航设置
            authWay: false, //授权方式选择
            reuseFlag: false, //复用公众号弹窗显隐
            themeColor: '', //导航设置 主题颜色
            navStyle: '', //导航栏风格 0=未设置 1=浅色 2=深色
            fontColor: '', //字体风格 0=未设置 1=浅色 2=深色

            //小程序相关弹窗
            editNameFlag: false,// 填写/修改小程序name弹窗显隐
            editAvatarFlag: false, // 填写/修改小程序头像弹窗显隐
            editIntroduceFlag: false, // 填写/修改小程序介绍弹窗显隐
            editCategoryFlag: false, // 填写/修改小程序类目弹窗显隐

            //小程序基础信息

            uploading: false,
            nickNameLicenseUrl: '', //组织机构代码证或营业执照 ossUrl
            nickNameLicenseMediaId: '', //组织机构代码证或营业执照 mediaid
            nickNameOthers: [{mediaId: '', url: ''}],//其他证明材料，最多5个 材料mediaid 材料url

            headimageUrl: '',//小程序头像
            headimageMediaId: '',


            miniProgramDetail: {
                appId: '',
                nickName: '', //昵称
                principalName: '', //公司名称
                headImg: '', //头像
                signature: '',//简介
                categories: [], //类目
                releaseStatus: '', //发布状态1=未发布 2=已发布
                releaseErrmsg: '', //发布失败信息
                codeAuditStatus: 2,//代码审核状态1=未审核，2=审核中，3=审核通过，4=审核不通过，5=审核延后
                nickNameAuditStatus: '', //名称审核状态1=未提交审核，2=失败，3=成功，4=审核中
                nickNameErrmsg: '',//名称审核失败信息
                headimageAuditStatus: '',//头像审核状态1=未提交审核，2=失败，3=成功，4=审核中
                headimageAuditErrmsg: '', //头像审核失败信息
                signatureAuditStatus: '',//简介审核状态1=未提交审核，2=失败，3=成功，4=审核中
                signatureErrmsg: '', //简介审核失败信息
                categoryAuditStatus: '', //类目审核状态1=未提交审核，2=失败，3=成功，4=审核中
                categoryErrmsg: '',//类目审核失败信息
                id: '',
                subType: '',//小程序类型（1=微页面；2=导购助手）
            },
            deepMiniDetail: {},//深拷贝后-小程序信息

            unbindFlag: false,//ready解绑公众号弹窗显隐
            agreeFlag: false, // 解绑按钮可点不可点

            sumbitAuditDisable: false,  //提交审核按钮是否置灰
            isAuthMicroPage: false,  //是否有微页面权限
            isAuthLoaded: false,    //是否已经获取权限
            isAuthShoppingGuide: false, //是否有导购助手权限
            selectMiniType: false,  //选择小程序类型
            miniType: 'microPage',    //小程序类型 microPage=微页面；shoppingGuide=导购助手
        };
    },
    created() {
        let promiseList = [
            GeteOriginApi.getGlobalConfByConfigName({configName: 'journey_mircopage'}),
            GeteOriginApi.getGlobalConfByConfigName({configName: 'journey_shoppingguide'}),
        ];
        Promise.all(promiseList)
            .then((values) => {
                this.isAuthMicroPage = (values[0].body.data.status === 1) ? true : false;
                this.isAuthShoppingGuide = (values[1].body.data.status === 1) ? true : false;
                this.miniType = (this.isAuthMicroPage && this.isAuthShoppingGuide) ? 'microPage' : (this.isAuthMicroPage ? 'microPage' : 'shoppingGuide');

                this.isAuthLoaded = true;
            })
            .catch(() => {
                this.isAuthLoaded = true;
            });
        this.deepMiniDetail = cloneDeep(this.miniProgramDetail);
    },
    mounted() {
        this.getMiniProgramInfo();
    },
    components: {
        categoryEditor,
        uploadId,
    },
    methods: {
        //查询小程序详情 判断是否有授权小程序
        getMiniProgramInfo() {
            WechatApiV1
                .getMiniProgramInfo()
                .then((res) => {
                    if (res.body.data === null) {
                        this.wechatCode = false;
                        return;
                    }
                    if (res.body.data) this.miniProgramDetail = res.body.data;
                    this.deepMiniDetail = cloneDeep(this.miniProgramDetail);
                    this.headimageUrl = this.miniProgramDetail.headImg;
                    this.wechatCode = true;
                });
        },
        //获取公众号列表
        getAccounts() {
            this.bingingLoading = true;
            WechatApiV1
                .getWechatAccounts()
                .then((res) => {
                    this.bingingList = res.body.data.authorizerInfoList;
                });
        },
        // ready 授权小程序
        authMiniProgram() {
            this.authWay = true;
        },
        //ready reuse account
        readyReuse() {
            this.reuseFlag = true;
            this.getAccounts();
        },

        //选择已有公众号创建小程序
        accountCreateProgram(account) {
            this.authWay = false;
            this.reuseFlag = false;
            let {href} = this.$router.resolve({
                name: 'MiniProgramAuthorization',
                query: {appid: account.WxAppId}
            });
            window.open(href);
        },
        //复用其他公众号注册小程序
        reuseOther() {
            let {href} = this.$router.resolve({
                name: 'wechatAccountAuthorization',
                query: {appType: 3}
            });
            window.open(href);
        },
        //已有小程序 前往授权
        hasMiniProgramToAuth() {
            let {href} = this.$router.resolve({name: 'wechatAccountAuthorization'});
            window.open(href);
        },
        //编辑小程序name
        editProgramName() {
            this.editNameFlag = true;
        },
        //修改name时上传营业执照
        uploadLicense() {
            this.$refs.uploadInput.click();
        },
        //删除图片
        delImage() {
            this.nickNameLicenseUrl = '';
            this.nickNameLicenseMediaId = '';
            this.nickNameOthers = [];
        },
        //取消修改小程序name
        cancelEditName() {
            this.editNameFlag = false;
            this.nickNameLicenseUrl = '';
            this.nickNameLicenseMediaId = '';
            this.nickNameOthers = [];
            this.deepMiniDetail.nickName = this.miniProgramDetail.nickName;
        },
        //确定修改小程序name
        sureEditName() {
            //<summary>获得字符串实际长度，中文2，英文1</summary> <param name="str">要获得长度的字符串</param>
            let realLength = 0, len = this.deepMiniDetail.nickName.length, charCode = -1;
            for (let i = 0; i < len; i++) {
                charCode = this.deepMiniDetail.nickName.charCodeAt(i);
                if (charCode >= 0 && charCode <= 128) realLength += 1;
                else realLength += 2;
            }
            //检验name长短
            if (realLength < 4 || realLength > 30) {
                this.$toast(this.$t('microPage.nameFalse'), 'warn');
                return;
            }
            //检查是否上传证件 TODO：已与后台确认 营业执照暂无该字段因此进行为空的校验 待优化
            if (this.nickNameLicenseUrl === '' && this.nickNameLicenseMediaId === '') {
                this.$toast(this.$t('microPage.qualification'), 'warn');
                return;
            }
            WechatApiV1
                .setNickname(this.miniProgramDetail.appId, this.deepMiniDetail.nickName,
                    this.nickNameLicenseUrl, this.nickNameLicenseMediaId, [])
                .then(() => {
                    this.$toast(this.$t('common.successOperate'), 'success');
                    this.getMiniProgramInfo();
                })
                .catch(()=> {
                    this.getMiniProgramInfo();
                });
            this.editNameFlag = false;
        },
        //checkUsable 检查小程序name是否可用
        checkUsable() {
            if (this.deepMiniDetail.nickName.length < 1)
                return this.$toast(this.$t('microPage.nameEmpty'), 'warn');
            WechatApiV1
                .checkNickName(this.miniProgramDetail.appId, this.deepMiniDetail.nickName)
                .then(() => {
                    this.$toast(this.$t('microPage.nameTrue'), 'success');
                });
        },
        //上传/编辑小程序头像
        editProgramAvatar() {
            this.editAvatarFlag = true;
        },
        //取消上传图片
        cancelAvatar() {
            this.editAvatarFlag = false;
        },
        //确定上传头像图片
        sureEditAvatar() {
            if (!this.headimageUrl || !this.headimageMediaId) {
                this.$toast(this.$t('microPage.uploadImg'), 'warn');
                return;
            }
            WechatApiV1
                .modifyheadimage(this.miniProgramDetail.appId, this.headimageMediaId, this.headimageUrl)
                .then(() => {
                    this.$toast(this.$t('common.successOperate'), 'success');
                    this.getMiniProgramInfo();
                });
            this.editAvatarFlag = false;
        },

        //填写/编辑小程序介绍
        editProgramIntroduce() {
            this.editIntroduceFlag = true;
        },
        //取消编辑小程序介绍
        cancelSignature() {
            this.editIntroduceFlag = false;
            this.deepMiniDetail.signature = this.miniProgramDetail.signature;
        },
        //确定编辑小程序介绍
        sureSignature() {
            if (!this.deepMiniDetail.signature) {
                this.$toast(this.$t('microPage.fillIntroduction'), 'warn');
                return;
            }
            WechatApiV1
                .modifysignature(this.miniProgramDetail.appId, this.deepMiniDetail.signature)
                .then(() => {
                    this.$toast(this.$t('common.successOperate'), 'success');
                    this.getMiniProgramInfo();
                })
                .catch(() => {
                    this.deepMiniDetail.signature = this.miniProgramDetail.signature;
                });
            this.editIntroduceFlag = false;
        },
        //选择/修改类目
        editProgramCategory() {
            this.editCategoryFlag = true;
        },
        //取消编辑类目
        cancelEditCategory() {
            this.editCategoryFlag = false;
            this.getMiniProgramInfo();
        },
        //修改小程序name时获取营业执照img
        getBusinessImage(img) {
            this.nickNameLicenseUrl = img.ossUrl;
            this.nickNameLicenseMediaId = img.mediaId;
        },
        //头像素材信息
        getAvatarMaterial(avatarImg) {
            this.headimageUrl = avatarImg.ossUrl;
            this.headimageMediaId = avatarImg.mediaId;
        },
        //切换获取导航信息
        getNavStyle() {
            this.navType = 2;
            WechatApiV1
                .getMiniprogramNav(this.miniProgramDetail.appId)
                .then((res) => {
                    this.themeColor = res.body.data.miniprogramNav.themeColor || '';
                    this.navStyle = res.body.data.miniprogramNav.navStyle;
                    this.fontColor = res.body.data.miniprogramNav.fontColor;
                });
        },
        //保存导航设置
        saveMiniprogramNav() {
            WechatApiV1
                .saveMiniprogramNav(this.miniProgramDetail.appId, this.themeColor, this.navStyle, this.fontColor)
                .then(() => {
                    this.$toast(this.$t('common.successOperate'), 'success');
                });
        },
        //取消解绑
        cancelUnbind() {
            this.agreeFlag = false;
            this.unbindFlag = false;
        },
        //解绑公众号
        successUnbind() {
            this.agreeFlag = false;
            this.unbindFlag = false;
            WechatApiV1
                .unbindQrCode(this.miniProgramDetail.id)
                .then((res) => {
                    if (res.body.code === 200) {
                        // this.getMiniProgramInfo();
                        this.$toast(this.$t('wechatNo.UnbundSuccess'),'success');
                        window.location.reload();
                    }
                })
                .catch((err) => {
                    console.error(err);
                });
        },
        // 提交审核是否显示选择框
        selectMiniTypeHandler() {
            if (this.isAuthMicroPage && this.isAuthShoppingGuide) this.selectMiniType = true;
            else this.sumbitAudit();
        },
        //提交审核
        sumbitAudit() {
            this.sumbitAuditDisable = true;
            WechatApiV1
                .commitCode(this.miniProgramDetail.appId, this.miniType)
                .then(() => {
                    this.$toast(this.$t('common.successOperate'), 'success');
                    this.getMiniProgramInfo();
                    this.selectMiniType = false;
                    this.sumbitAuditDisable = false;
                })
                .catch(() => {
                    this.sumbitAuditDisable = false;
                });
        }
    }
};
</script>

<style lang="scss" type="text/scss">
@import "../../common/scss/base/_variables.scss";
@import "../../common/scss/base/_mixin.scss";

.mini-program {
    .red-text {
        color: $red;
    }

    .disabled-text {
        color: $color-light-content;
    }

    .authorization {
        .authorization-btn {
            display: flex;
            justify-content: flex-end;
        }

        .refresh-text {
            text-align: right;
        }

        .explain-step {
            padding: 8px 0 0 8px;
        }

        .icon-help {
            width: 16px;
            height: 16px;
            cursor: pointer;
        }
    }

    .auth-mini {
        margin-top: 20px;

        .auth-header {
            padding: 20px 10px;
            background-color: $title-bg;

            .auth-header-tab {
                display: inline-block;
                padding: 0 5px;
                margin-left: 20px;
                border-radius: 3px;
                line-height: 16px;
                height: 16px;
                color: #ffffff;

                &.green {
                    background-color: #0cc2a9;
                }

                &.blue {
                    background-color: #009dd9;
                }
            }
        }

        .program-info {
            background-color: #fff;
            display: flex;
            align-items: center;
            padding: 20px 10px;

            .program-avatar {
                width: 60px;
                height: 60px;
                border: 1px solid $color-light-content;
                border-radius: 50%;
                overflow: hidden;

                img {
                    width: 100%;
                    height: 100%;
                }
            }

            .program-name {
                margin: 0 20px;
            }

            .issue-status {
                .published {
                    padding: 5px;
                    border-radius: 5px;
                    color: white;
                    background-color: $theme;
                }
                .has-issue {
                    .status-text {
                        color: white;
                        padding: 5px;
                        border-radius: 5px;
                    }
                    .unreviewed {
                        background-color: $disabled;
                    }
                    .not-approved {
                        background-color: $light-red;
                        margin-right: 10px;
                    }
                    .auditing {
                        background-color: $theme;
                    }
                    svg {
                        width: 16px;
                        height: 16px;
                        fill: $light-red;
                        vertical-align: middle;
                        cursor: pointer;
                    }
                }
            }
        }

        .program-header {
            background-color: #fff;
            padding: 30px 10px 0 10px;

            .header-nav {
                display: inline-block;
                margin-right: 10px;
                line-height: 32px;
                color: #fff;
                background-color: #d7d7d7;
                padding: 0 10px;
                cursor: pointer;
            }

            .active {
                background-color: $theme;
            }
        }
    }

    .mini-wrapper {
        background-color: #fff;

        .notice-tr {
            padding: 20px 10px;
        }
        .tr-avatar {
            img {
                display: inline-block;
                width: 60px;
                height: 60px;
                border-radius: 50%;
                overflow: hidden;
            }
        }
        .mini-signature {
            white-space: pre-wrap;
            max-width: 450px;
        }
        .submit-btn {
            margin-left: 10px;
        }
        .first-submit {
            display: inline-block;
            padding: 20px 10px;
            color: $color-light-content;
        }

        .not-pass {
            color: $light-red;

            svg {
                width: 16px;
                height: 16px;
                fill: $light-red;
                vertical-align: middle;
            }
        }
    }

    .no-auth {
        padding: 10px;
        color: $color-light-content;
        .theme-text {
            cursor: pointer;
        }
    }

    //导航设置
    .set-nav {
        min-height: 420px;
        background-color: white;
        .label {
            svg {
                width: 16px;
                height: 16px;
                fill: #bfbfbf;
                vertical-align: middle;
                cursor: pointer;
            }
        }

        .use-style {
            display: inline-block;
            line-height: 24px;
            margin-top: 10px;
        }

        .save-nav {
            margin: 52px;

        }
    }

    .auth-modal {
        display: flex;
        flex-direction: column;
        align-items: center;

        .wechat-icon {
            svg {
                width: 40px;
                height: 40px;
            }

        }

        .auth-explain {
            margin: 10px 0;
        }

        .has-mini {
            margin: 10px 0;
        }
    }

    //    复用公众号
    .reuse-other-account {
        margin-left: 60px;

        ul {
            li {
                margin-bottom: 15px;

                .account-avatar {
                    width: 40px;
                    height: 40px;
                    vertical-align: middle;
                }

                .account-name {
                    display: inline-block;
                    line-height: 32px;
                    background-color: #d7d7d7;
                    padding: 0 10px;
                    max-width: 300px;
                    overflow: hidden;
                    white-space: nowrap;
                    text-overflow: ellipsis;
                    vertical-align: middle;
                    cursor: pointer;
                    margin-left: 15px;
                }
            }
        }

        .reuse-mini {
            display: inline-block;
            cursor: pointer;
        }
    }

    .edit-name {
        .name-rule {
            padding-left: 130px;
            color: $color-light-content;
        }
        .check-name {
            cursor: pointer;
        }
        //上传营业执照img
        .upload-license-img {
            padding: 20px 0 0 50px;

            .upload {
                margin-top: 20px;
            }
        }
    }

    //小程序头像
    .avatar-wrapper {
        display: flex;
        margin-left: 50px;

        .avatar-img {
            width: 60px;
            height: 60px;
            border-radius: 50%;
            border: 1px solid $color-light-content;
            overflow: hidden;

            img {
                width: 100%;
                height: 100%;
                vertical-align: middle;
            }
        }

        .upload-notice {
            margin-left: 20px;
            padding-top: 10px;

            p {
                line-height: 32px;
            }
        }

    }

    // 小程序简介
    .edit-introduce-modal {
        .signature-wrapper {
            position: relative;

            .signature-num {
                display: inline-block;
                position: absolute;
                bottom: 0;
                right: 10%;
            }
        }

        .textarea {
            width: 70%;
            resize: none;
        }
    }
    .unbind-DMT{
        padding: 10px 0;
    }

    .select-minitype {

        .mini-type {
            padding-left: 100px;

            .radio {
                width: 100%;
                margin: 10px auto;
            }
        }
        .btn {
            display: block;
            margin: 20px auto 0;
        }
    }
}
</style>
