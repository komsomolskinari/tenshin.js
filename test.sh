#! /bin/sh

./appendix/generate_tree_json.py game/ > tree.json
webpack --mode none src/index.js --output index.js
cp node_modules/jquery/dist/jquery.min.js jquery.min.js
cp src/index.html index.html
cp src/index.css index.css
cp src/1280.png 1280.png
#inkscape -z yuzumash.svg -e favicon.png
#convert favicon.png -define icon:auto-resize=256,64,48,16 favicon.ico
#sudo php -S 127.0.0.1:80