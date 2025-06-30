
  const startInput = document.getElementById('startBpm');
  const targetInput = document.getElementById('targetBpm');
  const deltaInput = document.getElementById('bpmDelta');
  const tableBody = document.getElementById('bpmTable').querySelector('tbody');

  let stashStart = 60;
  let stashTarget = 120;
  let stashDelta = 5;
  let stashNSegs = 1;
  let stashCurrentRow = -1;

  function cycle(nsegs) {
    const pattern = [];
    if (nsegs === 1) {
      pattern.push("1");
    } else {
      pattern.push(`${1} --> ${nsegs}`);
    }
    pattern.push(`${nsegs}`);
    for (let first = nsegs - 1; first > 1; first--) {
      pattern.push(`${first} --> ${nsegs}`);
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
      row.innerHTML = `<td>${bpm}</td><td>${pattern}</td>`;
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
  }

  function doReset() {
    stashNSegs = 1;
    drawTable();
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
	logClick()
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
  

    function logClick() {
      fetch('/apps/log.php?page=iclick', { method: 'GET' })
    }
  

  // Bind buttons
  document.getElementById('btnReset').addEventListener('click', doReset);
  document.getElementById('btnIncSeg').addEventListener('click', doIncSegment);
  document.getElementById('btnDecSeg').addEventListener('click', doDecSegment);
  document.getElementById('btnIncBpm').addEventListener('click', doIncBpm);
  document.getElementById('btnDecBpm').addEventListener('click', doDecBpm);

  // Initialize
  drawTable();


