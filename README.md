# 天神乱漫.js tenshin_ranman.js
## 这是什么 What's this
本项目是在当代浏览器上面跑Galgame的一点尝试，目标是在浏览器中运行[Kirikiri2引擎](https://github.com/krkrz/krkr2)的Galgame。目前尚属早期阶段，仅仅能够相对正确地按照游戏流程运行并输出文字。
This project is a experiment about running Galgame in modern browser, it's original task is running full [krkr2 engine](https://github.com/krkrz/krkr2) in browser. It's still in early state, can only display text now.

## 如何运行 How to run it
1. 在项目根目录下运行`./test.sh`
2. 把游戏拿XP3Viewer什么的拆包，拆出来的放在`game/`目录下。
3. 参照`nginx.conf`配置nginx，把网站的root位置设置为项目根目录。
4. 启动nginx，浏览器访问http://localhost:8080/
----
1. Run `./test.sh`
2. Dump game resource with XP3Viewer or something, put output files under `game/`
3. Configure nginx, see `nginx.conf` for example.
4. Run nginx, browse http://localhost:8080/

## 目前的困难 Problems
1. 我不会写脚本语言解释器，也就无法执行.tjs脚本
2. 预计缺乏可移植性，对于其他Galgame，还有其他工作要做
3. 虚拟文件系统现在依赖nginx的json目录浏览，无法在纯Windows平台上工作
4. 懒癌发作
----
1. I don't know how to write a compiler, so this project lack ability of execute .tjs script
2. Seems not so portable. For more game, there's much work to do.
3. Virtual filesystem depends on nginx and ngx_autoindex_module, which can only works perfectly on *nix (or WSL).
4. Too lazy

## 计划 Projects
- [x] 解析KS脚本 Parse .ks Script
- [x] 按顺序执行 Execute By Order
- [x] 选择支 Select Case
- [x] 语音支持 Voice
- [ ] 图片支持 Image
- [ ] 视频支持 Video
- [ ] 基本动画 Basic Animation
- [ ] 图片特效 Image Effect
- [ ] 改进的选择支 Improved Select
- [ ] 自动播放 Auto Play
- [ ] 支持千恋万花 Support Senren Banka
