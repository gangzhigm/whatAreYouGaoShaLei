<template>
    <modal v-if="visible" size="lg" neat :title="title" @close="close">
        <preview :material="material" :mmsMaterial="mmsMaterial" :signature="signature" :toolbar="toolbar"
                 :labelList="labelList" :snapShot="snapShot"
                 :class="{'preview-html-in-modal': previewingHtml}"/>
    </modal>
</template>
<script type="text/ecmascript-6">

    import Preview from './preview.vue';

    export default {
        data() {
            return {
                material: {},
                mmsMaterial: [],
                visible: false,
                toolbar: true,
                signature: '',
                labelList: [],
                // 是否快照模式，用于显示微信图文副本
                snapShot: {
                    type: Boolean,
                    default: false
                }
            };
        },
        computed: {
            title() {
                let title = this.material.materialName || this.material.title;
                if (this.material.subject) {
                    let subject = this.material.subject;
                    return title ? this.$t('controller.preview_material') + ' - ' + title + ' - ' + subject : this.$t('controller.preview_material');
                }
                return title ? this.$t('controller.preview_material') + ' - ' + title : this.$t('controller.preview_material');
            },
            previewingHtml() {
                return this.material.type === 1 || this.material.type === 3;
            },
            // 华为账号
            isHw() {
                /*eslint-disable-next-line*/
                return localStorage.getItem('isHw') == 1;
            }
        },
        methods: {
            close() {
                this.visible = false;
                this.$set(this.$data, 'material', {});
                this.$set(this.$data, 'labelList', []);
            }
        },
        components: {
            Preview
        }
    };
</script>
<style lang="scss">
    .preview-html-in-modal {
        height: 70vh;
    }
</style>
