

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
        "A4": "guitar_Astring.mp3",
        "B3": "guitar_Bstring.mp3",
        "D3": "guitar_Dstring.mp3",
        "G3": "guitar_Gstring.mp3",
        "E3": "guitar_LowEstring1.mp3",
        "E4": "guitar_highEstring.mp3"
      },
      baseUrl: "https://tonejs.github.io/audio/berklee/", // Base URL for all samples
    }).toDestination();
  }

  play(note) {
    const start = note.startT;
    const duration = note.endT - note.startT;

    this.sampler.triggerAttackRelease( note.frequency, duration, Tone.now() + start );
  }
}

class Piano {
  constructor() {
    this.sampler = new Tone.Sampler({
      urls: {
        "C2": "C2.mp3",
        "A2": "A2.mp3",
        "A1": "B1.mp3",
        "B2": "C2.mp3",
        "B1": "B1.mp3",
        "D2": "D2.mp3",
        "E2": "E2.mp3",
        "F2": "F2.mp3",
        "G2": "G2.mp3"
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
        "C4": "hihat.mp3",
        "C5": "kick.mp3",
        "C6": "snare.mp3",
        "C7": "tom1.mp3",
        "C3": "tom2.mp3",
        "C2": "tom3.mp3"
      },
      baseUrl: "https://tonejs.github.io/audio/drum-samples/acoustic-kit/", // Base URL for all samples
    }).toDestination();
  }

  play(note) {
    const start = note.startT;
    const duration = note.endT - note.startT;

    this.sampler.triggerAttackRelease( note.frequency, duration, Tone.now() + start );
  }
}

export { ToneInstrument }