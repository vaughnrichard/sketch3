/* This function deals with the analysis of sound energy. */
import { findNotes } from "./notes.js";

/**
 * Parameters for tweaking performance
 */
const kernel_len = 5;


/**
 * This function cleans given sound energy data for later processing. It
 * removes values below a quarter of the power of the max, takes a logarithm,
 * and scales it to the minimum non-zero value. Also takes a type for what
 * should be returned.
 * @param {Float64Array} data - data of the sound energy from a sample
 * @param {string} type - type of array to return. types: 'standard',
 * 'ma' for moving average, or 'var' for moving variance
 * @returns Array of cleaned data
 */
function cleanData(data, type='ma') {
    const max_original = data.reduce((a, b) => Math.max(a, b));


  // adjust data so that any insignificant data is forgotten
  let new_data = data.map(function (val) {
    const adj = val - (max_original * .25); // a quarter seems to be good for quite places
    if (adj < 0) {
      return .1;
    }
    return adj;
  })

  new_data = new_data.map(function (val) {
    return Math.log2(val)
  })

  // remove any invalid data points
  new_data = new_data.filter(function (val) {
    return val != -Infinity;
  })

  // const min = new_data.reduce((a, b) => Math.min(a, b));

  let min = Infinity;

  for (let i = 0; i < new_data.length; i++) {
    if (new_data[i] < min && new_data[i] >= 0) {
      min = new_data[i];
    }
  }

  new_data = new_data.map( function (val) {
    const adj =  val - min;
    if (adj < 0) { return 0; }

    return adj;
  })


  // with the data cleaned, take a moving average
  if (new_data.length < kernel_len) { throw new Error("Given sample was too short. Improve to remove this liability in the future. ")}

  // create a queue for the moving average
  const ma_queue = new Array(kernel_len);

  for (let i = 0; i < kernel_len; i++) {
    ma_queue[i] = new_data[i]
  }

  // create two arrays to calculate the moving average and moving variance
  const ma_array = new Array(new_data.length - kernel_len);
  const var_array = new Array(new_data.length - kernel_len);

  // loop to calcualte the ma / moving var
  for (let i = 0; i < ma_array.length; i++) {
    const sum = ma_queue.reduce((accumulator, currentValue) => accumulator + currentValue, 0);
    const mean = sum / kernel_len;

    ma_array[i] = mean;

    let variance = 0;
    // ma_queue should be kernel_length
    for (let j = 0; j < ma_queue.length; j++) {
      variance += (ma_queue[j] - mean) ** 2;
    }

    var_array[i] = variance / kernel_len;

    ma_queue.pop()
    ma_queue.push(new_data[i + kernel_len])

  }

  if (type == 'standard') {
    return new_data;
  } else if (type == 'ma') {
    return ma_array;
  } else if (type == 'var') {
    return var_array;
  } else {
    throw new Error("Clean Data: bad return type given!");
  }

}

/**
 * This function takes an array of cleaned data and returns an array of 1's/0's
 * of where detected notes are.
 * @param {Float64Array} data - data used to detect notes. should be cleaned
 * @returns Array of 1/0's corresponding to the index in the original array of
 * when a note is playing
 */
function detectFromClean(data) {
    
    const ans = new Uint8Array(data.length + kernel_len)

    for (let i = 0; i < kernel_len ; i++) {
        ans[i] = 0;
    }


    // let inNote = false;
    for (let i = 0; i < data.length; i++) {
        if ( data[i] == 0 ) {
            // inNote = false;
            ans[i + (kernel_len - 1)] = 0;
        }

        else {
            ans[i + (kernel_len - 1)] = 1
        }
    }

    return ans;
}

/**
 * This function takes raw data and detects where notes are in it
 * @param {Float64Array} raw_sound_data - raw sound data
 * @param {string} type - type of cleaned data to return
 * @returns array of Notes
 */
function returnNotesArray(raw_sound_data, type='ma') {

    // clean the raw data
    const cleanedData = cleanData(raw_sound_data, type)

    // turn it into an array of 1/0's for if theres a not or not
    const notesBool = detectFromClean(cleanedData)

    // get a notes array
    return findNotes(notesBool)
}

export {cleanData, returnNotesArray}