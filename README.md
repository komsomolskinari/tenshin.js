# 天神乱漫.js
`TenshinRanman => (lucky || !lucky)`

![图文无关](doc/神社娘.webp)
*图文无关*
## 这是什么 What's this
本项目是在当代浏览器上面跑Galgame的一点尝试，目标是在浏览器中运行[Kirikiri2引擎](https://github.com/krkrz/krkr2)的Galgame，结果因为不会写编译器变成了针对《天神乱漫》设计的解释器。目前勉勉强强可以用，基本功能从基本原理上来说是基本正常的。

### 项目目的
1. 照顾没模拟器用的iOS/主机用户
2. 照顾没硬件级虚拟化用的ARM/MIPS/Alpha/M68K/PowerPC...用户
3. 证明*凡是能用JS重写的必将用JS重写*
4. 探讨在今天Galgame引擎的存在形式

### 注意
1. 未严肃考虑在广域网上运行，虽然实际上可以
2. **本软件没有明示或者暗示的任何保证，用出问题自己解决**

## 文档
- [如何运行](doc/HOW_TO_RUN.md)
- [更新日志](doc/CHANGELOG.md)

## 计划 Projects
正在试图基于JS解析器或者从头完成一个输出类ESTree格式的TJS解析器。

- 模块化
  - 各专用语言解析器
  - 脚本解释器
  - 模拟TJS环境
  - 视图
  - KAG运行时库
  - KAGEX扩展
  - 虚拟文件系统
- 重写解释器以适应新版本AST结构
- 视图基于Vue重写
- 按照原引擎的官方文档重新开发运行时（不见得要做）
- TJS语言转译器（为了执行eval等指令，最终不得不做）

## 参考资料
- [官方文档](http://legacy.yuzu-soft.com/tenshin/)
- [krkrz](https://krkrz.github.io)
- [kagex](https://biscrat.com/krkr/docs/kagex/contents/)
- [almight](http://almight.jp)，闭源的浏览器端KAG环境，没有实现TJS
- [一些其他有价值的文档](https://github.com/sakano/krkr_archives)，可惜我一个也看不懂
