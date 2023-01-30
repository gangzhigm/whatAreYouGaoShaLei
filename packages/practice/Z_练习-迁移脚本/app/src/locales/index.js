import Vue from 'vue';
import {ADD_A_TRANSLATION, SET_LANGUAGE} from '@/store/vuex/mutationTypes';
import {LOAD_LANGUAGE, RECOVER_LANGUAGE} from '@/store/vuex/actionTypes';


// 在子状态树上遍历查询对应翻译
export function translate(path) {
    let t = '';
    try {
        t = path.split('.')
            /*eslint-disable-next-line*/
            .reduce((subObj, key) => subObj[key], store.state);
        if (!t) {
            console.error('no translation for this key: ', path);
        }
    } catch (e) {
        console.error('no translation for this key: ', path);
    }
    return t;
}


export const LANGUAGE_PREFERENCE = 'LANGUAGE_PREFERENCE';
export const LANGUAGE_CHANGE = 'LANGUAGE_CHANGE';
export const I18N_STORE_NAME = 'i18n';

/**
 * vuex 多语言子状态树
 * @type {Object} 子状态树
 */
export const store = {
    state: {
        lang: ''
    },
    mutations: {
        [SET_LANGUAGE](state, {translations, lang}) {
            for (let i = 0; i < translations.length; i++) {
                const translation = translations[i]['default'] || translations[i];
                if (!translation.__name__) {
                    console.error('语言模块未命名', translation);
                    continue;
                }
                if (state[translation.__name__] && state.lang === lang) {
                    console.error('多语言模块重复命名: ', translation.__name__);
                } else {
                    Vue.set(state, translation.__name__, translation);
                }
            }
            state.lang = lang;
        },


        /**
         * 动态添加一条翻译记录到 vuex 子状态树中
         * @param state
         * @param {String} translationKey abc.def.tkey
         * @param {Object<String, String>} translationObj {en: 'English', 'zh-cn': '中文'}
         */
        [ADD_A_TRANSLATION](state, {translationKey, translationObj}) {
            const keys = translationKey.split('.');
            const lastKey = keys.pop();
            const translation = translationObj[store.state.lang];

            if (translation) {
                let targetObj = keys.reduce((targetObj, key) => {
                    if (!targetObj[key]) {
                        Vue.set(targetObj, key, {});
                    }
                    return targetObj[key];
                }, store.state);
                Vue.set(targetObj, lastKey, translation);
            }
        }
    },
    actions: {
        [LOAD_LANGUAGE](context, lang) {
            switch (lang) {
                case 'zh-CN':
                    localStorage.setItem(LANGUAGE_PREFERENCE, lang);
                    return import(/* webpackChunkName: "zh-CN" */'./lang/zh-CN').then(res => {
                        context.commit(SET_LANGUAGE, {translations: res['default'], lang});
                    });
                case 'en':
                    localStorage.setItem(LANGUAGE_PREFERENCE, lang);
                    return import(/* webpackChunkName: "en" */'./lang/en').then(res => {
                        context.commit(SET_LANGUAGE, {translations: res['default'], lang});
                    });
                default:
                    localStorage.setItem(LANGUAGE_PREFERENCE, 'zh-CN');
                    console.warn(`Try to use language: ${lang}, but no related translation found，fall back to Chinese now.`);
                    return import(/* webpackChunkName: "zh-CN" */'./lang/zh-CN').then(res => {
                        context.commit(SET_LANGUAGE, {translations: res['default'], lang});
                    });
            }
        },
        [RECOVER_LANGUAGE](context) {
            let lang = localStorage.getItem(LANGUAGE_PREFERENCE);
            lang = lang || getFirstBrowserLanguage();
            return context.dispatch(LOAD_LANGUAGE, lang);
        }
    }
};

const LANGUAGES_SUPPORT = Array.isArray(window.navigator.languages);

/**
 * https://stackoverflow.com/a/46514247/6611205
 * @return {String}
 */
export function getFirstBrowserLanguage() {
    const nav = window.navigator;
    let language;

    language = LANGUAGES_SUPPORT
        ? nav.languages[0]
        : (nav.language || nav.browserLanguage || nav.systemLanguage || nav.userLanguage);

    switch (true) {
        case /en(-\w{2})?/.test(language): // all en-* end up as 'en'
            return 'en';
        case /zh(-\w{2})?/.test(language): // all zh-* end up as 'zh-CN'
            return 'zh-CN';
    }
}


/**
 * vue plugin i18n
 */
export default {
    install(Vue) {
        Vue.prototype.$changeLang = function (lang) {
            if (store.state.lang !== lang) {
                localStorage.setItem(LANGUAGE_CHANGE, lang);
                this.$store.dispatch(LOAD_LANGUAGE, lang)
                    .then(() => {
                        location.reload();
                    });
            }
        };

        Vue.prototype.$t = translate;

        Vue.filter('t', translate);
    }
};
