let showPrivate = false;

async function loadLinks() {
  console.log("loadLinks");

  const res = await fetch('links.txt?v=' + Date.now());
  const text = await res.text();
  const links = parseFlatFile(text);
  renderLinks(links);
}

function parseFlatFile(text) {
  // Remove block comments: /* ... */
  text = text.replace(/\/\*[\s\S]*?\*\//g, '');

  const entries = text
    .split(/\r?\n\s*\r?\n/)
    .map(e => e.trim())
    .filter(e => e.length > 0 && !e.startsWith('#') && !e.startsWith('//'));

  return entries.map(entry => {
    const lines = entry
      .split(/\r?\n/)
      .filter(line =>
        !line.trim().startsWith('#') &&
        !line.trim().startsWith('//')
      );

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
    alpha: '🧭 alpha',
    live: '📘 live',
    beta: '🚧 beta',
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
  const container = document.getElementById('linkContainer');
  container.innerHTML = '';

  links.forEach(link => {
    const isPrivate = link.classification?.toLowerCase() === 'private';
    if (isPrivate && !showPrivate) return;

    const boxshotUrl = link.image || 'boxshots/blank_boxshot_80x120.png';
    const imgTag = `
      <div class="boxshot">
        <img src="${boxshotUrl}" alt="${link.title} box shot">
      </div>
    `;

    const fullDesc = (link.description || '').trim();
    const shortDesc = fullDesc.slice(0, 250);
    const isLong = fullDesc.length > 250;

    const descHTML = isLong
      ? `
        <div class="desc short-desc">${shortDesc}...</div>
        <div class="desc full-desc hidden">${fullDesc}</div>
        <button class="toggle-desc-button">More</button>
      `
      : `<div class="desc">${fullDesc}</div>`;

    const card = document.createElement('div');
    card.className = 'link-button';
    card.tabIndex = 0;

    card.innerHTML = `
      <div class="link-content">
        ${imgTag}
        <div class="text-content">
          <div class="badge-line">
            <span class="badge">${getClassificationBadge(link.classification)}</span>
            ${getNewBadge(link.new)}
          </div>
          <strong>${link.title || 'Untitled'}</strong><br/>
          ${descHTML}
        </div>
      </div>
    `;

    card.addEventListener('click', (e) => {
      const isToggle = e.target.closest('.toggle-desc-button');
      if (isToggle) {
        e.preventDefault();
        e.stopPropagation();

        const short = card.querySelector('.short-desc');
        const full = card.querySelector('.full-desc');

        short.classList.toggle('hidden');
        full.classList.toggle('hidden');

        const showingFull = !full.classList.contains('hidden');
        isToggle.textContent = showingFull ? 'Less' : 'More';
        return;
      }

      // if (link.url) window.open(link.url, '_blank');
			// ---- patch
			// NEW: per-item control
			function sanitizeName(s) {
				return String(s).toLowerCase().replace(/[^a-z0-9]+/g, '-').slice(0, 24) || 'app';
			}

			if (link.url) {
				const allowDup = (link.dup || '').toLowerCase() === 'true';
				const name = link.appid ? sanitizeName(link.appid) : null;

				if (allowDup || !name) {
					window.open(link.url, '_blank');          // explicit dup behavior
				} else {
					const w = window.open(link.url, name);     // reuse/focus this app’s tab
					if (w) w.opener = null;                    // safety
				}
			}
			// ---- end patch
    });

    container.appendChild(card);
  });
}

// Toggle private links (keyboard shortcut)
document.addEventListener('keydown', (e) => {
  if (e.ctrlKey && e.altKey && e.key.toLowerCase() === 'p') {
    showPrivate = !showPrivate;
    loadLinks();
  }
});

// Tap/click 3 times on title to unlock "Show Private Links" button
let tapCount = 0;
let tapTimer = null;

const title = document.getElementById('title');
title.addEventListener('touchend', handleTitleTap);
title.addEventListener('click', handleTitleTap);

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

// Show/hide private toggle button handler
window.addEventListener('DOMContentLoaded', () => {
  const btn = document.getElementById('togglePrivate');
  if (!btn) return;

  btn.addEventListener('click', togglePrivateView);
});

function togglePrivateView() {
  showPrivate = !showPrivate;
  loadLinks();

  document.getElementById('togglePrivate').textContent = showPrivate
    ? 'Hide Private Links'
    : 'Show Private Links';
}

// Initial load
loadLinks();
