<template>
    <confirm :title="$t('journey.renameTitle')" @cancel="cancel" @confirm="confirm">
        <div class="form-field">
            <label class="label" for="journeyNewName">{{'journey.journeyName' | t}}</label>
            <input class="input" type="text" id="journeyNewName" maxlength="200"
                   :placeholder="$t('journey.journeyNameHolder')" @keydown.enter="confirm"
                   :class="{error: journeyNameError}"
                   @focusin="journeyNameError = ''"
                   v-title:top.warn="journeyNameError"
                   v-autofocus v-model.trim="journeyName">
        </div>
    </confirm>
</template>
<script type="text/ecmascript-6">
    import {DRAGGABLE_JOURNEY_STORE_NAME} from '@/store/vuex/modules/canvasStore';
    import { mapState } from 'vuex';

    export default {
        data() {
            return {
                journeyName: '',
                journeyNameError: ''
            };
        },
        computed: {
            ...mapState({
                oldName: state => state[DRAGGABLE_JOURNEY_STORE_NAME].journeyInformation.journeyName
            })
        },
        created() {
            this.journeyName = this.oldName;
        },
        methods: {
            cancel() {
                this.$emit('close');
            },
            confirm() {
                if (this.journeyName === '') {
                    this.journeyNameError = this.$t('journey.journeyNameHolder');
                    return;
                }
                this.$emit('rename', this.journeyName);
            },
        }
    };
</script>
