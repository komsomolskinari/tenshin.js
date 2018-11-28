const webpack = require('webpack');
const path = require('path');

module.exports = {
    entry: './src/index.js',
    output: {
        filename: 'index.js',
        path: '/mnt/c/Users/User/Desktop/YUZUSOFT/tenshin_js'
    },
    devtool: 'source-map',
    mode: 'none',
};