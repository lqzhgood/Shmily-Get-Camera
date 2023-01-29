const path = require('path');
const fs = require('fs-extra');

const { getFile, copyFromDCJSON } = require('./lib/index');


const DIR_ORIGINAL = path.join('./original');
const DIR_INPUT = path.join('./input');


const { NAME_SPLIT } = require('../../config');
const FLAG = require('./lib/flag');

const NOT_FIND_ORIGINAL = [];
const NOT_FORMAT_FILE = [];

let FIX_FILE = 0;

(async () => {

    const arr_original = await getFile(DIR_ORIGINAL, [], true);
    console.log('原始文件', arr_original.length);

    const arr_input = await getFile(DIR_INPUT);
    console.log('改名文件数量', arr_input.length);

    if (!FLAG.ALL_FILE_IS_UNIQUE) {
        console.warn('先清理重复的原始文件');
        return;
    }


    for (let i = 0; i < arr_input.length; i++) {
        const { md5, ps } = arr_input[i];

        ps.forEach(p => { // eslint-disable-line
            const { name, ext, dir, base } = path.parse(p);

            // 检查是否符合文件名规则 以及 md5 是否一致
            // 2011-02-13 16-20-14 21f9fd
            if (!/^\d{4}-\d{2}-\d{2} \d{2}-\d{2}-\d{2} \w{6}/.test(name)) {
                // console.warn(`not format file ${p}`);
                NOT_FORMAT_FILE.push(p);
                return;
            }
            const reg = new RegExp(`(?: )([A-Za-z0-9]{6})(?:\\${ext})`);
            const pMd5 = base.match(reg)[1];
            if (pMd5 !== md5) throw new Error(`md5 not same
            文件名中的MD5=${pMd5}
            实际文件的MD5=${md5}
            ${p}`);

            // 找到原始文件名字

            const o = arr_original.find(({ md5: omd5 }) => omd5 === pMd5);

            if (!o) {
                // console.warn(`not find original ${p}`);
                NOT_FIND_ORIGINAL.push(p);
                return;
            }


            const o_name = path.parse(o.ps[0]).name;
            const o_p = path.join(dir.replace(/^input/, 'out'), `${name}${NAME_SPLIT}${o_name}${ext}`);

            fs.moveSync(p, o_p, { overwrite: true });

            FIX_FILE++;

        });
    }

    await copyFromDCJSON();

    console.log('FIX_FILE', FIX_FILE);

    console.log('未找到与原始相同MD5的文件', NOT_FIND_ORIGINAL.length);
    console.log('输入命名未格式化的文件', NOT_FORMAT_FILE.length);
    console.log('ok');

    fs.writeFileSync("./NOT_FIND_ORIGINAL.json", JSON.stringify(NOT_FIND_ORIGINAL, null, 4));
    fs.writeFileSync("./NOT_FORMAT_FILE.json", JSON.stringify(NOT_FORMAT_FILE, null, 4));
})();


