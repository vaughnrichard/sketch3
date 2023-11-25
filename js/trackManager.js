/** File to Manage Tracks */
import { Note } from "./notes.js";
import { clamp } from "./math.js";

class Track {
  constructor() {
    this.name = "Instrument";
    this.instrument = null;
    this.dom = addDefTrack();
    this.segments = new Array(Segment);
  }
}

class Segment {
  constructor(parentTrack) {
    this.notes = new Array(Note);
    this.start = 0;
    this.end = 1000;
    this.parentTrack = parentTrack;
    this.dom = addSegment();
  }

  removeSegment() {
    this.parentTrack.removeChild(this.dom);
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
  recordButton.addEventListener('click', function() {
    addSegment(musDiv);
  })

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

function addSegment(parentComponent) {
  const segDiv = document.createElement('div');
  segDiv.className = 'segDiv';
  segDiv.style.width = '100px';
  segDiv.style.height = parentComponent.clientHeight + 'px';
  segDiv.style.backgroundColor = 'red';
  segDiv.style.top = parentComponent.offsetTop + 'px';
  segDiv.style.left = parentComponent.offsetLeft + 'px';
  segDiv.style.position = 'absolute';

  // maybe add something to bring up editable panel if click on 
  // segDiv.addEventListener('click', function () {
  //   console.log('testing')
  // });

  segDiv.addEventListener('mousedown', function segMover() {

    function moveSegment(e) {
      const newPos = segDiv.offsetLeft  + e.movementX;
      // console.log(newPos);
      // console.log(segDiv.offsetLeft);
      segDiv.style.left = clamp(newPos, parentComponent.offsetLeft , parentComponent.clientWidth - segDiv.clientWidth + parentComponent.offsetLeft) +'px';
    }

    window.addEventListener('mousemove', moveSegment)

    window.addEventListener('mouseup', function () {
      window.removeEventListener('mousemove', moveSegment);
      // segDiv.removeEventListener('mousedown', segMover);
    });
  });

  parentComponent.appendChild(segDiv);

  return segDiv;
}

function initTrack() {
    addTrack.addEventListener("click", addDefTrack);
}

export { initTrack }