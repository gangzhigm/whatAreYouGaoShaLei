<template>
  <div class="notification">
    <p v-text="notificationStatus == true ? '此浏览器是否支持此功能：支持' : '此浏览器是否支持此功能：不支持'"></p>
    <p v-if="permission == 0" v-text="`目前状态：默认值，用户还未选择`"></p>
    <p v-if="permission == 1" v-text="`目前状态：用户允许该网站发送通知`"></p>
    <p v-if="permission == 2" v-text="`目前状态：用户拒绝该网站发送通知`"></p>
    <div class="hrline"></div>
    <div class="option">
      <button class="button" v-if="permission == 0" @click="getPermission">获取授权</button>

      <button class="button" v-if="permission == 1" @click="sendNotification(0)">发送空通知</button>
      <button class="button" v-if="permission == 1" @click="sendNotification(1)">发送文字通知</button>
      <button class="button" v-if="permission == 1" @click="sendNotification(2)">发送同 tag 通知</button>
      <button class="button" v-if="permission == 1" @click="sendNotification(3)">发送 icon 通知</button>
      <button class="button" v-if="permission == 1" @click="sendNotification(4)">发送 data 通知</button>
      <button class="button" v-if="permission == 1" @click="sendNotification(5)">发送 renotify 通知</button>
      <button class="button" v-if="permission == 1" @click="sendNotification(6)">发送 requireInteraction 通知</button>
      <hr/>
      <button class="button" v-if="notificationDisplay == true" @click="closeNotification">关闭通知</button>
    </div>
    
  </div>
</template>

<script>
// @ is an alias to /src

export default {
  name: 'notification',
  data(){
    return{
      notification: false,
      notificationDisplay: false,
      notificationStatus: false,
      permission : 0,
      icon_Img: require('../assets/logo.png'),
    }
  },
  created(){
    this.notificationStatus = window.Notification ? true : false;
    this.getPermissionStatus();
  },
  methods:{
    closeNotification(){
      this.notification.close()
    },
    notificationControl(){
      this.notification.onclick = e => {
        console.log(`点击操作唤醒`, e);
      }
      this.notification.onshow = e => {
        console.log(`显示操作唤醒`, e);
        this.notificationDisplay = true;
      }
      this.notification.onerror = e => {
        console.log(`错误操作唤醒`, e);
        this.notificationDisplay = false;
      }
      this.notification.onclose = e => {
        console.log(`关闭操作唤醒`, e);
        this.notificationDisplay = false;
      }
    },
    getPermissionStatus(){
      switch(Notification.permission){
        case 'default':
          this.permission = 0;
          break;
        case 'granted':
          this.permission = 1;
          break;
        case 'denied':
          this.permission = 2;
          break;
        default :
          this.permission = 0;
          break;
      }
    },
    getPermission(){
      Notification.requestPermission().then( () => {
        this.getPermissionStatus();
      })
    },
    sendNotification(type){
      let options = {};
      let title = '';
      switch(type){
        case 0:
          options = {}; // 传空配置
          title = '这里是标题';
          break;
        case 1:
          options = {
            body:'这里是内容',
          };
          title = '这里是标题';
          break;
        case 2:
          options = {
            tag: '1' // 相同tag时只会打开一个通知窗口。
          };
          title = '这里是 tag 标题';
          break;
        case 3:
          options = {
            icon: this.icon_Img
          };
          title = '这里是 icon 标题';
          break;
        case 4:
          options = {
            data: {
              a:1,
              b:2,
              c:3,
            }
          };
          title = '这里是 data 标题';
          break;
        case 5:
          options = {
            tag: 2,
            renotify: true, // 相同tag，新通知出现的时候是否替换之前的(开启此项，tag必须设置)。
            body: Math.random(100),
          };
          title = '这里是 renotify 标题';
          break;
        case 6:
          options = {
            requireInteraction: true //布尔值。通知不自动关闭，默认为false(自动关闭)。
          };
          title = '这里是 requireInteraction 标题';
          break;
        default:
          alert('请求状态错误');
          break;
      }
      this.notification = new Notification(title, options) // 显示通知
      this.notificationControl();
      switch(type){
        case 4:
          console.log(this.notification)
          break;
      }
    }
  }
}
</script>
<style lang='scss' scoped>
  .option{
    height: 200px;
    display: flex;
    flex-direction:column;
    justify-content: space-between;
    align-items: center;
  }
  .option>button{
    flex-grow: 0;
    flex-shrink: 0;
    width: 80%;
    background: #fff;
    border: 0;


    box-shadow: 0 0 10px -4px #000;
    border-radius: 15px;
    margin-bottom: 10px;
    padding: 10px;
    cursor: pointer;
    transition: all .4s;
    &:hover{
        background: rgba(20, 20, 20, 0.8);
        color: white;
        text-shadow: 0 0 0.2em #fff, 0 0 0.2em #fff;
    }
  }

  .hrline{
    position: relative;
    border: 1px dashed #000;
    margin: 10px 0;
  }
</style>
