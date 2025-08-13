// js/utils.js
import { GROUP_IPV4_BY_24 } from './config.js';
export function normalizeIp(ip){
  if (ip.includes(':')) {
    const left = ip.split('::')[0];
    const parts = left.split(':').filter(Boolean);
    const keep = parts.slice(0,4).join(':');
    return keep || '::';
  }
  if (GROUP_IPV4_BY_24) return ip.split('.').slice(0,3).join('.') + '.*';
  return ip;
}
export const fmt = (n) => Number(n).toLocaleString();
export const pad = (s, n) => String(s).padEnd(n, ' ');
export const num = (n, w) => String(n).padStart(w, ' ');
