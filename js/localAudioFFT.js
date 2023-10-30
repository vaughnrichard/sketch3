import { graphFFT } from "./fft.js";

// Get elements
const endorsToi = new Audio('./test/endorstoi.mp3');
const displayVis = document.getElementById('displayVis');

const playTestAudio = document.getElementById('playTestAudio');
const stopTestAudio = document.getElementById('stopTestAudio');

const audioContext = new (window.AudioContext || window.webkitAudioContext)();;
const analyzer = audioContext.createAnalyser();
analyzer.fftSize = 32768;

const source = audioContext.createMediaElementSource(endorsToi);
source.connect(analyzer);


async function startAudio() {
  endorsToi.play();
}


function initLocalAudio() {
  playTestAudio.addEventListener('click', startAudio);


  stopTestAudio.addEventListener('click', () => {
    endorsToi.pause();

    graphFFT(analyzer, displayVis);
  });
}

export { initLocalAudio }