// Imports
import { initTrack } from "./trackManager.js";
import { initUserAudio } from "./userAudioFFT.js";
import { initLocalAudio } from "./localAudioFFT.js";
import { initPlayback } from "./playbackManager.js";

/** Initialize other folders */
initTrack();
initUserAudio();
initLocalAudio();
initPlayback();