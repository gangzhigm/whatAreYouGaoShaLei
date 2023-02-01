<!--
 * @Author: gangzhigm 864853934@qq.com
 * @Date: 2023-02-01 18:18:46
 * @LastEditors: gangzhigm 864853934@qq.com
 * @LastEditTime: 2023-02-01 18:27:24
 * @FilePath: \whatAreYouGaoShaLei\packages\psnDB\front\src\components\HelloWorld.vue
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
-->
<script setup lang="ts">
import { ref } from 'vue'

defineProps<{ msg: string }>()

const count = ref(0)
</script>

<template>
  <div>
    <input placeholder="cookie" type="text">
    <button>获取用户信息</button>
    <button>获取用户游戏列表</button>
    <input placeholder="游戏ID" type="text">
    <button>获取游戏详细内容</button>
  </div>
</template>

<style scoped>
.read-the-docs {
  color: #888;
}
</style>
