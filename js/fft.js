/** File to Deal with FFT stuff */


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


function detectNotes(data) {


  return 
}

// store values in here
var timeDomainArray = new Array();

const energyVal = document.getElementById("energyDisplay");
// Call this function periodically to measure the sound energy
function measureSoundEnergy(analyzer) {

  const bufferLength = analyzer.frequencyBinCount;
  const dataArray = new Uint8Array(bufferLength); // can also do float data if desired
  analyzer.getByteFrequencyData(dataArray);

  // Calculate the average energy in the frequency data
  let sum = 0;
  for (let i = 0; i < dataArray.length; i++) {
    sum += dataArray[i];
  }

  // timeDomainArray.push(sum);
  timeDomainArray.push(sum);
  console.log(timeDomainArray.length);

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

  ctx.fillStyle = 'black';

  const max_original = data.reduce((a, b) => Math.max(a, b));


  // adjust data so that any insignificant data is forgotten
  let new_data = data.map(function (val) {
    const adj = val - (max_original * .25); // a quarter seems to be good for quite places
    if (adj < 0) {
      return .1;
    }
    return adj;
  })

  new_data = new_data.map(function (val) {
    return Math.log2(val)
  })

  // remove any invalid data points
  new_data = new_data.filter(function (val) {
    return val != -Infinity;
  })

  // const min = new_data.reduce((a, b) => Math.min(a, b));

  let min = Infinity;

  for (let i = 0; i < new_data.length; i++) {
    if (new_data[i] < min && new_data[i] >= 0) {
      min = new_data[i];
    }
  }

  new_data = new_data.map( function (val) {
    const adj =  val - min;
    if (adj < 0) { return 0; }

    return adj;
  })

  const moving_average_len = 5;

  // with the data cleaned, take a moving average
  if (new_data.length < moving_average_len) { throw new Error("Given sample was too short. Improve to remove this liability in the future. ")}

  // create a queue for the moving average
  const ma_queue = new Array(moving_average_len);

  for (let i = 0; i < moving_average_len; i++) {
    ma_queue[i] = new_data[i]
  }

  // create two arrays to calculate the moving average and moving variance
  const ma_array = new Array(new_data.length - moving_average_len);
  const var_array = new Array(new_data.length - moving_average_len);

  // loop to calcualte the ma / moving var
  for (let i = 0; i < ma_array.length; i++) {
    const sum = ma_queue.reduce((accumulator, currentValue) => accumulator + currentValue, 0);
    const mean = sum / moving_average_len;

    ma_array[i] = mean;

    let variance = 0;
    // ma_queue should be moving_average_length
    for (let j = 0; j < ma_queue.length; j++) {
      variance += (ma_queue[j] - mean) ** 2;
    }

    var_array[i] = variance / moving_average_len;

    ma_queue.pop()
    ma_queue.push(new_data[i + moving_average_len])

  }


  function graphMetric( dataset ) {
    const max = dataset.reduce((a, b) => Math.max(a, b));

    // normalize
    dataset = dataset.map( function (val) {
      return val / max;
    })

    console.log(dataset)

    dataset = dataset.map( function (val) {

      return canvas.height * val;
    })

    for (let i = 0; i < dataset.length; i++) {
      // console.log(dataset[i])
      ctx.fillRect(i * lineWidth , canvas.height, lineWidth, -dataset[i]);
    }
  }

  // graphMetric(new_data);
  graphMetric(ma_array); // appears to be the best
  // graphMetric(var_array);
  
}

function graphData(canvas, graphParameter, fft) {
  if (fft) {
    graphFFT(graphParameter, canvas);
  } else {
    graphTimeDomain(null, canvas);
  }
}

export { graphData, measureSoundEnergy, timeDomainArray, resetTimeDomain }