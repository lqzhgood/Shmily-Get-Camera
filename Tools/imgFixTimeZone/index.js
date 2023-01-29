const fs = require('fs');
const path = require('path');
const dayjs = require('dayjs');
const customParseFormat = require('dayjs/plugin/customParseFormat');
dayjs.extend(customParseFormat);

const { TIME_ZONE } = require('./config');

const DAY_FORMAT = 'YYYY-MM-DD HH-mm-ss';

// addTime('./input/2009-11-12 10-42-54 40744e & Screenshot0007 - 副本.jpg');

const files = fs.readdirSync('./input');

files.forEach(f => {
    addTime(`./input/${f}`);
});

function addTime(f) {
    const { name, ext } = path.parse(f);
    const nTime = name.match(/^(\d{4}-\d{2}-\d{2} \d{2}-\d{2}-\d{2})( .{4}.+)$/)[1];
    const fName = name.match(/^(\d{4}-\d{2}-\d{2} \d{2}-\d{2}-\d{2})( .{4}.+)$/)[2];
    if (!fName) throw new Error(`文件名格式不对 ${name}`);

    const nDayjs = dayjs(nTime, DAY_FORMAT);
    const { mtime } = fs.statSync(f);
    const mDayjs = dayjs(mtime);

    if (nDayjs.format(DAY_FORMAT) != mDayjs.format(DAY_FORMAT)) {
        console.log(`时间不对呀 ${nDayjs.format(DAY_FORMAT)} ${mDayjs.format(DAY_FORMAT)}`);
    }

    const fixTime = nDayjs.add(TIME_ZONE, 'hour');
    fs.utimesSync(f, fixTime.toDate(), fixTime.toDate());
    fs.renameSync(f, `./dist/${fixTime.format(DAY_FORMAT)}${fName}${ext}`);
}
