<template>
    <div class="customer-detail">
        <div class="content-view">
            <crumbs :crumbs="crumbs" />
        </div>
        <div class="page-head">
            <div class="content-view">
                <h1>{{'contact.contactDetail' | t}}</h1>
                <template v-if="scrollTop > 100">
                    <template v-if="customer.customerMobile !== undefined">
                        <span class="theme-text ml16">{{'contact.phone' | t}}</span>
                        {{customer.customerMobile || $t('common.unknown')}}
                    </template>
                    <template v-if="customer.email !== undefined">
                        <span class="theme-text ml16">{{'contact.email' | t}}</span>
                        {{customer.email || $t('common.unknown')}}
                    </template>
                </template>
            </div>
        </div>
        <div class="page-content" @scroll.passive="handleScroll($event)">
            <!--用户详情-->
            <div class="content-view margin customer-view">
                <div class="customer-info-detail white-bg padding">
                    <button class="btn pull-right" @click="deleteCustomer" :disabled="$has('customer_list_customer_delete')">
                        <svg aria-hidden="true" :class="{'icon-disable':$has('customer_list_customer_delete')}" class="delete-user-action">
                            <use xlink:href="#icon-delete"></use>
                        </svg>
                    </button>

                    <img v-if="customer.headUrl" class="pull-left avatar" :src="customer.headUrl" alt="">
                    <svg v-else class="pull-left avatar" aria-hidden="true">
                        <use xlink:href="#icon-lianxiren"></use>
                    </svg>
                    <h3 class="customer-name">{{customerName}}</h3>
                    <div class="customer-info">
                        <div v-if="customer.customerMobile !== undefined">
                            <p class="theme-text">{{'contact.phone' | t}}</p>
                            {{customer.customerMobile || $t('common.unknown')}}
                        </div>

                        <div v-if="customer.email !== undefined">
                            <p class="theme-text">{{'contact.email' | t}}</p>
                            {{customer.email || $t('common.unknown')}}
                        </div>
                        <div v-if="customer.nickName !== undefined">
                            <p class="theme-text">{{'contact.wechatNickName' | t}}</p>
                            {{customer.nickName || $t('common.unknown')}}
                        </div>
                        <div v-if="customer.address !== undefined">
                            <p class="theme-text">{{'contact.district' | t}}</p>
                            {{customer.address || $t('common.unknown')}}
                        </div>
                        <div v-if="customer.sex !== undefined">
                            <p class="theme-text">{{'contact.sex' | t}}</p>
                            {{customer.sex || $t('common.unknown')}}
                        </div>
                    </div>
                    <div class="customer-info">
                        <div v-if="customer.lastJourneyTime !== undefined">
                            <p class="blue-text">{{'contact.saleTime' | t}}</p>
                            <p>{{customer.lastJourneyTime || $t('common.unknown')}}</p>
                        </div>
                        <div v-if="customer.updateDate !== undefined">
                            <p class="blue-text">{{'contact.UpdateTime' | t}}</p>
                            <p>{{customer.updateDate || $t('common.unknown')}}</p>
                        </div>
                        <div v-if="customer.activeIndex !== undefined && !scoreMode">
                            <p class="blue-text">{{'contact.activeness' | t}}</p>
                            <p>{{customer.activeIndex || $t('common.unknown')}}</p>
                        </div>
                        <div v-if="customer.consumeIndex !== undefined && !scoreMode">
                            <p class="blue-text">{{'contact.spendingPower' | t}}</p>
                            <p>{{customer.consumeIndex || $t('common.unknown')}}</p>
                        </div>
                        <div v-if="customer.priceIndex !== undefined && !scoreMode">
                            <p class="blue-text">{{'contact.general' | t}}</p>
                            <p>{{customer.priceIndex || $t('common.unknown')}}</p>
                        </div>
                    </div>
                </div>
                
                <!-- 评分详情 -->
                <div class="scoring-detail white-bg padding">
                    <div class="comp-models">
                        <p>{{'contact.models' | t}}</p>
                        <span class="blue-text" @click="showScoreList">{{'contact.more' | t}}</span>
                    </div>
                    <ul class="comp-models-name">
                        <template v-for="(s,i) in scoreEvaList">
                            <li v-if="i < 3" :key="s.id">
                                <p>{{ s.name }}</p>
                                <span>{{ s.grade }}</span>
                            </li>
                        </template>
                    </ul>
                </div>

                <!--订阅状态-->
                <div class="customer-subscription white-bg padding">
                    <p class="subscription-status">
                        {{'contact.subscriptionStatus' | t}}
                        <i class="icon icon-yiwen1" v-title:left="subscriptionStatusDes"></i>
                    </p>
                    <ul class="subscription-type-status">
                        <li v-for="sub in subscriptionType" :key="sub.id">
                            <span class="type-name disabled-text">{{sub.name}}</span>
                            <span class="type-status disabled-text" v-if="sub.isSub !== ''">
                                <span :class="{'red-text':!sub.isSub}">{{whetherSubscribe(sub.isSub)}}</span>
                                <i class="icon icon-yiwen1" v-title:left="sub.subDes"></i>
                            </span>
                            <span class="type-status disabled-text" v-else>
                                <i class="icon icon-loading"></i>
                                <i class="icon icon-yiwen1" v-title:left="sub.subDes"></i>
                            </span>

                        </li>
                    </ul>
                </div>
                <wecom-contact-detail v-if="isWecomContact==1" @viewStaffAbout="viewStaffAbout" :wecomContact="wecomContact"></wecom-contact-detail>
            </div>

            <!--标签内容-->
            <div class="content-view margin padding white-bg">
                <!-- 粉丝标签 -->
                <div class="customer-tags">
                    <div class="tags-box" ref="fansTagsHeight" :class="{overHeight:!fanTagsExpand && fansExpandBtn}">
                        <button class="btn btn-sm btn-blue" @click="openTagForm('wechat')" v-if="officialOpenId">
                            <svg aria-hidden="true">
                                <use xlink:href="#icon-plus"></use>
                            </svg>
                            {{'contact.addFollowerLabel' | t}}
                        </button>
                        <span class="customer-tag blue" v-for="(tag, index) in wechatTags" :key="tag.id">
                            <span :title="tag.name">{{tag.name}}</span>
                            <svg aria-hidden="true" @click="deleteWechatTag(tag, index)">
                                <use xlink:href="#icon-round-close"></use>
                            </svg>
                        </span>
                    </div>
                    <div class="tag-show" v-if="wechatTags.length != 0 && fansExpandBtn" @click="fanTagsExpand = !fanTagsExpand">
                        <span class="tags-num" v-text="fanTagsExpand ? $t('contact.putAway') : $t('contact.aTotal') + wechatTags.length + $t('contact.tagsNum')"></span>
                        <span class="icon" :class="fanTagsExpand ? 'icon-arrow-down' : 'icon-right'"></span>
                    </div>
                    <p v-if="wechatTags.length === 0" class="disabled-text">{{'QRCode.noFollowerTag' | t}}</p>
                    <selector class="account lg pull-right" :options="publicAccountList" v-model="officialId" @select="selectAccount"></selector>
                </div>

                <!--会员标签-->
                <div class="customer-tags" v-show="customerIsShow">
                    <div class="tags-box" ref="customerTagsHeight" :class="{overHeight:!customerTagsExpand && customerExpandBtn}">
                        <button v-if="!$has('customer_list_customer_edit') && taggingAvailable" class="btn btn-sm btn-orange" @click="openTagForm('member')">
                            <svg aria-hidden="true">
                                <use xlink:href="#icon-plus"></use>
                            </svg>
                            {{'contact.addMemberLabel' | t}}
                        </button>
                        <span class="customer-tag orange" v-for="(tag, index) in tags" :key="tag.id">
                            <span class="tag-name-wrapper">
                                <span class="tag-name" :title="tag.name">{{tag.name}}</span>
                                <svg aria-hidden="true" v-if="!$has('customer_list_customer_edit') && taggingAvailable" @click="deleteTag(tag, index)">
                                    <use xlink:href="#icon-round-close"></use>
                                </svg>
                            </span>

                        </span>
                    </div>
                    <div class="tag-show" v-if="tags.length != 0 && customerExpandBtn" @click="customerTagsExpand = !customerTagsExpand">
                        <span class="tags-num" v-text="customerTagsExpand ? $t('contact.putAway') : $t('contact.aTotal') + tags.length + $t('contact.tagsNum')"></span>
                        <span class="icon" :class="customerTagsExpand ? 'icon-arrow-down' : 'icon-right'"></span>
                    </div>
                    <p v-if="tags.length === 0" class="disabled-text">{{'contact.noMemberLabel' | t}}</p>
                </div>
                <p v-if="!taggingAvailable" class="disabled-text">{{'tag.unavailable' | t}}</p>
            </div>

            <!-- 联系人动态、消费历史 -->
            <div class="content-view margin log-and-attribute">
                <div class="customer-log">
                    <div class="log-types">
                        <span class="log-type" :class="{active: logType === 'attribute'}" @click="logType = 'attribute'">{{'contact.customerDynamic' | t}}</span>
                        <span class="log-type" :class="{active: logType === 'consumption'}" @click="logType = 'consumption'">{{'contact.consumptionHistory' | t}}</span>
                    </div>
                    <!-- 联系人动态 -->
                    <div v-if="logType === 'attribute'">
                        <div class="attribute-log-head">
                            <div class="attribute-visual-types">
                                <button type="button" class="visual-type" :class="{active: visualType === 'flow'}" @click="visualType = 'flow'">
                                    {{'contact.streamInfo' | t}}
                                </button>
                                <button type="button" class="visual-type" :class="{active: visualType === 'calendar'}" @click="visualType = 'calendar'">
                                    {{'contact.calendarInfo' | t}}
                                </button>
                            </div>
                            <template v-if="dateList.length !== 0 && visualType === 'flow'">
                                <button class="btn btn-md download-btn pull-right" @click="downloadDetailFlag = true">
                                    <svg aria-hidden="true">
                                        <use xlink:href="#icon-download"></use>
                                    </svg>
                                </button>
                            </template>
                            <date-range class="pull-right" :start="fromDate" :end="toDate" @change="rangeChange" />
                            <template v-if="dateList.length !== 0 && visualType === 'flow'">
                                <button class="fold pull-right btn btn-theme-border btn-md" type="button" v-text="expanded ? $t('contact.fold') : $t('contact.unfold')" @click="expanded = !expanded"></button>
                            </template>
                            <selector class="pull-right" type="checkSelect" search shortcutAction :listName="listName" :options="selectorEvents" v-model="selectedEventIds" @checkOptions="changeEventIds"></selector>
                        </div>
                        <!-- 信息流 -->
                        <!-- 用v-html展示数据是因为返回的值包含br时，要处理换行 -->
                        <div class="time-line" v-if="visualType === 'flow' && !timelineLoading && dateList.length">
                            <div class="time-date-event" v-for="(date, index) in dateList">
                                <div class="time-date" @click="date.expanded = !date.expanded">
                                    <svg aria-hidden="true" class="icon-time">
                                        <use xlink:href="#icon-time"></use>
                                    </svg>
                                    <span class="date-text">{{date.date}}</span>
                                    <svg aria-hidden="true" class="icon icon-arrow-down pull-right" :class="{expanded: date.expanded}">
                                        <use xlink:href="#icon-arrow-down"></use>
                                    </svg>
                                </div>
                                <!--事件-->
                                <div class="time-content" v-for="(event, index) in date.events" v-if="date.expanded">
                                    <span class="event-pointer">
                                        <customer-icon v-bind="event"></customer-icon>
                                    </span>
                                    <div class="time-event">
                                        <!--表单事件-->
                                        <template v-if="event.eventGroupName === 'form'">
                                            <div class="time-title" @click="event.expanded = !event.expanded">
                                                <template>
                                                    <span class="title-text">{{lang ? event.eventMeaning : event.nameEn}}</span>
                                                    <svg aria-hidden="true" class="icon icon-arrow-down pull-right" :class="{expanded: event.expanded}">
                                                        <use xlink:href="#icon-arrow-down"></use>
                                                    </svg>
                                                    <span class="title-time pull-right">{{event.time}}</span>
                                                </template>
                                                <div class="sub-text">{{'contact.event' | t}}：{{event.eventName}}
                                                </div>
                                            </div>
                                            <div class="time-label" v-if="event.expanded">
                                                <div class="time-table">
                                                    <table>
                                                        <tbody :data-no-data="$t('common.noData')">
                                                            <tr v-for="datum in Math.ceil(event.attributes.length/2)">
                                                                <template v-if="event.attributes[2 * datum - 2].attributeName === 'form_content'">
                                                                    <td></td>
                                                                    <td class="theme-text" @click="openFormModal(event.attributes[2 * datum - 2].attributeValue)">
                                                                        {{'contact.formContent' | t}}
                                                                    </td>
                                                                </template>
                                                                <template v-if="event.attributes[2 * datum - 2].attributeName !== 'form_content'">
                                                                    <td>
                                                                        {{event.attributes[2 * datum -
                                                                    2].attributeMeaning}}
                                                                    </td>
                                                                    <td :class="{'line-r': event.attributes.length !== 1}">
                                                                        <span v-html="event.attributes[2 * datum -
                                                                    2].attributeValue"></span>
                                                                    </td>
                                                                </template>
                                                                <template v-if="event.attributes[2 * datum - 1] && event.attributes[2 * datum - 1].attributeName === 'form_content'">
                                                                    <td></td>
                                                                    <td class="theme-text" @click="openFormModal(event.attributes[2 * datum - 1].attributeValue)">
                                                                        {{'contact.formContent' | t}}
                                                                    </td>
                                                                </template>
                                                                <template v-if="event.attributes[2 * datum - 1] && event.attributes[2 * datum - 1].attributeName !== 'form_content'">
                                                                    <td>
                                                                        {{event.attributes[2 * datum -
                                                                    1].attributeMeaning}}
                                                                    </td>
                                                                    <td>
                                                                        <span v-html="event.attributes[2 * datum -
                                                                    1].attributeValue"></span>
                                                                    </td>
                                                                </template>
                                                            </tr>
                                                        </tbody>
                                                    </table>
                                                </div>
                                            </div>
                                        </template>
                                        <!--其他事件-->
                                        <template v-if="event.eventGroupName !== 'form'">
                                            <div class="time-title" @click="event.expanded = !event.expanded">
                                                <template>
                                                    <span class="title-text">{{lang ? event.eventMeaning : event.nameEn}}</span>
                                                    <svg aria-hidden="true" class="icon icon-arrow-down pull-right" :class="{expanded: event.expanded}">
                                                        <use xlink:href="#icon-arrow-down"></use>
                                                    </svg>
                                                    <span class="title-time pull-right">{{event.time}}</span>
                                                </template>
                                                <div class="sub-text">{{'contact.event' | t}}：{{event.eventName}}
                                                </div>
                                            </div>
                                            <template v-if="event.expanded">
                                                <!--合并用户事件-->
                                                <div class="time-label" v-if="event.eventName === 'merge_user'">
                                                    <div class="time-table">
                                                        <table>
                                                            <tbody :data-no-data="$t('common.noData')">
                                                                <tr v-for="datum in Math.ceil(event.attributes.length/2)">
                                                                    <td>{{event.attributes[2 * datum - 2].attributeMeaning}}</td>
                                                                    <td :class="{'line-r': event.attributes.length !== 1}">
                                                                        <span v-html="event.attributes[2 * datum - 2].attributeValue"></span>
                                                                    </td>
                                                                    <td v-if="event.attributes[2 * datum - 1]">
                                                                        {{event.attributes[2 * datum - 1].attributeMeaning}}
                                                                    </td>
                                                                    <td v-if="event.attributes[2 * datum - 1]">
                                                                        <span v-html="event.attributes[2 * datum - 1].attributeValue"></span>
                                                                    </td>
                                                                </tr>
                                                            </tbody>
                                                        </table>
                                                        <!--被合并用户-->
                                                        <div class="table-title">{{'contact.mergeUser' | t}}</div>
                                                        <table>
                                                            <tbody :data-no-data="$t('common.noData')">
                                                                <template v-for="user in event.mergedUsers">
                                                                    <tr v-for="datum in Math.ceil(user.length/2)">
                                                                        <td>{{user[2 * datum - 2].attributeMeaning}}
                                                                        </td>
                                                                        <td :class="{'line-r': user.length !== 1}">
                                                                            <span v-html="user[2 * datum - 2].attributeValue"></span>
                                                                        </td>
                                                                        <td v-if="user[2 * datum - 1]">
                                                                            {{user[2 * datum - 1].attributeMeaning}}
                                                                        </td>
                                                                        <td v-if="user[2 * datum - 1]">
                                                                            <span v-html="user[2 * datum - 1].attributeValue"></span>
                                                                        </td>
                                                                    </tr>
                                                                </template>
                                                            </tbody>
                                                        </table>
                                                        <!--合并后用户-->
                                                        <div class="table-title">{{'contact.userInfo' | t}}</div>
                                                        <table>
                                                            <tbody :data-no-data="$t('common.noData')">
                                                                <tr v-for="datum in Math.ceil(event.userInfo.length/2)">
                                                                    <td>{{event.userInfo[2 * datum - 2].attributeMeaning}}
                                                                    </td>
                                                                    <td :class="{'line-r': event.userInfo.length !== 1}">
                                                                        <span v-html="event.userInfo[2 * datum - 2].attributeValue"></span>
                                                                    </td>
                                                                    <td v-if="event.userInfo[2 * datum - 1]">
                                                                        {{event.userInfo[2 * datum - 1].attributeMeaning}}
                                                                    </td>
                                                                    <td v-if="event.userInfo[2 * datum - 1]">
                                                                        <span v-html="event.userInfo[2 * datum - 1].attributeValue"></span>
                                                                    </td>
                                                                </tr>
                                                            </tbody>
                                                        </table>
                                                    </div>
                                                </div>
                                                <!--普通事件-->
                                                <div class="time-label" v-if="event.eventName !== 'merge_user'">
                                                    <div class="time-table">
                                                        <table>
                                                            <tbody :data-no-data="$t('common.noData')">
                                                                <tr v-for="datum in Math.ceil(event.attributes.length/2)">
                                                                    <td>{{event.attributes[2 * datum - 2].attributeMeaning}}
                                                                    </td>
                                                                    <td :class="{'line-r': event.attributes.length !== 1}">
                                                                        <span v-html="event.attributes[2 * datum - 2].attributeValue"></span>
                                                                    </td>
                                                                    <td v-if="event.attributes[2 * datum - 1]">
                                                                        {{event.attributes[2 * datum - 1].attributeMeaning}}
                                                                    </td>
                                                                    <td v-if="event.attributes[2 * datum - 1]">
                                                                        <span v-html="event.attributes[2 * datum - 1].attributeValue"></span>
                                                                    </td>
                                                                </tr>
                                                            </tbody>
                                                        </table>
                                                    </div>
                                                </div>
                                            </template>
                                        </template>
                                    </div>
                                </div>
                            </div>
                            <div class="page-box" v-if="dateList.length > 0">
                                <pager :now="timePageNow" :total="timeTotalPage" @page="handlePage" />
                            </div>
                        </div>
                        <inline-loading v-if="timelineLoading" />

                        <p v-else-if="visualType === 'flow' && !timelineLoading && dateList.length === 0" class="light-content-text">{{'contact.noData' | t}}</p>
                        <!-- 日历 -->
                        <div class="log-calendar" v-if="visualType === 'calendar'">
                            <div class="measure-icon"></div>
                            {{'contact.noActivity' | t}}
                            <div class="measure-icon low-frequency"></div>
                            {{'contact.oneActivity' | t}}
                            <div class="measure-icon medium-frequency"></div>
                            {{'contact.threeActivity' | t}}
                            <div class="measure-icon high-frequency"></div>
                            {{'contact.overFourActivity' | t}}
                            <div>
                                <table v-for="(month, index) in pageMonths" class="month-view-table">
                                    <thead>
                                        <tr>
                                            <th colspan="7">
                                                {{month.getFullYear()}} {{monthNameMap[month.getMonth()] | t}}
                                            </th>
                                        </tr>
                                        <tr>
                                            <th>Mo</th>
                                            <th>Tu</th>
                                            <th>We</th>
                                            <th>Th</th>
                                            <th>Fr</th>
                                            <th>Sa</th>
                                            <th>Su</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        <tr v-for="week in weeks[index]">
                                            <td v-for="day in week" :class="getDateClass(day)" @click="checkoutEvents(day)">
                                                {{day ? day.getDate() : ''}}
                                            </td>
                                        </tr>
                                    </tbody>
                                </table>
                                <pager :total="calendarTotal" :now="calendarPageNow" @page="handleCalendarPage" />
                            </div>
                        </div>
                    </div>

                    <!-- 消费历史 -->
                    <div v-else-if="logType === 'consumption'">
                        <div class="attribute-log-head">
                            {{'common.total' | t}}
                            <span class="theme-text">{{ordersTotalRow}}</span>
                            {{'contact.orderCount' | t}}
                            <div class="pull-right search-box">
                                <input type="text" :placeholder="$t('contact.orderSearchPlaceholder')" v-model.trim="ordersKeyword" @keyup.enter="searchOrders">
                                <svg aria-hidden="true" @click="searchOrders">
                                    <use xlink:href="#icon-search"></use>
                                </svg>
                            </div>
                        </div>
                        <div class="simplify-table auto-width">
                            <table>
                                <thead>
                                    <tr>
                                        <td><span>{{'contact.orderNo' | t}}</span></td>
                                        <td><span>{{'contact.orderDate' | t}}</span></td>
                                        <!--<td><span>商品数量</span></td>-->
                                        <!--<td><span>产品名称</span></td>-->
                                        <td><span>{{'contact.orderAmount' | t}}</span></td>
                                        <td><span>{{'contact.orderChannel' | t}}</span></td>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr v-for="order in orders" @click="getOrder(order.saleId)">
                                        <td><span>{{order.saleId}}</span></td>
                                        <td><span>{{order.saleCreateDate}}</span></td>
                                        <!--<td><span>{{order.saleCount}}</span></td>-->
                                        <!--<td v-title:right="order.saleName" class="overflow">-->
                                        <!--<span>{{order.saleName}}</span>-->
                                        <!--</td>-->
                                        <td><span v-text="order.saleTotal.toLocaleString()"></span></td>
                                        <td><span>{{order.saleSources}}</span></td>
                                    </tr>
                                </tbody>
                            </table>
                            <pager :total="ordersTotalPage" :now="ordersPageNumber" @page="changeOrderPage" />
                            <list-empty v-if="orders.length === 0 && !ordersKeyword" :name="$t('contact.orders')" />
                            <list-search-empty v-if="orders.length === 0 && ordersKeyword" />
                        </div>
                    </div>
                </div>

                <div class="customer-attr">
                    <div class="customer-attr-block">
                        <span class="customer-attr-title">{{'contact.customerAttr' | t}}</span>
                        <span class="customer-attr-operate blue-text pull-right" :class="{'disabledText': clickFlag}" @click="showAttr">{{'common.edit' | t}}</span>
                    </div>
                    <div class="attribute-line" v-for="attr in userAttributes">
                        <span class="attribute-key">{{lang ? attr.name : attr.nameEn}}</span>
                        <div class="attribute-value" :class="{empty: attr.value === ''}">
                            {{attr.value !== '' ? attr.value : $t('common.noData')}}
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <!-- 添加粉丝、会员标签 -->
        <confirm v-if="tagForm.type" :title="tagForm.type === 'wechat' ? $t('contact.addFollowerLabel') : $t('contact.addMemberLabel')" @cancel="tagForm.type = ''" @confirm="tagForm.type === 'wechat' ? addWeChatTag() : addTag()">
            <div class="form-field">
                <span class="label">{{'contact.label' | t}}</span>
                <radio source="choose" v-model="tagForm.labelSource">{{'contact.selectLabel' | t}}</radio>
                <radio source="create" v-model="tagForm.labelSource">{{'contact.createLabel' | t}}</radio>
            </div>
            <div class="form-field">
                <template v-if="tagForm.labelSource === 'choose'">
                    <label class="label">{{'contact.selectLabel' | t}}</label>
                    <div class="field-groups">
                        <selector-tree v-if="tagForm.type === 'member'" :options="tagForm.labels" :value="tagForm.selectLabels" @checkOptions="tagForm.selectLabels = $event" />
                        <multi-select v-if="tagForm.type === 'wechat'" class="full-width" drop-direction="bottom" :options="tagForm.labels" :max="20" :value="tagForm.selectLabels.map(l => l.tagId)" unique-key="tagId" :shortcut-action="false" :placeholder="' '" @change="tagForm.selectLabels = $event" />
                        <p v-if="tagForm.type === 'wechat'" class="light-content-text">{{'follower.max20Tag' | t}}</p>
                    </div>
                </template>
                <template v-if="tagForm.labelSource === 'create'">
                    <label for="newLabelName" class="label">{{'contact.createLabel' | t}}</label>
                    <input type="text" class="input lg" id="newLabelName" :placeholder="$t('contact.newLabelName')" v-model.trim="tagForm.labelName" maxlength="200" :class="{error: tagForm.newLabelNameError}" v-title:top.warn="tagForm.newLabelNameError" @focus="tagForm.newLabelNameError=''">
                </template>
            </div>
        </confirm>

        <!-- 按日期预览事件 -->
        <modal class="lg-modal" :title="previewingDate" v-if="previewingDate" @close="closeDateEventsModal" size="lg">
            <div class="simplify-table customer-calendar">
                <table>
                    <thead>
                        <tr>
                            <td width="120px">{{'contact.time' | t}}</td>
                            <td width="160px">{{'contact.event' | t}}</td>
                            <td>{{'contact.detail' | t}}</td>
                        </tr>
                    </thead>
                    <tbody>
                        <tr v-for="(event, eventIndex) in pageEvents" @click="changeFold(event, eventIndex)">
                            <td>{{event.time}}</td>
                            <td :title="lang ? event.eventMeaning : event.nameEn">{{lang ? event.eventMeaning : event.nameEn}}</td>
                            <td>
                                <template>
                                    <!--收起-->
                                    <div class="form-field" v-if="!event.calendarExpanded">
                                        <label class="label">{{event.attributes[0].attributeMeaning}}</label>
                                        <span>{{event.attributes[0].attributeValue}}</span>
                                        <svg aria-hidden="true" class="icon icon-arrow-down pull-right">
                                            <use xlink:href="#icon-arrow-down"></use>
                                        </svg>
                                    </div>
                                    <!--展开-->
                                    <template v-else>
                                        <!--点击查看表单内容-->
                                        <div class="form-field" v-if="event.eventName !== 'merge_user'" v-for="(attr, attrIndex) in event.attributes">
                                            <!--表单内容-->
                                            <template v-if="attr.attributeName === 'form_content'">
                                                <label class="label"></label>
                                                <span class="theme-text" @click="openFormModal(attr.attributeValue)">{{'contact.formContent' | t}}</span>
                                            </template>
                                            <!--普通事件-->
                                            <template v-if="attr.attributeName !== 'form_content'">
                                                <label class="label">{{attr.attributeMeaning}}</label>
                                                <span>{{attr.attributeValue}}</span>
                                                <svg aria-hidden="true" class="icon icon-arrow-down pull-right expanded" v-if="attrIndex === 0">
                                                    <use xlink:href="#icon-arrow-down"></use>
                                                </svg>
                                            </template>
                                        </div>
                                        <!--合并用户事件-->
                                        <template v-if="event.eventName === 'merge_user'">
                                            <div class="form-field" v-for="(attr, attrIndex) in event.attributes">
                                                <label class="label">{{attr.attributeMeaning}}</label>
                                                <span>{{attr.attributeValue}}</span>
                                                <svg aria-hidden="true" class="icon icon-arrow-down pull-right expanded" v-if="attrIndex === 0">
                                                    <use xlink:href="#icon-arrow-down"></use>
                                                </svg>
                                            </div>
                                            <!--被合并用户-->
                                            <div class="table-title">{{'contact.mergeUser' | t}}</div>
                                            <div class="form-field" v-for="user in event.mergedUsers">
                                                <div v-for="attr in user">
                                                    <label class="label">{{attr.attributeMeaning}}</label>
                                                    <span>{{attr.attributeValue}}</span>
                                                </div>
                                            </div>
                                            <!--被合并用户-->
                                            <div class="table-title">{{'contact.userInfo' | t}}</div>
                                            <div class="form-field" v-for="user in event.userInfo">
                                                <label class="label">{{user.attributeMeaning}}</label>
                                                <span>{{user.attributeValue}}</span>
                                            </div>
                                        </template>
                                    </template>
                                </template>
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>
            <pager :total="detailTotal" :now="detailPageNow" @page="handleDetailPage" />

            <template v-slot:buttons>
                <button type="button" class="btn btn-md btn-white" @click="closeDateEventsModal">
                    {{'common.close' | t}}
                </button>
            </template>
        </modal>

        <!-- 订单详情 -->
        <modal v-if="order.saleId" size="lg" :title="$t('contact.orderDetail')" @close="closeOrderDetail">
            <div class="form-field">
                {{'contact.orderNo' | t}}{{'punctuation.colon' | t}}{{order.saleId}}
            </div>
            <div class="form-field">
                {{'contact.orderDate' | t}}{{'punctuation.colon' | t}}{{order.saleDate}}
            </div>
            <div class="form-field">
                {{'contact.orderDetail' | t}}{{'punctuation.colon' | t}}
                <div class="simplify-table auto-width">
                    <table>
                        <thead>
                            <tr>
                                <td>{{'contact.goodsName' | t}}</td>
                                <td>{{'contact.goodsPrimaryCategory' | t}}</td>
                                <td>{{'contact.goodsSecondCategory' | t}}</td>
                                <td>{{'contact.price' | t}}</td>
                                <td>{{'contact.discountPrice' | t}}</td>
                                <td>{{'contact.quantity' | t}}</td>
                                <td>{{'contact.points' | t}}</td>
                            </tr>
                        </thead>
                        <tbody>
                            <tr v-for="good in order.goodlist">
                                <td>{{good.goodName}}</td>
                                <td>{{good.primaryCategory}}</td>
                                <td>{{good.secondCategory}}</td>
                                <td v-text="good.price.toLocaleString()"></td>
                                <td v-text="good.discountPrice.toLocaleString()"></td>
                                <td v-text="good.goodsCount.toLocaleString()"></td>
                                <td v-text="good.goodsIntegral.toLocaleString()"></td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>
            <div class="form-field">{{'contact.orderAmount' | t}}{{'punctuation.colon' | t}}
                ￥<span v-text="order.saleTotal.toLocaleString()"></span>
            </div>
            <div class="form-field">{{'contact.orderChannel' | t}}{{'punctuation.colon' | t}} {{order.saleSources}}
            </div>
            <div class="form-field">{{'contact.orderStatus' | t}}{{'punctuation.colon' | t}} {{order.saleStatus}}</div>
            <div class="form-field">
                {{'contact.producePoints' | t}}{{'punctuation.colon' | t}} {{order.saleIntegral.toLocaleString()}}
            </div>
            <template v-slot:buttons>
                <input type="button" class="btn btn-md btn-theme" @click="closeOrderDetail" :value="$t('common.close')" />
            </template>
        </modal>

        <!-- 用户序列 日历视图：查看表单内容 -->
        <modal class="lg-modal" v-if="showForm" size="lg" :title="'表单填写内容'" @close="closeFormModal">
            <div class="simplify-table auto-width form-content">
                <table>
                    <thead>
                        <tr>
                            <td width="120px">{{'contact.title' | t}}</td>
                            <td>{{'contact.content' | t}}</td>
                        </tr>
                    </thead>
                    <tbody>
                        <tr v-for="content in formContents">
                            <td>{{content.name}}</td>
                            <td>{{content.value}}</td>
                        </tr>
                    </tbody>
                </table>
            </div>
            <template v-slot:buttons>
                <input type="button" class="btn btn-md btn-theme" @click="closeFormModal" :value="$t('common.close')" />
            </template>
        </modal>

        <!--华为2.4.6下载详情-->
        <download-detail-modal v-if="downloadDetailFlag" :themeModules="'customerDetail'" @okDownload="toDownload" @cancel="cancelDownload"></download-detail-modal>

        <!--评分详情弹窗-->
        <modal :title="$t('metaData.calculationResults')" v-if="isShowScoreEva" @close="isShowScoreEva = false" size="lg">
            <div class="table scoring-detail-table" v-if="scoreEvaList.length>0">
                <table>
                    <thead>
                        <tr>
                            <th v-for="(item,index) in scoringDetailList" :key="index">
                                {{item.name}}
                            </th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr v-for="(item) in scoreEvaList">
                            <td :title="item.name" class="expend-td">{{item.name}}</td>
                            <td :title="item.score" class="expend-td">{{typeRender(item.type)}}</td>
                            <td :title="item.score" class="expend-td">{{item.score}}</td>
                            <td :title="item.grade" class="expend-td">{{item.grade}}</td>
                            <td :title="item.scoreTime" class="expend-td">{{item.scoreTime}}</td>
                        </tr>
                    </tbody>
                </table>
                <div class="tool-box">
                    <div class="total-page">{{'metaData.total' | t}} <span>{{totalRecord}}</span> {{'metaData.records' | t}}</div>
                    <pager :now="nowPage" :total="scoringDetailTotalPage" @page="handleCurrentChange" />
                </div>

            </div>
            <div v-else="scoreEvaList.length=0">
                {{'metaData.noResult'| t }}
            </div>
        </modal>

        <!--编辑用户属性弹窗-->
        <modal class="attr-modal" v-if="showCustomerAttr" size="sl" :title="$t('contact.editCustomerAttr')" @close="closeAttr">
            <div class="form-field" v-for="attr in userAttributes">
                <label class="label customer-label" :titile="lang ? attr.name : attr.nameEn">{{lang ? attr.name : attr.nameEn}}</label>
                <!--attrGenre 0:字符串, 1:数字, 2:时间, 3:小数, 4:布尔值-->
                <!--文本-->
                <template v-if="attr.attrGenre == 0">
                    <input class="input customer-input" :class="{error: attr.errorEmail}" :disabled="!attr.editFlag || attr.hasPermission === 0" v-if="attr.attrName === 'email'" type="text" v-model="attr.value" :placeholder="$t('contact.emailInput')" maxlength="255" v-title:top.line.warn="attr.errorEmail" @focus="attr.errorEmail=''">

                    <input class="input customer-input" :class="{error: attr.errorMobile}" :disabled="!attr.editFlag || attr.hasPermission === 0" v-else-if="attr.attrName === 'mobile'" type="text" v-model="attr.value" :placeholder="$t('contact.mobileInput')" maxlength="255" v-title:top.line.warn="attr.errorMobile" @focus="attr.errorMobile=''">

                    <input class="input customer-input" :disabled="!attr.editFlag || attr.hasPermission === 0" v-else type="text" v-model="attr.value" :placeholder="$t('contact.textInput')" maxlength="255">
                </template>
                <!--数字-->
                <number-input class="input customer-input" type="int" v-if="attr.attrGenre == 1" :id="attr.attrName" v-model="attr.value" :disabled="!attr.editFlag || attr.hasPermission === 0" :placeholder="$t('contact.numInput')" maxlength="12" />
                <!--日期-->
                <calendar class="customer-input" v-if="attr.attrGenre == 2" :id="attr.attrName" format="yyyy-mm-dd hh:ii:ss" :placeholder="$t('contact.timeInput')" :disabled="!attr.editFlag || attr.hasPermission === 0" v-model="attr.value" clearBtn />
                <!--小数-->
                <number-input class="input customer-input" type="float" :precision="attr.attrLength" v-if="attr.attrGenre == 3" :id="attr.attrName" v-model="attr.value" :placeholder="$t('contact.floatInput')+ '【' + attr.attrLength + '】' + $t('contact.floatInputTail')" :disabled="!attr.editFlag || attr.hasPermission === 0" maxlength="12" />
                <span class="disabled-text">&nbsp;{{attr.isPk ? $t('contact.mainKey') : ''}}</span>
            </div>
            <template v-slot:buttons>
                <input type="button" class="btn btn-md btn-theme" @click="editAttr" :value="$t('common.save')" />
            </template>
        </modal>

        <!--企业微信联系人-员工记录list弹窗-->
        <contact-record-modal v-if="staffRecordFlag" @closeRecord="closeRecord" :page-type="pageType" :customer-id="customer.customerId" :wecom-group-list="wecomGroupList"></contact-record-modal>
    </div>
