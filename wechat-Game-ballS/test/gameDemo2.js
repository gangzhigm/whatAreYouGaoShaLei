import datas from './data/data.js'
let top = 1000;
// 画布初始化
const canvas = wx.createCanvas();
const ctx = canvas.getContext('2d')
// 游戏数据
let data=datas(canvas);
//运行
onload();
player();

// 功能
// 游戏初始化
function onload() {
  // 场景
  ctx.fillStyle = data.background;
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  // 对象
  ctx.beginPath();
  ctx.fillStyle = 'white';
  ctx.arc(data.posX, data.posY, data.R, 0, Math.PI * 2, true);
  ctx.closePath();
  // 文本
  ctx.font = "24px serif";
  ctx.fillText(data.text, 10, 50);
  // 排行榜
  topList();  
  // 绘制
  ctx.fill();
}
// 游戏replay
function replay() {
  data = datas(canvas);
}
// 游戏运行态
function main() {
  data.autoMove = setInterval(function () {
    // 场景
    ctx.fillStyle = data.background;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    // 对象
    ctx.beginPath();
    if (data.gameStart) {
      we();
      ctx.fillStyle = "orange";
      ctx.fillRect(data.weX, data.weY, data.weW, data.weH);
    }
    ctx.fillStyle = 'white';
    ctx.arc(data.posX, data.posY, data.R, 0, Math.PI * 2, true);
    ctx.closePath();
    // 文本
    ctx.font = "24px YaHei";
    ctx.fillText(data.text, 10, 50);
    // 绘制
    state()
    ctx.fill();
  }, 16);
}
// 障碍逻辑
function we() {
  // 障碍运行
  if (data.weX <= canvas.width) {
    data.weX -= Math.floor(Math.random() * (40 - 1 + 1) + 1);
  }
  //障碍生成
  if (data.weX < -data.weW) {
    data.weX = canvas.width;
    data.text++;
    data.weH = Math.floor(Math.random() * ((canvas.height - 150) - 20 + 1) + 20);
    data.weY = Math.floor(Math.random() * ((canvas.height*1.2) - 0 + 1) + 0);
  }
}
// 游戏状态
function state() {
  // 游戏结束状态
  if (data.weX <= (data.posX + data.R) && (data.weX + data.weW) >= (data.posX - data.R) && (data.weY + data.weH) >= (data.posY - data.R) && data.weY <= (data.posY + data.R)) {
    requestAnimationFrame(() => {
      clearInterval(data.touchDown);
      clearInterval(data.touchUp);
      data.gameStart = false;
      wx.vibrateLong({
        success(res){
          console.log(1);
        }
      })
    })
    ctx.fillStyle = "red";
    clearInterval(data.autoMove);
    let tt = setTimeout(() => {
      replay();
      onload();
      clearTimeout(tt)
    }, 3000)
  }
}
// 玩家控制
function player() {
  wx.onTouchStart(function (event) {
    console.log('touchDown')
    clearInterval(data.touchUp);
    if (data.isload == true) {
      data.text = '0';
      data.gameStart = true;
      main();
      data.isload = false;
    }
    if (data.gameStart == true) {
      console.log('666');
      data.touchDown = setInterval(() => {
        if (data.posY > data.R) {
          data.posY -= 5;
          console.log('6');
        }
      }, 16)
    }
  })
  wx.onTouchEnd(function (event) {
    console.log('touchUp')
    clearInterval(data.touchDown);
    if (data.gameStart == true) {
      console.log('999');
      data.touchUp = setInterval(() => {
        if (data.posY < canvas.height - data.R) {
          data.posY += 5;
          console.log('9');
        }
      }, 16)
    }
  })
}




function topList(){
  ctx.fillRect(canvas.width / 2, 40, canvas.width / 2 - 20, canvas.height -80);
  ctx.fillStyle='white';
  ctx.font = "24px serif";
  ctx.fillText("ca", 100, 500);
}
// // 设备电量
// wx.getBatteryInfo({
//   success(res){
//   console.log(res);
//   }
// }) 
// // 屏幕亮度
// wx.getScreenBrightness({
//   success(res){
//     console.log(res)
//   }
// })