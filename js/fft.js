/** File to Deal with FFT stuff */
// import {cleanData, returnNotesArray } from './energyAnalysis.js'
import { EnergyAnalyzer } from "./energyAnalysis.js";

const energyAnalyzer = new EnergyAnalyzer();

const keepAtPageSize = false;
// given an array and a canvas, this will draw the FFT over the canvas's dimensions
function graphFFT(analyzer, canvas) {
  const bufferLength = analyzer.frequencyBinCount;
  const dataArray = new Uint8Array(bufferLength); // can also do float data if desired
  analyzer.getByteFrequencyData(dataArray);

  canvas.width = dataArray.length;
  let width = dataArray.length;
  if (keepAtPageSize) {
    canvas.width = window.innerWidth;
    width = canvas.width;
  }

  const lineWidth = width / dataArray.length;

  const heightAdjustment = canvas.height / 256;

  const ctx = canvas.getContext('2d');

  ctx.clearRect(0, 0, canvas.width, canvas.height);

  ctx.fillStyle = 'black';

  for (let i = 0; i < dataArray.length; i++) {
    ctx.fillRect(i * lineWidth , canvas.height, lineWidth, -dataArray[i] * heightAdjustment);
  }
}

function detectPitch(analyzer) {
  
}


// store values in here
var timeDomainArray = new Array();

const energyVal = document.getElementById("energyDisplay");
// Call this function periodically to measure the sound energy
function measureSoundEnergy(analyzer) {
  // console.log("inhere");

  const bufferLength = analyzer.frequencyBinCount;
  const dataArray = new Uint8Array(bufferLength); // can also do float data if desired
  analyzer.getByteFrequencyData(dataArray);

  // console.log(dataArray);

  // Calculate the average energy in the frequency data
  let sum = 0;
  for (let i = 0; i < dataArray.length; i++) {
    sum += dataArray[i];
  }

  // timeDomainArray.push(sum);
  timeDomainArray.push(sum);
  // console.log(timeDomainArray.length);

  energyVal.innerHTML = sum;
}

function resetTimeDomain() {
  timeDomainArray = [];
}

function graphTimeDomain(dummy, canvas) {
  const data = timeDomainArray;
  canvas.width = data.length;
  let width = data.length;

  if (keepAtPageSize) {
    canvas.width = window.innerWidth;
    width = canvas.width;
  }

  const lineWidth = width / data.length;

  const heightAdjustment = canvas.height / 256;

  const ctx = canvas.getContext('2d');

  ctx.clearRect(0, 0, canvas.width, canvas.height);

  const notesArray = energyAnalyzer.analyze(timeDomainArray, 'ma');
  const data_set = energyAnalyzer.cleanedData;

  function graphMetric( dataset ) {
    const max = dataset.reduce((a, b) => Math.max(a, b));

    // normalize
    dataset = dataset.map( function (val) {
      return val / max;
    })

    // console.log(dataset)

    dataset = dataset.map( function (val) {

      return canvas.height * val;
    })

    // initialized to 1 because the first entry is the note object
    // by my implementation
    let curNote = 1;
    console.log(notesArray)

    for (let i = 0; i < dataset.length; i++) {

      ctx.fillStyle = 'black';
      if (curNote < notesArray.length) {
        if (i >= notesArray[curNote].end) {
          curNote += 1;
        }

        else if (i >= notesArray[curNote].start) {
          // console.log('in here');
          ctx.fillStyle = 'red';
        }
      }

      // console.log(dataset[i])
      ctx.fillRect(i * lineWidth , canvas.height, lineWidth, -dataset[i]);
    }
  }

  graphMetric(timeDomainArray);
  
}

function graphData(canvas, graphParameter, fft) {
  if (fft) {
    graphFFT(graphParameter, canvas);
  } else {
    graphTimeDomain(null, canvas);
  }
}

export { graphData, measureSoundEnergy, timeDomainArray, resetTimeDomain }