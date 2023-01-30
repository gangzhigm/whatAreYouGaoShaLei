<template>
    <modal :title="$t('shoppingGuide.numberOfTaskTaggers')" class="return-tags" @close="$emit('close')">
        <div class="form-field tags-list">
            <div v-for="tags in rerurnTaskTagList" :key="tags.id">
                <label class="label tag-width">{{tags.name}}</label>
                <span class="data-theme" @click="toTagPage">{{tags.labelPerson}}</span>
            </div>
        </div>
        <div class="form-field tips">*{{'shoppingGuide.getData' | t}}</div>
    </modal>
</template>
<script type="text/babel">
import { WecomApiV1 } from '@/api';
export default {
    props:{
        labelIds:{
            type: Array,
            default: []
        },
    },
    mounted(){
        this.getTagsPerson();
    },
    data () {
        return {
            rerurnTaskTagList: []
        };
    },
    methods:{
        // 获取标签人数
        getTagsPerson() {
            WecomApiV1
                .getLabelCount({labelIds:this.labelIds})
                .then((res)=>{
                    this.rerurnTaskTagList = res.body.data.labelJson;
                });
        },
        toTagPage() {
            let url = this.$router.resolve({
                name:'tagManage'
            });
            window.open(url.href, '_blank');
        }
    }
};
</script>
<style lang="scss" scoped>
    @import "../../../../../common/scss/base/variables";
    @import "../../../../../common/scss/base/mixin";
    .return-tags{
        .label{
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
        }
        .tags-list{
            display: inline-block;
            width: 578px;
            max-height: 126px;
            overflow: scroll;
            .tag-width{
                width: 240px;
                white-space: nowrap;
                overflow: hidden;
                text-overflow: ellipsis;
            }
            .data-theme {
                display: inline-block;
                color: $theme;
                cursor: pointer;
            }
        }
        .tips {
            color: $disabled;
        }
    }
</style>