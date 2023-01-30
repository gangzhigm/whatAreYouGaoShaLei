<template>
    <div class="typewriter">
        <div class="typewriter-box" ref="container"></div>
        <button @click="reStart()" ref="button">reStart</button>
    </div>
</template>

<script>
    // @ is an alias to /src

    export default {
        name: 'typewriter',
        data() {
            return {
                message: `经历过二十二年的恶梦和恐惧之后，
        仅存有一丝绝望的信念奢望那一切只不过是源于我脑海中某些神话中的一些片断的映像，
        我极不情愿的为我于1935年7月17日到18日夜间在澳大利亚西部所发现的一切的真实性作保。
        虽然，我的确有理由去相信我所经历的部分或者完全是幻觉——事实上，
        有各式各样的理由可以解释我经历的这一切。然而现实却是如此可怕，
        以至于有时我发觉这种渺茫的奢望几乎是不可能的。 
            如果这一切都是真的，人类必须准备好接受一些关于宇宙的全新看法，
        以及他们在这翻腾沸腾的时间漩涡中的真实处境。
        人类必须准备好去对抗一个特别的，潜伏着的危险。
        尽管它不可能吞噬整个人类，但却仍可能将怪异与无法想象的恐怖施加给其中某些莽撞的家伙身上。 `,
                textContent: '',
                num: ''
            }
        },
        created() {
            document.title = 'typewriter';
        },
        mounted(){
            this.reStart();
        },
        methods: {
            reStart() {
                this.$refs.container.textContent = '';
                this.num = 0;
                this.test();
            },
            test() {
                if (typeof (this.message[this.num]) != 'undefined') {
                    this.$refs.container.textContent += this.message[this.num];
                }

                this.num++;
                const that = this;
                if (this.num < this.message.length) {
                    this.$refs.button.style['opacity'] = '0';
                    setTimeout(function () {
                        that.test()
                    }, this.testtwo())
                } else {
                    this.$refs.button.style['opacity'] = '1';
                }
            },
            testtwo() {
                console.log();
                if(this.message[this.num - 1] === ';' || this.message[this.num - 1] === '.' || this.message[this.num - 1] === ',' || this.message[this.num - 1] === '；' || this.message[this.num - 1] === '。' || this.message[this.num - 1] === '，' ){
                    return Math.floor((Math.random() * 500) + 500);
                }else{
                    return Math.floor((Math.random() * 130) + 5);
                }
            }
        }
    }
</script>
<style lang='scss' scoped>
    .typewriter{
        font-size: 18px;
        color: #333;
        background: #f6f6f6;
        font-family: "Source-Han-Sans10a9823e631c15e";
        margin: 0;
        display: flex;
        width: 100vw;
        height: 100vh;
        padding: 0 6vw;
        box-sizing: border-box;
        line-height: 1.4em;
        flex-direction: column;
        justify-content: center;
        align-items: center;
        .typewriter-box{
            width: 100%;
            max-width: 30em;
            white-space: pre-line;
            /* pre-line	合并空白符序列，但是保留换行符。 */
            &::after{
                content: '|';
                animation: cursor 1s linear infinite;
            }
        }

        button {
            margin-top: 10px;
            transition: opacity 1s;
            opacity: 0;
            font-family: "Source-Han-Sans10a9823e631c15e";
            padding: 1em;
            font-size: 14px;
            border-radius: 5px;
            background: transparent;
            border: 2px solid #a7a8aa;
            color: #a7a8aa;
            cursor: pointer;
        }
    }
    @keyframes cursor {
        0% {
            opacity: 0;
        }
        49.9% {
            opacity: 0;
        }
        50% {
            opacity: 1;
        }
        99.9% {
            opacity: 1;
        }
    }
</style>