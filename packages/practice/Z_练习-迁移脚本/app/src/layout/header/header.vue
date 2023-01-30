<template>
    <nav class="header">
        <button type="button"
                class="pull-right icon icon-power-off sign-out-btn"
                @click="signOut"
                :title="$t('home.signOut')"></button>
        <!-- 账户操作下拉 -->
        <div class="pull-right account-actions">
            <span class="user-name"
                  :class="{open: userProfileOpen, notice}"
                  v-blur="closeAccountActions"
                  :title="user.userName || user.email"
                  @click="userProfileOpen = !userProfileOpen">
                {{user.userName || user.email}}
            </span>
            <transition name="drop">
                <div class="user-profile" v-if="userProfileOpen">
                    <div class="package-info">
                        {{user.mealName}}
                        <br>
                        {{'home.expiration' | t}}{{'punctuation.colon' | t}} {{formatedValidTime}}
                    </div>
                    <hr>
                    <div class="package-info">
                        <div v-if="dmdEmailSurplus">
                            {{'home.dmdEmailSurplus' | t}}{{'punctuation.colon' | t}} <b class="sms-surplus">{{dmdEmailSurplus}}</b>
                        </div>
                        {{'home.smsAmount' | t}}{{'punctuation.colon' | t}} <b class="sms-surplus">{{parseInt(user.smsSurplus)}}</b>
                        <br>
                        {{'home.overseasSms' | t}}{{'punctuation.colon' | t}} <b class="sms-surplus">{{parseInt(user.smsAbroadSurplus)}}</b>
                        <br>
                        {{'home.mmsAmount' | t}}{{'punctuation.colon' | t}} <b class="sms-surplus">{{parseInt(user.mmsSurplus)}}</b>
                    </div>
                    <hr>
                    <router-link v-auth class="pull-left action-text" :to="{name: 'personalSetting'}">
                        {{'personal.personalSettings' | t}}
                    </router-link>
                    <router-link v-auth class="pull-left action-text" v-if="showNikeEmailReport"
                                 :to="{name: 'emailReportNike'}">
                        {{'home.emailReport' | t}}
                    </router-link>
                    <router-link v-auth class="pull-left action-text" v-if="defaultState"
                                 :to="{name: 'accountInfoModify'}">
                        {{'home.accountInfoModify' | t}}
                    </router-link>
                    <router-link v-auth class="pull-left action-text" :to="{name: 'orgSetting'}">
                        {{'EnterPrise.enterpriseSettings' | t}}
                    </router-link>
                    <span class="pull-left action-text"
                          :class="{notice: trainingNotice}"
                          @mousedown="applyForTraining">
                        {{'home.applyForTraining' | t}}
                    </span>
                    <a class="pull-left action-text" href="https://doc.dmartech.cn/"
                       target="_blank" rel="noopener">{{'home.help' | t}}</a>
                    <!--<span class="pull-left action-text"
                          @mousedown="importantModalOpen = true">
                        {{'home.applyForImportant' | t}}
                    </span>-->
                    <span class="pull-left action-text" @mousedown="supportShow = true">
                        {{'home.support' | t}}
                    </span>
                </div>
            </transition>
        </div>
        <language-switch/>
        <router-link :to="{name: 'index'}" class="logo">
            <img src="./logo.svg">
        </router-link>
        <router-link class="nav-link" :to="{name: 'home'}" v-auth> {{'home.home' | t}}</router-link>
        <div class="nav-link-group" :class="{active: noIncludeRouteName() && $route.matched[0].name === 'wechat'}" v-auth="'wechat'">
            <span class="nav-link-group-title" :title="$t('home.wechat')">{{'home.wechat' | t}}</span>
            <svg class="nav-link-group-arrow" aria-hidden="true">
                <use xlink:href="#icon-arrow-down"></use>
            </svg>
            <div class="nav-links">
                <span v-if="isSubscriptionAccount"
                      v-auth="'subscriptionManage'"
                      class="nav-link-inside-group disabled" :title="$t('home.subscriptionManage')"
                      @click="functionDisabledTip = $t('QRCode.functionDisabledTip')">
                    {{'home.subscriptionManage' | t}}
                </span>
                <router-link v-else v-auth class="nav-link-inside-group" :title="$t('home.subscriptionManage')" :to="{name: 'subscriptionManage'}">
                    {{'home.subscriptionManage' | t}}
                </router-link>
                <router-link v-auth class="nav-link-inside-group" :title="$t('home.customizeMenus')" :to="{name: 'menus'}">
                    {{'home.customizeMenus' | t}}
                </router-link>
                <!--世邦定制化菜单-->
                <router-link v-auth class="nav-link-inside-group" :to="{name: 'shibangActivity'}">
                   二维码活动列表
                </router-link>
                <router-link v-auth class="nav-link-inside-group" :title="$t('home.massSend')" :to="{name: 'massSend'}">
                    {{'home.massSend' | t}}
                </router-link>
                <router-link v-auth class="nav-link-inside-group" :title="$t('home.message')" :to="{name: 'wechatMessageManage'}">
                    {{'home.message' | t}}
                </router-link>
                <router-link v-auth class="nav-link-inside-group" :title="$t('home.reply')" :to="{name: 'reply'}">
                    {{'home.reply' | t}}
                </router-link>
                <router-link v-auth class="nav-link-inside-group" :title="$t('home.fans')" :to="{name: 'wechatFans'}">
                    {{'home.fans' | t}}
                </router-link>
            </div>
        </div>
        <!-- 企业微信 -->
        <div class="nav-link-group" :class="{active: noIncludeRouteName() && $route.matched[0].name === 'wecom'}" v-auth="'wecom'">
            <span class="nav-link-group-title" :title="$t('home.wecom')">{{'home.wecom' | t}}</span>
            <svg class="nav-link-group-arrow" aria-hidden="true">
                <use xlink:href="#icon-arrow-down"></use>
            </svg>
            <div class="nav-links">
                <router-link v-auth class="nav-link-inside-group" :title="$t('home.channelCode')" :to="{name: 'channelCode'}">
                    {{'home.channelCode' | t}}
                </router-link>
                <router-link v-auth class="nav-link-inside-group" :title="$t('home.entBroadcast')" :to="{name: 'entBroadcast'}">
                    {{'home.entBroadcast' | t}}
                </router-link>
                <router-link v-auth class="nav-link-inside-group" :title="$t('home.msgArchiving')" :to="{name: 'msgArchiving'}">
                    {{'home.msgArchiving' | t}}
                </router-link>
                <router-link v-auth class="nav-link-inside-group" :title="$t('home.shoppingGuide')" :to="{name: 'shoppingGuide'}">
                    {{'home.shoppingGuide' | t}}
                </router-link>
            </div>
        </div>

        <div class="nav-link-group" :class="{active: includeRouteName('customer').includes($route.name) || (noIncludeRouteName() && $route.matched[0].name === 'customer')}" v-auth="'customer'">
            <span class="nav-link-group-title" :title="$t('home.customer')">{{'home.customer' | t}}</span>
            <svg class="nav-link-group-arrow" aria-hidden="true">
                <use xlink:href="#icon-arrow-down"></use>
            </svg>
            <div class="nav-links">
                <router-link v-auth class="nav-link-inside-group" :title="$t('home.customerPerfile')" :to="{name: 'memberList'}">
                    {{'home.customerPerfile' | t}}
                </router-link>
                <router-link v-auth class="nav-link-inside-group" :title="$t('home.customerSwarm')" :to="{name: 'swarm', query: { groupId: 0 }}">
                    {{'home.customerSwarm' | t}}
                </router-link>
                <router-link v-auth class="nav-link-inside-group" :title="$t('home.tag')" :to="{name: 'tagManage'}">
                    {{'home.tag' | t}}
                </router-link>
                <router-link v-auth class="nav-link-inside-group" :title="$t('home.customerScoring')" :to="{name: 'scorerating'}">
                    {{'home.customerScoring' | t}}
                </router-link>
                <router-link v-auth class="nav-link-inside-group" :title="$t('home.meta')" :to="{name: 'meta'}">{{'home.meta' | t}}</router-link>
            </div>
        </div>
        <div class="nav-link-group" :class="{active: includeRouteName('journey').includes($route.name) || (noIncludeRouteName() && $route.matched[0].name === 'journey')}" v-auth="'journey'">
            <span class="nav-link-group-title" :title="$t('home.journeys')">{{'home.journeys' | t}}</span>
            <svg class="nav-link-group-arrow" aria-hidden="true">
                <use xlink:href="#icon-arrow-down"></use>
            </svg>
            <div class="nav-links">
                <router-link v-auth class="nav-link-inside-group" :title="$t('home.microPage')" :to="{name: 'microPageList'}">
                    {{'home.microPage' | t}}
                </router-link>
                <router-link v-auth class="nav-link-inside-group" :title="$t('home.leads')" :class="{'router-link-active': [$route.name, $route.meta.auth].includes('journeyFormManagement')}"
                             :to="{params: {id: 0}, name: 'journeyFormManagement'}">
                    {{'home.leads' | t}}
                </router-link>
                <router-link v-auth class="nav-link-inside-group" exact :title="$t('home.journeyEmail')" :to="{name: 'materialStore', query: {type: 5}}" :class="{'router-link-active': ($route.name === 'materialStore' && $route.query.type == 5) || $route.meta.emailEdit}">
                    {{'home.journeyEmail' | t}}
                </router-link>
                <router-link v-auth class="nav-link-inside-group" exact :title="$t('home.journeySMS')" :to="{name: 'materialStore', query: {type: 0}}" :class="{'router-link-active': ($route.name === 'materialStore' && $route.query.type == 0) || ['createSMS', 'editSMS'].includes($route.name)}">
                    {{'home.journeySMS' | t}}
                </router-link>
                <router-link v-auth class="nav-link-inside-group" exact :title="$t('home.journeyMMS')" :to="{name: 'materialStore', query: {type: 2}}" :class="{'router-link-active': ($route.name === 'materialStore' && $route.query.type == 2) || ['createMMS', 'editMMS'].includes($route.name)}">
                    {{'home.journeyMMS' | t}}
                </router-link>
                <router-link v-auth class="nav-link-inside-group" :title="$t('home.material')" :to="{name: 'material'}">
                    {{'home.material' | t}}
                </router-link>
                <span v-if="isSubscriptionAccount"
                      v-auth="'template'"
                      class="nav-link-inside-group disabled" :title="$t('home.template')"
                      @click="functionDisabledTip = $t('template.functionDisabledTip')">
                    {{'home.template' | t}}
                </span>
                <router-link v-else v-auth class="nav-link-inside-group" :title="$t('home.template')" :to="{name: 'template'}">
                    {{'home.template' | t}}
                </router-link>
                <router-link v-auth class="nav-link-inside-group" :title="$t('home.journey')" :to="{name: 'journeyRecords'}">
                    {{'home.journey' | t}}
                </router-link>
            </div>
        </div>
        <div class="nav-link-group" :class="{active: includeRouteName('data').includes($route.name) || (noIncludeRouteName() && $route.matched[0].name === 'data')}" v-auth="'data'">
            <span class="nav-link-group-title" :title="$t('home.data')">{{'home.data' | t}}</span>
            <svg class="nav-link-group-arrow" aria-hidden="true">
                <use xlink:href="#icon-arrow-down"></use>
            </svg>
            <div class="nav-links">
                <!-- <p class="nav-link-title" v-auth="'dataCenter, meta, tagManage'">{{'home.dataManage' | t}}</p> -->
                <router-link v-auth class="nav-link-inside-group" :title="$t('home.dataCollectionTools')" :to="{name: 'dataCenter'}">
                    {{'home.dataCollectionTools' | t}}
                </router-link>
                <router-link v-auth class="nav-link-inside-group" :title="$t('openPlat.title')" :to="{name: 'openPlatform'}">
                    {{'home.openPlat' | t}}
                </router-link>
                <router-link v-auth class="nav-link-inside-group" :title="$t('EnterPrise.orgMember')" :to="{name: 'orgMember'}">
                    {{'home.EnterPrise' | t}}
                </router-link>
                <router-link v-auth class="nav-link-inside-group" :title="$t('systemSet.title')" :to="{name: 'systemSettings'}">
                    {{'home.systemSet' | t}}
                </router-link>
                <router-link v-auth class="nav-link-inside-group" :title="$t('frequency.title')" :to="{name: 'sentFrequency'}">
                    {{'home.frequency' | t}}
                </router-link>
                <!--2.6.2，暂时屏蔽。-->
                <!-- <router-link v-auth class="nav-link-inside-group" :to="{name: 'scoreList',query:{name:'scoreFactors'}}">
                    {{'metaData.scoreEva' | t}}
                </router-link> -->
                <!-- <router-link class="tab-link" :to="{name:'scoreList', query: $route.query}">{{'metaData.scoreEva' | t}}</router-link>-->
                <!-- <p class="nav-link-title" v-auth="'dataReport, orderReport, Wechat, journeyReport'">
                    {{'home.report' | t}}
                </p> -->
            </div>
        </div>
        <!--jira10707，2022.03.09下架多维分析功能-->
        <div class="nav-link-group" :class="{active: includeRouteName('analysis').includes($route.name) || (noIncludeRouteName() && $route.matched[0].name === 'analysis')}">
            <span class="nav-link-group-title" :title="$t('home.analysis')">{{'home.analysis' | t}}</span>
            <svg class="nav-link-group-arrow" aria-hidden="true">
                <use xlink:href="#icon-arrow-down"></use>
            </svg>
            <div class="nav-links">
                <!-- <p class="nav-link-title" v-auth="'boards'">{{'home.report' | t}}</p> -->
                <router-link v-auth class="nav-link-inside-group" :title="$t('home.journeyReport')" :to="{name: 'journeyReport'}">
                    {{'home.journeyReport' | t}}
                </router-link>
                <router-link v-auth class="nav-link-inside-group" :title="$t('home.customerReport')" :to="{name: 'dataReport'}">
                    {{'home.customerReport' | t}}
                </router-link>
                <router-link v-auth class="nav-link-inside-group" :title="$t('home.orderReport')" :to="{name: 'orderReport'}">
                    {{'home.orderReport' | t}}
                </router-link>
                <router-link v-auth class="nav-link-inside-group" :title="$t('home.wechatReport')" :to="{name: 'WeChat'}">
                    {{'home.wechatReport' | t}}
                </router-link>
                <!-- <router-link v-auth class="nav-link-inside-group" :to="{name: 'boards'}">
                    {{'home.board' | t}}
                </router-link> -->
                <!-- <p class="nav-link-title" v-auth="'event, attribute, userGroup'">{{'home.analysis' | t}}</p>
                <router-link v-auth class="nav-link-inside-group" :to="{name: 'event'}">
                    {{'home.event' | t}}
                </router-link>
                <router-link v-auth class="nav-link-inside-group" :to="{name: 'attribute'}">
                    {{'home.attribute' | t}}
                </router-link>
                <router-link v-auth class="nav-link-inside-group" :to="{name: 'userGroup'}">
                    {{'home.userGroup' | t}}
                </router-link>
                <router-link v-auth class="nav-link-inside-group" :to="{name: 'visualization'}">
                    {{'home.visualization' | t}}
                </router-link> -->
                <!-- todo -->
                <!--<router-link v-auth class="nav-link-inside-group" :to="{name: 'funnelAnalysis'}">{{'home.funnel' | t}}</router-link>-->
            </div>
        </div>

        <!--START  演示用，不上prod-->
        <div class="nav-link-group" v-if="environment !== 'production'">
            <span class="nav-link-group-title">营销模块</span>
            <svg class="nav-link-group-arrow" aria-hidden="true">
                <use xlink:href="#icon-arrow-down"></use>
            </svg>
            <div class="nav-links">
                <a href="http://scrm.cha-ling-china.cn" target="_blank" class="nav-link-inside-group">商城管理</a>
                <a href="https://dmt.cndits.com" target="_blank" class="nav-link-inside-group">积分中心</a>
                <a href="https://chaling-productivity-cms-overview-prod.lvmhda.cn/"
                   target="_blank" class="nav-link-inside-group">Clienteling</a>
                <a href="https://app.dmartech.cn/sign-in?redirect=%7B%22name%22%3A%22myTemplate%22,%22query%22%3A%7B%7D,%22params%22%3A%7B%7D%7D"
                   target="_blank" class="nav-link-inside-group">微信管理</a>
                <a href="https://hdm.webportal.top/newVersion/#/market/home"
                   target="_blank" class="nav-link-inside-group">营销活动</a>
            </div>
        </div>
        <!--END  演示用，不上prod-->

        <!--<template v-for="route in $store.state.pluginRoutes">
            <router-link v-if="!route.children || !route.children.length"
                         :key="route.name"
                         class="nav-link"
                         :to="{name: route.name}"
                         v-text="$t(route.meta.name)"
                         v-auth/>
            <div v-else
                 class="nav-link-group"
                 :class="{active: $route.matched[0].name === route.name}"
                 v-auth="route.name">
                {{route.meta.name | t}}
                <svg class="nav-link-group-arrow" aria-hidden="true">
                    <use xlink:href="#icon-arrow-down"></use>
                </svg>
                <div class="nav-links">
                    <router-link v-for="subRoute in route.children"
                                 :key="subRoute.name"
                                 class="nav-link-inside-group"
                                 :to="{name: subRoute.name}"
                                 v-text="$t(subRoute.meta.name)"
                                 v-auth/>
                </div>
            </div>
        </template>-->
        <!-- 加载中 -->
        <loading v-if="storeLoading"></loading>
        <!-- 参加培训 -->
        <backdrop v-if="trainingModalOpen">
            <div class="modal sm apply-training-modal">
                <img class="training-logo" src="./training.gif" alt="">
                <h3 class="training-title">{{'home.trainingTitle' | t}}</h3>
                <p>{{'home.trainingTipA' | t}}</p>
                <img class="training-qr-code" src="./register-qr-code.png" alt="">
                <p>{{'home.trainingTipB' | t}}</p>
                <button class="btn btn-lg btn-theme" type="button" @click="trainingModalOpen = false">
                    {{'home.soundsGood' | t}}
                </button>
            </div>
        </backdrop>
        <!-- 私享会弹窗 -->
        <backdrop v-if="privateClub">
            <div class="modal sm private-club-modal">
                <img class="private-logo" src="./private-club.png" alt="">
                <h3 class="private-title">{{'home.privateTitle' | t}}</h3>
                <p>{{'home.privateDetail' | t}}</p><br>
                <p>{{'home.privateDetail1' | t}}</p><br>
                <p><span :class="{strongSpan: language === 'zh-CN'}">{{'home.privateDetail2Strong' | t}}</span>
                    <span :class="{strongSpan: language === 'en'}">{{'home.privateDetail2' | t}}</span></p>
                <p>{{'home.privateDetail3' | t}}</p>
                <p>{{'home.privateDetail4' | t}}</p>
                <p>{{'home.privateDetail5' | t}}</p>
                <p>{{'home.privateDetail6' | t}}<strong>{{'home.privateDetail6Strong' | t}}</strong></p><br>
                <strong>{{'home.privateDetail7' | t}}</strong>
                <img class="private-qr-code" src="./private-club-qrcode.png" alt="">
                <button class="btn btn-lg btn-theme" type="button" @click="clearClubNotice">
                    {{'home.soundsGood' | t}}
                </button>
            </div>
        </backdrop>
        <!-- 修改密码 -->
        <confirm :title="$t('home.changePassword')" v-if="changePasswordModalOpen" @cancel="cancelPasswordChange"
                 @confirm="changePassword">
            <div class="form-field flex">
                <label class="label" for="new-password">{{'home.newPassword' | t}}</label>
                <div class="field-group">
                    <password v-model="newPassword" id="new-password"/>
                    <p class="light-content-text">{{'home.passwordLengthTip' | t}}</p>
                </div>
            </div>
            <div class="form-field">
                <label class="label" for="old-password">{{'home.oldPassword' | t}}</label>
                <password v-model="oldPassword" id="old-password"/>
            </div>
        </confirm>
        <!-- 功能受限提醒 -->
        <modal v-if="functionDisabledTip"
               class="function-disabled-modal"
               :title="$t('home.functionDisabled')" @close="functionDisabledTip = ''">
            {{functionDisabledTip}}
            <template v-slot:buttons>
                <input type="button" class="btn btn-md btn-theme"
                       @click="functionDisabledTip = ''" :value="$t('wechatAccount.gotIt')">
            </template>
        </modal>
        <!-- 重要公告 -->
        <backdrop v-if="importantModalOpen">
            <div class="modal apply-important-modal">
                <img class="important-logo" src="./upgrade-animation.gif" alt="">
                <div class="important-content">
                    <p>{{'home.importantContent1' | t}}</p>
                    <p>
                        {{'home.importantContent2' | t}}
                        <span class="important-content-zd">{{'home.importantContent3' | t}}</span>
                        {{'home.importantContent4' | t}}
                        <a href="https://doc.dmartech.cn/ji-ben-gai-nian/dmartech-dao-hang-jie-gou-jie-shao" target="_blank">{{'home.importantContent5' | t}}</a>
                    </p>
                    <p>{{'home.importantContent6' | t}}</p>
                    <p>
                        <span class="important-content-wrap">{{'home.importantContent7' | t}}</span>
                        <span class="important-content-wrap">{{'home.importantContent8' | t}}</span>
                    </p>
                </div>
                <button class="btn btn-lg btn-theme" type="button" @click="closeImportantNotice">
                    {{'common.close' | t}}
                </button>
            </div>
        </backdrop>
        <!-- 技术支持 -->
        <backdrop v-if="supportShow">
            <div class="modal sm support-modal">
                <img class="support-logo" src="./support.png" alt="">
                <h3>{{'home.dmtSupport' | t}}</h3>
                <h4>{{'home.supportType1' | t}}</h4>
                <span class="support-text">{{'home.supportAddr' | t}}
                    <a href="https://webpower.kf5.com/request/guest" target="_blank">
                        https://webpower.kf5.com/request/guest/
                    </a>
                </span>
                <span class="support-text">{{'home.supportGuide' | t}}
                    <a href="https://doc.dmartech.cn/qi-ta-shuo-ming/ji-shu-zhi-chi-shuo-ming" target="_blank">
                        {{'home.supportView' | t}}
                    </a>
                </span>
                <h4 class="h4-text">{{'home.supportType2' | t}}</h4>
                <span class="support-text">{{'home.supportEmail' | t}}
                    <a v-if="isHw" href="mailto://huawei-support@webpowerchina.com" target="_blank">
                        huawei-support@webpowerchina.com
                    </a>
                    <a v-else href="mailto://customerservice@webpowerchina.com" target="_blank">
                        customerservice@webpowerchina.com
                    </a>
                </span>
                <span class="support-text">{{'home.supportTime' | t}}</span>
                <span class="support-text">{{'home.supportTimeContent' | t}}</span>
                <button class="btn btn-lg btn-theme" type="button" @click="supportShow = false">
                    {{'common.close' | t}}
                </button>
            </div>
        </backdrop>
        <!--dmt数据库加密升级提示-->
        <backdrop v-if="databaseUpgradeOpen">
            <div class="modal database-upgarde-modal">
                <img class="database-logo" src="./upgrade-animation.gif" alt="">
                <div class="database-content">
                    <p>{{'home.databaseUpgrade1' | t}}</p>
                    <p>
                        {{'home.databaseUpgrade2' | t}}
                        <span class="database-bold">{{'home.databaseUpgrade3' | t}}</span>
                        {{'home.databaseUpgrade4' | t}}
                    </p>
                    <p>{{'home.databaseUpgrade5' | t}}</p>
                    <p>
                        <span class="database-content-wrap">{{'home.databaseUpgrade6' | t}}</span>
                        <span class="database-content-wrap">{{'home.databaseUpgrade7' | t}}</span>
                    </p>
                </div>
                <button class="btn btn-lg btn-theme" type="button" @click="closeDatabaseUpgardeNotice">
                    {{'common.close' | t}}
                </button>
            </div>
        </backdrop>
    </nav>
