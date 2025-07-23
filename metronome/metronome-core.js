
let tempo = 60;
let tempoMin = 10;
let tempoMax = 400;
let clicksPerBeat = 1;
let beatsPerBar = 1;
let beat = 1;
let isPlaying = false;
let interval;

let highBlockSound, lowBlockSound, subdivisionLowBlockSound;

// Initialize metronome (must be called before using)
function initMetronome() {
  console.log("initMetronome");
  highBlockSound = new Howl({ src: ["../metronome/../metronome/High-Wood-Block.mp3"] });
  lowBlockSound = new Howl({ src: ["../metronome/Low-Wood-Block.mp3"] });
  subdivisionLowBlockSound = new Howl({ src: ["../metronome/N1R-Low-Wood-Block.mp3"] });
}

// Start metronome
function startMetronome() {
  if (isPlaying) return;
  playClick(); // immediate start
  isPlaying = true;
  interval = setInterval(playClick, (60000 / tempo) / clicksPerBeat);
}

// Stop metronome
function stopMetronome() {
  if (!isPlaying) return;
  clearInterval(interval);
  isPlaying = false;
  beat = 1;
}

function isMetronomePlaying() {
  return isPlaying;
}

// Set BPM (tempo)
function setBPM(value) {
  const bpm = Number(value);
  if (bpm < tempoMin || bpm > tempoMax) return;
  tempo = bpm;
  if (isPlaying) resetTick();
  console.log("bpm:", bpm);
  return tempo;
}

// Set subdivision (clicks per beat)
function setSubdivision(value) {
  const subdiv = Number(value);
  if (![1, 2, 3, 4, 6].includes(subdiv)) return;
  clicksPerBeat = subdiv;
  if (isPlaying) resetTick();
  console.log("zubdiv:", subdiv);
  return clicksPerBeat;
}

// Reset timing interval
function resetTick() {
  clearInterval(interval);
  beat = 1;
  interval = setInterval(playClick, (60000 / tempo) / clicksPerBeat);
}

// Internal click logic
function playClick() {
  if ((beat % (beatsPerBar * clicksPerBeat)) === 1) {
    highBlockSound.play();
  } else if (((beat % clicksPerBeat) === 1) || (clicksPerBeat === 1)) {
    lowBlockSound.play();
  } else {
    subdivisionLowBlockSound.play();
  }
  beat++;
}

console.log("✅ metronome-core.js loaded");