<template>
    <div class="content-container boards">
        <div class="content-view">
            <div class="toolbar">
                <crumbs class="pull-left"/>
            </div>
        </div>
        <div class="page-head">
            <div class="content-view">
                <h1>{{$route.meta.name | t}}</h1>
                <button type="button" class="page-head-btn btn btn-md btn-theme" @click="creatingNewBoard = true">
                    <svg aria-hidden="true">
                        <use xlink:href="#icon-plus"></use>
                    </svg>
                    {{'board.newBoard' | t}}
                </button>
                {{'board.total' | t}}
                <span class="theme-text">{{boards.length}}</span> {{'board.kanban' | t}}
                <selector class="lg pull-right" :options="orderOptions" v-model="orderBy"></selector>
                <div class="display-modes pull-right">
                    <span class="display-mode" :class="{active: displayMode === 'grid'}" @click="displayMode = 'grid'">
                        <svg aria-hidden="true">
                            <use xlink:href="#icon-grid"></use>
                        </svg>
                    </span>
                    <span class="display-mode" :class="{active: displayMode === 'list'}" @click="displayMode = 'list'">
                        <svg aria-hidden="true">
                            <use xlink:href="#icon-menu"></use>
                        </svg>
                    </span>
                </div>
                <!-- 屏蔽分享功能
                <div class="board-types pull-right">
                    <router-link class="board-type" :to="{name: 'boards', query: {type: 'my'}}">我的</router-link>
                    <router-link class="board-type" :to="{name: 'boards', query: {type: 'shared'}}">分享</router-link>
                    <router-link class="board-type" :to="{name: 'boards', query: {type: 'all'}}">全部</router-link>
                </div>
                -->
            </div>
        </div>
        <div class="page-content">
            <div class="content-view margin simplify-table" v-if="boards.length !== 0 && displayMode === 'list'">
                <table>
                    <thead>
                    <tr>
                        <td class="name-td">{{'board.name' | t}}</td>
                        <td class="color-td">{{'board.numberreports' | t}}</td>
                        <td class="show-td">{{'board.founder' | t}}</td>
                        <td class="remarks-td">{{'board.viewnumber' | t}}</td>
                        <td>{{'board.creationtime' | t}}</td>
                        <td>{{'board.updatetime' | t}}</td>
                        <td></td>
                    </tr>
                    </thead>
                    <tbody>
                    <tr class="board-line" v-for="board in boards" :key="board.id">
                        <td>
                            <router-link class="board-name blue-text" :title="board.name"
                                         :to="{name: 'board', params: {id: board.id}}">
                                {{board.name}}
                            </router-link>
                        </td>
                        <td>{{board.showsCount}}</td>
                        <td>{{board.userInfo.name}}</td>
                        <td>{{board.views}}</td>
                        <td>{{board.createTime}}</td>
                        <td>{{board.updateTime}}</td>
                        <td>
                            <!-- 屏蔽分享功能
                            <div class="board-action-icon" v-if="board.type !== 2"
                                 :class="{active: deletingBoardId === board.id}">
                                <svg aria-hidden="true" class="icon-share" @click="initShare(board)">
                                    <use xlink:href="#icon-share"></use>
                                </svg>
                            </div>
                            -->
                            <div class="board-action-icon" v-if="board.type !== 2"
                                 :class="{active: deletingBoardId === board.id}">
                                <svg aria-hidden="true" @click="deletingBoardId = board.id" class="icon-delete">
                                    <use xlink:href="#icon-round-close"></use>
                                </svg>
                                <inline-confirm v-if="deletingBoardId === board.id" @cancel="deletingBoardId = ''"
                                                :text="$t('board.suredelete')" @confirm="deleteBoard(board)"/>
                            </div>
                        </td>
                    </tr>
                    </tbody>
                </table>
            </div>
            <transition-group name="cards" tag="div" class="content-view margin">
                <div class="board-card" v-if="boards.length !== 0 && displayMode === 'grid'" v-for="board in boards"
                     :key="board.id" :class="{share: board.type === 2}">
                    <router-link class="board-name light-content-text" :title="board.name"
                                 :to="{name: 'board', params: {id: board.id}}">{{board.name}}
                    </router-link>
                    <div class="overview-statistics">
                        <div class="statistics-item">
                            <p :title="$t('board.numberreports') + board.showsCount">{{board.showsCount}}</p>
                            <span class="disabled-text">{{'board.numberreports' | t}}</span>
                        </div>
                        <div class="statistics-item">
                            <p :title="board.userInfo.name">{{board.userInfo.name}}</p>
                            <span class="disabled-text">{{'board.founder' | t}}</span>
                        </div>
                        <div class="statistics-item">
                            <p :title="$t('board.viewnumber') + board.views">{{board.views}}</p>
                            <span class="disabled-text">{{'board.viewnumber' | t}}</span>
                        </div>
                    </div>
                    <div class="update-time">
                        <svg aria-hidden="true" class="clock-icon">
                            <use xlink:href="#icon-dark-clock"></use>
                        </svg>
                        {{'board.creationtime' | t}}:
                        <span class="light-content-text">{{board.updateTime}}</span>
                        <div class="board-action-icon" v-if="board.type !== 2"
                             :class="{active: deletingBoardId === board.id}">
                            <svg aria-hidden="true" @click="deletingBoardId = board.id" class="icon-delete">
                                <use xlink:href="#icon-round-close"></use>
                            </svg>
                            <inline-confirm v-if="deletingBoardId === board.id" @cancel="deletingBoardId = ''"
                                            :text="$t('board.suredelete')" @confirm="deleteBoard(board)"/>
                        </div>
                        <!-- 屏蔽分享功能
                        <div class="board-action-icon" v-if="board.type !== 2"
                             :class="{active: deletingBoardId === board.id}">
                            <svg aria-hidden="true" class="icon-share" @click="initShare(board)">
                                <use xlink:href="#icon-share"></use>
                            </svg>
                        </div>
                        -->
                    </div>
                </div>
            </transition-group>
            <block-empty v-if="boards.length === 0"/>
            <back-top/>
        </div>
        <!-- 新建数据看板 -->
        <confirm v-if="creatingNewBoard"
                 :title="$t('board.createboards')"
                 @cancel="cancelNewBoardCreating"
                 @confirm="createNewBoard">
            <div class="form-field">
                <label class="label" for="board">{{'board.boardname' | t}}</label>
                <input type="text" id="board" class="input lg" v-model.trim="newBoardName" autofocus
                       :placeholder="$t('board.overviewname')" maxlength="30"
                       @focusin="errorText = ''"
                       v-title:top.line.warn="errorText" :class="{error: errorText}">
            </div>
        </confirm>
        <kudu-modal></kudu-modal>
        <!-- 屏蔽分享功能 -->
        <!-- 分享模态框 -->
        <!--<share-modal v-if="sharingBoardId" :board-id="sharingBoardId" @close="sharingBoardId = ''"/>-->
    </div>
