<template>
    <!--    小程序服务类目-->
    <div class="category-modal">
        <modal :title="'小程序类目'" @close="closeModal">
            <div class="service-category">
                <div class="form-field">
                    <label class="label">{{$t('microPage.Service')}}</label>
                    <span class="about-category">{{$t('microPage.selectOneServer')}}
                        <a href="https://kf.qq.com/" target="_blank" class="theme-text">{{$t('microPage.seeChoose')}}</a></span>
                </div>
                <div class="form-field category-list">
                    <inline-spin v-if="loading"/>
                    <ul v-else>
                        <li v-for="(item, index) in hasCategories" :key="index">
                            <selector v-model="item.first" :options="allCategories" :placeholder="$t('microPage.selectCategory')"
                                      @select="selectFirst(index,item,$event)" :disabled="item.audit_status?true:false"/>
                            <selector v-model="item.second" :options="optionalCate(item.first, allCategories)"
                                      :placeholder="$t('microPage.selectSecond')" :disabled="item.audit_status?true:false"
                                      @select="selectSecond(index,item, $event)"/>
                            <button class="btn" v-if="hasCategories.length>1" @click="delCategories(index)">
                                <svg aria-hidden="true">
                                    <use xlink:href="#icon-delete"></use>
                                </svg>
                            </button>
                            <span v-if="item.audit_status===1">{{$t('microPage.Auditing')}}</span>
                            <span v-if="item.audit_status===2" class="red-text">{{$t('microPage.Failed')}}</span>
                            <div v-if="item.sensitive_type===1&&item.second" v-for="inner in item.certicates">
                                <p>{{ inner.key }}</p>
                                <upload-id :uploadType="3" :imgTitle="$t('microPage.photoQualify')" :appid="appid" :ref="'uploadId'+index"
                                           @getCertificationImg="getMaterial($event, inner)"></upload-id>
                            </div>
                        </li>
                    </ul>
                    <div v-if="!loading">
                        <button class="btn theme-text" @click="addOneCate">{{$t('microPage.addCategory')}}</button>
                    </div>
                </div>
            </div>
            <template v-slot:buttons>
                <input type="button" class="btn btn-md btn-theme-border" :value="$t('common.cancel')" @click="closeModal"/>
                <input type="button" class="btn btn-md btn-theme" :value="$t('common.confirm')" @click="sureEdit"/>
            </template>
        </modal>
    </div>
</template>

<script>
import {WechatApiV1} from '@/api';
import uploadId from './upload-documents.vue';

export default {
    name: 'category-editor',
    data() {
        return {
            allCategories: [], //所有可设置的类目
            hasCategories: [],//已设置的类目
            firstCategories: [],//所有可设置的一级类目
            secondCategories: [],//所有可设置的二级类目
            certicates: [],//资质信息列表。如果需要资质的类目，则该字段必填
            loading: true,
        };
    },
    props: {
        appid: {//小程序appid
            type: [Number, String]
        }
    },
    components: {
        uploadId,
    },
    mounted() {
        this.getAllCategories();

    },
    methods: {
        //将一维类目数据转成树形结构
        listToTree(data) {
            let arr = JSON.parse(JSON.stringify(data));
            const listChildren = (obj, filter) => {
                [arr, obj.child] = arr.reduce((res, val) => {
                    if (filter(val))
                        res[1].push(val);
                    else
                        res[0].push(val);
                    return res;
                }, [[], []]);
                obj.child.forEach(val => {
                    if (arr.length)
                        listChildren(val, obj => obj.father === val.id);
                });
            };
            const tree = {};
            listChildren(tree, val => arr.findIndex(i => i.id === val.father) === -1);
            return tree.child;
        },
        // //查询可设置的所有类目
        getAllCategories() {
            WechatApiV1
                .getAllCategory(this.appid)
                .then((res) => {
                    let categories = res.body.data.categories;
                    this.allCategories = this.listToTree(categories)[0].child;//一维数据转换成树形结构
                    this.findHasCategory();
                });
        },
        //查询已设置的类目
        findHasCategory() {
            this.loading = true;
            WechatApiV1
                .findHasCategory(this.appid)
                .then((res) => {
                    let arr = res.body.data.categories;
                    this.hasCategories = arr.length > 0 ? arr : [{
                        first: '',
                        second: '',
                        certicates: [],
                        sensitive_type: ''
                    }];
                    this.loading = false;
                });
        },
        //选择一类类目
        selectFirst(index, item, e) {
            item.first = e.id;
            item.second = '';
            item.certicates = [];
            item.sensitive_type = '';
        },
        //选择二级类目
        selectSecond(index, item, e) {
            this.hasCategories.forEach((hasCate, x) => {//校验不可重复选择二级类目
                if (hasCate.second === e.id && x !== index) {
                    this.hasCategories[index].second = '';
                }
            });
            item.certicates = [];
            item.sensitive_type = e.sensitive_type;
            if (e.sensitive_type === 1) {//1 为敏感类目，需要提供相应资质审核；0 为非敏感类目，无需审核
                let exterList = e.qualify.exter_list;
                exterList.forEach(exter => {
                    exter.inner_list.forEach(inner => {
                        let obj = {key: '', value: ''};
                        obj.key = inner.name;
                        obj.value = '';
                        item.certicates.push(obj);
                    });
                });
                if (this.$refs['uploadId' + index]) {
                    this.$refs['uploadId' + index].forEach(it => {
                        it.resetName();
                    });
                }
            }
        },
        //筛选对应的二级类目
        optionalCate(id, data) {
            if (!id) return [];
            let arr = [];
            arr = data.filter(item => item.id === id);
            return arr[0].child;
        },
        //取消编辑
        closeModal() {
            this.$emit('cancelEditCategory');
        },
        //确定编辑
        sureEdit() {
            const FirstCheck = this.hasCategories.every(item => {
                return item.first !== '';
            });
            if (!FirstCheck) return this.$toast(this.$t('microPage.selectFirst'), 'warn');
            const secondCheck = this.hasCategories.every(item => {
                return item.second !== '';
            });
            if (!secondCheck) return this.$toast(this.$t('microPage.selectSecond'), 'warn');
            let cateCheck = null;
            let noCateCheck = '';
            this.hasCategories.map(cate => {
                if (cate.certicates && cate.certicates.length > 0) {
                    cateCheck = cate.certicates.every( key => {
                        return key.value !== '';
                    });
                }
            });
            if (cateCheck || cateCheck === null) noCateCheck = true;
            if (!noCateCheck) return this.$toast(this.$t('microPage.photoQualify'), 'warn');
            WechatApiV1
                .updateCategory(this.appid, this.hasCategories)
                .then(() => {
                    this.$toast(this.$t('common.successOperate'), 'success');
                    this.$emit('getMiniDetail');
                });
        },
        //添加一项类目
        addOneCate() {
            let obj = {first: '', second: '', certicates: [], sensitive_type: ''};
            this.hasCategories.push(obj);
        },
        //删除一个类目
        delCategories(index) {
            this.hasCategories.splice(index, 1);
        },
        //或者资质照片信息
        getMaterial(e, inner) {
            inner.value = e.mediaId;
        },
    }
};
</script>

<style lang="scss" type="text/scss">
@import "../../common/scss/base/_variables.scss";
@import "../../common/scss/base/_mixin.scss";

.category-modal {
    .service-category {
        .about-category {
            color: $color-light-content;
        }

        .category-list {
            margin-left: 130px;

            ul {
                li {
                    margin-bottom: 10px;
                }
            }

            svg {
                width: 16px;
                height: 16px;
                vertical-align: middle;
            }
        }
    }

}

</style>
