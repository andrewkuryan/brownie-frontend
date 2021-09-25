const path = require('path');
const { DefinePlugin } = require('webpack');
const dotenv = require('dotenv');

const runtimeEnv = dotenv.config({ path: '.runtime.env' });
const buildEnv = dotenv.config({ path: '.build.env' });
const generatedEnv = dotenv.config({
    path: path.resolve(buildEnv.parsed.SERVER_RES_DIR, '.generated.env'),
});

module.exports = {
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
                test: /\.(png|jpg|jpeg|gif|svg|woff|woff2|eot|ttf)$/,
                type: 'asset/inline',
            },
        ],
    },
    plugins: [
        new DefinePlugin({
            SRP_N: JSON.stringify(runtimeEnv.parsed.SRP_N),
            SRP_NBitLen: JSON.stringify(runtimeEnv.parsed.SRP_NBitLen),
            SRP_g: JSON.stringify(runtimeEnv.parsed.SRP_g),
            ECDSA_SERVER_PUBLIC_KEY: JSON.stringify(
                generatedEnv.parsed.ECDSA_SERVER_PUBLIC_KEY,
            ),
        }),
    ],
};
