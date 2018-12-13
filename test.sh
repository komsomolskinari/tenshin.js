#! /bin/sh

npx webpack
cd dist
ln -s ../game
cd ..