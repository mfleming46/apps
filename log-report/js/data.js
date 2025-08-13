// js/data.js
const localIps = new Set(['127.0.0.1','::1']);
export async function getMyIp(){
  try{ const r = await fetch('https://api.ipify.org?format=json'); const j = await r.json(); return j.ip || null; }
  catch{ return null; }
}
export async function loadLogSummary(myIp){
  // Relative path
  const response = await fetch('log-echo.php');
  if (!response.ok) throw new Error('Failed to load log');
  const text = await response.text();
  const lines = text.trim().split('\n').filter(Boolean);
  const pages = {}; const ipData = {}; const dateCounts = {}; const dates = [];
  let validHits = 0;
  for (const raw of lines){
    const [timestamp, ip, page] = raw.split(',');
    if (!timestamp || !ip || !page) continue;
    if (ip === myIp || localIps.has(ip)) continue;
    validHits++;
    const date = timestamp.slice(0,10);
    const cleanPage = String(page).trim();
    pages[cleanPage] = (pages[cleanPage] || 0) + 1;
    dateCounts[date] = (dateCounts[date] || 0) + 1;
    if (!ipData[ip]) ipData[ip] = { count: 0, dates: [] };
    ipData[ip].count++; ipData[ip].dates.push(date); dates.push(date);
  }
  dates.sort();
  const startDate = dates[0] || 'N/A';
  const endDate   = dates[dates.length - 1] || 'N/A';
  const uniqueIps = Object.keys(ipData).length;
  return { pages, ipData, dateCounts, startDate, endDate, validHits, uniqueIps };
}
