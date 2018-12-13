const webpack = require('webpack');
const path = require('path');

module.exports = {
    devtool: 'source-map',
    mode: 'none',
    entry: [
        './src/index.ts',
        './src/index.html',
        './src/index.css',
        './node_modules/jquery/dist/jquery.min.js',
        './src/config.js'
    ],
    module: {
        rules: [
            {
                test: /\.ts$/,
                use: 'ts-loader',
                exclude: /node_modules/
            },
            {
                test: /\.(html|css|js)$/,
                use: "file-loader?name=[name].[ext]"
            }
        ]
    },
    resolve: {
        extensions: ['.ts', '.js']
    },
    output: {
        filename: 'index.js',
        path: path.resolve(__dirname) + '/dist'
    }
};