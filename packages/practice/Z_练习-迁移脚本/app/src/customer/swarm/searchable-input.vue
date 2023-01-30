<template>
    <div v-blur="hiddenSearchBox" class="searchable-input">
        <input class="input" :class="size"  type="text" v-model.trim="target.value" :maxlength="maxlength" :disabled="disabled"
            @input="searchTarget($event)" @focus="handleFocus">
        <div class="search-result-box" v-show="showSearchResult">
            <ul class="search-result-list" v-if="searchResultList.length">
                <li v-for="(val,index) in searchResultList" :title="val" :key="index" @click="selectSearchItems(val)">
                    {{val}}
                </li>
            </ul>
        </div>
    </div>
</template>
<script type="text/ecmascript-6">
import debounce from 'lodash/debounce';

export default {
    name: 'searchableInput',
    props: {
        // 输入文本之最大长度
        maxlength: {
            type: Number,
            default: 20
        },
        // 目标对象
        target: {
            type: Object,
            required: true
        },
        // 搜索结果
        searchResultList: {
            type: Array,
            required: true
        },
        disabled: {
            type: Boolean,
            default: false
        },
        size: {
            type: String,
            default: ''
        },
        emptySearch: {
            type: Boolean,
            default: false
        }, // 是否展示展示空关键字的搜索结果
        isFactor: {
            type: Boolean,
            default: false
        }, // 联系人评分是否使用该组件
    },
    data () {
        return {
            showSearchResult: false
        };
    },
    methods: {
        // 失焦关闭结果列表
        hiddenSearchBox () {
            this.showSearchResult = false;
            if (!this.isFactor) {
                this.$emit('select');
            }
        },
        // 搜索事件
        searchTarget: debounce(function (e) {
            if (!this.emptySearch && !e.target.value) {
                this.showSearchResult = false;
                this.$emit('select');
                return;
            }
            let params = {
                value: e.target.value,
                fieldName: this.target.field_name
            };
            this.$emit('search', params);
            this.showSearchResult = true;
        }, 500),
        // 选择搜索到内容
        selectSearchItems (val) {
            this.target.value = val;
            this.showSearchResult = false;
            this.$emit('select');
        },
        handleFocus() {
            if (this.emptySearch && this.searchResultList.length){
                this.showSearchResult = true;
            }
        }
    }
};
</script>

<style lang="scss" type="text/scss" rel="stylesheet/scss">
@import '../../common/scss/base/variables';
@import '../../common/scss/base/mixin';

.searchable-input {
    .input {
        width: 180px;
        box-sizing: border-box;
        &.md {
            width: 150px;
        }
    }
    display: inline-block;
    vertical-align: top;
    .search-result-box {
        position: relative;
        @include clearfix();
        .search-result-list {
            position: absolute;
            right: 0;
            top: 5px;
            width: 100%;
            background: #fff;
            @include border-radius(4px);
            @include box-sizing();
            border: 1px solid $border-color;
            z-index: 1;
            li {
                width: calc(100% - 20px);
                padding: 0 10px;
                line-height: 25px;
                font-size: 12px;
                @include ellipsis();
                cursor: pointer;
            }
        }
    }
}
</style>