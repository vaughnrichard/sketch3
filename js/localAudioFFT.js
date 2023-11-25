import { graphData } from "./fft.js";

// Get elements
const endorsToi = new Audio('./test/endorstoi.mp3');
const displayVis = document.getElementById('displayVis');

const playTestAudio = document.getElementById('playTestAudio');
const stopTestAudio = document.getElementById('stopTestAudio');

let audioContext;
let analyzer;
let source;

function startAudio() {
  audioContext.resume();

  analyzer = audioContext.createAnalyser();

  const granularity = 2 ** 11;
  analyzer.fftSize = granularity;

  source.connect(analyzer);

  endorsToi.play();
}

function initAudioContext() {
  audioContext = new (window.AudioContext || window.webkitAudioContext)();


  source = audioContext.createMediaElementSource(endorsToi);
  
}


function initLocalAudio() {
  initAudioContext();

  playTestAudio.addEventListener('click', startAudio);

  stopTestAudio.addEventListener('click', () => {
    endorsToi.pause();
    audioContext.suspend();

    graphData(displayVis, analyzer, true);
  });
}

export { initLocalAudio }