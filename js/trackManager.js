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
    this.playbackManager.updateScrollDivHeight();

    const scrollDiv = this.playbackManager.scrollDiv;
    const bounds = this.returnBounds();
    scrollDiv.style['left'] = Math.round(clamp(scrollDiv.offsetLeft, bounds.left, bounds.right - scrollDiv.clientWidth)) +'px';
  }

  removeTrack(track) {
    this.tracks.pop( track );

    this.tracks.forEach( (track) => {
      track.updateTrackPositions();
    });

    // update segment positions
    this.playbackManager.updateScrollDivHeight();
  }

  returnBounds() {
    const bounds = {
      left: 100,
      right: 600,
      top: 0,
      bottom: 200
    }

    const musDivElements = document.getElementsByClassName("music");

    if (musDivElements.length > 0) {

      const boundingRect = musDivElements[0].getBoundingClientRect();
      // need to multiply by tracks length, musDivElements was not making the scroll div update
      // on removal correctly
      const bottomVal = boundingRect['height'] * this.tracks.length + boundingRect['top'];
      const bounds = {
        left: boundingRect['left'],
        right: boundingRect['right'],
        top: boundingRect['top'],
        bottom: bottomVal,
        width: boundingRect['width']
      };
      return bounds;
    } else {
      const bounds = {
        left: 100,
        right: 1000,
        top: 0,
        bottom: 48
      }
      return bounds;
    }
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

    // style track dom
    const trackDomStyling = {
      // 'max-width': '1200px',
      'min-width': '200px',
      // 'margin': 'auto'
    }

    // set the property values
    for (const property in trackDomStyling) {
      trackDOM.style[property] = trackDomStyling[property];
    }

    // create the name
    const trackName = document.createElement('p');
    trackName.className = "trackP";
    trackName.contentEditable = "true";

    trackName.innerHTML = 'Instrument';

    // create the musical element
    const musDiv = document.createElement('div');
    musDiv.className = 'music';

    // create dropdown for instrument
    const instrumentSelect = document.createElement('select');

    const raw = document.createElement('option');
    raw.innerText = 'Raw Audio';

    const guitar = document.createElement('option');
    guitar.innerText = 'Guitar';

    const piano = document.createElement('option');
    piano.innerText = 'Piano';

    const drum = document.createElement('option');
    drum.innerText = 'Drum';

    instrumentSelect.appendChild(raw);
    instrumentSelect.appendChild(guitar);
    instrumentSelect.appendChild(piano);
    instrumentSelect.appendChild(drum);

    instrumentSelect.addEventListener('change', (e) => {
        track.instrument = instrumentSelect.value;
        console.log(track);
        track.trackManager.playbackManager.toneInstrument.changeInstrument(instrumentSelect.value);
    });

    // create segment for the other functions
    const miscFunctions = document.createElement('div');

    const volume = document.createElement('input');
    volume.textContent = 'Volume:';
    volume.type = 'range';

    volume.addEventListener('change', (value) => {
      const volumeAsPercent = (volume.value / 100) * 1;
      this.trackManager.playbackManager.gainNode.gain.value = volumeAsPercent;
    });

    const recordButton = document.createElement('button');
    recordButton.textContent = 'Record'
    recordButton.addEventListener('click', function() {

      if (recordButton.textContent == 'Record') {

        const newSegment = new Segment(track);
        track.segments.push(newSegment);
        const musicDiv = newSegment.addSegment(musDiv);
        recordButton.textContent = 'Stop Recording';

        makeButtonStopRecording(recordButton);

        startRecording(musicDiv, newSegment);
      } else { // text content = 'Stop Recording'
        recordButton.textContent = 'Record';
      }

    })

    miscFunctions.appendChild(volume);
    miscFunctions.appendChild(recordButton);

    //create remove track
    const remTrack = document.createElement('button');
    // remTrack.innerHTML = '<button class="remTrack">Remove Track</button>';
    remTrack.textContent = 'Remove Track';

    const trackManager = this.trackManager;
    remTrack.addEventListener('click', function () {
      if (trackManager.tracksDiv.children.length > 1) {
        trackManager.removeTrack(track);
        trackManager.tracksDiv.removeChild(trackDOM);
        
      }
    });

    // append elements to the trackDOM
    trackDOM.appendChild(trackName);
    trackDOM.appendChild(musDiv);
    trackDOM.appendChild(instrumentSelect);
    trackDOM.appendChild(miscFunctions);
    trackDOM.appendChild(remTrack);

    this.trackManager.tracksDiv.appendChild(trackDOM);

    this.trackManager.tracksDiv.notesArray = null;

    return trackDOM;
  }

  updateTrackPositions() {
    // I think mostly everything is good so just move all the segdivs up
    this.segments.forEach( (segment) => {
      console.log(segment);
      segment.style.top = '0px';
    } );
  }
}

class Segment {
  constructor(parentTrack) {
    this.notes = new Array();
    this.start = 0;
    this.end = 1000;
    this.parentTrack = parentTrack;
    this.segDiv = null;
    this.parentDom = null;
  }

  addSegment(parentComponent) {
    this.parentDom = parentComponent;
    this.segDiv = document.createElement('div');

    const segDivStyling = {
      width: '100px',
      height: this.parentDom.clientHeight + 'px',
      left: this.parentDom.offsetLeft + 'px',
      position: 'absolute'
    };

    this.segDiv.className = 'segDiv';
    this.segDiv.style.width = '100px';
    
    for (const property in segDivStyling) {
      this.segDiv.style[property] = segDivStyling[property];
    }
  
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
    this.parentDom.removeChild(this.segDiv);
  }

  addNotes(notes) {
    this.notes = notes;

    if (this.notes.length === 0) { return; }
    this.start = this.notes[0].start;
    this.end = this.notes[ this.notes.length - 1 ].end;
  }
}

const trackManager = new TrackManager();

export { trackManager }