// 障碍运行
module.exports=function(weY,canvas,weH,text,weW){
  if (weY < canvas.height + weH) {
    return weY += Math.floor(Math.random() * (35 - 1 + 1) + 1);
  } else {
    text++;
    weY = -(weH / 2);
    weW = Math.floor(Math.random() * ((canvas.width - 150) - 0 + 1) + 0);
    weX = Math.floor(Math.random() * (canvas.width - 0 + 1) + 0);
  }
}