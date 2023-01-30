<template>
    <div class="imgText-list">
        <h4 class="title">{{'wechatContent.appList' | t}}</h4>
        <p class="light-content-text one-item" v-if="singleTip">{{singleTip | t}}</p>
        <ul class="materials">
            <li v-for="(material, index) in materials" @click="choose(material)"
                :class="{active: material.id === activeId, bad: material.invalid}">
                <img :src="material.thumbMediaUrl"/>
                <div class="imgText-title">{{material.title}}</div>
                <div class="edit">
                    <img class="sorter" src="./images/up.png" @click.stop="up(index)" v-if="index !== 0" :title="$t('wechatContent.moveUp')">
                    <img class="sorter" src="./images/down.png" @click.stop="down(index)" :title="$t('wechatContent.moveDown')"
                         v-if="index !== materials.length - 1">
                    <span class="icon icon-delete" @click.stop="deleteMaterial(material)"
                          v-if="index !== 0" :title="$t('common.del')"></span>
                </div>
            </li>
            <li class="add" @click="addMaterial" v-if="materials.length < 8 && !singleTip">
                <span></span>
            </li>
        </ul>
    </div>
</template>
<script type="text/babel">

    import {ADD_NEW_MATERIAL, DELETE_A_SUB_MATERIAL, MATERIAL_STORE, SORT_DOWN, SORT_UP} from '@/store/vuex/modules/imgTextStore';
    import { mapState, mapMutations, mapActions } from 'vuex';
    import {computeWordsLength} from '@/common/utils/mixin';
    import cloneDeep from 'lodash/cloneDeep';

    export default {
        props: {
            id: {
                type: Number
            },
            material: {
                type: Object
            }
        },
        computed: {
            ...mapState({
                activeId: state => state[MATERIAL_STORE].activeId,
                materials: state => state[MATERIAL_STORE].materials,
                isActive: state => state[MATERIAL_STORE].isActive
            }),
            singleTip() {
                return this.$route.query.singleTip;
            }
        },
        watch: {
            isActive(val) {
                if (val) {
                    this.$loading();
                } else {
                    this.$loaded();
                }
            }
        },
        methods: {
            ...mapMutations([
                DELETE_A_SUB_MATERIAL
            ]),
            ...mapActions([
                ADD_NEW_MATERIAL,
                SORT_UP,
                SORT_DOWN
            ]),
            choose(material) {
                this.$emit('choose', material);
            },
            // 删除素材
            deleteMaterial(material) {
                this.$confirm(this.$t('common.delete'), this.$t('wechatContent.deleteConfirm'))
                    .then(sure => {
                        if (sure) this.DELETE_A_SUB_MATERIAL(material.id);
                        this.choose(this.materials[0]);
                    });
            },
            up(index) {
                if (this.isActive) return;
                if (this.material.title === undefined) {
                    this.$toast(this.$t('wechatContent.titleReg'));
                    this.saving = false;
                    return;
                }
                if (this.material.title.length > 64 || this.material.title.length === 0) {
                    this.$toast(this.$t('wechatContent.titleReg'));
                    this.saving = false;
                    return;
                }
                if (this.material.author !== undefined) {
                    if (computeWordsLength(this.material.author) > 16) {
                        this.$toast(this.$t('wechatContent.authorReg'));
                        this.saving = false;
                        return;
                    }
                }
                if (this.material.thumbMediaUrl === undefined || this.material.thumbMediaUrl === '') {
                    this.$toast(this.$t('wechatContent.covernotEmpty'));
                    this.saving = false;
                    return;
                }
                if (!this.material.content || this.material.content === '<p><br></p>') {
                    this.$toast(this.$t('wechatContent.inputContent'));
                    this.saving = false;
                    return;
                }
                const saveMaterial = cloneDeep(this.material);
                this.SORT_UP({index, id: this.id, material: saveMaterial});
            },
            down(index) {
                if (this.isActive) return;
                if (this.material.title === undefined) {
                    this.$toast(this.$t('wechatContent.titleReg'));
                    this.saving = false;
                    return;
                }
                if (this.material.title.length > 64 || this.material.title.length === 0) {
                    this.$toast(this.$t('wechatContent.titleReg'));
                    this.saving = false;
                    return;
                }
                if (this.material.author !== undefined) {
                    if (computeWordsLength(this.material.author) > 16) {
                        this.$toast(this.$t('wechatContent.authorReg'));
                        this.saving = false;
                        return;
                    }
                }
                if (this.material.thumbMediaUrl === undefined || this.material.thumbMediaUrl === '') {
                    this.$toast(this.$t('wechatContent.covernotEmpty'));
                    this.saving = false;
                    return;
                }
                if (!this.material.content || this.material.content === '<p><br></p>') {
                    this.$toast(this.$t('wechatContent.inputContent'));
                    this.saving = false;
                    return;
                }
                const saveMaterial = cloneDeep(this.material);
                this.SORT_DOWN({index, id: this.id, material: saveMaterial});
            },
            addMaterial() {
                this.ADD_NEW_MATERIAL();
            }
        }
    };
