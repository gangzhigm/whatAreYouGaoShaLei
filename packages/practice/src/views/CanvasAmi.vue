<template>
    <div class="box-canvasami">
        <canvas class="canvas" id="One" width="150" height="150"></canvas>
        <canvas class="canvas" id="Two" width="150" height="150"></canvas>
        <canvas class="canvas" id="Tre" width="150" height="150"></canvas>
    </div>
</template>

<script>
    export default {
        name: 'typewriter',
        data() {
            return {
                Round_item: function(index,x,y){
                    this.index = index;
                    this.x = x;
                    this.y = y;
                    this.r = Math.random() * 2 + 1;
                    var alpha = (Math.floor(Math.random() * 10) + 1) / 10 / 2;
                    this.color = "rgba(255,255,255," + alpha + ")";
                },

                canvasOne:{},
                contextOne:{},

                canvasTwo:{},
                contextTwo:{},
                configTwo:{
                    round : [],
                    WIDTH : 150,
                    HEIGHT : 150,
                    initRoundPopulation : 600,
                },

                canvasTre:{},
                contextTre:{},
                configTre:{
                    WIDTH : 150,
                    HEIGHT : 150,
                    para : {
                        num : 100,
                        color: false,
                        r : 0.9,
                        o : 0.09,
                        a : 1,
                    },
                    color : '',
                    color2 : '',
                    round_arr : []
                },
            }
        },
        mounted() {
            this.Round_item_Prototype_Config();
            this.Cancas_config();
            this.initOne();
            this.initTwo();
            this.initTre();
        },
        methods: {
            Cancas_config(){
                this.canvasOne = document.getElementById('One');
                this.contextOne = this.canvasOne.getContext('2d');

                this.canvasTwo = document.getElementById('Two');
                this.contextTwo = this.canvasTwo.getContext('2d');
                this.canvasTwo.width = this.configTwo.WIDTH;
                this.canvasTwo.height = this.configTwo.HEIGHT;

                this.canvasTre = document.getElementById('Tre');
                this.contextTre = this.canvasTre.getContext('2d');
                this.canvasTre.width = this.configTre.WIDTH;
                this.canvasTre.height = this.configTre.HEIGHT;
            },
            initOne(){
                this.contextOne.beginPath();
                this.contextOne.arc(50,50,5,0,Math.PI*2,true);
                this.contextOne.closePath();
                this.contextOne.fillStyle = 'rgb(255,255,255)';
                this.contextOne.fill();
            },
            initTwo(){
                for(let i = 0; i< this.configTwo.initRoundPopulation; i++){
                    this.configTwo.round[i] = new this.Round_item(i, Math.random()*this.configTwo.WIDTH, Math.random()*this.configTwo.HEIGHT);
                    this.configTwo.round[i].draw();
                }
                this.animateTwo();
            },
            initTre(){
                this.canvasTre.onmousemove = this.mousemove_ami;
                
                this.configTre.color = `rgba(${Math.random() * 255},${Math.random() * 255},${Math.random() * 255},${Math.random()})`;
                this.configTre.color2 = this.configTre.para.color ? this.configTre.para.color : this.configTre.color;

                this.animateTre();
            },
            Round_item_Prototype_Config(){
                const that = this;
                this.Round_item.prototype.draw = function(){
                    that.contextTwo.fillStyle = this.color;
                    that.contextTwo.shadowBlur = this.r * 2;
                    that.contextTwo.beginPath();
                    that.contextTwo.arc(this.x, this.y, this.r, 0, 2*Math.PI,false);
                    that.contextTwo.closePath();
                    that.contextTwo.fill();
                };
                this.Round_item.prototype.move = function(){
                    this.y = this.y <= -10 ? that.configTwo.HEIGHT +0.5 : this.y -1.15;
                    this.draw();
                }
            },
            animateTwo(){
                this.contextTwo.clearRect(0,0,this.configTwo.WIDTH,this.configTwo.HEIGHT);
                for(let item of this.configTwo.round){
                    item.move();
                }
                requestAnimationFrame(this.animateTwo);
            },
            mousemove_ami(event){
                this.configTre.round_arr.push({
                    mouseX : event.clientX - this.canvasTre.offsetLeft,
                    mouseY : event.clientY - this.canvasTre.offsetTop,
                    r : this.configTre.para.r,
                    o : 1,
                })
            },
            animateTre(){
                this.configTre.color = this.configTre.para.color ? this.configTre.para.color : `rgba(${Math.random() * 255},${Math.random() * 255},${Math.random() * 255},${Math.random()})`;
                this.configTre.color2 = this.configTre.para.color ? this.configTre.para.color : this.configTre.color;
                this.contextTre.clearRect(0,0,this.configTre.WIDTH,this.configTre.HEIGHT);
                for(let [index,item] of this.configTre.round_arr.entries()){
                    this.contextTre.fillStyle = this.configTre.color2;
                    this.contextTre.beginPath();
                    this.contextTre.arc(item.mouseX,item.mouseY,item.r,0,Math.PI*2);
                    this.contextTre.closePath();
                    this.contextTre.fill();
                    item.r += this.configTre.para.r;
                    item.o += this.configTre.para.o;
                    if(item.o >= 2 ){
                        this.configTre.round_arr.splice(index,1);
                    }
                }
                requestAnimationFrame(this.animateTre);
            }
        }
    }
</script>
<style lang='scss' scoped>
.box-canvasami{
    display: flex;
    flex-direction: row;
    justify-content: space-around;
    align-items: center;
}
.canvas{
    background-color: #1C1D21;
}
#One{
    cursor: grab;
}
#Two{
    cursor: none;
}
#Tre{
    cursor: crosshair;
}
</style>