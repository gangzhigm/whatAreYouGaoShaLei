/**
 * 发布脚本
 */
const LINKS = require('./src/LINKS');
const ROOT_DIST = '/dist';              // 所有资源会被打包至此
const STATIC_DIST = ROOT_DIST + '/static/'; // 除html外文件打包至此
const STATIC_PREFIX = LINKS.WEB_BASE + '/static/';           // html内引用静态资源的前缀, '/static/'或是'http://cdn.xxx.com/mystatic/'

const path = require('path');
const webpack = require('webpack');
const CleanPlugin = require('clean-webpack-plugin');
const HardSourceWebpackPlugin = require('hard-source-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const styleLintPlugin = require('stylelint-webpack-plugin');
const {VueLoaderPlugin} = require('vue-loader');
const UglifyJsPlugin = require('uglifyjs-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const OptimizeCSSAssetsPlugin = require('optimize-css-assets-webpack-plugin');

const { GitRevisionPlugin } = require('git-revision-webpack-plugin');
const gitRevisionPlugin = new GitRevisionPlugin();
const buildDate = JSON.stringify(new Date().toLocaleString());

if (!process.env.NODE_ENV) throw new Error('请设置NODE_ENV');
// eslint-disable-next-line no-console
console.log('webpacking for', process.env.NODE_ENV);
module.exports = {
    mode: 'production',
    entry: path.join(process.cwd(), '/src/app.js'),
    resolve: {
        alias: {
            '@': path.resolve(__dirname, 'src/')
        }
    },
    output: {
        path: path.join(process.cwd() + STATIC_DIST),
        filename: `[name].[chunkhash:6]${new Date().getTime()}.js`,
        publicPath: STATIC_PREFIX,
        chunkFilename: `[name].[chunkhash:6]${new Date().getTime()}.js`
    },

    /**
     * develop tool flags
     * */
    devtool: false,
    cache: false,

    optimization: {
        splitChunks: {
            chunks: 'all',
            minSize: 0,
            cacheGroups: {
                styles: {
                    name: 'styles',
                    test: /\.css$/,
                    chunks: 'all',
                    enforce: true
                },
                default: {
                    name: 'common',
                    chunks: 'initial',
                    minChunks: 2,
                    priority: -20,
                    reuseExistingChunk: true,
                },
                vendor: {
                    name: 'vendor',
                    chunks: 'all',
                    test: /[\\/]node_modules[\\/]/
                }
            }
        },
        minimizer: [
            new UglifyJsPlugin({
                cache: true,
                parallel: true,
                sourceMap: 'production' !== process.env.NODE_ENV // set to true if you want JS source maps
            }),
            new OptimizeCSSAssetsPlugin({})
        ]
    },
    performance: {

        hints: 'warning', // 枚举

        maxAssetSize: 300000, // 整数类型（以字节为单位）

        maxEntrypointSize: 500000, // 整数类型（以字节为单位）

        assetFilter: function(assetFilename) {

            // 提供资源文件名的断言函数

            return assetFilename.endsWith('.css') || assetFilename.endsWith('.js');

        }

    },
    plugins: [

        // Cleanup the destination folder before compiling our final assets
        new CleanPlugin(),

        ...(process.env.NODE_ENV === 'beta' ? [new webpack.SourceMapDevToolPlugin({})] : []),

        // provide an intermediate caching step for modules.
        new HardSourceWebpackPlugin({
            environmentHash: {
                root: process.cwd(),
                directories: [],
                files: ['package.json', '.babelrc', '.eslintrc', '.stylelintrc', 'yarn.lock', 'webpack.conf.pro.js']
            }
        }),

        // Assign the module and chunk ids by occurrence count. Ids that are used often get lower (shorter) ids.
        // This make ids predictable, reduces total file size and is recommended.
        // preferEntry (boolean) give entry chunks higher priority. This make entry chunks smaller but increases the overall size. (recommended)
        new webpack.optimize.OccurrenceOrderPlugin(true/*preferEntry*/),

        // 抽取组件外的样式到main.[hash:6].css 以便浏览器缓存,
        new MiniCssExtractPlugin({
            filename: `[name].[contenthash:9]${new Date().getTime()}.css`,
            chunkFilename: `[name].[contenthash:9]${new Date().getTime()}.css`
        }),

        new VueLoaderPlugin(),

        // This plugins defines various variables that we can set to false
        // in production to avoid code related to them from being compiled
        // in our final bundle
        new webpack.DefinePlugin({
            __SERVER__: false,
            __DEVELOPMENT__: false,
            __DEVTOOLS__: false,
            __DEV__: false,
            'process.env': {
                BABEL_ENV: JSON.stringify(process.env.NODE_ENV),
                NODE_ENV: JSON.stringify(process.env.NODE_ENV),
                VERSION: JSON.stringify(gitRevisionPlugin.version()),
                COMMITHASH: JSON.stringify(gitRevisionPlugin.commithash()),
                BRANCH: JSON.stringify(gitRevisionPlugin.branch()),
                LASTCOMMITDATETIME: JSON.stringify(gitRevisionPlugin.lastcommitdatetime()),
                BUILD_DATE: buildDate
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
            production: process.env.NODE_ENV === 'production' || process.env.NODE_ENV === 'beta'
                || process.env.NODE_ENV === 'devbuild',
            minify: {
                caseSensitive: true,
                collapseWhitespace: true,
                removeComments: true,
                minifyJS: true
            }
        }),

        new HtmlWebpackPlugin({
            filename: path.join(process.cwd(), '/dist/static/questionnaire-sample.html'),
            template: path.join(process.cwd(), '/src/journey/questionnaire/questionnaire-sample.html'),
            inject: false,
            publicPath: LINKS.ORIGIN + LINKS.WEB_BASE,
            QUESTIONNAIRE_API_BASE: LINKS.QUESTIONNAIRE_API_BASE,
            production: process.env.NODE_ENV === 'production',
            minify: {
                caseSensitive: true,
                collapseWhitespace: true,
                removeComments: true,
                minifyJS: true
            }
        }),

        new HtmlWebpackPlugin({
            filename: path.join(process.cwd(), '/dist/static/questionnaire-huawei.html'),
            template: path.join(process.cwd(), '/src/journey/questionnaire/questionnaire-huawei.html'),
            inject: false,
            publicPath: LINKS.ORIGIN + LINKS.WEB_BASE,
            QUESTIONNAIRE_API_BASE: LINKS.QUESTIONNAIRE_API_BASE,
            production: process.env.NODE_ENV === 'production',
            minify: {
                caseSensitive: true,
                collapseWhitespace: true,
                removeComments: true,
                minifyJS: true
            }
        }),

        new HtmlWebpackPlugin({
            filename: path.join(process.cwd(), '/dist/static/questionnaire-user.html'),
            template: path.join(process.cwd(), '/src/journey/questionnaire/questionnaire-user.html'),
            inject: false,
            publicPath: LINKS.ORIGIN + LINKS.WEB_BASE,
            QUESTIONNAIRE_API_BASE: LINKS.QUESTIONNAIRE_API_BASE,
            production: process.env.NODE_ENV === 'production',
            minify: {
                caseSensitive: true,
                collapseWhitespace: true
            },
            alwaysWriteToDisk: true
        }),
        new webpack.optimize.MinChunkSizePlugin({
            minChunkSize: 5120, // ~5kB
        })
    ],


    /**
     * loaders
     */
    module: {
        rules: [
            {
                test: /\.(vue|js)$/,
                enforce: 'pre',
                include: path.join(process.cwd() + '/src'),
                loader: 'eslint-loader',
                options: {
                    env: {'es6': true}
                }
            },
            {
                test: /\.md$/i,
                use: [
                    'vue-loader',
                    'vue-md-loader'
                ]
            },
            // js loader
            {
                test: /\.js$/,
                loader: 'babel-loader',
                include: [
                    path.join(process.cwd() + '/src'),
                ]
            },
            // vue loader
            {
                test: /\.vue$/i,
                loader: 'vue-loader',
            },
            // scss loader
            {
                test: /\.css$/,
                loader: [
                    MiniCssExtractPlugin.loader,
                    'css-loader'
                ]
            },
            // scss loader
            {
                test: /\.(sa|sc)ss$/,
                use: [
                    {
                        loader: MiniCssExtractPlugin.loader
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
                loader: [
                    MiniCssExtractPlugin.loader,
                    'css-loader',
                    'less-loader'
                ]
            },
            // 图片loader
            {
                test: /\.(jpe?g|gif|svg|png)$/i,
                loader: 'url-loader',
                options: {
                    limit: 1024,
                    name: 'images/[name].[hash:4].[ext]'
                }
            },
            // font loader
            {
                test: /\.(woff|woff2|eot|ttf|otf)$/i,
                loader: 'url-loader',
                options: {
                    limit: 5280,
                    name: 'fonts/[name].[hash:4].[ext]'
                }
            }
        ]
    }
};
