// js/render/ipTable.js
import { MIN_COUNT } from '../config.js';
import { normalizeIp, pad, num, fmt } from '../utils.js';
export function renderIpTable(ips, ipData, stash, options){
  const { tableMountId='ip-table', unknownMountId='unknown-list', onUnknownClick = ()=>{} } = options || {};
  const buckets = {};  const unknowns = {};
  for (const ip of ips){
    const k = normalizeIp(ip);
    const count = (ipData[ip]?.count) || 0;
    if (!buckets[k]) buckets[k] = { hits: 0, location: '' };
    buckets[k].hits += count;
    if (!buckets[k].location && stash[k]) buckets[k].location = stash[k];
  }
  const rows = Object.entries(buckets)
    .map(([key,v]) => {
      const loc = v.location || 'Unknown';
      if (loc === 'Unknown') unknowns[key] = (unknowns[key]||0) + v.hits;
      return { key, hits: v.hits, location: loc };
    })
    .filter(r => r.hits >= MIN_COUNT)
    .sort((a,b)=> b.hits - a.hits || a.key.localeCompare(b.key));
  const tableEl = document.getElementById(tableMountId);
  const header = `${pad('hits',7)}  ${pad('ip (prefix)',32)}  location`;
  const lines = [header, '-'.repeat(header.length)];
  for (const r of rows) lines.push(`${num(r.hits,7)}  ${pad(r.key,32)}  ${r.location}`);
  tableEl.textContent = lines.length > 2 ? lines.join('\n') : `(no entries with >= ${MIN_COUNT} hits)`;
  const unkEl = document.getElementById(unknownMountId);
  unkEl.innerHTML = '';
  const entries = Object.entries(unknowns).sort((a,b)=> b[1] - a[1]);
  for (const [prefix, hits] of entries){
    const span = document.createElement('span');
    span.className = 'pill';
    span.title = 'Click to prefill the form';
    span.textContent = `${prefix} (${fmt(hits)})`;
    span.onclick = () => onUnknownClick(prefix);
    unkEl.appendChild(span);
  }
  if (!entries.length){ unkEl.innerHTML = '<span class="muted">None 🎉</span>'; }
}
