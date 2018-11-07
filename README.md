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

## 更新日志 Changelog

### v0.3.3
2018-11-06
- 现在使用对象化的运行库    Now use object oriented runtime

### v0.3.2
2018-11-05
- 重新排列代码    Reorder code
- 暂时放弃Babel    Now nolonger use babel

### v0.3.1
2018-11-02
- 改进立绘缩放及定位    Improve image zoom and positioning

### v0.3
2018-11-01
- 试图加入立绘    Try to add foreground image
- 现在使用Babel    Now depends Babel
- 文本输出支持换行标识     Text output support 'newline' tag.

### v0.2.1
2018-10-27
- 加入了语音和背景音乐    Add voice and BGM
- 文件系统拥有列目录，自动搜索文件的功能    Filesystem now can ls and find
- 文件系统不再依赖nginx    Filesystem nolonger require nginx
- 格式化文本输出    Text output now handle format string
- VM启动时的资源是异步加载的了    Now load resource asynchonize when VM start

### v0.2
2018-10-25
- 试图加入语音    Try to add voice
- 正确识别文本中名字    Now can display name in text correctly

### v0.1
2018-10-18
- 添加对象映射机制    Add object mapper
- VM现在可以处理同名的多个tag    VM now handling nultiple tag with same name
- 自启动    Self boot
- 能够正常按流程完整执行    Now run the game in coret order
- 整理文件夹    Clear directory
- 顺手送了个图标    Add icon

### Initial Commit
2018-10-17
- 文本输出 Output text
- 在控制台手动执行 Run from browser console
- 提示框式选择支 Select case using prompt()

### 开工 Create folder
2018-10-10