</template>
<script type="text/babel">
    import {SIGN_OUT} from '@/store/vuex/actionTypes';
    import Password from './password.vue';
    import {differenceInMinutes, format} from 'date-fns';
    import {importantModel} from '../accountService';
    import LanguageSwitch from '../components/language-switch.vue';
    import {I18N_STORE_NAME} from '@/locales';
    import { ManageApi, GeteOriginApi } from '@/api';
    import { mapGetters, mapState, mapActions } from 'vuex';

    export default {
        components: {LanguageSwitch, Password},
        data() {
            return {
                // 用户信息面板下拉
                userProfileOpen: false,
                // 信息提示
                trainingNotice: true, // 培训
                // 培训弹出层
                trainingModalOpen: false,
                // 私享会弹出层
                privateClub: false,
                // 修改密码
                changePasswordModalOpen: false, // 修改密码弹出层
                oldPassword: '',
                newPassword: '',
                // 功能受限提醒
                functionDisabledTip: '',
                //用户信息修改-默认状态
                defaultState: false,
                //nike邮件报告
                showNikeEmailReport: false,
                //重要公告
                importantNoticeTwo: true,
                importantModalOpen: false,
                // 技术支持
                supportShow: false,
                // dmt数据库加密升级提示
                // 每天提示一次，当天不重复提示。 2021年1月11号上午撤下
                databaseUpgradeNotice: true,
                databaseUpgradeOpen: false,

                dmdEmailSurplus:null,//邮件余量
            };
        },
        created() {
            this.getEmailNum();
            const noticesStr = localStorage.getItem(this.noticesCacheKey);
            if (noticesStr) {
                let noticeMap = JSON.parse(noticesStr);
                for (let key in noticeMap) {
                    this[key] = noticeMap[key];
                }
                if (this.importantNoticeTwo) {
                    this.importantModalOpen = false;    //未展示过，首次展示：1、自动弹出:true；2、不自动弹出:false
                }
                if (this.databaseUpgradeNotice !== new Date().getDate()) {
                    this.databaseUpgradeOpen = false;    //未展示过，首次展示：1、自动弹出:true；2、不自动弹出:false
                }
            } else {
                this.importantModalOpen = false;    //未展示过，首次展示：1、自动弹出:true；2、不自动弹出:false
                this.databaseUpgradeOpen = false;    //未展示过，首次展示：1、自动弹出:true；2、不自动弹出:false
            }
            this.getPriority();
            //根据是否有权限判断是否显示该功能按钮
            if (!this.$has('enterprise_update_accountInfo')) {
                this.defaultState = true;
            }
            //根据是否有权限判断是否显示nike邮件报告
            if (!this.$has('datacentre_emailReportNike')) {
                this.showNikeEmailReport = true;
            }
        },
        computed: {
            ...mapGetters(['validTimeText']),
            ...mapState({
                storeLoading: state => state.loading,
                user: state => state.user,
                isSubscriptionAccount: state => state.user.isSubscriptionAccount,
                language: state => state[I18N_STORE_NAME].lang
            }),
            formatedValidTime() {
                return this.user.validTime ? 
                    format(Date.parse(this.user.validTime), 'YYYY-MM-DD') : this.validTimeText;
            },
            // 华为类型账号
            isHw() {
                return this.user.companyType === 1;
            },
            // {xxxNotice: false, xxxxNotice: true}
            noticesCacheKey() {
                return 'NOTICES_CACHE_KEY' + this.user.id;
            },
            notice() {
                return this.trainingNotice; // || this.xxxNotice
            },
            /**
             * 开发环境
             * dev          开发服
             * beta         测试服
             * production   生产服
             * development  本地开发
             * @returns {string}
             */
            environment() {
                return process.env.NODE_ENV;
            },
        },
        methods: {
            ...mapActions([
                SIGN_OUT
            ]),
            //正常按路由结构高亮父级导航，而下方路由为改变header导航位置的路由，如路由中在A下，导航中则在B下，重新寻找导航中的父级元素再高亮（jira-10630）
            includeRouteName(routeName) {
                switch (routeName) {
                    case 'customer':
                        return ['tagManage','meta', 'eventGroup', 'metaEvent', 'userAttribute', 'eventAttribute'];
                    case 'journey':
                        return ['material', 'imageTextList', 'imageTextCreate', 'imageTextEdit', 'imageList', 'audioList', 'videoList', 'videoForm', 'publish' ,'template' ,'myTemplate' ,'invalidTemplate' ,'templateDetail' ,'invalidTemplateDetail'];
                    case 'data':
                        return ['openPlatform', 'orgMember', 'addMemberForm', 'editMemberForm', 'systemSettings', 'sentFrequency'];
                    case 'analysis':
                        return ['journeyReport', 'journeyReviewReport', 'journeySendReport', 'emailSendReport', 'smsSendReport', 'mmsSendReport', 'wechatSendReport', 'journeyExportReport', 'exportOriginalData', 'exportSendRecord', 'emailJourneyCompared', 'WecomAgentMsgReport', 'EnterpriseBroadcastReport', 'dataReport', 'orderReport', 'appAnalysis', 'followerAnalysis'];
                }
            },
            //判断导航是否为改变位置的路由，是则不再做高亮父级操作，避免导航栏出现多个父级高亮
            noIncludeRouteName() {
                let notInclude = true;
                ['customer','journey','data','analysis'].forEach(route => {
                    if (this.includeRouteName(route).includes(this.$route.name)) notInclude = false;
                });
                return notInclude;
            },
            /**
            * 获取客户【邮件余量】
            */
            getEmailNum() {
                ManageApi
                    .userEmailNum(this.user.email)
                    .then(({body:{data}}) => {
                        this.dmdEmailSurplus = data.dmdSurplus;
                    });
            },
            toggleNotice(key, flag) {
                const noticesStr = localStorage.getItem(this.noticesCacheKey);
                let noticeMap = {};

                if (key in this.$data) {
                    this[key] = flag;
                } else {
                    throw new Error('notice 字段名不在 data 中');
                }

                if (noticesStr) {
                    noticeMap = JSON.parse(noticesStr);
                }

                noticeMap[key] = flag;
                localStorage.setItem(this.noticesCacheKey, JSON.stringify(noticeMap));
            },
            signOut() {
                this.SIGN_OUT();
                const {href} = this.$router.resolve({name: 'login'});
                this.$nextTick(() => {
                    // 菜单权限需要重新注册，vue-router 不支持动态移除路由记录，
                    // 所以只能触发页面刷新，从而使用新的权限信息
                    location.href = href;
                });
            },
            closeAccountActions() {
                this.userProfileOpen = false;
            },
            applyForTraining() {
                this.toggleNotice('trainingNotice', false);

                // open the modal
                this.trainingModalOpen = true;
            },
            closeImportantNotice() {
                this.importantModalOpen = false;
                this.toggleNotice('importantNoticeTwo', false);
                const date = new Date();
                const email = this.user.email;
                const eventId = format(date, 'YYYYMMDDHHmmss');
                const time = format(date, 'YYYY-MM-DD HH:mm:ss');
                importantModel
                    .eventTag({
                        type: 'event',
                        event: 'email_upgrade_confirm',
                        properties: {
                            email: email,
                            event_id: eventId,
                            create_time: time
                        }
                    });
            },
            closeDatabaseUpgardeNotice() {
                this.databaseUpgradeOpen = false;
                let openDate = new Date().getDate();
                this.toggleNotice('databaseUpgradeNotice', openDate);
                const date = new Date();
                const email = this.user.email;
                const eventId = format(date, 'YYYYMMDDHHmmss');
                const time = format(date, 'YYYY-MM-DD HH:mm:ss');
                importantModel
                    .eventTag({
                        type: 'event',
                        event: 'database_upgrade_confirm',
                        properties: {
                            email: email,
                            event_id: eventId,
                            create_time: time
                        }
                    });
            },
            getPriority() {
                const timeStart = '2019-05-09 23:59';
                const timeEnd = '2019-05-30 14:00';
                const date = new Date();
                const time = format(date, 'YYYY-MM-DD HH:mm');
                const timeRangeEnd = differenceInMinutes(timeEnd, time);
                const timeRangeStart = differenceInMinutes(timeStart, time);
                this.privateClub = localStorage.getItem('privateClub') && (timeRangeEnd > 0 && timeRangeStart < 0);
            },
            clearClubNotice() {
                this.privateClub = false;
                localStorage.setItem('privateClub', '');
            },
            cancelPasswordChange() {
                this.newPassword = '';
                this.oldPassword = '';
                this.changePasswordModalOpen = false;
            },
            changePassword() {
                if (this.newPassword === '') {
                    return this.$toast(this.$t('home.newPasswordEmptyWarn'), 'warn');
                }
                if (this.newPassword.length < 8 || this.newPassword.length > 20) {
                    return this.$toast(this.$t('home.newPasswordLengthWarn'), 'warn');
                }
                if (this.oldPassword === '') {
                    return this.$toast(this.$t('home.oldPasswordEmptyWarn'), 'warn');
                }
                if (this.oldPassword.length < 8 || this.oldPassword.length > 20) {
                    return this.$toast(this.$t('home.oldPasswordLengthWarn'), 'warn');
                }
                GeteOriginApi
                    .changePassword(
                        this.user.email,
                        this.newPassword,
                        this.oldPassword
                    )
                    .then(() => {
                        this.$toast(this.$t('home.changeSuccess'), 'success');
                        this.newPassword = '';
                        this.oldPassword = '';
                        this.changePasswordModalOpen = false;
                    });
            },
        },
        directives: {
            // 与菜单权限配合，自动隐藏/显示菜单
            // 用在 router-link 上时，不用任何参数
            // 非 router-link 上，需要传一个路由名字符串 v-auth="'wechat,journey'"
            auth: {
                inserted(el, binding, vnode) {
                    let routeNames = [];
                    if (binding.value) {
                        routeNames = binding.value.replace(/\s/g, '')
                            .split(',');
                    } else {
                        if (vnode.componentInstance.to.name) {
                            routeNames.push(vnode.componentInstance.to.name);
                        }
                        let {route} = vnode.context.$router.resolve(vnode.componentInstance.to);
                        if (route && route.meta && route.meta.auth) {
                            routeNames.push(route.meta.auth);
                        }
                    }
                    const visible = routeNames.some(name => name in vnode.context.$store.state.user.menus);
                    if (visible) {
                        el.style.display = '';
                    } else {
                        el.style.display = 'none';
                    }
                }
            }
        }
    };
