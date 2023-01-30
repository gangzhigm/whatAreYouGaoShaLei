<template>
    <div class="field-permission">
        <p class="field-text">{{'privilege.fieldView' | t}}</p>
        <div class="field-content">
            <div class="simplify-table">
                <table>
                    <thead>
                    <tr>
                        <td colspan="2">{{'privilege.fieldName' | t}}</td>
                        <td colspan="1">{{'privilege.view' | t}}</td>
                        <td colspan="1">
                            {{'privilege.hide' | t}}
                            <i class="icon icon-yiwen1" v-title:bottom="$t('privilege.hideTips')"></i>
                        </td>
                    </tr>
                    </thead>
                    <tbody>
                    <tr v-model="value" v-for="(item,index) in attributes" @passList="changePermission">
                        <td colspan="2">
                            {{item.meaning}}
                        </td>
                        <td colspan="1">
                            <radio :source="true" v-model="item.show" @input="changePermission(item)"></radio>
                        </td>
                        <td colspan="1">
                            <radio :source="false" v-model="item.show" @input="changePermission(item)"></radio>
                            <selector :disabled="item.show" class="md" :value="item.type"
                                      v-if="item.attrGenre === 0 && item.name != 'label_ids'"
                                      v-model="item.type"
                                      :options="hideTypeOptions"
                                      @select="selectHiddenType($event,item)"></selector>
                        </td>
                    </tr>
                    </tbody>
                </table>
            </div>
        </div>
    </div>
</template>

<script>
    export default {
        name: 'fieldPermission',
        props: {
            value: Array,
            attributes: Array,
        },
        data() {
            return {
                fieldList: [],
                hideTypeOptions: [
                    {name: this.$t('privilege.partiallyHidden'), id: 0},//部分隐藏
                    {name: this.$t('privilege.completelyHidden'), id: 1}//完全隐藏
                ],
            };
        },
        computed: {
            // 字段权限中的隐藏列表
            fieldPermission() {
                let permissions = [];
                this.attributes.forEach(menu => {
                    if (menu.show === false) {
                        permissions.push({
                            fieldName: menu.name,
                            fieldId: menu.id,
                            type: menu.type
                        });
                    }
                });
                return permissions;
            },
        },
        methods: {
            //选择隐藏类型
            selectHiddenType(e, item) {
                this.fieldPermission.forEach(field => {
                    if (item.id === field.fieldId) {
                        field.type = item.type;
                    }
                });
                this.$emit('passList', this.fieldPermission);
            },
            /**
             *  将点击隐藏radio的数据存入数组
             *  fieldList存储的是全部隐藏的数据，仅给后台传隐藏数据
             */
            changePermission(item) {
                let list = [];
                let fields = [];
                if (item.show === false) {
                    item.type = 1;//默认全部隐藏
                    list.push(item);
                    for (let i = 0; i < list.length; i++) {
                        fields.push({
                            fieldName: list[i].name,
                            fieldId: list[i].id,
                            type: list[i].type,
                        });
                    }
                    fields.forEach(menu => {
                        if (menu.fieldId === item.id) {
                            fields.splice(menu, 1);
                        }
                    });

                } else {
                    item.type = '';//展示时 type === ''
                }
                this.fieldList = this.fieldPermission.concat(fields);
                this.$emit('passList', this.fieldList);
            },
        }

    };
</script>

<style lang="scss" type="text/scss" rel="stylesheet/scss">

    @import "../../../common/scss/base/variables";
    @import "../../../common/scss/base/mixin";

    .field-permission {
        .field-text {
            margin-bottom: 16px;
            margin-top: 8px;
        }

        .field-content {
            .simplify-table {
                table {
                    tbody {
                        tr {
                            td {
                                overflow: visible;
                                white-space: normal;
                            }
                        }
                    }
                }
            }
        }

    }
</style>
