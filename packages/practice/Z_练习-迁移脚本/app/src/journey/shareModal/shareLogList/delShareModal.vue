<template>
        <modal :title="$t('journeyList.optionsSure')" v-if="modalShow" @close="close" :size="'md'">
            <div class="title-and-desc-form">
                {{'material.delDesc' | t}}
            </div>
            <template v-slot:buttons>
                <input type="button" class="btn btn-md btn-theme-border" :value="$t('common.cancel')"
                       @click="close"
                       >
                <input type="button" class="btn btn-md btn-theme-border" :value="$t('common.confirm')"
                       @click="delect"
                       >
            </template>
        </modal>
</template>
<script type="text/babel">
    export default {
        data() {
            return {
                modalShow: false, // 弹框显隐开关
                elementId: 0, // 当前选中元素id
            };
        },
        methods: {
            // 显示弹框
            show(elementId){
                this.elementId = elementId;
                this.modalShow = true;
            },
            // 关闭弹框
            close(){
                this.modalShow = false;
            },
            // 确认删除
            delect(){
                this.$emit('deleteSharing',this.elementId);
            },
        }
    };
</script>