</script>
<style lang="scss" type="text/scss" rel="stylesheet/scss">

    @import '../../../common/scss/base/variables';
    @import '../../../common/scss/base/mixin';

    .imgText-list {
        position: absolute;
        left: calc(50vw - 600px);
        top: 0;
        width: 205px;
        @include box-sizing();
        margin-bottom: 80px;
        padding: 10px;
        background-color: white;

        .title {
            font-size: 14px;
            font-weight: 400;
            color: $color-light-content;
        }
        .one-item {
            margin-bottom: 1em;
        }
        .materials {
            max-height: 751px;
            overflow-y: scroll;
            li {
                position: relative;
                width: 100%;
                height: 100px;
                margin-bottom: 5px;
                padding: 4px;
                @include box-sizing();
                border: 2px solid $border-color;
                overflow: hidden;
                @include user-select(none);

                &.active {
                    border-color: $dark-green;
                    padding: 4px;
                }
                &.bad {
                    border-color: $red;
                    background-color: $light-red;
                    @include box-shadow(0 0 5px $red);
                }

                &:hover {
                    cursor: pointer;
                    .edit {
                        display: block;
                    }
                }

                &:first-of-type {
                    height: auto;
                    min-height: 130px;
                    max-height: 160px;

                }

                img {
                    display: block;
                    margin: auto;
                    height: auto;
                    width: auto;
                    max-width: 100%;
                    max-height: 100%;
                }

                .imgText-title {
                    position: absolute;
                    left: 4px;
                    right: 4px;
                    bottom: 0;
                    height: 30px;
                    padding: 0 10px;
                    border-bottom: 4px solid white;
                    line-height: 30px;
                    color: white;
                    @include ellipsis();
                    background: rgba(0, 0, 0, .4);
                }

                .edit {
                    @include box-sizing();
                    position: absolute;
                    left: 0;
                    bottom: 0;
                    height: 40px;
                    padding: 10px;
                    width: 100%;
                    display: none;
                    background: rgba(0, 0, 0, .5);

                    // up and down arrow button
                    .sorter {
                        margin: 2px;
                        float: left;
                        width: 16px;
                        height: 16px;
                        opacity: .7;

                        &:hover {
                            opacity: 1;
                        }
                    }

                    span {
                        float: right;
                        width: 20px;
                        height: 20px;
                        line-height: 20px;
                        text-align: center;
                        color: #fff;
                        font-size: 16px;
                    }
                }
            }

            .add {
                position: relative;
                border: 1px dashed $border-color;

                &:after,
                &:before {
                    content: '';
                    position: absolute;
                    top: 50%;
                    left: 50%;
                    margin-left: -1px;
                    margin-top: -20px;
                    width: 2px;
                    height: 40px;
                    background: $color-light-content;
                }

                &:before {
                    @include transform(rotate(90deg));
                }
            }
        }
    }
</style>
