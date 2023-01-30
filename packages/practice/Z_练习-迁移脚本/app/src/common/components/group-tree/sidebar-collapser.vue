<template>
    <button class="btn btn-sm btn-theme btn-margin btn-no-padding btn-round sidebar-collapser"
        v-if="sidebarShow" @click="collapse">
        <svg :class="{ reverse: !sidebarCollapsed }">
            <use xlink:href="#icon-arrowright"></use>
        </svg>
    </button>
</template>

<script type="text/ecmascript-6">
import { mapState } from 'vuex';
import { SWITCH_SIDE_BAR } from '@/store/vuex/mutationTypes';

export default {
    name: 'SidebarCollapser',
    computed: {
        ...mapState(['sidebarCollapsed', 'sidebarShow']),
    },
    methods: {
        collapse() {
            this.$store.commit(SWITCH_SIDE_BAR, !this.sidebarCollapsed);
        }
    },
};
</script>

<style lang="scss" type="text/scss" rel="stylesheet/scss">
@import "../../scss/base/variables";
@import "../../scss/base/mixin";

.sidebar-collapser {
    width: 24px;
    svg {
        position: relative;
        left: 3px;
        top: -1px;
        &.reverse {
            @include transform(rotate(180deg));
            left: 1px;
        }
    }
}
</style>