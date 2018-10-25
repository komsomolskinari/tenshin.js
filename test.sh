#! /bin/sh

webpack --mode none src/index.js --output index.js
mv node_modules/jquery/dist/jquery.min.js jquery.min.js
mv src/index.html index.html
#inkscape -z yuzumash.svg -e favicon.png
#convert favicon.png -define icon:auto-resize=256,64,48,16 favicon.ico
#sudo php -S 127.0.0.1:80