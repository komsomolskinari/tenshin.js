const webpack = require('webpack');
const path = require('path');

module.exports = {
    entry: './src/index.js',
    output: {
        filename: 'index.js',
        path: '/mnt/c/Users/User/Desktop/YUZUSOFT/tenshin_js'
    },/*
    module: {
        rules: [
            {
                test: /\.js$/,
                exclude: /(node_modules|bower_components)/,
                use: {
                    loader: 'babel-loader',
                    options: {
                        presets: ['env']
                    }
                }
            }
        ]
    },*/
    mode: 'none',
};