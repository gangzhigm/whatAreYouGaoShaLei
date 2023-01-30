<template>
    <!--过滤器-->
    <div class="rules">
        <div class="form-field">
            <!-- 新数据结构组件，暂时冻结，待更新 -->
            <!-- <condition-bunch ref="conditionGroup" @valid="handleCondition" :bunchData="conditions">
            </condition-bunch> -->
            <swarm-condition-group ref="conditionGroup" @valid="handleCondition" :swarmJson="conditions" :emptyValid="true">
                </swarm-condition-group>
        </div>
        <div class="btn-box">
            <input type="button" class="btn btn-md btn-theme" :value="$t('tag.addMemberLabel')" @click="addTag">
            <input type="button" class="btn btn-md btn-theme-border" :value="$t('tag.deleteMemberLabel')" @click="moveTag">
        </div>
    </div>
</template>

<script>
import { ContactApiV1 } from '@/api';
import swarmConditionGroup from '../../customer/swarm/condition-group.vue';
// import conditionBunch from '../../common/components/condition-bunch/conditionBunch.vue'; //新数据结构组件，暂时冻结，待更新

export default {
    name: 'rules',
    components: { swarmConditionGroup },
    props: {
        conditions: {
            type: Array,
            default: []
        },
        label: Object, // 当前操作的标签
    },
    data() {
        return {
            operator: 'add', // 当前操作 add 添加标签 remove 移除标签
        };
    },
    methods: {
        // 添加会员标签
        addTag() {
            this.operator = 'add';
            this.$refs.conditionGroup.valid();
        },
        // 移除会员标签
        moveTag() {
            this.operator = 'remove';
            this.$refs.conditionGroup.valid();
        },
        handleCondition(jsonStr) {
            if (this.operator === 'add') {
                let addConfirmationMessage = this.$t('tag.addLabelUser');
                this.$confirm(this.$t('tag.addLabel'), addConfirmationMessage)
                    .then(sure => {
                        if (sure) {
                            this.$loading();
                            ContactApiV1.addLabelProperty(this.label.id, jsonStr)
                                .then(() => {
                                    this.$toast(this.$t('tag.addMemberLabelSuccess') + '【' + this.label.name + '】', 'success');
                                    this.$loaded();
                                })
                                .catch(err => {
                                    console.error(err);
                                    this.$loaded();
                                });
                            this.$emit('add');
                        } else {
                            this.$emit('add');
                        }
                    });
            } else {
                this.$emit('move', jsonStr);
            }
        },
    },
};
</script>

<style lang="scss" type="text/scss" rel="stylesheet/scss">
@import '../../common/scss/base/variables';
@import '../../common/scss/base/mixin';
.rules {
    margin: 30px 0 0 40px;
    .btn-box {
        text-align: center;
    }
    .swarm-condition-group {
        width: calc(100% - 50px);
    }
}
</style>
