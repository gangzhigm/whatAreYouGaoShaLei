<template>
    <div class="operate-authority">
        <p class="operate-text">{{'privilege.settingFunction' | t}}</p>
        <div class="content-table">
            <ul class="row table-head">
                <li class="level-one">{{'privilege.model' | t}}</li>
                <ul class="row-level-two">
                    <li class="level-two">{{'privilege.page' | t}}</li>
                    <div class="row-level-three">
                        <p>{{'privilege.function' | t}}</p>
                    </div>
                </ul>
            </ul>
            <ul v-for="(item,index) in value" class="row table-content">
                <!-- 模块 -->
                <li class="level-one">{{item.menuName}}</li>
                <ul v-for="(itm,idx) in item.menuList" class="row-level-two" :class="{margin:idx!==0}">
                    <!-- 页面 -->
                    <li class="level-two">
                        <checkbox v-model="itm.showType" @input="changePage(itm,item,idx)" :disabled="itm.disabled">{{itm.menuName}}</checkbox> 
                    </li>
                    <div class="row-level-three" :class="{marginThree:idx!==0}">
                        <!-- 功能 -->
                        <p v-for="(itms,i) in itm.menuList">
                            <template v-if="itms.id===-1||itms.id>0">
                              <div class="checkboxRestrictions">
                                  <checkbox v-model="itms.showType" @input="changeFunction(itms,item,idx)">{{itms.menuName}}</checkbox>
                                  <i v-if="itms.menuName=='解除限制条件'|| itms.menuName=='Lift the restriction'"
                                      class="action-icon icon icon-yiwen1"
                                      v-title:right="$t('common.restrictionsOnOffTip')"
                                  ></i>
                                   <i v-if="itms.menuName=='配置空值'|| itms.menuName=='Configure null'"
                                      class="action-icon icon icon-yiwen1"
                                      v-title:right="$t('common.restrictionsCheckedTip')"
                                  ></i>
                              </div>
                               
                            </template> 
                            <span v-else>-</span>
                        </p>
                    </div>
                </ul>
            </ul>
            <ul class="row table-content"><list-empty v-if="value.length===0"/></ul>
        </div>
    </div>
</template>

<script>
    export default {
        name: 'operateAuthority',
        props: {
            value: Array,
        },
        data() {
            return {
            };
        },
        methods: {
            changePage(itm,item,idx) {
                // 操作全选页面
                if (itm.id < 0) {
                    // 页面全选或取消全选，则页面联动
                    item.menuList.forEach(menu => {
                        menu.showType = itm.showType;
                    });
                    // 页面取消全选，则功能全部不选中
                    if (!itm.showType) {
                        item.menuList.forEach(menu => {
                            menu.menuList.forEach(i => {
                                i.showType = 0;
                            });
                        });
                    }
                } else { //操作单个页面
                    // 单个页面的选中与取消与全选联动
                    if (!itm.showType) { //单个页面的取消，则页面的全选功能取消
                        item.menuList[0].showType = 0;
                    } else {
                        let selectAll = true;
                        item.menuList.forEach((item,index) => {
                            if (item.showType !== itm.showType && index !== 0) {
                                selectAll = false;
                            }
                        });
                        item.menuList[0].showType = selectAll ? 1 : 0;
                    }
                    // 单个页面取消选中，该页面对应的功能取消选中，且功能全选取消
                    if (!itm.showType) { 
                        item.menuList[idx].menuList.forEach(menu => {
                            menu.showType = 0;
                        });
                        item.menuList[0].menuList[0].showType = 0;
                    }
                }
            },
            changeFunction(itms,item,idx) {
                // 操作全选功能
                if (itms.id < 0) {
                    // 功能全选或取消全选，则页面联动
                    item.menuList.forEach(menu => {
                        menu.menuList.forEach(i => {
                            i.showType = itms.showType;
                        });
                    });
                    // 功能全选，则页面全选
                    if (itms.showType) {
                        item.menuList.forEach(menu => {
                            menu.showType = 1;
                        });
                    }
                } else { //操作单个功能
                    // 单个功能的选中与取消与功能的全选功能联动
                    if (itms.showType) {
                        let selectAll = true;
                        item.menuList.forEach((menu, index) => {
                            menu.menuList.forEach(itm => {
                                if (itm.showType !== itms.showType && index !== 0 && itm.id > 0) {
                                    selectAll = false;
                                }
                            });
                        });
                        item.menuList[0].menuList[0].showType = selectAll ? 1 : 0;
                    } else { //单个功能取消，则功能的全选取消
                        item.menuList[0].menuList[0].showType = 0;
                    }
                    // 单个功能只要有一个选中，则对应的页面选中
                    if (itms.showType) { 
                        item.menuList[idx].showType = 1;
                    }
                    // 某个功能的单选全部选中，则对应页面的全选功能判断是否需要选中
                    if (itms.showType) { 
                        let selectPageAll = true;
                        item.menuList.forEach((menu,index) => {
                            if (!menu.showType && index !== 0) {
                                selectPageAll = false;
                            }
                        });
                        item.menuList[0].showType = selectPageAll;
                    }
                }
            }
        }
    };
</script>

<style lang="scss">
    @import "../../../common/scss/base/variables";
    @import "../../../common/scss/base/mixin";
    .operate-authority {
        .operate-text {
            margin-bottom: 16px;
            margin-top: 8px;
        }
        .content-table {
            ul,li,p,div {
                display: inline-block;
                box-sizing: border-box;
            }
            p {
                line-height: 40px;
                margin-right: 4px;
            }
            .level-one {
                width: 140px;
                height: 40px;
                line-height: 40px;  
                float:left;
                padding: 0 8px;
            }
            .row-level-two {
                border-left: 1px solid $form-border;
            }
            .level-two {
                width: 200px;
                height: 40px;
                line-height: 40px;
                float:left;
                padding: 0 8px;
            }
            .row {
                display: block;
                width: 780px;
                border-bottom: 1px solid $form-border;
                border-left: 1px solid $form-border;
                border-right: 1px solid $form-border;
                &:first-child {
                    border-top: 1px solid $form-border;
                }
            }
            .margin {
                display: block;
                margin-left: 140px;
                .level-two {
                    border-top: 1px solid $form-border;
                }
            }
            .marginThree {
                border-top: none;
                padding: 0 8px;
            }
            .row-level-three {
                line-height: 40px;
                width: 437px;
                padding: 0 8px;
                border-left: 1px solid $form-border;
                &.marginThree {
                    border-top: 1px solid $form-border;
                }
            }
            .table-head {
                background-color: $title-bg;
                color: #6e7376;
                font-weight: bold;
            }
            .table-content {
                .row-level-two {
                    &:hover {
                        background-color: $select-bg;
                    }
                }
                .list-empty {
                    width: 100%;
                }
            }
        }
    }
    
    .checkboxRestrictions{
      display: flex;
      i{
        margin: 0 5px 0 0;
      }
    }
</style>