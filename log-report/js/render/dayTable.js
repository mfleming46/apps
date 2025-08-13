// js/render/dayTable.js
import { pad, num } from '../utils.js';
export function renderByDayTable(dateCounts, mountId='day-table'){
  const el = document.getElementById(mountId);
  const entries = Object.entries(dateCounts).sort((a,b)=> a[0].localeCompare(b[0]));
  if (!entries.length) { el.textContent='(no data)'; return; }
  const header = `${pad('date', 12)}  ${pad('hits', 6)}`;
  const lines = [header, '-'.repeat(header.length)];
  for (const [d, c] of entries) lines.push(`${pad(d,12)}  ${num(c,6)}`);
  el.textContent = lines.join('\n');
}
