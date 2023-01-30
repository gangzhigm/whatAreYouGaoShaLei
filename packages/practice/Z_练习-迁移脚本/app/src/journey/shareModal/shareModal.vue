<template>
    <modal :title="$t('material.newShare')" v-if="modalShow" @close="close">
        <div class="title-and-desc-form title-and-desc-form-share">
            <label for="title" class="label">{{'material.toWhom' | t}}</label>
            <div class="member-select">
                <singleselector @getMemberChooseList="getMemberChooseList"/>
            </div>
            <div class="cursor-default">{{'material.shareden' | t}}:</div>
            <authority @getAuthorityChooseList="getAuthorityChooseList" :type="elementType" :materialType="materialType"/>
        </div>
        <template v-slot:buttons>
            <div class="left-btn theme-text" :title="$t('material.shareList')" @click="openList">
                {{'material.shareList'| t}}
            </div>
            <button type="button" class="btn btn-md btn-theme-border" @click="close">{{'common.cancel' | t}}</button>
            <button type="button" class="btn btn-md btn-theme" @click="save">{{'common.confirm' | t}}</button>
        </template>
        <share-log-list @parentClose='close' ref="shareModel"/>
    </modal>
</template>
<script type="text/babel">
    import { JourneyMaterialApiV1, QuestionnaireApiV1 } from '@/api';
    // 共享记录弹框
    import shareLogList from './shareLogList/shareLogList.vue';
    // 成员选择组件
    import singleselector from './singleselector.vue';
    // 权限选择组件
    import authority from './authority.vue';

    export default {
        components: {
            singleselector,
            authority,
            shareLogList
        },
        data() {
            return {
                modalShow: false, // 弹框显隐
                elementId: 0, // 当前元素id
                elementType: 1, // 当前元素类型 1 邮件 2 邮件头尾模板 3 金数据 4 DMT标准表单
                memberChooseList: [], // 当前选中的成员列表
                authorityChooseList: [], // 当前选中的权限列表
                material: {},
                materialType: 0, //通过素材类型判断（type=0时需要字段,不填默认为0）1.拖拽式邮件素材 0.其他
            };
        },
        methods: {
            // 获取共享对象
            getMemberChooseList(data) {
                this.memberChooseList = data;
            },
            // 获取共享权限
            getAuthorityChooseList(data) {
                this.authorityChooseList = data;
            },
            // 保存共享
            save() {
                if (!this.memberChooseList[1]
                    || this.memberChooseList[1] && this.memberChooseList[1].length === 0
                    && this.memberChooseList[0] !== 1) {
                    this.$toast(this.$t('material.emptyOfMember'), 'warn');
                    return false;
                }
                if (!this.authorityChooseList || this.authorityChooseList.length === 0) {
                    this.$toast(this.$t('material.emptyOfAuthority'), 'warn');
                    return false;
                }
                if (this.elementType < 3) {
                    const API_DATA = Object.assign({
                        materialId: this.elementId,
                        authorty: this.authorityChooseList.join(','),
                        departmentId: '',
                        roleId: '',
                        userId: '',
                        type: this.elementType
                    });
                    switch (parseInt(this.memberChooseList[0])) {
                        case 2:
                            API_DATA.userId = this.memberChooseList[1].join(',');
                            break;
                        case 3:
                            API_DATA.departmentId = this.memberChooseList[1].join(',');
                            break;
                        case 4:
                            API_DATA.roleId = this.memberChooseList[1].join(',');
                            break;
                    }
                    JourneyMaterialApiV1
                        .saveMaterialUser(API_DATA)
                        .then(() => {
                            this.$toast(this.$t('material.sharedSuccess'), 'success');
                            this.close();
                        })
                        .catch(() => {
                            this.close();
                        });
                } else {
                    const API_DATA = Object.assign({
                        paperId: this.elementId,
                        authorty: this.authorityChooseList.join(','),
                        sharedIds: '',
                        roleId: '',
                        userId: '',
                        type: 0
                    });
                    switch (parseInt(this.memberChooseList[0])) {
                        case 2:
                            API_DATA.type = 1;
                            API_DATA.sharedIds = this.memberChooseList[1].join(',');
                            break;
                        case 3:
                            API_DATA.type = 2;
                            API_DATA.sharedIds = this.memberChooseList[1].join(',');
                            break;
                        case 4:
                            API_DATA.type = 3;
                            API_DATA.sharedIds = this.memberChooseList[1].join(',');
                            break;
                    }
                    QuestionnaireApiV1
                        .saveFormUser(API_DATA)
                        .then(() => {
                            this.$toast(this.$t('material.sharedSuccess'), 'success');
                            this.close();
                        })
                        .catch(() => {
                            this.close();
                        });
                }

            },
            /**
             * 开启弹框
             * @param elementId 当前元素id
             * @param elementType 当前元素类型
             * materialType 2020-10-15需要区分1.拖拽式邮件素材 0.其他
             */
            show(elementId, elementType, material) {
                this.elementId = elementId;
                this.elementType = elementType;
                if (material) {
                    this.materialType = material.type === 3 ? 1 : 0;
                    this.material = material;
                }
                this.modalShow = true;
            },
            //关闭弹框
            close() {
                this.modalShow = false;
                this.cleanData();
            },
            //开启共享记录列表
            openList() {
                this.$refs['shareModel'].show(this.elementId, this.elementType, this.material);
            },
            // 清空数据
            cleanData() {
                this.modalShow = false;
                this.elementId = 0;
                this.memberChooseList = [];
                this.authorityChooseList = [];
            },
        }
    };

</script>
<style lang="scss" type="text/scss" rel="stylesheet/scss">
    @import '../../common/scss/base/variables';
    @import '../../common/scss/base/mixin';

    .member-select {
        margin: 10px 0;
    }

    .left-btn {
        display: inline-block;
        float: left;
        cursor: pointer;
    }

    .title-and-desc-form-share {
        flex-direction: column;
        min-height: 178px;
    }

    .cursor-default {
        cursor: default;
    }
</style>
