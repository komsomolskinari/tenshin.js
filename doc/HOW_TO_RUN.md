# 需求 Prerequest
- HTTP服务器
  - lighttpd
  - nginx (Linux only)
  - HFS *性能不佳*
- 浏览器
  - Chrome (Desktop & Mobile)
  - Firefox (Desktop only)
  - Edge *功能不完整*
- 拆包工具
  - XP3Viewer
  - KrkrExtract (没拆出来)
## 开发环境（仅参考）
- Python3
- VSCode (Windows)
  - Debugger for Chrome
  - *Kirikiri Adventure Game (KAG3) Script*
  - *Kirikiri TPV JavaScript Script (TJS)*
- Windows subsystem for Linux
- bash
  - nodejs
    - npm
    - webpack

# 步骤 Steps
## 从发行包部署 From release
1. 解压到某个目录。
2. 如果没有`jquery.min.js`, 下载最新的jQuery到此目录。
3. 把游戏拿XP3Viewer什么的拆包，拆出来的放在`game/`目录下。
4. 运行`generate_tree_json.py game/ > tree.json`生成文件索引。
5. 下载HFS，参考`hfs.vfs`配置。
6. 浏览器访问 http://localhost/ 即可。

## 从源代码构建 From source
1. 在项目根目录下运行`./test.sh` (需要bash)
2. 把游戏拿XP3Viewer什么的拆包，拆出来的放在`game/`目录下。
3. 运行`appendix/generate_tree_json.py game/ > tree.json`生成文件索引。
4. 配置并启动你的HTTP服务器。
5. 浏览器访问 http://localhost/ 即可

# 支持的服务端和浏览器
## 服务端
按理说支持Unicode的都可以，已经测试过以下服务端：
- nginx (Linux & WSL) *Windows Unicode支持有问题，不能用*
- HFS (Windows)
- lighttpd (Windows)
- Apache2
- IIS

## 浏览器
按理说功能完善的当代浏览器都可以，不过`功能完善的当代浏览器`其实就那几个
- Chrome 70 (Windows & Android)
- Firefox 63 (Windows & Android)
- Edge 17 *画面有问题*
- Safari (MacOS)