/* This file deals with notes */
import { indexToTime } from "./time.js";
import { lerp } from "./math.js";
import { audioSamplingRate } from "./parameters.js";
import { generateNoteBufferArray } from "./audioProcessing.js";

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

function findNotes(parsedNoteArray) {
    let notesArray = new Array(Note);

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

function spliceAudioByNotes(audioBlob, notesArray, maxNoteIndex, context) {

    // create new context
    // const ctx = new (window.AudioContext || window.webkitAudioContext)();

    //
    let audioBuff = null;

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

    blobToAudioBuffer(audioBlob, context, function(buff) {
      audioBuff = buff;
      console.log(audioBuff);
      // console.log(notesArray);
      notesArray = correctNotesTiming(buff.duration, notesArray, maxNoteIndex);
      //   console.log(notesArray);
      const buffArray = generateNoteBufferArray(notesArray, buff, context);
      console.log(buffArray);
    });
}

function correctNotesTiming(bufferDuration, notesArray, maxNoteIndex) {
  const maxNoteTime = maxNoteIndex * audioSamplingRate / 1000;
  // console.log(timeDomainArray.length);

  for (let i = 1; i < notesArray.length; i++) {
    notesArray[i].startT = lerp(0, bufferDuration, 0, notesArray[i].startT, maxNoteTime);
    notesArray[i].endT = lerp(0, bufferDuration, 0, notesArray[i].endT, maxNoteTime);
  }

  return notesArray;

}

export { Note, findNotes, spliceAudioByNotes }