<<template>
  <modal :title="$t('common.restrictionsRecord')" @close="close" :size='size'>
        <div class="list-show">
            <!--表头-->
            <div class="simplify-table table-head" ref="rowLayer">
                <table>
                    <thead>
                        <tr class='theadTr'>
                            <td v-for="attr in selectedAttrs" :key="attr.id" :title="attr.name">
                                <span>{{ attr.name }}</span>
                            </td>
                        </tr>
                    </thead>
                </table>
            </div>
            <!--表格数据内容-->
            <div class="simplify-table table-body" @scroll="tableScroll" v-if="list.length!=0" ref="tableContainer">
                <table>
                    <tbody>
                        <tr v-for="(item,i) in list":key="i">
                            <td>{{ item.operator}}</td>
                            <td>{{ item.operatorTime}}</td>
                            <td>{{ item.operatorName}}</td>
                        </tr>
                    </tbody>
                </table>
            </div>
            <!--数据为空-->
            <div class="simplify-table scroll" @scroll="tableScroll" v-if="list.length === 0">
                <list-empty v-if="list.length === 0"/>
            </div>
            <div class='pagerDiv'>
                <div>{{'common.total' | t}}<p class="theme-text">&nbsp;{{totalRow}}&nbsp;</p>{{'contact.contactCount' | t}}</div>
                <pager :now="pageNo" :total="totalPage" @page="selectPage"></pager>
            </div>
        </div>
    </modal>
</template>
<script >
import { DRAGGABLE_JOURNEY_STORE_NAME } from '@/store/vuex/modules/canvasStore';
import { JourneyApiV3 } from '@/api';
import { mapState } from 'vuex';
export default {
    data () {
        return {
            size: 'lg',
            selectedAttrs: [],
            totalRow: 0,//总条数
            totalPage: 0, // 共多少页
            pageNo: 1,
            pageSize: 10,
            list: []
        };
    },
    computed: {
        ...mapState({
            journey: state => state[DRAGGABLE_JOURNEY_STORE_NAME].journeyInformation,
        })
    },
    mounted () {
        this.$nextTick(() => {
            this.selectedAttrs = [{
                disabled: true,
                fieldName: 'operator',
                id: 1,
                ifSort: false,
                name: this.$t('common.operation'),
                sel: false,
                type: 3
            }, {
                disabled: true,
                fieldName: 'operatorTime',
                id: 2,
                ifSort: false,
                name: this.$t('common.operatorTime'),
                sel: false,
                type: 3
            }, {
                disabled: true,
                fieldName: 'operatorName',
                id: 3,
                ifSort: false,
                name: this.$t('common.operatorName'),
                sel: false,
                type: 3
            }];
        });
    },
    methods: {
        close () {
            this.$parent.modalShow = false;
        },
        // 表头跟随表单内容走
        tableScroll () {
            const $target = this.$refs.tableContainer;
            this.$refs.rowLayer.scrollLeft = $target.scrollLeft;
        },
        // 获取分页
        selectPage (page) {
            this.pageNo = page;
            this.getList();
        },
        getList () {
            JourneyApiV3
                .journeyOperationLog(this.journey.id, this.pageNo, this.pageSize)
                .then((res) => {
                    if (res.statusCode === 200) {
                        const data = res.body.data;
                        if (data) {
                            this.list = data.page;
                            this.pageNo = data.pageNo;
                            this.totalPage = data.totalPageNo;
                            this.totalRow = data.totalRow;
                        } else {
                            this.list = [];
                        }
                    } else {
                        this.$toast(res.body.message, 'warn');
                    }
                });
        }
    }
};
</script>

<style lang="scss" scoped>
.pagerDiv {
    display: flex;
    justify-content: flex-end;
    p {
        margin-left: auto;
        line-height: 64px;
    }
    div {
        display: flex;
        line-height: 64px;
    }
}
</style>
<style lang="scss">
.simplify-table table .theadTr {
    border-bottom: unset;
}
</style>
