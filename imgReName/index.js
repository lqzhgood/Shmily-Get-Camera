/* cSpell:ignore exiftool */
const fs = require('fs');
const path = require('path');

const dayjs = require('dayjs');
const customParseFormat = require('dayjs/plugin/customParseFormat');
dayjs.extend(customParseFormat);

const exiftool = require('node-exiftool');
const ep = new exiftool.ExiftoolProcess('./lib/exiftool.exe');
const EXIF_TOOL = ep.open();

const { getMD5, getFileModifyMs, getFileNameMs } = require('./utils/index');
const { readExif } = require('./lib/exif');
const { check } = require('./lib/check');

const { INPUT_DIR, OUTPUT_DIR, MODE, NAME_SPLIT } = require('./config');

const INPUT_FILES = fs.readdirSync(INPUT_DIR);

const FILE_ALL = [];

if (!fs.existsSync('./dist')) {
    fs.mkdirSync('./dist');
}

(async () => {
    for (let i = 0; i < INPUT_FILES.length; i++) {
        const fileName = INPUT_FILES[i];
        const filePath = path.join(INPUT_DIR, fileName);
        const { ext, name: name_original } = path.parse(filePath);

        const nameInfo = getFileNameMs(filePath); // [ms , accuracy , fileNameExact]
        const [nameMs, , fileNameExact] = nameInfo;

        let finallyMs;

        if (fileNameExact) {
            finallyMs = nameMs;
        } else {
            const fileModifyMs = getFileModifyMs(filePath); // 文件的修改时间
            const exif = await readExif(filePath, EXIF_TOOL, ep, nameInfo);
            if (exif === 'err') {
                continue;
            }

            // console.log(exif, fileModifyMs, nameInfo);

            const [pass, ms] = check(filePath, exif, fileModifyMs, nameInfo);
            if (!pass) {
                continue;
            }
            finallyMs = ms;
        }

        const name_time = dayjs(finallyMs).format('YYYY-MM-DD HH-mm-ss');
        const name_md5 = await getMD5(filePath);
        const name_ext = ext.toLowerCase();

        const toFileName = `${name_time} ${name_md5}${NAME_SPLIT}${name_original}${name_ext}`;

        const flag = FILE_ALL.find(v => v === toFileName);
        if (flag) throw new Error('same file name');
        FILE_ALL.push(toFileName);
        if (MODE === 'Rename') {
            if (!fs.existsSync(path.join(OUTPUT_DIR, toFileName))) {
                fs.renameSync(filePath, path.join(OUTPUT_DIR, toFileName));
            } else {
                console.log('file is exists', filePath);
            }
        }
        // console.log('toFileName', `${FILE_ALL.length}/${INPUT_FILES.length}`, fileName, toFileName);
    }

    if (ep._open) ep.close();
    console.log('over');
})();
