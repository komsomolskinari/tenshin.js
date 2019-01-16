#! /bin/sh

npx webpack
cd dist
# for windows/wsl
# mklink /d game ..\game
ln -s ../game
cp src/index.html .
cp src/index.css .
cp src/config.js .
cd ..