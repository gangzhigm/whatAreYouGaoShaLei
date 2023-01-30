<template>
    <modal :title="groupModal.title+$t('material.group')" size="md" class="group-edit-modal" @close="cancel()">
        <div class="form-field">
            <label for="groupName" class="label">{{'material.groupName' | t}}</label>
            <input v-model.trim="groupName" id="groupName" maxlength="15" class="input lg" type="text"
                   :placeholder="$t('material.groupName')">
        </div>
        <template v-slot:buttons>
            <input type="button" class="btn btn-md btn-theme" @click.stop="confirm()"
                   :value="$t('common.confirm')"/>
        </template>
    </modal>
</template>

<script type="text/ecmascript-6">
    import { EmailHeadFootGroupV1, JourneyMaterialApiV3 } from '@/api';

    export default {
        props: {
            groupModal: Object,
            title: String,
            id: String,
            modalType: {
                type: String,
                default: ''
            }
        },
        data() {
            return {
                groupName: ''
            };
        },
        mounted() {
            if (this.groupModal.title === this.$t('material.edit')) {
                this.groupName = this.groupModal.groupName;
            }
        },
        methods: {
            cancel() {
                this.groupName === '';
                this.$emit('close');
            },
            confirm() {
                if (this.groupName !== '') {
                    this.groupModal.title === this.$t('material.create') ? this.createGroupRequest() : this.modifyGroupNameRequest();
                    this.groupName === '';
                } else {
                    this.$toast(this.$t('material.groupNameNotNull'));
                }
            },
            //ajax
            modifyGroupNameRequest() {
                if (this.modalType === 'HeaderFooter') {
                    EmailHeadFootGroupV1
                        .editHeaderFooterGroup({id: this.groupModal.id,name: this.groupName})
                        .then(() => {
                            this.$toast(this.$t('common.updateSuccess'));
                            this.$emit('confirm');
                        }, () => {
                            this.$toast(this.$t('common.updateFailed'));
                            this.$emit('close');
                        });
                } else {
                    JourneyMaterialApiV3.modifyGroupName({
                        groupId: this.groupModal.id,
                        name: this.groupName
                    })
                        .then(() => {
                            this.$toast(this.$t('common.updateSuccess'));
                            this.$emit('confirm');
                        }, () => {
                            this.$toast(this.$t('common.updateFailed'));
                            this.$emit('close');
                        });
                }
            },
            createGroupRequest() {
                if (this.modalType === 'HeaderFooter') {
                    EmailHeadFootGroupV1
                        .createHeaderFooterGroup({name: this.groupName})
                        .then(() => {
                            this.$emit('close');
                        });
                } else {
                    JourneyMaterialApiV3.createGroup({name: this.groupName})
                        .then(() => {
                            this.$emit('close');
                        });
                }
            },
        }
    };
</script>
