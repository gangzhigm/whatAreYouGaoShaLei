<template>
    <modal :title="$t('board.tips')" v-if="kudu" @close="kuduOk">
        <div class="form-field">
            <div v-if="kuduStatus === 0">{{$t('board.unopen')}}</div>
            <div v-if="kuduStatus === 2">{{$t('board.processing')}}</div>
        </div>
        <button slot="buttons" class="btn btn-md btn-theme green right" @click="kuduOk">{{$t('board.know')}}</button>
    </modal>
</template>

<script>
import { ServiceApiV2 } from '@/api';
import { mapState } from 'vuex';
export default {
    data () {
        return {
            kuduStatus: '', //kudu数据库状态
            kudu: false,
        };
    },
    created () {
        this.kuduService();
    },
    computed: {
        ...mapState(['user'])
    },
    methods: {
        // kudu数据库状态
        kuduService () {
            ServiceApiV2
                .checkKuduStatus(this.user.cid)
                .then((res) => {
                    this.kuduStatus = res.body.data.status;
                    this.$emit('kuduStau', res.body.data.status);
                    if (res.body.data.status === 0 || res.body.data.status === 2) {
                        this.kudu = true;
                    }
                })
                .catch(() => {
                    this.$loaded();
                    this.$emit('kuduStau', 0);
                });
        },
        // 关闭kudu弹窗
        kuduOk () {
            this.kudu = false;
            this.$router.go(-1);
        }
    }
};
</script>