/**
 * 璇存槑
 * 1. 浜嬩欢鍒嗕负涓ょ被锛氭祻瑙堜簨浠跺拰鐐瑰嚮浜嬩欢銆傛祻瑙堜簨浠跺悕绉颁负view, 鐐瑰嚮浜嬩欢鍚嶇О涓篶lick銆�
 * 2. 娴忚浜嬩欢鐨勫睘鎬у悕绉版潵鑷笌url涓殑鍙傛暟(褰㈠紡涓哄睘鎬у悕绉�=鍊�), 鐐瑰嚮浜嬩欢灞炴€у悕绉版潵鑷簬瑙﹀彂浜嬩欢HTML鏍囩涓婄殑鑷畾涔夋暟鎹紙褰㈠紡涓�"data-灞炴€у悕绉�=鍊�"锛夛紝灞炴€у悕绉板潎鍙湪
 *     绯荤粺閫氳繃浜嬩欢灞炴€ц繘琛岄厤缃€傚睘鎬у悕绉伴渶閫氳繃浜嬩欢灞炴€ц繘琛岄厤缃紝骞剁粦瀹氬埌瀵瑰簲鐨勪簨浠朵笂銆�
 * 3. event_id 涓鸿Е鍙戞椂鐨勫綋鏃朵簨浠舵埑锛� virtual_id涓哄尶鍚嶇敤鎴穒d锛屽苟鍦╟ookie涓繘琛屼繚瀛樸€�
 * 4. 瑙﹀彂=銆嬪彂閫佹祦绋嬮噰鐢ㄧ敱localStorage瀛樺偍浣滀负涓棿灞傦紝瑙ｉ噴濡備笅锛�
 *    鐩存帴瑙﹀彂=銆嬪彂閫佹祦绋嬶紝鍙兘瀛樺湪銆愯Е鍙戜簡椤甸潰璺宠浆鐩稿叧鐨勯〉闈㈤€昏緫銆戯紝浠庤€屽鑷村彂閫佹帴鍙ｈ皟鐢ㄥけ璐ワ紝杩涜€岄€犳垚姝ゆ璋冪敤鏁版嵁涓㈠け涓旀湭鍙戦€佹垚鍔熴€�
 *    涓轰簡閬垮厤杩欑鐘跺喌锛岄渶瑕佸厛灏嗘暟鎹繚瀛樿嚦瀹夊叏鍖哄煙锛岀劧鍚庡湪瀹夊叏璁块棶椤甸潰鐨勭姸鎬佷笅浼犺緭鏁版嵁銆�
 *    鍥犱负姣忔潯鏁版嵁鐨勬椂闂存埑涓嶇浉鍚岋紝涓斿湪瑙﹀彂鏃跺氨淇濆瓨浜嗐€傛墍浠ユ病鏈夈€愪繚瀛樼殑鏁版嵁鐨別vent_id鐨勬暟鎹槸璋冪敤鎺ュ彛鏃堕棿鑰屼笉鏄Е鍙戞搷浣滅殑鏃堕棿銆戠殑闂銆�
 */


 if(!window.dmt_js_sdk){
    window.dmt_js_sdk = {};
    var dmt_js_sdk = window.dmt_js_sdk;
    
    
    // 浠巆ookie涓幏鍙栫敤鎴穟uid
    dmt_js_sdk.getUuidFromCookie = function () {
        var strcookie = document.cookie;//鑾峰彇cookie瀛楃涓�
        var arrcookie = strcookie.split("; ");//鍒嗗壊
        //uuid鏍煎紡
        var reg=/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[0-9a-f]{4}-[0-9a-f]{12}$/
        //閬嶅巻鍖归厤
        for ( var i = 0; i < arrcookie.length; i++) {
            var arr = arrcookie[i].split("=");
            //杩斿洖绗﹀悎uuid锛堢増鏈�4锛夌殑virtual_id鍊�
            if ( arr[0] == "virtual_id" && reg.test( arr[1]) ){
                return arr[1];
            }
        }
        return null;
    }
    
    // 璁剧疆cookie涓殑uuid锛堟案涓嶈繃鏈燂級
    dmt_js_sdk.setUuidToCookie = function (uuid){
        document.cookie="virtual_id="+uuid+";path=/;expires=Fri, 31 Dec 9999 23:59:59 GMT";
    }
    
    
    // 鐢熸垚uuid
    // 鏍煎紡涓猴細xxxxxxxx-xxxx-4xxx-xxxx-xxxxxxxxxxxx锛屽叾涓瘡涓� x 鏄� 0-9 鎴� a-f 鑼冨洿鍐呯殑// 涓€涓崄鍏繘鍒剁殑鏁板瓧锛屼綅鏁版牸寮忎负8-4-4-4-12
    dmt_js_sdk.createUuid = function () {
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
            var r = Math.random() * 16 | 0,
                v = c == 'x' ? r : (r & 0x3 | 0x8);
            return v.toString(16);
        });
    }
    
    // 鍒濆鍖杣uid
    dmt_js_sdk. initUuid = function () {
        var uuid = dmt_js_sdk.getUuidFromCookie();
        if(!uuid){
            uuid = dmt_js_sdk.createUuid();
        }
        dmt_js_sdk.setUuidToCookie(uuid);
    
        // 浜嬩欢灞炴€у拰鐢ㄦ埛灞炴€т腑淇濆瓨uuid
        dmt_js_sdk.event_data["properties"]["virtual_id"] = uuid;
        dmt_js_sdk.user_data["properties"]["virtual_id"] = uuid;
    }
    
    
    // 椤甸潰鍔犺浇鐩戝惉鏂规硶
    dmt_js_sdk.windowLoad = function (){
        // 鑾峰彇鐢ㄦ埛鏍囩
        dmt_js_sdk.getPageTag();
        // 鑾峰彇鐢ㄦ埛寰俊淇℃伅
        dmt_js_sdk.getWxTag();
        // 淇濆瓨鐢ㄦ埛淇℃伅
        dmt_js_sdk.saveData(dmt_js_sdk.user_data);	
    
        // 娴忚浜嬩欢鍚嶇О
        dmt_js_sdk.event_data['event'] = 'view';    
        // 鑾峰彇url淇℃伅
        dmt_js_sdk.getUrlInfo();
        // 鑾峰彇鏃堕棿淇℃伅
        dmt_js_sdk.getDateTime();
        // 鑾峰彇娴忚鍣�
        dmt_js_sdk.getNavigator();
        // 娉ㄥ叆鑷虫湰鍦板瓨鍌ㄤ腑
        dmt_js_sdk.saveData(dmt_js_sdk.event_data);
    }
    
    // 榧犳爣鐐瑰嚮鐩戝惉鏂规硶
    dmt_js_sdk.clickListener = function (){
        document.addEventListener('click', function(){
            // 鑾峰彇url淇℃伅
            dmt_js_sdk.getUrlInfo();
            // 鑾峰彇鏃堕棿淇℃伅
            dmt_js_sdk.getDateTime();
            // 鑾峰彇娴忚鍣�
            dmt_js_sdk.getNavigator();
    
            for(let key in event.target.attributes){
                // html鏍囩涓婁粎鑾峰彇鑷畾涔夊睘鎬э紙浠�"data-"涓哄墠缂€锛�
                let element = event.target.attributes[key]
                if(element && element.nodeName && element.nodeName.substr(0, 5) === 'data-'){
                    let name = element.nodeName.substr(5, element.nodeName.length-5);
                    dmt_js_sdk.event_data["properties"][`${name}`] = element.value
                }
            }
    
            // 浜嬩欢鍚嶇О
            dmt_js_sdk.event_data['event'] = 'click';
            dmt_js_sdk.event_data["properties"]['event_text'] = event.target.innerText;
            dmt_js_sdk.event_data["properties"]['event_html'] = event.target.innerHTML;
            dmt_js_sdk.event_data["properties"]['event_node'] = event.target.localName;
    
            // 娉ㄥ叆鑷虫湰鍦板瓨鍌ㄤ腑
            dmt_js_sdk.saveData(dmt_js_sdk.event_data);
        })
    }
    
    // 鐩戝惉鏁版嵁淇濆瓨鏂规硶
    dmt_js_sdk.saveData = function (data){
        // 灏嗙洃鍚暟鎹繚瀛樿嚦localstorage涓�
        var JS_LIST = window.localStorage.getItem('dmt_js_sdk') ? JSON.parse(window.localStorage.getItem('dmt_js_sdk')) : [];
        JS_LIST.push(data);
        window.localStorage.setItem('dmt_js_sdk',JSON.stringify(JS_LIST));
        // 浼犺緭鏁版嵁
        dmt_js_sdk.updateData();
    }
    
    // 浼犺緭鐩戝惉鏁版嵁鏂规硶
    dmt_js_sdk.updateData = function (){
        // 鑾峰彇鐩戝惉鏁版嵁
        var JS_LIST = JSON.parse(window.localStorage.getItem('dmt_js_sdk'));
        // 閬嶅巻鏈湴淇濆瓨鏁版嵁骞惰皟鐢ㄦ帴鍙�
        JS_LIST.forEach(item => {
            //1.鍒涘缓ajax瀵硅薄(姝ゅ鍏煎鎬х殑鍒涘缓)
            var xhr=null;
            try{
                xhr=new XMLHttpRequest();
            }catch(e){
                xhr=new ActiveXObject("Microsoft.XMLHTTP");
            }
            //2.璋冪敤open鏂规硶锛坱rue----寮傛锛�
            xhr.open("post","https://gate.dmartech.cn/etl/api/v1/api/import?secret=2b6efe73-3e41-482a-8b9e-7ff0bffe7a84",true);
            xhr.setRequestHeader("Content-type","application/json;charset=UTF-8");//鍙互鍙戦€乯son鏍煎紡瀛楃涓�
            // 3.鍙戦€佹暟鎹�
            xhr.send(JSON.stringify(item));
            //4.璇锋眰鐘舵€佹敼鍙樹簨浠�
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
        // 璋冪敤鎺ュ彛鍚庨噸缃湰鍦版暟
        window.localStorage.removeItem('dmt_js_sdk');
    }
    
    //鑾峰彇鏈湴鏃堕棿瀵瑰簲鐨勫寳浜椂闂�
    dmt_js_sdk.getBeijingTime = function (){
        //鑾峰彇褰撳湴鏃堕棿
        var localTime = new Date();
        //鏍兼灄濞佹不鏃堕棿-褰撳湴鏃堕棿鐨勫垎閽熸暟
        var offset_minute = localTime.getTimezoneOffset();
        //鍒ゆ柇褰撳湴鏃堕棿鏄惁鏄寳浜椂闂�
        if (offset_minute == -480) {
            return localTime;
        } else {
            return new Date(localTime.getTime()  + offset_minute  * 60 * 1000 + 8 * 60 * 60 * 1000);
        }
    }
    
    // 鑾峰彇瑙﹀彂鏃堕棿鏂规硶
    dmt_js_sdk.getDateTime = function (){
        var date = dmt_js_sdk.getBeijingTime();
        dmt_js_sdk.event_data["properties"]['origin_timestamp'] = date.getTime();
        dmt_js_sdk.event_data["properties"]['event_id'] = `${date.getFullYear()}${date.getMonth()+1}${date.getDate()}${date.getHours()}${date.getMinutes()}${date.getSeconds()}${date.getMilliseconds()}0000`;
        dmt_js_sdk.event_data["properties"]['create_time'] = `${date.getFullYear()}-${date.getMonth()+1}-${date.getDate()} ${date.getHours()}:${date.getMinutes()}:${date.getSeconds()}`;
        dmt_js_sdk.event_data["properties"]['event_date'] = `${date.getFullYear()}-${date.getMonth()+1}-${date.getDate()} ${date.getHours()}:${date.getMinutes()}:${date.getSeconds()}`;
    }
    
    // 鑾峰彇url鏁版嵁鏂规硶
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
    
    // 鑾峰彇缃戦〉鏍囩淇℃伅 <meta name="page_tag" content="鏍囩1,鏍囩2,鏍囩3" />
    dmt_js_sdk.getPageTag = function (){
        //娉ㄦ剰缃戦〉鏍囩name涓簆age_tag,瀵瑰簲鐨勭敤鎴峰睘鎬ame涓簂abel_ids
        if(document.getElementsByTagName("meta")
            && document.getElementsByTagName("meta")["page_tag"]
            && document.getElementsByTagName("meta")["page_tag"].content){
                dmt_js_sdk.user_data["properties"]["label_ids"] = document.getElementsByTagName("meta")["page_tag"].content
        }
    }
    
    // 鑾峰彇鐢ㄦ埛寰俊淇℃伅
    dmt_js_sdk.getWxTag = function (){
        let reg = /^openid_.*$/
        for (let p in dmt_js_sdk.user_data["properties"]) {
            // 鍒犻櫎宸茬粡瀛樺湪openid灞炴€�
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
    
    // 鑾峰彇娴忚鍣ㄤ俊鎭柟娉�
    dmt_js_sdk.getNavigator = function (){
        //娴忚鍣ㄧ殑姝ｅ紡鍚嶇О
        dmt_js_sdk.event_data["properties"]["navigator_appName"] = window.navigator.appName ? window.navigator.appName : '';
        //娴忚鍣ㄧ殑鐗堟湰鍙�
        dmt_js_sdk.event_data["properties"]["navigator_appVersion"] = window.navigator.appVersion ? window.navigator.appVersion : '';
        //鍥炵敤鎴锋祻瑙堝櫒鏄惁鍚敤浜哻ookie
        dmt_js_sdk.event_data["properties"]["navigator_cookieEnabled"] = window.navigator.cookieEnabled ? window.navigator.cookieEnabled : '';
        //杩斿洖鐢ㄦ埛璁＄畻鏈虹殑cpu鐨勫瀷鍙凤紝閫氬父intel鑺墖杩斿洖"x86"锛堢伀鐙愭病鏈夛級
        dmt_js_sdk.event_data["properties"]["navigator_cpuClass"] = window.navigator.cpuClass ? window.navigator.cpuClass : '';
        // 娴忚鍣ㄦ敮鎸佺殑鎵€鏈塎IME绫诲瀷鐨勬暟缁�
        dmt_js_sdk.event_data["properties"]["navigator_mimeType"] = window.navigator.mimeType ? window.navigator.mimeType : '';
        // 娴忚鍣ㄦ鍦ㄨ繍琛岀殑鎿嶄綔绯荤粺骞冲彴锛屽寘鎷琖in16(windows3.x)
        dmt_js_sdk.event_data["properties"]["navigator_platform"] = window.navigator.platform ? window.navigator.platform : '';
        // 瀹夎鍦ㄦ祻瑙堝櫒涓婄殑鎵€鏈夋彃浠剁殑鏁扮粍
        dmt_js_sdk.event_data["properties"]["navigator_plugins"] = window.navigator.plugins ? window.navigator.plugins : '';
        // 鐢ㄦ埛鍦ㄨ嚜宸辩殑鎿嶄綔绯荤粺涓婅缃殑璇█锛堢伀鐙愭病鏈夛級
        dmt_js_sdk.event_data["properties"]["navigator_userLanguage"] = window.navigator.userLanguage ? window.navigator.userLanguage : '';
        //鍖呭惈浠ヤ笅灞炴€т腑鎵€鏈夋垨涓€閮ㄥ垎鐨勫瓧绗︿覆锛歛ppCodeName,appName,appVersion,language,platform
        dmt_js_sdk.event_data["properties"]["navigator_userAgent"] = window.navigator.userAgent ? window.navigator.userAgent : '';
        // 鐢ㄦ埛鎿嶄綔绯荤粺鏀寔鐨勯粯璁よ瑷€锛堢伀鐙愭病鏈夛級
        dmt_js_sdk.event_data["properties"]["navigator_systemLanguage"] = window.navigator.systemLanguage ? window.navigator.systemLanguage : '';
        //涓庢祻瑙堝櫒鐩稿叧鐨勫唴閮ㄤ唬鐮佸悕
        dmt_js_sdk.event_data["properties"]["navigator_appCodeName"] = window.navigator.appCodeName ? window.navigator.appCodeName : '';
        //杈呯増鏈彿锛堥€氬父搴旂敤浜庢祻瑙堝櫒鐨勮ˉ涓佹垨鏈嶅姟鍖�)
        dmt_js_sdk.event_data["properties"]["navigator_appMinorVersion"] = window.navigator.appMinorVersion ? window.navigator.appMinorVersion : '';
        //娴忚鍣ㄦ敮鎸佺殑璇█ 锛圛E娌℃湁锛�
        dmt_js_sdk.event_data["properties"]["navigator_language"] = window.navigator.language ? window.navigator.language : '';
        //杩斿洖娴忚鍣ㄦ槸鍚﹀浜庡湪绾挎ā寮忥紙IE4浠ヤ笂鐗堟湰锛�
        dmt_js_sdk.event_data["properties"]["navigator_onLine"] = window.navigator.onLine ? window.navigator.onLine : '';
        //娴忚鍣ㄦ鍦ㄨ繍琛岀殑鎿嶄綔绯荤粺锛屽叾涓彲鑳芥湁CPU鐨勪俊鎭紙IE娌℃湁锛�
        dmt_js_sdk.event_data["properties"]["navigator_oscpu"] = window.navigator.oscpu ? window.navigator.oscpu : '';
        // 娴忚鍣ㄧ殑浜у搧鍚嶏紙IE娌℃湁锛�
        dmt_js_sdk.event_data["properties"]["navigator_product"] = window.navigator.product ? window.navigator.product : '';
        //鍏充簬娴忚鍣ㄦ洿澶氫俊鎭紙IE娌℃湁锛�
        dmt_js_sdk.event_data["properties"]["navigator_productSub"] = window.navigator.productSub ? window.navigator.productSub : '';
        // 娴忚鍣ㄦ敮鎸佺殑鍔犲瘑绫诲瀷锛圛E娌℃湁锛�
        dmt_js_sdk.event_data["properties"]["navigator_securityPolicy"] = window.navigator.securityPolicy ? window.navigator.securityPolicy : '';
        // 杩斿洖涓€涓猆serProfile瀵硅薄锛屽畠瀛樺偍鐢ㄦ埛鐨勪釜浜轰俊鎭紙鐏嫄娌℃湁锛�
        dmt_js_sdk.event_data["properties"]["navigator_userProfile"] = window.navigator.userProfile ? window.navigator.userProfile : '';
        // 娴忚鍣ㄥ巶鍟嗗悕绉帮紙IE銆佺伀鐙愭病鏈夛級
        dmt_js_sdk.event_data["properties"]["navigator_vender"] = window.navigator.vender ? window.navigator.vender : '';
        // 鍏充簬娴忚鍣ㄥ巶鍟嗘洿澶氱殑淇℃伅
        dmt_js_sdk.event_data["properties"]["navigator_vendorSub"] = window.navigator.vendorSub ? window.navigator.vendorSub : '';
        // 鑾峰彇referrer
        dmt_js_sdk.event_data["properties"]["navigator_referrer"] = window.document.referrer ? window.document.referrer : '';
    }
    
    // 鍒濆鍖�
    dmt_js_sdk.init = function(){
        // 鍒濆鍖栦簨浠舵暟鎹ā鏉�
        dmt_js_sdk.event_data = { "type":"event", "properties":{} };
        // 鍒濆鍖栫敤鎴锋暟鎹ā鏉�
        dmt_js_sdk.user_data = { "type":"user", "properties":{} };
    
        //鍒濆鍖栧尶鍚嶇敤鎴穒d
        dmt_js_sdk.initUuid();
    
        // 鐩戝惉椤甸潰鍔犺浇
        dmt_js_sdk.windowLoad();
    
        // 鐩戝惉鐐瑰嚮浜嬩欢
        dmt_js_sdk.clickListener();
    }
    
    }
    
    
    // jsdk鍒濆鍖�
    window.dmt_js_sdk.init();