<template>
    <div class="nike-text-email-form material-form">
        <div class="content-view">
            <crumbs :crumbs="crumbs"></crumbs>
        </div>
        <div class="page-head">
            <div class="content-view">
                <button type="button" class="pull-right preview-btn btn btn-md btn-orange" @click="preview">
                    <svg aria-hidden="true">
                        <use xlink:href="#icon-search"></use>
                    </svg>
                    {{'material.preview' | t}}
                </button>
                <label for="name">{{'material.contactName' | t}}</label>
                &nbsp;
                <input type="text" id="name" class="input xl" v-model.trim="material.materialName" maxlength="100">
                <span v-if="!pasteComplete">{{'material.note' + 'material.note2' | t}}</span>
            </div>
        </div>
        <!-- 粘贴代码部分 -->
        <div class="page-content" v-if="!pasteComplete">
            <div class="content-view editor-area">
                <inline-loading v-if="!editor"/>
                <textarea class="edit-content" v-if="editor" name="emailEditor"
                          id="emailEditor"  v-model="material.materialContent"></textarea>
            </div>
        </div>
        <!-- 添加cpcode部分 -->
        <div class="add-cpcode-content">
            <!-- 素材展示 -->
            <div class="material-show" ref="material" @click.stop="getNode"></div>
            <!-- 左侧添加cpcode部分 -->
            <div class="operation-area">
                <!--title-->
                <div class="operation-header">{{'material.block' | t}}</div>
                <p v-show="!activeBlock" class="area-notice">{{'material.selectArea' | t}}</p>
                <div v-show="activeBlock">
                    <div class="property-name">{{'material.individuationBlock' | t}}</div>
                    <!-- 第一栏 标记为个性化区块-->
                    <div class="property propertyOne">
                        <div class="checkTop">
                            <div class="check-icon" :class="{checked: check}" @click="checkBlock"></div>
                            <div>{{'material.checkName' | t}}</div>
                        </div>
                        <!-- <input type="hidden" /> -->
                        <!--区域块名称-->
                        <div v-show="check" class="inp">
                            <span class="inpName">{{$t('material.inpName')}}</span>
                            <input type="text" @input="inputBlockName" v-model="textName" class="input lg inpText"/>
                        </div>
                    </div>
                    <!-- 第二栏 选择cpcode-->
                    <div v-show="check" class="property-name propertyTwo" @click="inputBlockName">
                        <div class="cpcode" ref="box">
                            <div class="list-content">
                                <div class="cpcode-list">
                                    <div v-for="item in itemList" :key="item.id" class="cpcode-item" :title="item.name">
                                        <span class="cpcode-item-name">{{item.name}}</span>
                                        <span @click="delLabel(item)" class="cpcode-item-close">X</span>
                                    </div>
                                </div>
                                <div @click="mainShow()" class="check-cpcode">
                                    <svg aria-hidden="true">
                                        <use xlink:href="#icon-plus"></use>
                                    </svg>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        <!-- footer部分 -->
        <div class="form-panel">
            <template v-if="!material.id"> {{'material.selectEmail' | t}}{{'material.setup' | t}}&nbsp;&gt;&nbsp;
                <span class="step">{{'material.design' | t}}</span></template>
            <input type="button" class="cancel-btn" :value="$t('common.cancel')" @click="cancel" v-if="!pasteComplete">
            <!-- 编辑源码 -->
            <input type="button" class="cancel-btn btn" :value="$t('material.editCode')" @click="backToEditCode"
                   v-if="pasteComplete">
            <!-- 下一步 -->
            <input type="button" class="confirm-btn btn btn-orange" :value="$t('material.next')" :disabled="disabled"
                   @click="confirm" v-if="!pasteComplete">
            <!-- 上一步 -->
            <input type="button" class="confirm-btn btn" :value="$t('material.previous')" @click="previousStep"
                   v-if="!pasteComplete">
            <!-- 保存 -->
            <input type="button" class="confirm-btn btn btn-orange" :value="$t('material.saveMaterial')" :disabled="flag" @click="saveMaterial(1)"
                   v-if="pasteComplete">
            <!-- 保存并退出 -->
            <input type="button" class="confirm-btn btn btn-orange" :value="$t('material.saveExit')" @click="saveMaterial(2)"
                   v-if="pasteComplete">
        </div>
        <!-- 选择添加cocode弹窗 -->
        <confirm :title="$t('material.addCPcode')" v-if="chooseCPcode" size="lg"  @cancel="closeCPcode" @confirm="confirmChoose">
            <div class="chooseCPcode-content"  v-if="!modalLoading">
                <div class="cpcode-header">
                    <div class="CPcode">
                        <div class="CPcodeList">
                            <div v-for="(item, index) in searchList" :key="index" class="CPcodeItem" :title="item.name">
                                <span class="CPcode-name">{{item.name}}</span>
                                <span class="CPcode-close" @click="delSearchLabel(item)">X</span>
                            </div>
                        </div>
                        <div class="add" v-if="!searchInput" @click="search">
                            <svg aria-hidden="true">
                                <use xlink:href="#icon-plus"></use>
                            </svg>
                        </div>
                        <div class="del" v-if="searchInput" @click="cancelSearch">
                            <svg aria-hidden="true">
                                <use xlink:href="#icon-jianshao"></use>
                            </svg>
                        </div>
                    </div>
                    <div class="search">
                        <div class="cpcode-search" v-if="searchInput">
                            <i class="icon-search icon" @click="searchInfo = true"></i>
                            <input type="text"
                                v-model.trim="keyword"
                                :placeholder="$t('material.cpcodeFilter')"
                                maxlength="60"
                                class='search-value'
                                @input="search"
                            >
                        </div>
                        <ul class="search-list" v-if="searchInput">
                            <li class="search-item" v-for="(item, index) in allCpcodeList" :key="index" @click="chooseSearchLabel(item)" :title="item.name">{{item.name}}</li>
                        </ul>
                    </div>
                </div>
                <!-- 按分组选择、按区块选择tab切换 -->
                <div class="selective-type">
                    <div class="by-group" :class="activeTab == 0 ? 'active' : '' " @click="activeTab = 0">{{'material.byGroup' | t}}</div>
                    <div class="by-block" :class="activeTab == 1 ? 'active' : '' " @click="activeTab = 1">{{'material.byBlock' | t}}</div>
                </div>
                <!-- 按分组选择、按区块选择下面的树状标签选择组件 -->
                <tree-menu v-if="activeTab === 0" :options="labelGroups" v-model="labels"></tree-menu>
                <tree-menu v-if="activeTab === 1" :options="blocksInfo" v-model="labels"></tree-menu>
            </div>
            <inline-loading v-if="modalLoading"/>
        </confirm>
    </div>
