module.exports = function (canvas) {
  var data = {
    "background": "#424242",
    "posX": 100,
    "posY": canvas.height / 2,
    "R": 10,
    "weX": -100,
    "weY": 0,
    "weW": 100,
    "weH": 100,
    // 操作定时器
    "touchDown": null,
    "touchUp": null,
    // 游戏运行定时器
    "autoMove": null,
    // 游戏加载完成钥匙
    "isload": true,
    // 游戏开始钥匙
    "gameStart": false,
    "text": '点击屏幕以开始'
  }
  return data;
}