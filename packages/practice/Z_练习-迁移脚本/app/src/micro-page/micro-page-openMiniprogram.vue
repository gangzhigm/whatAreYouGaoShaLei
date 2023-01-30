<template></template>
<script type="text/babel">
    import LINKS from '../LINKS';
    
    export default {
        created() {
            let xmlhttp;
            if (window.XMLHttpRequest) {
                //  IE7+, Firefox, Chrome, Opera, Safari 浏览器执行代码
                xmlhttp = new XMLHttpRequest();
            } else {
                // IE6, IE5 浏览器执行代码
                xmlhttp = new ActiveXObject('Microsoft.XMLHTTP');
            }
            // request
            xmlhttp.timeout = 0;
            xmlhttp.open('GET', LINKS.WECHAT_API_BASE + '/api/web-api/wechat/v1/getUrlLink?id=' + ~~this.$route.query.id, true);
            xmlhttp.responseType = 'json';
            xmlhttp.send();
            // response
            xmlhttp.onreadystatechange = function () {
                if (xmlhttp.readyState === 4 && xmlhttp.status === 200) {
                    let response = '';
                    // IE Object响应结果为string类型
                    typeof xmlhttp.response === 'string' ? response = JSON.parse(xmlhttp.response) : response = xmlhttp.response;
                    location.href = response.data.urlLink;
                }
            };
        },
    };
</script>
