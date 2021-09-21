const path = require('path');
const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin;
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const WebpackShellPluginNext = require('webpack-shell-plugin-next');
const fs = require('fs');
const util = require('util');
const dotenv = require('dotenv');

const commonConfig = require('./webpack.common.config');

const copyFileAsync = util.promisify(fs.copyFile);
const buildEnv = dotenv.config({ path: '.build.env' });

module.exports = {
    mode: 'production',
    entry: path.resolve(__dirname, 'src', 'index.tsx'),
    output: {
        path: path.resolve(__dirname, 'static'),
        filename: 'build.js',
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
        ],
    },
    plugins: [
        ...commonConfig.plugins,
        new MiniCssExtractPlugin({ filename: 'styles.css' }),
        new BundleAnalyzerPlugin({ analyzerMode: 'static' }),
        new WebpackShellPluginNext({
            onBuildEnd: {
                scripts: [
                    () =>
                        Promise.all([
                            copyFileAsync(
                                path.resolve(__dirname, 'static', 'build.js'),
                                path.resolve(buildEnv.parsed.SERVER_RES_DIR, 'build.js'),
                            ),
                            copyFileAsync(
                                path.resolve(__dirname, 'static', 'index.prod.html'),
                                path.resolve(buildEnv.parsed.SERVER_RES_DIR, 'index.html'),
                            ),
                            copyFileAsync(
                                path.resolve(__dirname, 'static', 'styles.css'),
                                path.resolve(buildEnv.parsed.SERVER_RES_DIR, 'styles.css'),
                            ),
                        ]),
                ],
                blocking: true,
            },
        }),
    ],
};
