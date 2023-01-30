<template>
    <div class="billing-rule-wrapper">
        <div class="billing-rule">
            <span class="rule-title">{{'material.billingRuleTitle' | t}}</span>
            <p class="country-rule">
                <span class="step-icon">·</span>
                <span class="middle">{{'material.Domestic' | t}}</span>
            </p>
            <div class="rule-detail" v-html="$t('material.smsNum')"></div>
            <div class="rule-detail" v-html="$t('material.domesticNotice')"></div>
            <p class="country-rule">
                <span class="step-icon">·</span>
                <span class="middle">{{'material.Overseas' | t}}</span>
            </p>
            <div class="rule-detail" v-html="$t('material.pureEnglish')"></div>
            <div class="rule-detail" v-html="$t('material.nonPureEnglish')"></div>
            <p>{{'material.signatureNotice' | t}}</p>
        </div>
    </div>
</template>

<script>
    export default {
        name: 'BillingRules',
    };
</script>

<style lang="scss" scoped>
    @import "../../../common/scss/base/variables";
    @import "../../../common/scss/base/mixin";

    .billing-rule-wrapper{
        .billing-rule {
            line-height: 24px;
            color: $disabled;
            .country-rule {
                color: $color-content;
                .step-icon {
                    font-size: 32px;
                }
                .step-icon, .middle {
                    vertical-align: middle;
                }
            }
            .rule-detail {
                margin-left: 20px;
                .red-text{
                    color: $red;
                }
            }
        }
    }

</style>
