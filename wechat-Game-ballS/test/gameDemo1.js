const onload = require('./js/onload.js');
// const we = require('./js/well.js');
const canvas = wx.createCanvas();
const ctx = canvas.getContext('2d')
let posX = (canvas.width / 2),
  posY = canvas.height - 200,
  weX = 0,
  weY = 0,
  weW = 100,
  weH = 100,
  R = 10,
  touchDown = null,
  touchMove = null,
  gameStart = false,
  autoMove = null,
  text = '按住屏幕以开始',
  isOk = true,
  keyMove = true;


onload(canvas, ctx, posX, posY, R, text);
player();



// 游戏replay
function replay() {
  posX = (canvas.width / 2),
    posY = canvas.height - 200,
    weX = 0,
    weY = 0,
    weW = 100,
    weH = 100,
    R = 10,
    touchDown = null,
    touchMove = null,
    gameStart = false,
    autoMove = null,
    text = '按住屏幕以开始',
    isOk = true,
    keyMove = true;
}
// 游戏运行态
function main() {
  autoMove = setInterval(function () {
    ctx.fillStyle = "black";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.beginPath();


    if (gameStart) {
      we(weY, canvas, weH, text, weW);
      ctx.fillStyle = "orange";
      ctx.fillRect(weX, weY, weW, weH);
    }

    ctx.fillStyle = 'white';
    ctx.arc(posX, posY, R, 0, Math.PI * 2, true);
    ctx.closePath();

    ctx.font = "24px YaHei";
    ctx.fillText(text, 10, 50);

    state()

    ctx.fill();
  }, 16);
}
// 玩家控制
function player() {
  wx.onTouchStart(function (event) {
    gameStart = true;
    if (isOk == true) {
      text = '0';
      main();
      isOk = false;
    }
  })
  wx.onTouchMove(function (event) {
    clearInterval(touchDown);
    touchMove = setTimeout(() => {
      posX = event.changedTouches[0].clientX;
    }, 10)
    if (posX <= R) {
      posX = R
    } else if (posX >= (canvas.width - R)) {
      posX = canvas.width - R
    }
  })
  wx.onTouchEnd(function (event) {
    clearInterval(touchDown);
    clearTimeout(touchMove);
  })
}
// 障碍运行
function we() {
  if (weY < canvas.height + weH) {
    return weY += Math.floor(Math.random() * (35 - 1 + 1) + 1);
  } else {
    text++;
    weY = -(weH / 2);
    weW = Math.floor(Math.random() * ((canvas.width - 150) - 0 + 1) + 0);
    weX = Math.floor(Math.random() * (canvas.width - 0 + 1) + 0);
  }
}
// 游戏状态
function state() {
  if ((weY + weH + 2 * R) >= posY) {
    if ((weX + weW) >= (posX - R) && weX <= (posX + R) && (weY + weH) >= (posY - R) && weY <= (posY + R)) {
      ctx.fillStyle = "red";
      clearInterval(autoMove);
      let tt = setTimeout(() => {
        replay();
        onload(canvas, ctx, posX, posY, R, text);
        clearTimeout(tt)
      }, 3000)
    }
  }
}