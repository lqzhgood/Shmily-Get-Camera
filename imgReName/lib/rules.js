const path = require('path');
const dayjs = require('dayjs');
const customParseFormat = require('dayjs/plugin/customParseFormat');
dayjs.extend(customParseFormat);

// YYYY-MM-DD HH:mm:ss
// new RegExp(`^${YYYY}-${MM}-${DD} ${HH}:${mm}:${ss}$`)

const YYYY = '\\d{4}'; // 0000 - 9999
const MM = '[0-1]\\d'; // 01 - 12
const DD = '[0-3]\\d'; // 01 - 31
const HH = '[0-2]\\d'; // 01 -24
const mm = '[0-5]\\d'; // 01 - 59
const ss = '[0-5]\\d'; // 01 - 59
const SSS = '\\d{3}'; // 01 - 59
const timestamp = '\\d{13}';

// reg time 都不计扩展名
const rules = [
    {
        tmp: ['259327.mp4'], // md5
        reg: R(`\\d{5,6}`),
    },
    {
        tmp: ['05114501091635abd2550070.mp4'], // md5
        reg: R(`[a-fA-F0-9]{24}`),
    },
    {
        tmp: ['6889e6f3b40899cb9e7a0e244c709ac3.mp4'], // md5
        reg: R(`[a-fA-F0-9]{32}`),
    },
    {
        tmp: ['2019-02-06 10-18-01.mp4'],
        reg: R(`${YYYY}-${MM}-${DD} ${HH}-${mm}-${ss}`),
        get: n => n.match(/^\d{4}-\d{2}-\d{2} \d{2}-\d{2}-\d{2}$/)[0],
        format: 'YYYY-MM-DD HH-mm-ss',
    },
    {
        tmp: ['2009-10-02 11-38-56 b6723f.jpg'],
        reg: R(`${YYYY}-${MM}-${DD} ${HH}-${mm}-${ss} [A-Za-z0-9]{6}`),
        get: n => n.match(/^\d{4}-\d{2}-\d{2} \d{2}-\d{2}-\d{2}/)[0],
        format: 'YYYY-MM-DD HH-mm-ss',
    },
    {
        tmp: ['IMG_20131207_225554.jpg'], // 群辉
        reg: R(`IMG_${YYYY}${MM}${DD}_${HH}${mm}${ss}`),
        get: n => n.match(/(?<=IMG_)\d{8}_\d{6}/)[0],
        format: 'YYYYMMDD_HHmmss',
        exact: true,
    },
    {
        tmp: [
            'IMG_20160428_083349_1.jpg',
            'IMG_20160502_114217_HDR.jpg',
            'IMG_20200216_234413_HHT.jpg',
            'IMG_20160205_174550_BURST2.jpg',
        ],
        reg: R(`IMG_${YYYY}${MM}${DD}_${HH}${mm}${ss}_(\\d|HDR|HHT|BURST\\d)`),
        get: n => n.match(/(?<=IMG_)\d{8}_\d{6}/)[0],
        format: 'YYYYMMDD_HHmmss',
    },
    {
        tmp: ['MVIMG_20210228_164111.jpg'],
        reg: R(`MVIMG_${YYYY}${MM}${DD}_${HH}${mm}${ss}`),
        get: n => n.match(/(?<=MVIMG_)\d{8}_\d{6}/)[0],
        format: 'YYYYMMDD_HHmmss',
    },
    {
        tmp: ['20140521_141121.JPG'], // 2014-05-21 14:11:21
        reg: R(`${YYYY}${MM}${DD}_${HH}${mm}${ss}`),
        get: n => n.match(/^\d{8}_\d{6}$/)[0],
        format: 'YYYYMMDD_HHmmss',
    },
    {
        tmp: ['2017-03-03.jpg', '2017-04-01(4).jpg', '2017-03-04 (2).jpg'],
        reg: R(`${YYYY}-${MM}-${DD}(\\s){0,1}([(|（]\\d{1,}[)|）]){0,1}`),
        get: n => n.match(/^\d{4}-\d{2}-\d{2}/)[0],
        format: 'YYYY-MM-DD',
    },
    {
        tmp: ['20120402.jpg', '20120402(004).jpg', '20120402(4).jpg', '20120402 (2).jpg'],
        reg: R(`${YYYY}${MM}${DD}(\\s){0,1}([(|（]\\d{1,}[)|）]){0,1}`),
        get: n => n.match(/^\d{8}/)[0],
        format: 'YYYYMMDD',
    },
    {
        tmp: ['IMG20180420160854.jpg'],
        reg: R(`IMG${YYYY}${MM}${DD}${HH}${mm}${ss}`),
        get: n => n.match(/\d{14}$/)[0],
        format: 'YYYYMMDDHHmmss',
    },
    {
        tmp: ['1490353778329.jpg'],
        reg: /^[1-2]\d{12}$/, // 1000000000000 - 2999999999999  (2001/9/9 09:46:40 - 2065/1/24 13:19:59)
        get: n => dayjs(Number(n)).format('YYYY-MM-DD HH:mm:ss:SSS'),
        format: 'YYYY-MM-DD HH:mm:ss:SSS',
    },
    // {
    //     tmp: ['1577243856162+984440050.jpg', '1577243858835+-1974986875.jpg'],
    //     reg: /^[1-2]\d{12}\+?-?\d+$/,
    // },
    {
        tmp: ['1240892698.jpg'],
        reg: /^[1-2]\d{9}$/,
        get: n => dayjs(Number(n) * 1000).format('YYYY-MM-DD HH:mm:ss:SSS'),
        format: 'YYYY-MM-DD HH:mm:ss:SSS',
    },
    {
        tmp: ['200910071049.jpg'],
        reg: R(`${YYYY}${MM}${DD}${HH}${mm}`),
        get: n => n.match(/^\d{12}$/)[0],
        format: 'YYYYMMDDHHmm',
    },
    {
        tmp: ['2018_09_06_20_40_24_capture.jpg'], // 2018-09-06 20:40:24
        reg: R(`${YYYY}_${MM}_${DD}_${HH}_${mm}_${ss}_capture`),
        get: n => n.match(/^\d{4}_\d{2}_\d{2}_\d{2}_\d{2}_\d{2}/)[0],
        format: 'YYYY_MM_DD_HH_mm_ss',
    },
    {
        tmp: ['MYXJ_20170228133622_fast.jpg'],
        reg: R(`MYXJ_${YYYY}${MM}${DD}${HH}${mm}${ss}_fast`),
        get: n => n.match(/_\d{14}_/)[0],
        format: '_YYYYMMDDHHmmss_',
    },
    {
        tmp: ['VID_20140203_112623.mp4'], // 2014-02-03 11:26:23
        reg: R(`VID_${YYYY}${MM}${DD}_${HH}${mm}${ss}`),
        get: n => n.match(/_\d{8}_\d{6}$/)[0],
        format: '_YYYYMMDD_HHmmss',
    },
    {
        tmp: ['VUE20170225231840.mp4'], // 2017-02-24 23:18:40
        reg: R(`VUE${YYYY}${MM}${DD}${HH}${mm}${ss}`),
        get: n => n.match(/\d{14}$/)[0],
        format: 'YYYYMMDDHHmmss',
    },
    {
        tmp: ['20130422495.jpg'], // 2013-04-22 index
        reg: R(`${YYYY}${MM}${DD}\\d{3}`),
        get: n => n.match(/^\d{8}/)[0],
        format: 'YYYYMMDD',
    },
    {
        tmp: ['P50122-144128.jpg', 'P31220-161541_4.jpg'], // 2015-01-22 14:41:28
        reg: R(`P\\d${MM}${DD}-${HH}${mm}${ss}([_-]\\d{1,2}){0,1}`),
        get: n => '201' + n.match(/\d{5}-\d{6}/)[0],
        format: 'YYYYMMDD-HHmmss',
    },
    {
        tmp: ['V31108-190109.mp4'],
        reg: R(`V\\d${MM}${DD}-${HH}${mm}${ss}([_-]\\d{1,2}){0,1}`),
        get: n => '201' + n.match(/\d{5}-\d{6}/)[0],
        format: 'YYYYMMDD-HHmmss',
    },
    {
        tmp: [
            'mmexport1405777757319.jpg',
            'mmexport1512369238822_mr1512369291722.jpg',
            'mmexport1512369238822_mr1512369291722_mh1512369368931',
        ],
        reg: R(`mmexport${timestamp}(_mr${timestamp}){0,1}(_mh${timestamp}){0,1}`),
        get: n => dayjs(Number(n.match(/\d{13}$/)[0])).format('YYYY-MM-DD HH:mm:ss:SSS'),
        format: 'YYYY-MM-DD HH:mm:ss:SSS',
    },
    {
        tmp: ['wx_camera_1544502602122.mp4'],
        reg: R(`wx_camera_${timestamp}`),
        get: n => dayjs(Number(n.match(/\d{13}$/)[0])).format('YYYY-MM-DD HH:mm:ss:SSS'),
        format: 'YYYY-MM-DD HH:mm:ss:SSS',
    },
    {
        tmp: ['microMsg.1424679768887.jpg'],
        reg: R(`microMsg\\.${timestamp}`),
        get: n => dayjs(Number(n.match(/\d{13}$/)[0])).format('YYYY-MM-DD HH:mm:ss:SSS'),
        format: 'YYYY-MM-DD HH:mm:ss:SSS',
    },
    {
        tmp: ['FILE0197.mp4'], // FILE index
        reg: R(`FILE\\d{4}`),
    },
    {
        tmp: ['DSC01741.JPG'], // FILE index
        reg: R(`DSC\\d{5}`),
    },
    {
        tmp: ['MOV01969.MPG'], // FILE index
        reg: R(`MOV\\d{5}`),
    },
    {
        tmp: ['2205251638112036chatroom_hd.mp4', '2208091604066661.mp4'],
        reg: R(`\\d{2}${MM}${DD}${HH}${mm}${ss}\\d{4,5}(chatroom){0,1}(_hd){0,1}`),
        get: n => '20' + n.match(/^\d{12}/)[0],
        format: 'YYYYMMDDHHmmss',
    },
    {
        tmp: ['Screenshot_2019-10-04-09-58-50-314_com.eg.android.AlipayGphone.jpg'],
        reg: R(`Screenshot_${YYYY}-${MM}-${DD}-${HH}-${mm}-${ss}-${SSS}_[\\w|\\.]+`),
        get: n => n.match(/\d{4}-\d{2}-\d{2}-\d{2}-\d{2}-\d{2}-\d{3}/)[0],
        format: 'YYYY-MM-DD-HH-mm-ss-SSS',
        exact: true,
    },
    {
        tmp: ['Screenshot_2014-04-01-12-42-54.png'],
        reg: R(`Screenshot_${YYYY}-${MM}-${DD}-${HH}-${mm}-${ss}`),
        get: n => n.match(/\d{4}-\d{2}-\d{2}-\d{2}-\d{2}-\d{2}/)[0],
        format: 'YYYY-MM-DD-HH-mm-ss',
        exact: true,
    },
    {
        tmp: ['Screenshot_20170210-231830.png', 'Screenshot_Retro_Music_20180702-155531.png'],
        reg: R(`Screenshot_(Retro_Music_){0,1}${YYYY}${MM}${DD}-${HH}${mm}${ss}`),
        get: n => n.match(/\d{4}\d{2}\d{2}-\d{2}\d{2}\d{2}/)[0],
        format: 'YYYYMMDD-HHmmss',
        exact: true,
    },
    {
        tmp: ['Screenshot_联璧金融_20180628-152938.png'],
        reg: R(`Screenshot_联璧金融_${YYYY}${MM}${DD}-${HH}${mm}${ss}`),
        get: n => n.match(/\d{4}\d{2}\d{2}-\d{2}\d{2}\d{2}/)[0],
        format: 'YYYYMMDD-HHmmss',
        exact: true,
    },
];

rules.forEach(({ tmp, reg, get, format }) => {
    tmp.forEach(t => {
        const { name } = path.parse(t);

        if (!reg.test(name)) {
            console.log(name, reg);
            throw new Error('RegExp not match');
        }

        if (get && !dayjs(get(name), format, true).isValid()) {
            console.log(t, get(name), format);
            throw new Error('dayjs valid error');
        }
    });
});

function R(e) {
    return new RegExp(`^${e}$`);
}

module.exports = rules;
