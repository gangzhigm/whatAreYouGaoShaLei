<template>
    <div class="form-field" v-if="authorityList.length > 0">
        <div class="configuration-module-license" v-for="item in authorityList" :key="item.soleFlag">
            <checkbox v-model="chooseList" :source="item.soleFlag" :disabled="false" @input="choose">
                {{item.menuName}}
            </checkbox>
        </div>
    </div>
    <inline-loading v-else offset="sm"/>
</template>
<script type="text/babel">
    import { DepartmentApiV1 } from '@/api';
    import { mapState } from 'vuex';

    export default {
        data() {
            return {
                chooseList: [], // 当前选中项列表
                authorityList: [] // 权限列表
            };
        },
        props: {
            type: Number, // 类型 0:共享邮件素材 1：共享邮件素材  2：共享邮件头尾  3：共享金数据表单 4：共享标准表单
            materialType:{//素材类型（type=0时需要字段,不填默认为0) 1.拖拽式邮件素材 0.其他
                type: Number,
                default: 0
            }
        },
        computed: {
            ...mapState({
                user: state => state.user
            })
        },
        mounted() {
            // 转换为 接口类型 0:共享邮件素材 2：共享标准表单 3：共享金数据表单
            const API_DATA = {userId: this.user.id, type: 0, materialType: this.materialType};
            if (this.type < 3) {
                API_DATA.type = 0;
            } else {
                API_DATA.type = this.type === 3 ? 2 : 3;
            }
            DepartmentApiV1
                .findMaterialSharing(API_DATA)
                .then(({body: {data: {menus}}}) => {
                    // 头尾模板去除 批量删除 批量移动 测试功能
                    if (this.type === 2) {
                        this.authorityList = menus.filter(item => !['journey_material_batch_delete', 'journey_material_batch_move', 'journey_material_test_material'].includes(item.soleFlag));
                    } else if (this.type === 4) {
                        this.authorityList = menus.filter(item => !['journey_form_search_jinshuju'].includes(item.soleFlag));
                    } else {
                        this.authorityList = menus;
                    }
                });
        },
        methods: {
            // 构建选中列表
            choose() {
                let idList = this.chooseList.map(item => {
                    switch (item) {
                        case 'journey_material_preview_material':
                            return 0;
                        case 'journey_material_edit_material':
                        case 'journey_form_search_jinshuju':
                            return 1;
                        case 'journey_material_move_material':
                        case 'journey_form_edit_jinshuju':
                            return 2;
                        case 'journey_material_copy_material':
                        case 'journey_form_test_jinshuju':
                            return 3;
                        case 'journey_material_test_material':
                        case 'journey_form_jinhsuju_statistics':
                            return 4;
                        case 'journey_material_delete_material':
                        case 'journey_form_delete_onefrom':
                            return 5;
                        case 'journey_material_batch_delete':
                        case 'journey_form_batch_move':
                            return 6;
                        case 'journey_material_batch_move':
                        case 'journey_form_delete_form':
                            return 7;
                        case 'journey_form_standard_data':
                        case 'journey_material_export_HTML':
                            return 8;
                        case 'journey_form_download_statistics':
                            return 9;
                        case 'journey_form_copy':
                            return 10;
                        case 'journey_form_logs':
                            return 11;
                        case 'journey_form_start_form':
                            return 12;
                        case 'journey_form_pause_form':
                            return 13;
                        case 'journey_form_delete_fromdata':
                            return 14;
                        case 'journey_form_edit_data':
                            return 15;
                        case 'journey_form_view_link':
                            return 16;
                        case 'journey_form_delete_custom_form':
                            return 17;
                        case 'journey_form_add_custom_form':
                            return 18;
                        case 'journey_form_custom_form':
                            return 19;
                    }
                });
                if (this.type === 4 && this.chooseList.findIndex(item => item === 'journey_form_edit_jinshuju') >= 0) {
                    idList.push(1);
                }
                this.$emit('getAuthorityChooseList', idList);
            }
        }
    };

</script>
<style lang="scss" type="text/scss" rel="stylesheet/scss">
    .form-field {
        margin: 10px 0;
    }

    .configuration-module-license {
        margin: 0 5px;
        display: inline-block;
    }
</style>
