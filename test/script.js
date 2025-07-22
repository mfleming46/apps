let showPrivate = false;

async function loadLinks() {
  const res = await fetch('links.txt');
  const text = await res.text();
  const links = parseFlatFile(text);
  renderLinks(links);
}

function XparseFlatFile(text) {
  const entries = text.trim().split(/\r?\n\s*\r?\n/); // split blocks by blank line

  return entries.map(entry => {
    const lines = entry.split(/\r?\n/); // split lines within a block
    const link = {};
    let currentField = '';
    lines.forEach(line => {
      const match = line.match(/^(\w+):\s*(.*)$/);
      if (match) {
        currentField = match[1].toLowerCase();
        link[currentField] = match[2];
      } else if (currentField === 'description') {
        link.description = (link.description || '') + '\n' + line;
      }
    });
    return link;
  });
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
        link.description = (link.description || '') + '\n' + line;
      }
    });
    return link;
  });
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
    alert(showPrivate ? 'Private links shown' : 'Private links hidden');
  }
});

// Initial load
loadLinks();

console.log("script.js loaded");