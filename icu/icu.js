// Define a specific key for your app
const storageKey = '_rc_ileave_clickup'; // Customize the key here
	
const startInput = document.getElementById('startBpm');
const targetInput = document.getElementById('targetBpm');
const deltaInput = document.getElementById('bpmDelta');
const tableBody = document.getElementById('bpmTable').querySelector('tbody');

let stashStart = 60;
let stashTarget = 120;
let stashDelta = 5;
let stashNSegs = 1;
let stashCurrentRow = -1;
let theBpm="zzz";

  function cycle(nsegs) {
    const pattern = [];
    if (nsegs === 1) {
      pattern.push("1");
    } else {
      pattern.push(`${1} --- ${nsegs}`);
    }
    pattern.push(`${nsegs}`);
    for (let first = nsegs - 1; first > 1; first--) {
      pattern.push(`${first} --- ${nsegs}`);
      pattern.push(`${nsegs}`);
    }
    return pattern;
  }

  function drawTable() {
    stashStart = parseInt(startInput.value, 10);
    stashTarget = parseInt(targetInput.value, 10);
    stashDelta = parseInt(deltaInput.value, 10);

    const nrows = 1 + Math.floor((stashTarget - stashStart) / stashDelta);
    const pats = cycle(stashNSegs);
    const npat = pats.length;
    let bpm = stashStart - stashDelta;

    tableBody.innerHTML = '';
    for (let i = 0; i < nrows; i++) {
      bpm += stashDelta;
      const pattern = pats[i % npat];
      const row = document.createElement('tr');
      row.innerHTML = `<td class="bpm-col">${bpm}</td><td class="seg-col">${pattern}</td>`;
      tableBody.appendChild(row);
    }

    highlightRow(0);
    stashCurrentRow = 0;
  }

  function highlightRow(index) {
    const rows = tableBody.querySelectorAll('tr');
    rows.forEach(r => r.classList.remove('highlight'));
    if (rows[index]) {
      rows[index].classList.add('highlight');
    }
    stashCurrentRow = index;
	const bpm = rows[index].cells[0].textContent.trim();  // ✅ Get column 0 value
	const seg = rows[index].cells[1].textContent.trim();  
	theBpm = bpm;
	document.getElementById('current-bpm').innerHTML = bpm;
	document.getElementById('current-seg').innerHTML = seg;
	
	// Deal with scrolling
	const container = document.querySelector('.bpm-table-container');
	const highlightedRow = document.querySelector('.bpm-table tr.highlight');

	if (highlightedRow && container) {
	  // Use container's coordinate system to scroll the row into view
	  const rowTop = highlightedRow.offsetTop;
	  const rowHeight = highlightedRow.offsetHeight;
	  const containerHeight = container.clientHeight;

	  // Scroll to center the highlighted row
	  container.scrollTop = rowTop - (containerHeight / 2) + (rowHeight / 2);
	}
	
	// now update the metronome
	if (isMetronomePlaying()) {
		handleStart();
	}
  }

  function doReset() {
	if (validateInput()) { 
	    closeSettingsPanel();
		stashNSegs = 1;
		drawTable();
	}
	logClick();
  }
  
 
  function closeSettingsPanel() {
	const panel = document.getElementById('settings-panel');
    panel.style.display = 'none';
  }
 

  function doIncSegment() {
    stashNSegs++;
    drawTable();
  }

  function doDecSegment() {
    if (stashNSegs > 1) {
      stashNSegs--;
      drawTable();
    }
  }

  function doIncBpm() {
	logClick();
    const next = stashCurrentRow + 1;
    if (next >= tableBody.rows.length) {
      doIncSegment();
    } else {
      highlightRow(next);
    }
  }

  function doDecBpm() {
    const prev = stashCurrentRow - 1;
    if (prev < 0) {
      doDecSegment();
    } else {
      highlightRow(prev);
    }
  }
  
 function doDefaults() {
  startInput.value = 60;
  targetInput.value = 120;
  deltaInput.value = 5;
  const settingsText = `Start: 60 &nbsp; Target: 120 &nbsp; Step: 5`;
  document.getElementById('settings-text').innerHTML = settingsText;
  doReset();
  closeSettingsPanel();
 }	 
  
