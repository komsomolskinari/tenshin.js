# 天神乱漫.js
`TenshinRanman => (lucky || !lucky)`

![图文无关](doc/神社娘.webp)
*图文无关*
## 这是什么 What's this
本项目是在当代浏览器上面跑Galgame的一点尝试，本来的目标是在浏览器中运行[Kirikiri2引擎](https://github.com/krkrz/krkr2)的Galgame，结果因为不会写编译器变成了针对《天神乱漫》设计的解释器。目前勉勉强强可以用，基本功能从原理上来说是基本正常的。

### 项目目的
1. 照顾没模拟器用的iOS用户
2. 照顾没模拟器用的主机用户
3. 照顾没虚拟机用的ARM/MIPS/Alpha/M68K... Linux/Unix用户
4. 证明*凡是能用JS重写的必将用JS重写*
5. 顺便探讨一下浏览器的可能性和Kirikiri引擎的可能性

### 注意
1. 暂不严肃考虑在广域网上运行，虽然实际上可以
2. **不考虑商业化应用，用出问题自己解决**

## 文档
- [官方文档](http://legacy.yuzu-soft.com/tenshin/)
- [如何运行](doc/HOW_TO_RUN.md)
- [更新日志](doc/CHANGELOG.md)

## 计划 Projects
### 完成 Finished
- [x] 解析KS脚本    Parse .ks Script
- [x] 按顺序执行    Execute By Order
- [x] 选择支    Select Case
- [x] 语音支持    Voice
- [x] 背景音乐    BGM
- [x] 文件系统    File System
- [x] 图片支持    Image
- [x] 视频支持    Video
- [x] 音效    Sound effect
- [x] 时间逻辑    Timing Logic
### 正在工作 WIP
- [ ] 基本动画    Basic Animation
- [ ] 预加载    Preload
### 近期 Soon
- [ ] 存档    Save And Load
- [ ] 自动播放    Auto Play
### 可能要鸽 Sooo......oon
- [ ] 支持千恋万花    Support Senren Banka
- [ ] 支持Bra-ban    Support Bra-ban
- [ ] 封装成Electron程序    Pack With Electron
- [ ] CG观赏与回想    CG And Scene Viewer
- [ ] TJS编译器    .tjs Compiler

## 注意

作者正在搞一个C#版本解释器以解决API缺乏文档的问题——自己设计API就有文档了。

参见：[某闭源项目](http://almight.jp)