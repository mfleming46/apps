let showPrivate = false;

/*
async function loadLinks() {
	console.log("loadLinks");
  const res = await fetch('links.txt');
  const text = await res.text();
  const links = parseFlatFile(text);
  renderLinks(links);
}
*/

async function loadLinks() {
  console.log("loadLinks");

  // Add a timestamp to prevent caching
  const res = await fetch('links.txt?v=' + Date.now());

  const text = await res.text();
  const links = parseFlatFile(text);
  renderLinks(links);
}


function parseFlatFile(text) {
  const entries = text
    .split(/\r?\n\s*\r?\n/)         // split blocks by blank lines
    .map(e => e.trim())             // clean each block
    .filter(e => e.length > 0);     // ignore empty blocks

  return entries.map(entry => {
    const lines = entry.split(/\r?\n/); // split each field line
    const link = {};
    let currentField = '';
    lines.forEach(line => {
      const match = line.match(/^(\w+):\s*(.*)$/);
      if (match) {
        currentField = match[1].toLowerCase();
        link[currentField] = match[2];
      } else if (currentField === 'description') {
        link.description = (link.description || '') + ' ' + line.trim();
      }
    });
    return link;
  });
}

function getClassificationBadge(classification = '') {
  const code = classification.toLowerCase();
  const map = {
    ib: '🧭 ib',
    oc: '📘 oc',
    wip: '🚧 wip',
    private: '🔒 private'
  };
  return map[code] || `❓ ${classification}`;
}

function getNewBadge(flag) {
  if (flag?.toLowerCase?.() === 'true') {
    return `<span class="new-badge">NEW</span>`;
  }
  return '';
}



function renderLinks(links) {
	console.log("renderLinks", links);
	
  const container = document.getElementById('linkContainer');
  container.innerHTML = '';

  links.forEach(link => {
    const isPrivate = link.classification?.toLowerCase() === 'private';
    if (isPrivate && !showPrivate) return;

    const btn = document.createElement('button');
    btn.className = 'link-button';
	btn.innerHTML = `
	  <div class="badge-line">
		<span class="badge">${getClassificationBadge(link.classification)}</span>
		${getNewBadge(link.new)}
	  </div>
	  <strong>${link.title || 'Untitled'}</strong><br/>
	  <span class="desc">${(link.description || '').replace(/\n/g, '<br>')}</span>
	`;
    btn.onclick = () => {
      if (link.url) window.open(link.url, '_blank');
    };
    container.appendChild(btn);
  });
}

// Toggle private links with Ctrl + Alt + P
document.addEventListener('keydown', (e) => {
  if (e.ctrlKey && e.altKey && e.key.toLowerCase() === 'p') {
    showPrivate = !showPrivate;
    loadLinks();
    //alert(showPrivate ? 'Private links shown' : 'Private links hidden');
  }
});


// ----------------------------------------------------
let tapCount = 0;
let tapTimer = null;

const title = document.getElementById('title');

title.addEventListener('touchend', handleTitleTap);
title.addEventListener('click', handleTitleTap); // for desktop

function handleTitleTap() {
  tapCount++;
  clearTimeout(tapTimer);
  tapTimer = setTimeout(() => {
    if (tapCount >= 3) {
      document.getElementById('togglePrivate').classList.remove('hidden');
      alert('Private toggle unlocked');
    }
    tapCount = 0;
  }, 400);
}

// -------------------------------------

  // Attach handler after DOM is ready
  window.addEventListener('DOMContentLoaded', () => {
	  console.log("hello wowrld");
    const btn = document.getElementById('togglePrivate');
    if (!btn) {
      console.warn("togglePrivate button not found");
      return;
    }

    btn.addEventListener('click', togglePrivateView);
  });

  function togglePrivateView() {
    console.log("togglePrivate clicked. Current value:", showPrivate);

    showPrivate = !showPrivate;

    console.log("New value of showPrivate:", showPrivate);

    loadLinks();

    document.getElementById('togglePrivate').textContent = showPrivate
      ? 'Hide Private Links'
      : 'Show Private Links';
  }






// Initial load
loadLinks();

console.log("script.js loaded");