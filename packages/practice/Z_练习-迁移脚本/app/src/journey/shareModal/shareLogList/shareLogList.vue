<template>
    <modal :title="$t('material.shareList')" v-if="modalShow" @close="close" :size="'lg'">
        <div class="title-and-desc-form title-and-desc-form-share-log">
            <list-search-empty class="box-center" v-if="!shareLogList.totalRow || shareLogList.totalRow == 0"/>
            <div class="title-and-desc-form-list" v-if="shareLogList.totalRow && shareLogList.totalRow != 0">
                <shareTable :shareLogList=shareLogList :nowPage=nowPage @openDeleteModal="openDeleteModal" @switchPage="switchPage"></shareTable>
            </div>
        </div>
        <template v-slot:buttons>
            <input type="button" class="btn btn-md btn-theme-border" :value="$t('material.shareGoBack')"
                    @click="close"
                    >
            <input type="button" class="btn btn-md btn-theme-border" :value="$t('common.close')"
                    @click="closeAll"
                    >
        </template>
        <del-share-modal @deleteSharing="deleteSharing" ref="delShareModal"/>
    </modal>
</template>
<script type="text/babel">
    import { JourneyMaterialApiV1, QuestionnaireApiV1 } from '@/api';
    // 共享记录列表
    import shareTable from './shareTable.vue';
    // 删除共享记录弹框
    import delShareModal from './delShareModal.vue';
    export default {
        components: {
            shareTable,
            delShareModal
        },
        data() {
            return {
                shareLogList:{}, //分享记录列表
                modalShow:false, // 列表显隐开关
                elementId: 0, // 当前元素ID
                elementType: 0, // 当前元素类型
                nowPage: 1, // 当前页码
            };
        },
        methods: {
            // 展示弹框
            show(elementId,elementType){
                this.elementId = elementId;
                this.elementType = elementType;
                this.modalShow = true;
                this.getList();
            },
            // 关闭弹框
            close(){
                this.modalShow = false;
            },
            // 关闭所有弹框
            closeAll(){
                this.$emit('parentClose');
            },
            // 分页操作
            switchPage(pageNumber) {
                this.shareLogList.totalRow = 0;
                this.nowPage = pageNumber;
                this.getList(pageNumber);
            },
            // 获取列表
            getList(pageNumber = 1){
                this.nowPage = pageNumber;
                if (this.elementType < 3) {
                    JourneyMaterialApiV1
                        .findMaterialSharingList({materialId:this.elementId,pageNumber:pageNumber,type:this.elementType})
                        .then((res)=>{
                            this.shareLogList = {
                                totalRow:res.body.data.totalRow,
                                totalPage:res.body.data.totalPage,
                                list:res.body.data.materialList,
                                type: 1
                            };
                        });
                } else {
                    QuestionnaireApiV1
                        .findFormSharingList({paperId:this.elementId,pageNumber:pageNumber})
                        .then((res)=>{
                            this.shareLogList = {
                                totalRow:res.body.data.totalRow,
                                totalPage:res.body.data.totalPage,
                                list:res.body.data.sharedList,
                                type: 2
                            };
                        });
                }
            },
            // 打开删除弹框
            openDeleteModal(id){
                this.$refs.delShareModal.show(id);
            },
            // 删除共享记录
            deleteSharing(id){
                if (this.elementType < 3) {
                    JourneyMaterialApiV1
                        .deleteMaterialSharing(id)
                        .then(()=>{
                            this.$toast('删除成功','info');
                            this.getList();
                            this.$refs.delShareModal.close();
                        });
                } else {
                    QuestionnaireApiV1
                        .deleteFormSharing(id)
                        .then(()=>{
                            this.$toast('删除成功','info');
                            this.getList();
                            this.$refs.delShareModal.close();
                        });
                }
            }
        }
    };

</script>
<style lang="scss" type="text/scss" rel="stylesheet/scss">
    .title-and-desc-form-share-log{
        display: flex;
        flex-direction: row;
        justify-content: space-between;
        min-height:200px;
    }
    .title-and-desc-form-list{
        width:100%;
    }
    .box-center{
        margin: auto;
    }
</style>
