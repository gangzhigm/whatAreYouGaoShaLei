<template>
    <div class="journey-list-page">
        <div class="content-view">
            <crumbs/>
        </div>
        <div class="content-view">
            <!-- 左侧旅程分组边栏 -->
            <left-sidebar :SideTreeData="treeData" :fixedList="fixedGroups" ref="leftSidebar" @select="selectGroup"
                            :allTreeData="totalTreeArry" :showNotice="showNotice" @sort="getSortType"
                            @modify="editGroup" @delete="deleteGroup" moduleRange="journey"
                            @traverseOpen="traverseOpen" />
            <!-- 分组内旅程列表 -->
            <journey-group-content :journeyContentId="journeyContentId"/>
        </div>
    </div>
</template>
<script type="text/babel">

    import JourneyGroupContent from './journey-group-content.vue';
    import { JourneyApiV3 } from '@/api';
    import {trackEvent} from '../../monitor';
    import Bus from '../../common/components/group-tree/bus.js'; // Bus是在树形组件中传参时使用
    import { mapState } from 'vuex';

    export default {
        data() {
            return {
                totalTreeArry: [], //素材的分组数据,递归结构需要把allTreeData push到数组中[{allTreeData}]
                treeData: [], // 素材分组[{},{},{}]
                allTreeData: '', // 后台返回的数据是没有被"全部分组"包裹的，需要自定义一个最外层的分组 ➡ "全部分组" {}
                sortType: 1,    //升降排序
                reviewCount: 0,// 待我审核的旅程数量>0显示小红点
                journeyContentId:'',
                isSubmit: false
            };
        },
        computed: {
            ...mapState({
                // 可审批
                canApproval: state => state.user.canApproval,
                // 审批状态
                approvalState: state => state.user.approvalState
            }),
            // fixed groups
            fixedGroups() {
                if (this.canApproval && this.approvalState) {
                    return [
                        {id: 0, name: this.$t('data.allJourney'), type: 'journey'},       // 全部旅程
                        {id: -1, name: this.$t('journeyList.ongoing'), type: 'journey'},   // 正在进行
                        {id: -2, name: this.$t('journeyList.iCreated'), type: 'journey'},  // 我创建的
                        {id: -3, name: this.$t('journeyList.iApplied'), type: 'journey'},  // 我申请的
                        {id: -4, name: this.$t('journeyList.approval'), type: 'journey'}   // 待我审批
                    ];
                }
                return [
                    {id: 0, name: this.$t('data.allJourney'), type: 'journey'},   // 全部旅程
                    {id: -1, name: this.$t('journeyList.ongoing'), type: 'journey'},   // 进行中
                    {id: -2, name: this.$t('journeyList.iCreated'), type: 'journey'},  // 我创建的
                ];
            },
            // notice
            showNotice() {
                // 待我审批的旅程数量>0且有审批权限
                return this.reviewCount > 0 && (this.canApproval && this.approvalState);
            }
        },
        mounted() {
            this.fetchGroupList();

            // single
            Bus.$on('singleMenu', journeyGroup => {
                if (journeyGroup.moduleRange !== 'journey') return;
                if (journeyGroup.action) {
                    this.selectGroup(journeyGroup.groupData);
                }
            });
        },
        methods: {
            /**
             * group sort
             * @param sortType {Number} 排序
             */
            getSortType(sortType) {
                this.sortType = sortType;
                this.fetchGroupList();
            },
            /**
             *  group edit
             * @param createdDetail {Object}  创建详情
             */
            editGroup(createdDetail) {
                if (this.isSubmit) return;
                this.isSubmit = true;
                if (createdDetail.optionType === 'create') {
                    trackEvent('创建旅程分组');
                    JourneyApiV3
                        .createGroup({
                            name: createdDetail.groupName,
                            parentId: createdDetail.parentId
                        })
                        .then(res => {
                            this.$toast(res.body.message, 'success');
                            this.fetchGroupList();
                            this.$refs.leftSidebar.closeNewEditModal();
                            this.isSubmit = false;
                        })
                        .catch(() => {
                            this.isSubmit = false;
                        });
                }
                if (createdDetail.optionType === 'edit') {
                    trackEvent('编辑旅程分组');
                    JourneyApiV3
                        .modifyGroup({
                            groupId: createdDetail.groupId,
                            name: createdDetail.groupName,
                            parentId: createdDetail.parentId,
                        })
                        .then(res => {
                            this.$toast(res.body.message, 'success');
                            this.fetchGroupList();
                            this.$refs.leftSidebar.closeNewEditModal();
                            this.isSubmit = false;
                        })
                        .catch(() => {
                            this.isSubmit = false;
                        });
                }
            },
            /**
             * select group
             * @param group {Object} 分组
             */
            selectGroup(group) {
                if (group.id === this.$route.params.groupId) return;
                this.journeyContentId = group.id;
            },
            // group list
            fetchGroupList() {
                this.treeData = [];
                let test = [];
                this.totalTreeArry = [];
                const tree = [];
                trackEvent('获取旅程分组列表');
                JourneyApiV3
                    .getGroupList(this.sortType)
                    .then((res) => {
                        this.reviewCount = res.body.data.reviewCount;
                        this.allTreeData = JSON.parse(JSON.stringify(res.body.data.rootGroup));
                        this.totalTreeArry.push(this.allTreeData);
                        this.$traverseTree(this.totalTreeArry, tree);
                        this.totalTreeArry = tree;

                        this.treeData = JSON.parse(JSON.stringify(res.body.data.rootGroup.childs));
                        this.$traverseTree(this.treeData, test);
                    });
            },
            /**
             * 遍历树数据，将open更改为false
             * @param data 分组数据
             */
            traverseOpen(data) {
                this.$openToFalse(data);
            },
            /**
             * del group
             * @param groupId {Number} 分组id
             */
            deleteGroup(groupId) {
                if (this.isSubmit) return;
                this.isSubmit = true;
                JourneyApiV3.deleteGroup({groupId})
                    .then(() => {
                        this.isSubmit = false;
                        this.fetchGroupList();
                        this.$toast(this.$t('common.deleteSuccess'), 'success');
                        trackEvent('删除旅程分组');
                        this.$router.push({ name: 'journeyRecords', params: {groupId: 0}});
                    }, () => {
                        this.isSubmit = false;
                        this.$toast(this.$t('common.deleteFailed'), 'warn');
                    });
                this.selectGroup(groupId = '');
            },
        },
        components: {JourneyGroupContent}
    };

</script>
<style lang="scss">
    @import "../../common/scss/base/variables";
    @import "../../common/scss/base/mixin";
</style>
