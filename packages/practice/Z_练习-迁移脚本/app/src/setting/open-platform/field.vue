<template>
    <div class="open-platform-field page-content">
        <div class="content-view">
            <div class="filedTitle">
                <p>{{ "openPlat.dataField" | t }}</p>
                <button class="btn btn-theme btn-md" @click="save" :disabled="saving || $has('openPlatform_field_desensitization_edit')">
                {{ saving === true ? "openPlat.saving" : "openPlat.save"| t }}
                </button>
            </div>
            <div class="simplify-table">
                <table>
                    <thead>
                    <tr>
                        <td>{{ "openPlat.name" | t }}</td>
                        <td>{{ "openPlat.meaning" | t }}</td>
                        <td>{{ "openPlat.noDesen" | t }}</td>
                        <td>
                        {{ "openPlat.desen" | t }}
                        <i
                            class="icon icon-yiwen1"
                            v-title:bottom="$t('openPlat.desenTip')"
                        ></i>
                        </td>
                    </tr>
                    </thead>
                    <tbody>
                    <tr v-for="item in fileData" :key="item.fieldId">
                        <td>{{ item.fieldName }}</td>
                        <td>{{ item.name }}</td>
                        <td>
                            <radio
                                :source="0"
                                v-model="item.desensitizationStatus"
                                :disabled="$has('openPlatform_field_desensitization_edit')"
                                @input="selectChange(item)"
                            ></radio>
                        </td>
                        <td>
                        <radio
                            :source="1"
                            v-model="item.desensitizationStatus"
                            @input="selectChange(item)"
                            :disabled="$has('openPlatform_field_desensitization_edit')"
                        ></radio>
                        <selector
                            class="md"
                            :options="item.desenList"
                            v-model="item.desensitizationType"
                            :disabled="
                            item.desensitizationStatus === 0 ||
                            $has('openPlatform_field_desensitization_edit')
                            "
                        />
                        </td>
                    </tr>
                    </tbody>
                </table>
            </div>
            <list-empty 
                v-if="fileData.length === 0 && !loadingData" 
                :name="$t('openPlat.data')" 
                class="empty"
            />
            <inline-loading v-if="loadingData"></inline-loading>
        </div>
    </div>
</template>
<script type="text/babel">
import { ManageApi } from '@/api';
export default {
    name: 'field',
    data() {
        return {
            fileData: '', //脱敏数据
            loadingData: false, //数据loading
            saving: false, //保存loading
        };
    },
    mounted() {
        this.getFileList();
    },
    methods: {
        // 保存脱敏编辑
        save() {
            this.saving = true;
            const params = this.fileData.map(item => {
                return {
                    fieldId: item.fieldId, //字段id
                    desensitizationType: item.desensitizationType, //脱敏类型 （仅在脱敏情况下起作用， 0部分脱敏 1全部脱敏）
                    desensitizationStatus: item.desensitizationStatus, //是否脱敏 （0不脱敏 1脱敏）
                };
            });
            ManageApi
                .saveFieldAttributes({ paramList: params })
                .then(() => {
                    this.$toast(this.$t('openPlat.desenSave'), 'success');
                    this.getFileList();
                    this.saving = false;
                })
                .catch(() => {
                    this.$toast(this.$t('openPlat.desenFail'), 'warn');
                    this.saving = false;
                });
        },
        // 获取字段脱敏列表
        getFileList() {
            this.loadingData = true;
            ManageApi.fieldAttributesList()
                .then((res) => {
                    this.fileData = res.body.data.resultList;
                    this.fileData.forEach((item) => {
                        const list = [
                            { name: this.$t('openPlat.tatalDesen'), id: 1 }, //完全脱敏
                            { name: this.$t('openPlat.partialDesen'), id: 0, disabled: item.desensitizationRestrain ? false : true }, // 部分脱敏
                        ];
                        item.desenList = list;
                    });
                    this.loadingData = false;
                })
                .catch(() => {
                    this.loadingData = false;
                });
        },
        // radio选择是否脱敏
        selectChange(item) {
            item.desenList[1].disabled =
            item.desensitizationRestrain === 0 ? true : false;
            if (item.desensitizationStatus === 1) {
                item.desensitizationType = 1;
            } else {
                item.desensitizationType = null;
            }
        },
    },
};
</script>
<style lang="scss" type="text/scss" rel="stylesheet/scss" scoped>
    @import "../../common/scss/base/variables";
    @import "../../common/scss/base/mixin";
    .open-platform-field {
        background-color: white;
        min-height: 65vh;
        .filedTitle {
            background-color: white;
            width: 100%;
            height: 60px;
            p {
                font-size: 16px;
                line-height: 32px;
                float: left;
            }
            button {
                float: right;
            }
        }
        .empty {
            border: 1px solid #d1d6e0;
            border-top: none;
        }
        .simplify-table {
            table {
                tbody {
                    tr {
                        td {
                            overflow: visible;
                        }
                    }
                }
            }
        }
    }
</style>