</template>
<script>
    import { WebServiceApiV1 } from '@/api';
    import {COMMON_NAME_REGEXP} from '@/common/utils/regs';
    import {ADD_BOARD, CHANGE_BOARDS_ORDER, REMOVE_BOARD, UPDATE_BOARD} from '@/store/vuex/mutationTypes';
    import {FETCH_BOARDS} from '@/store/vuex/actionTypes';
    // import ShareModal from './components/share-modal.vue';
    import {trackEvent} from '@/monitor';
    import {ANALYSIS_STORE_NAME} from '@/store/vuex/modules/analysisStore';
    import KuduModal from '../kudumodal.vue';
    import { mapState, mapMutations } from 'vuex';

    export default {
        name: 'boards',
        components: {KuduModal},
        data() {
            return {
                displayMode: 'grid', // grid or list
                orderOptions: [
                    {id: 'updateTimeReverse', name: this.$t('board.updateNeartofar')},
                    {id: 'updateTime', name: this.$t('board.updateFarandnear')},
                    {id: 'createTimeReverse', name: this.$t('board.createNeartofar')},
                    {id: 'createTime', name: this.$t('board.createFarandnear')}
                ],
                // 新建
                newBoardName: '', // 新建看板的名字
                creatingNewBoard: false, // 新建看板表单弹层是否可见
                errorText: '',
                // 分享
                // sharingBoardId: '', // 正在分享的看板ID
                // 删除
                deletingBoardId: '' // 正在删除的看板ID
            };
        },
        computed: {
            ...mapState({
                boardsOrder: state => state[ANALYSIS_STORE_NAME].boardsOrder,
                storeBoards: state => state[ANALYSIS_STORE_NAME].boards
            }),
            orderBy: {
                get() {
                    return this.boardsOrder;
                },
                set(newOrder) {
                    this.CHANGE_BOARDS_ORDER(newOrder);
                    this.$store.dispatch(FETCH_BOARDS);
                }
            },
            // 看板列表
            boards() {
                switch (this.$route.query.type) {
                    case 'my':
                        return this.storeBoards.filter(
                            board => board.type === 1
                        );
                    case 'shared':
                        return this.storeBoards.filter(
                            board => board.type === 2
                        );
                    case 'all':
                    default:
                        return this.storeBoards;
                }
            }
        },
        created() {
            this.$store.dispatch(FETCH_BOARDS);
        },
        // 屏蔽分享功能
        // beforeRouteEnter(to, from, next) {
        //     if (to.query.type) {
        //         next();
        //     } else {
        //         next({name: 'boards', query: {type: 'my'}});
        //     }
        // },
        methods: {
            ...mapMutations([
                CHANGE_BOARDS_ORDER,
                ADD_BOARD,
                UPDATE_BOARD,
                REMOVE_BOARD
            ]),
            cancelNewBoardCreating() {
                this.creatingNewBoard = false;
                this.errorText = '';
                this.newBoardName = '';
            },
            createNewBoard() {
                if (this.newBoardName === '') {
                    this.errorText = this.$t('board.notBeempty');
                    return;
                } else if (!COMMON_NAME_REGEXP.test(this.newBoardName)) {
                    this.errorText = this.$t('board.notContainFirst');
                    return;
                } else if (this.boards.some(board => this.newBoardName === board.name)) {
                    this.errorText = this.$t('board.existed');
                    return;
                }
                this.$loading();
                WebServiceApiV1
                    .create(this.newBoardName)
                    .then(({body: {data: {board}}}) => {
                        this.$loaded();
                        board.type = 1; // fix: 新创建的看板对象上没有 type 字段
                        trackEvent('数据看板-新建', {name: this.newBoardName});
                        this.ADD_BOARD(board);
                        this.creatingNewBoard = false;
                        this.newBoardName = '';
                        this.$store.dispatch(FETCH_BOARDS);
                    })
                    .catch(() => {
                        this.$loaded();
                    });
            },
            // initShare(board) {
            //     this.sharingBoardId = board.id;
            //     this.$loading();
            //     // fetch sharingBoard.users
            //     WebServiceApiV1
            //         .getSharedUsers(board.id)
            //         .then(({body: {data: {users}}}) => {
            //             this.$loaded();
            //              this.UPDATE_BOARD(Object.assign({}, board, {users}))
            //         })
            //         .catch(() => {
            //             this.$loaded();
            //         });
            // },
            deleteBoard(board) {
                this.$loading();
                WebServiceApiV1.deleteBoard(board.id)
                    .then(() => {
                        this.$loaded();
                        trackEvent('数据看板-删除', {id: board.id});
                        this.REMOVE_BOARD(board.id);
                    })
                    .catch(() => {
                        this.$loaded();
                    });
            }
        }
    };
