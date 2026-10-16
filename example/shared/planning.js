import {rates} from './museum-data.js';
export function estimateAdmission(counts,member=false) {
  return Math.round(Object.entries(rates).reduce((total,[type,rate])=>total+Math.max(0,Math.min(12,Math.trunc(Number(counts[type])||0)))*rate,0)*100)/100*(member?0:1);
}
export function getDateNotice(value) {
  if(!/^\d{4}-\d{2}-\d{2}$/.test(value)) return '';
  const monthDay=value.slice(5);
  if(['12-25','08-26'].includes(monthDay))return 'The museum is closed on this date. Please choose another day.';
  if(value>='2026-10-27' && value<='2026-10-29')return 'Prehistoric Journey is closed October 27–29. Other museum experiences remain available; check official availability.';
  return 'Opening hours and availability are confirmed on the official DMNS site.';
}
export function isMuseumClosed(value) {return /^\d{4}-\d{2}-\d{2}$/.test(value)&&['12-25','08-26'].includes(value.slice(5));}
