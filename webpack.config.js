const webpack = require('webpack');
const path = require('path');

module.exports = {
    entry: './src/index.js',
    output: {
        filename: 'index.js',
        path: '/mnt/c/Users/User/Desktop/YUZUSOFT/tenshin_js'
    },/*
    plugins: [
        new webpack.ProvidePlugin({
            $: "jquery",
            jQuery: "jquery"
        })
    ],*/
    mode: 'none',
};