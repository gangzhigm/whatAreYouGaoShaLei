<template>
    <div class="sidebar-portrayal-config">
        <div class="page-head">
            <div class="back" @click="back">
                <svg aria-hidden="true">
                    <use xlink:href="#icon-fanhui1"></use>
                </svg>
            </div>
            <h1>{{'enterpriseWeChat.chatToolbarConfiguration'| t}}</h1>
        </div>
        <div class="sidebar">
            <div class="visible-range-list">
                <div class="visible-item" 
                    :class="{'unactive': item.id !== currentIndex}" 
                    @click="handleClick(item.id,item.value)" 
                    v-for="(item,index) in visibleRangeList" 
                    :key="item.id">
                    {{item.name}}
                </div>
            </div>
            <VisibleRange v-show="optionType === 'attr'" :option="'attr'"></VisibleRange>
            <VisibleRange v-show="optionType === 'event'" :option="'event'"></VisibleRange>
        </div>
    </div>
</template>

<script>
    import VisibleRange from '@/setting/enterprise-WeChat/components/visible-range.vue';
    export default {
        name:'SidebarPortrayalConfig',
        components:{
            VisibleRange
        },
        data () {
            return {
                visibleRangeList:[{
                    id:1,
                    name:this.$t('enterpriseWeChat.allowedUsersOfProperties'),
                    value:'attr'
                },{
                    id:2,
                    name:this.$t('enterpriseWeChat.allowedUsersOfEvents'),
                    value:'event'
                }],
                currentIndex:1,
                optionType:'attr'
            };
        },
        methods: {
            handleClick(i,val){
                this.currentIndex = i;
                this.optionType = val;
            },
            back(){
                this.$router.replace('/orgSetting/enterpriseWeChat');
            }
        }
    };
</script>

<style lang="scss">
    @import '../../common/scss/base/_variables.scss';
    @import '../../common/scss/base/_mixin.scss';

    .sidebar-portrayal-config{
        .page-head{
            display: flex;
            align-items: center;
            .back{
                cursor: pointer;
                margin:0 6px;
                svg {
                    width: 16px;
                    height: 16px;
                    fill: $light-green;
                    vertical-align: middle;
                }
            }
        }
        .sidebar{
            margin-top: 10px;
            padding: 16px 20px 10px;
            background-color: #fff;
            .visible-range-list{
                display: flex;
                font-size: 18px;
                font-weight: bold;
                .visible-item{
                    margin-right: 16px;
                    margin-bottom: 30px;
                    color: #0cc2a9;
                    border-bottom: 2px solid #0cc2a9;
                   cursor: pointer;
                   &:hover{
                        color: #0cc2a9;
                    }
                }
                .unactive{
                    color: #000;
                    border-bottom: 2px solid transparent;
                }
            }
        }
    }
</style>