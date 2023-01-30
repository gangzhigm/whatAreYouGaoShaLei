/**
 * Created by naeemo on 2016/12/1.
 */

import mapArray from './function/mapArray';

import Title from './directives/title';
import Blur from './directives/blur';
import ClickIntoView from './directives/click-into-view';
import ScrollLoad from './directives/scroll-load';
import Autofocus from './directives/autofocus';

import BackDrop from '../components/modal/backdrop.vue';
import Toast from '../components/toast.vue';
import Modal from '../components/modal/modal.vue';
import Confirm from '../components/modal/confirm.vue';
import InlineConfirm from '../components/inline-confirm.vue';
import MaterialPreviewModal from '../../journey/material/preview-modal.vue';
import MaterialTestModal from '../../journey/material/material-test-modal.vue';
import MaterialViewLabelModal from '../../journey/material/common/material-view-label-modal.vue';
import Crumbs from '../components/crumbs.vue';
import Selector from '../components/selector.vue';
import MultiSelect from '../components/multi-select.vue';
import Pager from '../components/pages.vue';
import Checkbox from '../components/checkbox.vue';
import ColorPicker from '../components/color-picker.vue';
import Radio from '../components/radio.vue';
import Switch from '../components/switch-button.vue';
import Loading from '../components/loading.vue';
import InlineLoading from '../components/inline-loading.vue';
import InlineSpin from '../components/inline-spin.vue';
import Calendar from '../components/date-time/calendar.vue';
import DateRange from '../components/date-range/date-range.vue';
import BackTop from '../components/back-top.vue';
import Draggable from 'vuedraggable';
import NumberInput from '../components/number-input/number-input.vue';
import BlockEmpty from '../components/placeholder/block-empty.vue';
import ListSearchEmpty from '../components/placeholder/list-search-empty.vue';
import ListEmpty from '../components/placeholder/list-empty.vue';
import { LOADED, LOADING } from '@/store/vuex/mutationTypes';
import CountFormat from './filters/countFormatFilter';
import CutSecondsTail from './filters/cutSecondsTail';
import thousandSeparateFilter from './filters/thousandSeparateFilter';

import treeMenu from '../components/group-tree/tree-menu.vue';
import leftSidebar from '../components/group-tree/left-sidebar.vue';
import search from '../components/group-tree/search.vue';
import searchTree from '../components/group-tree/search-tree.vue';
import shuttleBox from '../components/shuttle-box.vue';
import vueTimer from '../components/timer.vue';
import editSenderModal from '../components/edit-sender-modal.vue';
import rootStore from '@/store/vuex/rootStore';
import downloadDetailModal from '../components/download-detail-modal.vue';
import PublicAccount from '../components/public-account.vue';
import WavePending from '../components/wave-pending.vue';
import ChooseAllAction from '../components/choose-all-action.vue';
import SlideDrawer from '../components/slide-drawer.vue';

import createMiniProgram from '@/wechat/material/imageTextForm/miniprogram-card';
import HourMinuteSelect from '../components/hour-minute-select.vue';
import DateTime from '../components/date-time.vue';
import Alert from '../components/alert.vue';
import Swiper from '../components/swiper.vue';
import FilterDrop from '../components/table-compts/filter-drop.vue';
import BatchOperation from '../components/table-compts/batch-operation.vue';
import HiddenMenuTrigger from '../components/table-compts/hidden-menu-trigger.vue';

