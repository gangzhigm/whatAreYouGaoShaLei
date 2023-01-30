<template>
    <div class="templateLoseDetails">
        <!--正文-->
        <div class="data" v-if="!loading">
            <div class="border">
                {{'template.tempStatus' | t}}
                <span style="padding-left: 20px" v-if="detailsData.status==0"><span
                        class="icon icon-warn addColor pr"><span
                        style="color: #000000;padding-left: 5px">{{'template.paramNot' | t}}</span> </span></span>
                <span style="padding-left: 20px" v-else-if="detailsData.status==1"><span
                        class="icon icon-True clor "> <span
                        style="color: #000000;padding-left: 5px">{{'template.paramHas' | t}}</span>
                    </span>
                    </span>
                <span style="padding-left: 20px" v-else-if="detailsData.status==2"><span
                        class="icon icon-warn addColor "> <span
                        style="color: #000000;padding-left: 5px">{{'template.invalidId' | t}}</span>
                    </span>
                    </span>
            </div>
            <div class="box border">
                <div class="left">{{'template.wechatAccount' | t}} <span class="p32">{{detailsData.nickName}}</span></div>
                <div class="right">{{'template.tempIndustry' | t}} <span
                        class="p20">{{detailsData.primaryIndustry}} - {{detailsData.deputyIndustry}}</span></div>
            </div>
            <div class="box border">
                <div class="left">{{'template.id' | t}} <span class="p32">{{detailsData.templateId}}</span></div>
                <div class="right">{{'template.title' | t}}<span class="p20">{{detailsData.title}}</span></div>
            </div>
            <div class="box border">
                <div style="display: inline-block">{{'template.clickJump' | t}}</div>
                <div style="display: inline-block;vertical-align: top;padding-left: 20px">
                    <div v-if="detailsData.pagePath!=''||detailsData.url!=''">
                        <div v-if="detailsData.pagePath==''">
                            <p>
                                <span>{{'template.url' | t}} ：{{detailsData.url}}</span>
                            </p>
                            <p>{{'template.notSet' | t}}</p>
                        </div>
                        <div v-else>
                            <p>{{'template.appletId' | t}}：{{detailsData.appId}}</p>
                            <p>{{'template.appletAddr' | t}} ： {{detailsData.pagePath}}</p>
                        </div>
                    </div>

                </div>
            </div>
            <div class="box border" style="position: relative">
                <div class="pull-left">
                    <div class="details">{{'template.tempContent' | t}}</div>
                    <div class="detailsRight">
                        <div class="contents"
                             v-for="(filedName,index) in contentList">
                            <div class="contentLeft" v-title:bottom="filedName.content">{{filedName.content}}</div>
                            <div class="contentRight">
                                    <span v-if="filedName.status==1">
                                        <!--判断是否显示输入框此时有一个值-->
                                        <span style="position: absolute;
    top: -32.5px;left: 0" v-if="filedName.key.length<=1">
                                             <span v-if="filedName.sendContents[0].color==''&& filedName.sendContents[0].value=='' "
                                                   style="display: inline-block;width: 62px"
                                                   class=" clor"
                                             >{{'template.noSetting' | t}}</span>
                                              <span v-if="filedName.sendContents[0].color!=''|| filedName.sendContents[0].value!=''">
                                             <span class="fixed">
                                        <input readonly="readonly" v-if="filedName.sendContents.length<=1"
                                               :style="{color:filedName.sendContents[0].color}"
                                               class="addCorlor overflowContent"
                                               style="width: 200px"
                                               v-model="filedName.sendContents[0].value"
                                        >
                                                 <!--<span style="position: absolute;right: 1px;-->
                                                 <!--top: -21px;color: #000;font-size: 16px;background-color: #f0f0f0;z-index: 100"-->
                                                 <!--class="icon icon-duoxingwenben"></span>-->
                                        </span>
                                        </span>
                                        </span>
                                        <!--此时有两个值时-->
                                        <span style="position: absolute; top: -32.5px;left: 0;"
                                              v-else-if="filedName.key.length==2">
                                             <span v-if="filedName.sendContents[0].value==''&& filedName.sendContents[1].value=='' "
                                                   style="display: inline-block;width: 62px"
                                                   class="clor">{{'template.noSetting' | t}}</span>
                                             <span class="fixed"
                                                   v-if="filedName.sendContents.length==2 &&(filedName.sendContents[0].value!=''||  filedName.sendContents[1].value!='')">
                                        <span class="addCorlor overflowContent"
                                              style="width: 200px;display: inline-block;height: 35px;line-height: 34px">
                                            <span :style="{color:filedName.sendContents[0].color}">
                                               {{filedName.sendContents[0].value}}:
                                            </span>
                                              <span :style="{color:filedName.sendContents[1].color}">
                                                  {{filedName.sendContents[1].value}}
                                              </span>
                                              </span>
                                                 <!--<span style="position: absolute;right: 1px;top:-21px;color: #000;font-size: 16px;background-color: #f0f0f0;z-index: 100"-->
                                                 <!--class="icon icon-duoxingwenben"></span>-->
                                        </span>
                                        </span>
                                        <!--此时有三个值-->
                                        <span style="position: absolute; top: -32.5px;left: 0;"
                                              v-else-if="filedName.key.length==3">
 <span v-if="filedName.sendContents[0].value==''&& filedName.sendContents[1].value==''&& filedName.sendContents[2].value=='' "
       style="display: inline-block;width: 62px"
       class="clor">{{'template.noSetting' | t}}</span>
                                             <span class="fixed"
                                                   v-if="filedName.sendContents.length==2 &&(filedName.sendContents[0].value!=''||  filedName.sendContents[1].value!='' || filedName.sendContents[2].value!='')">
                                        <span class="addCorlor overflowContent"
                                              style="width: 200px;display: inline-block;height: 35px;line-height: 34px">
                                            <span :style="{color:filedName.sendContents[0].color}">
                                               {{filedName.sendContents[0].value}}:
                                            </span>
                                              <span :style="{color:filedName.sendContents[1].color}">
                                                  {{filedName.sendContents[1].value}}
                                              </span>
                                             <span :style="{color:filedName.sendContents[2].color}">
                                                  {{filedName.sendContents[2].value}}
                                              </span>
                                              </span>
                                                 <!--<span style="position: absolute;right: 1px;top:-21px;color: #000;font-size: 16px;background-color: #f0f0f0;z-index: 100"-->
                                                 <!--class="icon icon-duoxingwenben"></span>-->
                                        </span>
                                        </span>
                                        <!--此时有四个值-->
                                           <span style="position: absolute; top: -32.5px;left: 0;"
                                                 v-else-if="filedName.key.length==4">
 <span v-if="filedName.sendContents[0].value==''&& filedName.sendContents[1].value==''&& filedName.sendContents[2].value==''&& filedName.sendContents[3].value=='' "
       style="display: inline-block;width: 62px"
       class="clor">{{'template.noSetting' | t}}</span>
                                             <span class="fixed"
                                                   v-if="filedName.sendContents.length==2 &&(filedName.sendContents[0].value!=''||  filedName.sendContents[1].value!='' || filedName.sendContents[2].value!=''  || filedName.sendContents[3].value!='')">
                                        <span class="addCorlor overflowContent"
                                              style="width: 200px;display: inline-block;height: 35px;line-height: 34px">
                                            <span :style="{color:filedName.sendContents[0].color}">
                                               {{filedName.sendContents[0].value}}:
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
                                                 <!--<span style="position: absolute;right: 1px;top:-21px;color: #000;font-size: 16px;background-color: #f0f0f0;z-index: 100"-->
                                                 <!--class="icon icon-duoxingwenben"></span>-->
                                        </span>
                                        </span>
                                        <!--此时有五个值-->
                                        <span style="position: absolute; top: -32.5px;left: 0;"
                                              v-else-if="filedName.key.length==5">
 <span v-if="filedName.sendContents[0].value==''&& filedName.sendContents[1].value==''&& filedName.sendContents[2].value==''&& filedName.sendContents[3].value==''&& filedName.sendContents[4].value=='' "
       style="display: inline-block;width: 62px"
       class="clor">{{'template.noSetting' | t}}</span>
                                             <span class="fixed"
                                                   v-if="filedName.sendContents.length==2 &&(filedName.sendContents[0].value!=''||  filedName.sendContents[1].value!='' || filedName.sendContents[2].value!=''  || filedName.sendContents[3].value!='' || filedName.sendContents[4].value!='')">
                                        <span class="addCorlor overflowContent"
                                              style="width: 200px;display: inline-block;height: 35px;line-height: 34px">
                                            <span :style="{color:filedName.sendContents[0].color}">
                                               {{filedName.sendContents[0].value}}:
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
                                                 <!--<span style="position: absolute;right: 1px;top:-21px;color: #000;font-size: 16px;background-color: #f0f0f0;z-index: 100"-->
                                                 <!--class="icon icon-duoxingwenben"></span>-->
                                        </span>
                                        </span>
                                        <!--<span :style="{color:filedName.sendContents[1].color}" >-->
                                        <!--{{filedName.sendContents[1].value}}-->
                                        <!--</span>-->
                                        </span>
                            </div>

                        </div>
                    </div>

                </div>
                <!--<div class="searchContent"><span class="boxSearch"><i class="icon icon-search" v-title:left="'预览'"-->
                <!--@click="confirms=true"></i></span></div>-->
            </div>


        </div>
        <inline-loading v-if="loading"></inline-loading>
        <div class="footer">
            <div class="content-view">
                <button type="button" class="pull-right btn btn-theme btn-md" @click="closeTemplate">{{'common.close' | t}}</button>
            </div>
        </div>
    </div>
