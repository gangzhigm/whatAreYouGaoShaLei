<template>
    <modal :title="groupModal.title+$t('journeyList.group')" size="md" class="group-edit-modal" @close="cancel()">
        <div class="form-field">
            <label for="groupName" class="label">{{'journeyList.groupName' | t}}</label>
            <input v-model.trim="groupName" id="groupName" maxlength="15" class="input lg" type="text"
                   :placeholder="$t('journeyList.groupName')">
        </div>
        <template v-slot:buttons>
            <input type="button" class="btn btn-md btn-theme" @click.stop="confirm()"
                   :value="$t('common.confirm')"/>
        </template>
    </modal>
</template>

<script type="text/ecmascript-6">
    import { JourneyApiV3 } from '@/api';

    export default {
        props: {
            groupModal: Object,
            title: String,
            id: String
        },
        data() {
            return {
                groupName: ''
            };
        },
        mounted() {
            if (this.groupModal.title === this.$t('journeyList.edit')) {
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
                    this.groupModal.title === this.$t('journeyList.create') ? this.createGroupRequest() : this.modifyGroupNameRequest();
                    this.groupName === '';
                } else {
                    this.$toast(this.$t('journeyList.groupNameNotNull'),'warn');
                }
            },
            //ajax
            modifyGroupNameRequest() {
                JourneyApiV3.modifyGroupName({
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
            },
            createGroupRequest() {
                JourneyApiV3.createGroup({name: this.groupName})
                    .then(() => {
                        this.$emit('close');
                    });
            },
        }
    };
</script>
