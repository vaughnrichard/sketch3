

// adapted some of this from chatGPT
class toneInstrument {
  constructor() {
    this.currentInstrument = null;

    this.piano = new Tone.Sampler({
      urls: {
        "C4": "C4.mp3", // Path to the sample for C4
        // Add more notes and their corresponding sample paths here
      },
      baseUrl: "https://tonejs.github.io/audio/casio/", // Base URL for all samples
    }).toDestination();

    this.drum = new Tone.Sampler({
      urls: {
        "C4": "C4.mp3", // Path to the sample for C4
        // Add more notes and their corresponding sample paths here
      },
      release: 1, // Release time in seconds
      baseUrl: "https://tonejs.github.io/audio/drum-samples/acoustic-kit", // Base URL for all samples
    }).toDestination();

    //drum-samples/acoustic-kit

    this.guitar = new Tone.Sampler({
      urls: {
        "A4": "guitar_Astring.mp3", // Path to the sample for C4
        // Add more notes and their corresponding sample paths here
      },
      baseUrl: "https://tonejs.github.io/audio/berklee/", // Base URL for all samples
    }).toDestination();
  }

  changeInstrument(name) {
    if (name === 'Guitar') {
      this.currentInstrument
    }

    else if (name === 'Piano') {
      this.currentInstrument = this.piano;
    }

    else if (name === 'Drum') {
      this.currentInstrument = this.drum;
    }

    else {
      this.currentInstrument = null;
      console.log('Change Instrument Error: Bad name passed in.')
    }
  }
}
//https://github.com/Tonejs/audio/tree/master/drum-samples/acoustic-kit
// Start loading the samples
sampler.load().then(() => {
  // Trigger the note
  const note = "C4"; // Note to play
  sampler.triggerAttackRelease(note, "4n"); // Play the note for a quarter note duration
});