</template>
<script type="text/babel">
import {
    ContactApiV1,
    EtlApiV1,
    ScrmApiV1,
    WebServEventApiV1,
    WechatApiV1
} from '@/api';
import {
    addMonths,
    differenceInCalendarDays,
    differenceInCalendarMonths,
    eachDay,
    endOfMonth,
    endOfWeek,
    format,
    startOfMonth,
    startOfWeek,
    subMonths
} from 'date-fns';
import differenceBy from 'lodash/differenceBy';
import selectorTree from '../../common/components/selector-tree.vue';
import customerIcon from './customer-icon.vue';
import { COMMON_NAME_REGEXP } from '../../common/utils/regs';
import { getDateInstance } from '../../common/utils/dateUtils';
import { EMAIL_ADDRESS_REGEXP, PHONE_REGEXP } from '../../common/utils/regs.js';
import ContactRecordModal from './wecom-contact-modal.vue';
import WecomContactDetail from './wecom-contact-detail.vue';
import { I18N_STORE_NAME, translate as t } from '@/locales';
import { mapState } from 'vuex';

/**
 * 月历视图，一个月表格包含的所有单元格列表，单元格可能是 nulL, 可能是日期对象
 * @param date
 * @return {*[]}
 */
function getDaysForFullWeek (date) {
    const bodyFirst = startOfMonth(date);
    const bodyLast = endOfMonth(date);
    const body = eachDay(bodyFirst, bodyLast);
    let head = new Array(differenceInCalendarDays(
        bodyFirst,
        startOfWeek(bodyFirst, { weekStartsOn: 1 })
    )).fill(null);
    let tail = new Array(differenceInCalendarDays(
        endOfWeek(bodyLast, { weekStartsOn: 1 }),
        bodyLast
    )).fill(null);

    return [].concat(head, body, tail);
}

