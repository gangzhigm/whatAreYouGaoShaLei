//index.js
//获取应用实例
const app = getApp()

Page({
  onShareAppMessage: function () {
    return {
      title: '自定义转发标题',
      path: '/page/index'
    }
  },
  onLoad() {
    var animation = wx.createAnimation({
      transformOrigin: "50% 50%",
      duration: 1000,
      timingFunction: "ease",
      delay: 0
    })
    let game = require("psndata.json.js");
    let background = [];
    let psvList = [];
    let ps3List = [];
    let ps4List = [];
    for (let i of game.game.game) {
      if (i.playstation[0] == 'psv') {
        background.push('#43bef7');
        psvList.push(i);
      }
      if (i.playstation[0] == 'ps3') {
        background.push('#f8cd28');
        ps3List.push(i);
      }
      if (i.playstation[0] == 'ps4') {
        background.push('#fc1a86');
        ps4List.push(i);
      }
    }
    this.setData({//获取数据成功后的数据绑定  
      gameList: game.game.game,
      psvList: psvList,
      ps3List: ps3List,
      ps4List: ps4List,
      background: background,
    });
  },
  onReady() {
  },
  data: {
    animationData: {},
    nodesPlaystation: [{
      name: 'h1',
      attrs: {
        class: 'div_class',
        style: 'line-height: 60px; color: #444444;text-indent:3vw;'
      },
      children: [{
        type: 'text',
        text: '类别'
      }]
    }]
  },
  onShow: function () {
    var animation = wx.createAnimation({
      duration: 100,
      timingFunction: 'linear',
    })

    this.animation = animation
    let x = 3;
    let y = 3;
    let r=1;
    setInterval(()=>{
      // x++;
         // if (x > 10) {
         //   x = 0;
        // } else {
        //   x++;
          // }
        // if (y > 10) {
        //   y = 0;
           // } else {
         //   y++;
           // }
      if (r > 360) {
        r = 0;
      } else {
        r++;
      }
      // animation.scale(x, y).rotate(r).step();
      animation.rotate(r).step();
      this.setData({
        animationData: animation.export()
      })
    },100);
    
  },
  tap() {
    wx.navigateTo({
      url: '/pages/content/contetn'
    })
  },
  intervalChange(){
    console.log(1);
  }
})