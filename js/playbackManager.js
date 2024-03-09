/* The file for dealing with playback of the recorded audio */

// imports
import { clamp } from "./math.js";

class PlaybackManager {
  constructor(trackManager, playbackSpeed=16.67) {
    this.playSongButton = document.getElementById("playSong");
    this.trackManager = trackManager;

    this.paused = true;

    this.scrollDiv = document.createElement('div');
    this.initScrollDiv();

    this.notePlayer = new(window.AudioContext || window.webkitAudioContext)();
    this.gainNode = this.notePlayer.createGain();
    this.gainNode.connect(this.notePlayer.destination);
    this.volume = this.gainNode.gain.value;

    this.gainNode.gain.value = 0.5;

    this.playbackSpeed = playbackSpeed; // ms per step
  }

  attachTrackManager(trackManager) {
    this.trackManager = trackManager;
  }

  initScrollDiv() {
    // styling - need to enable dynamic scaling on the height!
    const bounds = this.trackManager.returnBounds();

    const scrollDivStyling = {
      height: String(bounds.bottom - bounds.top) + 'px',
      width: '5px',
      backgroundColor: 'red',
      position: 'absolute'
    };

    for (const property in scrollDivStyling) {
      this.scrollDiv.style[property] = scrollDivStyling[property];      
    }

    // append scroll div to the tracksdiv 
    this.trackManager.tracksDiv.appendChild(this.scrollDiv);

    const playbackManager = this;
    this.scrollDiv.addEventListener('mousedown', () => {

      function moveSegmentHelper(e) {
        playbackManager.moveScrollDiv(e.clientX);
      }
    
      window.addEventListener('mousemove', moveSegmentHelper)
      window.addEventListener('mouseup', function cleanUpListeners() {
        window.removeEventListener('mousemove', moveSegmentHelper);
        this.window.removeEventListener('mouseup', cleanUpListeners);
      });
    });
  }

  // this function is called in track manager
  initPlayListener() {
    const playbackManager = this;
    const playButton = this.playSongButton;
    playButton.addEventListener('click', () => {
      playbackManager.paused = !playbackManager.paused;

      playButton.textContent = (playbackManager.paused) ? "Play Song" : "Pause Song" ;

      if (!playbackManager.paused) { this.playLoop(); }
    });
  }

  updateScrollDivHeight() {
    const bounds = this.trackManager.returnBounds();

    this.scrollDiv.style['height'] = String(bounds.bottom - bounds.top) + 'px';
  }

  moveScrollDiv(position) {
    const bounds = this.trackManager.returnBounds();

    this.scrollDiv.style['left'] = Math.round( clamp(position, bounds.left , bounds.right - this.scrollDiv.clientWidth) ) +'px';
  }

  updateScroll() {
    if (this.paused) { return; }

    const bounds = this.trackManager.returnBounds();
    this.scrollDiv.style['left'] = Math.round(clamp(this.scrollDiv.offsetLeft + 1, bounds.left, bounds.right - this.scrollDiv.clientWidth)) +'px';

    for (let trackId = 0; trackId < this.trackManager.tracks.length; trackId++ ) {
      const track = this.trackManager.tracks[trackId];
      for (let seg = 0; seg < track.segments.length; seg++) {
        const segment = track.segments[seg];

        if (this.scrollDiv.offsetLeft === segment.segDiv.offsetLeft ) {
          this.playNotes( this.notePlayer, segment.notes );
        }
      }
    }

    // figure this out
    if ((this.scrollDiv.offsetLeft + this.scrollDiv.clientWidth) == Math.round(bounds.right)) {
      this.paused = true;
      this.playSongButton.textContent = "Play Song";
      this.scrollDiv.style['left'] = String(bounds.left) + 'px';
    }
  }

  // code adapted from https://stackoverflow.com/questions/39200994/how-to-play-a-specific-frequency-with-javascript
  playNotes(context, notes) {
    for (let note = 0; note < notes.length; note++ ) {
      const curNote = notes[note];
      console.log(curNote);
  
      const playbackManager = this;

      setTimeout(function () {
        const oscillator = context.createOscillator();
        oscillator.type = 'sine';
        oscillator.connect(playbackManager.gainNode);
        oscillator.frequency.value = curNote.frequency;
        oscillator.start();
  
        setTimeout(function() {
          oscillator.stop();
        }, (curNote.endT - curNote.startT)*1000);
      }, curNote.startT * 1000);
  
    }
  }

  playLoop() {
    if (this.paused) { return; }

    this.updateScroll();
    setTimeout(() => { this.playLoop() }, this.playbackSpeed);
  }

}

export { PlaybackManager }