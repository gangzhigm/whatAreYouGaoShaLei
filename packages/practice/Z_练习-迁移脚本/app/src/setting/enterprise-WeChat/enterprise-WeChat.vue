<template>
    <div class="enterprise-WeChat">
        <div class="page-content">
            <button type="button" class="btn btn-md btn-theme pull-right add-btn"
                    :disabled="resultList.length>0 || $has('enterprise_wecom_add_agent')"
                    @click="modifyConfig('')">
                <svg aria-hidden="true">
                    <use xlink:href="#icon-plus"></use>
                </svg>
                {{'enterpriseWeChat.addAgent' | t}}
            </button>
            <div class="simplify-table auto-width list-wrapper">
                <table class="table">
                    <thead>
                    <tr>
                        <th class="apply-name">{{'enterpriseWeChat.agent' | t}}</th>
                        <th>{{'openPlat.operating' | t}}</th>
                    </tr>
                    </thead>
                    <tbody>
                    <tr v-for="agent in resultList">
                        <td>
                            <div class="avatar-name">
                                <img :src="agent.squareLogoUrl" class="avatar">
                                <span class="agent-name">{{agent.name}}</span>
                            </div>
                        </td>
                        <td>
                            <button type="button" class="btn" :class="{'opt-btn': !$has('enterprise_wecom_agent_configuration')}"
                                @click="modifyConfig(agent.id)" :disabled="$has('enterprise_wecom_agent_configuration')">
                                {{'enterpriseWeChat.agentConfig' | t}}</button>
                            <button v-if="agent.canUse" type="button" class="btn" :class="{'opt-btn': !$has('enterprise_wecom_organization_staff')}"
                                @click="organizationStaff(agent.id)"
                                :disabled="$has('enterprise_wecom_organization_staff')">
                                {{'enterpriseWeChat.staff' | t}}</button>
                            <button v-if="agent.canUse" type="button" class="btn" :class="{'opt-btn': !$has('enterprise_wecom_chat_toolbar_configuration')}"
                                @click="sidebarConfig"
                                :disabled="$has('enterprise_wecom_chat_toolbar_configuration')">
                                {{'enterpriseWeChat.chatToolbarConfiguration' | t}}
                            </button>
                        </td>
                    </tr>
                    </tbody>
                </table>
                <list-empty v-if="resultList.length===0"/>
            </div>
        </div>
    </div>
</template>

<script>
    import { WecomApiV1 } from '@/api';

    export default {
        name: 'EnterpriseWeChat',
        data() {
            return {
                resultList: [],
                id: '',//新建时id为''
            };
        },
        mounted() {
            this.toGetConfigList();
        },
        methods: {
            //获取应用配置列表
            toGetConfigList() {
                WecomApiV1
                    .getConfigList()
                    .then(({body: {data}}) => {
                        this.resultList = data.resultList;
                    });
            },
            //跳转至应用配置
            modifyConfig(id) {
                this.$router.push({
                    name: 'AgentConfig',
                    query: {id: id}
                });
            },
            //跳转至应用配置
            organizationStaff(id) {
                this.$router.push({
                    name:'OrganizationStaff',
                    query: {id: id}
                });
            },
            //跳转至侧边栏画像配置
            sidebarConfig(){
                this.$router.push({
                    name:'SidebarPortrayalConfig',
                    // query: {id: id}
                });
            },
        }
    };
</script>

<style lang="scss">
    @import '../../common/scss/base/_variables.scss';
    @import '../../common/scss/base/_mixin.scss';

    .enterprise-WeChat {
        .add-btn {
            margin-bottom: 20px;
        }

        .list-wrapper {
            margin-top: 55px;

            .apply-name {
                width: 70%;
            }

            .opt-btn {
                display: inline-block;
                color: $theme;
                cursor: pointer;
                margin-right: 10px;
            }

            .avatar-name {
                display: flex;
                padding: 5px 0;
            }

            .avatar {
                width: 60px;
                height: 60px;
            }

            .agent-name {
                line-height: 60px;
                display: inline-block;
                margin-left: 10px;
            }
        }
    }
</style>
