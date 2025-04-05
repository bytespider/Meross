"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.calculatePaddingForBlockSize = calculatePaddingForBlockSize;
exports.pad = pad;
exports.trimPadding = trimPadding;
const buffer_1 = require("buffer");
function calculatePaddingForBlockSize(data, blockSize) {
    return blockSize - (data.length % blockSize);
}
function pad(data, length, fill) {
    return buffer_1.Buffer.concat([data, buffer_1.Buffer.alloc(length, fill)]);
}
function trimPadding(data, fill) {
    if (data.length === 0) {
        return data;
    }
    fill = getFillByte(fill);
    let length = data.length;
    // starting from the end iterate backwards and check if the byte is equal to the fill
    while (length > 0 && data[length - 1] === fill) {
        length--;
    }
    return data.subarray(0, length);
}
function getFillByte(fill) {
    if (typeof fill === 'string') {
        fill = buffer_1.Buffer.from(fill, 'utf-8');
    }
    else if (fill instanceof Uint8Array) {
        fill = buffer_1.Buffer.from(fill);
    }
    else if (fill === undefined) {
        fill = 0;
    }
    // check if the fill is a buffer
    if (buffer_1.Buffer.isBuffer(fill)) {
        fill = fill[0];
    }
    else if (typeof fill === 'number') {
        fill = fill;
    }
    return fill;
}
exports.default = {
    calculatePaddingForBlockSize,
    pad,
    trimPadding,
};
