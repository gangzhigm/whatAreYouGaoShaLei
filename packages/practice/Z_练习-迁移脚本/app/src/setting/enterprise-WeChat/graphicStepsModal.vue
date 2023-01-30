<template>
    <div class="text-images">
        <modal :title="$t('enterpriseWeChat.textImg')" size="lg" @close="$emit('close')">
            <div v-for="item in stepImages" class="graphic">
                <img :src="item.url">
            </div>
        </modal>
    </div>
</template>

<script>
    export default {
        name: 'GraphicStepsModal',
        props: {
            stepImages: {
                type: Array,
                default: []
            }
        },
    };
</script>

<style lang="scss">
    .text-images {
        .modal-content{
            max-height: 600px;
            overflow: hidden;
            overflow-y: scroll;
            display: flex;
            flex-wrap: wrap;
        }
        .graphic{
            width: 100%;
            img{
                width: 100%;
            }
        }
    }
</style>
