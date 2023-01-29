module.exports = {
    INPUT_DIR: './input',
    OUTPUT_DIR: './dist',
    MODE: 'Rename', // 'check' check模式不修改文件 只输出结果
    NAME_SPLIT: ' & ', // 非必要不要改
    SKEW: 60 * 1000, // 允许的时间误差 (exif / 文件名  / 修改时间 等)
};
