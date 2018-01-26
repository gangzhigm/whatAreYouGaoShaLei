// toast 控件说明
// innerText : 文本
// switchs：控件动画开关

// 使用说明：
// 1.在页面.JSON上添加
// "usingComponents": {name:path}
// 2.在页面.WXML上添加组件
// <name inner-text="?1"  switchs='?2'></name>
// 3.在页面.JS中需要调用的位置
// this.setData({?2:??})
// 注：?? 元素值不得为0，0为默认关闭效果
Component({
  properties: {
    innerText: {
      type: String,
      value: 'default value',
    },
    switchs:{
      type:Number,
      value:0,
      observer: function () {
          let animation = wx.createAnimation({
            duration: 1000,
            timingFunction: 'ease',
          })
          this.animation = animation
          animation.opacity(1).step()
          animation.opacity(0).step()
          this.setData({
            animationData: animation.export(),
            switchs:0
          })
          
       }
    }
  },
  data: {},
  methods: {}
})