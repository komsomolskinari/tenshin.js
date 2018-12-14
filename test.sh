#! /bin/sh

npx webpack
cd dist
# for windows/wsl
# mklink /d game ..\game
ln -s ../game
cd ..