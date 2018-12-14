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
- npm

# 步骤 Steps
## 会用Web服务器的
1. 下载release，解压。
3. 把游戏拿XP3Viewer什么的拆包，拆出来的转换格式后放在`game/`目录下。
4. 修改`config.js`中的目录浏览配置以适应你使用的Web服务器。
5. 启动HTTP服务器，把网站目录指向相应位置，打开目录浏览功能。
6. 浏览器访问即可。

## 会写js的
1. 在项目根目录下运行`./test.sh` （要bash，不过也可以对照着脚本自己手动一下）
2. 把游戏拿XP3Viewer什么的拆包，拆出来的转换格式后放在`game/`目录下。
3. 启动`http-server`，对，npm里面排名最前那一个。
4. 浏览器访问即可

## 都不会的
此处假定你是Windows用户。Linux用户一般都会开服务器，如果不会，RTFM。Android用户一般连个服务器软件都没有。
1. 下载[windows版lighttpd](http://lighttpd.dtech.hu/)，挑win32 zip，下载解压。
2. 下载[配置文件](doc/lighttpd.conf)，覆盖原来的`conf/lighttpd.conf`，然后记事本打开，修改网站路径。
3. 双击lighttpd.exe，出来的窗口不要关，如果要防火墙或者要权限，确认。
4. 好了，现在你会开服务器了。
5. 浏览器访问 http://localhost 即可。
6. 如果要关服务器，把窗口关了就是。


# 支持的服务端和浏览器
## 服务端
按理说支持Unicode的都可以，已经测试过以下服务端：
- nginx (Linux & WSL) *Windows版本的Unicode支持有问题，不能用*
- HFS (Windows) *谜之性能萎靡，基本上不能用*
- lighttpd (Windows)
- Apache2 (WSL)
- IIS *要配MIME，不然不提供文件*
- php -S *没有目录浏览，不过可以在生成索引文件后将就用*
- npx http-server
- python3 -m http.server

## 浏览器
按理说功能完善的当代浏览器都可以，不过`功能完善的当代浏览器`其实就那几个
- Chrome 70 (Windows & Android)
- Firefox 63 (Windows & Android)
- Edge 17 *画面有问题*
- Safari (MacOS)