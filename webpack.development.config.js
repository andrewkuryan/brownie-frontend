const path = require('path');
const WebpackShellPluginNext = require('webpack-shell-plugin-next');
const fs = require('fs');
const util = require('util');
const dotenv = require('dotenv');

const commonConfig = require('./webpack.common.config');

const copyFileAsync = util.promisify(fs.copyFile);
const buildEnv = dotenv.config({ path: '.build.env' });

module.exports = {
    mode: 'development',
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
                use: ['style-loader', 'css-loader', 'stylus-loader'],
            },
        ],
    },
    plugins: [
        ...commonConfig.plugins,
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
                                path.resolve(__dirname, 'static', 'index.dev.html'),
                                path.resolve(buildEnv.parsed.SERVER_RES_DIR, 'index.html'),
                            ),
                        ]),
                ],
                blocking: true,
            },
        }),
    ],
};