function validateInput() {
  const start = parseInt(startInput.value, 10);
  const target = parseInt(targetInput.value, 10);
  const delta = parseInt(deltaInput.value, 10);

  // Validation checks
  const inputsAreValid =
    !isNaN(start) &&
    !isNaN(target) &&
    !isNaN(delta) &&
    delta > 0 &&
    target > start + delta;

  if (!inputsAreValid) {
    alert("Invalid input. Changes not applied.");
	startInput.value = stashStart
	targetInput.value = stashTarget
	deltaInput.value = stashDelta
    return false;
  }
  
  // span id="settings-text">Start: 60 &nbsp; Target: 120 &nbsp; Step: 5</span>
  const settingsText = `Start: ${start} &nbsp; Target: ${target} &nbsp; Step: ${delta}`;
  document.getElementById('settings-text').innerHTML = settingsText;
  return true;
}

 
  
function loadStateFromStorage() {
  const state = SafeStorage.getItem(storageKey);

  if (state) {
    startInput.value = state.start;
    targetInput.value = state.target;
    deltaInput.value = state.delta;
  }

  doReset();
}

  
function saveStateToStorage() {
  const state = {
    start: parseInt(startInput.value, 10),
    target: parseInt(targetInput.value, 10),
    delta: parseInt(deltaInput.value, 10)
  };
  SafeStorage.setItem(storageKey, state);
}

// --------------------------------- metronome --------------------------
function handleStart() {
   const bpm = parseInt(theBpm, 10);
   if (isNaN(bpm)) {
	  return;
   }

   const subdiv = document.getElementById("subdiv").value;
   setBPM(bpm);
   setSubdivision(subdiv);
   startMetronome();
}

function handleStop() {
  stopMetronome();
}

function btnMetronome_click() {
	console.log("btnMetronome_click");
	if (isMetronomePlaying()) {
		stopMetronome(); 
		return;
	} 
	handleStart();
}


function subdiv_change() {
	console.log("subdiv_change");
	handleStart()
}


function btnHelp_click() {
    const button = document.getElementById('btnHelp');
    const panel = document.getElementById('divHelp');

    if (panel.style.display === "block") {
        // Hide panel and change button text
        panel.style.display = "none";
        button.textContent = "Show Instructions";
    } else {
        // Show panel and change button text
        panel.style.display = "block";
        button.textContent = "Hide Instructions";
    }
}

function btnDemo_click() {
	//alert("Coming Soon")
	window.open(" https://www.youtube.com/watch?v=jTN5OWnOpbc", "_blank");
}


function logClick() {
  fetch('/apps/log.php?page=icu', { method: 'GET' })
  console.log("click logged");
}

// ---------------------------------------------------------------------
  

// Bind buttons
document.getElementById('btnDefaults').addEventListener('click', doDefaults);
document.getElementById('btnReset').addEventListener('click', doReset);
document.getElementById('btnIncSeg').addEventListener('click', doIncSegment);
document.getElementById('btnDecSeg').addEventListener('click', doDecSegment);
document.getElementById('btnIncBpm').addEventListener('click', doIncBpm);
document.getElementById('btnDecBpm').addEventListener('click', doDecBpm);


document.getElementById('btnHelp').addEventListener('click', btnHelp_click);
document.getElementById('btnDemo').addEventListener('click', btnDemo_click);

document.getElementById('btnMetronome').addEventListener('click', btnMetronome_click);
document.getElementById('subdiv').addEventListener('change', subdiv_change);

document.getElementById('btnToggleSettings').addEventListener('click', () => {
  const panel = document.getElementById('settings-panel');
  const isVisible = panel.style.display === 'block';
  panel.style.display = isVisible ? 'none' : 'block';
});



document.addEventListener('keydown', function(e) {
  if (e.ctrlKey && e.shiftKey && e.altKey && e.key === 'D') {
	const menu = document.getElementById('debugMenu');
	menu.style.display = menu.style.display === 'none' ? 'block' : 'none';
  }
});

document.addEventListener("DOMContentLoaded", function () {
	loadStateFromStorage();
	initMetronome();
  drawTable();
  highlightRow(stashCurrentRow);
});

window.addEventListener("beforeunload", function (e) {
	saveStateToStorage();
});


