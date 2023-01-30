<template>
    <div class="wecom-material-editor">
        <div class="tabs-container">
            <!-- 插槽-用于在类型选择器插入自定义dom -->
            <slot></slot>
            <!-- 类型选择器radio组 -->
            <template v-for="tab in msgtypes">
                <radio :key="tab" :source="tab" :value="msgtype" :disabled="readonly" @input="handleType($event)">
                    {{allTypes.$getByKey(tab).name}}
                </radio>
            </template>
        </div>
        <div class="material-container">
            <!-- 素材编辑器容器 -->
            <component :is="componentsSet[msgtype]" :value="val" :readonly="readonly" @input="handleInput($event)"
                @uploading="uploading" ref="msgEditor" />
        </div>
    </div>
</template>

<script type="text/ecmascript-6">
import WecomText from './modules/wecom-text.vue';
import WecomImage from './modules/wecom-image.vue';
import WecomLink from './modules/wecom-link.vue';
import WecomMiniprogram from './modules/wecom-miniprogram.vue';

export default {
    name: 'WecomMaterialEditor',
    props: {
        // 当前类型下的素材对象
        val: {
            type: Object,
            default: () => ({})
        },
        // 当前选中素材类型
        msgtype: {
            type: String,
        },
        // 可选素材类型, 影响类型radio内容和顺序 ex. ['none', 'text', 'image', 'link', 'miniprogram']
        msgtypes: {
            type: Array,
            required: true,
        },
        // 只读模式
        readonly: {
            type: Boolean,
            default: false
        },
    },
    data () {
        const ALL_TYPES = [
            { id: 'none', name: this.$t('wecomComponents.none') },
            { id: 'text', name: this.$t('QRCode.text') },
            { id: 'image', name: this.$t('controller.image') },
            { id: 'link', name: this.$t('QRCode.url') },
            { id: 'miniprogram', name: this.$t('wecomComponents.applet') },
        ];
        const MSG_TEMPLATE = {
            none: null,
            text: { content: '' },
            image: { media_id: '' }, // media_id用于存取oss地址
            link: { title: '', picurl: '', desc: '', url: '' },
            miniprogram: { title: '', pic_media_id: '', appid: '', page: '' } // pic_media_id用于存取oss地址
        };
        const COMPONENTS_SET = { none: '', text: 'WecomText', image: 'WecomImage', link: 'WecomLink', miniprogram: 'WecomMiniprogram' };
        return {
            allTypes: ALL_TYPES, // 全部可用素材类型
            msgTemplate: MSG_TEMPLATE, // 空素材模板
            componentsSet: COMPONENTS_SET // 素材编辑器组件名配置
        };
    },
    created() {
        // 若消息对象未初始化，则自动选择可用类型的第一个
        if (!this.msgtype || !this.val) {
            this.handleType(this.msgtypes[0]);
        }
    },
    methods: {
        /**
         * @description 切换消息类型，初始消息内容，触发父级组件更新value
         * @param {string} type 选中的类型 'none', 'text','image','link','miniprogram'
         */
        handleType (type) {
            this.$emit('update:msgtype', type);
            // 切换类型并初始化素材内容
            this.$emit('update:val', this.msgTemplate[type]);
            // 触发父级的切换消息类型事件，需父级绑定方法以删除多余的key
            this.$emit('switch');
        },
        /**
         * @description 同一类型下，编辑消息内容，触发父级组件更新value
         * @param {object} val 事件参数，内容为当前value对象中，当前[msgtype]key对应的值 
         *  e.g. value: { msgtype: 'image', image: { media_id: '' } }, 事件参数返回 { media_id: '' } 
         */
        handleInput (val) {
            this.$emit('update:val', val);
            this.$forceUpdate(); // 强制更新视图
        },
        // 全局校验方法
        valid () {
            if (this.msgtype === 'none') {
                return true;
            }
            return this.$refs.msgEditor.valid();
        },
        // 图片上传中
        uploading(bool) {
            this.$emit('uploading', bool);
        }
    },
    components: { WecomText, WecomImage, WecomLink, WecomMiniprogram },
};
</script>

<style lang="scss" type="text/scss" rel="stylesheet/scss">
.wecom-material-editor {
    padding: 5px;
    background-color: #fff;
    overflow: hidden;
    .tabs-container {
        padding: 5px 0;
    }
    // 所有消息类型label宽度统一
    .material-container .form-field .label {
        width: 70px;
    }
    // 只读模式下的input内容显示样式
    .input-view {
        display: inline-block;
        width: 270px;
        vertical-align: top;
    }
    // 只读模式下的textarea内容显示样式
    .textarea-view {
        display: inline-block;
        width: 270px;
        max-height: 500px;
    }
}
</style>