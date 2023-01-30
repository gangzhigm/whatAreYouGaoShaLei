/**
 * 开发脚本
 */
const LINKS = require('./src/LINKS');
const ROOT_DIST = '/dist';              // 所有资源会被打包至此
const STATIC_DIST = ROOT_DIST + '/static/'; // 除html外文件打包至此
const STATIC_PREFIX = LINKS.WEB_BASE + '/static/';           // html内引用静态资源的前缀, '/static/'或是'http://cdn.xxx.com/mystatic/'

const path = require('path');
const webpack = require('webpack');
const HardSourceWebpackPlugin = require('hard-source-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const HtmlWebpackHarddiskPlugin = require('html-webpack-harddisk-plugin');
const styleLintPlugin = require('stylelint-webpack-plugin');
const {VueLoaderPlugin} = require('vue-loader');
const HappyPack = require('happypack');
const happyThreadPool = HappyPack.ThreadPool({ size: 6 });  // 用于检索工作线程的预定义线程池
const threadLoader = require('thread-loader');
const WebpackBar = require('webpackbar');

if (!process.env.NODE_ENV) throw new Error('请设置NODE_ENV');

// Runs the following loaders in a worker pool.
threadLoader.warmup({
    workers: 4,
    workerParallelJobs: 50,
    poolRespawn: false,  // development shuold false
}, [
    'babel-loader',
    'vue-loader',
    'sass-loader',
    'eslint-loader',
    'url-loader'
]);

// eslint-disable-next-line no-console
console.log('webpacking for', process.env.NODE_ENV);

module.exports = {
    mode: 'development',
    entry: path.join(process.cwd(), '/src/app.js'),
    resolve: {
        alias: {
            '@': path.resolve(__dirname, 'src/')
        }
    },
    output: {
        path: path.join(process.cwd() + STATIC_DIST),
        filename: '[name].js',
        publicPath: STATIC_PREFIX,
        chunkFilename: '[name].js'
    },
    devServer: {
        hot: true,
        historyApiFallback: true,
        host: '0.0.0.0',
        // open: true,
        compress: true,
        contentBase: path.join(process.cwd(), ROOT_DIST),
        proxy:{
            // 跨域配置，用于开发主APP时挂载beta服的子应用
            '/sub-apps':{
                target:'https://app-beta.dmartech.cn',
                ws:true,
                changeOrigin:true,//允许跨域
                // pathRewrie:{
                //     '^/sub-apps':''
                // }
            }
        }
    },

    /**
     * develop tool flags
     * */
    devtool: false,
    cache: true,

    optimization: {
        splitChunks: {
            cacheGroups: {
                vendor: {
                    name: 'vendor',
                    chunks: 'all',
                    test: /[\\/]node_modules[\\/]/
                }
            }
        },
        runtimeChunk: {
            name: 'runtime'
        }
    },

    /**
     * 此处配置公用插件, 开发和发版本不同配置的插件在上面
     */
    plugins: [
        new WebpackBar(),
        new webpack.SourceMapDevToolPlugin({}),

        // provide an intermediate caching step for modules.
        new HardSourceWebpackPlugin({
            environmentHash: {
                root: process.cwd(),
                directories: [],
                files: ['package.json', '.babelrc', '.eslintrc', '.stylelintrc', 'yarn.lock', 'webpack.conf.dev.js']
            }
        }),

        // make it easier to see which dependencies are being patched
        new webpack.NamedModulesPlugin(),

        new webpack.HotModuleReplacementPlugin(),

        new webpack.NoEmitOnErrorsPlugin(),

        new VueLoaderPlugin(),

        // This plugins defines various variables that we can set to false
        // in production to avoid code related to them from being compiled
        // in our final bundle
        new webpack.DefinePlugin({
            __SERVER__: true,
            __DEVELOPMENT__: true,
            __DEVTOOLS__: true,
            __DEV__: false,
            'process.env': {
                BABEL_ENV: JSON.stringify('development'),
                NODE_ENV: JSON.stringify(process.env.NODE_ENV),
                QIANKUN: process.env.QIANKUN ? JSON.stringify(process.env.QIANKUN) : undefined
            },
        }),

        new styleLintPlugin({
            configFile: path.join(__dirname, '/.stylelintrc'),
            quiet: false
        }),

        new HtmlWebpackPlugin({
            filename: path.join(process.cwd(), '/dist/index.html'),
            template: path.join(process.cwd(), '/src/template.html'),
            favicon: path.join(process.cwd(), '/src/favicon.ico'),
            inject: false,
            publicPath: LINKS.ORIGIN + LINKS.WEB_BASE,
            production: process.env.NODE_ENV === 'production' || process.env.NODE_ENV === 'beta',
            minify: {
                caseSensitive: true,
                collapseWhitespace: true
            },
            alwaysWriteToDisk: true
        }),

        new HtmlWebpackPlugin({
            filename: path.join(process.cwd(), '/dist/static/questionnaire-sample.html'),
            template: path.join(process.cwd(), '/src/journey/questionnaire/questionnaire-sample.html'),
            inject: false,
            publicPath: LINKS.ORIGIN + LINKS.WEB_BASE,
            QUESTIONNAIRE_API_BASE: LINKS.QUESTIONNAIRE_API_BASE,
            production: process.env.NODE_ENV === 'production' || process.env.NODE_ENV === 'beta',
            minify: {
                caseSensitive: true,
                collapseWhitespace: true
            },
            alwaysWriteToDisk: true
        }),

        new HtmlWebpackPlugin({
            filename: path.join(process.cwd(), '/dist/static/questionnaire-huawei.html'),
            template: path.join(process.cwd(), '/src/journey/questionnaire/questionnaire-huawei.html'),
            inject: false,
            publicPath: LINKS.ORIGIN + LINKS.WEB_BASE,
            QUESTIONNAIRE_API_BASE: LINKS.QUESTIONNAIRE_API_BASE,
            production: process.env.NODE_ENV === 'production' || process.env.NODE_ENV === 'beta',
            minify: {
                caseSensitive: true,
                collapseWhitespace: true
            },
            alwaysWriteToDisk: true
        }),

        new HtmlWebpackPlugin({
            filename: path.join(process.cwd(), '/dist/static/questionnaire-user.html'),
            template: path.join(process.cwd(), '/src/journey/questionnaire/questionnaire-user.html'),
            inject: false,
            publicPath: LINKS.ORIGIN + LINKS.WEB_BASE,
            QUESTIONNAIRE_API_BASE: LINKS.QUESTIONNAIRE_API_BASE,
            production: process.env.NODE_ENV === 'production' || process.env.NODE_ENV === 'beta',
            minify: {
                caseSensitive: true,
                collapseWhitespace: true
            },
            alwaysWriteToDisk: true
        }),
        new HtmlWebpackHarddiskPlugin(),

        new HappyPack({
            id: '1',
            threadPool: happyThreadPool,
            loaders: ['babel-loader']
        }),

        new HappyPack({
            id: '2',
            threadPool: happyThreadPool,
            loaders: [
                'style-loader',
                'css-loader'
            ]
        })
    ],


    /**
     * loaders
     */
    module: {
        rules: [
            // font loader
            {
                test: /\.(woff|woff2|eot|ttf|otf)$/i,
                loader: 'url-loader',
                options: {
                    name: 'fonts/[name].[ext]'
                }
            },
            {
                test: /(\.vue|\.js)$/,
                enforce: 'pre',
                include: path.join(process.cwd() + '/src'),
                loader: 'eslint-loader',
                options: {
                    env: {
                        'es6': true
                    }
                }
            },
            {
                test: /\.md$/i,
                use: [
                    'vue-loader',
                    'vue-md-loader'
                ]
            },
            // js loader  缩小构建目标
            {
                test: /\.js$/,
                loader: 'happypack/loader?id=1',
                exclude: /node_modules/,
                options: {
                    cacheDirectory: true,
                },
            },
            // vue loader > 15 happyPack 不支持
            {
                test: /\.vue$/i,
                exclude: /node_modules/,
                loader: 'vue-loader',
            },
            // css loader
            {
                test: /\.css$/,
                loader: 'happypack/loader?id=2',
            },
            // scss loader
            {
                test: /\.(sa|sc)ss$/,
                exclude: /node_modules/,
                use: [
                    {
                        loader: 'style-loader'
                    },
                    {
                        loader: 'css-loader'
                    },
                    {
                        loader: 'sass-loader',
                        options: {
                            implementation: require('sass') // 使用dart-sass代替node-sass
                        }
                    }
                ]
            },
            // less loader
            {
                test: /\.less$/,
                exclude: /node_modules/,
                use: [
                    'style-loader',
                    'css-loader',
                    'less-loader'
                ]
            },
            // 图片loader
            {
                test: /\.(jpe?g|gif|png|svg)$/i,
                loader: 'url-loader',
                options: {
                    limit: 10000,
                    name: 'images/[name].[ext]'
                }
            }
        ]
    }

};
