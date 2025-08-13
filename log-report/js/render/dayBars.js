// js/render/dayBars.js
export function renderByDayBars(dateCounts, mountId='day-bars'){
  const el = document.getElementById(mountId);
  const entries = Object.entries(dateCounts).sort((a,b)=> a[0].localeCompare(b[0]));
  if (!entries.length){ el.textContent='(no data)'; return; }
  const MAX_BAR = 40; const max = Math.max(...entries.map(([,c])=>c));
  const scale = max > 0 ? MAX_BAR / max : 1;
  const header = `date         hits   bar`;
  const lines = [header, '-'.repeat(header.length)];
  for (const [d, c] of entries){
    lines.push(`${d.padEnd(12)}  ${String(c).padStart(5)}  ${'x'.repeat(Math.round(c*scale))}`);
  }
  el.textContent = lines.join('\n');
}
