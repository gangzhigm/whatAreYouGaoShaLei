<template>
    <div :class="[type,'alert']">
        <div :class="[classNameRender,'icon']" v-if="showIcon"></div>
        <p v-html="message"></p>
    </div>
</template>
<script>

export default ({
    name: 'Alert',
    props: {
        type: {
            default: 'info',
            type: String
        },
        message: {
            default: '',
            type: String
        },
        showIcon: {
            default: false,
            type: Boolean
        },
    },
    computed: {
        classNameRender () {
            let className = '';
            switch (this.type) {
                case 'info':
                    className = 'icon-warn';
                    break;
                default:
                    className = 'icon-warn';
            }
            return className;
        }
    },
});
</script>
<style lang="scss" scoped>
.alert {
    width: 640px;
    padding: 10px;
    display: flex;
    align-items: center;
    .icon {
        font-size: 16px;
        margin-right: 10px;
    }
}
.info {
    border: 1px solid #95d7f4;
    background: #eaf9ff;
    .icon {
        color: #1296db;
    }
}
</style>
