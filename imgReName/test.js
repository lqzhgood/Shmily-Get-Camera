const exiftool = require('node-exiftool');
const ep = new exiftool.ExiftoolProcess('./exiftool.exe');
const fs = require('fs');
const path = require('path');


const PHOTO_PATH = "./input/IMG_0508.MOV";
const rs = fs.createReadStream(PHOTO_PATH);


// ep.open()
//     .then(() => ep.readMetadata("./input/IMG_0511.JPG", ['-File:all']))
//     .then(console.log)
//     .catch(err => {
//         console.log('err', err);
//     });

(async () => {
    console.log('1', 1);
    const x = await readExif('./input/IMG_0459.PNG');
    console.log('x', x);
    console.log('3', 3);
})();

function readExif(filePath) {
    return ep.open()
        .then(() => ep.readMetadata('./input/IMG_0009.JPG', ['-File:all']))
        .then(res => {
            console.log('res', res);
            const exifData = res.data[0];
            console.log('exifData', exifData);
            return 'a';
        })
        .then(() => ep.readMetadata('./input/IMG_00027.JPG', ['-File:all']))
        .then(res => {
            console.log('res', res);
            const exifData = res.data[0];
            console.log('exifData', exifData);
            return 'a';
        })
        .catch(err => {
            console.log('err', err);
            return 'b';
        });

}
