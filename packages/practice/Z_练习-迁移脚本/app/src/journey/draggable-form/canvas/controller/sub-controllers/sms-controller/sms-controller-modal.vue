<template>
    <!-- 短信控件modal -->
    <!-- 表单 -->
    <sms-controller-form v-if="writable || isChecking"
                         :controller="controller"
                         :signature-list="signatureList"
                         @close="close"/>
    <!-- 查看详情 -->
    <sms-controller-view v-else
                         :controller="controller"
                         :signature-list="signatureList"
                         @close="close"/>
</template>

<script>
    import { SmsServiceApiV1, GeteOriginApi } from '@/api';
    import {getModalName, SMS_CONTROLLER} from '../../CONTROLLER_TYPES';
    import {DRAGGABLE_JOURNEY_STORE_NAME} from '@/store/vuex/modules/canvasStore';
    import {SET_ACTIVE_CONTROLLER} from '@/store/vuex/mutationTypes';
    import SmsControllerForm from './sms-controller-form.vue';
    import SmsControllerView from './sms-controller-view.vue';
    import { mapMutations, mapState } from 'vuex';

    export default {
        name: getModalName(SMS_CONTROLLER),
        components: {SmsControllerView, SmsControllerForm},
        data() {
            return {
                signatureList: [],
                departmentId: '', // 部门ID
                searchType: '', // 0 邮件 1短信 2彩信
            };
        },
        computed: {
            ...mapState({
                controllers: state => state[DRAGGABLE_JOURNEY_STORE_NAME].canvasInformation.controllers,
                activeControllerId: state => state[DRAGGABLE_JOURNEY_STORE_NAME].activeControllerId,
                readonlyIds: state => state[DRAGGABLE_JOURNEY_STORE_NAME].readonlyControllerIds,
                isChecking: state => state[DRAGGABLE_JOURNEY_STORE_NAME].isChecking,
                roleId: state => state.user.roleId
            }),
            controller() {
                return this.controllers[this.activeControllerId];
            },
            writable() {
                // 旅程可编辑，且控件ID不在 readonlyIds 中
                return this.$store.getters.journeyWritable && !this.readonlyIds.includes(this.controller.id);
            }
        },
        created() {
            if (this.roleId === 0 || this.roleId === '') {
                // 短信签名列表
                SmsServiceApiV1
                    .getSendOutList()
                    .then(({body: {data: {sendouts}}}) => {
                        this.signatureList = sendouts
                            .map(({sendoutId: id, sendoutName: name, type, message}) => ({id, name, type, message}))
                            .filter(item => (item.type !== 1));
                    });
            } else {
                GeteOriginApi
                    .getAllSendChannel({
                        departmentId: this.departmentId,
                        searchType: 1,
                    })
                    .then(({body: {data: {sendChannel}}}) => {
                        this.signatureList = sendChannel
                            .map(({sendoutId: id, sendAddress: name,  message:message}) => ({id, name, message}));
                    });
            }
        },
        methods: {
            ...mapMutations([SET_ACTIVE_CONTROLLER]),
            close() {
                this.SET_ACTIVE_CONTROLLER('');
            }
        }
    };
</script>

