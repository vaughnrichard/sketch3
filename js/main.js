// import {} from './lib/addons/p5.sound'
// import * from './lib/p5'

const tracksDiv = document.getElementById("tracks");
const addTrack = document.getElementById("addTrack");
const remTrack = document.getElementById("remTrack");

const endorsToi = new Audio('./test/endorstoi.mp3');

/* This function adds a new default track to the tracks Div */
function addDefTrack() {
    const track = document.createElement('div');
    track.className = "track";

    track.innerHTML = '<p class="trackName" contenteditable="true">Name</p>\
                      <input class="stuff" type="range">\
                      <input class="enabled" type="checkbox">'

    tracksDiv.appendChild(track);
}

function removeTrack() {
  if (tracksDiv.children.length == 0) { return; }
  tracksDiv.removeChild(tracksDiv.children[tracksDiv.children.length - 1]);
}

addTrack.addEventListener("click", addDefTrack);
remTrack.addEventListener("click", removeTrack);

const displayVis = document.getElementById('displayVis');

let mediaRecorder;
let audioContext;
// more test
// record audio segment
const recordAudio = document.getElementById('recordAudio');

async function startRecording() {
  let audioChunks = [];
  audioContext = new (window.AudioContext || window.webkitAudioContext)();

  const analyzer = audioContext.createAnalyser();

  const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
  mediaRecorder = new MediaRecorder(stream);

  const source = audioContext.createMediaStreamSource(stream);
  source.connect(analyzer);
  // endorsToi.
  // analyzer.connect(audioContext.destination);

  // const mediaRecorder = new MediaRecorder(stream);

  mediaRecorder.ondataavailable = (e) => {
      if (e.data.size > 0) {
          audioChunks.push(e.data);
      }
  };

  mediaRecorder.onstop = () => {
      const audioBlob = new Blob(audioChunks, { type: 'audio/wav' });
      console.log(audioBlob.arrayBuffer)
      const audioUrl = URL.createObjectURL(audioBlob);
      // const audio = new Audio(audioUrl);

      // console.log(audio);

      // endorsToi.play();
      analyzer.fftSize = 32768;
      const bufferLength = analyzer.frequencyBinCount;
      const dataArray = new Uint8Array(bufferLength);
      analyzer.getByteFrequencyData(dataArray);

      console.log(dataArray);
      console.log(audioBlob);
      console.log(audioChunks);

      graphFFT(dataArray, displayVis);


      // fft = new p5.FFT();
      // fft.setInput(audio);

      // audioVisualization.innerHTML = 'FFT Analysis:';

      // Perform FFT analysis and visualize the data
      // const spectrum = fft.analyze();
      // console.log(spectrum);
      // for (let i = 0; i < spectrum.length; i++) {
      //   if (spectrum[i] != 0) { console.log(spectrumn[i]); console.log(i);}
      // }
  };

  mediaRecorder.start();
  // startButton.disabled = true;
  // stopButton.disabled = false;
}

recordAudio.addEventListener('click', async () =>{
  startRecording();


})

const stopButton = document.getElementById('stopButton');

stopButton.addEventListener('click', () => {
  mediaRecorder.stop();
  audioContext.close();
})

// given an array and a canvas, this will draw the FFT over the canvas's dimensions
function graphFFT(dataArray, canvas) {
  const width = dataArray.length;
  // const height = 255; // since using 8bit values

  // canvas.height = height;
  // canvas.width = width;


  // const lineWidth = dataArray.length / canvas.width;
  // console.log(lineWidth)
  const heightAdjustment = canvas.height / 256;

  const ctx = canvas.getContext('2d');

  ctx.clearRect(0, 0, canvas.width, canvas.height);

  ctx.fillStyle = 'black';

  for (let i = 0; i < dataArray.length; i++) {
    ctx.fillRect(i , canvas.height, 1, -dataArray[i] * heightAdjustment);
  }
}