<template>
    <div class="box-cssshade">
        <div class="mask-image back" :style="getBackImg()"></div>
        <div class="mask-image front" :style="getFrontImg()"></div>
        <div class="mask-image mask" :style="getMask()"></div>
    </div>
</template>

<script>
    export default {
        name: 'typewriter',
        data() {
            return {
                backImg:require('../assets/sponge.jpg'),
                frontImg:require('../assets/spongebob.gif')
            }
        },
        created() {
            document.title = 'typewriter';
        },
        methods: {
            getBackImg(){
                const style = `background-image:url('${this.backImg}');
                               background-size:contain;
                               background-repeat:no-repeat;
                               background-position:center;`
                return style
            },
            getFrontImg(){
                const style = `background-image:url('${this.frontImg}');
                               background-size:contain;
                               background-repeat:no-repeat;
                               background-position:center;`
                return style
            },
            getMask(){
                const style = `background-image:url('${this.backImg}');
                               background-size:contain;
                               background-repeat:no-repeat;
                               background-position:center;
                               
                               mask-image: url(${this.frontImg});
                               mask-size: contain;
                               mask-repeat: no-repeat;
                               mask-position: center;
                               `
                return style
            },
        }
    }
</script>
<style lang='scss' scoped>
.box-cssshade{
    display: flex;
    flex-direction: row;
    justify-content: space-around;
    align-items: center;
}
.mask-image{
    width: 200px;
    height: 200px;
    border: 1px dotted #000;
}
</style>