# 如何修改原作脚本
**方法仅供学习参考，使用后果自负**
## 准备
- [GARbro](https://github.com/morkt/GARbro/)
- Windows 7 SP1, 日语版（自行解决激活，语言不通，键盘布局等问题）
  - 如果没有实体机，[VirtualBox](https://www.virtualbox.org/)
- Notepad++(可选可换)
## 参考环境配置
1. 实体机安装VirtualBox
2. VirtualBox安装Windows 7 with SP1日语版
3. 虚拟机里安装Notepad++和.NET Framework 4.7.1
4. 下载GARbro，甩进去
5. 安装原作
## 操作
1. 打开GARbro，找到原作文件夹里需要的xp3文件（例如scenario.xp3）
2. F4解压，如果问加密就选Tenshin Ranman
3. 你会找到解压后的文件夹，进去
4. 找到你要改的东西，改
5. GARbro找到解压后的文件夹，进去，全选，F3，版本号2，加密Tenshin Ranman，只勾第二项，确认
6. 把生成的xp3替换回去
7. 开跑
## FAQ
### 重新打包时提示"xxxxx被其他程序打开"
GARbro右边那个预览也算"其他程序"，先点一下文件列表的`...`然后再打包
### 重新打包时提示"找不到路径xxxxx"
重新选一下输出路径
### 替换了没效果
注意：如果可能，游戏会用patch.xp3的内容覆盖已有的内容
### 打开文件乱码
选字符集ShiftJIS或者ANSI，如果非要拆汉化版，选Unicode或者UCS2或者UTF16LE，也可能是GBxxxx，一个个试。
如果没得试的，老老实实换Notepad++
### 能不能拿来做汉化
没试过，不过SJIS的引擎跑GB或者Unicode有麻烦
### 能不能拿汉化版来
能，通行的汉化版并没有对原程序本体作修改。
但请运行日语原版的tenshin.exe，汉化版的exe内置了一些东西，会覆盖你的改动。