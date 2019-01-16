const webpack = require('webpack');
const path = require('path');

module.exports = {
    devtool: 'source-map',
    mode: 'none',
    entry: './src/index.ts',
    module: {
        rules: [
            {
                test: /\.ts$/,
                use: 'ts-loader',
                exclude: /node_modules/
            }
        ]
    },
    resolve: {
        extensions: ['.ts', '.js']
    },
    output: {
        filename: 'index.js',
        path: path.resolve(__dirname) + '/dist'
    },
    externals: {
        jquery: 'jQuery'
    }
};