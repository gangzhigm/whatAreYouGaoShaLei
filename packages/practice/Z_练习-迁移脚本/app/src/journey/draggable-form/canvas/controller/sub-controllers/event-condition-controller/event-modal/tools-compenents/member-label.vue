<template>
    <div class="member-label">
        <memberTag :isMulti="false" :list="computeList" @choose="changeMemberId($event)" ref="memberTag" :max="1"></memberTag>
    </div>
</template>

<script type="text/ecmascript-6">
    import memberTag from '../../../components/member-tag.vue';

    export default {
        props: {
            restoreValue: Object,
        },
        data() {
            return {
                memberId: ''
            };
        },
        created() {
            this.restore();
        },
        methods: {
            restore() {
                if (this.restoreValue.operator === 'memberLabel') {
                    this.memberId = this.restoreValue.value ? this.restoreValue.value : '';
                }
            },
            changeMemberId(e) {
                // single-check
                this.memberId = e.chooseIdList;
                let temp1 = e.selectedList.map((item) => {
                    return item.id;
                });
                let temp2 = e.selectedList.map((item) => {
                    return item.name;
                });

                let errMsg = '';
                if (temp1.length === 0) {
                    errMsg = this.$t('controller.tagNeeded');
                }
                this.$emit('change', {
                    operator: 'memberLabel',
                    value: temp1,
                    name: temp2,
                    selectedList: e.selectedList,
                    errMsg: errMsg
                });
            },
        },
        computed: {
            computeList() {
                let selectedList = this.restoreValue.selectedList || [];
                let chooseIdList = this.restoreValue.chooseIdList || null;
                return {selectedList, chooseIdList};
            }
        },
        components: {memberTag}
    };
</script>
