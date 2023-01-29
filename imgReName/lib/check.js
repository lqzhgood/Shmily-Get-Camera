const path = require('path');
const fs = require('fs');
const dayjs = require('dayjs');
const customParseFormat = require('dayjs/plugin/customParseFormat');
dayjs.extend(customParseFormat);

const notHaveExif = [];

const { MODE } = require('../config');
const { timeIsSame } = require('../utils/index.js');

function check(filePath, exif, fileModifyMs, [fileNameMs, fileNameAccuracy]) {
    let pass = true;
    let ms;
    const { exifMs } = exif;

    if (!exifMs) {
        notHaveExif.push(filePath);
        if (MODE === 'check') {
            fs.copyFileSync(filePath, './noExif/' + path.basename(filePath), fs.constants.COPYFILE_EXCL);
            pass = false;
        }
        // if (!fileNameMs) {
        //     console.log('没有文件名时间 需要手动确定', filePath);
        //     throw new Error();
        // }
    } else {
        // 有 exif 时间

        if (fileNameMs) {
            // 有文件名时间

            // 文件名通常精度不高 如果精度匹配就过
            // 精度不匹配的情况下 允许 SKEW 范围内的误差
            if (!timeIsSame(dayjs(exifMs), dayjs(fileNameMs), fileNameAccuracy)) {
                console.log('fileName not match', fileNameAccuracy);
                console.log('Accuracy exif', exifMs, dayjs(exifMs).format(fileNameAccuracy));
                console.log('Accuracy fileNameMs', fileNameMs, dayjs(fileNameMs).format(fileNameAccuracy));
                console.error('fileNameMs not same exif', filePath);
                console.log('exifMs', dayjs(exifMs).format('YYYY/MM/DD HH:mm:ss'));
                console.log('fileNameMs', dayjs(fileNameMs).format('YYYY-MM-DD HH:mm:ss:SSS'));
                console.log(exif);
                // 文件名大多是操作文件的时间 (例如微信导出 文件名是导出时间) 所以还是 exif 为准吧
                // pass = false;
            }
        } else {
            // 只有文件时间
            // 检查文件修改时间是否一致
            if (!timeIsSame(dayjs(exifMs), dayjs(fileModifyMs))) {
                console.log(`fileModifyMs not same exif`, filePath);
                console.log(`exifMs`, dayjs(exifMs).format('YYYY/MM/DD HH:mm:ss'));
                console.log(`fileModifyMs`, dayjs(fileModifyMs).format('YYYY/MM/DD HH:mm:ss'));
                // console.log(exif);
                // 文件的修改时间通常是错的 所以忽略
                // pass = false;
            }
        }
    }
    ms = exifMs || fileNameMs || fileModifyMs;

    return [pass, ms];
}

module.exports = {
    check,
};