/**
 * 把月历单元格列表切分成行列表，一行是一周
 * @param days
 * @return {Array}
 */
function splitDaysIntoWeeks (days) {
    let weeks = [];
    const daysCopy = [].concat(days);

    while (daysCopy.length) {
        weeks.push(daysCopy.splice(0, 7));
    }

    return weeks;
}

export default {
    components: {
        selectorTree,
        customerIcon,
        ContactRecordModal,
        WecomContactDetail
    },
    data () {
        return {
            scrollTop: 0,// 滚动条距离页面顶部高度
            customer: {
                activeIndex: '0.0', // 活跃度评分
                address: '', // 地址
                consumeIndex: '0.0', // 消费力评分
                customerId: '',
                customerMobile: '', // 手机号
                customerName: '',
                email: '', // 邮箱
                headUrl: '', // 头像图片地址
                lastJourneyTime: '', // 最后营销时间
                nickName: '', // 微信名称
                openid: '',
                priceIndex: '0.0', // 综合评分
                sex: '', // 性别
                updateDate: '' // 更新时间
            },

            // 联系人会员标签
            tags: [],
            officialId: '',         // 公众号ID
            officialOpenId: '',         // 公众号openID
            publicAccountList: [], // 公众号列表
            // 联系人会员标签show
            customerIsShow: false,
            // 添加会员标签的表单
            tagForm: {
                type: '',   // wechat, member 微信粉丝标签、会员标签
                open: false,
                labelSource: 0, // choose：选择标签；create：新增标签
                labelName: '', // new tag's name
                labels: [],
                labelId: '',
                selectLabels: [],
                newLabelNameError: '',
            },
            // 会员标签是否可用
            taggingAvailable: false,

            // 微信粉丝标签
            wechatTags: [],

            // 联系人信息日志类型： attribute 代表联系人联系人动态、consumption代表消费历史
            logType: 'attribute',
            visualType: 'flow', // 展示联系人动态的视图形式：flow 代表信息流；calendar 代表日历视图
            fromDate: '',   // 起始日期
            toDate: '',     // 结束日期
            events: [],     // 元事件列表
            selectorEvents: [],       // 下拉框-元事件列表
            selectedEventIds: [],    // 下拉框-元事件 ids
            // 信息流
            timePageNow: 1,         // 信息流视图页码
            timeTotalPage: 1,       // 信息流视图总页数
            timePageSize: 10,       // 信息流视图每页条数
            dateList: [],           // 信息流列表
            timelineLoading: false,
            // 日历视图
            monthNameMap: [
                'time.January',
                'time.February',
                'time.March',
                'time.April',
                'time.May',
                'time.June',
                'time.July',
                'time.August',
                'time.September',
                'time.October',
                'time.November',
                'time.December'
            ],
            dateEventMap: {},       // Map<date, Array<timelineEvent>>
            previewingDate: '',     // 预览某天的事件列表
            calendarTotal: 1,       // 日历视图-总页数
            calendarPageNow: 1,     // 日历视图-当前页
            calendarPageSize: 12,   // 日历视图-每页条数
            pageEvents: [],         // 日历视图-事件详情-每页展示的事件列表
            detailTotal: 1,         // 日历视图-事件详情-总页数
            detailPageNow: 1,       // 日历视图-事件详情-当前页
            detailPageSize: 10,     // 日历视图-事件详情-每页条数
            showForm: false,        // 显示表单内容弹窗
            formContents: [],       // 表单内容

            // 消费历史
            orders: [],
            ordersTotalPage: 0,
            ordersPageNumber: 1,
            ordersKeyword: '',
            ordersTotalRow: 0,
            order: {},

            // 用户属性 Map<attrKey, value>
            userAttributes: [],
            firstName: '',
            lastName: '',
            sortType: 1,

            // 新增订阅状态数据列表
            subscriptionType: [
                {
                    name: this.$t('contact.globalSubscribe'),
                    id: 'globalStatus',
                    isSub: '',
                    subDes: this.$t('contact.accountManager')
                },
                {
                    name: this.$t('contact.emailSubscribe'),
                    id: 'emailStatus',
                    isSub: '',
                    subDes: this.$t('contact.accountManager')
                },
                {
                    name: this.$t('contact.mobileSubscribe'),
                    id: 'mobileStatus',
                    isSub: '',
                    subDes: this.$t('contact.contactTheAfterSales')
                },
            ],

            //下载

            downloadDetailFlag: false,

            //标签展开与收起
            fansExpandBtn: false,//微信粉丝展开与收起按钮的隐藏与显示
            fanTagsExpand: false, //粉丝标签的展开与收起
            customerExpandBtn: false,//会员标签展开与收起btn的隐藏与显示
            customerTagsExpand: false,//会员标签的展开与收起
            downloadFromDate: '',
            downloadEndDate: '',

            isShowScoreEva: false,
            scoreEvaList: [],
            gradeList: [],

            // 编辑用户属性
            showCustomerAttr: false, // 编辑用户属性弹窗
            attrTimeout: null,

            //企业微信
            isWecomContact: '',//0不是企业微信联系人，1是企业微信联系人
            wecomContact: {}, // 企业微信联系人相关
            staffRecordFlag: false, // 员工记录/所属群 弹窗显隐
            pageType: '',// record:员工记录，group：所属群
            wecomGroupList: [], //企业微信联系人所属群

            // 评分详情
            nowPage: 1,
            pageSize: 10,//每页展示10条数据
            totalRecord: 1,
            scoringDetailTotalPage: 1,
            scoringDetailList: [
                {
                    id: 0,
                    name: this.$t('metaData.scoreModel')
                },
                {
                    id: 1,
                    name: this.$t('metaData.types')
                },
                {
                    id: 2,
                    name: this.$t('metaData.scoring')
                },
                {
                    id: 3,
                    name: this.$t('metaData.level')
                },
                {
                    id: 4,
                    name: this.$t('metaData.calculationAt')
                }
            ]
        };
    },
    filters: {
        ellipsis: function (value, n) {
            if (!value) {
                return '';
            }
            return value.length > n
                ? value.substring(0, n - 1) + ' ..'
                : value;
        }
    },
    computed: {
        ...mapState({
            // 语言状态
            lang: state => state[I18N_STORE_NAME].lang === 'zh-CN'
        }),
        // 编辑客户属性按钮权限
        clickFlag () {
            return this.$has('customer_swarm_edit_attribute');
        },
        //如果菜单中有打分评级，则展示打分评级的评分和按钮
        scoreMode () {
            return this.$store.state.user.menus.score && this.$store.state.user.menus.score.showName === 'score';
        },
        user () {
            let user = this.$store.state.user;
            if (user.authorizerInfoId) {
                this.officialId = parseInt(user.authorizerInfoId);
            } else if (this.publicAccountList.length > 0) {
                this.officialId = parseInt(this.publicAccountList[0].id);
            }
            return user;
        },
        crumbs () {
            return [
                { name: 'index', text: 'Dmartech' },
                { name: 'memberList', text: this.$t('home.customerPerfile') },
                Object.assign({}, this.$route, {
                    text: this.customerName || this.$t('contact.contactDetail')
                })
            ];
        },
        // 全部展开/收起
        expanded: {
            get () {
                let dateExpanded,
                    eventsExpanded;
                this.dateList.forEach(date => {
                    dateExpanded = this.dateList.every(date => date.expanded);
                    eventsExpanded = date.events.every(event => {
                        return event.expanded;
                    });
                });
                return dateExpanded || eventsExpanded;
            },
            set (expanded) {
                for (let date of this.dateList) {
                    date.expanded = expanded;
                    for (let event of date.events) {
                        event.expanded = expanded;
                    }
                }
            }
        },
        // 下拉框name
        listName () {
            let selectorTitle = '',
                allEvent = this.$t('contact.allEvent'),
                partEvent = this.$t('contact.partEvent');
            if (this.selectorEvents.length > 0) {
                let name = this.selectorEvents.length === this.selectedEventIds.length
                    ? allEvent
                    : partEvent;
                selectorTitle = name + '（' + this.selectedEventIds.length + '）';
            }
            return selectorTitle;
        },
        months () {
            const start = getDateInstance(this.fromDate);
            const end = getDateInstance(this.toDate);
            const months = new Array(differenceInCalendarMonths(end, start) + 1);
            // 日历倒序
            return Array.from(months, (month, index) => addMonths(start, index))
                .reverse();
        },
        // 日历视图-月份
        pageMonths: {
            get () {
                // 日历视图-总页数
                this.calendarTotal = Math.ceil(this.months.length / this.calendarPageSize);
                // 日历视图-分页
                let pageNow = this.calendarTotal > this.calendarPageNow ? this.calendarPageNow : 1; // 当前页
                if (pageNow === 1) {
                    return this.months.slice(0, this.calendarPageSize);
                } else if (pageNow === Math.ceil(this.months.length / this.calendarPageSize)) {
                    return this.months.slice(this.calendarPageSize * (pageNow - 1));
                }
                return this.months.slice(this.calendarPageSize * (pageNow - 1), this.calendarPageSize * pageNow);
            },
            set (months) {
                return months;
            }
        },
        weeks () {
            return this.pageMonths
                .map(month => {
                    const days = getDaysForFullWeek(month);
                    return splitDaysIntoWeeks(days);
                });
        },
        // 订阅状态说明
        subscriptionStatusDes () {
            let t = this.$t;
            return `${t('contact.globalSubscribe')}<br>${t('contact.updateRule')}：${t('contact.realTimeComputation')}<br>${t('contact.unsubscribeMethod')}：${t('contact.globalUnsubscribeMethod')}<br>
${t('contact.emailSubscribe')}<br>${t('contact.isSubEmail')}<br>${t('contact.updateRule')}：${t('contact.UpdatedOtherDay')}<br>${t('contact.unsubscribeMethod')}：${t('contact.emailUnsubscribeMethod')}<br>
${t('contact.mobileSubscribe')}<br>${t('contact.theMobileSubscribe')}<br>${t('contact.updateRule')}：${t('contact.UpdateEveryHour')}<br>${t('contact.unsubscribeMethod')}：${t('contact.phoneUnsubscribeMethod')}`;
        },
        // 联系人名称
        customerName () {
            if (this.user.companyType === 1) {
                if (this.firstName && this.lastName) {
                    return this.lastName + ' ' + this.firstName;
                }
                if (!this.firstName && !this.lastName) {
                    return this.$t('common.unknown');
                }
                if (this.firstName && !this.lastName) {
                    return this.firstName;
                }
                if (this.lastName && !this.firstName) {
                    return this.lastName;
                }
            }
            return this.customer.customerName || this.$t('common.unknown');
        },
    },
    created () {
        const customerId = this.$route.query.id;
        // 获取公众号列表
        this.fetchAccountList();

        // 是否可以打标签
        ContactApiV1
            .getPageStatus()
            .then(res => {
                this.taggingAvailable = res.body.data.ruleStatus;
            });

        // 获取用户详情
        this.fetchCustomerDetail();

        // 信息流、属性列表
        WebServEventApiV1
            .getMetaEventList()
            .then(res => {
                if (res.body.data && res.body.data.eventList) {
                    // 所有事件
                    this.events = res.body.data.eventList.filter(event => !/order/.test(event.name));
                    this.selectorEvents = this.events.map(event => {
                        let e = {};
                        e.id = event.id;
                        e.name = event.meaning;
                        return e;
                    });
                    this.selectedEventIds = this.events.map(event => event.id);
                }
                // 初始化日期区间
                const today = new Date();
                this.fromDate = format(startOfMonth(subMonths(today, 5)), 'YYYY-MM-DD') + ' 00:00:00';
                this.toDate = format(endOfMonth(today), 'YYYY-MM-DD') + ' 23:59:59';
                this.downloadFromDate = format(startOfMonth(subMonths(today, 5)), 'YYYY-MM-DD');
                this.downloadEndDate = format(endOfMonth(today), 'YYYY-MM-DD');
                this.fetchCustomerTimeline();
            });

        // 获取用户属性
        this.fetchUserProperties();

        //打分评级列表数据
        // this.getGradeScoreList(customerId);
        this.getScoringDetailList(customerId);
    },
    mounted () {
        // 获取联系人所有标签、粉丝标签
        this.fetchCustomerTags();
    },
    methods: {
        typeRender(type) {
            let tName = {
                0: t('contact.standardScoring'),
                1: t('contact.scoringMatrix')
            };
            return tName[type] || '-';
        },
        // 获取用户详情
        fetchCustomerDetail () {
            const customerId = this.$route.query.id;
            ContactApiV1
                .getCustomerDetail(customerId)
                .then(res => {
                    if (res.body.data) {
                        this.isWecomContact = res.body.data.isWecomContact;
                    }
                    if (res.body.data && res.body.data.memberDetail) {
                        let memberDetail = res.body.data.memberDetail;
                        this.gradeList = memberDetail.gradeList ? memberDetail.gradeList : [];
                        memberDetail.customerId = customerId;
                        this.customer = memberDetail;
                        // 获取订单列表
                        this.fetchOrders();
                        // 获取联系人订阅状态
                        this.getCustomerSendStatus();
                    }
                    if (res.body.data && res.body.data.wecomContact) {
                        this.wecomContact = res.body.data.wecomContact;
                        this.wecomGroupList = res.body.data.wecomContact.wecomGroupList;
                    }
                });
        },
        // 获取联系人所有标签、粉丝标签
        fetchCustomerTags () {
            const customerId = this.$route.query.id;
            ContactApiV1
                .getCustomerTags(customerId, parseInt(this.officialId) || '')
                .then(res => {
                    if (res.body.data) {
                        if (res.body.data.customerLabelMapList) {
                            this.tags = res.body.data.customerLabelMapList;
                            this.$nextTick(() => {
                                if (this.$refs.customerTagsHeight.offsetHeight > 32) {
                                    this.customerExpandBtn = true;
                                    this.customerTagsExpand = false;
                                }
                            });

                        }
                        if (res.body.data.customerIsShow !== undefined && res.body.data.customerIsShow !== null) {
                            this.customerIsShow = res.body.data.customerIsShow;
                        }
                        if (res.body.data.fansLabelMapList) {
                            let fansLabelMapList = res.body.data.fansLabelMapList;
                            fansLabelMapList.forEach(tag => {
                                tag.id = ~~tag.id;
                                tag.tagId = tag.id;
                            });
                            this.wechatTags = fansLabelMapList;
                            this.$nextTick(() => {
                                if (this.$refs.fansTagsHeight.offsetHeight > 32) {
                                    this.fansExpandBtn = true;
                                    this.fanTagsExpand = false;
                                }
                            });
                        }
                        this.officialOpenId = res.body.data.openid ? res.body.data.openid : '';
                    }
                });
        },
        // 获取公众号列表
        fetchAccountList () {
            WechatApiV1
                .getWechatAccounts()
                .then(res => {
                    this.publicAccountList = res.body.data.authorizerInfoList.map(auth => ({
                        id: auth.authorizerInfoId,
                        WxAppId: auth.WxAppId,
                        name: auth.principalName,
                        serviceTypeInfo: auth.serviceTypeInfo,
                    }));
                });
        },
        // 选择公众号
        selectAccount (e) {
            this.fetchCustomerDetail();
            this.officialId = e.id;
            this.fetchCustomerTags(this.customer.customerId, parseInt(this.officialId));
        },
        // 用户属性
        fetchUserProperties () {
            const customerId = this.$route.query.id;
            ContactApiV1
                .getUserProperties(customerId)
                .then(res => {
                    if (res.body.data && res.body.data.attributeList) {
                        this.userAttributes = res.body.data.attributeList;
                        this.userAttributes.map(attr => {
                            this.$set(attr, 'errorEmail', '');
                            this.$set(attr, 'errorMobile', '');
                        });
                        let firstObj = this.userAttributes.filter(attr => attr.name === 'First_Name')[0],
                            lastObj = this.userAttributes.filter(attr => attr.name === 'Last_Name')[0];
                        if (firstObj) {
                            this.firstName = firstObj.value;
                        }
                        if (lastObj) {
                            this.lastName = lastObj.value;
                        }
                    }
                });
        },

        /**
         * 显示用户属性弹窗
         */
        showAttr () {
            if (this.clickFlag) return;
            if (this.userAttributes.length > 0) {
                this.showCustomerAttr = true;
            } else {
                this.$toast(this.$t('contact.noAttr'), 'warn');
            }
        },

        /**
         * 关闭用户属性弹窗
         */
        closeAttr () {
            this.showCustomerAttr = false;
            this.fetchUserProperties();
        },
        /**
         * 编辑用户属性校验
         * 邮箱和手机号只校验attrName=email,attrName=mobile
         */
        verify () {
            let email = this.userAttributes.filter(attr => attr.editFlag && attr.attrName === 'email' && !attr.hasOwnProperty('hasPermission'))[0];
            let mobile = this.userAttributes.filter(attr => attr.editFlag && attr.attrName === 'mobile' && !attr.hasOwnProperty('hasPermission'))[0];
            if (email && email.value !== '' && !EMAIL_ADDRESS_REGEXP.test(email.value)) {
                email.errorEmail = this.$t('contact.emailTip');
                return false;
            }
            if (mobile && mobile.value !== '' && !PHONE_REGEXP.test(mobile.value)) {
                mobile.errorMobile = this.$t('contact.mobileTip');
                return false;
            }
            return true;
        },
        /**
         * 编辑用户属性
         */
        editAttr () {
            if (this.verify()) {
                this.$confirm(this.$t('contact.tips'), this.$t('contact.tipContent'))
                    .then(sure => {
                        if (sure) {
                            /**
                             * 保存用户修改后的属性 json格式
                             * 保存后跳转到对应的客户详情页面
                             */
                            let jsonObj = {};
                            for (let i = 0; i < this.userAttributes.length; i++) {
                                if (!this.userAttributes[i].hasOwnProperty('hasPermission')) {
                                    let attrName = this.userAttributes[i].attrName;
                                    let value = this.userAttributes[i].value;
                                    jsonObj[attrName] = value;
                                }
                            }
                            const customerId = this.$route.query.id;
                            EtlApiV1
                                .editCustomerAttr(customerId, jsonObj)
                                .then(res => {
                                    this.showCustomerAttr = false;
                                    this.$toast(this.$t('contact.attrTip'), 'success');
                                    let route = this.$router.resolve({
                                        name: 'customerDetail',
                                        query: { id: res.body.data.customerId }
                                    });
                                    clearTimeout(this.attrTimeout);
                                    this.attrTimeout = setTimeout(() => {
                                        window.open(route.href, '_self');
                                    }, 2000);
                                });
                        }
                    });
            }
        },
        // 获取用户行为序列
        fetchCustomerTimeline () {
            let customerId = this.$route.query && this.$route.query.id ? this.$route.query.id : '';
            if (!customerId) return;
            this.timelineLoading = true;
            // 联系人详情日历视图
            EtlApiV1
                .getCustomerTimeline(customerId, this.selectedEventIds.join(','), this.fromDate, this.toDate,
                    this.timePageNow, this.timePageSize)
                .then(res => {
                    this.dateList = res.body.data.dateList;
                    this.timeTotalPage = res.body.data.totalPage;
                    // 信息流视图设置展开/收起 状态
                    this.dateEventMap = {};
                    this.dateList.forEach(date => {
                        this.$set(date, 'expanded', false); // 行为序列-日期 展开/收起
                        date.events.forEach(event => {
                            this.$set(event, 'expanded', false); // 行为序列-事件 展开/收起
                            // 日历视图数据
                            if (this.dateEventMap[date.date]) {
                                this.dateEventMap[date.date].push(event);
                            } else {
                                this.$set(this.dateEventMap, date.date, [event]);
                            }
                        });
                    });
                    this.timelineLoading = false;
                })
                .catch(() => {
                    this.timelineLoading = false;
                });
        },

        // 打开表单内容弹窗
        openFormModal (formContent) {
            this.showForm = true;
            let content = JSON.parse(formContent);// 表单内容
            let contentList = [];
            for (let i in content) {
                let o = {};
                o.name = i;
                o.value = content[i];
                contentList.push(o);
            }
            this.formContents = contentList;
        },

        // 关闭表单内容弹窗
        closeFormModal () {
            this.showForm = false;
            this.formContents = [];
        },

        // 滚动条
        handleScroll (e) {
            this.scrollTop = e.target.scrollTop;
        },
        // 删除联系人确认
        deleteCustomer () {
            this.$confirm(this.$t('common.delete'), this.$t('common.deleteSure'))
                .then(sure => {
                    if (sure) {
                        ContactApiV1
                            .removeCustomer(this.customer.customerId)
                            .then(() => {
                                this.$toast(this.$t('common.deleteSuccess'), 'success');
                                this.$router.replace({ name: 'memberList' });
                            });
                    }
                });
        },
        // 粉丝标签
        // 会员标签
        deleteWechatTag (tag, index) {
            this.fanTagsExpand = true;
            this.$confirm(this.$t('contact.tips'), this.$t('contact.tagTipContent'))
                .then(sure => {
                    if (sure) {
                        WechatApiV1
                            .removeCustomerWeChatTag(tag.tagId, this.officialOpenId, parseInt(this.officialId))
                            .then(res => {
                                this.$toast(res.body.message, 'success');
                                this.wechatTags.splice(index, 1);
                            })
                            .catch(() => {
                                this.wechatTags.splice(index, 0, tag);
                            });
                        this.fansTagsPutWay();
                    }
                });
        },
        //删除微信粉丝标签时 展开与收起的判断
        fansTagsPutWay () {
            setTimeout(() => {
                if (this.$refs.fansTagsHeight.offsetHeight > 32) {
                    this.fansExpandBtn = true;
                    this.fanTagsExpand = true;
                } else {
                    this.fansExpandBtn = false;
                    this.fanTagsExpand = false;
                }
            }, 60);
        },
        deleteTag (tag, index) {
            this.customerTagsExpand = true;
            ContactApiV1
                .removeTagFromCustomer(this.customer.customerId, tag.id)
                .then(() => {
                    this.tags.splice(index, 1);
                    this.customerTagsPutWay();
                });
        },
        //删除会员标签时  展开与收起的判断
        customerTagsPutWay () {
            setTimeout(() => {
                if (this.$refs.customerTagsHeight.offsetHeight > 32) {
                    this.customerExpandBtn = true;
                    this.customerTagsExpand = true;
                } else {
                    this.customerExpandBtn = false;
                    this.customerTagsExpand = false;
                }
            }, 60);

        },
        openTagForm (type) {
            // 获取标签列表
            type === 'wechat'
                ? WechatApiV1
                    .getTagList(null, null, parseInt(this.officialId))
                    .then(({ body: { data: { tagList } } }) => {
                        this.tagForm.labels = tagList;
                    })
                : ContactApiV1
                    .getGroups({
                        sortType: this.sortType
                    })
                    .then((res) => {
                        this.tagForm.labels = res.body.data.rootGroup.childs;
                    });
            this.tagForm.labelId = '';
            this.tagForm.labelName = '';
            this.tagForm.newLabelNameError = '';
            this.tagForm.selectLabels = type === 'wechat' ? this.wechatTags.slice() : this.tags.slice();
            this.tagForm.labelSource = 'choose';
            this.tagForm.type = type;
        },
        // 添加微信标签
        addWeChatTag () {
            this.fanTagsExpand = true;
            // 单人最多可以有 20 个微信标签
            this.tagForm.selectLabels = this.tagForm.selectLabels.slice(0, 20);
            // 选择已有标签
            if (this.tagForm.labelSource === 'choose') {
                if (this.tagForm.selectLabels.length === 0) {
                    return this.$toast(this.$t('contact.labelTip'), 'warn');
                }
                WechatApiV1
                    .updateCustomerWeChatTag(
                        this.tagForm.selectLabels.map(tag => tag.id),
                        this.officialOpenId,
                        parseInt(this.officialId),
                        2
                    )
                    .then(res => {
                        this.wechatTags = this.tagForm.selectLabels.slice();
                        this.$toast(res.body.message, 'success');
                    });

                setTimeout(() => {
                    if (this.$refs.fansTagsHeight.offsetHeight > 32) {
                        this.fansExpandBtn = true;
                    }
                }, 60);
                this.tagForm.type = '';
            } else if (this.tagForm.labelSource === 'create') {
                // 新建标签

                if (!this.tagForm.labelName) {
                    this.tagForm.newLabelNameError = this.$t('contact.labelNameNoEmpty');
                    return;
                }
                const RegCn = /[\u4e00-\u9fa5]/g;
                let value = this.tagForm.labelName;
                value = value.replace(RegCn, 'aa');
                let confirmLength = value.length;
                if (confirmLength > 12) {
                    this.tagForm.newLabelNameError = this.$t('follower.cannotOver6');
                    return;
                }
                this.tagForm.newLabelNameError = '';

                // 创建标签
                WechatApiV1
                    .addTag(this.tagForm.labelName, '', this.officialId)
                    .then(({ body: { data: { tag } } }) => {
                        this.wechatTags.unshift(tag);
                        // 给用户添加这个新标签
                        WechatApiV1
                            .updateCustomerWeChatTag(
                                [tag.id],
                                this.officialOpenId,
                                parseInt(this.officialId),
                                3
                            )
                            .then(() => {
                                this.tagForm.type = '';
                                setTimeout(() => {
                                    if (this.$refs.fansTagsHeight.offsetHeight > 32) {
                                        this.fansExpandBtn = true;
                                    }
                                }, 60);
                            })
                            .catch(() => {
                                // 标签添加未成功，移除刚刚新建的标签
                                WechatApiV1.removeTag(tag.tagId, this.officialId);
                                this.wechatTags.shift();
                                setTimeout(() => {
                                    if (this.$refs.fansTagsHeight.offsetHeight > 32) {
                                        this.fansExpandBtn = true;
                                    }
                                }, 60);
                            });
                    });
            }
        },

        // 添加用户标签
        addTag () {
            this.customerTagsExpand = true;
            // 选择已有标签
            if (this.tagForm.labelSource === 'choose') {
                if (this.tagForm.selectLabels.length === 0) {
                    return this.$toast(this.$t('contact.labelTip'), 'warn');
                }
                let addTags = differenceBy(this.tagForm.selectLabels, this.tags, 'id');
                let delTags = differenceBy(this.tags, this.tagForm.selectLabels, 'id');

                delTags.forEach(tag => {
                    ContactApiV1
                        .removeTagFromCustomer(this.customer.customerId, tag.id)
                        .then(() => {
                            this.tags = this.tagForm.selectLabels.slice();
                        });
                });
                let tagIds = [];
                addTags.forEach(tag => {
                    tagIds.push(tag.id);
                });
                ContactApiV1
                    .addTagForCustomer(this.customer.customerId, tagIds)
                    .then(({ body: { data: { labels } } }) => {
                        let tagList = [];
                        this.tagForm.selectLabels.map(item => {
                            let isAdd = true;
                            labels.forEach(label => {
                                // isConceal 标签是否显示 0:显示 1:隐藏
                                if (item.id === label.id && label.isConceal === 1) isAdd = false;
                            });
                            if (isAdd) tagList.push(item);
                        });
                        this.tags = tagList;
                        this.tagForm.selectLabels = tagList;
                    });

                setTimeout(() => {
                    if (this.$refs.customerTagsHeight.offsetHeight > 32) {
                        this.customerExpandBtn = true;
                    }
                }, 60);
                this.tagForm.type = '';
            } else if (this.tagForm.labelSource === 'create') {
                // 新建标签

                if (!this.tagForm.labelName) {
                    this.tagForm.newLabelNameError = this.$t('contact.labelNameNoEmpty');
                    return;
                }
                if (!COMMON_NAME_REGEXP.test(this.tagForm.labelName)) {
                    this.tagForm.newLabelNameError = this.$t('contact.labelNameReg');
                    return;
                }
                this.tagForm.newLabelNameError = '';

                // 创建标签
                // 创建会员标签时需选择默认分组
                ContactApiV1
                    .createLabel({
                        groupId: 1, // 默认标签分组 id 为 1
                        name: this.tagForm.labelName
                    })
                    .then(({ body: { data: newLabel } }) => {
                        // 给用户添加这个新标签
                        ContactApiV1
                            .addTagForCustomer(this.customer.customerId, [newLabel.id])
                            .then(() => {
                                this.tags.push(newLabel);
                                this.tagForm.type = '';
                                setTimeout(() => {
                                    if (this.$refs.customerTagsHeight.offsetHeight > 32) {
                                        this.customerExpandBtn = true;
                                    }
                                }, 60);
                            })
                            .catch(() => {
                                // 标签添加未成功，移除刚刚新建的标签
                                ContactApiV1.deleteLabel(1, 0, [newLabel.id], false);
                                setTimeout(() => {
                                    if (this.$refs.customerTagsHeight.offsetHeight > 32) {
                                        this.customerExpandBtn = true;
                                    }
                                }, 60);
                            });
                    });
            }
        },
        // 联系人动态
        rangeChange (newRange) {
            this.fromDate = newRange.start + ' 00:00:00';
            this.toDate = newRange.end + ' 23:59:59';
            this.downloadFromDate = newRange.start;
            this.downloadEndDate = newRange.end;
            this.timePageNow = 1;
            this.fetchCustomerTimeline();
        },
        // 选择事件 ids
        changeEventIds () {
            if (this.selectedEventIds.length <= 0) {
                this.$toast(this.$t('contact.eventOne'), 'warn');
                // 默认选中第一个事件
                this.selectedEventIds = [this.selectorEvents[0].id];
            }
            this.timePageNow = 1;
            this.fetchCustomerTimeline();
        },
        // 用户行为序列-分页
        handlePage (e) {
            this.timePageNow = e;
            this.fetchCustomerTimeline();
        },

        // 信息流视图
        // 日历视图
        getDateClass (date) {
            const events = this.dateEventMap[format(date, 'YYYY-MM-DD')];
            if (events) {
                if (events.length <= 2) return 'low-frequency';
                if (events.length <= 4) return 'medium-frequency';
                return 'high-frequency';
            }
            return '';
        },
        checkoutEvents (date) {
            date = format(date, 'YYYY-MM-DD');
            if (this.dateEventMap[date] && this.dateEventMap[date].length) {
                this.previewingDate = date;

                // 日历视图-事件详情-分页
                this.pageEvents = this.dateEventMap[date].slice(0, this.detailPageSize);
                this.pageEvents.forEach(event => {
                    this.$set(event, 'calendarExpanded', false); // 事件详情 展开/收起
                });
                // 日历视图-事件详情-总页数
                this.detailTotal = Math.ceil(this.dateEventMap[date].length / this.detailPageSize);
            }
        },
        closeDateEventsModal () {
            this.previewingDate = '';
        },
        // 日历视图-展开收起
        changeFold (event, eventIndex) {
            event.calendarExpanded = !event.calendarExpanded;
            // 只展示一条事件详情
            this.pageEvents.forEach((event, index) => {
                if (index !== eventIndex) {
                    event.calendarExpanded = false;
                }
            });
        },
        // 日历视图-分页
        handleCalendarPage (e) {
            this.calendarPageNow = e;
            if (e === 1) {
                this.pageMonths = this.months.slice(0, this.calendarPageSize);
            } else if (e === Math.ceil(this.months.length / this.calendarPageSize)) {
                this.pageMonths = this.months.slice(this.calendarPageSize * (e - 1));
            } else {
                this.pageMonths = this.months.slice(this.calendarPageSize * (e - 1), this.calendarPageSize * e);
            }
        },
        // 日历视图-事件详情分页
        handleDetailPage (e) {
            this.detailPageNow = e;
            let dateEvents = this.dateEventMap[this.previewingDate];
            if (e === 1) {
                this.pageEvents = dateEvents.slice(0, this.detailPageSize);
            } else if (e === Math.ceil(dateEvents.length / this.detailPageSize)) {
                this.pageEvents = dateEvents.slice(this.detailPageSize * (e - 1));
            } else {
                this.pageEvents = dateEvents.slice(this.detailPageSize * (e - 1), this.detailPageSize * e);
            }
            this.pageEvents.forEach(event => {
                this.$set(event, 'calendarExpanded', false); // 事件详情 展开/收起
            });
        },

        // 消费历史
        fetchOrders () {
            ScrmApiV1
                .getOrder(this.ordersKeyword, this.customer.customerId, this.ordersPageNumber)
                .then(({ body: { data } }) => {
                    const { saleList = [], totalPage = 0, totalRow = 0 } = data || {};
                    saleList.forEach(sale => {
                        sale.saleTotal = sale.saleTotal.toLocaleString();
                        return sale;
                    });
                    this.orders = saleList;
                    this.ordersTotalPage = totalPage;
                    this.ordersTotalRow = totalRow;
                });
        },
        getOrder (saleId) {
            this.close = true;
            ScrmApiV1
                .getGoodsDetail(this.customer.customerId, saleId)
                .then(res => {
                    this.$set(this.$data, 'order', res.body.data.goods);
                });
        },
        closeOrderDetail () {
            this.$set(this.$data, 'order', {});
        },
        changeOrderPage (newPage) {
            this.ordersPageNumber = newPage;
            this.fetchOrders();
        },
        searchOrders () {
            this.ordersPageNumber = 1;
            this.fetchOrders();
        },
        getAttrText (source) {
            if (source === undefined || source === null || source === '') {
                return '';
            }
            if (source === 0) {
                return '0';
            }
            return source;
        },

        // 根据返回值展示对应状态文本
        whetherSubscribe (sub) {
            if (sub) {
                return this.$t('common.yes');
            }
            return this.$t('common.no');
        },
        // 获取联系人订阅状态
        getCustomerSendStatus () {
            ContactApiV1
                .getCustomerSendStatus(this.customer.customerId)
                .then(({ body: { data } }) => {
                    for (let type in data) {
                        this.subscriptionType.forEach(sub => {
                            if (sub.id === type && data[type] !== null) {
                                // 0 订阅 1 退订
                                sub.isSub = data[type] === 0;
                            }
                        });
                    }
                });
        },
        //下载
        toDownload (info) {
            this.downloadDetailFlag = false;
            EtlApiV1
                .downloadEvents(
                    this.customer.customerId,
                    info.formatType,
                    info.dataFormat,
                    info.emailAddress,
                    info.emailSubject,
                    this.selectedEventIds,
                    this.downloadFromDate,
                    this.downloadEndDate,
                )
                .then((res) => {
                    if (res.body.code === 200) {
                        this.$toast(this.$t('swarm.checkoutEmail'), 'success');
                    } else {
                        this.$toast(res.body.message, 'warn');
                    }
                })
                .catch((err) => {
                    
                    error(err.body.message);
                });

        },
        //2.4.6取消下载
        cancelDownload () {
            this.downloadDetailFlag = false;
        },

        //获取评分详情数据
        getGradeScoreList (customerId) {
            ContactApiV1
                .getGradeScoreList(customerId)
                .then(({ body: { data } }) => {
                    if (data.scoreList) {
                        this.scoreEvaList = data.scoreList;
                    } else {
                        this.scoreEvaList = [];
                    }

                });
        },
        //获取评分详情数据
        getScoringDetailList (customerId) {
            ContactApiV1
                .getScoringDetailList(customerId, this.nowPage, this.pageSize)
                .then((res) => {
                    if (res.body.data.scoreList) {
                        this.scoreEvaList = res.body.data.scoreList;
                        this.totalRecord = res.body.data.totalRow;
                        this.scoringDetailTotalPage = res.body.data.totalPage;
                    } else {
                        this.scoreEvaList = [];
                    }
                });
        },
        //显示评分详情弹窗
        showScoreList () {
            this.isShowScoreEva = true;

        },
        //企业微信联系人-查看员工记录list
        viewStaffAbout (type) {
            this.pageType = type;
            this.staffRecordFlag = true;
        },
        closeRecord () {
            this.staffRecordFlag = false;
        },
        // 跳页
        handleCurrentChange (e) {
            const id = this.$route.query.id;
            this.nowPage = e;
            this.getScoringDetailList(id);
        }

    },
    beforeDestroy () {
        clearTimeout(this.attrTimeout);
    }
};
</script>

