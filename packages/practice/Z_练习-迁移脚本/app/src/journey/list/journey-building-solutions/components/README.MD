# min-carousel 旅程弹窗教学底预览轮播小组件

## Attributes

|参数|说明|类型|可选值|默认值|说明|
|--|--|--|--|--|--|
|buildTitle|轮播组件标题|string|-|-|-|
|imageList|图片数组|array|-|-|格式为```[{picUrl: ''},{picUrl: ''}...]```|
|carouselType|当前组件类型|string|```'img'```,```'video'```|```'img'```|-|
|isCheck|是否选中该组件|boolean|-|true|如果同时使用两个及以上此组件在一个页面内，此属性最多只能有一个为true|
|jumpUrl|跳转所需要的链接及链接名称|object|-|-|格式为```{name: '',url: ''}```|
|imgNum|所需要展示的图片数量|number|-|3|图片宽为150px，margin左右为10px， 和为170px000px弹窗最多展示五张（旅程列表弹窗所需三张），其余情况下根据父级盒子宽度自行定义

## Events

|事件名称|说明|回调参数|
|--|--|--|
|handleClickImg|切换以及点击图片事件|carouselType为img时返回索引值index，为video返回对象|

视频播放的状态事件通过父组件进行调用
