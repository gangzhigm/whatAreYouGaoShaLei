<template>
    <div class="meta-data">
        <div class="content-view">
            <div class="toolbar">
                <crumbs class="pull-left"/>
            </div>
        </div>
        <div class="tab-links" >
            <div class="content-view" >
                <a class="tab-link">
                    {{'metaData.scoreReport' | t}}
                </a>
            </div>
        </div>
        <div class="content-view" id="score-report">
            <p class="small-title">
                {{'metaData.distribution' | t}} (<span class="red-text">{{'metaData.attention' | t}}</span>，{{'metaData.distribution2' | t}})
            </p>
            <div class="simplify-table">
                <table class="custom-table">
                    <template v-for="line in splitList">
                        <tr class="label-tr">
                            <td v-for="item in line">{{item.name}}</td>
                        </tr>
                        <tr class="data-tr">
                            <td v-for="item in line" >{{item.userCount}}({{item.userRate}})</td>
                        </tr>
                    </template>
                </table>
                <list-empty v-if="reportList.length === 0"/>
            </div>
        </div>
    </div>

</template>

<script>
    import { WebServGradeApiV1 } from '@/api';
    // import {translate as t} from '../../../common/i18n/i18n.js';
    export default {
        data() {
            return {
                reportList:[

                ],
                //总人数
                sumNumber:0,
            };
        },
        mounted() {
            this.getGradeReport();
        },
        computed:{
            splitList(){
                //每行有 n 列
                let n = 4;
                let sumLine = Math.ceil(this.reportList.length / n);
                let rs = [];
                for (let i = 0;i < sumLine;i++){
                    rs.push([]);
                }
                this.reportList.forEach((item,index) =>{
                    rs[Math.ceil((index + 1) / n - 1)].push(item);
                });
                return rs;
            }
        },
        methods: {
            //得到评级规则列表
            getGradeReport() {
                this.$loading();
                WebServGradeApiV1
                    .getGradeReport(this.$route.query.id)
                    .then((res) => {
                        this.$loaded();
                        this.reportList = res.body.data.list;
                        if (res.body.data.list && res.body.data.list.length > 0){
                            this.reportList.forEach(item =>{
                                this.sumNumber += parseInt(item.userCount);
                            });
                            this.reportList.forEach(item =>{
                                item.percent = (item.userCount / this.sumNumber * 100).toFixed(2);
                            });
                        }
                    })
                    .catch(() => {
                        this.$loaded();
                    });
            },
            jumpContact(item){
                let keyWords = item.attrName + '/' + item.name;
                this.$router.push({
                    name:'memberList',
                    query:{
                        keyWords:keyWords
                    }
                });
            }
        },
    };

</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style lang="scss" type="text/scss" rel="stylesheet/scss">
    @import "../../../common/scss/base/variables";
    @import "../../../common/scss/base/mixin";
    #score-report{
        .custom-table{
            td{
                text-align: center;
                border: 1px solid #ccc;
            }
        }
        .small-title{
            margin: 10px 0 ;
            font-size: 14px;
            font-weight: bold;
        }
        .label-tr{
            background-color: #cfeefc;
        }
        .data-tr{
            color: #0096df;
            /*cursor: pointer;*/
        }
    }
</style>
