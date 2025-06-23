class SonidoInteractivo {
  constructor() {
    this.mic = new p5.AudioIn();
    this.fft = new p5.FFT();
    this.fft.setInput(this.mic);
    this.volumen = 0;
    this.bass = 0;
    this.mid = 0;
    this.treble = 0;
    this.spectrum = [];
    this.waveform = [];
    this.activo = false;

    // Pitch detection se inicializa después
    this.pitchValue = 0;
    this.modelLoaded = false;
    this.pitch = null;
  }

  iniciar() {
    // Debe llamarse tras una interacción del usuario
    this.mic.start(() => {
      this.activo = true;

      // Solo aquí el stream está disponible
      const audioContext = getAudioContext();
      const modelUrl = 'https://cdn.jsdelivr.net/gh/ml5js/ml5-data-and-models/models/pitch-detection/crepe/';
      this.pitch = ml5.pitchDetection(
        modelUrl,
        audioContext,
        this.mic.stream,
        () => {
          this.modelLoaded = true;
          this.getPitch();
        }
      );
    });
  }

  actualizar() {
    if (!this.activo) return;
    this.volumen = this.mic.getLevel();
    this.spectrum = this.fft.analyze();
    this.bass = this.fft.getEnergy("bass");
    this.mid = this.fft.getEnergy("mid");
    this.treble = this.fft.getEnergy("treble");
    this.waveform = this.fft.waveform();
  }

  getPitch() {
    if (!this.modelLoaded) return;
    this.pitch.getPitch((err, frequency) => {
      if (frequency) {
        this.pitchValue = frequency;
      }
      this.getPitch(); // Llama recursivamente para actualizar el pitch
    });
  }
}