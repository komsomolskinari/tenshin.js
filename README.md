# 天神乱漫.js
## 这是什么
本项目是在当代浏览器上面跑Galgame的一点尝试，目标是在浏览器中运行Kirikiri2引擎的Galgame。目前尚属早期阶段，一时半会还只能从开发人员工具下面运行。
## 如何运行
1. 在项目根目录下运行`webpack`
2. 把游戏拿XP3Viewer什么的拆包，拆出来的放在`game/`目录下。
3. 参照`nginx.conf`配置nginx，把网站的root位置设置为项目根目录。
4. 启动nginx，浏览器访问http://localhost:8080/
## 目前的困难
1. 我不会写脚本语言解释器，也就无法执行.tjs脚本
2. 预计缺乏可移植性，对于其他Galgame，还有其他工作要做
3. 虚拟文件系统现在依赖nginx的json目录浏览，无法在纯Windows平台上工作
4. 懒癌发作
