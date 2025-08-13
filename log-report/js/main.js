// js/main.js
import { setGroup24 } from './config.js';
import { fmt } from './utils.js';
import { loadStash, saveStash, seedStashOnce, exportStash, importStashFromFile, clearStash } from './stash.js';
import { getMyIp, loadLogSummary } from './data.js';
import { renderByDayBars } from './render/dayBars.js';
import { renderIpTable } from './render/ipTable.js';

let myIp = null;
let globalIps = [];
let globalIpData = {};

async function init(){
  seedStashOnce();
  try{
    myIp = await getMyIp();
    if (location.hostname === 'localhost' || location.hostname === '127.0.0.1'){
      document.getElementById('env-note').textContent = '(Running locally — localhost filtered)';
    }
  }catch{
    document.getElementById('env-note').textContent = '(Could not determine your IP — showing all data)';
  }
  await loadAndRender();
  wireStashUi();
}

async function loadAndRender(){
  try{
    const { pages, ipData, dateCounts, startDate, endDate, validHits, uniqueIps } = await loadLogSummary(myIp);
    document.getElementById('summary').textContent = composeSummaryText({pages, startDate, endDate, validHits, uniqueIps});
    renderByDayBars(dateCounts, 'day-bars');
    globalIps = Object.keys(ipData); globalIpData = ipData;
    const stash = loadStash();
    renderIpTable(globalIps, globalIpData, stash, {
      tableMountId: 'ip-table',
      unknownMountId: 'unknown-list',
      onUnknownClick: (prefix) => {
        const ipInput = document.getElementById('ip-input');
        const locInput = document.getElementById('loc-input');
        ipInput.value = prefix; locInput.focus();
      }
    });
  }catch(e){
    console.error(e);
    document.getElementById('summary').textContent = 'Error loading log.';
  }
}

function composeSummaryText({pages, startDate, endDate, validHits, uniqueIps}){
  let lines = [];
  lines.push(`Date range: ${startDate} to ${endDate}`);
  lines.push('');
  lines.push('Hits per app/page:');
  for (const p of Object.keys(pages).sort()){ lines.push(`  ${p}: ${pages[p]}`); }
  lines.push('');
  lines.push(`Total hits: ${fmt(validHits)}`);
  lines.push(`Unique IPs (excluding yours): ${fmt(uniqueIps)}`);
  return lines.join('\n');
}

function wireStashUi(){
  const ipInput  = document.getElementById('ip-input');
  const locInput = document.getElementById('loc-input');

  document.getElementById('add-update').onclick = () => {
    const key = (ipInput.value || '').trim();
    const loc = (locInput.value || '').trim();
    if (!key) { alert('Enter an IP/prefix.'); return; }
    if (!loc) { alert('Enter a location.'); return; }
    const s = loadStash(); s[key] = loc; saveStash(s);
    ipInput.value = ''; locInput.value = '';
    renderIpTable(globalIps, globalIpData, s, {
      tableMountId: 'ip-table', unknownMountId: 'unknown-list',
      onUnknownClick: (prefix) => { ipInput.value = prefix; locInput.focus(); }
    });
  };

  document.getElementById('delete-entry').onclick = () => {
    const key = (ipInput.value || '').trim();
    if (!key) { alert('Enter the IP/prefix to delete.'); return; }
    const s = loadStash();
    if (s[key]) { delete s[key]; saveStash(s); }
    ipInput.value=''; locInput.value='';
    renderIpTable(globalIps, globalIpData, loadStash(), {
      tableMountId: 'ip-table', unknownMountId: 'unknown-list',
      onUnknownClick: (prefix) => { ipInput.value = prefix; locInput.focus(); }
    });
  };

  document.getElementById('export-stash').onclick = () => { exportStash(); };

  document.getElementById('import-file').onchange = async (e) => {
    const file = e.target.files[0]; if (!file) return;
    try{
      await importStashFromFile(file);
      renderIpTable(globalIps, globalIpData, loadStash(), {
        tableMountId: 'ip-table', unknownMountId: 'unknown-list',
        onUnknownClick: (prefix) => { ipInput.value = prefix; locInput.focus(); }
      });
      alert('Imported.');
    }catch(err){ alert('Import failed: ' + (err?.message || 'not valid JSON object')); }
    finally{ e.target.value = ''; }
  };

  document.getElementById('clear-stash').onclick = () => {
    if (!confirm('Clear the entire stash?')) return;
    clearStash();
    renderIpTable(globalIps, globalIpData, loadStash(), {
      tableMountId: 'ip-table', unknownMountId: 'unknown-list',
      onUnknownClick: (prefix) => { ipInput.value = prefix; locInput.focus(); }
    });
  };

  document.getElementById('group24').onchange = (e) => {
    setGroup24(e.target.checked);
    renderIpTable(globalIps, globalIpData, loadStash(), {
      tableMountId: 'ip-table', unknownMountId: 'unknown-list',
      onUnknownClick: (prefix) => { ipInput.value = prefix; locInput.focus(); }
    });
  };

  // Relative clear log
	/*
  const clearBtn = document.getElementById('clear-log');
  if (clearBtn) {
    clearBtn.onclick = async () => {
      if (!confirm('Really clear the log?')) return;
      try {
        const res = await fetch('archive_log.php', { method: 'POST' });
        const txt = await res.text();
        alert(txt || 'Cleared.');
        await loadAndRender();
      } catch (e) {
        alert('Clear failed. See console.');
        console.error(e);
      }
    };
  }
	*/
	
	// Archive log button -> calls archive-log.php (relative), then refreshes
const archiveBtn = document.getElementById('archive-log');
if (archiveBtn) {
  archiveBtn.addEventListener('click', async () => {
    if (!confirm('Archive current log and start a new one?')) return;
    archiveBtn.disabled = true;
    try {
      const res = await fetch('archive-log.php', { method: 'POST' });
      const text = await res.text(); // backend returns JSON or text
      alert(text || 'Archived.');
      await loadAndRender(); // refresh reports (new log will be empty until new hits come in)
    } catch (e) {
      alert('Archive failed. See console.');
      console.error(e);
    } finally {
      archiveBtn.disabled = false;
    }
  });
}

	
	
}

init();
