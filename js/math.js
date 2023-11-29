// General math functions

function clamp(val, min, max) {
    if (val < min) {
        return min;
    } else if (val > max) {
        return max;
    }
    return val;
}


/**
 * Lerp function, courtesy of GLK
 * @param {Number} y0 - omin
 * @param {Number} y1 - omax
 * @param {Number} x0 - imin
 * @param {Number} x - ival
 * @param {Number} x1 - imax
 * @returns y - the linear interpolated 
 */
function lerp(y0, y1, x0, x, x1) {
    const alpha = ((x - x0) / (x1 - x0));
    // console.log(alpha);

    return lerp3(y0, y1, alpha);
}

function lerp3(y0, y1, alpha) {
    return (((1 - alpha) * y0) + (alpha  * y1));
}

export {clamp, lerp}