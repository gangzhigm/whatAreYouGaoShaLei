<template>
    <div class="fan-label">
        <selector class="full-width" :options="groups" v-model="tagLists" :search="true"></selector>
    </div>
</template>

<script type="text/ecmascript-6">
    import { WechatApiV1 } from '@/api';

    export default {
        props: {
            restoreValue: Object,
            wechatId: Number
        },
        data() {
            return {
                groups: [],
                tagLists:'',
            };
        },
        created() {
            this.getTagListHandler('init');
            this.restore();
        },
        methods: {
            restore() {
                if (this.restoreValue.operator === 'fanLabel') {
                    this.tagLists = this.restoreValue.value ? this.restoreValue.value : '';
                }
            },
            getTagListHandler(init) {
                WechatApiV1
                    .getJourneyTagList('','',this.wechatId)
                    .then(({body: {data: {tagList}}})=>{
                        this.groups = tagList;
                        if (!init) this.tagLists = '';
                        if (init === 'init' && (this.restoreValue.value)) {
                            let item = tagList.filter(item => item.id === this.restoreValue.value)[0];
                            if (!item) {
                                this.$toast(this.$t('controller.invalidCondition'), 'warn');
                            } else {
                                this.$emit('change', { operator: 'fanLabel', value: this.restoreValue.value, name: item.name, errMsg: ''});
                            }
                        }
                    });
            },
        },
        watch: {
            wechatId() {
                this.getTagListHandler();
            },
            tagLists() {
                let temp = [];
                if (this.tagLists) {
                    for (let item of this.groups) {
                        if (this.tagLists === item.id) {
                            temp.push(item.name);
                        }
                    }
                }
                let errMsg = '';
                if (this.tagLists.length === 0) {
                    errMsg = this.$t('controller.wechatTagNeeded');
                }
                this.$emit('change', { operator: 'fanLabel', value: this.tagLists, name: temp, errMsg: errMsg });
            }
        }
    };
</script>
