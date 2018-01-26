var canvas = wx.createCanvas();
var ctx = canvas.getContext('2d')
var posX = 20,
  posY = 100,
  keyX = true,
  keyY = true,
  keyMoveColor = true,  
  R = 10,
  list = [1],
  timer=null,
  color ='white',
  list = ['#00B8D4', '#FDD835', '#EF6C00', '#424242', '#FFF3E0'],
  i=0;
  

  let autoMove=setInterval(function () {
  ctx.fillStyle = "black";
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  if (posX <= canvas.width) {
    if (keyX == true) {
      posX += 1;
    } else {
      posX -= 1;
    }
  } else if (posX > canvas.width) {
    posX -= 1;
    keyX = false;
  }
  if (posX >= 0) {
    if (keyX == true) {
      posX += 1;
    } else {
      posX -= 1;
    }
  } else if (posX < 0) {
    posX += 1;
    keyX = true;
  }

  if (posY <= canvas.height) {
    if(keyY==true){
      posY += 0.25;
    }else{
      posY -= 0.25;
    }
  } else if (posY > canvas.height) {
    posY -=0.25;
    keyY=false;
  }
  if (posY >= 0) {
    if (keyY == true) {
      posY += 0.25;
    } else {
      posY -= 0.25;
    }
  } else if (posY < 0) {
    posY += 0.25;
    keyY = true;
  }
  ctx.beginPath();
  ctx.fillStyle = color;
  ctx.arc(posX, posY, R, 0, Math.PI * 2, true);
  ctx.closePath();
  ctx.fill();
}, 16);
wx.onTouchStart(function(event){
  // clearInterval(timer);  
  // timer=setInterval(()=>{
  //   R++;
  //   console.log(1);
  //   if(R>=30){
  //     clearInterval(timer);
  //   }
  // },16) 
  posX = event.changedTouches[0].clientX;
  posY = event.changedTouches[0].clientY;
})
wx.onTouchMove(function(event){
 
  if (keyMoveColor){
    keyMoveColor = false;    
    setTimeout(function (e) {
      keyMoveColor=true;
      if (i < list.length) {
        color = list[i];
        i++
      } else {
        i = 0
      }
    }, 5000)
  }
})
wx.onTouchEnd(function(){
  clearInterval(timer);
  timer = setInterval(() => {
    R--;
    console.log(1);
    if (R <= 10) {
      clearInterval(timer);
    }
  }, 16) 
  console.log(2);
  // color = 'white';  
})