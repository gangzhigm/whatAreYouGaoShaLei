<template>
    <div class="building-solutions-tabs" ref="buildingSolutionsTabs">
        <div class="tab-to-left icon icon-fanhui1" @click="left" v-if="index!==0&&btnShow"></div>
        <div class="tab-content" ref="tabContent">
            <div class="tab-links build-case-links" ref="buildCaseLinks" :class="{'isBlock':isBlock}"
                :style="{left:tabLinksLeft+'px'}">
                <div class=" tab-link build-case-tab" ref="buildCaseTab" @click="active(i)"
                    :class="{active: tab.active}" v-for="(tab,i) in tabList">{{tab.name}}</div>
            </div>
        </div>
        <div class="tab-to-right icon icon-fanhui" @click="right" v-if="rightBtnShow&&btnShow"></div>
    </div>
</template>
<script>

export default {
    name: 'BuildingSolutionsTabs',
    props: {
        //tab 样式 是否是灰色 背景的块
        isBlock: {
            type: Boolean,
            default: false
        },
        tabList: {
            type: Array,
            default: []
        }
    },
    data () {
        return {
            index: 0,//左移的tab数量
            rightBtnShow: true,
            btnShow: false,//左右箭头是否显示
            tabLinksLeft: 0
        };
    },
    watch: {
        index () {
            const contentWidth = this.$refs.tabContent.offsetWidth;
            const linksTab = this.$refs.buildCaseLinks.offsetWidth;
            if (this.index !== 0) {
                this.rightBtnShow = (linksTab + this.tabLinksLeft) > contentWidth;
            } else {
                this.rightBtnShow = true;
            }
        }
    },
    methods: {
        //父级tab切换
        active (i) {
            if (this.tabList[i].active) return;
            this.tabList.forEach(e => {
                e.active = false;
            });
            this.tabList[i].active = true;
            this.$emit('active', i);
            this.tabMove(i);
        },
        //显示隐藏的tab
        tabMove (i) {
            const tab = this.$refs.buildCaseTab;
            let sumWidth = 0;
            for (let j = 0; j < tab.length; j++) {
                if (j < i) {
                    sumWidth += tab[j].offsetWidth;
                }
            }
            const contentWidth = this.$refs.tabContent.offsetWidth;
            if ((sumWidth + tab[i].offsetWidth + this.tabLinksLeft) > contentWidth) {
                this.right();
            }
            if (this.tabLinksLeft !== 0 && sumWidth + this.tabLinksLeft === 0) {
                this.left();
            }
        },
        right () {
            const tab = this.$refs.buildCaseTab;
            const x = tab[this.index].offsetWidth;
            this.index = this.index + 1;
            let left = this.$refs.buildCaseLinks.style.left.replace('px', '');
            this.tabLinksLeft = parseFloat(left || 0) - x;
        },
        left () {
            const tab = this.$refs.buildCaseTab;
            this.index = this.index - 1;
            const x = tab[this.index].offsetWidth;
            let left = this.$refs.buildCaseLinks.style.left.replace('px', '');
            this.tabLinksLeft = parseFloat(left || 0) + x;
        }
    },
    mounted () {
        this.$nextTick(() => {
            const linksTab = this.$refs.buildCaseLinks.offsetWidth;
            const tabsWidth = this.$refs.buildingSolutionsTabs.offsetWidth;
            this.btnShow = linksTab > tabsWidth;
        });
    },
};
</script>

<style lang="scss">
@import '../../../../common/scss/base/variables';
@import '../../../../common/scss/base/mixin';
.building-solutions-tabs {
    height: 34px;
    position: relative;
    .tab-to-left,
    .tab-to-right {
        font-size: 16px;
        position: absolute;
        height: 34px;
        line-height: 34px;
        cursor: pointer;
    }
    .tab-to-left {
        left: 0;
    }
    .tab-to-right {
        right: 0;
    }
    .tab-content {
        position: absolute;
        left: 16px;
        right: 16px;
        height: 34px;
        overflow: hidden;
        .build-case-links {
            left: 0;
            position: absolute;
            padding: 0;
            display: flex;
            justify-content: space-between;
            white-space: nowrap;
            height: 34px;
            &::after {
                position: absolute;
                content: '';
                height: 0;
                left: 0;
                width: 100%;
                bottom: 0px;
                border-bottom: 2px solid #f5f5f5;
            }
            .tab-link {
                float: unset;
                &::after {
                    z-index: 1;
                    bottom: -2px;
                }
            }

            &::-webkit-scrollbar {
                display: none;
            }
        }
        .isBlock {
            .tab-link {
                &:hover {
                    background: $title-bg;
                    border-radius: 4px 4px 0 0;
                }
            }
            .active {
                background: $title-bg;
                border-radius: 4px 4px 0 0;
            }
        }
    }
}
</style>