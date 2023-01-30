const alink = document.createElement("iframe");
alink.id = `dmtiframe`;
const origin = "https://oss.dmartech.cn/public/NbOg2FFuhOisSZwT_DMT_1018.html";
alink.src = `${origin}?origin=${window.location.origin}`;
alink.style["top"] = "0";
alink.style["left"] = "0";
alink.style["width"] = "0px";
alink.style["opacity"] = "0";
alink.style["height"] = "0px";
alink.style["z-index"] = "-1";
alink.style["display"] = "none";
alink.style["position"] = "absolute";
alink.style["border"] = "1px solid red";
alink.style["transform"] = "translate(-100%, -100%)";
document.body.appendChild(alink);
/**
 * 说明
 * 1. 事件分为两类：浏览事件和点击事件。浏览事件名称为view, 点击事件名称为click。
 * 2. 浏览事件的属性名称来自与url中的参数(形式为属性名称=值), 点击事件属性名称来自于触发事件HTML标签上的自定义数据（形式为"data-属性名称=值"），属性名称均可在
 *     系统通过事件属性进行配置。属性名称需通过事件属性进行配置，并绑定到对应的事件上。
 * 3. event_id 为触发时的当时事件戳， virtual_id为匿名用户id，并在cookie中进行保存。
 * 4. 触发=》发送流程采用由localStorage存储作为中间层，解释如下：
 *    直接触发=》发送流程，可能存在【触发了页面跳转相关的页面逻辑】，从而导致发送接口调用失败，进而造成此次调用数据丢失且未发送成功。
 *    为了避免这种状况，需要先将数据保存至安全区域，然后在安全访问页面的状态下传输数据。
 *    因为每条数据的时间戳不相同，且在触发时就保存了。所以没有【保存的数据的event_id的数据是调用接口时间而不是触发操作的时间】的问题。
 */
