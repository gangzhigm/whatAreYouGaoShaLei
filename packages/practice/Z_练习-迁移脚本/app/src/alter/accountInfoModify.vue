<!-- 账户信息修改 -->
<template>
    <div class="personal-setting">
        <div class="content-view">
            <crumbs></crumbs>
        </div>
        <div class="page-head">
            <div class="content-view">
                <div class="pull-right">
                    <button type="button" class="btn btn-md btn-theme" @click="savePersonals">{{'common.save' | t}}
                    </button>
                </div>
                <h1>{{'home.accountInfoModify' | t}}</h1>
            </div>
        </div>
        <div class="page-content">
            <div class='content-view white-bg padding margin' >
                <div class="form-field" >
                    <label class="label" for="InfoName">Saleforce{{'home.InfoName' | t}}</label>
                    <input type="text" id="InfoName" class="input setting-input" autofocus
                           maxlength="30" 
                           v-model="AlterUserName" 
                          >
                </div>
                <div class="form-field">
                    <label class="label" for="InfoPsd">Saleforce{{'home.newPassword' | t}}</label>
                    <input type="password" id="InfoPsd" class="input setting-input" autofocus
                           maxlength="30" 
                           v-model="AlterPassWord"
                           >
                </div>
                <div class="form-field">
                    <label class="label" for="InfoScore">{{'home.PlanningScore' | t}}</label>
                    <input type="number" id="InfoScore" class="input setting-input" autofocus
                           maxlength="30" @focusin="errorTextLastName = ''"
                           v-model="AlterScore"
                           >
                </div>
            </div>
        </div>
    </div>
</template>
<script type="text/babel">
    import Password from '../layout/header/password.vue';
    import alters from '../alter/alterModel';
    import { ManageApi } from '@/api';
    export default {
        components: {Password},
        data() {
            return {
                //获取用户输入框的信息
                AlterUserName: '',
                AlterPassWord: '',
                AlterScore: ''
            };
        },
        computed: {
            user() {
                return this.$store.state.user;
            },
        },
        mounted() {
            //进来页面获取用户信息
            this.getUser();
            alters.getAlter().then((res)=>{
                this.AlterUserName = res.body.data.value;
            });
            alters.getAlterPsd().then((res) =>{
                this.AlterPassWord = res.body.data.value;
            });
            alters.getAlterScore().then((res) =>{
                this.AlterScore = res.body.data.value;
            });
        },
        methods: {
            getUser(){
                ManageApi
                    .getUser({
                        id: this.$store.state.user.id,
                    })
                    .then((res) => {
                        this.personalSetting = res.body.data.subUser;

                        if (res.body.data.subUser.timeZone === '' || res.body.data.subUser.timeZone === null) {
                            this.personalSetting.timeZone = '+08:00';
                        }
                    });
            },
            savePersonals(){
                // 保存用户修改的信息
                alters.saveAlter(this.AlterUserName)
                    .then(() => {
                        this.$toast(this.$t('personal.success'), 'success');
                    }); 
                alters.saveAlterPsd(this.AlterPassWord)
                    .then(() => {
                        this.$toast(this.$t('personal.success'), 'success');
                    });
                alters.saveAlterScore(this.AlterScore)
                    .then(() => {
                        this.$toast(this.$t('personal.success'), 'success');
                    });
            },
        },
    };
</script>
<style lang="scss" type="text/scss" rel="stylesheet/scss">
    @import "../common/scss/base/variables";
    @import "../common/scss/base/mixin";

    .personal-setting {
        .form-field {
            .setting-input {
                width: 277px;
            }
        }
        .label {
            margin: 0;
            width: 144px;
            vertical-align: top;
            text-align: right;
        }
    }
</style>