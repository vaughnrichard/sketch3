/* This file deals with processing the audio data */

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

export { generateNoteBufferArray }