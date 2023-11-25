/** File to Manage Tracks */

class Track {
  constructor() {
    this.name = "Instrument";
    this.instrument = null;
    this.dom = addDefTrack();
  }
}

const tracksDiv = document.getElementById("tracks");
const addTrack = document.getElementById("addTrack");
// const remTrack = document.getElementById("remTrack");

/* This function adds a new default track to the tracks Div */
function addDefTrack() {
  // create div to put in tracks overall div
  const trackDOM = document.createElement('div');
  trackDOM.className = 'trackDOM'

  // create the name
  const trackName = document.createElement('p');
  trackName.className = "trackP";

  trackName.innerHTML = '<p class="trackP" contenteditable="true">Instrument</p>';

  // create the musical element
  const musDiv = document.createElement('div');
  musDiv.className = 'music';

  // create segment for the other functions
  const miscFunctions = document.createElement('div');

  const volume = document.createElement('input');
  volume.textContent = 'Volume:';
  volume.type = 'range';

  const recordButton = document.createElement('button');
  recordButton.textContent = 'Record'

  miscFunctions.appendChild(volume);
  miscFunctions.appendChild(recordButton);

  //create remove segment
  const remTrack = document.createElement('button');
  // remTrack.innerHTML = '<button class="remTrack">Remove Track</button>';
  remTrack.textContent = 'Remove Track';
  remTrack.addEventListener('click', function () {
    tracksDiv.removeChild(trackDOM);
  });

  // append elements to the trackDOM
  trackDOM.appendChild(trackName);
  trackDOM.appendChild(musDiv);
  trackDOM.appendChild(miscFunctions);
  trackDOM.appendChild(remTrack);

  // update style
  trackDOM.style = trackDOM.style;

  tracksDiv.appendChild(trackDOM);

  return trackDOM;
}

function initTrack() {
    addTrack.addEventListener("click", addDefTrack);
}

export { initTrack }