if(!window.dmt_js_sdk){
  window.dmt_js_sdk = {};
  
  var dmt_js_sdk = window.dmt_js_sdk;
  
  
  // 从cookie中获取用户uuid
  dmt_js_sdk.getUuidFromCookie = function () {
      var strcookie = document.cookie;//获取cookie字符串
      var arrcookie = strcookie.split("; ");//分割
      //uuid格式
      var reg=/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[0-9a-f]{4}-[0-9a-f]{12}$/
      //遍历匹配
      for ( var i = 0; i < arrcookie.length; i++) {
          var arr = arrcookie[i].split("=");
          //返回符合uuid（版本4）的virtual_id值
          if ( arr[0] == "virtual_id" && reg.test( arr[1]) ){
              return arr[1];
          }
      }
      return null;
  }
  
  // 设置cookie中的uuid（永不过期）
  dmt_js_sdk.setUuidToCookie = function (uuid){
    const cookie = "virtual_id="+uuid+";path=/;expires=Fri, 31 Dec 9999 23:59:59 GMT";
    document.cookie = cookie
    alink.contentWindow.postMessage(cookie,origin);
  }
  
  
  // 生成uuid
  // 格式为：xxxxxxxx-xxxx-4xxx-xxxx-xxxxxxxxxxxx，其中每个 x 是 0-9 或 a-f 范围内的// 一个十六进制的数字，位数格式为8-4-4-4-12
  dmt_js_sdk.createUuid = function () {
      return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
          var r = Math.random() * 16 | 0,
              v = c == 'x' ? r : (r & 0x3 | 0x8);
          return v.toString(16);
      });
  }
  
  // 初始化uuid
  dmt_js_sdk. initUuid = function () {
      var uuid = dmt_js_sdk.getUuidFromCookie();
      if(!uuid){
          uuid = dmt_js_sdk.createUuid();
      }
      dmt_js_sdk.setUuidToCookie(uuid);
  
      // 事件属性和用户属性中保存uuid
      dmt_js_sdk.event_data["properties"]["virtual_id"] = uuid;
      dmt_js_sdk.user_data["properties"]["virtual_id"] = uuid;
  }
  
  
  // 页面加载监听方法
  dmt_js_sdk.windowLoad = function (){
      // 获取用户标签
      dmt_js_sdk.getPageTag();
      // 获取用户微信信息
      dmt_js_sdk.getWxTag();
      // 保存用户信息
      dmt_js_sdk.saveData(dmt_js_sdk.user_data);	
  
      // 浏览事件名称
      dmt_js_sdk.event_data['event'] = 'view';    
      // 获取url信息
      dmt_js_sdk.getUrlInfo();
      // 获取时间信息
      dmt_js_sdk.getDateTime();
      // 获取浏览器
      dmt_js_sdk.getNavigator();
      // 注入至本地存储中
      dmt_js_sdk.saveData(dmt_js_sdk.event_data);
  }
  
  // 鼠标点击监听方法
  dmt_js_sdk.clickListener = function (){
      document.addEventListener('click', function(){
          // 获取url信息
          dmt_js_sdk.getUrlInfo();
          // 获取时间信息
          dmt_js_sdk.getDateTime();
          // 获取浏览器
          dmt_js_sdk.getNavigator();
  
          for(let key in event.target.attributes){
              // html标签上仅获取自定义属性（以"data-"为前缀）
              let element = event.target.attributes[key]
              if(element && element.nodeName && element.nodeName.substr(0, 5) === 'data-'){
                  let name = element.nodeName.substr(5, element.nodeName.length-5);
                  dmt_js_sdk.event_data["properties"][`${name}`] = element.value
              }
          }
  
          // 事件名称
          dmt_js_sdk.event_data['event'] = 'click';
          dmt_js_sdk.event_data["properties"]['event_text'] = event.target.innerText;
          dmt_js_sdk.event_data["properties"]['event_html'] = event.target.innerHTML;
          dmt_js_sdk.event_data["properties"]['event_node'] = event.target.localName;
  
          // 注入至本地存储中
          dmt_js_sdk.saveData(dmt_js_sdk.event_data);
      })
  }
  
  // 监听数据保存方法
  dmt_js_sdk.saveData = function (data){
      // 将监听数据保存至localstorage中
      var JS_LIST = window.localStorage.getItem('dmt_js_sdk') ? JSON.parse(window.localStorage.getItem('dmt_js_sdk')) : [];
      JS_LIST.push(data);
      window.localStorage.setItem('dmt_js_sdk',JSON.stringify(JS_LIST));
      // 传输数据
      dmt_js_sdk.updateData();
  }
  
  // 传输监听数据方法
  dmt_js_sdk.updateData = function (){
      // 获取监听数据
      var JS_LIST = JSON.parse(window.localStorage.getItem('dmt_js_sdk'));
      // 遍历本地保存数据并调用接口
      JS_LIST.forEach(item => {
          //1.创建ajax对象(此处兼容性的创建)
          var xhr=null;
          try{
              xhr=new XMLHttpRequest();
          }catch(e){
              xhr=new ActiveXObject("Microsoft.XMLHTTP");
          }
          //2.调用open方法（true----异步）
          xhr.open("post","https://gate.dmartech.cn/etl/api/v1/api/import?secret=2b6efe73-3e41-482a-8b9e-7ff0bffe7a84",true);
          xhr.setRequestHeader("Content-type","application/json;charset=UTF-8");//可以发送json格式字符串
          // 3.发送数据
          xhr.send(JSON.stringify(item));
          //4.请求状态改变事件
          xhr.onreadystatechange=function(){
              if(xhr.readyState==4){
                  if(xhr.status==200){
                      console.info(xhr.responseText);
                  }else{
                      console.info("error:"+xhr.status);
                  }
              }
          }
      })
      // 调用接口后重置本地数
      window.localStorage.removeItem('dmt_js_sdk');
  }
  
  //获取本地时间对应的北京时间
  dmt_js_sdk.getBeijingTime = function (){
    //获取当地时间
    var localTime = new Date();
    //格林威治时间-当地时间的分钟数
    var offset_minute = localTime.getTimezoneOffset();
    //判断当地时间是否是北京时间
    if (offset_minute == -480) {
      return localTime;
    } else {
      return new Date(localTime.getTime()  + offset_minute  * 60 * 1000 + 8 * 60 * 60 * 1000);
    }
  }
  
  // 获取触发时间方法
  dmt_js_sdk.getDateTime = function (){
      var date = dmt_js_sdk.getBeijingTime();
      dmt_js_sdk.event_data["properties"]['origin_timestamp'] = date.getTime();
      dmt_js_sdk.event_data["properties"]['event_id'] = `${date.getFullYear()}${date.getMonth()+1}${date.getDate()}${date.getHours()}${date.getMinutes()}${date.getSeconds()}${date.getMilliseconds()}0000`;
      dmt_js_sdk.event_data["properties"]['create_time'] = `${date.getFullYear()}-${date.getMonth()+1}-${date.getDate()} ${date.getHours()}:${date.getMinutes()}:${date.getSeconds()}`;
      dmt_js_sdk.event_data["properties"]['event_date'] = `${date.getFullYear()}-${date.getMonth()+1}-${date.getDate()} ${date.getHours()}:${date.getMinutes()}:${date.getSeconds()}`;
  }
  
  // 获取url数据方法
  dmt_js_sdk.getUrlInfo = function (){
      dmt_js_sdk.event_data["properties"]["page_url"] = window.location.href
      if (window.location.hash) {
          if (window.location.hash.includes('?')) {
              dmt_js_sdk.event_data["properties"]['url_anchor'] = window.location.hash.slice(window.location.hash.indexOf('#')+1,window.location.hash.indexOf('?'));
              window.location.hash.slice(window.location.hash.indexOf('?')+1).split('&').forEach(item => {
                  dmt_js_sdk.event_data["properties"][`${item.split('=')[0]}`] = item.split('=')[1];
              });
          }
          else {
              dmt_js_sdk.event_data["properties"]['url_anchor'] = window.location.hash.slice(window.location.hash.indexOf('#')+1);
          }
      }
      if (window.location.search) {
          window.location.search.slice(window.location.search.indexOf('?')+1).split('&').forEach(item => {
              dmt_js_sdk.event_data["properties"][`${item.split('=')[0]}`] = item.split('=')[1];
          });
  
      }
  
  }
  
  // 获取网页标签信息 <meta name="page_tag" content="标签1,标签2,标签3" />
  dmt_js_sdk.getPageTag = function (){
    //注意网页标签name为page_tag,对应的用户属性name为label_ids
    if(document.getElementsByTagName("meta")
      && document.getElementsByTagName("meta")["page_tag"]
      && document.getElementsByTagName("meta")["page_tag"].content){
        dmt_js_sdk.user_data["properties"]["label_ids"] = document.getElementsByTagName("meta")["page_tag"].content
    }
  }
  
  // 获取用户微信信息
  dmt_js_sdk.getWxTag = function (){
    let reg = /^openid_.*$/
    for (let p in dmt_js_sdk.user_data["properties"]) {
      // 删除已经存在openid属性
      if ( reg.test(p) ){
        delete dmt_js_sdk.user_data["properties"][p];
      }
    }
    
    let wxid = null;
    let unionid = null;
    let openid = null;
    
    //unionid
    if(document.getElementsByTagName("meta")
      && document.getElementsByTagName("meta")["unionid"]
      && document.getElementsByTagName("meta")["unionid"].content){
        dmt_js_sdk.user_data["properties"]["unionid"] = document.getElementsByTagName("meta")["unionid"].content
    }
      
    //wxid(appid)
    if(document.getElementsByTagName("meta")
      && document.getElementsByTagName("meta")["wxid"]
      && document.getElementsByTagName("meta")["wxid"].content){
        wxid = document.getElementsByTagName("meta")["wxid"].content
    }
    
    //openid
    if(document.getElementsByTagName("meta")
      && document.getElementsByTagName("meta")["openid"]
      && document.getElementsByTagName("meta")["openid"].content){
        openid = document.getElementsByTagName("meta")["openid"].content
    }
    
    if(wxid && openid){
      dmt_js_sdk.user_data["properties"]["openid_"+wxid] = openid;
    }
      
  }
  
  // 获取浏览器信息方法
  dmt_js_sdk.getNavigator = function (){
      //浏览器的正式名称
      dmt_js_sdk.event_data["properties"]["navigator_appName"] = window.navigator.appName ? window.navigator.appName : '';
      //浏览器的版本号
      dmt_js_sdk.event_data["properties"]["navigator_appVersion"] = window.navigator.appVersion ? window.navigator.appVersion : '';
      //回用户浏览器是否启用了cookie
      dmt_js_sdk.event_data["properties"]["navigator_cookieEnabled"] = window.navigator.cookieEnabled ? window.navigator.cookieEnabled : '';
      //返回用户计算机的cpu的型号，通常intel芯片返回"x86"（火狐没有）
      dmt_js_sdk.event_data["properties"]["navigator_cpuClass"] = window.navigator.cpuClass ? window.navigator.cpuClass : '';
      // 浏览器支持的所有MIME类型的数组
      dmt_js_sdk.event_data["properties"]["navigator_mimeType"] = window.navigator.mimeType ? window.navigator.mimeType : '';
      // 浏览器正在运行的操作系统平台，包括Win16(windows3.x)
      dmt_js_sdk.event_data["properties"]["navigator_platform"] = window.navigator.platform ? window.navigator.platform : '';
      // 安装在浏览器上的所有插件的数组
      dmt_js_sdk.event_data["properties"]["navigator_plugins"] = window.navigator.plugins ? window.navigator.plugins : '';
      // 用户在自己的操作系统上设置的语言（火狐没有）
      dmt_js_sdk.event_data["properties"]["navigator_userLanguage"] = window.navigator.userLanguage ? window.navigator.userLanguage : '';
      //包含以下属性中所有或一部分的字符串：appCodeName,appName,appVersion,language,platform
      dmt_js_sdk.event_data["properties"]["navigator_userAgent"] = window.navigator.userAgent ? window.navigator.userAgent : '';
      // 用户操作系统支持的默认语言（火狐没有）
      dmt_js_sdk.event_data["properties"]["navigator_systemLanguage"] = window.navigator.systemLanguage ? window.navigator.systemLanguage : '';
      //与浏览器相关的内部代码名
      dmt_js_sdk.event_data["properties"]["navigator_appCodeName"] = window.navigator.appCodeName ? window.navigator.appCodeName : '';
      //辅版本号（通常应用于浏览器的补丁或服务包)
      dmt_js_sdk.event_data["properties"]["navigator_appMinorVersion"] = window.navigator.appMinorVersion ? window.navigator.appMinorVersion : '';
      //浏览器支持的语言 （IE没有）
      dmt_js_sdk.event_data["properties"]["navigator_language"] = window.navigator.language ? window.navigator.language : '';
      //返回浏览器是否处于在线模式（IE4以上版本）
      dmt_js_sdk.event_data["properties"]["navigator_onLine"] = window.navigator.onLine ? window.navigator.onLine : '';
      //浏览器正在运行的操作系统，其中可能有CPU的信息（IE没有）
      dmt_js_sdk.event_data["properties"]["navigator_oscpu"] = window.navigator.oscpu ? window.navigator.oscpu : '';
      // 浏览器的产品名（IE没有）
      dmt_js_sdk.event_data["properties"]["navigator_product"] = window.navigator.product ? window.navigator.product : '';
      //关于浏览器更多信息（IE没有）
      dmt_js_sdk.event_data["properties"]["navigator_productSub"] = window.navigator.productSub ? window.navigator.productSub : '';
      // 浏览器支持的加密类型（IE没有）
      dmt_js_sdk.event_data["properties"]["navigator_securityPolicy"] = window.navigator.securityPolicy ? window.navigator.securityPolicy : '';
      // 返回一个UserProfile对象，它存储用户的个人信息（火狐没有）
      dmt_js_sdk.event_data["properties"]["navigator_userProfile"] = window.navigator.userProfile ? window.navigator.userProfile : '';
      // 浏览器厂商名称（IE、火狐没有）
      dmt_js_sdk.event_data["properties"]["navigator_vender"] = window.navigator.vender ? window.navigator.vender : '';
      // 关于浏览器厂商更多的信息
      dmt_js_sdk.event_data["properties"]["navigator_vendorSub"] = window.navigator.vendorSub ? window.navigator.vendorSub : '';
      // 获取referrer
      dmt_js_sdk.event_data["properties"]["navigator_referrer"] = window.document.referrer ? window.document.referrer : '';
  }
  
  // 初始化
  dmt_js_sdk.init = function(){
    // 初始化事件数据模板
    dmt_js_sdk.event_data = { "type":"event", "properties":{} };
    // 初始化用户数据模板
    dmt_js_sdk.user_data = { "type":"user", "properties":{} };
  
    //初始化匿名用户id
    dmt_js_sdk.initUuid();
  
    // 监听页面加载
    dmt_js_sdk.windowLoad();
  
    // 监听点击事件
    dmt_js_sdk.clickListener();
  }
}
  
alink.onload = function(){
  window.dmt_js_sdk.init();
}

window.addEventListener("message", function(e){
  if(e.data.uuid){
    window.dmt_js_sdk.setUuidToCookie(e.data.uuid)
  }
}, false);
  