</template>

<script>
import { ContactApiV1, JourneyMaterialApiV1, EmailHeadFootV1} from '@/api';
import treeMenu from '../../../data/report/journey/components/cpcodeTree.vue';
import {COMMON_NAME_REGEXP} from '../../../common/utils/regs';
import debounce from 'lodash/debounce';

export default {
    components: {
        treeMenu
    },
    data() {
        return {
            material: {
                materialContent: '<html>\n<head>\n          <title></title>\n</head>\n<body><br />\n&nbsp;</body>\n</html>',
                materialJSON: {
                    width: '600',
                    blocks: []
                },
                materialName: '',
                groupId: 1,
                type: 6 , // stands for email, while 0 for sms
                headId: 0,
                footId: 0,
                id: '',             // 素材Id
                testSubject: '',    // 素材主题
            },
            id: '',
            activeBlockIdx: null,        //当前选中区块的索引
            materialCode: '',             //初始代码 缓存粘贴的代码 点击下一步的时候判断代码是否被修改过
            editor: true,
            disabled: false,
            pasteComplete: false,         //粘贴代码部分和添加cpcode部分切换
            check: false,                //是否标记为个性区块
            textName: '',                //个性区块名
            itemList: [],                //已选标签
            cpcodeStr: '',               //区块名+ ';' + cpcode 用于放到HTML对应区块的value中
            chooseCPcode: false,          //选择cpcode弹窗显隐
            searchList: [],              //选择cpcode弹窗中搜索标签列表
            searchInput: false,           //是否展示搜索cpcode
            keyword: '',                 //搜索cpcode搜索项
            labelGroups: [],             //标签分组列表
            labels: [],                  //选择的标签或分组
            allCpcodeList: [],           //选择cpcode弹窗中搜索的列表
            activeTab: 0,
            // cpcodeJSON: {
            //     width: '600',
            //     blocks: []
            // },
            activeBlock: false,          //当前是否有区块被选中
            editHtml:'',    // 编辑状态下的html
            storeEditHtml: '',//存储从编辑源码跳转过来的html
            modalLoading: false, //cocode弹窗的loading状态
            flag: false
        };
    },
    mounted() {
        this.material.groupId = this.groupId;
        // 获取素材的id
        if (this.$route.query.id) {  //编辑
            this.id = this.$route.query.id;
            this.material.id = ~~this.$route.query.id;
            JourneyMaterialApiV1.getNikeMaterial(this.id)
                .then(res => {
                    if (res.body.data.material.templateJson) {
                        this.material.materialJSON = JSON.parse(res.body.data.material.templateJson);
                    }
                    this.material.materialName = res.body.data.material.materialName;
                    this.material.materialContent = res.body.data.material.materialContent;
                    this.materialCode = res.body.data.material.materialContent;    //缓存一份HTML  下一步的时候判断代码是否被修改了
                    this.material.testSubject = res.body.data.material.testSubject;
                    this.editHtml = res.body.data.material.materialContent;    //编辑状态下的HTML，为编辑源码时作准备
                    this.storeEditHtml = res.body.data.material.materialContent;    //编辑状态下的HTML，为编辑源码时作准备
                });
        }
    },
    computed: {
        crumbs() {
            return [
                {name: 'index', text: 'Dmartech'},
                {name: 'materialStore', text: this.$t('material.contentManagement')},
                Object.assign({}, this.$route, {text: this.$t(this.$route.meta.name)})
            ];
        },
        /**
         * 选择cpcode弹窗 按区块选择的options
         */
        blocksInfo() {
            let blockList = [];
            for (let i = 0; i < this.material.materialJSON.blocks.length; i++) {
                let labels = [];
                if (this.material.materialJSON.blocks[i].dataTemplate) {
                    for (let j = 0; j < this.material.materialJSON.blocks[i].dataTemplate.itemList.length; j++) {
                        labels.push({
                            name: this.material.materialJSON.blocks[i].dataTemplate.itemList[j].name,
                            id: this.material.materialJSON.blocks[i].dataTemplate.itemList[j].id,
                        });
                    }
                    blockList.push({
                        name: this.material.materialJSON.blocks[i].dataTemplate.textName,
                        id: i,
                        labels
                    });
                }
            }
            return blockList;
        },
        groupId() {
            return this.$route.query.groupId;
        },
    },
    methods: {
        // 预览
        preview() {
            this.$preview({material: this.material});
        },
        /**
         * 素材的点击事件
         */
        getNode(e) {
            event.preventDefault();
            this.itemList = [];
            this.check = false;
            this.textName = '';
            this.cpcodeStr = '';
            this.switchNode(e.target);
        },
        /**
         * 获取当前点击的是哪个区块
         */
        switchNode(node) {
            if (node.className && node.className === 'material-show') {      //点击的是最外层的容器 不是素材  不做处理
                //左侧显示提示 个性化设置隐藏
                this.activeBlockIdx = null;
                this.activeBlock = false;
                //清空区域块选中时添加的class
                let dom = document.getElementsByClassName('activeBlock');
                if (dom[0]) {
                    dom[0].classList.remove('activeBlock');
                }
                return false;
            }
            if (node.childNodes.length) {
                for (let i = 0; i < Array.from(node.childNodes).length; i++) {
                    if (Array.from(node.childNodes)[i].tagName === 'INPUT') {   //这个就是当前点击的区块
                        this.activeBlock = true;    //当前有区块被选中

                        // 为了点击区块时给点击的区块加上active的边框效果 需要对每个区块做类名轮换
                        let allTable = Array.from(node.parentNode.children);      //获取所有的"区块"table
                        allTable.forEach(item => {      //清空类名
                            item.classList = [];
                        });
                        node.classList.add('activeBlock');    //当前选中的区块添加类名

                        //获取当前选中区块的索引值
                        allTable.forEach((item, index) => {
                            if (item.classList.value === 'activeBlock') {
                                this.activeBlockIdx = index;
                            }
                        });

                        //如果已经有dataTemplate说明已经有标签被选中
                        if (this.material.materialJSON.blocks[this.activeBlockIdx].dataTemplate) {
                            this.check = this.material.materialJSON.blocks[this.activeBlockIdx].dataTemplate.check;
                            this.textName = this.material.materialJSON
                                .blocks[this.activeBlockIdx].dataTemplate.textName;
                            this.itemList = this.material.materialJSON
                                .blocks[this.activeBlockIdx].dataTemplate.itemList;
                        }
                        return;
                    }
                    if (i === Array.from(node.childNodes).length - 1) {     //for循环都循环结束 都没有符合条件的 再向上查找
                        this.switchNode(node.parentNode);
                    }
                }
            } else if (node.parentNode) {
                this.switchNode(node.parentNode);
            }
        },
        /**
         * 标记为个性化区块
         */
        checkBlock() {
            if (this.check) {
                this.$delete(this.material.materialJSON.blocks[this.activeBlockIdx], 'dataTemplate');
                // 删除标签， 输入值清空
                this.textName = '';
                this.itemList = [];
                // 删除标签， 删除对应dom hidden input值
                let dom = document.getElementsByClassName('activeBlock')[0];
                this.cpcodeStr = '';
                dom.querySelector('input').removeAttribute('value');

                // update dom
                this.updateDom();
            } else {
                this.$set(this.material.materialJSON.blocks[this.activeBlockIdx], 'dataTemplate', {
                    textName: '',
                    itemList: [],
                    check: true
                });
            }
            this.check = !this.check;
        },
        /**
         * 给当前选中的区块打标签
         */
        addCpcode() {
            let dom = document.getElementsByClassName('activeBlock')[0];
            let cpcodeStr = '';
            this.itemList.forEach(item => {
                cpcodeStr = cpcodeStr  + item.name + ',';
            });
            cpcodeStr = this.textName + ';' + cpcodeStr;
            this.cpcodeStr = cpcodeStr;
            dom.querySelector('input').value = this.cpcodeStr;

            if (this.material.materialJSON.blocks[this.activeBlockIdx].dataTemplate) {
                this.material.materialJSON.blocks[this.activeBlockIdx].dataTemplate.itemList = this.itemList;
            } else {
                this.$set(this.material.materialJSON.blocks[this.activeBlockIdx], 'dataTemplate', {
                    textName: this.textName,
                    itemList: this.itemList,
                    check: true
                });
            }

            // update dom
            this.updateDom();
        },
        /**
         * 输入区块名
         */
        inputBlockName() {
            if (/;/g.test(this.textName)) {
                this.textName = this.textName.replace(/;/g, '');
                return this.$toast(this.$t('material.nameError'), 'warn');
            }
            //更新HTMLvalue中的区块名
            if (this.cpcodeStr.includes(';')) {
                this.cpcodeStr = this.textName + ';' + this.cpcodeStr.split(';')[1];
            } else {
                if (this.cpcodeStr.length) {
                    this.cpcodeStr = this.textName + ';' + this.cpcodeStr;
                } else {
                    let cpcodeStr = '';
                    this.itemList.forEach(item => {
                        cpcodeStr = cpcodeStr  + item.name + ',';
                    });
                    this.cpcodeStr = this.textName + ';' + cpcodeStr;
                }
            }
            let dom = document.getElementsByClassName('activeBlock')[0];
            dom.querySelector('input').value = this.cpcodeStr;

            if (this.material.materialJSON.blocks[this.activeBlockIdx].dataTemplate) {
                this.material.materialJSON.blocks[this.activeBlockIdx].dataTemplate.textName = this.textName;
            } else {
                this.$set(this.material.materialJSON.blocks[this.activeBlockIdx], 'dataTemplate', {
                    textName: this.textName,
                    itemList: [],
                    check: true
                });
            }
            // update dom
            this.updateDom();
        },
        /**
         * 右侧操作区 点击删除添加的cpcode
         * @param item {object} 点击删除的那一项
         */
        delLabel(item) {
            for (let i = 0; i < this.itemList.length; i++) {
                if (item.name === this.itemList[i].name){
                    this.itemList.splice(i, 1);
                    this.cpcodeStr = '';
                    for (let j = 0; j < this.itemList.length; j++){
                        this.cpcodeStr = this.cpcodeStr + this.itemList[j].name + ',';
                    }
                    this.material.materialJSON.blocks[this.activeBlockIdx].dataTemplate.itemList = this.itemList;
                    return;
                }
            }
            let dom = document.getElementsByClassName('activeBlock')[0];
            dom.querySelector('input').value = this.cpcodeStr;

            // update dom
            this.updateDom();
        },
        /**
         * 删除选择cpcode弹窗中 从搜索列表选中的标签
         */
        delSearchLabel(item) {
            for (let i = 0; i < this.searchList.length; i++) {
                if (item.name === this.searchList[i].name) {
                    this.searchList.splice(i, 1);
                    i--;
                }
            }
        },
        /**
         * 打开选择cpcode弹窗
         */
        mainShow() {
            // 接口过慢， 加个过渡
            this.modalLoading = true;
            this.chooseCPcode = true;
            // 获取分组列表（1：按分组选择  2：按区块选择）这里默认为按分组选择
            ContactApiV1.getMaterialGroups({sortType: 1})
                .then(res => {
                    this.labelGroups = JSON.parse(JSON.stringify(res.body.data.rootGroup.childs));
                    this.labels = [...this.material.materialJSON.blocks[this.activeBlockIdx].dataTemplate.itemList];
                    this.modalLoading = false;
                })
                .catch(() => {
                    this.modalLoading = false;
                    this.chooseCPcode = false;
                });
        },
        /**
         * 选择cpcode弹窗 关闭
         */
        closeCPcode() {
            this.chooseCPcode = false;
            this.searchList = [];
            this.labels = [];
            this.keyword = '';
            this.searchInput = false;
            this.chooseCPcode = false;
            this.activeTab = 0;
        },
        /**
         * 选择cpcode弹窗 确定
         */
        confirmChoose() {
            this.itemList = this.labels;
            this.itemList = this.itemList.concat(this.searchList);    //从搜索列表选中的cpcode跟其他的合并
            for (let i = 0; i < this.itemList.length; i++) {        //去重
                for (let j = i + 1; j < this.itemList.length; j++) {
                    if (this.itemList[i].id === this.itemList[j].id) {
                        this.itemList.splice(j, 1);
                        --j;
                    }
                }
            }
            ContactApiV1.getLabel()
                .then(({body:{data:{labelList}}}) => {
                    for (let i = 0; i < labelList.length; i++) {
                        for (let j = 0; j < this.itemList.length; j++) {
                            if (labelList[i].id === this.itemList[j].id) {
                                this.itemList[j].name = labelList[i].name;
                            }
                        }
                    }
                    this.searchList = [];
                    this.labels = [];
                    this.keyword = '';
                    this.searchInput = false;
                    this.chooseCPcode = false;
                    this.activeTab = 0;
                    this.addCpcode();
                    this.inputBlockName();
                });
        },
        /**
         * 选择cpcode弹窗中 搜索标签
         */
        search() {
            this.searchInput = true;
            if (this.keyword !== '') {
                let searchList = [];
                let that = this;
                this.allCpcodeList.map(function (item) {
                    if (item.name.search(that.keyword) !== -1) {
                        searchList.push(item);
                    }
                });
                this.allCpcodeList = searchList;
            } else {
                ContactApiV1.getLabel()
                    .then(({body:{data:{labelList}}}) => {
                        this.allCpcodeList = labelList;
                    });
            }
        },
        /**
         * 选择cpcode弹窗 关闭搜索列表
         */
        cancelSearch() {
            this.searchInput = false;
            this.keyword = '';
        },
        /**
         * 选择cpcode弹窗 搜索列表中每一项的点击事件
         */
        chooseSearchLabel(item) {
            if (this.searchList.length === 0) {     //还没有在搜索的列表里选中标签
                this.searchList.push(item);
            } else {    //已经在搜索列表里选择过标签了
                for (let i = 0; i <= this.searchList.length; i++) {
                    if (i < this.searchList.length) {
                        if (this.searchList[i].name === item.name) {
                            return;
                        }
                    } else {
                        this.searchList.push(item);
                        return;
                    }
                }
            }
        },
        /**
         * 底部取消
         */
        cancel() {
            this.$router.push({name: 'materialStore'});
        },
        /**
         * 编辑源码
         */
        backToEditCode() {
            this.pasteComplete = false;
            this.activeBlock = false;
            this.check = false;

            this.material.materialContent = this.editHtml;
            this.storeEditHtml = this.editHtml;
        },
        /**
         * 上一步
         */
        previousStep() {
            this.$router.go(-1);
        },
        /**
         * 保存/保存并退出
         */
        saveMaterial: debounce(function (type) {
            for (let i = 0; i < this.material.materialJSON.blocks.length; i++) {
                let item = this.material.materialJSON.blocks[i];
                if (item.dataTemplate) {
                    if (item.dataTemplate.check && !COMMON_NAME_REGEXP.test(item.dataTemplate.textName)) {
                        return this.$toast(this.$t('common.nameSpecial'), 'warn');
                    }
                    if (item.dataTemplate.check && item.dataTemplate.textName === '') {
                        this.$toast(this.$t('material.noBlockName'), 'warn');
                        return;
                    }
                    if (item.dataTemplate.check && item.dataTemplate.itemList.length === 0) {
                        this.$toast(this.$t('material.cpcodeFilter'), 'warn');
                        return;
                    }
                }
            }
            if (!this.material.materialName) {
                this.$toast(this.$t('material.emailNoEmpty'), 'warn');
                return;
            }
            if (!this.flag) {
                this.flag = true;
                // html和JSON格式校验
                this.$refs.material.innerHTML = this.editHtml;
                EmailHeadFootV1
                    .nikeMaterialCheck(this.$refs.material.innerHTML, JSON.stringify(this.material.materialJSON))
                    .then(res => {
                        if (res.body.code === 200) {    //格式正确
                            const saver = this.id
                                ? JourneyMaterialApiV1.editTemplate(
                                    this.material.materialContent,
                                    JSON.stringify(this.material.materialJSON),
                                    this.material.materialName,
                                    this.material.groupId.toString(),
                                    this.material.type,
                                    this.material.headId,
                                    this.material.footId,
                                    this.id
                                )
                                : JourneyMaterialApiV1.addTemplate(
                                    this.material.materialContent,
                                    JSON.stringify(this.material.materialJSON),
                                    this.material.materialName,
                                    this.material.groupId.toString(),
                                    this.material.type,
                                    this.material.headId,
                                    this.material.footId
                                );
                            saver.then(res => {
                                this.material.id = res.body.data.material.id;
                                this.id = res.body.data.material.id;
                                this.material.testSubject = res.body.data.material.testSubject;
                                this.$toast(this.$t('common.saveSuccess'), 'success');
                                if (type === 2) {
                                    this.$router.push({name: 'materialStore'});
                                }
                                this.flag = false;
                            })
                                .catch(() => {
                                    this.flag = false;
                                });
                        }
                    })
                    .catch(() => {
                        this.flag = false;
                    });
                this.activeBlockIdx = null;
                this.activeBlock = false;
            }
        }, 500),
        /**
         * footer部分 右下角 下一步
         */
        confirm() {
            this.editHtml = this.material.materialContent;

            // html格式校验 校验是否包含区块 对代码格式不做校验 如格式有误 素材不显示
            // 通过检测html中是否有<input type="hidden">来判断  每个区块都有且只有一个input
            if (!this.material.materialContent.includes('input')) {
                this.$toast(this.$t('material.noBlock'), 'warn');
                return false;
            }
            // 检验table是不是都有闭合标签
            if (this.material.materialContent.split('<table').length !== this.material.materialContent.split('</table>').length) {
                this.$toast(this.$t('material.noBlock'), 'warn');
                return false;
            }
            //判断是编辑还是新建
            if (this.material.materialJSON.blocks.length === 0) {        //新建

                // gx 新建时 判断粘贴的代码中有没有cpcode 如果有 需要删除掉

                const list = this.material.materialContent.split('<input');
                let htmlArr = this.material.materialContent.split('input');
                for (let i = 1; i < htmlArr.length; i++) {
                    if (list[i]){
                        if (list[i].substring(0,list[i].indexOf('>')).split('value="').length === 1){
                            this.material.materialJSON.blocks.push({
                                width: '100%',

                            });
                        } else {
                            this.material.materialJSON.blocks.push({
                                width: '100%',
                                dataTemplate: {
                                    textName: list[i].substring(0,list[i].indexOf('>')).split('value="')[1].substring(0,list[i].substring(0,list[i].indexOf('>')).split('value="')[1].indexOf(';')),
                                    itemList: [],
                                    check: true
                                }
                            });
                        }
                    }
                }

            } else {        //编辑
                //gx
                const list = this.material.materialContent.split('<input');
                if (this.material.materialContent !== this.storeEditHtml) {        //代码被修改过
                    this.material.materialJSON.blocks = [];    //代码已经被修改 之前添加的cpcode取消 重新打标签
                    let htmlArr = this.material.materialContent.split('input');
                    for (let i = 1; i < htmlArr.length; i++) {
                        if (list[i]){
                            if (list[i].substring(0,list[i].indexOf('>')).split('value="').length === 1){
                                this.material.materialJSON.blocks.push({
                                    width: '100%',
                                });
                            } else {
                                this.material.materialJSON.blocks.push({
                                    width: '100%',
                                    dataTemplate: {
                                        textName: list[i].substring(0,list[i].indexOf('>')).split('value="')[1].substring(0,list[i].substring(0,list[i].indexOf('>')).split('value="')[1].indexOf(';')),
                                        itemList: [],
                                        check: true
                                    }
                                });
                            }
                        }
                    }
                }
            }
            this.$refs.material.innerHTML = this.material.materialContent;
            this.pasteComplete = true;
        },

        updateDom() {
            this.$nextTick(() =>{
                let dom = document.getElementsByClassName('activeBlock')[0];
                // 选中的区域块 input dom元素转化成字符串
                let inputHtml = dom.querySelector('input').outerHTML;
                // StringHTMl to html
                let contentHtml = new DOMParser().parseFromString(this.material.materialContent, 'text/html');
                // update input
                contentHtml.querySelectorAll('input')[this.activeBlockIdx].outerHTML = inputHtml;
                // value修改后的html
                this.editHtml = contentHtml.documentElement.outerHTML;
                this.material.materialContent = contentHtml.documentElement.outerHTML;
            });
        }
    },


};
</script>
<style lang="scss" type="text/scss" rel="stylesheet/scss">

    // @import "../../../common/scss/base/variables";
    // @import "../../../common/scss/base/mixin";
    @import "./material-form";

    .nike-text-email-form {
        .modal-panel {
            .btn.btn-theme {
                background-color: #fb6f40;
            }
            .btn.btn-theme:hover {
                background-color: #d96031;
            }
        }
        .activeBlock {
            border: 1px solid #fb6f40;
        }
        .page-content {
            .editor-area {
                margin-top: 24px;
                margin-bottom: 50px + 24px;
                height: calc(100% - #{24px * 2 + 50px});
                .edit-content {
                    width: 100%;
                    height: 100%;
                    resize: none;
                    font-size: 12px
                }
            }
        }
        .add-cpcode-content {
            height: calc(100vh - 168px);
            display: flex;
            border-top: 1px solid #cdcdcd;

            .material-show {
                overflow-y: scroll;
                width: calc(100% - 320px);
                height: calc(100% - 50px);
                background-color: #fff;
                border-right: 1px solid #cdcdcd;
            }

            .operation-area {
                width: 320px;
                height: 100%;
                background-color: #fff;

                .operation-header {
                    width: 100%;
                    height: 41px;
                    background-color: #fb6f40;
                    text-align: center;
                    line-height: 41px;
                    color: #fff;
                    font-size: 12px;
                }
                .area-notice{
                    text-align: center;
                    color: $color-light-content;
                    padding: 10px;
                }

                .property-name {
                    padding: 10px 10px 10px 7px;
                    color: #999;

                    &.middle {
                        line-height: 30px;
                    }

                    &:before {
                        content: '';
                        display: inline-block;
                        width: 6px;
                        height: 6px;
                        margin-right: 7px;
                        border-radius: 5px;
                        border: 2px solid #cdcdcd;
                        background-color: #e5e5e5;
                    }

                    &:after {
                        content: '';
                        clear: both;
                        display: table;
                    }

                    .cpcode {
                        width: 285px;
                        height: auto;
                        float: right;
                        overflow: hidden;

                        .list-content {
                            width: 285px;
                            min-height: 32px;
                            padding: 0 0 5px 0;
                            box-sizing: border-box;
                            border: 1px solid rgba(210, 218, 224, 1);
                            overflow: hidden;
                            float: right;

                            .cpcode-list {
                                float: left;
                                overflow: auto;
                                width: 250px;
                                max-height: 620px;

                                .cpcode-item {
                                    width: auto;
                                    height: 16px;
                                    background-color: rgba(39, 201, 169, 1);
                                    margin: 7px 0 0 5px;
                                    float: left;
                                    overflow: hidden;

                                    .cpcode-item-name {
                                        line-height: 16px;
                                        color: rgba(66, 66, 66, 0.847058823529412);
                                        float: left;
                                        margin-left: 5px;
                                        width:59px;
                                        overflow: hidden;
                                        text-overflow: ellipsis;
                                        white-space: nowrap;
                                    }
                                    .cpcode-item-close {
                                        float: left;
                                        margin: 0 5px 0 0px;
                                        line-height: 15px;
                                        color: #111111;
                                        font-size: 12px;
                                        font-weight: 700;
                                        cursor: pointer;
                                    }
                                }
                            }

                            .check-cpcode {
                                width: 20px;
                                height: 20px;
                                border-radius: 50%;
                                background-color: #cdcdcd;
                                color: #fff;
                                font-size: 16px;
                                font-weight: 700;
                                text-align:center;
                                line-height: 17px;
                                float: right;
                                margin: 6px 10px 0 0;
                                cursor: pointer;
                                svg{
                                    width: 10px;
                                    height: 10px;
                                    fill: #fff;
                                    vertical-align: middle;
                                }
                            }
                        }
                    }
                }

                .property {
                    .checkTop{
                        line-height: 36px;
                        margin: 0 15px;
                        overflow: hidden;
                        float: left;
                        display: flex;

                        .check-icon{
                            width: 14px;
                            height: 14px;
                            float: left;
                            border: 1px solid #cdcdcd;
                            margin-top: 10.5px;
                            margin-right: 5px;
                        }
                        .check-icon.checked {
                            background: #cdcdcd;
                        }
                    }

                    .inp {
                        line-height: 36px;

                        .inpText {
                            width: 114px;
                        }
                        .inpText:focus {
                            border-color: #cfd5df;
                            box-shadow: none;
                        }
                        .inpText:hover {
                            border-color: #cfd5df;
                        }
                    }
                }
            }
        }
        .chooseCPcode-content {
            width: 100%;
            height: 100%;
            position: relative;
            padding-top: 40px;
        }
        .cpcode-header {
            position: absolute;
            top: 0px;
            left: 0px;
            width: 576px;

            .CPcode {
                width: 100%;
                min-height: 32px;
                padding: 0 0 5px 0;
                background-color: #f8f8f8;
                box-sizing: border-box;
                border: 1px solid rgba(210, 218, 224, 1);
                display: flex;

                .CPcodeList {
                    flex: 1;
                    overflow: hidden;
                    height: 100%;

                    .CPcodeItem {
                        width: auto;
                        height: 16px;
                        background-color: rgba(39, 201, 169, 1);
                        margin: 7px 0 0 5px;
                        float: left;

                        .CPcode-name {
                            line-height: 16px;
                            color: rgba(66, 66, 66, 0.847058823529412);
                            float: left;
                            margin-left: 5px;
                            width: 63px;
                            overflow: hidden;
                            text-overflow: ellipsis;
                            white-space: nowrap;
                        }
                        .CPcode-close {
                            float: left;
                            margin: 0 5px 0 0px;
                            line-height: 15px;
                            color: #111111;
                            font-size: 12px;
                            font-weight: 700;
                            cursor: pointer;
                        }
                    }
                }

                .add {
                    width: 20px;
                    height: 20px;
                    border-radius: 50%;
                    background-color: #cdcdcd;
                    color: #fff;
                    font-size: 16px;
                    font-weight: 700;
                    text-align:center;
                    line-height: 17px;
                    margin: 6px 10px 0 0;
                    cursor: pointer;
                    svg{
                        width: 10px;
                        height: 10px;
                        fill: #fff;
                    }
                }
                .del {
                    width: 20px;
                    height: 20px;
                    border-radius: 50%;
                    background-color: #cdcdcd;
                    color: #fff;
                    font-size: 16px;
                    font-weight: 700;
                    text-align:center;
                    line-height: 17px;
                    margin: 6px 10px 0 0;
                    cursor: pointer;
                    svg{
                        width: 10px;
                        height: 10px;
                        fill: #fff;
                    }
                }
            }

            .search {
                .cpcode-search {
                    width: 100%;
                    height: 32px;
                    background-color: $title-bg;
                    border: 1px solid rgba(210, 218, 224, 1);
                    box-sizing: border-box;
                    display: flex;

                    .icon {
                        width: 16px;
                        height: 16px;
                        margin: 2px 3px 0px 5px;
                        fill: $color-light-content;
                        color: #8c8c8c;
                    }

                    .search-value {
                        flex: 1;
                        border: none;
                        height: $input-field-height;
                        background-color: transparent;
                    }
                }

                .search-list {
                    width: 100%;
                    max-height: 50vh;
                    margin-top: 0;
                    border: 1px solid rgba(210, 218, 224, 1);
                    background-color: $title-bg;
                    box-sizing: border-box;
                    overflow: auto;
                    padding: 0;

                    .search-item {
                        width: 100%;
                        height: 30px;
                        border-bottom: 1px solid #d2dae0;
                        float: left;
                        line-height: 30px;
                        text-indent: 8px;
                        color: rgba(66, 66, 66, 0.847059);
                        cursor: pointer;
                        overflow: hidden;
                    }
                }
            }
        }
        .selective-type {
            display: flex;
            width: 100%;
            margin-bottom: 10px;

            div {
                cursor: pointer;
                &.active {
                    color: #fb6f40;
                }
            }
            .by-group {
                margin-right: 40px;
            }
        }
        .inline-loading circle {
            fill: $orange;
        }
    }
</style>
