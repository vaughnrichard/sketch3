/* This file deals with processing the audio data */
import { granularity } from "./parameters.js";

function spliceAudio(startTime, endTime, buffer, context) {

  const startIndex = Math.floor(startTime * buffer.sampleRate);
  const endIndex = Math.min(Math.floor(endTime * buffer.sampleRate), buffer.length);
  // console.log(startTime);
  // console.log(endTime);

  const bufferLength = endIndex - startIndex;
  if (bufferLength <= 0) {
    const dummyBuff = context.createBuffer(buffer.numberOfChannels, 1, buffer.sampleRate);
    return dummyBuff;
  }

  console.log(bufferLength);
  const retBuffer = context.createBuffer(
    buffer.numberOfChannels,
    bufferLength,
     buffer.sampleRate
  );

  // Copy data from the original buffer to the new buffer
  for (let channel = 0; channel < buffer.numberOfChannels; channel++) {
    const channelData = buffer.getChannelData(channel);
    const newChannelData = retBuffer.getChannelData(channel);

    for (let i = 0; i < retBuffer.length; i++) {
      newChannelData[i] = channelData[startIndex + i];
    }
  }

  return retBuffer;
}


function generateNoteBufferArray(notesArray, buffer, context) {

  const audioArray = new Array(AudioBuffer);

  for (let i = 1; i < notesArray.length; i++ ) {
    const note = notesArray[i];
    // console.log(note)
    const noteBuffer = spliceAudio(note.startT, note.endT, buffer, context);
    audioArray.push(noteBuffer);
  }

  return audioArray;

}

function generateFFTFromBuffer(buffer, fn) {
  // const offlineContext = new OfflineAudioContext();
  // const offlineContext = new webkitOfflineAudioContext();
  const audioCtx = new (window.AudioContext || window.webkitAudioContext)();

  const analyzer = audioCtx.createAnalyser();
  analyzer.fftSize = granularity;
  const source = audioCtx.createBufferSource();
  source.buffer = buffer;

  source.connect(analyzer);
  // analyzer.connect(context.destination);

  // source.connect(audioCtx.destination);
  const dataArray = new Uint8Array( analyzer.frequencyBinCount );


  function ended(e) {
    // analyzer.getByteFrequencyData(dataArray);

    // import to close the context, for some reason!
    audioCtx.close();
    fn(analyzer);
  };

  source.onended = ended;

  source.start();

}

function generateFFTArrayAndGoToPDA(bufferArray, fn) {
  const fftArray = new Array( bufferArray.length - 1 );

  for (let i = 1; i < bufferArray.length; i++) {
    function addToArray(fft) {
      fftArray[i - 1] = fft;

      let continuePDA = true;
      for (let arr = 0; arr < bufferArray.length - 1; arr++) {
        // console.log()
        if (fftArray[arr] == undefined) { continuePDA = false; return; }
      }

      if (continuePDA) { 
        const pitches = detectPitchOnArray(fftArray);
        // console.log(pitches)
        fn(pitches);
      }
    }

    generateFFTFromBuffer( bufferArray[i], addToArray );
  }
}

function detectPitchOnArray(FFT_Array) {
  const notePitchArray = new Array( FFT_Array.length );

  for (let fft_index = 0; fft_index < FFT_Array.length; fft_index++ ) {
    console.log("fft", FFT_Array[fft_index])
    notePitchArray[fft_index] = getPitch( FFT_Array[fft_index], FFT_Array[fft_index].context.sampleRate );
  }

  // console.log(notePitchArray);
  return notePitchArray;
  
}


// courtesy of Professor Briz

/*
    getPitch()

    -----------
       info
    -----------

    this is a function for calculating the frequency in Hz of a sound sample
    from a WebAudio AnalyserNode. as well as a few other helper functions.
    this is 100% Chris Wilson's work: https://github.com/cwilso/PitchDetect

    -----------
       usage
    -----------

    getPitch( fft, ctx.sampleRate )

*/
function noteFromPitch( freq ) {
  var noteNum = 12 * (Math.log( freq / 440 )/Math.log(2) )
  return Math.round( noteNum ) + 69
}

function frequencyFromNoteNumber( note ) {
  return 440 * Math.pow(2,(note-69)/12)
}

function centsOffFromPitch( freq, note ) {
  return Math.floor(
      1200 * Math.log( freq / frequencyFromNoteNumber( note ))/Math.log(2)
  )
}

function getPitch(fft,sampleRate){

  const bufferLength = fft.frequencyBinCount
  const dataArray = new Float32Array(bufferLength)

  const SIZE = dataArray.length
  const MAX_SAMPLES = Math.floor(SIZE/2)
  const MIN_SAMPLES = 0

  let best_offset = -1
  let best_correlation = 0
  let correlations = new Array(MAX_SAMPLES)
  let foundGoodCorrelation = false
  let rms = 0

  fft.getFloatTimeDomainData( dataArray )

  // console.log("dataArray")
  // console.log(dataArray)

  for (let i=0;i<SIZE;i++) {
      let val = dataArray[i]
      rms += val*val
  }
  rms = Math.sqrt(rms/SIZE);
  // if (rms<0.01) { // not enough signal
  //   console.log('here');
  //   return -1;
  // }

  let lastCorrelation=1
  for (let offset = MIN_SAMPLES; offset < MAX_SAMPLES; offset++) {
      let correlation = 0

      for (let j=0; j<MAX_SAMPLES; j++) {
          correlation += Math.abs((dataArray[j])-(dataArray[j+offset]))
      }
      correlation = 1 - (correlation/MAX_SAMPLES)
      // store it, for the tweaking we need to do below.
      correlations[offset] = correlation;

      if ((correlation>0.9) && (correlation > lastCorrelation)) {
          foundGoodCorrelation = true
          if (correlation > best_correlation) {
              best_correlation = correlation
              best_offset = offset
          }
      } else if (foundGoodCorrelation) {
      // short-circuit - we found a good correlation, then a bad one, so we'd
      // just be seeing copies from here. Now we need to tweak the offset - by
      // interpolating between the values to the left and right of the
      // best offset, and shifting it a bit.  This is complex, and HACKY in
      // this code (happy to take PRs!) - we need to do a curve fit on
      // correlations[] around best_offset in order to better determine
      // precise (anti-aliased) offset. we know best_offset >=1, since
      // foundGoodCorrelation cannot go to true until the second pass
      // (offset=1), and we can't drop into this clause until the following
      // pass (else if).
          let shift = (correlations[best_offset+1] -
              correlations[best_offset-1])/correlations[best_offset]
          return sampleRate/(best_offset+(8*shift))
      }
      lastCorrelation = correlation
  }
  if (best_correlation > 0.01) {
    return sampleRate/best_offset
  }
  console.log(best_correlation)
  return -1
}

export { generateNoteBufferArray, generateFFTArrayAndGoToPDA }