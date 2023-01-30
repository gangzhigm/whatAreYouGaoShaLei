<template>
    <div class="select-preview">
        <div class="title">
            <span>{{'controller.selectUrl' | t}}</span>
            <i class="icon icon-close" @click.stop="closeModal()"></i>
        </div>
        <div class="preview-content-wrapper">
            <div class="preview-wrapper" v-html="HTMLContent" ref="HTMLWrapper"></div>
            <div class="link-wrapper" v-if="links.length">
                <div class="title">{{'controller.urlList' | t}}</div>
                <ul class="link-list">
                    <li v-for="(link,index) in links" class="href">
                        {{link.href}}as;ldfkjasldkfasldkjfhalsjkdfhaopweiufhlkajsdfklawje
                        <i class="icon icon-round-close" @click.stop="deleteLink(link, index)"></i>
                    </li>
                </ul>
            </div>
            <div class="link-wrapper" v-else>
                <div class="img">
                    <img src="../nolist.png">
                </div>
            </div>
        </div>
        <button class="btn btn-md btn-theme" @click.stop="commitSelect()">{{'common.confirm' | t}}</button>
    </div>
</template>

<script type="text/ecmascript-6">
    import { JourneyMaterialApiV1 } from '@/api';
    export default {
        props: {
            materialId: Number,
            selectLinks: Array
        },
        data() {
            return {
                HTMLContent: '',
                links: [],
            };
        },
        created() {
            if (this.selectLinks.length) {
                this.links = this.selectLinks;
            }
            this.getMaterialHTML();
        },
        methods: {
            closeModal() {
                this.$emit('close');
            },
            searchInLinks(target) {
                let flag = false;

                for (let link of this.links) {
                    if (target.href === link.target.href) {
                        flag = true;
                    }
                }
                return flag;
            },
            operateHTMLContent() {
                let htmlWrapper = this.$refs.HTMLWrapper;
                htmlWrapper.addEventListener('click', (e) => {
                    e.preventDefault();
                    for (let node of e.path) {
                        if (node.tagName === 'A') {
                            if (node.href === '') {
                                this.$toast(this.$t('controller.urlEmpty'));
                                return;
                            }
                            if (this.searchInLinks(node)) {
                                this.$toast(this.$t('controller.urlSelected') + ' ' + node.attributes[0].value);
                                return;
                            }
                            let temp = {target: node, href: node.getAttribute('href')};
                            this.links.push(temp);
                        } else if (node.tagName === 'TD') {
                            return;
                        }
                    }
                });
            },
            deleteLink(e, index) {
                this.links.splice(index, 1);
            },
            commitSelect() {
                this.$emit('commitSelect', this.links);
                this.closeModal();
            },
            // 以下是 ajax
            getMaterialHTML() {
                JourneyMaterialApiV1.getEmailHtml(this.materialId).then((res) => {
                    this.HTMLContent = res.body.data.materialContent;
                });
            }
        },
        watch: {
            HTMLContent() {
                this.operateHTMLContent();
            },
        }
    };
</script>

<style lang="scss" scoped>
    @import "../../../../../../../../common/scss/base/variables";
    @import "../../../../../../../../common/scss/base/mixin";
    .select-preview {
        position: fixed;
        left: 0;
        top: 0;
        z-index: 20;
        overflow: hidden;
        width: 1000px;
        height: 588px;
        border-radius: 5px;
        background: white;
        .title {
            box-sizing: border-box;
            padding: 0 20px;
            height: 47px;
            line-height: 47px;
            border-bottom: 1px solid $border-color;
            font-weight: bold;
            span {
                float: left;
                font-size: 14px;
            }
            .icon {
                float: right;
                font-size: 12px;
                color: $color-light-content;
                cursor: pointer;
            }
        }
        .preview-content-wrapper {
            width: 927px;
            height: 435px;
            border: 1px solid $border-color;
            margin: 11px auto 20px auto;
            .preview-wrapper {
                float: left;
                width: 578px;
                height: 100%;
                overflow-y: auto;
                border-right: 1px solid $border-color;
            }
            .link-wrapper {
                float: left;
                box-sizing: border-box;
                padding: 10px;
                .title {
                    width: 325px;
                    height: 42px;
                    line-height: 42px;
                    font-size: 14px;
                    background: #f1f1f1;

                }
                .img {
                    width: 328px;
                    height: 100%;
                    text-align: center;
                    line-height: 435px;
                }
                .link-list {
                    box-sizing: border-box;
                    padding: 0 12px;
                    li {
                        font-size: 14px;
                        line-height: 32px;
                        height: 32px;
                        span {
                            display: inline-block;
                            @include ellipsis();
                        }
                        .href {
                            text-align: left;
                            width: 255px;
                        }
                        .icon {
                            line-height: 32px;
                            color: $color-light-content;
                            vertical-align: text-bottom;
                            cursor: pointer;
                            &:hover {
                                color: $color-light-content;
                            }
                        }
                    }
                }
            }
        }
        button {
            float: right;
            margin-right: 36px;
        }
    }
</style>
