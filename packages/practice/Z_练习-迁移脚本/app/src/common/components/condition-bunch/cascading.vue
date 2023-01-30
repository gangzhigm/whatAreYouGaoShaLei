<template>
    <div class="cascading" :class="{'view-mode': viewMode}" v-blur="close">
        <label class="select-text" :class="{'disabled': disabled, 'view-mode': viewMode}" @click="toggle">
            <span v-if="text" class="text-select-name" :title="text">{{text}}</span>
            <template v-else-if="childName">
                <span v-if="showParentName" class="text-select-name" :title="`[${parentName}]${childName}`">[{{parentName}}]{{childName}}</span>
                <span v-else class="text-select-name" :title="childName">{{childName}}</span>
            </template>
            <span v-else class="placeholder">{{placeholder ? placeholder : $t('common.selectHolder')}}</span>
            <span class="select-icon icon icon-arrow-down"></span>
        </label>
        <input v-if="type === 'journey' && globalSearch" class="btn btn-md btn-theme margin" type="button" :value="globalSearchModel ? $t('common.groupingQuery') : $t('common.globallySearch')" @click="changeSearchModel"/>
        <transition name="drop">
            <div class="csedes" v-if="showList && !globalSearchInput">
                <inline-loading v-if="loading"/>
                <div v-if='!loading' class="drop-down-list" :class="{'double-width': !journey && !form}">
                    <ul :class="{noPadding: type === 'contact'}">
                        <li v-if="type !== 'contact'">
                            <label class="search-field" v-if="journey || form">
                                <input type="text" ref="search" v-model.trim="keyword" :placeholder="$t('common.selectKeywordHolder')"
                                       @input="search(uniqueKey,-1)">
                                <span class="icon icon-search" @click="search(uniqueKey,-1)"></span>
                            </label>
                            <label class="search-field" v-else>
                                <input type="text" ref="search" v-model.trim="keyword" :placeholder="$t('common.selectKeywordHolder')"
                                       @input="search('',-1)">
                                <span class="icon icon-search" @click="search('',-1)"></span>
                            </label>
                        </li>
                        <li v-else class="noSearch"></li>
                        <li v-if="lists.length === 0">{{'common.noData' | t}}</li>
                        <li v-else v-for="(parent,parentIndex) in lists" @click="journey || form ? getListOperation(parent) : selectGroup(parent.id)"
                            :class="{active: parent.id === startOrClick}" :title="parent.name" :key="parentIndex" class="test">
                            <span class="position-span"><span class="icon icon-arrow-right"></span></span>
                            {{parent.name}}
                            <inline-loading class="journey-loading" v-if="(journey||form) && childLoading"/>
                            <ul v-if="parent.id === startOrClick && !journey && !form" @click.stop>
                                <li v-if="parent && parent.child && parent.child.length === 0">{{'common.noData' | t}}</li>
                                <li v-else v-for="child in parent.child" @click.stop="selectPaper(child)"
                                    :class="{active: child.id === value}" :title="child.name" :key="child.id">
                                    {{child.name}}
                                </li>
                            </ul>
                            <ul v-if="parent.id === startOrClick && (journey||form) && !childLoading" @click.stop>
                                <li v-if="parent && parent.child && parent.child.length === 0">{{'common.noData' | t}}</li>
                                <li v-for="item in parent.child" @click.stop="selectChild(item)" :key="item.id"
                                    :class="{active: item.id === childId}" :title="item[uniqueKey]">{{item[uniqueKey]}}</li>
                            </ul>
                            <ul v-if="startOrClick === '' && parentIndex === 0" @click.stop>
                                <li><em>{{'swarm.pickAGroup' | t}}</em></li>
                            </ul>
                            <ul v-if="parent.id !== startOrClick && !journey && !form && parentIndex === 0" @click.stop>
                                <li><em>{{'swarm.pickAGroup' | t}}</em></li>
                            </ul>
                            <div class="secSearch" v-if="parent.id === startOrClick && !journey && !form" @click.stop>
                                <label class="search-field">
                                    <input type="text" ref="search" v-model.trim="secKeyword" :placeholder="$t('common.selectKeywordHolder')"
                                           @input="search('',parentIndex)">
                                    <span class="icon icon-search" @click="search('',parentIndex)"></span>
                                </label>
                            </div>
                            <div class="secSearch" v-if="parent.id === startOrClick && (journey||form)" @click.stop>
                                <label class="search-field">
                                    <input type="text" ref="search" v-model.trim="secKeyword" :placeholder="$t('common.selectKeywordHolder')"
                                           :disabled="childLoading" @input="search(uniqueKey,parentIndex)">
                                    <span class="icon icon-search" @click="search(uniqueKey,parentIndex)"></span>
                                </label>
                            </div>
                        </li>
                    </ul>
                </div>
            </div>
            <div class="csedes" v-if="globalSearchInput">
                <inline-loading v-if="journeyLoading"/>
                <template v-if="!journeyLoading">
                    <div class="drop-down-list" :class="{'double-width': !journey && !form}">
                        <ul class="all-journey" v-load="loadMore" ref="ul">
                            <li>
                                <label class="search-field">
                                    <input type="text" ref="search" v-model.trim="journeyName" :placeholder="$t('common.selectKeywordHolder')"
                                            @input="journeyGlobalSearch()">
                                    <span class="icon icon-search" @click="journeyGlobalSearch()"></span>
                                </label>
                            </li>
                            <li v-if='journeyData.length === 0'>{{'common.noData' | t}}</li>
                            <li v-for="item in journeyData" :key="item.id" @click.stop="selectJourney(item)"
                                :class="{active: item.id === childId}" :title="item.journeyName">{{item.journeyName}}</li>
                        </ul>
                        
                    </div>
                </template>
            </div>
        </transition>
        <div class="add-btn" v-if="addable" @click="addEventAttribute">
            <i class="icon icon-tianjia"></i>
            {{'swarm.addEventAttribute' | t}}
        </div>
    </div>
