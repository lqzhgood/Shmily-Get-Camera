const path = require('path');
const dayjs = require('dayjs');
const customParseFormat = require('dayjs/plugin/customParseFormat');
dayjs.extend(customParseFormat);

const EXIF_TIME_FORMAT = 'YYYY:MM:DD HH:mm:ssZ';

const { timeIsSame } = require('../utils/index');

function readExif(filePath, EXIF_TOOL, ep, [fileNameMs, fileNameAccuracy, fileNameExact]) {
    return EXIF_TOOL.then(() => ep.readMetadata(filePath, ['-File:all']))
        .then(res => {
            const exif = res.data[0];
            if (!checkExifHaveDate(exif)) throw new Error('exif not have Day Info');
            const extName = path.extname(filePath).toLowerCase();

            let timeZone;

            switch (extName) {
                case '.jpg':
                case '.png':
                case '.gif':
                case '.heic':
                    timeZone = '+08:00';
                    break;
                case '.mov':
                case '.mp4':
                case '.3gp':
                case '.wmv':
                    timeZone = '+00:00';
                    break;
                default:
                    console.error('Unexpected documents', filePath);
                    throw new Error('Unexpected documents');
            }

            let eData;

            const dayjs_DateTimeOriginal = dayjs(exif.DateTimeOriginal + timeZone, EXIF_TIME_FORMAT);
            const dayjs_CreateDate = dayjs(exif.CreateDate + timeZone, EXIF_TIME_FORMAT);
            // const dayjs_ModifyDate = dayjs(exif.ModifyDate + timeZone, EXIF_TIME_FORMAT);

            if (exif.DateTimeOriginal && exif.DateTimeOriginal !== '0000:00:00 00:00:00') {
                eData = dayjs_DateTimeOriginal;
            } else if (exif.CreateDate && exif.CreateDate !== '0000:00:00 00:00:00') {
                eData = dayjs_CreateDate;
            }
            //  else if (exif.ModifyDate && exif.ModifyDate !== '0000:00:00 00:00:00') {
            // eData = dayjs_ModifyDate;
            // }

            if (!eData && checkExifHaveDate(exif)) {
                console.log(
                    'DateTimeOriginal',
                    dayjs(exif.DateTimeOriginal, EXIF_TIME_FORMAT).format(fileNameAccuracy),
                );
                console.log('CreateDate', dayjs(exif.CreateDate, EXIF_TIME_FORMAT).format(fileNameAccuracy));
                // console.log('ModifyDate', dayjs(exif.ModifyDate, EXIF_TIME_FORMAT).format(fileNameAccuracy));
                console.error('Exif Date use Error', filePath, exif);
                return 'err';
            }

            return {
                exif,
                exifMs: eData.valueOf(),
            };
        })
        .catch(err => {
            console.log('exif error', filePath, err.message);
            // eslint-disable-line
            return { exifMs: 0 };
        });
}

function checkExifHaveDate(exifObj) {
    for (const key in exifObj) {
        if (key === 'ProfileDateTime') continue;

        if (exifObj.hasOwnProperty(key)) {
            const attr = exifObj[key];
            if (/^\d{4}.\d{2}.\d{2}/.test(attr) && attr !== '0000:00:00 00:00:00') {
                return true;
            }
        }
    }
    return false;
}

module.exports = {
    readExif,
    checkExifHaveDate,
};