</script>
<style lang="scss" type="text/scss" rel="stylesheet/scss">
    @import '../../common/scss/base/variables';
    @import '../../common/scss/base/mixin';

    .header {
        position: relative;
        background: $nav-bg;
        z-index: $index-menu;
        min-width: $min-content-width;
        @include user-select(none);
        white-space: nowrap;
        @include clearfix();

        .support-modal {
            padding: 0 32px;

            .support-logo {
                display: block;
                max-height: 180px;
                margin: 24px auto;
            }

            h3 {
                text-align: center;
            }

            .h4-text {
                padding-top: 16px;
            }

            .support-text {
                display: block;
                margin: 16px 0;
            }

            .btn {
                display: block;
                margin: $input-field-height/2 auto;
            }
        }

        .logo {
            float: left;
            height: 100%;
            padding: ($header-height - 40px)/2 18px;
            margin-right: 40px;
            @include transition(background-color .2s ease);
            overflow: hidden;

            img {
                display: block;
                height: 40px;
                vertical-align: top;
                margin-right: 8px;
                width: auto;
            }

            &:hover {
                background-color: darken($nav-bg, 3%);
            }

            &:active {
                background-color: darken($nav-bg, 5%);
            }
        }

        .nav-link,
        .nav-link-group {
            display: inline-block;
            vertical-align: top;
            border-top: 4px solid transparent;
            border-bottom: 4px solid transparent;
            line-height: $header-height - 8px;
            height: $header-height - 8px;
            padding: 0 15px;
            color: rgba(white, .77);
            @include transition();
        }

        .nav-link {
            &:hover {
                color: rgba(white, .7);
                background-color: #4e545a;
            }

            &:active,
            &.router-link-active {
                color: white;
                background-color: lighten(#4e545a, 5%);
            }
        }

        .nav-link-group {
            max-width: 165px;
            position: relative;
            cursor: pointer;
            background-color: $nav-bg;

            .nav-link-group-title {
                display: inline-block;
                max-width: 139px;
                overflow: hidden;
                white-space: nowrap;
                text-overflow: ellipsis;
            }

            &:hover,
            &.active {
                color: rgba(white, .7);
                background-color: #4e545a;
                border-top-color: $theme;
            }

            &:hover .nav-links {
                @include transform(scale(1) translateY(0));
            }
        }

        .nav-link-group-arrow {
            display: inline-block;
            fill: currentColor;
            width: 12px;
            height: 12px;
            vertical-align: top;
            margin: ($header-height - 8px - 12px)/2 0 0 16px;
        }

        .nav-links {
            position: relative;
            top: -20px;
            margin: 4px -15px;
            border-top: 1px solid #5e656a;
            @include transform(scale(0.8, 0) translateY(-#{$header-height}));
            @include transform-origin(center top);
            @include transition();
        }

        .nav-link-title {
            padding: 0 16px;
            line-height: $input-field-height;
            background-color: $nav-bg;
            color: $theme;
        }

        .nav-link-inside-group {
            display: block;
            line-height: 40px;
            padding: 0 15px;
            background-color: #4e545a;
            overflow: hidden;
            white-space: nowrap;
            text-overflow: ellipsis;
            @include transition();

            + .nav-link-inside-group {
                border-top: 1px solid #60656b;
            }

            &.disabled {
                color: $color-light-content;
            }

            &:not(.disabled) {
                color: rgba(white, .7);

                &:active,
                &.router-link-active {
                    color: white;
                }
            }

            &:hover,
            &:active,
            &.router-link-active {
                background-color: lighten(#4e545a, 5%);
            }
        }

        .sign-out-btn {
            height: $input-field-height;
            width: $input-field-height;
            border: none;
            margin: ($header-height - $input-field-height) / 2;
            padding: 0;
            font-size: 14px;
            line-height: $input-field-height;
            border-radius: 100%;
            cursor: pointer;
            color: white;
            background-color: transparent;
            @include transition(background-color .3s ease);

            &:hover {
                background-color: rgba($theme, .3);
            }

            &:active {
                background-color: rgba($theme, .5);
            }
        }

        .account-actions {
            $height: 24px;
            $open-bg: lighten($nav-bg, 10%);

            position: relative;
            margin-top: ($header-height - $height)/2;
            height: $height;
            color: white;

            .user-name {
                position: relative;
                display: block;
                z-index: 1;
                max-width: 20em;
                padding: 0 1em;
                @include ellipsis();
                border: 1px solid transparent;
                border-radius: 4px;
                line-height: $height - 2px;
                background-color: $nav-bg;

                &.open {
                    border-color: $open-bg;
                    background-color: $open-bg;
                }

                &:hover {
                    border-color: $open-bg;
                    background-color: $open-bg;
                }
            }

            .user-profile {
                position: absolute;
                z-index: 1;
                top: 100%;
                right: 0;
                margin-top: 3px;
                padding: 12px 16px 8px;
                line-height: $input-field-height - 1px;
                @include box-shadow(0 1px 5px $open-bg);
                border-radius: 4px;
                overflow: hidden;
                background-color: $open-bg;

                .package-info {
                    line-height: 20px;
                }

                .sms-surplus {
                    font-size: 14px;
                }

                .action-text {
                    clear: both;
                }
            }

            .notice:after {
                content: '';
                position: absolute;
                width: 6px;
                height: 6px;
                background-color: $dark-red;
                border-radius: 100%;
            }
        }

        .apply-training-modal {
            padding: 0 $input-field-height;
            -ms-word-break: break-word;
            word-break: break-word;
            white-space: normal;
            @include user-select(text);

            .training-logo {
                display: block;
                max-height: 200px;
                margin: auto;
            }

            .training-title {
                text-align: center;
                font-weight: normal;
                margin-bottom: $input-field-height;
                color: $color-title;
            }

            .training-qr-code {
                display: block;
                max-width: $input-field-height * 4;
                margin: $input-field-height auto;
            }

            .btn {
                display: block;
                margin: $input-field-height/2 auto;
            }
        }

        .apply-important-modal {
            width: 475px;
            padding: 0 $input-field-height;
            white-space: normal;
            background-color: rgba(249, 249, 249, 1);
            border-radius: 10px;
            @include user-select(text);

            .important-logo {
                display: block;
                max-height: 220px;
                margin: auto;
            }

            .important-content {
                color: $color-title;
                font-size: 13px;
                line-height: 18px;
                font-weight: 400;
                word-break: normal;

                p {
                    padding: 10px 0;
                    line-height: 24px;

                    .important-content-zd {
                        font-weight: 700;
                        text-decoration: underline;
                    }

                    .important-content-wrap {
                        display: inline-block;
                        width: 100%;
                    }
                }

                // ul {
                //     display: block;
                //     width: 400px;
                //     margin: 0 auto;
                //     padding: 10px 0;

                //     li {
                //         list-style: disc;
                //     }
                // }

                a {
                    color: $theme;
                }
            }

            .btn {
                display: block;
                margin: $input-field-height/2 auto;
            }
        }

        .database-upgarde-modal {
            width: 424px;
            padding: 0 $input-field-height;
            white-space: normal;
            background-color: rgba(249, 249, 249, 1);
            border-radius: 10px;
            @include user-select(text);

            .database-logo {
                display: block;
                max-height: 220px;
                margin: auto;
            }

            .database-content {
                color: $color-title;
                font-size: 13px;
                line-height: 18px;
                font-weight: 400;
                word-break: normal;

                p {
                    padding: 10px 0;

                    .database-bold {
                        font-weight: bold;
                        text-decoration: underline;
                    }

                    .database-content-wrap {
                        display: inline-block;
                        width: 100%;
                    }
                }
            }

            .btn {
                display: block;
                margin: $input-field-height/2 auto;
            }
        }

        .private-club-modal {
            padding: 0 $input-field-height;
            -ms-word-break: break-word;
            word-break: break-word;
            white-space: normal;
            @include user-select(text);

            p {
                line-height: 18px;
            }

            .strongSpan {
                font-weight: bold;
            }

            .private-logo {
                display: block;
                max-height: 120px;
                margin: auto;
                margin-top: 16px;
            }

            .private-title {
                text-align: center;
                font-weight: bold;
                margin-bottom: 12px;
                margin-top: 12px;
                color: $color-title;
            }

            .private-qr-code {
                display: block;
                max-width: $input-field-height * 3;
                margin: $input-field-height auto;
            }

            .btn {
                display: block;
                margin: $input-field-height/2 auto;
            }

        }

        .function-disabled-modal {
            -ms-word-break: break-word;
            word-break: break-word;
            white-space: normal;
        }
    }
</style>
