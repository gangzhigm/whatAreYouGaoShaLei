<template>
    <div class="preview-list">
        <div class="preview-left pull-left" v-if="tabIndex !== 0" @click="loadLeft">
            <svg aria-hidden="true">
                <use xlink:href="#icon-fanhui1"></use>
            </svg>
        </div>
        <div class="preview-top pull-left"
             :class="{preLeft: tabIndex !== 0, preRight: tabIndex !== tabList.length}"
             ref="tab_bar">
            <ul>
                <li @click="changeList(tab)" :class="{active:buttonName === tab.routeName}" id="tab-li"
                    v-for="tab in tabList" :title="tab.name">{{tab.name}}
                </li>
            </ul>
        </div>
        <div class="preview-right pull-left" v-if="tabIndex !== tabList.length" @click="loadRight">
            <svg aria-hidden="true">
                <use xlink:href="#icon-fanhui"></use>
            </svg>
        </div>
        <div class="preview-content pull-left">
            <preview-user v-if="buttonName === 'user'" :type="type" :show-users="showUsers"/>
            <preview-event v-else :eventId="eventId" :type="type"/>
        </div>
    </div>
</template>
<script>
    import { WebServEventApiV1 } from '@/api';
    import previewUser from './preview-user.vue';
    import previewEvent from './preview-event.vue';

    let tabList = [
        {name: 'USER', routeName: 'user'},
    ];
    export default {
        name: 'preview-list',

        components: {
            previewUser,
            previewEvent,
        },

        props: {
            type: String,//sdk,sftp,api
        },

        computed: {
            /**
             * btn按钮name
             * @returns {string | (string | null)[]}
             */
            buttonName() {
                return this.$route.query.previewName;
            },
            eventId() {
                if (this.eventList.length > 0) {
                    return this.eventList.find(event => event.meaning === this.buttonName).id;
                }
                return 0;   // user
            }
        },

        data() {
            return {
                tabList,    //tab列表
                tabIndex: 0,    //tab下标
                eventList: [],
                showUsers: false, // user，是否默认加载数据
            };
        },

        mounted() {
            if (!this.buttonName) {
                this.$router.replace({
                    name: this.$route.name,
                    query: {
                        ...this.$route.query, previewName: this.tabList[0].routeName,
                    }
                });
            }

            this.fetchEvents();
        },

        methods: {
            // left 加载更多
            loadLeft() {
                const tabWidth = document.getElementById('tab-li').clientWidth;
                this.tabIndex = this.tabIndex <= 0
                    ? 0
                    : this.tabIndex -= 5;
                this.$refs.tab_bar.scroll({top: 0, left: this.tabIndex * tabWidth, behavior: 'smooth'});
            },
            // right 加载更多
            loadRight() {
                const tabWidth = document.getElementById('tab-li').clientWidth;
                this.tabIndex = this.tabIndex >= this.tabList.length
                    ? this.tabList.length
                    : this.tabIndex += 5;
                this.$refs.tab_bar.scroll({top: 0, left: this.tabIndex * tabWidth, behavior: 'smooth'});
            },
            /**
             *  切换数据
             * @param tab
             */
            changeList(tab) {
                this.showUsers = tab.routeName === 'user';
                this.$router.replace({
                    name: this.$route.name,
                    query: {...this.$route.query, previewName: tab.routeName}
                });
            },

            // 获取事件列表
            fetchEvents() {
                this.$loading();
                WebServEventApiV1
                    .getMetaEventList()
                    .then(res => {
                        if (res.body.data.eventList.length > 0) {
                            this.eventList = res.body.data.eventList;
                            // tabList event
                            this.tabList = [{name: 'USER', routeName: 'user'}];
                            this.eventList.forEach(event => {
                                this.tabList.push({name: event.meaning, routeName: event.meaning});
                            });
                        }
                        this.$loaded();
                    })
                    .catch(() => {
                        this.$loaded();
                    });
            },
        },
    };
</script>
<style lang="scss" type="text/scss" rel="stylesheet/scss">
    @import "../../../../common/scss/base/variables";
    @import "../../../../common/scss/base/mixin";

    $tab-height: 48px;
    $tab-width: 102px;
    .preview-list {
        .preLeft {
            margin-left: -32px;
        }

        .preRight {
            margin-right: -32px;
        }

        .preview-top {
            position: relative;
            width: 100%;
            height: $tab-height + 8px;
            overflow-x: auto;
            overflow-y: hidden;

            ul {
                display: inline;
                white-space: nowrap;

                li {
                    display: inline-block;
                    position: relative;
                    width: $tab-width;
                    height: $tab-height;
                    line-height: $tab-height;
                    background: #fff;
                    text-align: center;
                    border-top: 1px solid $select-border;
                    border-left: 1px solid $select-border;
                    color: $color-light-content;
                    cursor: pointer;
                    box-sizing: border-box;
                    overflow: hidden;
                    @include ellipsis();

                    &:after {
                        content: '';
                        position: absolute;
                        width: $tab-width - 1;
                        border-bottom: 1px solid $select-border;
                        bottom: 0;
                        left: 0;
                        z-index: 0;
                    }

                    &:last-child {
                        border-right: 1px solid $select-border;
                    }

                    &.active {
                        background: $title-bg;
                        color: $green;
                        border-top: 2px solid $green;
                        position: relative;

                        &:after {
                            border-bottom: 1px solid $title-bg;
                        }
                    }
                }
            }
        }

        .preview-left {
            position: relative;
            left: 0;
            height: $tab-height;
            opacity: 0.4;
            cursor: pointer;
            background: linear-gradient(to right, black, white);
            z-index: 1;
            @include user-select(none);

            svg {
                position: relative;
                top: 16px;
                width: 32px;
                height: 16px;
                fill: #fff;
                cursor: pointer;
            }
        }

        .preview-right {
            position: relative;
            left: 0;
            height: $tab-height;
            opacity: 0.4;
            cursor: pointer;
            background: linear-gradient(to right, white, black);
            @include user-select(none);

            svg {
                position: relative;
                top: 16px;
                width: 32px;
                height: 16px;
                fill: #fff;
                cursor: pointer;
            }
        }

        .preview-content {
            width: 100%;
            margin-top: -8px;
        }
    }
</style>