</template>
<script type="text/ecmascript-6">

    import { JourneyApiV3, ContactApi} from '@/api';
    import filterArrayByName from '../../../common/utils/filterArrayByName';
    import cloneDeep from 'lodash/cloneDeep';
    import debounce from 'lodash/debounce';

    export default {
        props: {
            value: '',
            list: Array,        //数据列表
            placeholder: {
                type: String
            },
            journey: false,     //是否是选择旅程
            journeyGroup: '',   //旅程分组ID
            disabled: Boolean,
            type: '',
            form: false, //是否选择表单
            eventId: Number, //表单类型事件ID
            addable: {
                type: Boolean,
                default: false
            }, //是否显示 添加事件属性 按钮
            showParentName: {
                type: Boolean,
                default: false
            }, //是否显示父级名称
            viewMode: {
                type: Boolean,
                default: false
            } //查看模式
        },
        data () {
            return {
                groupId: '',                //首列选中项的ID
                showList: false,            //列表是否打开
                childId: '',                //选中的子集ID
                childName: '',              //选中的旅程名称
                parentId: '',               //选中的旅程分组ID
                parentName: '',             //选中的旅程分组名称
                childLoading: false,        //子级列是否加载中
                keyword: '',                //首列搜索关键字
                secKeyword: '',             //第二列搜索关键字
                lists: [],                  //展示列表
                childList: [],              //第二列原始列表
                tempGroupId: '',            //暂时点选的分组id
                globalSearchModel:false,    //搜索模式 true 全局搜索，false分组搜索
                globalSearch: false,        //全局搜索按钮
                globalSearchInput: false,   //全局搜索下拉框
                journeyData: [],
                journeyName: '',
                pageNumber: 1,
                pageSize: 10,
                totalPage: '',
                journeyLoading:false
            };
        },
        created() {
            //用于数据回显时加载数据
            let listTimes = 0;
            let loadList = setInterval(() => {
                listTimes = listTimes + 1;
                //父组件中对数据结构进行重组，list传递延迟，需多次判断
                if (this.list.length) {
                    clearInterval(loadList);
                    this.parentId = this.journeyGroup;
                    this.childId = this.value;
                    //旅程列表时
                    if (this.journey || this.form) {
                        this.lists = this.list;
                        if (this.childId) {
                            let exist = this.lists.some(e => {return e.id === this.parentId});
                            if (exist) {
                                let selected = this.lists.filter(e => {return e.id === this.parentId});
                                this.getListOperation(selected[0], 'init');
                            } else {
                                this.parentId = '';
                                this.childId = '';
                                this.$emit('noitem');
                            }
                        } else {
                            this.getListOperation(this.lists[0]);
                        }
                    //其他列表时
                    } else if (this.value) {
                        this.lists = cloneDeep(this.list);
                        for (let i = 0; i < this.list.length; i++) {
                            let element = this.list[i].child;
                            let len = element.length;
                            for (let j = 0; j < len; j++) {
                                if (element[j].id === this.value) {
                                    this.groupId = this.list[i].id;
                                    //let selectedGroup = this.list.find(group => group.id === this.groupId);
                                    //let selectedForm = selectedGroup ?
                                    //    selectedGroup.child.find(paper => paper.id === this.value) : '';
                                    //if (!selectedForm) {
                                    //    this.$emit('noitem');
                                    //}
                                    //this.childList = selectedGroup ? selectedGroup.child : [];
                                    this.childList = this.list[i] ? this.list[i].child : [];
                                }
                            }
                        }
                        this.childList.length || this.$emit('noitem');
                    } else {
                        this.lists = cloneDeep(this.list);
                        this.groupId = 0;
                        this.childList = this.lists[0].child;
                    }
                }
                if (listTimes > 100) {
                    clearInterval(loadList);
                }
            },100);
            this.getFromJourney();
        },
        computed: {
            text() {
                if (this.value && !this.journey && !this.form) {
                    let selectedGroup = this.lists.find(group => group.id === this.startOrClick);
                    let selectedForm = '';
                    if (selectedGroup && selectedGroup.child) {
                        selectedForm = selectedGroup.child.find(paper => paper.id === this.value);
                    }
                    if (selectedGroup && selectedForm) {
                        return selectedForm.name;
                    }
                    return false;
                }
                return false;
            },
            loading() {
                if (this.lists) {
                    return false;
                }
                return true;
            },

            selectedGroupId(){
                if (this.value && !this.journey && !this.form) {
                    for (let i = 0; i < this.lists.length; i++) {
                        let element = this.lists[i].child;
                        let len = element.length;
                        for (let j = 0; j < len; j++) {
                            if (element[j].id === this.value) {
                                return this.lists[i].id;
                            }
                        }
                    }
                } else {
                    return 0;
                }
            },
            startOrClick() {
                if (this.journey || this.form) {
                    return this.parentId;
                }
                return this.groupId === '' ? this.selectedGroupId : this.groupId;
            },
            uniqueKey() {
                if (this.journey) {
                    return 'journeyName';
                } else if (this.form) {
                    return 'fieldCn';
                }
                return '';
            }
        },
        watch: {
            showList(newVal, oldVal) {
                if (!newVal && newVal !== oldVal) {
                    if (this.list.length) {
                        this.keyword = '';
                        this.secKeyword = '';
                        //this.parentId = this.journeyGroup;
                        //this.childId = this.value;
                        //旅程列表时
                        if (this.journey || this.form) {
                            this.lists = this.list;
                            if (this.childId) {
                                for (let i = 0; i < this.lists.length; i++) {
                                    if (this.lists[i].id === this.parentId) {
                                        this.getListOperation(this.lists[i], 'init');
                                    }
                                }
                            } else {
                                this.getListOperation(this.lists[0]);
                            }
                            //其他列表时
                        } else if (this.value) {
                            this.lists = cloneDeep(this.list);
                            let selectedGroup = this.list.find(group => group.id === this.selectedGroupId);
                            this.groupId = this.selectedGroupId;
                            this.childList = selectedGroup ? selectedGroup.child : [];
                        } else {
                            this.lists = cloneDeep(this.list);
                            this.groupId = 0;
                            this.childList = this.lists[0].child;
                        }
                    }
                }
            },
            journeyGroup(newVal, oldVal) {
                if ((this.journey || this.form) && !newVal && oldVal) {
                    this.parentId = '';
                    this.parentName = '';
                    this.childId = '';
                    this.childName = '';
                }
            },
            globalSearchModel(newVal,oldVal) {
                if (newVal) {
                    if (this.journeyName !== '') {
                        this.journeyName = '';
                        this.journeyGlobalSearch();
                    }
                } else {
                    if (this.list.length) {
                        this.keyword = '';
                        this.secKeyword = '';
                        //this.parentId = this.journeyGroup;
                        //this.childId = this.value;
                        //旅程列表时
                        if (this.journey || this.form) {
                            this.lists = this.list;
                            if (this.childId) {
                                for (let i = 0; i < this.lists.length; i++) {
                                    if (this.lists[i].id === this.parentId) {
                                        this.getListOperation(this.lists[i], 'init');
                                    }
                                }
                            } else {
                                this.getListOperation(this.lists[0]);
                            }
                            //其他列表时
                        } else if (this.value) {
                            this.lists = cloneDeep(this.list);
                            let selectedGroup = this.list.find(group => group.id === this.selectedGroupId);
                            this.groupId = this.selectedGroupId;
                            this.childList = selectedGroup ? selectedGroup.child : [];
                        } else {
                            this.lists = cloneDeep(this.list);
                            this.groupId = 0;
                            this.childList = this.lists[0].child;
                        }
                    }
                }
            },
        },
        methods: {
            toggle() {
                if (this.disabled || this.viewMode) {
                    return;
                }
                this.showList = !this.showList;
                this.globalSearch = !this.globalSearch;
                this.globalSearchInput = false;
                this.globalSearchModel = false;
            },
            close() {
                this.showList = false;
                this.globalSearch = false;
                this.globalSearchInput = false;
                this.globalSearchModel = false;
                if (this.journeyName !== '') {
                    this.journeyName = '';
                    this.journeyGlobalSearch();
                }
            },
            selectGroup(groupId) {
                this.secKeyword = '';
                for (let i = 0; i < this.lists.length; i++) {
                    if (this.lists[i].id === this.groupId) {
                        this.lists[i].child = cloneDeep(this.childList);
                    }
                }
                this.groupId = groupId;
                for (let i = 0; i < this.list.length; i++) {
                    if (this.list[i].id === groupId) {
                        this.$nextTick(() => {
                            this.childList = cloneDeep(this.list[i].child);
                        });
                    }
                }
            },
            selectPaper(child) {
                this.$emit('input', child.id);
                this.showList = false;
                this.globalSearch = false;
                this.globalSearchInput = false;
                this.globalSearchModel = false;
                this.$emit('select', child);
            },
            selectChild(journey,init) {
                let journeyAddGroup = journey;
                journeyAddGroup.groupId = this.parentId;
                this.$emit('input', journey.id);
                if (init !== 'init') {
                    this.$emit('select', journeyAddGroup);
                }
                let selected = this.lists.filter(e => {return e.id === this.parentId});
                if (selected.length > 0) {
                    this.parentName = selected[0].name;
                }
                this.childId = journey.id;
                if (this.journey) {
                    this.childName = journey.journeyName;
                } else {
                    this.childName = journey.fieldCn;
                }
                if (!init) {
                    this.showList = false;
                    this.globalSearch = false;
                    this.globalSearchInput = false;
                    this.globalSearchModel = false;
                }
            },
            getListOperation(parent, init) {
                if (this.journey) {
                    this.getJourneyList(parent, init);
                } else {
                    this.getFormList(parent, init);
                }
            },
            getFormList(group, init) {
                if (!this.childLoading) {
                    this.parentId = group.id;
                    this.childLoading = true;
                    ContactApi
                        .getFormFields(this.eventId, group.id)
                        .then (res => {
                            let formFieldDto = res.body.data.formFieldDto;
                            if (formFieldDto) {
                                group.child = formFieldDto;
                                this.childList = formFieldDto;
                                this.childLoading = false;
                                if (init === 'init') {
                                    for (let i = 0; i < group.child.length; i++) {
                                        if (group.child[i].id === this.childId) {
                                            this.selectChild(group.child[i],init);
                                        }
                                    }
                                    if (this.childId &&
                                        group.child.filter(item => (item.id === this.childId)).length === 0) {
                                        this.$emit('noitem');
                                    }
                                }
                            }
                        })
                        .catch(() => {
                            group.child = [];
                            this.childList = [];
                            this.childLoading = false;
                        });
                }
            },
            getJourneyList(group, init) {
                if (!this.childLoading) {
                    this.parentId = group.id;
                    this.childLoading = true;
                    JourneyApiV3
                        .getAllJourneys({
                            groupId: group.id,
                            journeyStatus: 4,
                            journeyType: 0,
                            journeyName: ''
                        })
                        .then((res) => {
                            let journeyList = res.body.data.list.filter(item => item.journeyInstantiationIds.length);
                            group.child = journeyList;
                            this.childList = journeyList;
                            this.childLoading = false;
                            if (init === 'init') {
                                for (let i = 0; i < group.child.length; i++) {
                                    if (group.child[i].id === this.childId) {
                                        this.selectChild(group.child[i],init);
                                    }
                                }
                                if (this.childId &&
                                    group.child.filter(item => (item.id === this.childId)).length === 0) {
                                    this.$emit('noitem');
                                }
                            }
                        });
                }
            },
            search(keyName,parentIndex) {
                if (parentIndex !== -1) {
                    if (this.secKeyword === '') {
                        if (keyName === 'journeyName' || keyName === 'fieldCn') {
                            this.lists[parentIndex].child = this.childList;
                        } else {
                            this.lists[parentIndex].child = cloneDeep(this.childList);
                        }
                    } else {
                        if (keyName === 'journeyName' || keyName === 'fieldCn') {
                            this.lists[parentIndex].child =
                                filterArrayByName(this.childList, this.secKeyword, keyName);
                        } else {
                            this.lists[parentIndex].child =
                                cloneDeep(filterArrayByName(this.childList,this.secKeyword));
                        }
                    }
                } else {
                    this.secKeyword = '';
                    for (let i = 0;i < this.lists.length;i++) {
                        if (this.lists[i].id === this.startOrClick) {
                            this.lists[i].child = [];
                        }
                    }
                    if (keyName === 'journeyName' || keyName === 'fieldCn') {
                        this.parentId = '';
                        if (this.keyword === '') {
                            this.lists = this.list;
                        } else {
                            this.lists = filterArrayByName(this.list,this.keyword);
                        }
                    } else {
                        if (this.keyword === '') {
                            this.lists = cloneDeep(this.list);
                        } else {
                            this.lists = cloneDeep(filterArrayByName(this.list,this.keyword));
                        }
                    }
                }
            },
            addEventAttribute() {
                this.$emit('addAttr');
            },
            changeSearchModel() {
                this.globalSearchInput = !this.globalSearchInput;
                this.globalSearchModel = !this.globalSearchModel;    
            },
            getFromJourney() {
                JourneyApiV3
                    .getFromJourney({
                        journeyName: this.journeyName,
                        page: this.pageNumber,
                        size: this.pageSize,
                        journeyStatus: 4,
                        journeyType: 0,
                    })
                    .then(res => {
                        this.journeyData = this.journeyData.concat(res.body.data.list);
                        this.totalPage = res.body.data.totalPage;
                        this.journeyLoading = false;
                    });
            },
            loadMore() {
                if (this.pageNumber >= this.totalPage) return;
                let target = this.$refs.ul;
                if (target.clientHeight + target.scrollTop + 1 > target.scrollHeight) {
                    this.pageNumber++;
                    this.getFromJourney();
                }
            },
            journeyGlobalSearch:debounce(function() {
                this.journeyLoading = true;
                this.pageNumber = 1;
                this.journeyData = [];
                this.getFromJourney();
            },300),
            // 选择旅程
            selectJourney(journey) {
                this.getGroupId(journey);
                this.childName = journey.journeyName;
                this.childId = journey.id;
                this.$emit('input', journey.id);
            },
            // 获取分组id
            getGroupId(journeyId) {
                JourneyApiV3
                    .getGroupId(journeyId.id)
                    .then(({body:{data}}) =>{
                        let journeyAddGroup = journeyId;
                        journeyAddGroup.groupId = data.groupId;
                        this.parentName = data.name;
                        this.parentId = data.groupId;
                        this.$emit('select', journeyAddGroup);
                        this.showList = false;
                        this.globalSearch = false;
                        this.globalSearchInput = false;
                        this.globalSearchModel = false;
                    });
            }
        }
    };
