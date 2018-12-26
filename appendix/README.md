本文件夹包括在本项目开发过程中产生的一些可能有用的副产品

***注意：本文件夹内容使用MIT许可***

#内容
## kagura.js
《神乐黎明记》的JS播放器，只能放Hscene。启发了本项目，核心思想随后被用到此项目中。

## ks.g4, tjson.g4
参考的ANTLR语法定义。本项目并没有用ANTLR生成Parser，而是参考这些定义自己手写了两个。
没学过编译原理，多半不能用，看看就好。

## build_release.sh
一键生成`release.tar.gz`

## tree&#046;py
[`tree -J`](http://mama.indstate.edu/users/ice/tree/) (tree v1.7.0+)的兼容Python实现，用于生成JSON格式的索引

## yuzumash.svg
谜之图标。

## convert.sh
一键转码，需要`cwebp`,`ffmpeg`,`iconv`