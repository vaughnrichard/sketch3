// Imports
import { initUserAudio } from "./userAudioFFT.js";
import { initLocalAudio } from "./localAudioFFT.js";
import { trackManager } from "./trackManager.js";

/** Initialize other folders */
initUserAudio();
initLocalAudio();

trackManager.addTrack();