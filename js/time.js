/** This file deals with the different timing scales. */
import { audioSamplingRate } from "./parameters.js";

// const samplesPerSecond = 1 / audioSamplingRate;

function indexToTime(index) {
    if (index == null ) { return null; }
    return (index * audioSamplingRate / 1000);
}

export { indexToTime }