</template>
<script type="text/babel">
    import { WechatApiV1 } from '@/api';

    export default {
        mounted() {
            this.id = this.$route.query.id;
            WechatApiV1
                .templateDetails(this.id)
                .then(res => {
                    this.detailsData = res.body.data.wxTemplate;
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
                    this.loading = false;
                });
        },

        data() {
            return {
                id: '',
                loading: true,
                detailsData: {
                    status: 0,
                    nickName: ''
                },
                arr: [],
                url: '',
                contentList: []
            };
        },

        methods: {
            closeTemplate() {
                this.$router.go(-1);
            }
        }

    };
</script>

<style lang="scss" type="text/scss" rel="stylesheet/scss">
    @import '../../common/scss/base/variables';
    @import '../../common/scss/base/mixin';

    .templateLoseDetails {
        margin-top: 24px;
        margin-bottom: $input-field-height + 24px + 16px;
        background-color: white;

        .overflowContent {
            max-width: 200px;
            @include ellipsis;
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
            width: 150px;
        }
        .inputBg {
            background-color: #cccccc;
        }
        .border {
            border-bottom: 1px #e0e0e0 solid;
            padding-bottom: 10px;
        }
        .clor {
            color: #8fdbcf;

        }
        .addcor {
            color: #8fdbcf;
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
        .input {
            width: 300px;
            border: 1px #e0e0e0 solid;
            height: 25px;
            border-radius: 3px;
            margin-left: 10px;
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
                position: relative;
                display: inline-block;
                .addPosition {
                    position: absolute;
                    top: -32.5px;
                    left: 10px;
                    width: 62px;
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
            border-top: 1px solid $border-color;
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
    }
</style>
