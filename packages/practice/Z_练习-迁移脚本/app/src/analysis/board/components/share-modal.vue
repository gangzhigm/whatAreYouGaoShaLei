<template>
    <modal :title="'共享“' + board.name + '”'" v-if="boardId" @close="$emit('close')">
        <p class="disabled-text">与用户和组共享，或输入账号（电子邮件地址）以邀请新用户。</p>
        <br>
        <input type="text" class="input full-width" maxlength="300" placeholder="输入用户名或电子邮件" @focusin="errorText = ''"
               v-model.trim="shareForm.user" v-title:top.line.warn="errorText" :class="{error: errorText}">
        <br>
        <br>
        <textarea class="textarea full-width" placeholder="要包含的信息……" v-model.trim="shareForm.content"></textarea>
        <div class="tac">
            <br>
            <checkbox v-model="shareForm.send">发送电子邮件通知</checkbox>
            <br>
            <br>
            <input type="button" class="btn btn-md btn-orange" value="共享" @click="share">
        </div>
        <br>
        <br>
        <p class="disabled-text" v-if="board.users && board.users.length !== 0">
            已与 <span class="content-text">{{board.users.length}}</span> 人分享
        </p>
        <div class="avatars">
            <p class="tac disabled-text" v-if="board.users.length === 0">看板尚未与任何人分享</p>
            <div class="avatar" v-else v-for="user in board.users">
                <img class="avatar-thumb" v-if="user.avatar" :src="user.avatar">
                <svg class="avatar-thumb" v-else aria-hidden="true">
                    <use xlink:href="#icon-user"></use>
                </svg>
                {{user.name || user.email}}
                <svg class="close" aria-hidden="true" @click="cancelShare(board, user)">
                    <use xlink:href="#icon-round-close"></use>
                </svg>
            </div>
        </div>
    </modal>
</template>
<script>
    import { WebServiceApiV1 } from '@/api';
    import {UPDATE_BOARD} from '@/store/vuex/mutationTypes';
    import {ANALYSIS_STORE_NAME} from '@/store/vuex/modules/analysisStore';

    export default {
        name: 'share-modal',
        props: {
            boardId: Number
        },
        data() {
            return {
                shareForm: {
                    user: '',  // 被分享人的用户名或者是邮箱
                    send: true, // 是否发送邮件给被分享人
                    content: '',  // 邮件中要包含的内容
                },
                errorText: '',  // 校验错误信息
            };
        },
        computed: {
            board() {
                return this.$store.state[ANALYSIS_STORE_NAME].boards.find(board => board.id === this.boardId);
            }
        },
        methods: {
            share() {
                if (this.shareForm.user === '') {
                    this.errorText = '输入用户名或电子邮件';
                    return;
                }
                WebServiceApiV1
                    .share(this.board.id, this.shareForm)
                    .then(() => {
                        this.$toast('分享成功', 'success');
                        this.$emit('close');
                        // update sharingBoard.users
                        WebServiceApiV1
                            .getSharedUsers(this.board.id)
                            .then(({body: {data: {users}}}) => {
                                this.$store.commit(UPDATE_BOARD, Object.assign({}, this.board, {users}));
                            });
                    });
            },
            cancelShare(board, user) {
                // TODO 取消分享接口不可用
                WebServiceApiV1
                    .cancelShare(board.id, user.id)
                    .then(() => {
                        WebServiceApiV1
                            .getSharedUsers(this.board.id)
                            .then(({body: {data: {users}}}) => {
                                this.$store.commit(UPDATE_BOARD, Object.assign({}, this.board, {users}));
                            });
                    });
            }
        }
    };
</script>
<style lang="scss">
    @import "../../../common/scss/base/variables";
    @import "../../../common/scss/base/mixin";

    // 分享模态框
    .avatars {
        padding: 1em;
        text-align: center;
        @include clearfix();
        white-space: nowrap;
        overflow: auto;

        .avatar {
            position: relative;
            display: inline-block;
            line-height: $input-field-height;
            vertical-align: top;
            @include transition(color .2s linear);
            cursor: default;

            + .avatar {
                margin-left: 32px;
            }

            &:hover {
                color: $theme;

                .avatar-thumb {
                    border-color: currentColor;
                    background-color: $content-bg;
                }

                .close {
                    opacity: 1;
                }
            }

            .avatar-thumb {
                display: block;
                width: 48px;
                height: 48px;
                @include border-radius(100%);
                border: 1px solid transparent;
                @include transition(border-color .2s linear);
                @include user-select(none);
                fill: $blue;
            }

            .close {
                position: absolute;
                top: -1px;
                right: -1px;
                fill: $red;
                width: 14px;
                height: 14px;
                cursor: pointer;
                opacity: 0;
                @include transition(opacity .2s linear);
            }
        }
    }
</style>
