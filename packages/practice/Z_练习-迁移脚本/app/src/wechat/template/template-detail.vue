<template>
    <div class="template-detail">
        <!--正文-->
        <div class="data" v-if="!loading">
            <div class="border">
                {{'template.status' | t}}
                <span class="status-box" v-if="detailsData.status==0">
                    <span class="icon icon-warn addColor pr">
                        <span class="status">
                            {{'template.paramNot' | t}}
                        </span>
                    </span>
                </span>
                <span class="status-box" v-else-if="detailsData.status==1">
                    <span class="icon icon-True clor">
                        <span class="status">
                            {{'template.paramHas' | t}}
                        </span>
                    </span>
                </span>
            </div>
            <div class="box border">
                <div class="left">{{'template.wechatAccount' | t}}
                    <span class="p32">{{detailsData.nickName}}</span>
                </div>
                <div class="right">{{'template.tempIndustry' | t}}
                    <span class="p20">{{detailsData.primaryIndustry}} - {{detailsData.deputyIndustry}}</span></div>
            </div>
            <div class="box border">
                <div class="left">{{'template.id' | t}} <span class="p32">{{detailsData.templateId}}</span></div>
                <div class="right">{{'template.title' | t}}<span class="p20">{{detailsData.title}}</span></div>
            </div>
            <div class="box border">
                <span class="vertical">{{'template.jumpTo' | t}}</span>
                <span class="jumptext" v-if="redirectType.length > 0"  :title="jumpTxt + jumpValue">{{jumpTxt}}{{jumpValue}}</span>
                <span class="p20 addcor vertical" @click="setting">{{'template.jumpSet' | t}}</span>
                <span class="p20 addcor clear vertical" v-if="redirectType.length > 0"  @click="clearJump">{{'common.clear' | t}}</span>
            </div>
            <div class="box border" style="position: relative">
                <div class="pull-left">
                    <div class="details">{{'template.detail' | t}}</div>
                    <div class="detailsRight">
                        <span>{{'template.detailMsg1' | t}} <span class="clor">{{contentLenght}}</span>
                            {{'template.detailMsg2' | t}}<span class="clor">1000</span>{{'template.detailMsg3' | t}}
                        </span>
                        <div class="contents"
                             v-for="(filedName,index) in contentList">
                            <span class="contentLeft"
                                  v-title:bottom="filedName.content">{{filedName.content}}</span>
                            <span class="contentRight">
                                <span v-if="filedName.status==1">
                                    <!--判断是否显示输入框此时有一个值-->
                                    <span v-if="filedName.key.length<=1">
                                        <span v-if="filedName.sendContents[0].color==''&& filedName.sendContents[0].value=='' "
                                              class="icon icon-plus addPosition clor"
                                              @click="addContent(filedName,index)">{{'template.content' | t}}</span>
                                        <span v-if="filedName.sendContents[0].color!=''|| filedName.sendContents[0].value!=''">
                                            <span class="fixed">
                                                <input readonly="readonly" v-if="filedName.sendContents.length<=1"
                                                       :style="{color:filedName.sendContents[0].color}"
                                                       class="addCorlor overflowContent"
                                                       style="width: 300px"
                                                       v-model="filedName.sendContents[0].value"
                                                       @click="addContent(filedName,index)">
                                                <span class="icon icon-duoxingwenben"></span>
                                            </span>
                                        </span>
                                    </span>
                                    <!--此时有两个值时-->
                                    <span v-else-if="filedName.key.length==2">
                                        <span v-if="filedName.sendContents[0].value==''&& filedName.sendContents[1].value=='' "
                                              class="icon icon-plus addPosition clor"
                                              @click="addContentTwo(filedName,index)">{{'template.content' | t}}</span>
                                        <span class="fixed"
                                              v-if="filedName.sendContents.length==2 &&(filedName.sendContents[0].value!=''||  filedName.sendContents[1].value!='')">
                                            <span @click="addContentTwo(filedName,index)" class="addCorlor overflowContent addContentStyle">
                                                <span :style="{color:filedName.sendContents[0].color}">
                                                    {{filedName.sendContents[0].value}}:
                                                </span>
                                                <span :style="{color:filedName.sendContents[1].color}">
                                                    {{filedName.sendContents[1].value}}
                                                </span>
                                            </span>
                                            <span class="icon icon-duoxingwenben"></span>
                                        </span>
                                    </span>
                                    <!--此时有三个值-->
                                    <span v-else-if="filedName.key.length==3">
                                        <span v-if="filedName.sendContents[0].value==''&& filedName.sendContents[1].value==''&&filedName.sendContents[2].value=='' "
                                              class="icon icon-plus addPosition clor"
                                              @click="addContentThree(filedName,index)">{{'template.content' | t}}</span>
                                        <span class="fixed"
                                              v-if="filedName.sendContents.length==3 &&(filedName.sendContents[0].value!=''||  filedName.sendContents[1].value!='' || filedName.sendContents[2].value!='')">
                                            <span @click="addContentThree(filedName,index)" class="addCorlor overflowContent addContentStyle">
                                                <span :style="{color:filedName.sendContents[0].color}">
                                                    {{filedName.sendContents[0].value}}
                                                </span>
                                                <span :style="{color:filedName.sendContents[1].color}">
                                                    {{filedName.sendContents[1].value}}
                                                </span>
                                                <span :style="{color:filedName.sendContents[2].color}">
                                                    {{filedName.sendContents[2].value}}
                                                </span>
                                            </span>
                                            <span class="icon icon-duoxingwenben"></span>
                                        </span>
                                    </span>
                                    <!--此时有四个值-->
                                    <span v-else-if="filedName.key.length==4">
                                        <span v-if="filedName.sendContents[0].value==''&& filedName.sendContents[1].value==''&&filedName.sendContents[2].value==''&& filedName.sendContents[3].value==''"
                                              class="icon icon-plus addPosition clor"
                                              @click="addContentFour(filedName,index)">{{'template.content' | t}}</span>
                                        <span class="fixed"
                                              v-if="filedName.sendContents.length==4 &&(filedName.sendContents[0].value!=''||  filedName.sendContents[1].value!='' || filedName.sendContents[2].value!='' || filedName.sendContents[3].value!='')">
                                            <span @click="addContentFour(filedName,index)" class="addCorlor overflowContent addContentStyle">
                                                <span :style="{color:filedName.sendContents[0].color}">
                                                    {{filedName.sendContents[0].value}}
                                                </span>
                                                <span :style="{color:filedName.sendContents[1].color}">
                                                    {{filedName.sendContents[1].value}}
                                                </span>
                                                <span :style="{color:filedName.sendContents[2].color}">
                                                    {{filedName.sendContents[2].value}}
                                                </span>
                                                <span :style="{color:filedName.sendContents[3].color}">
                                                    {{filedName.sendContents[3].value}}
                                                </span>
                                            </span>
                                            <span class="icon icon-duoxingwenben"></span>
                                        </span>
                                        <!---->
                                    </span>
                                    <!--此时有五个值-->
                                    <span v-else-if="filedName.key.length==5">
                                        <span v-if="filedName.sendContents[0].value==''&& filedName.sendContents[1].value==''&&filedName.sendContents[2].value==''&& filedName.sendContents[3].value==''&& filedName.sendContents[4].value==''"
                                              class="icon icon-plus addPosition clor"
                                              @click="addContentFive(filedName,index)">{{'template.content' | t}}</span>
                                        <span class="fixed"
                                              v-if="filedName.sendContents.length==5 &&(filedName.sendContents[0].value!=''||  filedName.sendContents[1].value!='' || filedName.sendContents[2].value!='' || filedName.sendContents[3].value!='' || filedName.sendContents[4].value!='')">
                                            <span @click="addContentFive(filedName,index)"
                                                  class="addCorlor overflowContent addContentStyle">
                                                <span :style="{color:filedName.sendContents[0].color}">
                                                    {{filedName.sendContents[0].value}}
                                                </span>
                                                <span :style="{color:filedName.sendContents[1].color}">
                                                    {{filedName.sendContents[1].value}}
                                                </span>
                                                <span :style="{color:filedName.sendContents[2].color}">
                                                    {{filedName.sendContents[2].value}}
                                                </span>
                                                <span :style="{color:filedName.sendContents[3].color}">
                                                    {{filedName.sendContents[3].value}}
                                                </span>
                                                <span :style="{color:filedName.sendContents[4].color}">
                                                    {{filedName.sendContents[4].value}}
                                                </span>
                                            </span>
                                            <span class="icon icon-duoxingwenben"></span>
                                        </span>
                                        <!---->
                                    </span>
                                </span>
                            </span>
                        </div>
                    </div>
                </div>
                <!--<div class="searchContent"><span class="boxSearch"><i class="icon icon-search" v-title:left="'预览'"-->
                <!--@click="confirms=true"></i></span></div>-->
            </div>
            <div class="template-box">
                <div class="example">{{'template.example' | t}}</div>
                <div class="details-data">
                    <p class="details-example" v-for="example in detailsData.example">{{example}}</p>
                </div>
            </div>
        </div>
        <inline-loading v-if="loading"></inline-loading>
        <div class="footer">
            <div class="content-view">
                <router-link :to="{name: 'myTemplate'}" class="pull-left light-content-text">{{'common.cancel' | t}}
                </router-link>
                {{'template.warnMsg1' | t}}
                <a class="blue-text" href="https://mp.weixin.qq.com/wiki?t=resource/res_main&id=mp1433751288"
                   target="_blank">{{'template.warnMsg2' | t}}</a>，
                {{'template.warnMsg3' | t}}
                <div class="pull-right">
                    <span class="btn theme-text" @click="testTemplate">{{'template.test' | t}}</span>
                    <button type="button" class="btn btn-md btn-theme" @click="finish" :disabled="!able">
                        {{'common.complete' | t}}
                    </button>
                </div>
            </div>
        </div>

        <!-- 跳转设置 -->
        <confirm :title="$t('template.jumpSet')" v-if="redirectModalOpen" @cancel="cancel" @confirm="sure" size="lg">
            <div class="form-field">
                <checkbox :value="redirectType" source="url" @input="changeRedirectType('url')">
                    {{'template.toUrl'| t}}
                </checkbox>
                <input class="input lg" type="text" :placeholder="$t('template.urlAddr')" v-model.trim="url"
                       :disabled="redirectType[0] !== 'url'">
            </div>
            <div class="form-field">
                <checkbox :value="redirectType" source="miniAPP" @input="changeRedirectType('miniAPP')">
                    {{'template.toApplet' | t}}
                </checkbox>
                <selector class="to-applet-select" 
                    :class="{error: errorMiniprogramText}"
                    v-title:top.line.warn="errorMiniprogramText" 
                    @select="select($event)"
                    :disabled="redirectType[0] !== 'miniAPP'" 
                    :placeholder="$t('wechatContent.chooseMiniprogram')" 
                    :options="miniprogramList" 
                    :uniqueKey="'miniprogramId'" 
                    v-model="miniprogramId"></selector>
                </selector>
                <template v-if="miniprogramId === 0">
                    <input class="input" v-title:top.warn.line="inputAppid" @focusin="inputAppid = ''"
                        :class="{error: inputAppid}" type="text" :placeholder="$t('template.appletId')" v-model.trim="appId"
                        :disabled="redirectType[0] !== 'miniAPP'">
                    <input type="text" class="input" v-title:top.warn.line="appletAddr"
                            :class="{error: appletAddr}" :placeholder="$t('template.appletAddr')" v-model.trim="appUrl"
                            :disabled="redirectType[0] !== 'miniAPP'" @focusin="appletAddr = ''">
                    <input type="text" class="input" v-title:top="(alternativeAppUrl || redirectType[0]) !== 'miniAPP' ? '':  $t('template.inputAlternatePage')"
                            :placeholder="$t('template.alternatePageUrl')" v-model.trim="alternativeAppUrl"
                            :disabled="redirectType[0] !== 'miniAPP'">
                    <button type="button" class="action-icon icon icon-help"
                            v-title:right="$t('template.appletMsg')"></button>
                </template>
            </div>
            <div class="form-field">
                <checkbox :value="redirectType" source="questionnaire" @input="changeRedirectType('questionnaire')">
                    {{'template.toForm' | t}}
                </checkbox>
                <questionnaire-picker v-if="redirectType[0] === 'questionnaire'"
                                      :custom-id="customId" v-model='paperId'
                                      :form-extend="formExtendValue"
                                      use="template"
                                      @select="selectForm"
                                      @selectExtended="setFormExtended"
                                      @selectCustom="selectCustomForm"/>
            </div>
        </confirm>

        <!--编辑内容-->
        <confirm :title="$t('template.contentEdit')" v-if="edit" @cancel="cancels" @confirm="sures" size="lg">
            <div class="form-field">
                <label for="parameter" class="label">{{'template.tempContent' | t}}</label>
                <input class="input" type="text" id="parameter" readonly="readonly" :value="parameter">
            </div>
            <div class="form-field">
                <label class="label" for="keyValue">{{'template.tempValue' | t}}</label>
                <input class="input" type="text" id="keyValue" readonly="readonly" :value="'{{'+keyValue+'.DATA}}'">
                <selector :options="fildList" :placeholder="$t('template.insertField')" @select="insertField" :blurCleanKeyWord="false"
                          v-model="fieldsId" @load="loadMoreFildList" :search="'async'" @search="searchFildList"></selector>
                <color-picker v-model="color"></color-picker>
            </div>
            <div class="form-field flex">
                <label class="label placeholder"></label>
                <textarea @keydown.stop class="textarea" :style="{color:color}" v-model="materialContent"
                          ref="textarea" :placeholder="$t('template.tempContent')"></textarea>
                <!--<p class="content-count">长度约为 <span style="color: #8fdbcf">{{contentCount}}</span> 字</p>-->
            </div>
        </confirm>

        <!--编辑两个值-->
        <confirm :title="$t('template.contentEdit')" v-if="editTwo" @cancel="cancelsTwo" @confirm="suresTwo" size="lg">
            <div class="form-field">
                <label for="parameter2" class="label">{{'template.tempContent' | t}}</label>
                <input class="input" type="text" id="parameter2" readonly="readonly" :value="parameter">
            </div>
            <!--第一个值-->
            <div class="form-field">
                <label class="label" for="keyValue2">{{'template.tempValue' | t}}</label>
                <input class="input" type="text" id="keyValue2" readonly="readonly"
                       :value="'{{'+keyTwo[0]+'.DATA}}'">
                <selector :options="fildList" :placeholder="$t('template.insertField')" @select="insertField"
                          v-model="fieldsId" @load="loadMoreFildList"></selector>
                <color-picker v-model="color"></color-picker>
            </div>
            <div class="form-field flex">
                <label class="label placeholder"></label>
                <textarea @keydown.stop class="textarea" :style="{color:color}" v-model="materialContent"
                          ref="textarea" :placeholder="$t('template.tempContent')"></textarea>
                <!--<p class="content-count">长度约为 <span style="color: #8fdbcf">{{contentCount}}</span> 字</p>-->
            </div>
            <!--第二个值-->
            <div class="form-field">
                <label class="label" for="keyValue2-2">{{'template.tempValue' | t}}</label>
                <input class="input" type="text" id="keyValue2-2" readonly="readonly"
                       :value="'{{'+keyTwo[1]+'.DATA}}'">
                <selector :options="fildList" :placeholder="$t('template.insertField')" @select="insertFieldTwo"
                          v-model="fieldsIds" @load="loadMoreFildList"></selector>
                <color-picker v-model="colorTwo"></color-picker>
            </div>
            <div class="form-field flex">
                <label class="label placeholder"></label>
                <textarea @keydown.stop class="textarea" :style="{color:colorTwo}" id="materialContents"
                          v-model="materialContents"
                          ref="textareaTwo"
                          :placeholder="$t('template.tempContent')"></textarea>
                <!--<p class="content-count">长度约为 <span style="color: #8fdbcf">{{contentCount}}</span> 字</p>-->
            </div>
        </confirm>

        <!--编译三个值-->
        <confirm :title="$t('template.contentEdit')" v-if="editThree" @cancel="cancelsThree" @confirm="suresThree"
                 size="lg">
            <div class="form-field">
                <label for="parameter3" class="label">{{'template.tempContent' | t}}</label>
                <input class="input" type="text" id="parameter3" readonly="readonly" :value="parameter">
            </div>
            <!--第一个值-->
            <div class="form-field">
                <label class="label" for="keyValue3-1">{{'template.tempValue' | t}}</label>
                <input class="input" type="text" id="keyValue3-1" readonly="readonly"
                       :value="'{{'+keyThree[0]+'.DATA}}'">
                <selector :options="fildList" :placeholder="$t('template.insertField')" @select="insertField"
                          v-model="fieldsId" @load="loadMoreFildList"></selector>
                <color-picker v-model="color"></color-picker>
            </div>
            <div class="form-field flex">
                <label class="label placeholder"></label>
                <textarea @keydown.stop class="textarea" :style="{color:color}" v-model="materialContent" ref="textarea"
                          :placeholder="$t('template.tempContent')"></textarea>
                <!--<p class="content-count">长度约为 <span style="color: #8fdbcf">{{contentCount}}</span> 字</p>-->
            </div>
            <!--第二个值-->
            <div class="form-field">
                <label class="label" for="keyValue3-2">{{'template.tempValue' | t}}</label>
                <input class="input" type="text" id="keyValue3-2" readonly="readonly"
                       :value="'{{'+keyThree[1]+'.DATA}}'">

                <selector :options="fildList" :placeholder="$t('template.insertField')" @select="insertFieldTwo"
                          v-model="fieldsIds" @load="loadMoreFildList"></selector>
                <color-picker v-model="colorTwo"></color-picker>
            </div>
            <div class="form-field flex">
                <label class="label placeholder"></label>
                <textarea @keydown.stop :style="{color:colorTwo}" v-model="materialContents"
                          ref="textareaTwo"
                          :placeholder="$t('template.tempContent')"></textarea>
                <!--<p class="content-count">长度约为 <span style="color: #8fdbcf">{{contentCount}}</span> 字</p>-->
            </div>
            <!--第三个值-->
            <div class="form-field">
                <label class="label" for="keyValue3-3">{{'template.tempValue' | t}}</label>
                <input class="input" type="text" id="keyValue3-3" readonly="readonly"
                       :value="'{{'+keyThree[2]+'.DATA}}'">

                <selector :options="fildList" :placeholder="$t('template.insertField')" @select="insertFieldThree"
                          v-model="fieldsIdThree" @load="loadMoreFildList"></selector>
                <color-picker v-model="colorThree"></color-picker>
            </div>
            <div class="form-field flex">
                <label class="label placeholder"></label>
                <textarea @keydown.stop class="textarea" :style="{color:colorThree}" v-model="materialContentThree"
                          ref="textareaThree"
                          :placeholder="$t('template.tempContent')"></textarea>
                <!--<p class="content-count">长度约为 <span style="color: #8fdbcf">{{contentCount}}</span> 字</p>-->
            </div>
        </confirm>

        <!--编译四个值-->
        <confirm :title="$t('template.contentEdit')" v-if="editFour" @cancel="cancelsFour" @confirm="suresFour"
                 size="lg">
            <div class="form-field">
                <label for="parameter4" class="label">{{'template.tempContent' | t}}</label>
                <input class="input" type="text" id="parameter4" readonly="readonly" v-model="parameter">
            </div>
            <!--第一个值-->
            <div class="form-field">
                <label for="keyValue4-1" class="label">{{'template.tempValue' | t}}</label>
                <input class="input" type="text" id="keyValue4-1" readonly="readonly"
                       :value="'{{'+keyFour[0]+'.DATA}}'">
                <selector :options="fildList" :placeholder="$t('template.insertField')" @select="insertField"
                          v-model="fieldsId" @load="loadMoreFildList"></selector>
                <color-picker v-model="color"></color-picker>
            </div>
            <div class="form-field">
                <label class="label placeholder"></label>
                <textarea @keydown.stop class="textarea" :style="{color:color}" v-model="materialContent"
                          ref="textarea"
                          :placeholder="$t('template.tempContent')"></textarea>
                <!--<p class="content-count">长度约为 <span style="color: #8fdbcf">{{contentCount}}</span> 字</p>-->
            </div>
            <!--第二个-->
            <div class="form-field">
                <label for="keyValue4-2" class="label">{{'template.tempValue' | t}}</label>
                <input class="input" type="text" id="keyValue4-2" readonly="readonly"
                       :value="'{{'+keyFour[1]+'.DATA}}'">
                <selector :options="fildList" :placeholder="$t('template.insertField')" @select="insertFieldTwo"
                          v-model="fieldsIds" @load="loadMoreFildList"></selector>
                <color-picker v-model="colorTwo"></color-picker>
            </div>
            <div class="form-field">
                <label class="label placeholder"></label>
                <textarea @keydown.stop class="textarea" :style="{color:colorTwo}" v-model="materialContents"
                          ref="textareaTwo"
                          :placeholder="$t('template.tempContent')"></textarea>
                <!--<p class="content-count">长度约为 <span style="color: #8fdbcf">{{contentCount}}</span> 字</p>-->
            </div>
            <!--第三个值-->
            <div class="form-field">
                <label for="keyValue4-3" class="label">{{'template.tempValue' | t}}</label>
                <input class="input" type="text" id="keyValue4-3" readonly="readonly"
                       :value="'{{'+keyFour[2]+'.DATA}}'">
                <selector :options="fildList" :placeholder="$t('template.insertField')" @select="insertFieldThree"
                          v-model="fieldsIdThree" @load="loadMoreFildList"></selector>
                <color-picker v-model="colorThree"></color-picker>
            </div>
            <div class="form-field">
                <label class="label placeholder"></label>
                <textarea @keydown.stop class="textarea" :style="{color:colorThree}" v-model="materialContentThree"
                          ref="textareaThree"
                          :placeholder="$t('template.tempContent')"></textarea>
                <!--<p class="content-count">长度约为 <span style="color: #8fdbcf">{{contentCount}}</span> 字</p>-->
            </div>
            <!--第四个值-->
            <div class="form-field">
                <label for="keyValue4-4" class="label">{{'template.tempValue' | t}}</label>
                <input class="input" type="text" id="keyValue4-4" readonly="readonly"
                       :value="'{{'+keyFour[3]+'.DATA}}'">
                <selector :options="fildList" :placeholder="$t('template.insertField')" @select="insertFieldFour"
                          v-model="fieldsIdFour" @load="loadMoreFildList"></selector>
                <color-picker v-model="colorFour"></color-picker>
            </div>
            <div class="form-field">
                <label class="label placeholder"></label>
                <textarea @keydown.stop class="textarea" :style="{color:colorFour}" v-model="materialContentFour"
                          ref="textareaFour"
                          :placeholder="$t('template.tempContent')"></textarea>
                <!--<p class="content-count">长度约为 <span style="color: #8fdbcf">{{contentCount}}</span> 字</p>-->
            </div>
        </confirm>

        <!--编译五个值-->
        <confirm :title="$t('template.contentEdit')" v-if="editFive" @cancel="cancelsFive" @confirm="suresFive"
                 size="lg">
            <div class="form-field">
                <label for="parameter5" class="label">{{'template.tempContent' | t}}</label>
                <input class="input" type="text" id="parameter5" readonly="readonly" v-model="parameter">
            </div>
            <!--第一个值-->
            <div class="form-field">
                <label for="keyValue5-1" class="label">{{'template.tempValue' | t}}</label>
                <input class="input" type="text" id="keyValue5-1" readonly="readonly"
                       :value="'{{'+keyFive[0]+'.DATA}}'">
                <selector :options="fildList" :placeholder="$t('template.insertField')" @select="insertField"
                          v-model="fieldsId" @load="loadMoreFildList"></selector>
                <color-picker v-model="color"></color-picker>
            </div>
            <div class="form-field">
                <label class="label placeholder"></label>
                <textarea @keydown.stop class="textarea" :style="{color:color}" v-model="materialContent"
                          ref="textarea"
                          :placeholder="$t('template.tempContent')"></textarea>
                <!--<p class="content-count">长度约为 <span style="color: #8fdbcf">{{contentCount}}</span> 字</p>-->
            </div>
            <!--第二个-->
            <div class="form-field">
                <label for="keyValue5-2" class="label">{{'template.tempValue' | t}}</label>
                <input class="input" type="text" id="keyValue5-2" readonly="readonly"
                       :value="'{{'+keyFive[1]+'.DATA}}'">
                <selector :options="fildList" :placeholder="$t('template.insertField')" @select="insertFieldTwo"
                          v-model="fieldsIds" @load="loadMoreFildList"></selector>
                <color-picker v-model="colorTwo"></color-picker>
            </div>
            <div class="form-field">
                <label class="label placeholder"></label>
                <textarea @keydown.stop class="textarea" :style="{color:colorTwo}" v-model="materialContents"
                          ref="textareaTwo" :placeholder="$t('template.tempContent')"></textarea>
                <!--<p class="content-count">长度约为 <span style="color: #8fdbcf">{{contentCount}}</span> 字</p>-->
            </div>
            <!--第三个值-->
            <div class="form-field">
                <label for="keyValue5-3" class="label">{{'template.tempValue' | t}}</label>
                <input class="input" type="text" id="keyValue5-3" readonly="readonly"
                       :value="'{{'+keyFive[2]+'.DATA}}'">
                <selector :options="fildList" :placeholder="$t('template.insertField')" @select="insertFieldThree"
                          v-model="fieldsIdThree" @load="loadMoreFildList"></selector>
                <color-picker v-model="colorThree"></color-picker>
            </div>
            <div class="form-field">
                <label class="label placeholder"></label>
                <textarea @keydown.stop class="textarea" :style="{color:colorThree}" v-model="materialContentThree"
                          ref="textareaThree" :placeholder="$t('template.tempContent')"></textarea>
                <!--<p class="content-count">长度约为 <span style="color: #8fdbcf">{{contentCount}}</span> 字</p>-->
            </div>
            <!--第四个值-->
            <div class="form-field">
                <label for="keyValue5-4" class="label">{{'template.tempValue' | t}}</label>
                <input class="input" type="text" id="keyValue5-4" readonly="readonly"
                       :value="'{{'+keyFive[3]+'.DATA}}'">
                <selector :options="fildList" :placeholder="$t('template.insertField')" @select="insertFieldFour"
                          v-model="fieldsIdFour" @load="loadMoreFildList"></selector>
                <color-picker v-model="colorFour"></color-picker>
            </div>
            <div class="form-field">
                <label class="label placeholder"></label>
                <textarea @keydown.stop class="textarea" :style="{color:colorFour}" v-model="materialContentFour"
                          ref="textareaFour" :placeholder="$t('template.tempContent')"></textarea>
                <!--<p class="content-count">长度约为 <span style="color: #8fdbcf">{{contentCount}}</span> 字</p>-->
            </div>
            <!--第五个值-->
            <div class="form-field">
                <label for="keyValue5-5" class="label">{{'template.tempValue' | t}}</label>
                <input class="input" type="text" id="keyValue5-5" readonly="readonly"
                       :value="'{{'+keyFive[4]+'.DATA}}'">
                <selector :options="fildList" :placeholder="$t('template.insertField')" @select="insertFieldFive"
                          v-model="fieldsIdFive" @load="loadMoreFildList"></selector>
                <color-picker v-model="colorFive"></color-picker>
            </div>
            <div class="form-field">
                <label class="label placeholder"></label>
                <textarea @keydown.stop class="textarea" :style="{color:colorFive}" v-model="materialContentFive"
                          ref="textareaFive"
                          :placeholder="$t('template.tempContent')"></textarea>
                <!--<p class="content-count">长度约为 <span style="color: #8fdbcf">{{contentCount}}</span> 字</p>-->
            </div>
        </confirm>

        <!--预览-->
        <!--<modal v-if="confirms" size="lg" :title="'模板消息预览 - New'+ newTime" @close="closeGoods">-->
        <!--<div>-->
        <!--<p style="margin-bottom: 20px" v-for="example in detailsData.example">{{example}}</p>-->
        <!--<div class="preview">-->
        <!--<input style="margin: 0 auto;" type="button" class="btn btn-md btn-theme "-->
        <!--@click="confirms=false" value="关闭"/>-->
        <!--</div>-->
        <!--</div>-->
        <!--</modal>-->
        <!--粉丝测试-->
       <template-test-modal v-if="test" :controller="controller"
                              :material-id="id"
                              :accountId="officialId"
                              ref="testModal"
                              @close="test = false"/>
    </div>
