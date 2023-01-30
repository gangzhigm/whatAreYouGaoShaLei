<template>
    <div class="additionalRequiredFields">
        <h3>{{$t('form.additionalRequiredFields')}}</h3>
        <p class="light-content-text">{{$t('form.additionalRequiredFieldsTips')}}</p>
        <shuttle-box v-bind="shuttleInfo" v-model="selectedFields" />
        <button type="button" class="btn btn-md btn-theme" @click="save">{{'common.save' | t}}
        </button>
    </div>
</template>
<script>
import { QuestionnaireApiV1 } from '@/api';

export default ({
    name: 'AdditionalRequiredFields',
    computed: {
        shuttleInfo () {
            return {
                titles: [this.$t('form.formField'), this.$t('form.additionalRequiredFields')],
                dataList: this.allAttrs,
                selectedVal: this.selectedFields,
                search: true
            };
        }
    },
    data () {
        return {
            allAttrs: [], // 全部用户属性
            selectedFields: '',   // 右边，已选择列 id
        };
    },
    mounted () {
        this.getSelectList();
    },
    methods: {
        save () {
            let fields = [];
            if (this.selectedFields) {
                const ids = this.selectedFields.split(',');
                ids.map(e => {
                    fields.push(this.allAttrs[e].field);
                });
            }

            const id = this.$route.query.id;
            QuestionnaireApiV1
                .additionalRequiredCheck(fields, id)
                .then((res) => {
                    if (res.body.code === 200) {
                        this.$toast(this.$t('common.saveSuccess'), 'success');
                    } else {
                        this.$toast(res.body.message, 'warn');
                    }
                });
        },
        getSelectList () {
            const id = this.$route.query.id;
            QuestionnaireApiV1
                .getAdditionalRequired(id)
                .then(({ body: { data: { questionsList } } }) => {
                    // 所有属性列表
                    this.allAttrs = questionsList.map((q,i) => Object.assign({}, q, {
                        id: i,
                        name: q.fieldName
                    }));
                    // 已选的列数据 
                    questionsList.forEach((e,i) =>{
                        if (e.additionalRequiredCheck) this.selectedFields += i + ',';
                    });
                    if (this.selectedFields) this.selectedFields = this.selectedFields.replace(/,$/gi,'');
                });
        }
    }
});
</script>

<style type="text/scss" lang="scss">
.additionalRequiredFields {
    .light-content-text {
        padding: 15px 0;
    }
    .shuttle-box {
        line-height: 32px;
    }
    button {
        margin-top: 20px;
    }
}
</style>