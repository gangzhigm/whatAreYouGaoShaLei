<template>
    <div class="global-setting">
        <!--表单-全局设置-->
        <div class="global-wrapper clearfix">
            <div class="left-box">
                <div class="set-switch" @click="changeSetType(1)" >
                    <svg aria-hidden="true" :class="{'activeFill':setType===1}">
                        <use xlink:href="#icon-tijiao"></use>
                    </svg>
                    <h5 :class="{'active':setType===1}">{{'form.subSet' | t}}</h5>
                </div>
                <div class="set-switch" @click="changeSetType(2)">
                    <svg aria-hidden="true" :class="{'activeFill':setType===2}">
                        <use xlink:href="#icon-jumpsetting"></use>
                    </svg>
                    <h5 :class="{'active':setType===2}">{{'form.jumpSet' | t}}</h5>
                </div>
            </div>
            <div class="center-box">
                <submit-set v-if="setType===1" :formId="formId"></submit-set>
                <jump-set v-if="setType===2" :formId="formId" :formName="formName"></jump-set>
            </div>
        </div>
    </div>
</template>

<script>
    import jumpSet from './jump-set.vue';
    import submitSet from './submit-set.vue';

    export default {
        name: 'global-set',
        data() {
            return {
                setType: 1,//设置类型 1：提交设置 2：跳转设置
            };
        },
        props: {
            formId: {
                type: [Number, String],
                required: true
            },
            formName:{
                type: String,
            }
        },
        components: {
            jumpSet,
            submitSet
        },
        methods: {
            changeSetType(type) {
                this.setType = type;
            }
        }
    };
</script>

<style lang="scss" type="text/scss" rel="stylesheet/scss">
    @import '../../../common/scss/base/variables';
    @import '../../../common/scss/base/mixin';
    .global-setting{
        height: 100%;
        .global-wrapper{
            display: flex;
            justify-content: space-between;
            .left-box{
                border-right: 1px solid $border-color;
                width: 80px;
                min-height: 600px;
                flex-shrink: 0;
                padding-right: 10px;
                .set-switch{
                    text-align: center;
                    padding: 5px;
                    vertical-align: middle;
                    margin: 10px 0 40px 0;
                }
            }
            .center-box{
                flex: 1;
                padding: 10px;
            }
            .set-switch{
                svg{
                    width: 36px;
                    height: 36px;
                    fill: $color-light-content;
                }
                .activeFill{
                    fill: $theme;
                }
            }
            .active{
                color: $theme;
            }
        }
    }

</style>