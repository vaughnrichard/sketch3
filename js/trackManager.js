/** File to Manage Tracks */

const tracksDiv = document.getElementById("tracks");
const addTrack = document.getElementById("addTrack");
const remTrack = document.getElementById("remTrack");

/* This function adds a new default track to the tracks Div */
function addDefTrack() {
    const track = document.createElement('div');
    track.className = "track";

    track.innerHTML = '<p class="trackName" contenteditable="true">Name</p>\
                      <input class="stuff" type="range">\
                      <input class="enabled" type="checkbox">'

    tracksDiv.appendChild(track);
}

function removeTrack() {
  if (tracksDiv.children.length == 0) { return; }
  tracksDiv.removeChild(tracksDiv.children[tracksDiv.children.length - 1]);
}

function initTrack() {
    addTrack.addEventListener("click", addDefTrack);
    remTrack.addEventListener("click", removeTrack);
}

export { initTrack }