# 需求 Prerequest
- Python3
- HTTP服务器
  - nginx (Linux only)
  - HFS *性能不佳*
- 浏览器
  - Chrome (Desktop & Mobile)
  - Firefox (Desktop only)
  - Edge *功能不完整*
- 拆包工具
  - XP3Viewer
  - KrkrExtract (没拆出来)
## 开发
- npm
- webpack
- Bash
  - Windows subsystem for Linux

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
  - HFS用户请参考`hfs.vfs`
  - nginx用户请参考`nginx.conf`，*注意：nginx Windows版对宽字符的处理存在问题，请使用Linux版*
5. 浏览器访问 http://localhost/ 即可
