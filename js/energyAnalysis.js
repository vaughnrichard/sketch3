/* This function deals with the analysis of sound energy. */
import { Note } from "./notes.js";

class EnergyAnalyzer {
  constructor(kernelLen=5) {
    this.kernelLen = kernelLen;

    this.rawSoundData = null;
    this.cleanedData = null;
    this.noteBoolArray = null; // 1 or 0 corresponding to if it is a note or not
    this.notes = null;
  }


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
  cleanData(data, type='ma') {
    // find the maximum value of the dataset
    const max_original = data.reduce((a, b) => Math.max(a, b));

    // adjust data so that any insignificant data is forgotten
    // widly poor performance in detection, should rewrite this algorithm
    let new_data = data.map(function (val) {
      const adj = val - (max_original * .25); // a quarter seems to be good for quite places
      if (adj < 0) {
        return .1;
      }
      return adj;
    })
  
    // take the logarithm of the filtered data
    new_data = new_data.map(function (val) {
      return Math.log2(val)
    })
  
    // remove any invalid data points
    new_data = new_data.filter(function (val) {
      return val != -Infinity;
    })
  
    // initialize minimum to impossibly large num
    let min = Infinity;
  
    // find minimum value
    for (let i = 0; i < new_data.length; i++) {
      if (new_data[i] < min && new_data[i] >= 0) {
        min = new_data[i];
      }
    }
  
    // scale everything but the minimum, setting all values <= minimum to 0 (since min - min = 0)
    new_data = new_data.map( function (val) {
      const adj =  val - min;
      if (adj < 0) { return 0; }
  
      return adj;
    })
  
  
    // with the data cleaned, take a moving average
    if (new_data.length < this.kernelLen) { throw new Error("Given sample was too short. Improve to remove this liability in the future. ")}
  
    // create a queue for the moving average
    const ma_queue = new Array(this.kernelLen);
  
    for (let i = 0; i < this.kernelLen; i++) {
      ma_queue[i] = new_data[i]
    }
  
    // create two arrays to calculate the moving average and moving variance
    const ma_array = new Array(new_data.length - this.kernelLen);
    const var_array = new Array(new_data.length - this.kernelLen);
  
    // loop to calcualte the ma / moving var
    for (let i = 0; i < ma_array.length; i++) {
      const sum = ma_queue.reduce((accumulator, currentValue) => accumulator + currentValue, 0);
      const mean = sum / this.kernelLen;
  
      ma_array[i] = mean;
  
      let variance = 0;
      // ma_queue should be kernel_length
      for (let j = 0; j < ma_queue.length; j++) {
        variance += (ma_queue[j] - mean) ** 2;
      }
  
      var_array[i] = variance / this.kernelLen;
  
      ma_queue.pop()
      ma_queue.push(new_data[i + this.kernelLen])
  
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
  detectFromClean(data) {
    const ans = new Uint8Array(data.length + this.kernelLen)

    for (let i = 0; i < this.kernelLen ; i++) {
        ans[i] = 0;
    }


    // let inNote = false;
    for (let i = 0; i < data.length; i++) {
        if ( data[i] == 0 ) {
            // inNote = false;
            ans[i + (this.kernelLen - 1)] = 0;
        }

        else {
            ans[i + (this.kernelLen - 1)] = 1
        }
    }

    return ans;
  }

  findNotes(parsedNoteArray) {
    const notesArray = new Array();

    let inNote = false;
    let currentNote = null;

    for (let i = 0; i < parsedNoteArray.length; i++) {
        if (parsedNoteArray[i] == 1) {
            if (!inNote) {
                currentNote = new Note(i, null);
                inNote = true;
            }
        }

        else {
            if (inNote) {
                currentNote.updateEnd(i);
                notesArray.push(currentNote);

                inNote = false;
                currentNote = null;
            }
        }
    }

    if (currentNote != null) {
        currentNote.updateEnd(parsedNoteArray.length - 1);
        notesArray.push(currentNote);
    }
    

    return notesArray;
  }

  // analyzes data, returning an array of notes
  analyze(rawSoundData, type='ma') {
    this.rawSoundData = rawSoundData;
    this.cleanedData = this.cleanData(this.rawSoundData);
    this.noteBoolArray = this.detectFromClean(this.cleanedData);
    this.notes = this.findNotes(this.noteBoolArray);

    console.log("cleaned data", this.cleanedData);
    console.log("noteboolarray", this.noteBoolArray);
    console.log("notes", this.notes);

    return this.notes;
  }
 }

export { EnergyAnalyzer }