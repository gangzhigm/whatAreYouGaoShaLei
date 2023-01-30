 <template>
    <!-- 短信控件modal -->
    <!-- 表单 -->
    <mms-controller-form v-if="writable || isChecking"
                         :controller="controller"
                         :signature-list="signatureList"
                         @close="close"/>
    <!-- 查看详情 -->
    <mms-controller-view v-else
                         :controller="controller"
                         :signature-list="signatureList"
                         @close="close"/>
</template>

<script>
    import { SmsServiceApiV1, GeteOriginApi } from '@/api';
    import {getModalName, MMS_CONTROLLER} from '../../CONTROLLER_TYPES';
    import {DRAGGABLE_JOURNEY_STORE_NAME} from '@/store/vuex/modules/canvasStore';
    import {SET_ACTIVE_CONTROLLER} from '@/store/vuex/mutationTypes';
    import MmsControllerForm from './mms-controller-form.vue';
    import MmsControllerView from './mms-controller-view.vue';
    import { mapMutations, mapState } from 'vuex';
    
    export default {
        name: getModalName(MMS_CONTROLLER),
        components: {MmsControllerView, MmsControllerForm},
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
                roleId : state => state.user.roleId
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
            // 短信签名列表
            if (this.roleId === 0 || this.roleId === '') {
                SmsServiceApiV1
                    .getSendOutList()
                    .then(({body: {data: {sendouts}}}) => {
                        this.signatureList = sendouts
                            .map(({sendoutId: id, sendoutName: name, type}) => ({id, name, type}))
                            .filter( item => (item.type === 1));
                    });
            } else {
                GeteOriginApi
                    .getAllSendChannel({
                        departmentId: this.departmentId,
                        searchType: 2,
                    })
                    .then(({body: {data: {sendChannel}}}) => {
                        this.signatureList = sendChannel
                            .map(({sendType: type, sendAddress: name, sendoutId: id, message}) => ({
                                name,
                                type,
                                id,
                                message
                            }))
                            .filter(item => (item.type === 2));
                    });
            }
        },
        methods: {
            ...mapMutations([
                SET_ACTIVE_CONTROLLER
            ]),
            close() {
                this.SET_ACTIVE_CONTROLLER('');
            }
        }
    };
</script>

