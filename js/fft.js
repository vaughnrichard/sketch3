/** File to Deal with FFT stuff */

// given an array and a canvas, this will draw the FFT over the canvas's dimensions
function graphFFT(analyzer, canvas) {
    const bufferLength = analyzer.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);
    analyzer.getByteFrequencyData(dataArray);

    const width = dataArray.length;
  
    const heightAdjustment = canvas.height / 256;
  
    const ctx = canvas.getContext('2d');
  
    ctx.clearRect(0, 0, canvas.width, canvas.height);
  
    ctx.fillStyle = 'black';
  
    for (let i = 0; i < dataArray.length; i++) {
      ctx.fillRect(i , canvas.height, 1, -dataArray[i] * heightAdjustment);
    }
  }

  export { graphFFT }