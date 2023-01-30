<template>
  <div class="open-platform">
    <div calss="page-content">
      <div class="api-table">
        <div class="api-tablebar">
          <div
            @click="tabSwitch(1)"
            :class="tab == 1 ? 'tablebar-item active' : 'tablebar-item'"
          >
            <span class="tablebar-text">{{ "openPlat.api" | t }}</span>
          </div>
          <div
            @click="tabSwitch(2)"
            :class="tab == 2 ? 'tablebar-item active' : 'tablebar-item'"
          >
            <span class="tablebar-text">{{ "openPlat.field" | t }}</span>
          </div>
        </div>
        <div v-if="tab === 1">
          <open-api />
        </div>
        <div v-if="tab === 2">
          <desen-field />
        </div>
      </div>
    </div>
  </div>
</template>
<script type="text/babel">
import openApi from './api.vue';
import desenField from './field.vue';
export default {
    components: { openApi, desenField },
    name: 'open-platform',
    data() {
        return {
            tab: 1,
        };
    },
    computed: {
        user() {
            return this.$store.state.user;
        },
        // 华为类型账号
        isHw() {
            return this.user.companyType === 1;
        }
    },
    mounted() {
        //华为埋码-CPM同意与偏好管理-数据隐私管理
        if (this.isHw) {
            //UEM埋码
            window.hwa('trackPageView', 'P12031996CB96EA');
        }
    },
    methods: {
        tabSwitch(data) {
            this.tab = data;
        },
    },
};
</script>
<style lang="scss" type="text/scss" rel="stylesheet/scss">
@import "../../common/scss/base/variables";
@import "../../common/scss/base/mixin";
.open-platform {
  .api-table {
    width: 100%;
    float: left;
    @include box-sizing();
    height: calc(
      100vh - #{$header-height + $toolbar-height + 24px * 2 + $tab-nav-height}
    );
    overflow-y: scroll;
    .api-tablebar {
      font-size: 16px;
      padding: 16px 0;
      word-break: break-all;
      display: flex;
      flex-direction: row;
      justify-content: center;
      background-color: white;
      .tablebar-item {
        border-bottom: 2px solid transparent;
        padding: 0 0 13px;
        margin: 0 10px;
        .tablebar-text {
          cursor: pointer;
          &:hover {
            color: #0cc2a9;
          }
        }
      }
      .active {
        color: #0cc2a9;
        border-bottom: 2px solid #0cc2a9;
      }
    }
  }
}
</style>
