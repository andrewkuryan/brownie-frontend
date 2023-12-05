const path = require('path');
const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin;
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const WebpackShellPluginNext = require('webpack-shell-plugin-next');
const HtmlMinimizerPlugin = require('html-minimizer-webpack-plugin');
const CopyPlugin = require('copy-webpack-plugin');
const fs = require('fs');
const util = require('util');
const dotenv = require('dotenv');

const commonConfig = require('./webpack.common.config');

const copyFileAsync = util.promisify(fs.copyFile);
const buildEnv = dotenv.config({ path: '.build.env' });

module.exports = {
    mode: 'production',
    entry: {
        build: path.resolve(__dirname, 'src', 'index.tsx'),
        progressIndicator: path.resolve(
            __dirname,
            'src',
            'components',
            'progressIndicator',
            'logic.ts',
        ),
    },
    output: {
        path: path.resolve(__dirname, 'static'),
        filename: '[name].js',
        library: {
            name: 'progressIndicator',
            type: 'window',
        },
    },
    resolve: {
        ...commonConfig.resolve,
    },
    module: {
        rules: [
            ...commonConfig.module.rules,
            {
                test: /\.styl$/,
                use: [MiniCssExtractPlugin.loader, 'css-loader', 'stylus-loader'],
            },
            {
                test: /\.html$/,
                type: 'asset/resource',
            },
        ],
    },
    optimization: {
        minimize: true,
        minimizer: [new HtmlMinimizerPlugin()],
    },
    plugins: [
        ...commonConfig.plugins,
        new MiniCssExtractPlugin({ filename: 'styles.css' }),
        new BundleAnalyzerPlugin({ analyzerMode: 'static' }),
        new CopyPlugin({
            patterns: [
                {
                    context: path.resolve(__dirname, 'static'),
                    from: './index.prod.html',
                },
            ],
        }),
        new WebpackShellPluginNext({
            onBuildEnd: {
                scripts: [
                    () =>
                        commonConfig
                            .onBuildEndScripts()
                            .then(() =>
                                Promise.all([
                                    copyFileAsync(
                                        path.resolve(
                                            __dirname,
                                            'static',
                                            'progressIndicator.js',
                                        ),
                                        path.resolve(
                                            buildEnv.parsed.SERVER_RES_DIR,
                                            'progressIndicator.js',
                                        ),
                                    ),
                                    copyFileAsync(
                                        path.resolve(__dirname, 'static', 'index.prod.html'),
                                        path.resolve(
                                            buildEnv.parsed.SERVER_RES_DIR,
                                            'index.html',
                                        ),
                                    ),
                                    copyFileAsync(
                                        path.resolve(__dirname, 'static', 'styles.css'),
                                        path.resolve(
                                            buildEnv.parsed.SERVER_RES_DIR,
                                            'styles.css',
                                        ),
                                    ),
                                ]),
                            ),
                ],
                blocking: true,
            },
        }),
    ],
};
