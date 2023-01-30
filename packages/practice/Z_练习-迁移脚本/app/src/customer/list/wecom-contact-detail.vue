<template>
    <div class="wecom-contact">
        <div class="contact-info">
            <img :src="wecomContact.wecomAvatar?wecomContact.wecomAvatar:avatarSrc">
            <div class="avatar-name">
                <p>{{wecomContact.wecomName}}</p>
                <p class="theme-text">@{{wecomContact.wecomCorpFullName}}</p>
            </div>
        </div>
        <div class="about-contact">
            <ul class="info-show">
                <li>
                    <span class="blue-text to-list" @click="viewStaffAbout('record')">
                        {{'contact.employees' | t}}({{wecomContact.wecomStaffList.length}}) >
                    </span>
                    <p class="list">
                        <span :class="staff.isFirst===1?'first-staff':'lost-staff'"
                              v-for="staff in wecomContact.wecomStaffList" :key="staff.id">
                            {{staff.name}}
                        </span>
                    </p>
                </li>
                <li>
                    <p class="theme-text">{{'contact.firstSource' | t}}</p>
                    <p class="list">{{wecomContact.wecomSource}}</p>
                </li>
                <li>
                    <span class="blue-text to-list" @click="viewStaffAbout('group')">
                        {{'contact.group' | t}}({{wecomContact.wecomGroupList.length}}) > </span>
                    <p class="list">
                        <span class="lost-staff" v-for="group in wecomContact.wecomGroupList" :key="group.id">
                            {{group.name || $t('contact.noGroupName')}}</span>
                    </p>
                </li>
                <li>
                    <p class="theme-text">{{'contact.code' | t}}</p>
                    <p class="list list-wrap">{{wecomContact.wecomChannelCode}}</p>
                </li>
            </ul>
        </div>
    </div>

</template>

<script>
    import avatarSrc from '../../setting/images/avatar.svg';

    export default {
        name: 'WecomContactDetail',
        data() {
            return {
                avatarSrc: avatarSrc,
            };
        },
        props: {
            wecomContact: {//企业微信联系人详情
                type: Object,
                default: {}
            }
        },
        methods: {
            viewStaffAbout(type) {
                this.$emit('viewStaffAbout', type);
            }
        }
    };
</script>

<style lang="scss">
    @import '../../common/scss/base/variables';
    @import '../../common/scss/base/mixin';

    .wecom-contact {
        width: 310px;
        padding: 16px 24px 24px;
        background: #fff;
        margin-left: 15px;

        .contact-info {
            border-bottom: 1px solid $border-color;
            padding-bottom: 10px;
            display: flex;

            img {
                width: 30px;
                height: 30px;
            }
            .avatar-name{
                margin-left: 10px;
            }
        }

        .about-contact {
            padding-top: 10px;

            .info-show {
                display: flex;
                flex-wrap: wrap;

                li {
                    box-sizing: border-box;
                    width: 50%;
                    padding: 0 10px;

                    .list {
                        margin: 10px 0;
                        max-height: 25px;
                        overflow: hidden;
                    }
                    .list-wrap {
                        overflow: visible;
                    }

                    .to-list {
                        cursor: pointer;
                    }
                }
            }

            .first-staff {
                color: #D9001B;
                border: 1px solid #D9001B;
            }

            .lost-staff {
                border: 1px solid #0BC1A9;
                color: #0BC1A9;
            }

            .first-staff, .lost-staff {
                border-radius: 15px;
                padding: 3px 10px;
                display: inline-block;
                max-width: 50px;
                overflow: hidden;
                white-space: nowrap;
                text-overflow: ellipsis;
                margin-right: 5px;
            }
        }
    }
</style>