<style lang="scss" type="text/scss" rel="stylesheet/scss">
@import "../../common/scss/base/variables";
@import "../../common/scss/base/mixin";

.customer-detail {
    .lg-modal {
        .modal-content {
            height: calc(80vh - 154px);
            overflow-y: auto;
        }
    }

    .table-title {
        font-weight: bold;
        padding-left: 8px;
    }

    // 日历视图
    .customer-calendar {
        table {
            td {
                white-space: normal;
            }
        }

        .label {
            color: $color-light-content;
        }

        .icon-arrow-down {
            width: 14px;
            height: 14px;
            position: relative;
            top: 8px;

            &.expanded {
                @include transform(rotate(180deg));
            }
        }
    }

    .form-content {
        table {
            td {
                white-space: normal;
            }
        }
    }

    $avatar-size: 100px;

    .content-view {
        .ml16 {
            margin-left: 16px;
        }
    }

    .avatar {
        width: $avatar-size;
        height: $avatar-size;
        margin-right: $input-field-height;
        fill: $disabled;
        @include border-radius(50%);
    }

    .customer-name {
        line-height: $input-field-height;
        @include ellipsis;
    }

    .delete-user-action {
        padding: 0;
        @include transition();
        color: $light-red;
        margin: $input-field-height / 4;
        width: 16px;
        height: 16px;
        fill: currentColor;
        cursor: pointer;

        &:hover {
            color: $red;
            background-color: $content-bg;
        }

        &:active {
            color: $dark-red;
        }
    }

    .customer-view {
        display: flex;

        .white-bg {
            background: #fff;
        }

        .padding {
            @include box-sizing(border-box);
            padding: 16px 24px 24px;
        }

        .customer-info-detail {
            flex: 1;
        }

        .score-text {
            line-height: 25px;
            height: 25px;
            display: inline-block;
            position: relative;
            top: 4px;
            left: 3px;
            cursor: pointer;
        }
    }

    .customer-info {
        display: inline-flex;
        justify-content: start;
        width: 100%;
        margin-top: ($avatar-size - ($input-field-height + 20px * 3)) / 2;
        line-height: 20px;

        > div {
            width: 20%;
            padding: 0 5px;
        }

        p {
            @include ellipsis();
        }
    }

    .scoring-detail {
        width: 220px;
        margin-left: 15px;

        .comp-models ,.comp-models-name{
            display: flex;
            justify-content: space-between;
            span {
                cursor: pointer;
            }
        }
        .comp-models-name {
            margin-top: 30px;
            display: flex;
            flex-direction: column;
            li {
                display: flex;
                justify-content: space-between;
                margin-bottom: 10px;
                p {
                    width: 100px;
                    text-overflow: ellipsis;
                    overflow: hidden;
                    white-space: nowrap;
                }
                span {
                    cursor: unset;
                }
            }
        }
    }

    .customer-subscription {
        width: 220px;
        margin-left: 15px;

        .icon {
            cursor: pointer;
        }

        .subscription-status {
            font-size: 15px;
        }

        .subscription-type-status {
            display: flex;
            flex-direction: column;

            li {
                display: flex;
                justify-content: space-between;
                line-height: 32px;

                .red-text {
                    color: $red;
                }
            }
        }
    }

    .customer-tags {
        display: flex;
        flex-wrap: nowrap;
        justify-content: space-between;
        line-height: $input-field-height;

        &:first-of-type {
            padding-bottom: $input-field-height / 4;
            margin-bottom: $input-field-height / 4;
            border-bottom: 1px solid $form-border;
        }

        .btn-sm {
            margin: ($input-field-height - 24px)/2 ($input-field-height - 24px)/2
                ($input-field-height - 24px)/2 0;
        }

        .customer-tag {
            display: inline-block;
            vertical-align: top;
            border-radius: 4px;
            margin: ($input-field-height - 24px)/2 ($input-field-height - 24px)/2
                ($input-field-height - 24px)/2 0;
            padding: 0 8px;
            line-height: 24px;
            color: white;

            &.blue {
                background-color: $blue;
            }

            &.orange {
                background: $orange;
            }
            .tag-name-wrapper {
                display: flex;
                .tag-name {
                    display: inline-block;
                    max-width: 400px;
                    @include ellipsis();
                }
            }

            svg {
                float: right;
                width: 14px;
                height: 14px;
                margin: 5px 0 5px 5px;
                fill: white;
                cursor: pointer;

                &:hover {
                    fill: $content-bg;
                }
            }
        }

        .tags-box {
            flex: 1;
        }

        .tag-show {
            width: 160px;
            text-align: right;
            cursor: pointer;

            .tags-num {
                width: 100px;
            }
        }

        .account {
            margin-left: 16px;
        }
    }

    .overHeight {
        height: 32px;
        overflow: hidden;
    }

    .log-and-attribute {
        display: flex;
        flex-direction: row;
        align-items: flex-start;

        .customer-log {
            flex: 3;
            padding: 16px;
            background-color: white;

            .log-types {
                border-bottom: 1px solid $border-color;

                .log-type {
                    display: inline-block;
                    position: relative;
                    bottom: -1px;
                    vertical-align: top;
                    line-height: $input-field-height;
                    padding: 0 1em;
                    cursor: pointer;
                    @include transition();
                    border-bottom: 2px solid transparent;

                    &:hover {
                        color: $light-theme;
                    }

                    &:active,
                    &.active {
                        color: $theme;
                        border-bottom-color: $theme;
                    }
                }
            }
        }

        .attribute-log-head {
            padding: 16px 0;
            line-height: $input-field-height;
            @include clearfix();

            .download-btn {
                svg {
                    fill: #0cc2a9;
                }
            }

            .date-range {
                margin: 0 0 0 16px;
            }

            .fold {
                margin-left: 16px;

                &:hover {
                    color: #fff;
                    background: $green;
                }
            }
        }

        .attribute-visual-types {
            display: inline-flex;
            line-height: $input-field-height - 2px;
            border-radius: 4px;
            border: 1px solid $border-color;
            overflow: hidden;

            .visual-type {
                border: none;
                padding: 0 8px;
                cursor: pointer;
                color: $color-light-content;

                &.active {
                    background-color: $content-bg;
                    color: $theme;
                }

                + .visual-type {
                    border-left: 1px solid $border-color;
                }
            }
        }

        .time-line {
            position: relative;
            margin: 0;
            list-style: none;
            min-height: 40px;

            .time-date-event {
                position: relative;
                margin: 20px 0;
                cursor: pointer;
                @include clearfix();

                .time-date {
                    height: 32px;
                    line-height: 32px;
                    background-color: #f2f2f2;
                    border-radius: 4px;

                    svg {
                        margin: 0 8px;
                        width: 14px;
                        height: 14px;
                        fill: $color-light-content;
                    }

                    .icon-time {
                        position: relative;
                        top: 2px;
                    }

                    .icon-arrow-down {
                        position: relative;
                        top: 8px;

                        &.expanded {
                            @include transform(rotate(180deg));
                        }
                    }

                    .date-text {
                        font-size: 12px;
                        font-weight: bold;
                    }
                }

                .time-content {
                    position: relative;

                    &:before {
                        content: "";
                        position: absolute;
                        top: 29px;
                        left: 32px;
                        bottom: -27px;
                        width: 4px;
                        margin-left: -11px;
                        background: #e0e5ea;
                    }

                    &:last-child {
                        &:before {
                            display: none;
                        }
                    }

                    .event-pointer {
                        position: absolute;
                        left: 4px;
                        top: 4px;
                    }

                    .time-event {
                        margin: 24px 0 0 48px;

                        .time-title {
                            padding: 8px 0 8px 8px;
                            border: 1px solid $border-color;

                            svg {
                                margin: 0 8px;
                                width: 14px;
                                height: 14px;
                                fill: $color-light-content;
                            }

                            .title-text {
                                font-weight: bold;
                            }

                            .title-time {
                                font-weight: bold;
                                margin: 8px 8px 0 0;
                            }

                            .icon-arrow-down {
                                position: relative;
                                top: 8px;

                                &.expanded {
                                    @include transform(rotate(180deg));
                                }
                            }

                            .sub-text {
                                color: $color-light-content;
                            }
                        }

                        .time-label {
                            border-right: 1px solid $border-color;
                            border-bottom: 1px solid $border-color;
                            border-left: 1px solid $border-color;

                            .time-table {
                                position: relative;
                                max-height: 300px;
                                overflow-y: auto;
                                z-index: $index-container;

                                table {
                                    border-collapse: collapse;
                                    border: none;
                                    margin: 20px;
                                    width: calc(100% - 40px);

                                    td {
                                        width: 180px;
                                        padding: 8px;

                                        &:nth-child(2n-1) {
                                            text-align: right;
                                            width: 150px;
                                            padding-right: 10px;
                                            color: $color-title;
                                        }
                                    }

                                    .line-r {
                                        border-right: 1px solid $border-color;
                                        padding-right: 10px;
                                    }

                                    tbody:empty:before {
                                        display: block;
                                        text-align: center;
                                        font-style: italic;
                                        content: attr(data-no-data);
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }

        .log-calendar {
            line-height: $input-field-height;

            .measure-icon {
                display: inline-block;
                width: 20px;
                height: 20px;
                vertical-align: middle;
                margin-right: 8px;
                margin-left: $input-field-height;
                border: 1px solid $form-border;
            }

            .low-frequency {
                cursor: pointer;
                color: white;
                background-color: lighten($blue, 20%);
            }

            .medium-frequency {
                cursor: pointer;
                color: white;
                background-color: $blue;
            }

            .high-frequency {
                cursor: pointer;
                color: white;
                background-color: darken($blue, 20%);
            }

            .month-view-table {
                display: inline-table;
                margin: $input-field-height/2;
                table-layout: fixed;
                border-spacing: 0;
                border-collapse: collapse;
                border: 1px solid $border-color;
                text-align: center;

                th,
                td {
                    padding: 0;
                    min-height: $input-field-height;
                    width: $input-field-height;
                    border: 1px solid $border-color;
                }
            }
        }

        .customer-attr {
            flex: 1;
            padding: 16px;
            margin-left: 16px;
            background-color: white;

            .customer-attr-block {
                line-height: $input-field-height;
                border-bottom: 1px solid $form-border;

                .customer-attr-title {
                    color: $color-title;
                    margin: 0;
                    font-size: 14px;
                    line-height: 16px;
                    font-weight: normal;
                }

                .customer-attr-operate {
                    cursor: pointer;
                }

                .disabledText {
                    color: $disabled;
                }
            }

            .attribute-line {
                display: flex;
                line-height: $input-field-height;
                padding: 0 8px;

                .attribute-key {
                    display: inline-block;
                    width: 50%;
                    color: $color-title;
                    padding-right: 8px;
                }

                .attribute-value {
                    flex: 1;
                    text-align: right;
                    width: 50%;
                    &.empty {
                        color: $disabled;
                        font-style: italic;
                    }
                }

                &:hover {
                    background-color: $select-bg;
                }

                + .attribute-line {
                    border-top: 1px dotted $border-color;
                }
            }
        }
    }

    .field-groups {
        display: inline-block;
        width: 312px;
    }

    .expend-td {
        white-space: normal;
    }

    .attr-modal {
        .modal-content {
            height: calc(80vh - 154px);
            overflow-y: auto;
        }

        .customer-label {
            width: $form-input-width;
        }

        .customer-input {
            width: $form-input-width;
        }
    }
    // 评分详情弹窗表格
    .scoring-detail-table {
        table {
            thead,
            tbody {
                tr {
                    border-bottom: none;
                    td{
                        word-wrap: break-word;
                        white-space: normal;
                    }
                }
            }
        }
    }

    .tool-box {
        display: flex;
        justify-content: space-between;
        align-items: center;
        .total-page {
            font-size: 16px;
            color: $color-title;
        }
    }
}
</style>
