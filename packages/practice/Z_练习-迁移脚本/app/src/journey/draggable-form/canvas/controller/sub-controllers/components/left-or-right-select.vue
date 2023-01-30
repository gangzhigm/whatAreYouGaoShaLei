<template>
    <modal :title="title" class="area-select" @close="$emit('close')">
        <div class="left-area select-items">
            <p v-if="leftName" class="area-name">{{leftName}}</p>
            <div class="left-data-list">
                <ul class="select-list" v-if="typeof leftList[0] !== 'string'">
                    <li v-for="left in leftList" :key="left.id">
                        <checkbox :source="left.id" v-model="chosenLeftItems">{{left.name}}</checkbox>
                    </li>
                </ul>
                <ul class="select-list" v-else>
                    <li v-for="left in leftList" :key="left">
                        <checkbox :source="left" v-model="chosenLeftItems">{{left}}</checkbox>
                    </li>
                </ul>
            </div>
        </div>
        <div class="middle-btn">
            <button class="btn btn-theme btn-sm" :disabled="!leftList.length"
                    @click="selectAll('right')">
                <i class="icon icon-shuangjiantouyou"></i>
            </button>
            <button class="btn btn-theme btn-sm" :disabled="!chosenLeftItems.length"
                    @click="selectItems('right')">
                <i class="icon icon-arrow-right"></i>
            </button>
            <button class="btn btn-theme btn-sm" :disabled="!chosenRightItems.length"
                    @click="selectItems('left')">
                <i class="icon icon-arrow-left"></i>
            </button>
            <button class="btn btn-theme btn-sm" :disabled="!rightList.length"
                    @click="selectAll('left')">
                <i class="icon icon-shuangjiantouzuo"></i>
            </button>
        </div>
        <div class="right-area select-items">
            <p v-if="rightName" class="area-name">{{rightName}}</p>
            <div class="right-data-list">
                <ul class="select-list" v-if="typeof rightList[0] !== 'string'">
                    <li v-for="right in rightList" :key="right.id">
                        <checkbox :source="right.id" v-model="chosenRightItems">{{right.name}}</checkbox>
                    </li>
                </ul>
                <ul class="select-list" v-else>
                    <li v-for="right in rightList" :key="right">
                        <checkbox :source="right" v-model="chosenRightItems">{{right}}</checkbox>
                    </li>
                </ul>
            </div>
        </div>
        <button slot="buttons" :disabled="!rightList.length"
                class="btn btn-md btn-theme" @click="confirmLinks">确认</button>
    </modal>
</template>

<script>
    export default {
        name: 'left-or-right-select',
        props: {
            title: {
                type: String,
                default: '提示'
            },
            leftName: String,
            rightName: String,
            leftOptions: Array,
            rightOptions: Array
        },
        mounted() {
            // just data
            this.leftList = [...this.leftOptions];
            this.rightList = [...this.rightOptions];
        },
        data() {
            return {
                leftList: [],
                rightList: [],
                chosenLeftItems: [],
                chosenRightItems: []
            };
        },
        methods: {
            selectItems(direction) {
                if (direction === 'left' && this.rightList.length) {
                    let resultList = this.translateItems(this.chosenRightItems,this.rightList,this.leftList);
                    this.leftList = resultList[1];
                    this.rightList = resultList[0];
                }
                if (direction === 'right' && this.leftList.length) {
                    let resultList = this.translateItems(this.chosenLeftItems,this.leftList,this.rightList);
                    this.leftList = resultList[0];
                    this.rightList = resultList[1];
                }
                this.chosenRightItems = [];
                this.chosenLeftItems = [];
            },
            selectAll(direction) {
                if (direction === 'left') {
                    this.leftList = [...this.leftList,...this.rightList];
                    this.rightList = [];
                }
                if (direction === 'right') {
                    this.rightList = [...this.rightList,...this.leftList];
                    this.leftList = [];
                }
                this.chosenRightItems = [];
                this.chosenLeftItems = [];
            },
            translateItems(ids,removeList,addItems) {
                ids.forEach(ids =>{
                    let delTarget,targetItems;
                    if (typeof ids === 'number') {
                        delTarget = removeList.findIndex(list => list.id === ids);
                        targetItems = removeList.filter(list => list.id === ids);
                    } else {
                        delTarget = removeList.findIndex(list => list === ids);
                        targetItems = removeList.filter(list => list === ids);
                    }
                    if (delTarget > -1) {
                        removeList.splice(delTarget,1);
                    }
                    addItems = addItems.concat(targetItems);
                });
                return [removeList,addItems];
            },
            confirmLinks() {
                this.$emit('confirm',{left: this.leftList,right: this.rightList});
            }
        }
    };
</script>

<style lang="scss">
    @import '../../../../../../common/scss/base/_variables';
    @import '../../../../../../common/scss/base/_mixin';

    .area-select {
        .modal-content {
            display: flex;
            .area-name {
                margin-bottom: 5px;
                font-size: 13px;
            }
        }
        .select-items {
            div {
                width: 200px;
                height: 350px;
                overflow: scroll;
                border: 1px solid #e4e9ed;
                @include border-radius(5px);
            }
            .select-list {
                li {
                    margin: 8px 0;
                    padding: 0 8px;
                }
            }
        }
        .middle-btn {
            align-items: center;
            display: flex;
            flex: 1;
            flex-direction: column;
            justify-content: space-evenly;
            .btn + .btn {
                margin: 0;
            }
        }
    }
</style>