</template>
<script type="text/babel">
    import QuestionnairePicker from '../../journey/material/questionnaire-picker.vue';
    import getCursorPosition from '../../common/utils/cursorPosition';
    import format from 'date-fns/format';
    import {trackEvent} from '../../monitor';
    import {COMMON_URL_REGEXP} from '../../common/utils/regs';
    import TemplateTestModal from '@/journey/draggable-form/canvas/controller/sub-controllers/wechat-controller/temp-test-modal.vue';
    import { ContactApiV1, WechatApiV1 } from '@/api';

    export default {
        components: {
            QuestionnairePicker,
            TemplateTestModal
        },
        created() {
            this.id = this.$route.query.id;

            WechatApiV1
                .templateDetails(this.id)
                .then(res => {
                    this.detailsData = res.body.data.wxTemplate;
                    this.url =  res.body.data.wxTemplate.miniProgram === 0 ?  res.body.data.wxTemplate.url : '';
                    this.appId = res.body.data.wxTemplate.appId;
                    this.appUrl = res.body.data.wxTemplate.pagePath;
                    this.paperId = res.body.data.wxTemplate.paperId;
                    this.miniprogramId = res.body.data.wxTemplate.miniprogramId;
                    this.alternativeAppUrl = res.body.data.wxTemplate.miniProgram === 1 ?  res.body.data.wxTemplate.url : '';
                    // 2.5.5表单添加自定义表单 兼容老数据
                    if (res.body.data.wxTemplate.formName) {
                        this.formName = res.body.data.wxTemplate.formName.split(' ')[0];
                        this.formExtendValueName = res.body.data.wxTemplate.formName.split(' ')[1];
                    }
                    this.customFormUrl = res.body.data.wxTemplate.customSheetUrl || '';
                    this.formExtendValue = res.body.data.wxTemplate.extensionValueId || null;
                    this.customId = res.body.data.wxTemplate.customFormId || null;
                    if (this.url) {
                        this.redirectType[0] = 'url';
                    } else if (this.appId && this.appUrl || this.alternativeAppUrl) {
                        this.redirectType[0] = 'miniAPP';
                    } else if (this.paperId && this.paperId !== -1) {
                        this.redirectType[0] = 'questionnaire';
                    }
                    for (let content of this.detailsData.content) {
                        if (Number(content.status) === 1) {
                            if (content.sendContent.length === 0) {
                                content.sendContents = content.key.map(() => {
                                    let tag = {};
                                    tag.value = '';
                                    tag.color = '';
                                    return tag;
                                });
                            } else {
                                content.sendContents = content.sendContent.map((key, index) => {
                                    let tag = {};
                                    tag.value = key[content.key[index].trim()].value;
                                    tag.color = key[content.key[index].trim()].color;
                                    return tag;
                                });
                            }
                        }
                    }

                    this.$set(this.$data, 'contentList', this.detailsData.content);
                    // 计算模板内容的长度
                    this.contentLenght = 0;
                    this.contentList.forEach(e => {
                        if (e.key != null) {
                            e.sendContents.forEach(a => {
                                this.contentLenght += a.value.length;
                            });
                        }

                    });

                    if (this.redirectType[0]) {
                        this.setJumpTxt();
                    }
                    this.loading = false;
                });
            this.getFildList();
            this.getMiniprogramList();
        },
        data() {
            return {
                keyArry: [],
                editTwo: false,
                editThree: false,
                editFour: false,
                editFive: false,
                editSix: false,
                closeShows: true,
                pageNumber: 0,
                searchName: '',
                test: false,
                able: true,
                contentList: [],
                value: '',
                fildList: [{name: '未分组', id: 0,}],
                arr: [],
                showColorList: false,
                showColorListTwo: false,
                showColorListThree: false,
                showColorListFour: false,
                showColorListFive: false,
                showColorListSix: false,

                fieldsId: '',
                fieldsIds: '',
                fieldsIdThree: '',
                fieldsIdFour: '',
                fieldsIdFive: '',
                fieldsIdSix: '',
                materialContent: '',
                materialContents: '',
                materialContentThree: '',
                materialContentFour: '',
                materialContentFive: '',
                materialContentSix: '',
                color: '',
                parameter: '',
                id: '',
                loading: true,
                detailsData: {
                    status: 0,
                    nickName: ''
                },
                edit: false,

                // 跳转设置弹出层是否打开
                redirectModalOpen: false,
                // 跳转设置选中了哪种方式
                redirectType: [],
                // 跳转设置一：URL
                url: '',
                // 跳转设置二：小程序
                appId: '',
                appUrl: '',
                alternativeAppUrl: '',
                // 跳转设置三：表单
                paperId: -1,

                confirms: false,
                newTime: format(new Date(), 'YYYY-MM-DD HH:mm:ss'),
                indexGood: 0,
                jsonObject: {},
                contentLenght: 0,
                keyValue: '',
                keyTwo: [],
                keyThree: [],
                keyFour: [],
                keyFive: [],
                keySix: [],
                colorTwo: '',
                colorThree: '',
                colorFour: '',
                colorFive: '',
                colorSix: '',
                indexGoodTwo: '',
                indexGoodThree: '',
                indexGoodFour: '',
                indexGoodFive: '',
                indexGoodSix: '',
                fieldKeyWord: '',   // 自定义字段列表搜索关键字
                fildPageNo: 1,      // 自定义字段列表页码
                fildTotalPage: 0,   // 自定义字段列表总页码
                customId: null,             // 自定义表单id
                customFormUrl: '',          // 自定义表单链接
                formExtendValue: null,      // 表单扩展值
                formName: '',               // 表单名称（源、自定义）
                formExtendValueName: '',    // 表单扩展值名称
                jumpTxt: '',
                jumpValue: '',
                inputAppid: '',
                appletAddr: '',
                errorMiniprogramText:'',    //选择小程序为空的提示
                controller: {pushInfo: {wechatType: 'wechatTest'}}, //传入modal框标题名
                miniprogramList: [          //小程序列表
                    {miniprogramId: 0, name: this.$t('wechatContent.otherMiniprogram')}
                ],
                miniprogramId: '',          //小程序id
            };
        },
        computed: {
            officialId() {
                return this.$store.state.user.authorizerInfoId;
            }
        },
        methods: {
            changeRedirectType(type) {
                if (this.redirectType[0] === type) {
                    this.redirectType = [];
                    this.clearAllJump();
                } else {
                    this.redirectType = [type];
                    switch (type) {
                        case 'url':
                            this.appId = '';
                            this.appUrl = '';
                            this.alternativeAppUrl = '';
                            this.clearForm();
                            this.vaildAppid();
                            break;
                        case 'miniAPP':
                            this.url = '';
                            this.clearForm();
                            break;
                        case 'questionnaire':
                            this.url = '';
                            this.appId = '';
                            this.appUrl = '';
                            this.alternativeAppUrl = '';
                            this.vaildAppid();
                            break;
                        default:
                            this.clearAllJump();
                    }
                }
            },
            // 测试
            testTemplate() {
                // 保存模板
                if (this.contentLenght > 1000) {
                    this.$toast(this.$t('template.contentWarn'), 'warn');
                    return false;
                }
                for (let contents of this.detailsData.content) {
                    if (contents.key != null) {
                        contents.jsonObjects = contents.key.map((key, index) => ({
                            [key.trim()]: {
                                value: contents.sendContents[index].value,
                                color: contents.sendContents[index].color
                            },
                        }));
                    }
                }
                this.jsonObject = [];
                for (let contents of this.detailsData.content) {
                    if (contents.key != null) {
                        contents.jsonObjects.forEach(e => {
                            let a = e;
                            this.jsonObject.push(a);
                        });
                    }

                }
                let tests = JSON.stringify(this.jsonObject);
                if (this.contentLenght.length > 1000) {
                    this.$toast(this.$t('template.lessThan1000'), 'warn');
                    return;
                }
                // 发送保存内容
                WechatApiV1
                    .templateSave(
                        this.id,
                        this.appId,
                        this.appUrl === '' ? 0 : 1,
                        this.appUrl,
                        tests,
                        this.url ? this.url : this.alternativeAppUrl,
                        this.paperId,
                        this.customId,
                        this.customFormUrl,
                        this.formExtendValue,
                        this.formName + ' ' + this.formExtendValueName,
                        this.miniprogramId,
                    )
                    .then(() => {
                        this.$toast(this.$t('common.saveSuccess'), 'success');
                        this.test = true;
                        this.pageNumber = 1;
                    });
            },
            finish() {
                if (this.contentLenght > 1000) {
                    this.$toast(this.$t('template.contentWarn'), 'warn');
                    return false;
                }
                this.able = false;
                for (let contents of this.detailsData.content) {
                    if (contents.key != null) {
                        contents.jsonObjects = contents.key.map((key, index) => ({
                            [key.trim()]: {
                                value: contents.sendContents[index].value,
                                color: contents.sendContents[index].color
                            },
                        }));
                    }
                }
                this.jsonObject = [];
                for (let contents of this.detailsData.content) {
                    if (contents.key != null) {
                        contents.jsonObjects.forEach(e => {
                            this.jsonObject.push(e);
                        });
                    }

                }
                let tests = JSON.stringify(this.jsonObject);
                if (this.contentLenght.length > 1000) {
                    this.$toast(this.$t('template.lessThan1000'), 'warn');
                    return;
                }
                // 发送保存内容
                WechatApiV1
                    .templateSave(
                        this.id,
                        this.appId,
                        this.appUrl === '' ? 0 : 1,
                        this.appUrl,
                        tests,
                        this.url ? this.url : this.alternativeAppUrl,
                        this.paperId,
                        this.customId,
                        this.customFormUrl,
                        this.formExtendValue,
                        this.formName + ' ' + this.formExtendValueName,
                        this.miniprogramId,
                    )
                    .then(() => {
                        this.$toast(this.$t('common.saveSuccess'), 'success');
                        trackEvent('微信管理-模板管理-保存模板');
                        this.able = true;
                        this.$router.go(-1);
                    })
                    .catch(() => {
                        this.able = true;
                    });

            },
            //预览弹窗
            // closeGoods() {
            //     this.confirms = false;
            // },
            setting() {
                this.redirectModalOpen = true;
                this.vaildAppid();
                // cache settings
                this.redirectCache = {
                    redirectType: this.redirectType.slice(),
                    url: this.url,
                    appId: this.appId,
                    appUrl: this.appUrl,
                    paperId: this.paperId,
                    customId: this.customId,
                    customFormUrl: this.customFormUrl,
                    formName: this.formName,
                    formExtendValue: this.formExtendValue,
                    formExtendValueName: this.formExtendValueName,
                    alternativeAppUrl: this.alternativeAppUrl,
                };
            },
            cancel() {
                this.redirectModalOpen = false;
                // recover cache
                this.redirectType = this.redirectCache.redirectType.slice();
                this.url = this.redirectCache.url;
                this.appId = this.redirectCache.appId;
                this.appUrl = this.redirectCache.appUrl;
                this.paperId = this.redirectCache.paperId;
                this.customId = this.redirectCache.customId;
                this.customFormUrl = this.redirectCache.customFormUrl;
                this.formName = this.redirectCache.formName;
                this.formExtendValue = this.redirectCache.formExtendValue;
                this.formExtendValueName = this.redirectCache.formExtendValueName;
                this.alternativeAppUrl = this.redirectCache.alternativeAppUrl;
                this.miniprogramId = '';
            },
            sure() {
                // 跳转URL、跳转小程序、表单 三选一校验
                // url
                if (this.redirectType[0] === 'url' && !this.url) {
                    return this.$toast(this.$t('template.urlWarn'), 'warn');
                }
                // 小程序
                if (this.redirectType[0] === 'miniAPP' && !(this.appId && this.appUrl)) {
                    this.$toast(this.$t('template.appletSet'), 'warn');
                    this.vaildAppid();
                    return false;
                }
                if (this.redirectType[0] === 'questionnaire' && !this.paperId) {
                    return this.$toast(this.$t('template.formWarn'), 'warn');
                }
                if (this.redirectType[0] === 'miniAPP' && (this.alternativeAppUrl)) {
                    if (!COMMON_URL_REGEXP.test(this.alternativeAppUrl)){
                        return this.$toast(this.$t('template.alternativeAppUrl'), 'warn');
                    }
                }
                this.setJumpTxt();
                this.redirectModalOpen = false;
            },
            addContent(e, index) {
                this.edit = true;
                this.indexGood = index;
                this.parameter = e.content;
                this.keyValue = e.key[0];
                this.materialContent = this.contentList[this.indexGood].sendContents[0].value;
                this.color = this.contentList[this.indexGood].sendContents[0].color;
                this.color = this.contentList[this.indexGood].sendContents[0].color;
            },
            addContentTwo(e, index) {
                this.editTwo = true;
                this.keyTwo = e.key;
                this.parameter = e.content;
                this.indexGoodTwo = index;
                // 编内容赋值
                this.materialContent = this.contentList[this.indexGoodTwo].sendContents[0].value;
                this.color = this.contentList[this.indexGoodTwo].sendContents[0].color;
                this.color = this.contentList[this.indexGoodTwo].sendContents[0].color;
                this.materialContents = this.contentList[this.indexGoodTwo].sendContents[1].value;
                this.colorTwo = this.contentList[this.indexGoodTwo].sendContents[1].color;
                // this.color = this.contentList[this.indexGoodTwo].sendContents[1].color;
            },
            addContentThree(e, index) {
                this.editThree = true;
                this.keyThree = e.key;
                this.parameter = e.content;
                this.indexGoodThree = index;
                // 编内容赋值
                this.materialContent = this.contentList[this.indexGoodThree].sendContents[0].value;
                this.color = this.contentList[this.indexGoodThree].sendContents[0].color;
                this.color = this.contentList[this.indexGoodThree].sendContents[0].color;
                this.materialContents = this.contentList[this.indexGoodThree].sendContents[1].value;
                this.colorTwo = this.contentList[this.indexGoodThree].sendContents[1].color;
                this.materialContentThree = this.contentList[this.indexGoodThree].sendContents[2].value;
                this.colorThree = this.contentList[this.indexGoodThree].sendContents[2].color;
            },
            addContentFour(e, index) {
                this.editFour = true;
                this.keyFour = e.key;
                this.parameter = e.content;
                this.indexGoodFour = index;
                // 编内容赋值
                this.materialContent = this.contentList[this.indexGoodFour].sendContents[0].value;
                this.color = this.contentList[this.indexGoodFour].sendContents[0].color;
                this.color = this.contentList[this.indexGoodFour].sendContents[0].color;
                this.materialContents = this.contentList[this.indexGoodFour].sendContents[1].value;
                this.colorTwo = this.contentList[this.indexGoodFour].sendContents[1].color;
                this.materialContentThree = this.contentList[this.indexGoodFour].sendContents[2].value;
                this.colorThree = this.contentList[this.indexGoodFour].sendContents[2].color;
                this.materialContentFour = this.contentList[this.indexGoodFour].sendContents[3].value;
                this.colorFour = this.contentList[this.indexGoodFour].sendContents[3].color;
            },
            addContentFive(e, index) {
                this.editFive = true;
                this.keyFive = e.key;
                this.parameter = e.content;
                this.indexGoodFive = index;
                // 编内容赋值
                this.materialContent = this.contentList[this.indexGoodFive].sendContents[0].value;
                this.color = this.contentList[this.indexGoodFive].sendContents[0].color;
                this.color = this.contentList[this.indexGoodFive].sendContents[0].color;
                this.materialContents = this.contentList[this.indexGoodFive].sendContents[1].value;
                this.colorTwo = this.contentList[this.indexGoodFive].sendContents[1].color;
                this.materialContentThree = this.contentList[this.indexGoodFive].sendContents[2].value;
                this.colorThree = this.contentList[this.indexGoodFive].sendContents[2].color;
                this.materialContentFour = this.contentList[this.indexGoodFive].sendContents[3].value;
                this.colorFour = this.contentList[this.indexGoodFive].sendContents[3].color;
                this.materialContentFive = this.contentList[this.indexGoodFive].sendContents[4].value;
                this.colorFive = this.contentList[this.indexGoodFive].sendContents[4].color;
            },
            cancels() {
                this.edit = false;
                this.fieldsId = '';
                this.showColorList = false;
                this.fieldKeyWord = '';
                this.fildPageNo = 1;
                this.getFildList();

            },
            cancelsTwo() {
                this.editTwo = false;
                this.fieldsIds = '';
                this.fieldsId = '';
                this.showColorListTwo = false;
                this.showColorList = false;
            },
            cancelsThree() {
                this.editThree = false;
                this.fieldsIds = '';
                this.fieldsId = '';
                this.fieldsIdThree = '';
                this.showColorListThree = false;
                this.showColorListTwo = false;
                this.showColorList = false;
            },
            cancelsFour() {
                this.editFour = false;
                this.fieldsIds = '';
                this.fieldsId = '';
                this.fieldsIdThree = '';
                this.fieldsIdFour = '';
                this.showColorListThree = false;
                this.showColorListTwo = false;
                this.showColorListFour = false;
                this.showColorList = false;
            },
            cancelsFive() {
                this.editFive = false;
                this.fieldsIds = '';
                this.fieldsId = '';
                this.fieldsIdThree = '';
                this.fieldsIdFour = '';
                this.fieldsIdFive = '';
                this.showColorListThree = false;
                this.showColorListTwo = false;
                this.showColorListFour = false;
                this.showColorListFive = false;
                this.showColorList = false;
            },
            cancelsSix() {
                this.editSix = false;
                this.fieldsIds = '';
                this.fieldsId = '';
                this.fieldsIdThree = '';
                this.fieldsIdFour = '';
                this.fieldsIdFive = '';
                this.fieldsIdSix = '';
                this.showColorListThree = false;
                this.showColorListTwo = false;
                this.showColorListFour = false;
                this.showColorListFive = false;
                this.showColorListSix = false;
                this.showColorList = false;
            },
            sures() {
                if (this.materialContent.length > 1000) {
                    this.$toast(this.$t('template.contentWarn'), 'warn');
                    return false;
                }
                this.showColorList = false;
                this.contentList[this.indexGood].sendContents[0].value = this.materialContent;
                if (this.contentList[this.indexGood].sendContents[0].value === '') {
                    this.contentList[this.indexGood].sendContents[0].color = '';
                } else {
                    this.contentList[this.indexGood].sendContents[0].color = this.color;
                }

                // 计算模板内容长度
                this.contentLenght = 0;
                this.contentList.forEach(e => {
                    if (e.key != null) {
                        e.sendContents.forEach(a => {
                            this.contentLenght += a.value.length;
                        });
                    }
                });
                this.edit = false;
                this.materialContent = '';
                this.color = '';
                this.fieldsId = '';
                this.fieldKeyWord = '';
                this.fildPageNo = 1;
                this.getFildList();
            },
            suresTwo() {
                if (this.materialContent.length > 1000 || this.materialContents.length > 1000) {
                    this.$toast(this.$t('template.contentWarn'), 'warn');
                    return false;
                }
                this.showColorListTwo = false;
                this.showColorList = false;
                this.contentList[this.indexGoodTwo].sendContents[0].value = this.materialContent;
                if (this.contentList[this.indexGoodTwo].sendContents[0].value === '') {
                    this.contentList[this.indexGoodTwo].sendContents[0].color = '';
                } else {
                    this.contentList[this.indexGoodTwo].sendContents[0].color = this.color;
                }

                this.contentList[this.indexGoodTwo].sendContents[1].value = this.materialContents;
                if (this.contentList[this.indexGoodTwo].sendContents[1].value === '') {
                    this.contentList[this.indexGoodTwo].sendContents[1].color = '';
                } else {
                    this.contentList[this.indexGoodTwo].sendContents[1].color = this.colorTwo;
                }

                // 计算模板内容长度
                this.contentLenght = 0;
                this.contentList.forEach(e => {
                    if (e.key != null) {
                        e.sendContents.forEach(a => {
                            this.contentLenght += a.value.length;
                        });
                    }

                });
                this.editTwo = false;
                this.materialContent = '';
                this.materialContents = '';
                this.color = '';
                this.fieldsId = '';
                this.color = '';
                this.colorTwo = '';
                this.fieldsIds = '';
            },
            suresThree() {
                // if (this.materialContent.length > 1000 || this.materialContents.length > 1000) {
                //     this.$toast(this.$t('template.contentWarn'));
                //     return false;
                // }
                this.showColorListTwo = false;
                this.showColorListThree = false;
                this.showColorList = false;
                this.contentList[this.indexGoodThree].sendContents[0].value = this.materialContent;
                if (this.contentList[this.indexGoodThree].sendContents[0].value === '') {
                    this.contentList[this.indexGoodThree].sendContents[0].color = '';
                } else {
                    this.contentList[this.indexGoodThree].sendContents[0].color = this.color;
                }
                this.contentList[this.indexGoodThree].sendContents[1].value = this.materialContents;
                if (this.contentList[this.indexGoodThree].sendContents[1].value === '') {
                    this.contentList[this.indexGoodTwo].sendContents[1].color = '';
                } else {
                    this.contentList[this.indexGoodThree].sendContents[1].color = this.colorTwo;
                }
                this.contentList[this.indexGoodThree].sendContents[2].value = this.materialContentThree;
                if (this.contentList[this.indexGoodThree].sendContents[2].value === '') {
                    this.contentList[this.indexGoodThree].sendContents[2].color = '';
                } else {
                    this.contentList[this.indexGoodThree].sendContents[2].color = this.colorThree;
                }
                // 计算模板内容长度
                this.contentLenght = 0;
                this.contentList.forEach(e => {
                    if (e.key != null) {
                        e.sendContents.forEach(a => {
                            this.contentLenght += a.value.length;
                        });
                    }

                });
                this.editThree = false;
                this.materialContent = '';
                this.materialContents = '';
                this.materialContentThree = '';
                this.color = '';
                this.fieldsId = '';
                this.color = '';
                this.colorTwo = '';
                this.colorThree = '';
                this.fieldsIds = '';
                this.fieldsIdThree = '';
            },
            suresFour() {
                this.showColorListTwo = false;
                this.showColorListThree = false;
                this.showColorListFour = false;
                this.showColorList = false;
                this.contentList[this.indexGoodFour].sendContents[0].value = this.materialContent;
                if (this.contentList[this.indexGoodFour].sendContents[0].value === '') {
                    this.contentList[this.indexGoodFour].sendContents[0].color = '';
                } else {
                    this.contentList[this.indexGoodFour].sendContents[0].color = this.color;
                }
                this.contentList[this.indexGoodFour].sendContents[1].value = this.materialContents;
                if (this.contentList[this.indexGoodFour].sendContents[1].value === '') {
                    this.contentList[this.indexGoodFour].sendContents[1].color = '';
                } else {
                    this.contentList[this.indexGoodFour].sendContents[1].color = this.colorTwo;
                }
                this.contentList[this.indexGoodFour].sendContents[2].value = this.materialContentThree;
                if (this.contentList[this.indexGoodFour].sendContents[2].value === '') {
                    this.contentList[this.indexGoodFour].sendContents[2].color = '';
                } else {
                    this.contentList[this.indexGoodFour].sendContents[2].color = this.colorThree;
                }
                this.contentList[this.indexGoodFour].sendContents[3].value = this.materialContentFour;
                if (this.contentList[this.indexGoodFour].sendContents[3].value === '') {
                    this.contentList[this.indexGoodFour].sendContents[3].color = '';
                } else {
                    this.contentList[this.indexGoodFour].sendContents[3].color = this.colorFour;
                }
                // 计算模板内容长度
                this.contentLenght = 0;
                this.contentList.forEach(e => {
                    if (e.key != null) {
                        e.sendContents.forEach(a => {
                            this.contentLenght += a.value.length;
                        });
                    }

                });
                this.editFour = false;
                this.materialContent = '';
                this.materialContents = '';
                this.materialContentThree = '';
                this.materialContentFour = '';
                this.color = '';
                this.fieldsId = '';
                this.color = '';
                this.colorTwo = '';
                this.colorThree = '';
                this.colorFour = '';
                this.fieldsIds = '';
                this.fieldsIdThree = '';
                this.fieldsIdFour = '';
            },
            suresFive() {
                this.showColorListTwo = false;
                this.showColorListThree = false;
                this.showColorListFour = false;
                this.showColorListFive = false;
                this.showColorList = false;
                this.contentList[this.indexGoodFive].sendContents[0].value = this.materialContent;
                if (this.contentList[this.indexGoodFive].sendContents[0].value === '') {
                    this.contentList[this.indexGoodFive].sendContents[0].color = '';
                } else {
                    this.contentList[this.indexGoodFive].sendContents[0].color = this.color;
                }
                this.contentList[this.indexGoodFive].sendContents[1].value = this.materialContents;
                if (this.contentList[this.indexGoodFive].sendContents[1].value === '') {
                    this.contentList[this.indexGoodFive].sendContents[1].color = '';
                } else {
                    this.contentList[this.indexGoodFive].sendContents[1].color = this.colorTwo;
                }
                this.contentList[this.indexGoodFive].sendContents[2].value = this.materialContentThree;
                if (this.contentList[this.indexGoodFive].sendContents[2].value === '') {
                    this.contentList[this.indexGoodFive].sendContents[2].color = '';
                } else {
                    this.contentList[this.indexGoodFive].sendContents[2].color = this.colorThree;
                }
                this.contentList[this.indexGoodFive].sendContents[3].value = this.materialContentFour;
                if (this.contentList[this.indexGoodFive].sendContents[3].value === '') {
                    this.contentList[this.indexGoodFive].sendContents[3].color = '';
                } else {
                    this.contentList[this.indexGoodFive].sendContents[3].color = this.colorFour;
                }
                this.contentList[this.indexGoodFive].sendContents[4].value = this.materialContentFive;
                if (this.contentList[this.indexGoodFive].sendContents[4].value === '') {
                    this.contentList[this.indexGoodFive].sendContents[4].color = '';
                } else {
                    this.contentList[this.indexGoodFive].sendContents[4].color = this.colorFive;
                }
                // 计算模板内容长度
                this.contentLenght = 0;
                this.contentList.forEach(e => {
                    if (e.key != null) {
                        e.sendContents.forEach(a => {
                            this.contentLenght += a.value.length;
                        });
                    }

                });
                this.editFive = false;
                this.materialContent = '';
                this.materialContents = '';
                this.materialContentThree = '';
                this.materialContentFour = '';
                this.materialContentFive = '';
                this.color = '';
                this.fieldsId = '';
                this.color = '';
                this.colorTwo = '';
                this.colorThree = '';
                this.colorFour = '';
                this.colorFive = '';
                this.fieldsIds = '';
                this.fieldsIdThree = '';
                this.fieldsIdFour = '';
                this.fieldsIdFive = '';
            },
            insertField({field}) {
                let targetPos = getCursorPosition(this.$refs.textarea);
                let content = [...this.materialContent];

                if (content.length + ('{$' + field + '}').length > 1000) {
                    this.$toast(this.$t('template.contentTooLong'), 'warn');
                    return false;
                }
                content.splice(targetPos, 0, '{$' + field + '}');
                this.materialContent = content.join('');
            },
            insertFieldTwo({field}) {
                let targetPos = getCursorPosition(this.$refs.textareaTwo);
                let content = [...this.materialContents];

                if (content.length + ('{$' + field + '}').length > 1000) {
                    this.$toast(this.$t('template.contentTooLong'), 'warn');
                    return false;
                }
                content.splice(targetPos, 0, '{$' + field + '}');
                this.materialContents = content.join('');
            },
            insertFieldThree({field}) {
                let targetPos = getCursorPosition(this.$refs.textareaThree);
                let content = [...this.materialContentThree];

                if (content.length + ('{$' + field + '}').length > 1000) {
                    this.$toast(this.$t('template.contentTooLong'), 'warn');
                    return false;
                }
                content.splice(targetPos, 0, '{$' + field + '}');
                this.materialContentThree = content.join('');
            },
            insertFieldFour({field}) {
                let targetPos = getCursorPosition(this.$refs.textareaFour);
                let content = [...this.materialContentFour];

                if (content.length + ('{$' + field + '}').length > 1000) {
                    this.$toast(this.$t('template.contentTooLong'), 'warn');
                    return false;
                }
                content.splice(targetPos, 0, '{$' + field + '}');
                this.materialContentFour = content.join('');
            },
            insertFieldFive({field}) {
                let targetPos = getCursorPosition(this.$refs.textareaFive);
                let content = [...this.materialContentFive];

                if (content.length + ('{$' + field + '}').length > 1000) {
                    this.$toast(this.$t('template.contentTooLong'), 'warn');
                    return false;
                }
                content.splice(targetPos, 0, '{$' + field + '}');
                this.materialContentFive = content.join('');
            },
            insertFieldSix({field}) {
                let targetPos = getCursorPosition(this.$refs.textareaSix);
                let content = [...this.materialContentSix];

                if (content.length + ('{$' + field + '}').length > 1000) {
                    this.$toast(this.$t('template.contentTooLong'), 'warn');
                    return false;
                }
                content.splice(targetPos, 0, '{$' + field + '}');
                this.materialContentSix = content.join('');
            },
            // 获取字段列表
            getFildList() {
                ContactApiV1
                    .getWeChatFields(this.fildPageNo, this.fieldKeyWord)
                    .then(res => {
                        let fileData = res.body.data.fieldList.map(field => ({
                            name: field.fieldCn,
                            id: field.id,
                            field: field.field
                        }));
                        if (this.fildPageNo > 1) {
                            this.fildList = this.fildList.concat(fileData);
                        } else {
                            this.fildList = fileData;
                        }
                        this.fildTotalPage = res.body.data.totalPage;
                    });
            },
            // 分页加载自定义字段列表
            loadMoreFildList() {
                if (this.fildPageNo < this.fildTotalPage) {
                    this.fildPageNo += 1;
                    this.getFildList();
                }
            },
            // 搜索自定义字段列表
            searchFildList(keyword) {
                this.fieldKeyWord = keyword;
                this.fildPageNo = 1;
                this.getFildList();
            },
            // 设置表单扩展值
            setFormExtended(e) {
                this.formExtendValue = e.id;
                this.formExtendValueName = e.name;
                this.customFormUrl = e.url;
            },
            // 选择自定义表单
            selectCustomForm(e) {
                this.customId = e.id;
                this.customFormUrl = e.indexLink;
                this.formName = e.paperName;
                // 选择第三级时， 不在$emit input事件
                this.paperId = e.formId;
            },
            // 选择源表单
            selectForm(e) {
                this.formName = e.paperName;
                // 选择源表单时， 需要重置自定义表单（多层emit， 所以把重置自定义表单拿到外部）
                this.customId = null;
            },
            // 清空跳转
            clearJump() {
                switch (this.redirectType[0]) {
                    case 'url':
                        this.url = '';
                        break;
                    case 'miniAPP':
                        this.appId = '';
                        this.appUrl = '';
                        this.alternativeAppUrl = '';
                        this.miniprogramId = '';
                        break;
                    case 'questionnaire':
                        this.clearForm();
                        break;
                }
                this.redirectType = [];
            },
            // 重置跳转数据
            clearAllJump() {
                this.clearForm();
                this.url = '';
                this.appId = '';
                this.appUrl = '';
                this.alternativeAppUrl = '';
            },
            // 清空表单
            clearForm() {
                this.customId = null;
                this.customFormUrl = '';
                this.formExtendValue = null;
                this.paperId = -1;
                this.formName = '';
                this.formExtendValueName = '';
            },
            setJumpTxt() {
                const txtWater = {
                    'url': `${this.$t('template.url')}: `,
                    'miniAPP': `${this.$t('template.appId')}: `,
                    'questionnaire' : this.$t('template.jumpForm')
                };

                const appUrlTxt = `${this.$t('template.appUrl')}: `;
                const alternativeAppUrl = `${this.$t('template.alternatePage')}: `;
                const valueWater = {
                    'url': this.url,
                    'miniAPP': this.appId + `\xa0\xa0\xa0\xa0` + appUrlTxt + this.appUrl + `\xa0\xa0\xa0\xa0` + (this.alternativeAppUrl ? alternativeAppUrl : '') + (this.alternativeAppUrl ? this.alternativeAppUrl : ''),
                    'questionnaire': this.formName + ' ' + this.formExtendValueName
                };

                // 跳转前缀文本
                this.jumpTxt = txtWater[this.redirectType[0]];
                // 跳转展示值
                this.jumpValue = valueWater[this.redirectType[0]];
            },
            vaildAppid() {
                if (this.redirectType[0] === 'miniAPP') {
                    if (this.miniprogramId === null && this.appId === '' && this.appUrl === '') {
                        this.inputAppid = this.$t('template.inputAppid');
                        this.appletAddr = this.$t('template.appletAddr');
                        this.errorMiniprogramText = this.$t('wechatContent.selectMiniprogram');
                        return false;
                    }
                    this.inputAppid = '';
                    this.appletAddr = '';
                    this.errorMiniprogramText = ''; 
                    return true;
                }
                this.inputAppid = '';
                this.appletAddr = '';
                this.errorMiniprogramText = '';
                return true;
            },
            // 获取小程序列表
            getMiniprogramList(id) {
                WechatApiV1.
                    selectMiniprogram(id)
                    .then((res)=>{
                        res.body.data.list.map((item)=>{
                            return this.miniprogramList.unshift(item);
                        });
                    });
            },
            select(e){
                this.errorMiniprogramText = '';
                if (e.miniprogramId === 0) {
                    this.appId = '';
                    this.appUrl = '';
                } else {
                    this.appId = e.appid;
                    this.appUrl = e.path;
                }
            }
        }
    };
