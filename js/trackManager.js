/** File to Manage Tracks */
import { Note } from "./notes.js";
import { clamp } from "./math.js";
import { startRecording, makeButtonStopRecording } from "./userAudioFFT.js";
import { PlaybackManager } from "./playbackManager.js";

class TrackManager {
  constructor() {
    this.tracksDiv = document.getElementById("tracks");
    this.tracks = [];

    this.addTrackButton = document.getElementById("addTrack");
    this.playSongButton = document.getElementById("playSong");

    this.playbackManager = new PlaybackManager(this);

    this.nameContainer = document.getElementById("nameContainer");
    this.musicContainer = document.getElementById("musicContainer");
    this.otherContainer = document.getElementById("otherContainer");

    this.initAddTrackButton();
    this.initPlaybackButton();
  }

  initAddTrackButton() {
    const trackManager = this;
    this.addTrackButton.addEventListener('click', () => {
      trackManager.addTrack();
    });
  }

  initPlaybackButton() {
    this.playbackManager.initPlayListener();
  }

  addTrack() {
    const newTrack = new Track(this);
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

class Track {
  constructor(trackManager) {
    this.trackManager = trackManager;
    this.name = "Instrument";
    this.instrument = null;
    this.dom = this.addDefTrack();
    this.segments = []; // array of segments
  }

  /* This function adds a new default track to the tracks Div */
 addDefTrack() {
    const track = this;

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

        const newSegment = new Segment();
        track.segments.push(newSegment);
        console.log(musDiv);
        const musicDiv = newSegment.addSegment(musDiv);
        recordButton.textContent = 'Stop Recording';

        makeButtonStopRecording(recordButton);

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

    this.trackManager.tracksDiv.appendChild(trackDOM);

    this.trackManager.tracksDiv.notesArray = null;

    return trackDOM;
  }
}

class Segment {
  constructor(parentTrack) {
    this.notes = new Array(Note);
    this.start = 0;
    this.end = 1000;
    this.parentTrack = parentTrack;
    this.segDiv = null;
    this.parentDom = null;
  }

  addSegment(parentComponent) {
    this.parentDom = parentComponent;
    this.segDiv = document.createElement('div');
    this.segDiv.className = 'segDiv';
    this.segDiv.style.width = '100px';
    this.segDiv.style.height = this.parentDom.clientHeight + 'px';
    this.segDiv.style.top = this.parentDom.offsetTop + 'px';
    this.segDiv.style.left = this.parentDom.offsetLeft + 'px';
    this.segDiv.style.position = 'absolute';
  
    // maybe add something to bring up editable panel if click on 
    // segDiv.addEventListener('click', function () {
    //   console.log('testing')
    // });
  
    const segDiv = this.segDiv;
    const parentDom = this.parentDom;
    this.segDiv.addEventListener('mousedown', function segMover() {
      function moveSegment(e) {
        const deltaPosition = e.movementX;

        const boundsPD = parentDom.getBoundingClientRect();
        const boundsSD = segDiv.getBoundingClientRect();

        const newPos = boundsSD.left + deltaPosition;

        const segWidth = (boundsSD.right - boundsSD.left);

        segDiv.style.left = String( Math.round(clamp(newPos, boundsPD.left , boundsPD.right - segWidth) ) ) +'px';
      }
  
      window.addEventListener('mousemove', moveSegment)
  
      window.addEventListener('mouseup', function () {
        window.removeEventListener('mousemove', moveSegment);
      });
    });
  
    parentComponent.appendChild(this.segDiv);
  
    return this.segDiv;
  }

  removeSegment() {
    this.parentTrack.removeChild(this.segDiv);
  }
}

const trackManager = new TrackManager();

export { trackManager }