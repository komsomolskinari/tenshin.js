# 更新日志 Changelog

## [v0.3.4] - 2018-11-07
### 新增 Added
- 背景图片    Background image
- 支持HFS作为HTTP服务器    Now support HFS
- 显示区域限制在1280\*720px    Display window limited in 1280*720px
### 修复 Fixed
- 过期异步操作现在被正确取消    Outdated async operation now cancelled correctly

## [v0.3.3] - 2018-11-06
### 改变 Changed
- 现在使用对象化的运行库    Now use object oriented runtime
### 修复 Fixed
- 立绘图层顺序现在不再随机    Foreground image layer order no longer random

## [v0.3.2] - 2018-11-05
### 改变 Changed
- 重新排列代码    Reorder code
### 移除 Removed
- 暂时放弃Babel    Now nolonger use babel

## [v0.3.1] - 2018-11-02
### 修复 Fixed 
- 改进立绘缩放及定位    Improve image zoom and positioning

## [v0.3] - 2018-11-01
### 新增 Added
- 立绘    Foreground image
- 现在使用Babel    Now depends Babel
- 文本输出支持换行标识     Text output support 'newline' tag.
### 修复 Fixed
- 文件名带小写字母的BGM可以播放了    BGM with lowercase character in filename now works

## [v0.2.1] - 2018-10-27
### 新增 Added
- 背景音乐    BGM
- 文件系统获得列目录，自动搜索文件的功能    Filesystem now can ls and find
- 文件系统现在可以使用单个JSON文件作为索引    Filesystem now can use single json index file.
- 格式化文本输出    Text output now handle format string
### 改变 Changed
- 文件系统不再依赖nginx    Filesystem nolonger require nginx
- VM启动时的资源是异步加载的了    Now load resource asynchonize when VM start
### 修复 Fixed
- 语音序号现在正确生成    Voice sequence now correctly generated

## [v0.2] - 2018-10-25
### 新增 Added
- 语音    Try to add voice
### 修复 Fixed
- 正确识别文本中名字    Now can display name in text correctly

## [v0.1] - 2018-10-18
### 新增 Added
- 添加对象映射机制    Add object mapper
- 自启动    Self boot
- 能够正常按流程完整执行    Now run the game in correct order
- 顺手送了个图标    Add icon
### 改变 Changed
- 整理文件夹    Clear directory
### 修复 Fixed
- VM现在可以处理同名的多个tag    VM now handling nultiple tag with same name

## [Initial Commit] - 2018-10-17
### 新增 Added
- 文本输出 Output text
- 在控制台手动执行 Run from browser console
- 提示框式选择支 Select case using prompt()

## 开工 Create folder - 2018-10-10
