<template>
    <div class="ring-loading">
        <div class="lds-ring">
            <div></div>
            <div></div>
            <div></div>
            <div></div>
        </div>
    </div>
</template>
<script type="text/ecmascript-6">

export default {
    name: 'ring-loading',
};
</script>
<style lang="scss" type="text/scss" rel="stylesheet/scss">
@import '../../../../common/scss/base/variables';
@import '../../../../common/scss/base/mixin';

.ring-loading {
    position: relative;
    height: inherit;
    .lds-ring {
        display: inline-block;
        width: 32px;
        height: 32px;

        position: absolute;
        top: 50%;
        // top: calc(50% + 34px);
        left: 50%;
        margin-left: -16px;
        margin-top: -16px;
    }
    .lds-ring div {
        box-sizing: border-box;
        display: block;
        position: absolute;
        width: 24px;
        height: 24px;
        margin: 4px;
        border-width: 4px;
        border-style: solid;
        border-radius: 50%;
        border-color: #ff4574 transparent transparent transparent;
        animation: lds-ring 1.2s cubic-bezier(0.5, 0, 0.5, 1) infinite;
    }
    .lds-ring div:nth-child(1) {
        animation-delay: -0.45s;
    }
    .lds-ring div:nth-child(2) {
        animation-delay: -0.3s;
    }
    .lds-ring div:nth-child(3) {
        animation-delay: -0.15s;
    }
    @keyframes lds-ring {
        0% {
            transform: rotate(0deg);
        }
        100% {
            transform: rotate(360deg);
        }
    }
}
</style>
