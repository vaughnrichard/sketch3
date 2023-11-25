// General math functions

function clamp(val, min, max) {
    if (val < min) {
        return min;
    } else if (val > max) {
        return max;
    }
    return val;
}

export {clamp}