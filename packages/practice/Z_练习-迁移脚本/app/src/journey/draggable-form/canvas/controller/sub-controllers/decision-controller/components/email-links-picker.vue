<template>
    <modal class="email-links-picker" :title="$t('controller.selectUrl')" @close="closeModal" size="lg">
        <div class="preview-content-wrapper">
            <div class="preview-wrapper" v-html="HTMLContent" ref="HTMLWrapper"></div>
            <div class="link-wrapper">
                <template v-if="links.length">
                    <div class="title">{{'controller.urlList' | t}}</div>
                    <ul class="link-list">
                        <li v-for="(link,index) in links">
                            <span class="href" :title="link.href">{{link.href}}</span>
                            <i class="icon icon-round-close action-icon"
                               @click.stop="deleteLink(link, index)"></i>
                        </li>
                    </ul>
                </template>
                <template v-else>
                    <div class="img">
                        <svg aria-hidden="true">
                            <use xlink:href="#icon-click"></use>
                        </svg>
                        {{'controller.clickToPick' | t}}
                    </div>
                </template>
            </div>
        </div>
        <template v-slot:buttons>
            <button class="btn btn-md btn-theme" @click="commitSelect">
                {{'common.confirm' | t}}
            </button>
        </template>
    </modal>
</template>

<script type="text/ecmascript-6">
    import cloneDeep from 'lodash/cloneDeep';
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
                this.links = cloneDeep(this.selectLinks);
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
                    if (target.getAttribute('href') === link.href) {
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
                JourneyMaterialApiV1.getEmailHtml(this.materialId)
                    .then((res) => {
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

<style lang="scss">
    @import "../../../../../../../common/scss/base/variables";
    @import "../../../../../../../common/scss/base/mixin";

    .email-links-picker {
        $height: 450px;

        .preview-content-wrapper {
            display: flex;
            align-items: stretch;
            height: 450px;
            border: 1px solid $border-color;
            @include clearfix();
        }

        .preview-wrapper {
            flex: 6;
            overflow-y: auto;
            border-right: 1px solid $border-color;
        }

        .link-wrapper {
            flex: 4;

            .title {
                padding: 0.5em 1em;
                height: $input-field-height;
                line-height: $input-field-height;
                font-size: 14px;
                background: $title-bg;
            }

            .img {
                display: block;
                margin: $height/3 auto 0;
                width: auto;
                height: auto;
                text-align: center;

                svg {
                    display: block;
                    width: 40px;
                    height: 40px;
                    fill: $color-light-content;
                    margin: 0 auto 16px;
                }
            }

            .link-list {
                padding: 8px;

                li {
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    line-height: $input-field-height;
                    height: $input-field-height;
                    padding: 0 12px;

                    &:hover {
                        background-color: $content-bg;
                    }

                    .href {
                        max-width: 30em;
                        @include ellipsis();
                    }
                }
            }
        }

    }
</style>
