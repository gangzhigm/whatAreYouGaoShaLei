<template>
    <modal v-if="visible" :title="$t('common.notice')" class="guide-modal" @close="close">
        <div class="guide">
            <img src="./guide.png" alt="guide">
            <p>{{'newJourney.step' | t}}</p>
            <p>{{'newJourney.tips' | t}}</p>
        </div>
        <template v-slot:buttons>
            <checkbox v-model="choose" class="pull-left">{{'newJourney.noPrompt' | t}}</checkbox>
            {{time}} {{'newJourney.seconds' | t}} {{'newJourney.autoClose' | t}}
            <input type="button" class="btn btn-md btn-theme" @click="close"
                   :value="$t('common.confirm')"/>
        </template>
    </modal>
</template>

<script type="text/ecmascript-6">
    import {CLOSE_GUIDE} from '@/store/vuex/mutationTypes';
    import {DRAGGABLE_JOURNEY_STORE_NAME} from '@/store/vuex/modules/canvasStore';
    import {SAVE_JOURNEY} from '@/store/vuex/actionTypes';
    import { mapActions, mapMutations, mapState } from 'vuex';

    export default {
        data() {
            return {
                time: 5,    // 5 seconds to close
                choose: false,
                counter: null,
            };
        },
        computed: {
            ...mapState({
                storeName: state => state[DRAGGABLE_JOURNEY_STORE_NAME]
            }),
            visible() {
                const state = this.storeName;
                return state.journeyInformation.id
                    && state.journeyInformation.journeyType === 2
                    && state.canvasInformation.showGuide
                    && this.time > 0;
            },
        },
        mounted() {
            if (this.visible) {
                this.counter = setInterval(() => {
                    this.time = this.time - 1;
                    if (this.time === 0) {
                        this.close();
                    }
                }, 1000);
            }
        },
        methods: {
            ...mapActions([SAVE_JOURNEY]),
            ...mapMutations([CLOSE_GUIDE]),
            close() {
                clearInterval(this.counter);
                this.CLOSE_GUIDE();
                this.SAVE_JOURNEY();
            }
        }
    };
</script>

<style lang="scss">
    .guide-modal {
        .guide {
            text-align: center;

            p {
                color: #666666;
                margin-top: 20px;
            }
        }
    }

</style>
