import { defineConfig } from 'vite';
import { createVuePlugin } from 'vite-plugin-vue2';
const path = require('path');
// import vitePluginImportus from 'vite-plugin-importus';
import qiankun from 'vite-plugin-qiankun';
// import babel from 'vite-plugin-babel'; vue 2.7+ can use that
import Markdown from 'vite-plugin-vue-markdown';
import babel from 'vite-plugin-babel-compiler';

// https://vitejs.dev/config/
export default defineConfig({
    build: {
        // 自定义指定模板文件
        // input: {
        //     app: path.resolve(__dirname, 'src/template.html')
        // },
        assetsDir: 'static',
        loader: 'jsx'
    },
    resolve: {
        alias: {
            '@': path.resolve(__dirname, 'src/')
        }
    },
    plugins: [
        babel({}),
        createVuePlugin({
            jsx: true,
            include: [/\.vue$/, /\.md$/]
        }),
        // vitePluginImportus([{
        //     libraryName: 'lodash'
        // }]),
        qiankun({ packageName: 'homeApp' }),
        // 在组件中使用md文档
        Markdown()
    ],
    define: {
        'process.env': process.env,
    },
    server: {
        port: 8080,
        proxy:{
            // 跨域配置，用于开发主APP时挂载beta服的子应用
            '/sub-apps':{
                target: 'https://app-beta.dmartech.cn',
                ws: true,
                changeOrigin: true,//允许跨域
            }
        }
    }
});