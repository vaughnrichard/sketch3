import { graphData, measureSoundEnergy, resetTimeDomain, timeDomainArray } from "./fft.js";

// maybe refer to this example :
// https://developer.mozilla.org/en-US/docs/Web/API/AnalyserNode/fftSize

// need to update it to match local audio file

// Get elements
const displayVis = document.getElementById('displayVis');
const recordAudio = document.getElementById('recordAudio');
const stopButton = document.getElementById('stopButton');


let mediaRecorder;
let audioContext;

async function startRecording() {
  if (recordingOn) { return; }

  recordingOn = true;

  let audioChunks = [];
  audioContext = new (window.AudioContext || window.webkitAudioContext)();

  const analyzer = audioContext.createAnalyser();

  const granularity = 2 ** 11;
  analyzer.fftSize = granularity;

  const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
  mediaRecorder = new MediaRecorder(stream);

  const source = audioContext.createMediaStreamSource(stream);

  source.connect(analyzer);

  mediaRecorder.ondataavailable = (e) => {
      if (e.data.size > 0) {
          audioChunks.push(e.data);
      }
  };

  mediaRecorder.onstop = () => {
    recordingOn = false;
    // const audioBlob = new Blob(audioChunks, { type: 'audio/wav' });
    // // console.log(audioBlob.arrayBuffer)
    // const audioUrl = URL.createObjectURL(audioBlob);

    keepDetecting = false;

    // console.log(analyzer)

    // console.log(timeDomainArray);
    graphData(displayVis, null, false);
    // graphTimeDomain(timeDomainArray, displayVis);
    resetTimeDomain();
  };

  mediaRecorder.start();

  let keepDetecting = true;

  function energyCollectionLoop() {
    if (keepDetecting) {
      // timeDomainArray = [];
      measureSoundEnergy(analyzer);
      const samplingRate = .0167;
      setTimeout(energyCollectionLoop, samplingRate);
    }
  }

  energyCollectionLoop();
}

let recordingOn = false;

function initUserAudio() {
  recordAudio.addEventListener('click', startRecording);

  stopButton.addEventListener('click', () => {
    mediaRecorder.stop();
    audioContext.close();
  });
}

export { initUserAudio }