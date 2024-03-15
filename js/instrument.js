

// adapted some of this from chatGPT
class ToneInstrument {
  constructor() {
    this.currentInstrument = null;

    this.piano = new Piano();

    this.drum = new Drums();

    this.guitar = new Guitar();
  }

  changeInstrument(name) {
    if (name === 'Guitar') {
      this.currentInstrument = this.guitar;
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

  playInstrument(note) {
    this.currentInstrument.play(note);
  }
}

class Guitar {
  constructor() {
    this.sampler = new Tone.Sampler({
      urls: {
        "A4": "guitar_Astring.mp3", // Path to the sample for C4
        // Add more notes and their corresponding sample paths here
      },
      baseUrl: "https://tonejs.github.io/audio/berklee/", // Base URL for all samples
    }).toDestination();
  }

  play(note) {
    const start = note.startT;
    const duration = note.endT - note.startT;

    this.sampler.triggerAttackRelease( note.frequency, duration, Tone.now() + start );
    console.log('playing guitar', start, duration, note.frequency);
  }
}

class Piano {
  constructor() {
    this.sampler = new Tone.Sampler({
      urls: {
        "C2": "C2.mp3", // Path to the sample for C4
        // Add more notes and their corresponding sample paths here
      },
      baseUrl: "https://tonejs.github.io/audio/casio/", // Base URL for all samples
    }).toDestination();
  }

  play(note) {
    const start = note.startT;
    const duration = note.endT - note.startT;

    this.sampler.triggerAttackRelease( note.frequency, duration, Tone.now() + start );
  }
}

class Drums {
  constructor() {
    this.sampler = new Tone.Sampler({
      urls: {
        "C4": "C4.mp3", // Path to the sample for C4
        // Add more notes and their corresponding sample paths here
      },
      release: 1, // Release time in seconds
      baseUrl: "https://tonejs.github.io/audio/drum-samples/acoustic-kit", // Base URL for all samples
    }).toDestination();
  }

  play(note) {
    
  }
}

export { ToneInstrument }