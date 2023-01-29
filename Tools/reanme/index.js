const fs = require('fs');
const path = require('path');

const isArr = [];



hand('G:/Important/');


function hand(dir) {
    const files = fs.readdirSync(dir);
    for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const filePath = path.join(dir, file);
        if (isDir(filePath)) {
            hand(filePath);
        } else {
            const baseName = path.basename(file, path.extname(file));
            if (/^\d{4}_\d{2}_\d{2} \d{2}_\d{2}_\d{2} [A-Za-z0-9]{6}$/.test(baseName)) {
                fs.renameSync(filePath, path.join(dir, file.replace(/_/g, "-")));
                // console.log('baseName', baseName, file.replace(/_/g, "-"));
                isArr.push(baseName);
                console.log('a.length', isArr.length);
            }
        }
    }
}
console.log('a.length', isArr.length);


function isDir(pathName) {
    const stat = fs.statSync(pathName);
    return stat.isDirectory();
}