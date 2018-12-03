# 关于文件格式
本程序访问媒体资源时无视扩展名，因此可以直接使用转换格式后的媒体资源。程序支持的格式即为浏览器支持的格式。

转换工具推荐：
- iconv （文本，终端）
- VSCode （文本编辑器）
- cwebp （webp图片，命令行）
- imagemagick （图片，命令行）
- GIMP （图片编辑器）
- Inkscape （矢量图）
- VLC （音频/视频）
- ffmpeg （音频/视频）

## 文本格式
一切文本请转换为UTF-8。

*已知iconv对`game\scenario\山吹葵.ks`处理有问题，文件被截断，需要使用其他工具。*

## 图片格式
### Webp/.webp
Google出品，压缩率高，建议使用。有损压缩时质量请至少高于50（不然要糊……）。

[浏览器兼容性](https://caniuse.com/#feat=webp)

*暂不支持Safari, Firefox, ~~Edge~~*
### PNG/.png
无损，支持透明度，不能用Webp的时候用。
### JPG/.jpg,.jpeg
有损，无透明度，建议用于背景，**不要用于立绘**。
### BMP/.bmp
无损，几乎无压缩，无透明度，不要用。
### APNG/.png
PNG动图版本，建议用于动图。

[浏览器兼容性](https://caniuse.com/#feat=apng)

*暂不支持Edge*
### GIF/.gif
动图，没APNG用的时候用。
### SVG/.svg
矢量图，理论上可以用，实际上缺乏相应资源。

## 视频格式
### MP4/.mp4
使用H264 + AAC编码，**不要用H265**。视频流码率建议取1.5-3Mbps。

### WebM/.web
使用VP8 + Vobris/VP9 + Opus编码。视频流码率不应小于768kbps（不然绝大多数时间要糊）。编码过程速度捉急，约为MP4的1/10。~~很奇怪，1Mbps WebM似乎不如1.5Mbps MP4~~

[浏览器兼容性](https://caniuse.com/#feat=webp)

*不支持Safari*

### ~~WMV/.wmv~~
游戏视频原格式，**不能用于浏览器**。

### ~~DAT/.dat~~
*谜之格式，~和本项目没半毛钱关系的某~[いな☆こい](https://whirlpool.co.jp/inakoi/inakoi_top.htm)使用这个格式明文存放视频，VLC可以直接开。为了让后人少走弯路，特此记录。*

## 音频格式
### MP3
不建议用，但是可以用。
### ogg
使用Vobris/Opus编码。在Opus编码时，码率可用32kbps@44100kHz。
### Opus
其实就是采用Opus编码的ogg，务必使用。