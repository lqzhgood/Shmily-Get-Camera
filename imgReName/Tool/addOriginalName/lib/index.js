const fs = require('fs-extra');
const path = require('path');

const { getMD5 } = require('../../../utils/index');


const FLAG = require('./flag');
const { NAME_SPLIT } = require('../../../config');



async function getFile(dir, arr = [], check = false) {
    const files = fs.readdirSync(dir);
    for (let i = 0; i < files.length; i++) {
        const f = files[i];
        const p = path.join(dir, f);
        const isDirectory = fs.statSync(p).isDirectory();
        if (isDirectory) {
            await getFile(p, arr);
        } else {
            const md5 = await getMD5(p);
            const inMd5 = arr.find(v => v.md5 === md5);
            if (inMd5) {
                inMd5.ps.push(p);
                if (check && inMd5.ps.length >= 2) {
                    console.warn(`same file`, inMd5);
                    FLAG.ALL_FILE_IS_UNIQUE = false;
                }
            } else {
                arr.push({
                    md5, ps: [p],
                });
            }
        }
    }
    return arr;
}


async function copyFromDCJSON() {
    let copyFromDCJSONCount = 0;

    const json = require(path.join(__dirname, '../duplicateCleanerHandle/result.json'));

    for (let i = 0; i < json.length; i++) {
        const f = json[i];
        const p = f.i;

        if (!fs.existsSync(p)) {
            continue;
        }
        const { name, ext, dir } = path.parse(p);

        const md5_name = getMD5ByName(p);
        const md5_file = await getMD5(p);

        if (md5_name !== md5_file) throw new Error(`md5 not same
            文件名中的MD5=${md5_name}
            实际文件的MD5=${md5_file}
            ${p}`);

        const o_name = f.o;
        const o_p = path.join(dir.replace(path.resolve(__dirname, '../input'), path.resolve(__dirname, '../out')), `${name}${NAME_SPLIT}${o_name}${ext}`);
        fs.moveSync(p, o_p, { overwrite: true });
        copyFromDCJSONCount++;
    }
    console.log('手动相似改名', copyFromDCJSONCount);

}

function getMD5ByName(p) {
    const { name, ext, dir, base } = path.parse(p);
    // 检查是否符合文件名规则 以及 md5 是否一致
    // 2011-02-13 16-20-14 21f9fd
    if (!/^\d{4}-\d{2}-\d{2} \d{2}-\d{2}-\d{2} \w{6}/.test(name)) {
        return '';
    } else {
        const reg = new RegExp(`(?: )([A-Za-z0-9]{6})(?:\\${ext})`);
        const pMd5 = base.match(reg)[1];
        return pMd5;
    }

}


module.exports = {
    getFile,
    getMD5ByName,
    copyFromDCJSON,
};