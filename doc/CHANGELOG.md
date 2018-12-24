# 更新日志 Changelog

## [v0.4.6-notwork] - 2018-12-24
**图片定位还是萎的**

庆祝千恋万花官方汉化
### 新增
- KS脚本源映射
- 一些组件的单元测试
### 改变
- 重写脚本解析器

## [v0.4.5-notwork] - 2018-12-14
**图片定位萎的**
### 新增
- npm http-server支持
### 修复
- 图片功能基本恢复

## [v0.4.4.1-notwork] - 2018-12-12
**正式切换到TypeScript**
### 修复
- 功能恢复到v0.4.3.2的水平

## [v0.4.4-notwork] - 2018-12-05
### 改变
- 转到TypeScript

## [v0.4.3.2-notwork] - 2018-12-05
**功能不正常，仅供测试**
### 改变
- 配置文件现在不再编译为模块
- 使用通用图层驱动
- 选择支异步化

## [v0.4.3.1] - 2018-11-28
### 新增 Added
- macro
- 配置文件 Config file
### 修复 Fixed
- KSParser 支持 `[funtion param=]`    KSParser support `[funtion param=]`
- KSParser自动类型转换    KSParser not always return string

## [v0.4.3] - 2018-11-25
### 新增 Added
- 视频功能    Video
- VM断点与单步    Breakpoint and Step in KSVM
### 改变 Changed
- 运行库全异步化    Async Runtime
- 改用Function提供TJS支持    Use Function class to provide TJS functionality

## [v0.4.2] - 2018-11-21
### 新增 Added
- 支持nginx (html/xml/json), HFS, Apache, lighttpd, IIS目录浏览    Directory browsing
- 自动查找文件扩展名    Automatic find fiel extension
- `KSParser.strinify`, `TJSON.strinify`
### 改变 Changed
- `KSParser`, `TJSON`, `KRCSV` `Parse` 改成 `parse`
- JSON目录索引文件改用[tree -J](http://mama.indstate.edu/users/ice/tree/)格式    JSON file index now use `tree -J` format

## [v0.4.1] - 2018-11-19
### 新增 Added
- CG显示    CG Displaying
### 改变 Changed
- 现在无视指令大小写    Now ignore case in command
- 采用异步方法等待图片加载    Wait for image loaded using async
- var转换为let    Replace var to let
### 修复 Fixed
- 立绘显示的时间    When to display foreground image

## [v0.4] - 2018-11-15
### 改变 Changed
- 加载逻辑调整    Adjust loading logic

## [v0.3.5] - 2018-11-12
### 新增 Added
- 画面整体移动及缩放    env camera
### 改变 Changed
- 采用新的人物图片坐标计算方法     New foreground image coordinate caculation

## [v0.3.4] - 2018-11-07
### 新增 Added
- 背景图片    Background image
- 支持HFS作为HTTP服务器    Now support HFS
- 显示区域限制在1280\*720px    Display window limited in 1280\*720px
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