</script>
<style lang="scss">
    @import "../../common/scss/base/variables";
    @import "../../common/scss/base/mixin";

    .boards {
        .board-types {
            display: flex;
            margin-right: 16px;
            text-align: center;
            line-height: $input-field-height - 2px;
            @include user-select(none);

            .board-type {
                flex: 1;
                width: 43px;
                border: 1px solid $form-border;
                color: $color-light-content;
                @include transition();

                &:first-child {
                    border-top-left-radius: 4px;
                    border-bottom-left-radius: 4px;
                }

                &:last-child {
                    border-top-right-radius: 4px;
                    border-bottom-right-radius: 4px;
                }

                + .board-type {
                    margin-left: -1px;
                }

                &:hover {
                    color: $light-theme;
                }

                &:active,
                &.router-link-exact-active {
                    position: relative;
                    background-color: $theme;
                    border-color: $theme;
                    color: white;
                }
            }
        }

        .display-modes {
            display: flex;
            margin-right: 16px;
            text-align: center;
            line-height: $input-field-height - 2px;
            @include user-select(none);

            .display-mode {
                flex: 1;
                width: $input-field-height - 2px;
                border: 1px solid $form-border;
                @include transition();
                cursor: pointer;

                &.active {
                    position: relative;
                    background-color: $theme;
                    border-color: $theme;

                    svg {
                        fill: white;
                    }
                }

                &:first-child {
                    border-top-left-radius: 4px;
                    border-bottom-left-radius: 4px;
                }

                &:last-child {
                    border-top-right-radius: 4px;
                    border-bottom-right-radius: 4px;
                }

                + .display-mode {
                    margin-left: -1px;
                }

                svg {
                    width: 16px;
                    height: 16px;
                    vertical-align: top;
                    margin-top: ($input-field-height - 16px - 2px)/2;
                    fill: $color-light-content;
                }
            }
        }

        .board-name {
            @include transition();

            &:hover {
                color: $light-blue;
                text-decoration: underline;
            }

            &:active {
                color: $dark-blue;
            }
        }

        .board-card {
            display: inline-block;
            position: relative;
            @include box-sizing();
            width: calc(#{100% / 3} - #{24px * 2 / 3});
            padding: 15px 20px;
            border: 1px solid $border-color;
            background-color: white;
            cursor: default;

            &:nth-of-type(3n + 2) {
                margin-left: 24px;
                margin-right: 24px;
            }

            &:nth-of-type(3n + 4) {
                margin-top: 22px;
            }

            &:hover {
                @include box-shadow(0 3px 8px rgba(#8b9daf, 0.16));

                .board-action-icon {
                    visibility: visible;
                }
            }

            &.share {
                &:after {
                    content: "分享看板";
                    position: absolute;
                    top: 10px;
                    right: 10px;
                    line-height: 20px;
                    padding: 0 5px;
                    border-radius: 4px;
                    border: 1px solid $border-color;
                    color: $color-light-content;
                }

                .board-name {
                    width: 80%;
                }
            }

            .board-name {
                display: inline-block;
                @include ellipsis();
                font-size: 18px;
                line-height: 26px;
                width: 100%;
            }

            .overview-statistics {
                display: flex;
                margin: 24px 0 30px;
                justify-content: space-between;

                .statistics-item {
                    padding-right: 8px;
                    @include ellipsis();

                    + .statistics-item {
                        border-left: 1px solid $border-color;
                        padding-left: 16px;
                    }

                    p {
                        font-size: 16px;
                        @include ellipsis();
                    }
                }
            }

            .update-time {
                line-height: 16px;
                color: $disabled;

                .clock-icon {
                    float: left;
                    width: 12px;
                    height: 12px;
                    margin: 2px 5px 0 0;
                    fill: currentColor;
                }
            }

            .board-action-icon {
                float: right;
                width: 14px;
                height: 14px;
                margin: 1px 0 0 16px;
            }
        }

        .board-line {
            .board-action-icon {
                display: inline-block;
                width: 16px;
                height: 16px;
                margin-left: 16px;
            }

            &:hover {
                .board-action-icon {
                    visibility: visible;
                }
            }
        }

        // 图标按钮
        .board-action-icon {
            display: inline-block;
            position: relative;
            visibility: hidden;
            cursor: pointer;

            &.active {
                visibility: visible;
            }

            svg {
                display: block;
                width: 100%;
                height: 100%;
                fill: $color-light-content;
                @include transition();
            }

            .icon-share {
                &:hover {
                    fill: $light-theme;
                }

                &:active {
                    fill: $dark-theme;
                }
            }

            .icon-delete {
                &:hover {
                    fill: $light-red;
                }

                &:active {
                    fill: $dark-red;
                }
            }
        }

        .board-action {
            display: inline-block;
            position: relative;
            padding-right: 10px;
        }
    }
</style>
