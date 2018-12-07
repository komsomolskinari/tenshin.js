#! /bin/sh

#./appendix/tree.py game/ > tree.json
webpack
cp node_modules/jquery/dist/jquery.min.js jquery.min.js
cp src/index.html index.html
cp src/index.css index.css
#inkscape -z yuzumash.svg -e favicon.png
#convert favicon.png -define icon:auto-resize=256,64,48,16 favicon.ico
#sudo php -S 127.0.0.1:80