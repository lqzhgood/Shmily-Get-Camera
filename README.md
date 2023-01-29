# 说明

请先阅读 https://github.com/lqzhgood/Shmily

此工具是将 照片 归档为 `Shmily-Msg` 格式的工具

## 使用

0. 安装 node 环境 [http://lqzhgood.github.io/Shmily/guide/setup-runtime/nodejs.html]
1. 修改图片文件名
   各类设备产生的照片文件名并不一致, 大部分文件名并不包含时间信息, 但是 修改时间 / exif 信息极易被丢失, 最终导致无法按时间排序, 所以标准化文件名很重要, 文件名称将被标准化为 `YYYY-MM-DD HH-mm-ss [文件MD5前6位] & [原文件名].jpg`

    - 打开命令行 切换到 utf-8 编码
    - 通过命令行进入 `imgReName` 文件夹
    - 将图片放入 `input`
    - 执行 `node index.js`
    - dist 中会得到标准化文件名的文件

2. 获取 数据文件 和 资源文件
   读取文件信息生成 `Shmily-Msg` 数据文件, 并将视频转换为 h264-acc MP4 封装(可供浏览器直接播放)

    - 打开命令行 切换到 utf-8 编码
    - 命令行进入 `imgToMsg` 文件夹
    - 将 `1` 生成的文件放入 `input` 文件夹
    - 修改 `config.js`
    - 执行 `npm run build`

## Tools

#### imgFixTimeZone

修改因时区导致文件名与修改时间不一致的问题

#### newfiletime_3.93

修改文件时间

#### rename

递归文件夹, 将 match 的文件名中 `_` 修改为 `-`
