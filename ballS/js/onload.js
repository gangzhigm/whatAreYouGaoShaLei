// 游戏初始化
module.exports = function (canvas, ctx, posX, posY,R,text) {
  ctx.fillStyle = "black";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  ctx.beginPath();
  ctx.fillStyle = 'white';
  ctx.arc(posX, posY, R, 0, Math.PI * 2, true);
  ctx.closePath();

  ctx.font = "24px serif";
  ctx.fillText(text, 10, 50);

  ctx.fill();
}