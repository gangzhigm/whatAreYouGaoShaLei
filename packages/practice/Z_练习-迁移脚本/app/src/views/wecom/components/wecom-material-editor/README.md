
# wecom-material-editor 企业微信素材编辑器

## 基础用法 - 单一消息素材

``` vue

<template>
    <wecom-material-editor :msgtypes="avaliableTypes" :val.sync="message[message.msgtype]"
        :msgtype.sync="msg.msgtype" @switch="handleSwitch(message)" ref="editor">
    </wecom-material-editor>
</template>

<script type="text/ecmascript-6">

import { WecomMaterialEditor } from '@/views/wecom/components';

export default {
    name: 'YourView',
    data() {
        return {
            avaliableTypes: ['none', 'text', 'image', 'link', 'miniprogram'],
            message: {
                msgtype: 'text',
                text: {
                    content: '测试多行文字内容'
                }
            }
        };
    },
    methods: {
        // 削除消息对象无用key
        handleSwitch (target) {
            Object.keys(target).forEach(key => {
                if (key !== 'msgtype' && key !== target.msgtype) {
                    this.$delete(target, key);
                }
            });
        },
        // 校验
        valid () {
            if (this.$ref.editor.valid()) {
                // 校验通过返回true
            }
        }
    },
    components: { WecomMaterialEditor }
}
</script>

```

## 进阶用法 - 多素材列表
```vue
<template>
    <div class="your-view">
        <div class="page-content">
            <div class="content-view">
                <button class="btn btn-md btn-theme" @click="valid">校验</button>
            </div>
            <div class="content-view max-height">
                <template v-for="msg in barz">
                    <!-- eslint-disable-next-line -->
                    <wecom-material-editor :msgtypes="['none', 'text', 'image', 'link', 'miniprogram']"
                        :msgtype.sync="msg.msgtype" :val.sync="msg[msg.msgtype]" @switch="handleSwitch(msg)" ref="editor">
                    </wecom-material-editor>
                </template>
            </div>
        </div>
    </div>
</template>

<script type="text/ecmascript-6">
import { WecomMaterialEditor } from '@/views/wecom/components';

export default {
    name: 'YourView',
    data () {
        return {
            barz: [
                {
                    msgtype: 'text',
                    text: {
                        content: '测试多行文字内容'
                    }
                },
                {
                    msgtype: 'image',
                    image: {
                        media_id: 'http://www.qdum.com/img/silk-bag/bag-4.png',
                    }
                },
                {
                    msgtype: 'link',
                    link: {
                        title: '测试标题内容',
                        picurl: 'http://www.qdum.com/img/silk-bag/bag-4.png',
                        desc: '测试链接描述',
                        url: 'https://example.link.com/pathexampleexampleexampleexampleexampleexampleexampleexample'
                    }
                },
                {
                    msgtype: 'miniprogram',
                    miniprogram: {
                        title: '测试消息标题',
                        pic_media_id: 'http://www.qdum.com/img/silk-bag/bag-4.png',
                        appid: 'wx8bd80126147dfAAA',
                        page: '/path/index.html'
                    }
                }
            ]
        };
    },
    methods: {
        /**
         * @description 削除无用key
         * @param {object} target 目标消息对象
         */
        handleSwitch (target) {
            Object.keys(target).forEach(key => {
                if (key !== 'msgtype' && key !== target.msgtype) {
                    this.$delete(target, key);
                }
            });
        },
        valid () {
            // v-for中的ref会自动处理为数组
            // Array.prototype.every()方法 测试每个素材编辑器实例都能通过其内部valid()校验,若发现有一个不通过，即跳出并返回false，全部通过时返回true
            const res = this.$refs.editor.every(e => e.valid());
            if (res) {
                // 校验通过
            }
        }
    },
    components: { WecomMaterialEditor }
};
</script>
<style lang="scss" type="text/scss" rel="stylesheet/scss">
.your-view {
    .max-height {
        height: 800px;
    }
}
</style>
```

## Attributes
|参数|说明|类型|可选值|默认值|说明|
|--|--|--|--|--|--|
|val|绑定值|object|-|-|需要.sycn修饰符<br>固定格式:<br>**无**```{none:null}```<br>**文本**```{content:''}```<br>**图片**```{media_id:''}```<br>**链接**```{title:'',picurl:'',desc:'',url:''}```<br>**小程序**```{title:'',pic_media_id:'',appid:'',page:''}```|
|msgtypes|可选素材类型|array|-|-|有序数组```['none', 'text', 'image', 'link', 'miniprogram']```|
|msgtype|当前素材类型|string|```'none'```,```'text'```,```'image'```,```'link'```,```'miniprogram'```|-|需要.sycn修饰符|
|readonly|只读模式|boolean|-|false|只读模式|

## Events
|事件名称|说明|回调参数|
|--|--|--|
|switch|素材切换类型事件，必须绑定示例中的指定方法|-|
> 因为企业微信素材参数结构比较特殊，如 **文本** 类型完整消息对象如下：
``` js
message: {  
    msgtype: 'text',
    text: {
        content: '测试多行文字内容'
    }
}
```
> 当切换到 **图片** 类型消息时，消息对象需要变为：
```
message: {  
    msgtype: 'image',
    image: {
        media_id: '测试多行文字内容'
    }
}
```
>因此需要在父级组件的```@switch```事件绑定固定方法，用以削除'msgtype'和'image'以外的 无用的[key|value] ```text: {content: ''}```
```js
/**
 * @description 削除无用key
 * @param {object} target 目标消息对象
 */
handleSwitch (target) {
    Object.keys(target).forEach(key => {
        if (key !== 'msgtype' && key !== target.msgtype) {
            this.$delete(target, key);
        }
    });
},
```
## Slots
|name|说明|
|--|--|
|-|组件内部直接包裹插槽dom，即可插入到素材类型选择radio前|
## Methods
|name|说明|
|--|--|
|-|校验方法，使用$ref调用组件内部的valid()方法，返回布尔值，校验失败时会高亮错误项并返回false，否则返回true|