let tempoMin = 10;
let tempoMax = 400;
let tempo = 60;
let beatsPerBar = 1;
let clicksPerBeat = 1;
let beat = 1;
let isPlaying = false;
let interval;

let highBlockSound, lowBlockSound, subdivisionLowBlockSound;

function loaded() {
  beatsPerBar = 1;
  clicksPerBeat = 1;
  tempo = 60;
  isPlaying = false;

  document.getElementById("txtBPM").value = tempo;
  document.getElementById("cbSubdiv").value = 1;

  // Event listener for Enter/Tab key in BPM input
  document.getElementById("txtBPM").addEventListener("keyup", function(event) {
    if (event.keyCode === 13 || event.keyCode === 9) {
      event.preventDefault();
      document.getElementById("cbSubdiv").focus();
    }
  });

  // Load sound files
  highBlockSound = new Howl({ src: ["High-Wood-Block.mp3"] });
  lowBlockSound = new Howl({ src: ["Low-Wood-Block.mp3"] });
  subdivisionLowBlockSound = new Howl({ src: ["N1R-Low-Wood-Block.mp3"] });
}

function btnUp_click() {
  txtBPM_blur();
  let x = tempo + 10;
  if (x > tempoMax) x = tempoMax;
  if (x < tempoMin) x = tempoMin;
  document.getElementById("txtBPM").value = x;
  tempo = x;
  tick_reset();
}

function btnDown_click() {
  txtBPM_blur();
  let x = tempo - 10;
  if (x > tempoMax) x = tempoMax;
  if (x < tempoMin) x = tempoMin;
  document.getElementById("txtBPM").value = x;
  tempo = x;
  tick_reset();
}

function txtBPM_input() {}

function txtBPM_blur() {
  let x = Number(document.getElementById("txtBPM").value);
  if (x > tempoMax) x = tempoMax;
  if (x < tempoMin) x = tempoMin;
  if (x !== tempo) {
    tempo = x;
    document.getElementById("txtBPM").value = x;
    tick_reset();
  }
}

function cbSub_change() {
  txtBPM_blur();
  let x = Number(document.getElementById("cbSubdiv").value);
  if (x < 1) x = 1;
  clicksPerBeat = x;
  tick_reset();
}

function btnSS_click() {
  txtBPM_blur();
  isPlaying = !isPlaying;
  if (isPlaying) {
    playClick();
    document.getElementById("btnSS").value = "Stop";
    interval = setInterval(playClick, (60000 / tempo) / clicksPerBeat);
  } else {
    clearInterval(interval);
    document.getElementById("btnSS").value = "Start";
    beat = 1;
  }
}

function tick_reset() {
  if (!isPlaying) return;
  clearInterval(interval);
  beat = 1;
  interval = setInterval(playClick, (60000 / tempo) / clicksPerBeat);
}

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
