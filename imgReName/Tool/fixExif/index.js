const fs = require('fs');
const path = require('path');
const dayjs = require('dayjs');
const customParseFormat = require('dayjs/plugin/customParseFormat');
dayjs.extend(customParseFormat);

const exiftool = require('node-exiftool');
const ep = new exiftool.ExiftoolProcess('../../lib/exiftool.exe');
const EXIF_TOOL = ep.open();

const EXIF_TIME_FORMAT = 'YYYY:MM:DD HH:mm:ssZ';

const files = fs.readdirSync('./files/');

(async () => {
    for (let i = 0; i < files.length; i++) {
        const _f = files[i];
        const f = path.join('./files', _f);
        await fixExif(f, ['DateTimeOriginal', 'CreateDate'], t => {
            const v = dayjs(t + '+00:00', EXIF_TIME_FORMAT);
            return v.isValid() ? v.format('YYYY:MM:DD HH:mm:ss') : t;
        });
    }

    ep.close();
})();

function fixExif(filePath, field = [], fn) {
    return EXIF_TOOL.then(() => ep.readMetadata(filePath, ['-File:all']))
        .then(res => {
            const exif = res.data[0];

            for (let i = 0; i < field.length; i++) {
                const k = field[i];
                if (!exif[k]) continue;
                exif[k] = fn && fn(exif[k]);
            }

            return exif;
        })
        .then(exif => ep.writeMetadata(filePath, exif));
}
