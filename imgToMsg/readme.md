###

图片生成 `${msg}.json` 文件

### 注意

exiftool 必须 utf-8 环境，需要切换 windows 全部环境为 utf-8， 在 控制面板 - 区域 里面设置 <br />

~~启用了 N 卡硬解码 ， 如果不支持删除 `.\lib\toMp4.js` 中的 `-hwaccel_output_format cuda`~~ <br/>

### node 版本

node 14 版本报错 `Unexpected string on start: IO/Uncompress/Adapter/Inflate.pm did not return a true value at C:/Perl/lib/IO/Uncompress/RawInflate.pm line 12.`
与 Perl 无关，（安装 Perl 到 'C:\Perl' 后也无效）

降低到 node 12/10 后正常
