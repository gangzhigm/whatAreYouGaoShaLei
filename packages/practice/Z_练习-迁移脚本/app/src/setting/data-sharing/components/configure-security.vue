<template>
    <!--安全组-->
    <div class="configure-security">
        <div class="list-content all-list-content">
            <span v-if="this.type == 0" class="group-title">{{'EnterPrise.allSecurityGroup' | t}}&nbsp;（{{leftList.length}}）</span>
            <span v-if="this.type == 1" class="group-title">{{'EnterPrise.allDepartment' | t}}&nbsp;（{{leftList.length}}）</span>
            <span v-if="this.type == 2" class="group-title">{{'EnterPrise.allSecurityGroup' | t}}&nbsp;（{{leftList.length}}）</span>
            <div class="security-list all-list">
                <div class="security-item" :class="{'item-active':item.sel}" @click="handleSelect(item)"
                    :title="item.cName" v-for="item in leftList">
                    <checkbox v-model="addIds" :source="item.id">
                        {{item.cName}}
                    </checkbox>
                </div>
            </div>
        </div>
        <!--按钮组-->
        <div class="btn-content">
            <button class="btn btn-theme" :disabled="!leftList.length"
                    @click="handleRightAllClick">
                <i class="icon icon-shuangjiantouyou"></i>
            </button>
            <button class="btn btn-theme" :disabled="!addIds.length || selfIndex != 4 && addIds.length > 4 || selfIndex != 4 && selectList.length >= 4 || selfIndex != 4 && addIds.length + selectList.length > 4"
                    @click="handleRightOneClick">
                <i class="icon icon-arrow-right"></i>
            </button>
            <button class="btn btn-theme" :disabled="!removeIds.length"
                    @click="handleLeftOneClick">
                <i class="icon icon-arrow-left"></i>
            </button>
            <button class="btn btn-theme" :disabled="!selectList.length"
                    @click="handleLeftAllClick">
                <i class="icon icon-shuangjiantouzuo"></i>
            </button>
        </div>
        <div class="list-content select-list-content">
            <span v-if="this.type == 0" class="group-title">{{'EnterPrise.selectSecurityGroup' | t}}&nbsp;（{{selectList.length}}）</span>
            <span v-if="this.type == 1" class="group-title">{{'EnterPrise.selectDepartment' | t}}&nbsp;（{{selectList.length}}）</span>
            <span v-if="this.type == 2" class="group-title">{{'EnterPrise.selectSecurityGroup' | t}}&nbsp;（{{selectList.length}}）</span>
            <div class="security-list select-list">
                <div class="security-item" :class="{'item-active':item.sel}" @click="item.sel=!item.sel"
                    :title="item.cName" v-for="item in selectList">
                    <checkbox v-model="removeIds" :source="item.id">
                        {{item.cName}}
                    </checkbox>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
    export default {
        name: 'ConfigureSecurity',
        props: {
            list: Array,
            index: Number,
            selfIndex: Number,
            type: String,
            selList: Array,
            secutrityVal: String,
        },
        model: {
            prop: 'sv',
            event: 'handleSecurityClick'
        },
        data() {
            return {
                allList:[],
                allSelList:[],
                leftList: [],
                //选中的角色
                selectList: [],
                sv: this.secutrityVal,
                addIds: [],  // 所有联系人属性已选ids
                removeIds: [],     // 已选展示列的ids
            };
        },
        watch: {
            'index'(val, oldval){
                if (val === this.selfIndex || val === -1 && oldval === this.selfIndex) {
                    if (val >= 0 ) {
                        this.leftList = this.list;
                        if (this.selList.length >= 0 ) {
                            this.selectList = this.selList;
                            let curList = this.leftList.filter(item => {
                                let valueSel = this.selectList.find(selItem => selItem.id === item.id);
                                return !valueSel;
                            });
                            this.leftList = curList ;
                        }
                    }
                } 
            }
        },
        methods: {
            handleSelect(item) {
                if (!item.sel) {
                    this.$set(item, 'sel');
                }
                item.sel = !item.sel;
            },
            removeAndPush(removeAry, puseAry) {
                this.initAll(puseAry);
                for (let i = 0;i < removeAry.length;i++) {
                    let item = removeAry[i];
                    if (item.sel) {
                        //1.加入到右侧
                        puseAry.push(item);
                    }
                }
                for (let i = removeAry.length - 1; i >= 0; i--) {
                    let item = removeAry[i];
                    if (item.sel) {
                        //2.本数组删除
                        removeAry.splice(i, 1);
                    }
                }
                for (let i = 0;i < puseAry.length;i++) {
                    puseAry[i].sel = false;
                }
                this.sv = this.selectList.map(item => {
                    return item.id;
                }).join(',');
                this.$emit('handleSecurityClick', this.sv);
            },
            selectAll(ary) {
                for (let i = 0; i < ary.length; i++) {
                    let item = ary[i];
                    if (!item.sel) {
                        this.$set(item, 'sel');
                    }
                    item.sel = true;
                }
            },
            handleRightOneClick() {
                this.addIds = [];
                this.removeIds = [];
                this.removeAndPush(this.leftList, this.selectList);
            },
            handleRightAllClick() {
                this.selectAll(this.leftList);
                this.handleRightOneClick();
            },
            handleLeftOneClick() {
                this.addIds = [];
                this.removeIds = [];
                this.removeAndPush(this.selectList, this.leftList);
            },
            handleLeftAllClick() {
                this.selectAll(this.selectList);
                this.handleLeftOneClick();
            },
            //全部初始化为false
            initAll(ary) {
                for (let i = 0; i < ary.length; i++) {
                    let item = ary[i];
                    if (item) {
                        this.$set(item, 'sel', false);
                    }
                }
            },
        },
        components: {}
    };
</script>
<style type="text/css" lang="scss">
    @import '../../../common/scss/base/variables';
    @import '../../../common/scss/base/mixin';
    .configure-security {
        display: flex;
        flex-direction: row;
        width: 700px;
        .list-content {
            flex: 3;
            width: 200px;
            .security-list {
                border: solid 1px $form-border;
                border-radius: 0 0 4px 4px;
                height: 200px;
                max-height: 200px;
                overflow-y: auto;
                .security-item {
                    &:not(.disabled):hover {
                        background-color: $hover-bg;
                    }
                    .text-appended {
                        box-sizing: border-box;
                        width: 100%;
                        padding: 0 10px;
                        display: block;
                        @include ellipsis();
                    }
                }
                .item-active {
                    color: $green;
                }
            }
            .group-title {
                display: inline-block;
                background-color: $light-green;
                color: #fff;
                border-radius: 4px 4px 0 0 ;
                width: 100%;
                text-align: center;
            }
        }
        .btn-content {
            display: flex;
            flex: 1;
            flex-direction: column;
            justify-content: space-evenly;
            align-items: center;
            padding: 10px;
        }
    }

</style>
