<template>
    <modal :title="$t('shoppingGuide.editEmployee')" @close="close" class="staff-edit">
        <div class="form-field" v-for="s in staffList">
            <label class="label">{{ s.name }}</label>
            <input class="input" type="text" maxlength="255" v-model.trim="s.value" :disabled="s.disabled" />
            <span v-if="s.disabled" class="cannot-edit">{{ 'shoppingGuide.cannotEdit' | t }}</span>
        </div>

        <div class="form-field">
            <label class="label">{{ 'shoppingGuide.stores' | t }} </label>
            <multi-select
                class="xl hg multi-select"
                :options="selectList"
                v-model="checkedItem"
                :shortcutAction="true"
                :search="'async'"
                :autoWidth="false"
                :dropDirection="'bottom'"
                :uniqueKey="'id'"
                :max="100"
                :placeholder="$t('common.selectHolder')"
            />
        </div>

        <!-- 操作 -->
        <template v-slot:buttons>
            <input type="button" class="btn btn-md btn-theme-border" :value="$t('common.cancel')" @click="close" />
            <input type="button" class="btn btn-md btn-theme" :value="$t('common.confirm')" @click="confirm" />
        </template>
    </modal>
</template>

<script>
import { translate as t } from '@/locales';
import { WecomApiV1 } from '@/api';
import { mapState } from 'vuex';

export default {
    name: 'StaffEdit',
    data () {
        return {
            id: '',
            staffList: [{
                field: 'employeeNum',
                name: t('shoppingGuide.employeeID'),
                disabled: false,
                value: ''
            }, {
                field: 'name',
                name: t('shoppingGuide.employeeName'),
                disabled: true,
                value: ''
            }, {
                field: 'department',
                name: t('shoppingGuide.department'),
                disabled: true,
                value: ''
            }, {
                field: 'position',
                name: t('shoppingGuide.position'),
                disabled: true,
                value: ''
            }],
            selectList: [],
            checkedItem: [],// 选中的粉丝标签list
            isSubmit: false
        };
    },
    created () {
        this.getStaffList();
    },
    computed: {
        ...mapState({
            updateAccount: state => state.user.email,
        })
    },
    methods: {
        open ({ id, employeeNum, name, department, position, storeIds }) {

            const staffInfo = {
                employeeNum: employeeNum,
                name: name,
                department: department,
                position: position
            };
            this.id = id;
            this.checkedItem = storeIds;

            this.staffList.forEach(e => {
                e.value = staffInfo[e.field];
            });
        },

        close () {
            this.$emit('close');
        },

        confirm () {
            if (this.isSubmit) return;

            this.isSubmit = true;
            const params = {
                id: this.id,
                employeeNum: this.staffList[0].value,
                updateAccount: this.updateAccount,
                storeIds: this.checkedItem
            };
            WecomApiV1.updateEmployee(params)
                .then(({ body: { message } }) => {
                    this.isSubmit = false;
                    this.$toast(message, 'success');
                    this.$emit('confirm');
                })
                .catch(() => {
                    this.isSubmit = false;
                });
        },

        /**
         * type
         *  1表示搜索企业微信所属员工名称、
            2表示搜索企业微信所属员工手机号
            3表示搜索企业微信所属员工邮箱
         */
        getStaffList () {
            WecomApiV1.getStoreList()
                .then(({ body: { data } }) => {
                    this.selectList = data.storeList;
                });
        },
    }
};
</script>

<style lang="scss">
@import '../../../../common/scss/base/variables';
@import '../../../../common/scss/base/mixin';

.staff-edit {
    .form-field {
        .multi-select {
            text-align: left;
            width: 314px;
        }
        .input {
            width: 314px;
        }

        .cannot-edit {
            color: #cdcdcd;
        }
        .multi-select {
            text-align: left;
            width: 314px;
        }
        .input {
            width: 314px;
        }
    }
}
</style>