const path = require('path');
const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin;
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const WebpackShellPluginNext = require('webpack-shell-plugin-next');
const fs = require('fs');
const util = require('util');
const dotenv = require('dotenv');

const copyFileAsync = util.promisify(fs.copyFile);
const customEnv = dotenv.config();

module.exports = {
    mode: 'production',
    entry: path.resolve(__dirname, 'src', 'index.tsx'),
    output: {
        path: path.resolve(__dirname, 'static'),
        filename: 'build.js',
    },
    resolve: {
        extensions: ['.ts', '.tsx', '.js'],
        alias: {
            '@components': path.resolve(__dirname, 'src/components/'),
            '@utils': path.resolve(__dirname, 'src/utils/'),
            '@entity': path.resolve(__dirname, 'src/entity/'),
            '@api': path.resolve(__dirname, 'src/api/'),
            '@application': path.resolve(__dirname, 'src/application/'),
            '@assets': path.resolve(__dirname, 'src/assets'),
            '@colors.styl': path.resolve(__dirname, 'src/colors.styl'),
            '@styleUtils.styl': path.resolve(__dirname, 'src/styleUtils.styl'),
        },
    },
    module: {
        rules: [
            {
                test: /\.(ts|tsx)$/,
                loader: 'ts-loader',
                exclude: /node_modules/,
            },
            {
                test: /\.styl$/,
                use: [
                    MiniCssExtractPlugin.loader,
                    'css-loader',
                    'stylus-loader'
                ],
            },
            {
                test: /\.(png|jpg|jpeg|gif|svg|woff|woff2|eot|ttf)$/,
                type: 'asset/inline'
            }
        ]
    },
    plugins: [
        new MiniCssExtractPlugin({ filename: 'styles.css' }),
        new BundleAnalyzerPlugin({ analyzerMode: 'static' }),
        new WebpackShellPluginNext({
            onBuildEnd: {
                scripts: [() => Promise.all([
                    copyFileAsync(
                        path.resolve(__dirname, 'static', 'build.js'),
                        path.resolve(customEnv.parsed.SERVER_RES_DIR, 'build.js'),
                    ),
                    copyFileAsync(
                        path.resolve(__dirname, 'static', 'index.prod.html'),
                        path.resolve(customEnv.parsed.SERVER_RES_DIR, 'index.html'),
                    ),
                    copyFileAsync(
                        path.resolve(__dirname, 'static', 'styles.css'),
                        path.resolve(customEnv.parsed.SERVER_RES_DIR, 'styles.css'),
                    ),
                ])],
                blocking: true,
            },
        }),
    ],
}