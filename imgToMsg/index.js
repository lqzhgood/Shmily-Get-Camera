const fs = require('fs-extra');
const path = require('path');
const dayjs = require('dayjs');
const customParseFormat = require('dayjs/plugin/customParseFormat');
dayjs.extend(customParseFormat);
const toMp4 = require('./lib/toMp4');

const exiftool = require('node-exiftool');
const ep = new exiftool.ExiftoolProcess('./lib/exiftool.exe');
const EXIF_TOOL = ep.open();

const { PUBLIC_DIR, EXCLUDE_LIST, CONVERSATION_MP4 } = require('./config');

const DIR_INPUT = './input';

if (!fs.existsSync('./dist')) {
    fs.mkdirSync('./dist');
}

(async () => {
    console.time('Time');
    const res = getFile(DIR_INPUT);
    testName(res);
    const msgArr = await pToMsg(res);
    fs.writeFileSync('./dist/Camera.json', JSON.stringify(msgArr, null, 4));
    console.log('ok');
    console.timeEnd('Time');
})();

function getFile(dir, arr = []) {
    const ps = fs.readdirSync(dir);
    for (let i = 0; i < ps.length; i++) {
        const p = ps[i];
        const f = path.join(dir, p);
        if (fs.statSync(f).isDirectory()) {
            getFile(f, arr);
        } else {
            const { base } = path.parse(f);
            if (!EXCLUDE_LIST.includes(base)) arr.push(f);
        }
    }
    return arr;
}

function testName(arr) {
    for (let i = 0; i < arr.length; i++) {
        const p = arr[i];
        const { name } = path.parse(p);
        const t = name.match(/^\d{4}-\d{2}-\d{2} \d{2}-\d{2}-\d{2}/);
        if (!t) throw new Error(`${p} not true name`);
    }
}

async function pToMsg(arr) {
    const msgArr = [];
    for (let i = 0; i < arr.length; i++) {
        const p = arr[i];
        const { name } = path.parse(p);
        const t = name.match(/^\d{4}-\d{2}-\d{2} \d{2}-\d{2}-\d{2}/)[0];
        const d = dayjs(t, 'YYYY-MM-DD HH-mm-ss', true);

        const exif = await getExif(p);
        const device = getDevice(exif);

        const m = await getContentAndHtmlByExt(p);

        const msg = {
            source: 'Camera',
            device,
            type: m.type,

            direction: 'go',

            day: d.format('YYYY-MM-DD'),
            time: d.format('HH:mm:ss'),
            ms: d.valueOf(),
            content: m.content,
            html: m.html,

            $Camera: {
                exif,
            },
        };
        msgArr.push(msg);
    }
    return msgArr;
}

/**
 * @name: 通过后缀分别生成 content 和 HTML 信息
 * @description:
 * @param {*} p
 * @return {*}
 */
async function getContentAndHtmlByExt(p) {
    const { name, ext: _ext, dir } = path.parse(p);
    const ext = _ext.toLowerCase();

    const urlNoExt = path
        .join(dir, name)
        .replace(/^input/, PUBLIC_DIR)
        .replace(/\\/g, '/');

    const outP = dir.replace(/^input/, 'dist');
    fs.mkdirpSync(outP);

    switch (ext) {
        case '.jpg':
        case '.jpeg':
        case '.png':
        case '.gif':
            fs.copySync(p, p.replace(/^input/, 'dist'));
            return { type: '图', content: '[图]', html: `<img src="${encodeURI(urlNoExt + ext)}" />` };
        case '.3gp':
        case '.mov':
        case '.wmv':
        case '.mp4': // .mp4 有可能有 html 不支持的封装,那么还是需要转码
            // eslint-disable-next-line no-case-declarations
            if (CONVERSATION_MP4) {
                const mp4S = await toMp4(p, outP);
                console.log('mp4S', mp4S);
            } else {
                fs.copySync(p, p.replace(/^input/, 'dist'));
            }

            // fs.unlinkSync(p);
            // eslint-disable-next-line no-fallthrough
            return {
                type: '视频',
                content: '[视频]',
                html: `<video src="${encodeURI(urlNoExt + '.mp4')}" controls></video>`,
            };
        default:
            throw new Error(`unknown type ${ext} ${p}`);
    }
}

/**
 * @name: 获取 Exif 信息
 * @description:
 * @param {*} filePath
 * @return {*}
 */
function getExif(filePath) {
    return EXIF_TOOL.then(() => ep.readMetadata(filePath, ['-File:all']))
        .then(res => {
            if (!res.data) throw new Error(`not have exif ${filePath}`);
            const exifData = res.data[0];
            return exifData;
        })
        .catch(err => {
            // eslint-disable-line
            console.log('exif', err);
        });
}

/**
 * @name: 获取 Exif 里面的设备名称
 * @description:
 * @param {*} exifData
 * @return {*}
 */
function getDevice(exifData) {
    if (!exifData) return 'Phone';
    else {
        const make = exifData.Make || '';
        const model = exifData.Model || '';

        return `${make} ${model}`.trim() || 'Phone';
    }
}

setTimeout(() => {}, 100000);
