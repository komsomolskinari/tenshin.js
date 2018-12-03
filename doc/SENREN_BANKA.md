# 在《千恋万花》上的尝试
Keyword: senren banka, senrenbanka, yuzusoft, m2psb
[官方文档](http://www.yuzu-soft.com/products/senren/index.html)
此处记录一点信息，以供后人参考。

## 为什么是tenshin.js而不是senren.js - 2018年9月版
显然，要是能移植《千恋万花》，我绝对已经动手了。
简单地说，拆不开，xp3Viewer(2017-11-02版)拆不开。
不仅xp3viewer挂了，krkrextract也挂了，开反编译保准炸，一炸一个准。
我心想，新游戏不成，老游戏嘛，于是呢就有了本项目。

## 为什么现在还不是senren.js - 2018年11月
~~首先tenshin.js都没搞清楚。~~
抛开本项目的名字不说，谈谈最近的尝试。
krkrextract事实上可以导出一堆加密的文件。
经过我半夜RTFM，发现这些文件可以用其他工具解密。
解密出来的脚本，已经不是.ks了，是json，看上去是把.ks编译了一遍之后的结果。（俄罗斯套娃）
拆出这些文件的步骤如下：
1. 先用[krkrExtract](https://github.com/xmoeproject/KrkrExtract)，不开反编译，不开解密。可于data/scn下得若干.ks.scn文件
2. 用[FreeMote](https://github.com/UlyssesWu/FreeMote)中的PsbDecode拆这些scn即可。
仔细辨认的话可以看到ks脚本的“残骸”，不过反正我是没认出来，也就没法处理。