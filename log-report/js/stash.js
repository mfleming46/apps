// js/stash.js
const STASH_KEY = 'ipPrefixStash.v1';
const STASH_SEEDED_KEY = 'ipPrefixStashSeeded.v1';
export function loadStash(){ try { return JSON.parse(localStorage.getItem(STASH_KEY) || '{}'); } catch { return {}; } }
export function saveStash(s){ localStorage.setItem(STASH_KEY, JSON.stringify(s)); }
export function seedStashOnce(){
  if (localStorage.getItem(STASH_SEEDED_KEY)) return;
  const s = loadStash();
  const seeds = {
    '70.119.124.187': 'America/Chicago',
    '71.230.229.75':  'America/New_York',
    '77.164.170.109': 'Europe/Amsterdam',
    '81.217.84.9':    'Europe/Vienna',
    '24.94.4.106':    'America/Los_Angeles'
  };
  for (const [k,v] of Object.entries(seeds)) if (!(k in s)) s[k] = v;
  saveStash(s);
  localStorage.setItem(STASH_SEEDED_KEY, '1');
}
export function exportStash(){
  const blob = new Blob([JSON.stringify(loadStash(), null, 2)], {type:'application/json'});
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = 'ip-stash.json';
  a.click();
  URL.revokeObjectURL(a.href);
}
export async function importStashFromFile(file){
  const txt = await file.text();
  const obj = JSON.parse(txt);
  if (typeof obj !== 'object' || Array.isArray(obj)) throw new Error('Not a JSON object');
  const s = loadStash(); Object.assign(s, obj); saveStash(s);
}
export function clearStash(){ localStorage.removeItem(STASH_KEY); }
