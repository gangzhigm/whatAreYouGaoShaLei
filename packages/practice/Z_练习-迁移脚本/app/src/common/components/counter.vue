<template>
    <div class="counter">
        <button class="btn btn-white less-btn" @click="handleDown" :disabled="currentValue <= min">
            -
        </button>
        <div class="number-input-box">
            <input class="input number-input" type="number" :value="currentValue" @change="handleChange">
            <span class="unit" v-if="unitFlag">{{unit}}</span>
        </div>
        <button class="btn btn-white add-btn" @click="handleUp" :disabled="currentValue >= max">
            +
        </button>
    </div>
</template>
<script>
    // 操作区 - 属性小组件：计数器，加号减号输入框
    export default {
        name: 'counter',
        props: {
            type:{
                type:String,
                default:'text',//'text'提示文字大小，'form'表单标题字体大小
            },
            max:{
                type: Number,
                default: Infinity
            },
            min:{
                type: Number,
                default: -Infinity
            },
            value:{
                type: Number,
                default: 0
            },
            unitFlag:{//是否需要显示单位
                type: Boolean,
                default: false,
            },
            unit:{
                type:[String,Number],
                default:'',
            }

        },
        data() {
            return {
                currentValue: this.value,
            };
        },
        mounted(){
            this.updateValue(this.value);
        },
        watch:{
            currentValue(val){
                this.$emit('input',val);
                this.$emit('on-change',val);
            },
            value(val){
                this.updateValue(val);
            }
        },
        computed: {},
        methods: {
            //是否时数字
            isValueNumber(value){
                return (/(^-?[0-9]+\.{1}\d+$)|(^-?[1-9][0-9]*$)|(^-?0{1}$)/).test(value);
            },
            //减号事件
            handleDown(){
                if (this.currentValue <= this.min) return;
                this.currentValue -= 1;
                this.$emit('currentValue',this.currentValue,this.type);
            },
            //加号事件
            handleUp(){
                if (this.currentValue >= this.max) return;
                this.currentValue += 1;
                this.$emit('currentValue',this.currentValue,this.type);
            },
            //输入值
            handleChange(event){
                //去除空格
                let val = event.target.value.trim();
                let max = this.max;
                let min = this.min;
                //如果输入的是符合条件的数字,就把输入的值赋给currentValue
                if (this.isValueNumber(val)) {
                    val = Number(val);
                    this.currentValue = val;
                    if (val > max) {
                        this.currentValue =  min;
                    } else if (val < min) {
                        this.currentValue = min;
                    }
                } else {
                    //如果输入的内容不是数字，则重置之前的currentValue
                    event.target.value = this.currentValue;
                }
                this.$emit('currentValue',this.currentValue,this.type);
            },
            //过滤从父组件传来的不符合条件的值
            updateValue(val){
                if (val > this.max) val = this.max;
                if (val < this.min) val = this.min;
                this.currentValue = val;
            }
        }
    };
</script>
<style lang="scss" type="text/scss" rel="stylesheet/scss">
    @import "../scss/base/variables";
    @import "../scss/base/mixin";

    .counter {
        display: flex;
        .number-input-box{
            display: flex;
            position: relative;
            .number-input{
                width: 50px;
                border-radius: 0;
            }
            .unit{
                position: absolute;
                top: 10px;
                right: 10px;
                color: $disabled;
            }
        }
        .add-btn{
            border-left: none;
        }
        .add-btn, .less-btn{
            border-radius: 0;
        }
        .less-btn{
            border-right: 0;

        }
        .less-btn.btn-white[disabled]{
            border-right:0;
        }
        .add-btn.btn-white[disabled]{
            border-left:0;
        }
    }

</style>