import { graphData, measureSoundEnergy, resetTimeDomain, timeDomainArray } from "./fft.js";
import { audioSamplingRate, granularity } from "./parameters.js";
import { Note, AudioAnalyzer } from "./notes.js";
// import { returnNotesArray } from "./energyAnalysis.js";
import { EnergyAnalyzer } from "./energyAnalysis.js";
import { lerp } from "./math.js";

// maybe refer to this example :
// https://developer.mozilla.org/en-US/docs/Web/API/AnalyserNode/fftSize

// need to update it to match local audio file

// Get elements
const displayVis = document.getElementById('displayVis');
const recordAudio = document.getElementById('recordAudio');
const stopButton = document.getElementById('stopButton');


let mediaRecorder;
let audioContext;

async function startRecording(musDiv, segment=null) {
  if (recordingOn) { return; }

  if (segment === null) {
    console.log("need to pass in segment to function!");
  }

  recordingOn = true;

  let audioChunks = [];
  audioContext = new (window.AudioContext || window.webkitAudioContext)();

  const analyzer = audioContext.createAnalyser();

  analyzer.fftSize = granularity;

  const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
  mediaRecorder = new MediaRecorder(stream);

  const source = audioContext.createMediaStreamSource(stream);

  source.connect(analyzer);

  mediaRecorder.ondataavailable = (e) => {
      // if (e.data.size > 0) {
      audioChunks.push(e.data);
      // }
  };

  mediaRecorder.onstop = async () => {
    recordingOn = false;
    // keepDetecting = false;
    clearInterval(intervalID);

    const audioBlob = new Blob(audioChunks, { type: 'audio/wav' });

    // graph the results
    graphData(displayVis, null, false);

    // get notes
    const energyAnalyzer = new EnergyAnalyzer();
    const notesArray = energyAnalyzer.analyze(timeDomainArray);

    console.log("notes array to be drawn!", notesArray.length);

    // due to filereader, this now must be done by callback functions
    const audioAnalyzer = new AudioAnalyzer()
    audioAnalyzer.spliceAudioByNotes(audioBlob, notesArray, timeDomainArray.length, audioContext, function (notes) {
      segment.addNotes(notes);
      console.log("notes array to be drawn 2.0", notes.length);
      
      
      const noteCanvas = document.createElement('canvas');

      // noteCanvas.notes = notes;

      noteCanvas.style.width = musDiv.offsetWidth + 'px';
      noteCanvas.style.height = musDiv.offsetHeight + 'px';

      musDiv.appendChild(noteCanvas);

      drawNoteCanvas(noteCanvas, notes);

    });
  
    resetTimeDomain();
  };

  mediaRecorder.start();

  // energyCollectionLoop();
  const intervalID = setInterval(function () {
    measureSoundEnergy(analyzer);
  }, audioSamplingRate);
}

/* Functions to deal with the music div & making it work */
function drawNoteCanvas(canvas, notes) {
  const ctx = canvas.getContext("2d");

  function getPixel( noteTimeStep ) {
    return lerp(0, canvas.width, 0, noteTimeStep, notes[notes.length - 1].end);
  }

  ctx.fillStyle = 'red';

  for (let note = 0; note < notes.length; note++ ) {
    const curNote = notes[note];
    const pixelBounds = [getPixel(curNote.start), getPixel(curNote.end)];

    ctx.fillRect(pixelBounds[0], 0, (pixelBounds[1] - pixelBounds[0]), canvas.height );
  }

  ctx.strokeStyle = 'blue';
  ctx.lineWidth = 15;
  ctx.strokeRect(0, 0, canvas.width, canvas.height);
}

// function createToneMelody(notes) {
//   return null;
// }

let recordingOn = false;

function makeButtonStopRecording(button) {
  button.addEventListener('click', function stopTheRecording() {
    mediaRecorder.stop();
    audioContext.close();
    button.removeEventListener('click', stopTheRecording);
  });
}

function initUserAudio() {
  recordAudio.addEventListener('click', startRecording);

  stopButton.addEventListener('click', () => {
    mediaRecorder.stop();
    audioContext.close();
  });
}

export { initUserAudio, startRecording, makeButtonStopRecording }