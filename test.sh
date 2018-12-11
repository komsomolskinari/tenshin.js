#! /bin/sh

npx webpack
cp node_modules/jquery/dist/jquery.min.js jquery.min.js
cp src/index.html index.html
cp src/index.css index.css
