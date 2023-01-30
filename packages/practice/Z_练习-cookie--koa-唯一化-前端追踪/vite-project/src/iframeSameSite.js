const btn_getLocalCookie = document.getElementById("getLocalCookie");
const btn_setLocalCookie = document.getElementById("setLocalCookie");
const label_cookieDomText_Key = document.getElementById("cookieDomText_Key");
const label_cookieDomText_Value = document.getElementById("cookieDomText_Value");
const label_step = document.getElementById("step");

function uuid() {
  var s = [];
  var hexDigits = "0123456789abcdef";
  for (var i = 0; i < 36; i++) {
      s[i] = hexDigits.substr(Math.floor(Math.random() * 0x10), 1);
  }
  s[14] = "4";  // bits 12-15 of the time_hi_and_version field to 0010
  s[19] = hexDigits.substr((s[19] & 0x3) | 0x8, 1);  // bits 6-7 of the clock_seq_hi_and_reserved to 01
  s[8] = s[13] = s[18] = s[23] = "-";
  var uuid = s.join("");
  return uuid;
}


function setLocalCookie(cname,cvalue,exdays){
  var d = new Date();
  d.setTime(d.getTime()+(exdays*24*60*60*1000));
  var expires = "expires="+d.toString();
  console.info(1);
  // document.cookie = cname + "=" + cvalue + "; " + expires;
  // document.cookie = `${cname}=${cvalue};path=/a;${expires};`;
  // document.cookie = "testCookie=f993f5e8-ca41-4196-8018-cf4095ad364d; path=/; domain=.a.b.test.com; samesite=none"
  document.cookie = "blogCookie=blog";
}

function getLocalCookie(cname){
  var name = cname + "=";
  var ca = document.cookie.split(';');
  var reqCookie = '';
  for(var i=0; i<ca.length; i++) {
    var c = ca[i].trim();
    if (c.indexOf(name)==0) {
      return c.substring(name.length,c.length);
    }
  }
  return '';
}
const UUID = uuid();


setTimeout(()=>{
  console.info('hahahahahah');
  setLocalCookie();
},2000);
console.info("this.is.a.script.by.samesite")