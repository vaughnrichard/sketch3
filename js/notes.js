/* This file deals with notes */
import { indexToTime } from "./time.js";
import { lerp } from "./math.js";
import { audioSamplingRate } from "./parameters.js";
import { AudioProcessor } from "./audioProcessing.js";
import { EnergyAnalyzer } from "./energyAnalysis.js";

// let FFT_ARR;

class Note {
    constructor(start, end) {
        this.start = start;
        this.end = end;

        this.startT = indexToTime(start);
        this.endT = indexToTime(end);

        this.frequency = null;
        this.type = null;
        this.meta = null;
    }

    updateEnd(end) {
      this.end = end;
      this.endT = indexToTime(end);
    }

    updateType(type) {
        this.type = type;
    }

    updateMeta(data) {
        this.meta = data;
    }

}

class AudioAnalyzer {
  constructor() {
    this.rawData = null;
    this.energyAnalyzer = new EnergyAnalyzer();
    this.audioProcessor = new AudioProcessor();

    this.notes = [];
  }

  findNotes(rawSoundData) {
    this.notes = this.energyAnalyzer.analyze(rawSoundData);
  }

  spliceAudioByNotes(audioBlob, notesArray, maxNoteIndex, context, callback) {
    let audioBuff = null;

    console.log("splice NA len", notesArray.length);

    // pulle this from the GPT
    function blobToAudioBuffer(blob, context, callback) {
      const fileReader = new FileReader();
      
      // Read the Blob as an ArrayBuffer
      fileReader.onload = function () {
          const arrayBuffer = this.result;
      
          // Decode the ArrayBuffer into an AudioBuffer
          context.decodeAudioData(arrayBuffer, function (audioBuffer) {
          // Callback with the decoded AudioBuffer
          callback(audioBuffer);
          }, function (error) {
          console.error('Error decoding audio data:', error);
          });
      };
      
      // Start reading the Blob as an ArrayBuffer
      fileReader.readAsArrayBuffer(blob);
    }

    const audioAnalyzer = this;
    blobToAudioBuffer(audioBlob, context, function(buff) {
      audioBuff = buff;

      notesArray = audioAnalyzer.correctNotesTiming(buff.duration, notesArray, maxNoteIndex);
      console.log("NA post correct timing", notesArray.length);

      const buffArray = audioAnalyzer.audioProcessor.generateNoteBufferArray(notesArray, buff, context);



      function assignFrequencies(pitchArray) {
        for (let idx = 0; idx < notesArray.length; idx++) {
          notesArray[idx].frequency = pitchArray[idx];
        }
        callback(notesArray);
      }

      audioAnalyzer.audioProcessor.generateFFTArrayAndGoToPDA(buffArray, assignFrequencies); // pass next function to FFT Array
    });


}


  correctNotesTiming(bufferDuration, notesArray, maxNoteIndex) {
    const maxNoteTime = maxNoteIndex * audioSamplingRate / 1000;
  
    for (let i = 0; i < notesArray.length; i++) {
      notesArray[i].startT = lerp(0, bufferDuration, 0, notesArray[i].startT, maxNoteTime);
      notesArray[i].endT = lerp(0, bufferDuration, 0, notesArray[i].endT, maxNoteTime);
    }
  
    return notesArray;
    }
}

export { Note, AudioAnalyzer}