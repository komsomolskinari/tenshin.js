# 天神乱漫.js tenshin_ranman.js
## 这是什么 What's this
本项目是在当代浏览器上面跑Galgame的一点尝试，目标是在浏览器中运行[Kirikiri2引擎](https://github.com/krkrz/krkr2)的Galgame，目前尚属早期阶段，仅有基本功能。

This project is a experiment about running Galgame in modern browser, it's original task is running full [krkr2 engine](https://github.com/krkrz/krkr2) in browser. It's still in early state, basic functions only.

## 如何运行 How to run it
1. 在项目根目录下运行`./test.sh`
2. 把游戏拿XP3Viewer什么的拆包，拆出来的放在`game/`目录下。
3. 参照`appendix/hfs.vfs`配置HFS。
4. 启动nginx，浏览器访问http://localhost/
----
1. Run `./test.sh`
2. Dump game resource with XP3Viewer or something, put output files under `game/`
3. Configure HFS, use `appendix/hfs.vfs` for example.
4. Run nginx, browse http://localhost/

## 目前的困难 Problems
1. 我不会写脚本语言解释器，也就无法执行.tjs脚本
2. 预计缺乏可移植性，对于其他Galgame，还有其他工作要做
3. 虚拟文件系统针对nginx json的支持挂了，同时还不支持Apache/IIS的目录浏览。
4. 懒癌发作
----
1. I don't know how to write a compiler, so this project lack ability of execute .tjs script
2. Seems not so portable. For more game, there's much work to do.
3. Virtual filesystem's nginx support is corrupted, and Apache/IIS is still not supported.
4. Too lazy

## 计划 Projects
### 完成 Finished
- [x] 解析KS脚本    Parse .ks Script
- [x] 按顺序执行    Execute By Order
- [x] 选择支    Select Case
- [x] 语音支持    Voice
- [x] 背景音乐    BGM
- [x] 文件系统    File System
- [x] 图片支持    Image
### 正在工作 WIP
- [ ] 改进图片定位    Improve image positioning
- [ ] 视频支持    Video
- [ ] 基本动画    Basic Animation
### 近期 Soon 
- [ ] 图片特效    Image Effect
- [ ] 改进的选择支    Improved Select
- [ ] 存档    Save And Load
- [ ] 自动播放    Auto Play
### 可能要鸽 Sooo......oon
- [ ] 支持更多Web服务器    Support More Web Server
- [ ] 支持千恋万花    Support Senren Banka
- [ ] 封装成Electron程序    Pack With Electron
- [ ] CG观赏与回想    CG And Scene Viewer
- [ ] TJS编译器    .tjs Compiler