</script>
<style lang="scss" type="text/scss" rel="stylesheet/scss">
    @import "../../../common/scss/base/variables";
    @import "../../../common/scss/base/mixin";

    .cascading {
        display: inline-block;
        position: relative;
        vertical-align: middle;
        margin-right: 10px;
        margin-bottom: 5px;
        &.view-mode {
            margin-bottom: 0;
        }
        label {
            float: left;
            // display: inline-block;
            position: relative;
            width: 200px;
            height: $input-field-height - 2px;
            line-height: $input-field-height - 2px;
            border: 1px solid $form-border;
            border-radius: 4px;
            padding-right: 8px;
            cursor: pointer;
            padding-left: 1em;
            background-color: #fff;
            &:hover {
                border-color: $light-green;
            }
            .icon {
                float: right;
            }
            .placeholder{
                color: #bfbfbf;
            }
            .text-select-name {
                display:inline-block;
                max-width: 185px;
                overflow: hidden;
                @include ellipsis();

            }
            &.disabled{
                background-color: #f0f2f5;
                cursor: pointer;
                color: $disabled;
            }
            &.disabled:hover {
                border: 1px solid $form-border;
            }
            &.view-mode {
                margin: 0 10px 0 0;
                background-color: unset;
                cursor: default;
                color: unset;
                line-height: 32px;
                border: none;
                width: unset;
                color: unset;
                padding: 0;
                background-color: unset;
                .icon {
                    display: none;
                }
                &:hover {
                    border: unset;
                }
            }
        }
        .csedes{
            width: 300px;
            position: absolute;
            left: 0;
            top: 33px;
            background-color: #fff;
            z-index: 1;
            border-radius: 4px;

            .drop-down-list {
                display: flex;
                width: 300px;
                background-color: white;
                border: 1px solid $form-border;
                border-radius: 4px;
                position: relative;
                box-sizing: border-box;

                ul {
                    width: 50%;
                    height: 250px;
                    overflow: auto;
                    padding-top: 32px;
                    border-right: 1px solid $form-border;
                    box-sizing: border-box;
                    ul {
                        position: absolute;
                        top: 0;
                        right: 0;
                        height: 250px;
                        background-color: #ffffff;
                        padding-top: 32px;
                        li:first-child{
                            width: 100%;
                            position: relative;
                            padding: 0 8px 0 16px;
                            box-sizing: border-box;
                        }
                    }

                    li {
                        padding: 0 20px 0 14px;
                        height: $input-field-height;
                        line-height: $input-field-height;
                        @include ellipsis();
                        cursor: pointer;

                        &:hover {
                            background-color: $hover-bg;
                        }

                        .icon {
                            float: right;
                        }

                        .position-span{
                            float: left;
                            position: relative;
                            .icon-arrow-right{
                                position: absolute;
                                top: 0;
                                left: 110px;
                            }
                        }
                    }
                    li:first-child{
                        width: 50%;
                        position: absolute;
                        top: 0;
                        left: 0;
                        padding: 0;
                    }
                    .active {
                        background-color: $select-bg;

                        &:hover {
                            background-color: $select-bg;
                        }
                    }
                    li.noSearch{
                        display: none;
                    }
                }
                ul.noPadding{
                    padding-top: 0;
                }
                .journey-loading {
                    position: absolute;
                    right: 55px;
                    top: 50px;
                }
                .all-journey{
                    width: 100%;
                    li:first-child{
                        width: 100%;
                    }
                }
                .search-field{
                    position: relative;
                    display: flex;
                    width: 100%;
                    align-items: center;
                    height: $input-field-height;
                    border-bottom: 1px solid $select-border;
                    border-left: none;
                    background-color: $title-bg;
                    @include border-radius(0);
                    color: $color-light-content;
                    box-sizing: border-box;
                    padding: 0;
                    z-index: 1;

                    input {
                        height: $input-field-height - 1;
                        padding: 0 8px 0 28px;
                        width: 100%;
                        min-width: 5em; // 否则placeholder显示不全
                        background-color: transparent;
                        border-left: none;
                        border-top: none;
                        border-right: none;
                        border-bottom: 1px solid #cfd5df;

                        &:hover {
                            background-color: $select-bg;

                            & + .icon-search {
                                background-color: $select-bg;
                            }
                        }

                        &:focus {
                            background-color: #fff;

                            & + .icon-search {
                                background-color: #fff;
                            }
                        }
                    }

                    .icon-search {
                        $offset: ($input-field-height - 14px) / 2;
                        position: absolute;
                        width: 26px;
                        height: $input-field-height - 3px;
                        line-height: $input-field-height;
                        text-align: center;
                        left: 1px;
                        top: 1px;
                        background-color: transparent;
                    }
                }
                .secSearch{
                    position: absolute;
                    right: 0;
                    top: 0;
                    width: 50%;
                }

                &.double-width {
                    width: 450px;
                    &>ul {
                        width: 150px;
                        li {
                            ul {
                                width: 300px;
                                left: 150px;
                            }
                            .secSearch {
                                width: 300px;
                                left: 150px;
                            }
                        }
                        &>li:first-child {
                            width: 150px;
                        }
                    }
                }
            }
        }
        .add-btn {
            line-height: 32px;
            display: inline-block;
            height: 32px;
            margin-left: 15px;
            color: #0cc2a9;
            cursor: pointer;
        }
        .margin {
            margin-left: 8px;
        }
    }
</style>
