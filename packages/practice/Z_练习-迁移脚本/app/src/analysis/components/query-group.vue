<template>
    <div v-if="byFields.length">
        <div class="by-fields-groups action-icon-trigger" v-for="(group, index) in byFields">
            {{'analysis.by' | t}}&nbsp;
            <selector class="hg" :options="options" search type="groupSelect"
                      :value="group.attrId"
                      @select="selectGroup(index, $event)"/>
            <setting-number v-if="group.attrGenre === 1 || group.attrGenre === 3"
                            @change="setNumber(index, $event)"
                            :type="group.numberType" :attrGenre="group.attrGenre"
                            :numberList="group.numberInterval"/>
            <setting-time v-if="group.attrGenre === 2" @change="setTime(index, $event)"
                          :collectValue="group.collect"
                          :timeValue="group.timePrecision"/>
            &nbsp;{{'analysis.view' | t}}
            <button class="action-icon icon icon-close" @click="removeGroup(index)"></button>
        </div>
    </div>
</template>
<script>
    import debounce from 'lodash/debounce';
    import {KEY_PREFIXES} from '@/store/vuex/modules/analysisStore';
    import SettingNumber from './setting-number.vue';
    import SettingTime from './setting-time.vue';

    const USER_GROUP_ATTR_TYPE = 'USER_GROUP_ATTR_TYPE';
    const EVALUATE_ATTR_TYPE = 'EVALUATE_ATTR_TYPE';
    const ATTR_TYPE_MAP = {
        0: 'user',
        2: 'event',
        USER_GROUP_ATTR_TYPE: 'group',
        EVALUATE_ATTR_TYPE: 'evaluate',
    };
    export default {
        name: 'query-group',
        components: {
            SettingNumber,
            SettingTime
        },
        data() {
            return {
                groups: []
            };
        },
        props: {
            byFields: Array,
            options: Array
        },
        methods: {
            // 通知外部组件，query发生了变化，一般在校验通过之后
            notify: debounce(function (obj) {
                this.$emit('change', obj);
            }, 500),
            selectGroup(groupIdx, attr) {
                const targetGrp = this.byFields[groupIdx];
                // 属性类型 用户：fans, 事件：event, 分群：group
                // attr.attrType 0:用户, 1:商品，2:行为（事件），fixme 用户分群没有自己的attrType, 前端暂时虚构了 USER_GROUP_ATTR_TYPE
                const isUserGroup = attr.key.includes(KEY_PREFIXES.USER_GROUP);
                const isEvaluate = attr.key.includes(KEY_PREFIXES.EVALUATE);
                let attrType;
                if (isEvaluate) {
                    attrType = ATTR_TYPE_MAP[EVALUATE_ATTR_TYPE];
                } else if (isUserGroup) {
                    attrType = ATTR_TYPE_MAP[USER_GROUP_ATTR_TYPE];
                } else {
                    attrType = ATTR_TYPE_MAP[attr.attrType];
                }
                if (targetGrp.key !== attr.key) {
                    let group = {
                        id: attr.id,
                        key: attrType + '_' + attr.id, // fixme 危险的应用，attrType 恰好和 KEY_PREFIXES 里的各个前缀相同，所以没有出错
                        attrGenre: attr.attrGenre,  // 属性值类型 0-字符串类型，1-数字类型,2-时间类型 ,3-小数类型，4-布尔类型
                        attrId: attr.id,            // 属性ID
                        attrName: attr.name || attr.meaning,
                        attrType,         // 属性类型 用户：fans, 事件：event, 分群：group，评估模型：evaluate
                        numberPrecision: attr.attrLength, // double类型保留的小数位数
                        collect: false,             // 是否对该字段进行汇总
                        order: '',                  // asc-升序，desc-降序, 置空则不排序
                        timePrecision: 'default',   // 时间类型的精度 'default', 'minute', 'hour', 'day', 'week', 'month', 'quarter', 'year'
                        numberInterval: [],         // 数字汇总区间 [13,30,45]
                        numberType: 'default',      // 数值类型 "default", "integer", "interval"
                        userGroupInfo: isUserGroup ? {id: attr.id} : {},
                    };
                    this.notify({
                        position: groupIdx,
                        group
                    });
                }
            },
            // 设置数值类型的区间
            setNumber(index, numberSettingPart) {
                const newGroup = Object.assign({}, this.byFields[index], numberSettingPart);
                this.notify({
                    position: index,
                    group: newGroup
                });
            },
            // 设置时间类型是否汇总
            setTime(index, timeSettingPart) {
                const newGroup = Object.assign({}, this.byFields[index], timeSettingPart);
                this.notify({
                    position: index,
                    group: newGroup
                });
            },
            // 删除一个分组
            removeGroup(index) {
                const targetGrp = this.byFields[index];
                this.$emit('delete', {
                    index,
                    target: targetGrp  // 如果删除的是一个有效分组，那么通知外部
                });
            },
        }
    };
</script>
<style lang="scss">
    @import "../../common/scss/base/variables";
    @import "../../common/scss/base/mixin";

    // query 2/3 分组 byFields
    .by-fields-groups {
        padding: 10px;

        &:hover {
            background-color: rgba($theme, .2);
        }
    }
</style>
