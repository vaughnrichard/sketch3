/* The file for dealing with playback of the recorded audio */

// imports
import { clamp } from "./math.js";
import { trackManager } from "./trackManager.js";

class PlaybackManager {
  constructor(playbackSpeed=16.7) {
    this.playSongButton = document.getElementById("playSong");
    this.trackManager = trackManager;

    this.paused = true;

    this.scrollDiv = document.createElement('div');
    this.initScrollDiv();

    this.notePlayer = new(window.AudioContext || window.webkitAudioContext)();

    this.playbackSpeed = playbackSpeed; // ms per step
  }

  initScrollDiv() {
    // styling - need to enable dynamic scaling on the height!
    const bounds = this.trackManager.returnBounds();

    const scrollDivStyling = {
      height: String(bounds.top - bounds.bottom) + 'px',
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

  initPlayListener() {
    const playbackManager = this;
    const playButton = this.playSongButton;
    playButton.addEventListener('click', () => {
      playbackManager.paused = !playbackManager.paused;

      playButton.textContent = (playbackManager.paused) ? "Play Song" : "Pause Song" ;
    });
  }

  moveScrollDiv(position) {
    const bounds = this.trackManager.returnBounds();

    this.scrollDiv.style['left'] = Math.round( clamp(position, bounds.left , bounds.right) ) +'px';
  }

  updateScroll() {
    if (!paused) { return; }

    const bounds = this.trackManager.returnBounds();
    this.scrollDiv.style['left'] = Math.round(clamp(this.scrollDiv.offsetLeft + 1, bounds.left, bounds.right)) +'px';

    for (let div = 0; div < musDiv.length; div++) {
      for (let seg = 0; seg < musDiv[div].children.length; seg++ ) {
        if (scrollDiv.offsetLeft == musDiv[div].children[seg].offsetLeft) {
          const notes = JSON.parse(musDiv[div].children[seg].dataset.notes);
          playNotes(notePlayer, notes);
        }
      }
    }

    if (scrollDiv.offsetLeft == bounds.right) {
      paused = true;
      playSong.textContent = "Play Song";
      scrollDiv.style['left'] = bounds.left;
    }
  }

  // code adapted from https://stackoverflow.com/questions/39200994/how-to-play-a-specific-frequency-with-javascript
  playNotes(context, notes) {
    for (let note = 0; note < notes.length; note++ ) {
      const curNote = notes[note];
  
      setTimeout(function () {
        const oscillator = context.createOscillator();
        oscillator.type = 'sine';
        oscillator.connect(context.destination);
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

const playbackManager = new PlaybackManager();

export { playbackManager }