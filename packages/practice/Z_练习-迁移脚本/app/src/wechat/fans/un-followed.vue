<template>
    <div class="un-followed">
        <div class="table">
            <table>
                <thead>
                <tr>
                    <th style="background-color: #fafafa">{{'follower.unFollowFans' | t}}</th>
                </tr>
                </thead>
                <tbody>
                <tr v-for="(user,index) in user.userList">
                    <td>
                        <img :src="user.headimgurl" alt="">
                        <div class="user-name">
                            <!--<span class="name"><span v-if="fans.nickname">({{fans.nickname}})</span>{{fans.name}}</span>-->
                            <span class="name">
                                <span v-if="user.nickname !== user.name">{{user.name}}</span>
                                <span>
                                    <span v-if="user.nickname !== user.name">(</span>
                                    {{user.nickname}}
                                    <span v-if="user.nickname !== user.name">)</span>
                                </span>
                            </span>
                            <!--<div class="tags" v-for="value in userTag" v-if="uesrTag.length === 0">{{value}}</div>-->
                        </div>
                    </td>
                </tr>
                </tbody>
            </table>
            <pager :total="user.totalPage" :now="user.page" @page="getMore"></pager>
        </div>
    </div>
</template>
<script type="text/babel">

    import { WechatApiV1 } from '@/api';

    export default {
        mounted() {
            this.fetchUsers(true);
        },
        data() {
            return {
                // 联系人标签
                userTag: [],
                user: {
                    userList: [],
                    loaded: true,
                    page: 1,
                    totalRow: '',
                    totalPage: ''
                }
            };
        },
        methods: {
            fetchUsers(reset) {
                if (!this.user.loaded) return;
                this.user.loaded = false;
                if (reset) {
                    this.user.page = 1;
                }
                WechatApiV1
                    .getUsersdel(this.user.page, 0)
                    .then((res) => {
                        if (res.body.data.customerList.length === 0) {
                            this.$toast(this.$t('follower.noFans'));
                            return;
                        }
                        if (reset) {
                            this.user.userList = res.body.data.customerList;
                        } else {
                            this.user.userList = this.userList.concat(res.body.data.customerList);
                        }
                        this.user.totalPage = res.body.data.totalPage;
                        this.user.totalRow = res.body.data.totalRow;
                    });
            },

            getMore(e) {
                this.user.page = e;
                WechatApiV1
                    .getUsersdel(this.user.page, 0)
                    .then((res) => {
                        this.user.userList = res.body.data.customerList;
                        this.user.totalPage = res.body.data.totalPage;
                        this.user.totalRow = res.body.data.totalRow;
                    });
                // WechatApiV1
                //     .getUsers(this.fans.page, 0)
                //     .then((res) => {
                //         if (res.body.data.customerList.length == 0) {
                //             this.$toast('无取关粉丝');
                //             return;
                //         }else{
                //             this.fans.userList = res.body.data.customerList;
                //             this.fans.totalPage = res.body.data.totalPage;
                //             this.fans.totalRow = res.body.data.totalRow;
                //         }
                //     });
            }
        }
    };
</script>
<style lang="scss" type="text/scss" rel="stylesheet/scss">

    @import '../../common/scss/base/variables';
    @import '../../common/scss/base/mixin';

    .un-followed {

        .table {
            img {
                display: inline-block;
                vertical-align: top;
                width: 50px;
                height: 50px;
            }

            .user-name {
                margin-left: 10px;
                display: inline-block;
                vertical-align: top;
                .name {
                    display: block;
                    height: 18px;
                    font-size: 14px;
                    line-height: 18px;
                }
                .no-tags {
                    display: inline-block;
                    vertical-align: top;
                    margin-top: 3px;
                    @include box-sizing();
                    width: 60px;
                    height: 24px;
                    border: 1px solid $border-color;
                    @include border-radius(12px);
                    line-height: 22px;
                    text-align: center;
                }
                .icon-sele {
                    position: relative;
                    display: inline-block;
                    .icon--icon {
                        position: relative;
                        display: inline-block;
                        vertical-align: top;
                        margin: 8px 8px;
                        width: 0;
                        height: 0;
                        border: 4px solid $color-light-content;
                        @include transform(rotate(45deg));
                        border-top-color: transparent;
                        border-left-color: transparent;
                        &:hover {
                            cursor: pointer;
                        }
                    }
                    .tags-box {
                        @include box-sizing();
                        position: absolute;
                        z-index: 20;
                        top: 30px;
                        left: 50%;
                        margin-left: -170px;
                        padding: 20px;
                        width: 340px;
                        background: #fff;
                        border: 1px solid $border-color;
                        font-size: 0;
                        &:before {
                            @include box-sizing();
                            position: absolute;
                            top: -7px;
                            left: 50%;
                            margin-left: -8px;
                            content: '';
                            width: 16px;
                            height: 16px;
                            background: #fff;
                            border: 1px solid $border-color;
                            @include transform(rotate(45deg));
                            border-right-color: transparent;
                            border-bottom-color: transparent;
                        }
                        div.tag-name {
                            display: inline-block;
                            vertical-align: top;
                            width: 33%;
                            height: 30px;
                            line-height: 30px;
                            font-size: 12px;
                        }
                        p {
                            display: inline-block;
                            font-size: 14px;
                            color: $blue;
                            &:hover {
                                cursor: pointer;
                                text-decoration: underline;
                            }
                        }
                    }
                }
            }
        }
    }

</style>
