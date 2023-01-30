const alink = document.createElement("iframe");
alink.id = `cookieIfame`;
// // alink.src = `http://127.0.0.1:3000/index.html`;
alink.src = `https://wpcp-webtest.elcapp.cn/testCookie.html`;
setTimeout(()=>{
  document.body.appendChild(alink);
  alink.onload = function () {
    alink.contentWindow.postMessage('loaded','*');
  }
  window.addEventListener("message", function(event){
    console.info('~~~~~~~~~~~~~~~');
    console.info(event);
  });
},2000);
