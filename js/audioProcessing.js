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

  source.connect(audioCtx.destination);
  const dataArray = new Uint8Array( analyzer.frequencyBinCount );


  function ended(e) {
    analyzer.getByteFrequencyData(dataArray);

    fn(dataArray);
  };

  source.onended = ended;

  source.start();

}

function generateFFTArray(bufferArray) {
  // const context = new (window.AudioContext || window.webkitAudioContext)();

  const fftArray = new Array( bufferArray.length - 1 );

  for (let i = 1; i < bufferArray.length; i++) {
    function addToArray(fft) {
      fftArray[i - 1] = fft;
    }

    generateFFTFromBuffer( bufferArray[i], addToArray );
  }

  // context.close();



  return fftArray;
}

export { generateNoteBufferArray, generateFFTArray }