import { graphFFT } from "./fft.js";

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
  let audioChunks = [];
  audioContext = new (window.AudioContext || window.webkitAudioContext)();

  const analyzer = audioContext.createAnalyser();
  analyzer.fftSize = 32768;

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
      const audioBlob = new Blob(audioChunks, { type: 'audio/wav' });
      console.log(audioBlob.arrayBuffer)
      const audioUrl = URL.createObjectURL(audioBlob);

      graphFFT(analyzer, displayVis);
  };

  mediaRecorder.start();
}

function initUserAudio() {
  recordAudio.addEventListener('click', startRecording);

  stopButton.addEventListener('click', () => {
    mediaRecorder.stop();
    audioContext.close();
  });
}

export { initUserAudio }