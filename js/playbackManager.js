/* The file for dealing with playback of the recorded audio */
const tracksDiv = document.getElementById("tracks");
const playSong = document.getElementById("playSong");

/* Functions dealing with the scroll bar */
const scrollDiv = document.createElement('div');
scrollDiv.style.height = '100px';
scrollDiv.style.width = '10px';
scrollDiv.style.backgroundColor = 'red';

/* Functions dealing with pausing / playing the song */
let paused = false;

function initPlayListener() {
  playSong.addEventListener('click', function () {

    if (paused) {
      playSong.textContent = "Play Song";
    } else {
      playSong.textContent = "Pause Song";
    }

    paused = !paused;
    
  });
}

function initPlayback() {
  initPlayListener();
  tracksDiv.appendChild(scrollDiv);
}

export { initPlayback }