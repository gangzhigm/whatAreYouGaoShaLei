<template>
    <div class="sales-data content-view padding margin white-bg en-padding">
        <header>
            <div class="title">{{ 'shoppingGuide.salesData' | t }}</div>
            <p>{{ 'shoppingGuide.salesDataTips' | t }}</p>
        </header>

        <footer>
            <table class="sales-data-table">
                <thead>
                    <tr>
                        <th colspan="8">{{ 'shoppingGuide.customerType' | t }}</th>
                        <th colspan="8">{{ 'shoppingGuide.numberOfScreened' | t }}</th>
                        <th colspan="8">{{ 'shoppingGuide.options' | t }}</th>
                    </tr>
                </thead>

                <tbody>
                    <tr v-if="loading" class="no-hover">
                        <td colspan="24" class="slim-cell">
                            <inline-loading />
                        </td>
                    </tr>
                    <tr v-for="l in list" v-else>
                        <td colspan="8">
                            <p>{{ l.typeName }}</p>
                        </td>
                        <td colspan="8">
                            <p>{{ l.total || 0 }}</p>
                        </td>
                        <td colspan="8">
                            <button class="btn" @click="edit(l)">
                                <svg
                                    aria-hidden="true"
                                    class="action-icon icon-round-pencil"
                                    v-title:top="$t('common.edit')"
                                >
                                    <use xlink:href="#icon-round-pencil"></use>
                                </svg>
                            </button>
                        </td>
                    </tr>
                </tbody>
            </table>
        </footer>

        <!-- 配置顾客类型条件 -->

        <modal
            :title="$t('shoppingGuide.configureCustomerTypeConditions')"
            v-if="show"
            @close="close"
            class="sales-data-modal"
        >
            <div class="form-field">
                <label class="label">{{ 'shoppingGuide.nameOfCustomerType' | t }}</label>
                <input class="input" type="text" maxlength="10" v-model.trim="editInfo.typeName" />
                <span class="tips">{{ 'shoppingGuide.input10Max' | t }}</span>
            </div>

            <div class="form-field">
                <label class="label">{{ 'shoppingGuide.configurationRules' | t }}</label>
                <condition-bunch
                    class="condition-group"
                    ref="conditionGroup"
                    @valid="handleCondition"
                    :bunchData="editInfo.conditionJson"
                    @loading="loadingState"
                    :hasPower="0"
                >
                </condition-bunch>
            </div>

            <!-- 操作 -->
            <template v-slot:buttons>
                <input
                    type="button"
                    class="btn btn-md btn-theme-border"
                    :value="$t('common.cancel')"
                    @click="close"
                    :disabled="isLoading"
                />
                <input
                    type="button"
                    class="btn btn-md btn-theme"
                    :value="$t('common.confirm')"
                    @click="confirm"
                    :disabled="isLoading"
                />
            </template>
        </modal>
    </div>
</template>

<script type="text/babel">
import ConditionBunch from '@/common/components/condition-bunch/conditionBunch.vue';
import { WecomApiV1 } from '@/api';

export default {
    provide () {
        return {
            optimizeRelativeTime: true, //  用于判断相对时间是否需要添加提前/延后N天的条件，如果后面需要前部添加的话，则去掉此处的provide以及子组件的inject
        };
    },
    components: {
        ConditionBunch
    },
    data () {
        return {
            loading: false,
            list: [],
            show: false,
            editInfo: {
                id: '',
                typeName: '',
                conditionJson: []
            },
            isSubmit: false,
            isLoading: true
        };
    },
    created () {
        this.init();
    },

    methods: {
        loadingState (loading) {
            this.isLoading = loading;
        },

        edit (e) {
            this.isLoading = true;
            WecomApiV1.salesData(e.id)
                .then(({ body: { data: { id, typeName, conditionJson } } }) => {
                    this.show = true;
                    this.editInfo = {
                        id,
                        typeName,
                        conditionJson: conditionJson ? JSON.parse(conditionJson) : []
                    };
                });
        },

        close () {
            this.editInfo = {
                id: '',
                typeName: '',
                conditionJson: []
            };
            this.show = false;
        },

        confirm () {
            this.$refs.conditionGroup.valid();
        },

        handleCondition (conditionJson) {
            if (this.isSubmit) return;
            this.isSubmit = true;

            const params = {
                conditionJson,
                id: this.editInfo.id,
                typeName: this.editInfo.typeName
            };

            WecomApiV1.salesDataUpdate(params)
                .then(({ body }) => {
                    this.$toast(body.message, 'success');
                    this.isSubmit = false;
                    this.init();
                })
                .catch(() => {
                    this.isSubmit = false;
                });

            this.show = false;
        },

        init () {
            this.loading = true;
            WecomApiV1.salesDataList()
                .then(({ body: { data: { list } } }) => {
                    this.loading = false;
                    this.list = list;
                });
        }
    }

};
</script>

<style lang="scss">
@import '../../../../common/scss/base/variables';
@import '../../../../common/scss/base/mixin';

.sales-data {
    header {
        display: flex;
        align-items: baseline;
        .title {
            font-size: 22px;
        }

        p {
            color: #cdcdcd;
            margin-left: 40px;
        }
    }

    .sales-data-table {
        table-layout: fixed;
        width: 100%;
        margin-top: 16px;
        text-align: left;
        border-collapse: collapse;
        border-spacing: 0;
        thead {
            tr {
                height: 40px;
                border-bottom: 1px solid $border-color;

                &:first-child {
                    background-color: $select-bg;
                }

                td:first-child {
                    text-align: center;
                }

                &:not(:first-child):hover {
                    background-color: $title-bg;
                }

                th {
                    padding: 0 10px;
                }
            }
        }

        tbody {
            tr {
                height: 40px;
                border-bottom: 1px solid $border-color;
                .btn {
                    padding: 0;
                    margin: 0;
                    .action-icon {
                        width: 16px;
                        height: 16px;
                        margin: 6px 0;
                    }
                    .icon-change {
                        color: $theme;
                    }
                }

                td {
                    padding: 0 10px;
                }
            }
        }
    }

    .sales-data-modal {
        .modal {
            width: 1125px;
        }
        .form-field {
            .label {
                width: 130px;
            }
        }
        .tips {
            color: #cdcdcd;
            margin-left: 10px;
        }
        .condition-group {
            width: 950px;
        }
    }
}

.sales-data.padding {
    padding: 20px 60px;
}
</style>
