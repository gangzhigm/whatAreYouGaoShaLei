<template>
    <!-- 下载二维码弹窗 -->
    <modal :title="$t('QRCode.codeDownload')" @close="$emit('close')">
        <div class='simplify-table auto-width'>
            <table>
                <thead>
                <tr>
                    <td>{{'QRCode.dimension' | t}}</td>
                    <td>{{'QRCode.scene' | t}}</td>
                    <td>{{'QRCode.distance' | t}}</td>
                    <td>{{'QRCode.download' | t}}</td>
                </tr>
                </thead>
                <tbody>
                <tr>
                    <td>{{'QRCode.small' | t}}</td>
                    <td>{{'QRCode.SScene' | t}}</td>
                    <td>{{'QRCode.SDistance' | t}}</td>
                    <td>
                        <span class="action-icon icon icon-download download-btn"
                           v-title="$t('QRCode.codeDownload')"
                           @click="downLoadHandle(300)">
                        </span>
                    </td>
                </tr>
                <tr>
                    <td>{{'QRCode.middle' | t}}</td>
                    <td>{{'QRCode.MScene' | t}}</td>
                    <td>{{'QRCode.MDistance' | t}}</td>
                    <td>
                        <span class="action-icon icon icon-download download-btn"
                           v-title="$t('QRCode.codeDownload')"
                           @click="downLoadHandle(500)">
                        </span>
                    </td>
                </tr>
                <tr>
                    <td>{{'QRCode.large' | t}}</td>
                    <td>{{'QRCode.LScene' | t}}</td>
                    <td>{{'QRCode.LDistance' | t}}</td>
                    <td>
                        <span class="action-icon icon icon-download download-btn"
                           v-title="$t('QRCode.codeDownload')"
                           @click="downLoadHandle(1500)">
                        </span>
                    </td>
                </tr>

                </tbody>
            </table>
        </div>

        <template v-slot:buttons>
            <input type="button" class="btn btn-md btn-white" :value="$t('common.close')"
                   @click="$emit('close')"/>
        </template>
    </modal>
</template>
<script>
    import { WechatApiV1 } from '@/api';

    export default {
        name: 'qr-code-download-modal',
        props: {
            ids: {
                type: Array,
                required: true
            },
            qrcodename: {
                type: String,
            }
        },
        computed: {
            // 下载类型 1 单个，2 批量
            downloadType() {
                return this.ids.length > 1 ? 2 : 1;
            }
        },
        methods: {
            downLoadHandle(size) {
                WechatApiV1
                    .batchDownloadQRCode({
                        quickMarkIds: this.ids,
                        width: size,
                        height: size,
                        downloadType: this.downloadType
                    })
                    .then(({body}) => {
                        const blob = new Blob([body]);
                        const name = this.downloadType === 1 ? (new Date().getTime() + `_${this.qrcodename}.png`) : (new Date().getTime() + '_二维码.zip');
                        const blobURL = URL.createObjectURL(blob);
                        const a = document.createElement('a');
                        a.download = name;
                        a.href = blobURL;

                        try {
                            const EV = new MouseEvent('click');
                            a.dispatchEvent(EV);
                        } catch (e) {
                            // 兼容IE(非 6,7,8)
                            let event = document.createEvent('MouseEvents');
                            event.initMouseEvent('click', true, true, window, 0, 0, 0, 0, 0, false, false, false, false, 0, null);
                            a.dispatchEvent(event);
                        }
                        URL.revokeObjectURL(blobURL);
                        this.$toast(this.$t('channelCode.downloadSucc'), 'success');
                    });
            }
        }
    };
</script>
