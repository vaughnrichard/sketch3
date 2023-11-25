/** File to Manage Tracks */

class Track {
  constructor() {
    this.name = "Instrument";
    this.instrument = null;
    this.dom = addDefTrack();
  }
}

const tracksDiv = document.getElementById("tracks");
const namesDiv = document.getElementById("names");
const addTrack = document.getElementById("addTrack");
const remTrack = document.getElementById("remTrack");

/* This function adds a new default track to the tracks Div */
function addDefTrack() {
    const track = document.createElement('p');
    track.className = "trackP";

    track.innerHTML = '<p class="trackP" contenteditable="true">Instrument</p>'

    namesDiv.appendChild(track);

    return track;
}

function removeTrack() {
  if (namesDiv.children.length == 0) { return; }
  namesDiv.removeChild(namesDiv.children[namesDiv.children.length - 1]);
}

function initTrack() {
    addTrack.addEventListener("click", addDefTrack);
    remTrack.addEventListener("click", removeTrack);
}

export { initTrack }