export default {
    install (Vue) {

        /**
         * inits other than vue
         */
        mapArray();

        //创建自定义小程序卡片标签
        createMiniProgram();

        /**
         * 自定义指令
         */
        Vue.directive('title', Title);
        Vue.directive('blur', Blur);
        Vue.directive('click-into-view', ClickIntoView);
        Vue.directive('load', ScrollLoad);
        Vue.directive('autofocus', Autofocus);


        /**
         * filters
         */
        Vue.filter('count', CountFormat);
        Vue.filter('cutSeconds', CutSecondsTail);
        Vue.filter('thousandSeparate', thousandSeparateFilter);

        /**
         * confirm 确认框
         * @type {Function}
         * @param {boolean} showBtn = true 是否显示button，用于显示提示型弹窗
         * @param {boolean} size 'md' 'lg' 弹窗宽度
         */
        let confirms = [];
        Vue.prototype.$confirm = function (title, contentHtml, confirmText = '', cancelText = '', readonly = false, showBtn = true, size = 'md') {
            return new Promise(function (resolve) {
                const newConfirm = new Vue({
                    /*eslint no-unused-vars: 0*/
                    render: function (h) {
                        return (
                            /*eslint-disable*/
                            <confirm determine={confirmText} recall={cancelText} title={title} readonly={readonly}
                                show-btn={showBtn} size={size} onCancel={this.cancel} onConfirm={this.sure}>
                                <div> {contentHtml} </div>
                            </confirm>
                        );
                    },
                    methods: {
                        cancel () {
                            resolve(false);
                            this.close();
                        },
                        sure () {
                            resolve(true);
                            this.close();
                        },
                        close () {
                            document.body.removeChild(newConfirm.$el);
                            newConfirm.$destroy();
                            confirms.pop();
                        }
                    }
                }).$mount();
                // 点击浏览器返回键dom插入失败（点击后退键未成功唤起）
                setTimeout((callback) => {
                    confirms.push(newConfirm);
                    document.body.appendChild(newConfirm.$el);
                }, 0)
            });
        };


        /**
         * tip提醒, 3秒消失, 同一时间只能显示一个tip
         * success, correct: icon-correct
         * warn, error: icon-warn
         * processing: icon-processing spinning circle
         * info: icon-happy-face
         * @param message
         * @param {string} type
         */
        let toast = null;
        Vue.prototype.$toast = function (message, type = 'info') {

            if (toast === null) {
                toast = new Vue(Toast).$mount();
                document.body.appendChild(toast.$el);
            } else {
                document.body.removeChild(toast.$el);
                document.body.appendChild(toast.$el);
            }

            toast.message = message;
            toast.type = type;
            toast.show();
            toast.reset();

            if (type === 'processing')
                return toast;

        };


        /**
         * 进入加载中状态
         */
        Vue.prototype.$loading = function () {
            this.$store.commit(LOADING);
        };


        /**
         * 退出加载中状态
         */
        Vue.prototype.$loaded = function () {
            this.$store.commit(LOADED);
        };


        let previewer = null;
        /**
         * 预览 Journey 素材的方法
         * @param {Object} material
         * @param {Boolean} toolbar
         * @param {String} signature
         * @param {Boolean} validCdp 华为cdp标签非空校验：华为账号，必选标签为空不能预览
         * @param {Array} labelList  华为cdp标签列表
         * @param {Boolean} snapShot 是否快照模式，用于显示微信图文副本
         */
        Vue.prototype.$preview = function ({
            material,
            toolbar = true,
            signature,
            validCdp = true,
            labelList = [],
            snapShot = false
        }) {
            // MaterialPreviewModal
            if (previewer === null) {
                previewer = new Vue(MaterialPreviewModal);
                previewer.material = material;
                previewer.toolbar = toolbar;
                previewer.signature = signature;
                previewer.labelList = labelList;
                previewer.visible = validCdp;
                previewer.snapShot = snapShot;

                previewer.$mount();
                document.body.appendChild(previewer.$el);
            } else {
                document.body.removeChild(previewer.$el);
                document.body.appendChild(previewer.$el);
                previewer.material = material;
                previewer.toolbar = toolbar;
                previewer.signature = signature;
                previewer.labelList = labelList;
                previewer.visible = validCdp;
                previewer.snapShot = snapShot;
            }
        };


        let tester = null;
        /**
         * 测试 Journey 素材的方法
         * @param material          素材
         * @param subject           主题
         */
        Vue.prototype.$test = function (material, subject = '') {
            if (tester) document.body.removeChild(tester.$el);

            tester = new Vue(MaterialTestModal);
            tester.material = material;
            tester.sendMailSubject = subject;
            tester.visible = true;
            tester.$mount();
            document.body.appendChild(tester.$el);
        };

        let viewLabeler = null;
        /**
         * 查看素材标签
         * @param {Object} material 素材
         * @param {Array} labelList 新增素材-未保存时选择的标签列表
         */
        Vue.prototype.$viewLabel = function ({ material, labelList }) {
            if (viewLabeler === null) {
                viewLabeler = new Vue(MaterialViewLabelModal);
                viewLabeler.material = material;
                viewLabeler.labelList = labelList;
                viewLabeler.visible = true;
                viewLabeler.$mount();
                document.body.appendChild(viewLabeler.$el);
            } else {
                document.body.removeChild(viewLabeler.$el);
                document.body.appendChild(viewLabeler.$el);
                viewLabeler.material = material;
                viewLabeler.labelList = labelList;
                viewLabeler.visible = true;
            }
        };


        /**
         * 全局按钮权限控制
         * @param flag         唯一标识
         * @returns {boolean}  true：无权限（原因：设置标签的 disabled）
         */
        Vue.prototype.$has = function (flag) {
            let user = rootStore.state.user;
            // 权限
            let authList = user.permissions;
            let auth = authList[flag];

            // 主账号
            if (user.roleId === 0 || user.roleId === '') {
                /**
                 * 判断权限
                 * 发送给华为线索管理 dmartech_huawei_thread
                 * nike分批次发送 datacentre_marketing_export_nike
                 * 天合光能 enterprise_update_accountInfo
                 * nike邮件报告 datacentre_emailReportNike
                 */
                if ((flag === 'dmartech_huawei_thread' || flag === 'datacentre_marketing_export_nike'
                    || flag === 'enterprise_update_accountInfo' || flag === 'datacentre_emailReportNike') && !auth) {
                    return true;
                }
            }
            // 子账号
            else {
                // 无权限：无唯一标识；有唯一标识但showType=0,或 null
                if (!auth || (auth && !auth.showType)) {
                    //$has('')传空字符串默认有权限
                    if (flag === '') {
                        return false;
                    }
                    return true;
                }
            }
        };


        // 页面跳转时关闭已有的弹窗
        window.onpopstate = function () {
            if (confirms.length) for (let i = confirms.length - 1; i >= 0; i--) {
                confirms[i].cancel();
            }
            if (previewer) previewer.close();
            if (tester) tester.close();
        };

        /**
         * 全局组件
         */
        Vue.component(BackDrop.name, BackDrop);
        Vue.component(Selector.name, Selector);
        Vue.component(MultiSelect.name, MultiSelect);
        Vue.component(Pager.name, Pager);
        Vue.component(Checkbox.name, Checkbox);
        Vue.component(ColorPicker.name, ColorPicker);
        Vue.component(Radio.name, Radio);
        Vue.component(Switch.name, Switch);
        Vue.component(Loading.name, Loading);
        Vue.component(InlineLoading.name, InlineLoading);
        Vue.component(InlineSpin.name, InlineSpin);
        Vue.component(Modal.name, Modal);
        Vue.component(Confirm.name, Confirm);
        Vue.component(InlineConfirm.name, InlineConfirm);
        Vue.component(Crumbs.name, Crumbs);
        Vue.component(Calendar.name, Calendar);
        Vue.component(DateRange.name, DateRange);
        Vue.component(BackTop.name, BackTop);
        Vue.component(Draggable.name, Draggable);
        Vue.component(NumberInput.name, NumberInput);
        Vue.component(BlockEmpty.name, BlockEmpty);
        Vue.component(ListSearchEmpty.name, ListSearchEmpty);
        Vue.component(ListEmpty.name, ListEmpty);
        Vue.component(treeMenu.name, treeMenu);
        Vue.component(leftSidebar.name, leftSidebar);
        Vue.component(search.name, search);
        Vue.component(searchTree.name, searchTree);
        Vue.component(shuttleBox.name, shuttleBox);
        Vue.component(vueTimer.name, vueTimer);
        Vue.component(editSenderModal.name, editSenderModal);
        Vue.component(downloadDetailModal.name, downloadDetailModal);
        Vue.component(PublicAccount.name, PublicAccount);
        Vue.component(WavePending.name, WavePending);
        Vue.component(ChooseAllAction.name, ChooseAllAction);
        Vue.component(DateTime.name, DateTime);
        Vue.component(HourMinuteSelect.name, HourMinuteSelect);
        Vue.component(Alert.name, Alert);
        Vue.component(SlideDrawer.name, SlideDrawer);
        Vue.component(Swiper.name, Swiper);
        Vue.component(FilterDrop.name, FilterDrop);
        Vue.component(BatchOperation.name, BatchOperation);
        Vue.component(HiddenMenuTrigger.name, HiddenMenuTrigger);
    }
};
