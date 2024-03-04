/** File to Manage Tracks */
import { Note } from "./notes.js";
import { clamp } from "./math.js";
import { startRecording, makeButtonStopRecording } from "./userAudioFFT.js";

class TrackManager {
  constructor() {
    this.tracksDiv = document.getElementById("tracks");
    this.tracks = [];

    this.addTrackButton = document.getElementById("addTrack");
    this.playSongButton = document.getElementById("playSong");
  }

  addTrack() {
    const newTrack = new Track();
    this.tracks.push(newTrack);

    // add styling
  }

  removeTrack(track) {
    this.tracks.pop(track);
  }

  returnBounds() {
    const bounds = {
      left: 100,
      right: 600,
      top: 0,
      bottom: 200
    }

    return bounds;
  }
}

const trackManager = new TrackManager();

class Track {
  constructor() {
    this.name = "Instrument";
    this.instrument = null;
    this.dom = this.addDefTrack();
    this.segments = new Array(Segment);
  }

  /* This function adds a new default track to the tracks Div */
 addDefTrack() {
    // create div to put in tracks overall div
    const trackDOM = document.createElement('div');
    trackDOM.className = 'trackDOM'

    // create the name
    const trackName = document.createElement('p');
    trackName.className = "trackP";
    trackName.contentEditable = "true";

    trackName.innerHTML = 'Instrument';

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

      if (recordButton.textContent == 'Record') {

        const musicDiv = addSegment(musDiv);
        recordButton.textContent = 'Stop Recording';

        makeButtonStopRecording(recordButton);
        // recordButton.addEventListener('click', function stopSegRecording() {
    
        //   recordButton.removeEventListener(stopSegRecording);
        // });

        startRecording(musicDiv);
      } else { // text content = 'Stop Recording'
        recordButton.textContent = 'Record';
      }

    })

    miscFunctions.appendChild(volume);
    miscFunctions.appendChild(recordButton);

    //create remove segment
    const remTrack = document.createElement('button');
    // remTrack.innerHTML = '<button class="remTrack">Remove Track</button>';
    remTrack.textContent = 'Remove Track';
    remTrack.addEventListener('click', function () {
      if (this.tracksDiv.children.length > 1) {
        this.tracksDiv.removeChild(trackDOM);
      }
    });

    // append elements to the trackDOM
    trackDOM.appendChild(trackName);
    trackDOM.appendChild(musDiv);
    trackDOM.appendChild(miscFunctions);
    trackDOM.appendChild(remTrack);

    // update style
    // trackDOM.style = trackDOM.style;

    this.tracksDiv.appendChild(trackDOM);

    // tracksDiv.setAttribute('notes')
    this.tracksDiv.notesArray = null;

    return trackDOM;
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

  addSegment(parentComponent) {
    const segDiv = document.createElement('div');
    segDiv.className = 'segDiv';
    segDiv.style.width = '100px';
    segDiv.style.height = parentComponent.clientHeight + 'px';
    // segDiv.style.backgroundColor = 'red';
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
  
        segDiv.style.left = Math.round(clamp(newPos, parentComponent.offsetLeft , parentComponent.clientWidth - segDiv.clientWidth + parentComponent.offsetLeft)) +'px';
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

  removeSegment() {
    this.parentTrack.removeChild(this.dom);
  }
}

const tracksDiv = document.getElementById("tracks");
const addTrack = document.getElementById("addTrack");

function initTrack() {
    addTrack.addEventListener("click", addDefTrack);
    addDefTrack();
}

export { initTrack, trackManager }