const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const dayjs = require('dayjs');
const customParseFormat = require('dayjs/plugin/customParseFormat');
dayjs.extend(customParseFormat);

const { SKEW } = require('../config.js');
const rules = require('../lib/rules.js');

function getMD5(filePath) {
    return new Promise((resolve, reject) => {
        const stream = fs.createReadStream(filePath);
        const fsHash = crypto.createHash('md5');

        stream.on('data', d => {
            fsHash.update(d);
        });
        stream.on('error', err => {
            reject(err);
        });
        stream.on('end', () => {
            const md5 = fsHash.digest('hex');
            resolve(md5.substr(0, 6));
        });
    });
}

function getFileModifyMs(filePath) {
    const file = fs.statSync(filePath);
    const { atimeMs, mtimeMs, ctimeMs, birthtimeMs } = file;
    const fileMs = Math.min(atimeMs, mtimeMs, ctimeMs, birthtimeMs);
    return parseInt(fileMs, 10);
}

function getFilePart(location) {
    return new Promise((resolve, reject) => {
        const chunks = [];
        fs.createReadStream(location, {
            encoding: null,
            // start: 0,
            // end: 2048 * 1024,
        })
            .on('data', chunk => {
                chunks.push(chunk);
            })
            .on('end', () => {
                resolve(Buffer.concat(chunks));
            })
            .on('error', reject);
    });
}

function getFileNameMs(filePath) {
    const { name } = path.parse(filePath);
    let ms;

    for (let i = 0; i < rules.length; i++) {
        const r = rules[i];
        if (r.reg.test(name)) {
            // 无 get 代表名字中不含时间
            if (r.get) {
                const t = dayjs(r.get(name), r.format, true);
                if (t.isValid()) {
                    ms = t.valueOf();
                    return [ms, r.format, r.exact];
                }
            } else {
                return [null, null];
            }
        }
    }

    console.log('filePath', filePath);
    throw new Error('not match fileName, need add rules');
}

function timeIsSame(d1, d2, accuracy) {
    if (!d1 || !d2 || !d1.isValid() || !d2.isValid()) {
        console.log('d1', d1);
        console.log('d2', d2);
        throw new Error('date is not valid');
    }

    if (accuracy) {
        const s = d1.format(accuracy) === d2.format(accuracy);
        if (s) return true;
    }
    // 没有匹配到可能有误差, 再判断误差

    const ms1 = d1.valueOf();
    const ms2 = d2.valueOf();

    return ms2 > ms1 - SKEW && ms2 < ms1 + SKEW;
}

module.exports = {
    getMD5,
    getFileModifyMs,
    getFileNameMs,
    timeIsSame,
};