</script>
<style lang="scss" type="text/scss" rel="stylesheet/scss">
    @import '../../common/scss/base/variables';
    @import '../../common/scss/base/mixin';

    .template-detail {
        margin-top: 24px;
        margin-bottom: $input-field-height + 24px + 16px;
        background-color: white;

        .questionnaire-picker {
            display: inline-block;
            vertical-align: top;
        }

        .overflowContent {
            max-width: 400px;
            @include ellipsis;
        }
        .addContentStyle {
            width: 300px;
            display: inline-block;
            height: 35px;
            line-height: 34px
        }

        /* 微信测试样式 */
        .boxs {

            /*粉丝列表*/
            .fanList {
                flex: 1;

                .title {
                    padding: 8px;
                    background-color: $title-bg;
                    border: 1px solid $border-color;
                }

                $item-height: 48px;

                .getList {
                    height: 5 * $item-height;
                    overflow-y: auto;
                    overflow-x: hidden;
                    border: 1px solid $border-color;

                    .list-content {
                        height: $item-height - 8px * 2;
                        line-height: $item-height - 8px * 2;
                        padding: 8px;

                        .avatar {
                            display: inline-block;
                            overflow: hidden;
                            width: $item-height - 8px * 2;
                            height: $item-height - 8px * 2;
                            vertical-align: top;
                            margin: 0 16px;

                            img {
                                display: block;
                                width: 100%;
                                height: auto;
                            }
                        }

                        &:hover {
                            background-color: $content-bg;
                        }

                        &.active {
                            background: #fff9da;
                        }
                    }

                    .emptySubscription, .searchEmpty {
                        height: 48px;
                        line-height: 48px;
                        text-align: center;
                        color: $color-light-content;
                        border-bottom: 1px solid $border-color;

                        .see-all {
                            line-height: 48px;
                            color: #8fdbcf;
                            cursor: pointer;
                        }
                    }
                }
            }
        }

        .float {
            float: left;
            padding: 0 5px;
            cursor: pointer;
            border: 1px #eeeeee solid;
            width: 33%;
            @include box-sizing();
            text-align: center;
        }

        .fixed {
            position: relative;
        }

        .addCorlor {
            padding: 0 1em;
            border: 1px solid #e0e0e0;
            border-left: none;
            background-color: #f0f0f0;
            border-top-right-radius: 2px;
            border-bottom-right-radius: 2px;
            line-height: 33px;
            vertical-align: top;
            cursor: pointer;
        }

        .preview {
            text-align: right;
        }

        .position {
            position: absolute;
            @include clearfix();
            top: 100%;
            left: 0;
            background-color: white;
            z-index: 100;
            width: 245px;
            border: 1px #eee solid;
        }

        .selector {
            display: inline-block;
            width: 300px;
        }

        .border {
            border-bottom: 1px #e0e0e0 solid;
            padding-bottom: 10px;
            .jumptext {
                @include ellipsis();
                max-width: 90%;
                display: inline-block;
                vertical-align: middle;
            }
            .vertical{
                vertical-align: middle;
            }
            .status-box{
                padding-left: 20px;
                .status{
                    color: #000000;
                    padding-left: 5px
                }
            }
        }

        .clor {
            color: #8fdbcf;

        }

        .addcor {
            color: #8fdbcf;
            cursor: pointer;
        }

        .addColor {
            color: #da5439;
        }

        .box {
            padding-top: 10px;

            .left {
                display: inline-block;
                width: 440px;
            }

            .right {
                @include width-calc(calc(100% - 460px));
                display: inline-block;
            }

            @include clearfix();
        }

        .pl {
            padding-left: 5px;
        }

        .p20 {
            padding-left: 20px;
        }

        .p32 {
            padding-left: 32px;
        }

        .details {
            display: inline-block;
            padding-right: 20px;
            vertical-align: top;
        }

        .detailsRight {
            display: inline-block;
        }

        .inputStle {
            width: 300px;
            border: 1px #e0e0e0 solid;
            height: 25px;
            border-radius: 5px;
            margin-left: 23px;
            padding-left: 4px;
        }

        .contents {
            margin-top: 10px;
            height: 48px;
            line-height: 32px;

            .contentLeft {
                display: inline-block;
                width: 295px;
                line-height: 35px;
                height: 35px;
                @include ellipsis();
            }

            .contentRight {
                @include width-calc(calc(100% - 300px));
                cursor: pointer;
                position: relative;

                .addPosition {
                    position: absolute;
                    top: -22.5px;
                    left: 10px;
                    width: 62px;
                }
                .icon-duoxingwenben{
                    position: absolute;
                    right: 1px;
                    top: -22px;
                    color: #000;
                    font-size: 16px;
                    background-color: #f0f0f0;
                    z-index: 1
                }
            }
        }

        // 底栏
        .footer {
            position: absolute;
            left: 0;
            bottom: 0;
            right: 0;
            padding: 8px 0;
            line-height: $input-field-height;
            background-color: white;
            @include clearfix();
            text-align: center;
            border-top: 1px solid $border-color;
            z-index: 1;
        }

        .boxSearch {
            width: 30px;
            height: 27px;
            border: 1px #e0e0e0 solid;
            border-radius: 3px;
            text-align: center;
            display: inline-block;
            font-size: 20px;
        }

        .searchContent {
            position: absolute;
            right: 20px;
            top: 20px
        }
        .template-box{
            margin: 20px 0 40px 0;
            .example{
                display: inline-block;
                vertical-align: top;
            }
            .details-data{
                display: inline-block;
                padding-left: 20px;
                .details-example{
                    margin-bottom: 20px
                }
            }
        }
        .to-applet-select{
            display: inline-block;
            width: 150px;
        }
    }

</style>
