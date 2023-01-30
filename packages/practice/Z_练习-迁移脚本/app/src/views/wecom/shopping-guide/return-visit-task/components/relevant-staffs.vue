<template>
    <modal :title="$t('shoppingGuide.relevantEmployees')" class="relevant-staffs" @close="$emit('close')">
        <div class="form-field">
            <label class="label">{{'shoppingGuide.relevantEmployees' | t}}</label>
            <span class="data-theme">{{staffCount}}</span>
        </div>
        <div class="form-field">
            <label class="label">{{'shoppingGuide.relatedStaffDetails' | t}}</label>
            <div class="staff-list" v-if="staffList">
                <span class="customer-tag" v-for="(staff, index) in staffList" :key="staff.id">
                    <span class="tag-name-wrapper">
                        <span class="tag-name" :title="staff.name">{{staff.name}}</span>
                    </span>
                </span>
            </div>
            <span v-else class="data-theme">{{'shoppingGuide.noRelatedEmployees'| t}}</span>
        </div>
        <div class="form-field tips">*{{'shoppingGuide.getData' | t}}</div>
    </modal>
</template>
<script type="text/babel">
import { WecomApiV1 } from '@/api';
export default {
    props: {
        labelIds:{
            type: Array,
            default: []
        },
        viewDetail:{
            type: Boolean,
            default:false
        }
    },
    mounted() {
        this.getStaffDetail();
    },
    data () {
        return {
            staffCount: '',
            staffList: [],
        };
    },
    methods:{
        getStaffDetail() {
            WecomApiV1
                .relevantStaff({labelIds:this.labelIds})
                .then((res)=>{
                    this.staffCount = res.body.data.staffCount;
                    this.staffList = res.body.data.staffJson;
                });
        }
    }
};
</script>
<style lang="scss" scoped>
@import "../../../../../common/scss/base/variables";
@import "../../../../../common/scss/base/mixin";
.relevant-staffs{
    .hg {
    width: 312px;
    }
    .data-theme {
        color: $theme;
    }
    .form-field{
        .label{
        width: 120px;
        }
    }
    .staff-list{
        display: inline-block;
        width: 430px;
        max-height: 110px;
        overflow: scroll;
    }
    .customer-tag {
        display: inline-block;
        vertical-align: top;
        border-radius: 9px;
        border: 1px solid $light-green;
        margin: ($input-field-height - 24px)/2 ($input-field-height - 24px)/2
            ($input-field-height - 24px)/2 0;
        padding: 0 8px;
        line-height: 24px;
        color: $light-green;

        .tag-name-wrapper {
            display: flex;
            .tag-name {
                display: inline-block;
                max-width: 400px;
                @include ellipsis();
            }
        }

        svg {
            float: right;
            width: 14px;
            height: 14px;
            margin: 5px 0 5px 5px;
            fill: white;
            cursor: pointer;

            &:hover {
                fill: $content-bg;
            }
        }
    }
    .tips {
        color: $disabled;
    }
}

</style>