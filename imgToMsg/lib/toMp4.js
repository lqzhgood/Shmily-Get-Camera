const ffmpegPath = require('ffmpeg-static');

const exec = require('child_process').exec;
const path = require('path');



function toMp4(filepath, outputDir, outputName) {
    return new Promise((resolve, reject) => {
        const { name: filename, dir } = path.parse(filepath);

        const _outputName = outputName || filename;
        const _outputDir = outputDir || dir;
        const cmdStr = `${ffmpegPath} -y  -i "${path.normalize(filepath)}" -max_muxing_queue_size 1024 -c:a aac -c:v h264 "${path.join(_outputDir, _outputName + '.mp4')}"`;

        // console.log(cmdStr);
        exec(cmdStr, (err, stdout, stderr) => {
            if (err) {
                // console.log('error:' + stderr);
                reject(new Error('error:' + stderr));
            } else {
                resolve(`${path.join(_outputDir, _outputName + '.mp4')}`);
                // console.log(`transform to mp3 success!  ${path.normalize(filepath)}->${path.join(outputDir, _outputName + '.mp3')}`);
            }
        });
    });
}

module.exports = toMp4;