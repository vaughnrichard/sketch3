/* This file deals with processing the audio data */
import { granularity } from "./parameters.js";


class AudioProcessor {
  constructor() {

  }

  processAudio(buffer) {
    this.generateFFTArrayAndGoToPDA(buffer, helper);
  }

  generateNoteBufferArray(notesArray, buffer, context) {
    const audioArray = new Array();

    for (let i = 0; i < notesArray.length; i++ ) {
      const note = notesArray[i];
      const noteBuffer = this.spliceAudio(note.startT, note.endT, buffer, context);
      audioArray.push(noteBuffer);
    }
  
    return audioArray;
  }

  spliceAudio(startTime, endTime, buffer, context) {

    const startIndex = Math.floor(startTime * buffer.sampleRate);
    const endIndex = Math.min(Math.floor(endTime * buffer.sampleRate), buffer.length);
  
    const bufferLength = endIndex - startIndex;
    if (bufferLength <= 0) {
      const dummyBuff = context.createBuffer(buffer.numberOfChannels, 1, buffer.sampleRate);
      return dummyBuff;
    }
  
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

  generateFFTFromBuffer(buffer, fn) {
    const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  
    const analyzer = audioCtx.createAnalyser();
    analyzer.fftSize = granularity;
    const source = audioCtx.createBufferSource();
    source.buffer = buffer;
  
    source.connect(analyzer);
  
    const dataArray = new Uint8Array( analyzer.frequencyBinCount );
  
  
    function ended(e) {
  
      // import to close the context, for some reason!
      audioCtx.close();
      fn(analyzer);
    };
  
    source.onended = ended;
  
    source.start();
  }

  generateFFTArrayAndGoToPDA(bufferArray, fn) {
    const fftArray = new Array( bufferArray.length - 1 );

    const processor = this;
    for (let i = 0; i < bufferArray.length; i++) {
      function addToArray(fft) {
        fftArray[i - 1] = fft;
  
        let continuePDA = true;
        for (let arr = 0; arr < bufferArray.length - 1; arr++) {
          if (fftArray[arr] == undefined) { continuePDA = false; return; }
        }
  
        if (continuePDA) { 
          const pitches = processor.detectPitchOnArray(fftArray);
          fn(pitches);
        }
      }
  
      this.generateFFTFromBuffer( bufferArray[i], addToArray );
    }
  }

  detectPitchOnArray(FFT_Array=[]) {
    const notePitchArray = new Array( FFT_Array.length );

    for (let fft_index = 0; fft_index < FFT_Array.length; fft_index++ ) {
      notePitchArray[fft_index] = this.getPitch( FFT_Array[fft_index], FFT_Array[fft_index].context.sampleRate );
    }

    return notePitchArray;
  }

  getPitch(fft,sampleRate){

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

export { AudioProcessor }