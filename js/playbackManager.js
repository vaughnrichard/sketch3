// imports
import { clamp } from "./math.js";

/* The file for dealing with playback of the recorded audio */
const tracksDiv = document.getElementById("tracks");
const playSong = document.getElementById("playSong");

let musDiv = document.getElementsByClassName('music');

/* Functions dealing with the scroll bar */
const scrollDiv = document.createElement('div');
scrollDiv.style.height = '100px';
scrollDiv.style.width = '5px';
scrollDiv.style.backgroundColor = 'red';
scrollDiv.style.position = 'absolute';

scrollDiv.addEventListener('mousedown', function segMover() {

  function moveSegment(e) {
    const newPos = scrollDiv.offsetLeft  + e.movementX;
    // console.log(scrollDiv.offsetLeft)

    scrollDiv.style.left = Math.round(clamp(newPos, musDiv[0].offsetLeft , musDiv[0].clientWidth - scrollDiv.clientWidth + musDiv[0].offsetLeft)) +'px';
    // console.log(scrollDiv.style.left)
    // scrollDiv.offsetLeft = Math.round(clamp(newPos, /*parentComponent.offsetLeft*/ 0 , 100/*parentComponent.clientWidth - scrollDiv.clientWidth + parentComponent.offsetLeft */));
    // console.log(scrollDiv.offsetLeft)
  }

  window.addEventListener('mousemove', moveSegment)

  window.addEventListener('mouseup', function () {
    window.removeEventListener('mousemove', moveSegment);
  });
});

/* Functions dealing with pausing / playing the song */
let paused = false;

function playNotes(context, notes) {
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

function initPlayListener() {
  playSong.addEventListener('click', function () {

    paused = !paused;

    if (!paused) {
      playSong.textContent = "Play Song";
    } else { // now on play mode
      playSong.textContent = "Pause Song";

      const notePlayer = new(window.AudioContext || window.webkitAudioContext)();

      const updateScrollInterval = setInterval(function updateScroll() {
        if (!paused) {
          clearInterval(updateScrollInterval);
          return;
        }
        musDiv = document.getElementsByClassName('music');

        scrollDiv.style.left = Math.round(clamp(scrollDiv.offsetLeft + 1, musDiv[0].offsetLeft, musDiv[0].clientWidth - scrollDiv.clientWidth + musDiv[0].offsetLeft)) +'px';

        for (let div = 0; div < musDiv.length; div++) {
          for (let seg = 0; seg < musDiv[div].children.length; seg++ ) {
            // console.log(musDiv);
            if (scrollDiv.offsetLeft == musDiv[div].children[seg].offsetLeft) {
    
              // console.log('t2')
              // const synth = new Tone.Synth().toDestination();
              // synth.volume.value = -8 // volume in decibals
              // synth.triggerAttackRelease('C4', '8n', Tone.now());
              const notes = JSON.parse(musDiv[div].children[seg].dataset.notes);
              playNotes(notePlayer, notes);
            }
          }
        }
  
        if (scrollDiv.offsetLeft == musDiv[0].clientWidth - scrollDiv.clientWidth + musDiv[0].offsetLeft) {
          paused = !paused;
          playSong.textContent = "Play Song";
          scrollDiv.style.left = musDiv[0].offsetLeft;
        }
      }, 16.67);

    }
    
  });
}

function initPlayback() {
  initPlayListener();
  // hacky to have this part here. revise in the future
  scrollDiv.style.left = musDiv[0].offsetLeft + 'px';

  tracksDiv.appendChild(scrollDiv);
}

export { initPlayback }