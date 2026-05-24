// Configuration des plages horaires et tarifs
// Modifiez cette structure pour adapter vos horaires/tarifs.
const schedule = {
  // jours: 0 = dimanche, 1 = lundi, ..., 6 = samedi
  0: [ // Dimanche
    {start: '00:00', end: '07:00', price: 90},
    {start: '07:00', end: '19:00', price: 40},
    {start: '19:00', end: '24:00', price: 60}
  ],
  1: [ // Lundi
    {start: '00:00', end: '07:00', price: 90},
    {start: '07:00', end: '19:00', price: 40},
    {start: '19:00', end: '24:00', price: 60}
  ],
  2: [ // Mardi
    {start: '00:00', end: '07:00', price: 90},
    {start: '07:00', end: '19:00', price: 40},
    {start: '19:00', end: '24:00', price: 60}
  ],
  3: [ // Mercredi
    {start: '00:00', end: '07:00', price: 90},
    {start: '07:00', end: '19:00', price: 40},
    {start: '19:00', end: '24:00', price: 60}
  ],
  4: [ // Jeudi
    {start: '00:00', end: '07:00', price: 90},
    {start: '07:00', end: '19:00', price: 40},
    {start: '19:00', end: '24:00', price: 60}
  ],
  5: [ // Vendredi
    {start: '00:00', end: '07:00', price: 90},
    {start: '07:00', end: '19:00', price: 40},
    {start: '19:00', end: '24:00', price: 60}
  ],
  6: [ // Samedi
    {start: '00:00', end: '07:00', price: 90},
    {start: '07:00', end: '19:00', price: 40},
    {start: '19:00', end: '24:00', price: 60}
  ],
  // Tarif jour férié (override)
  holidayPrice: 90
};

// Majorant pour un client professionnel
const professionalExtra = 10;

const dayNames = ['Dimanche','Lundi','Mardi','Mercredi','Jeudi','Vendredi','Samedi'];

function parseHM(hm){
  const [hh,mm]=hm.split(':').map(Number);
  return {hh,mm};
}

function timeToMinutes(hm){
  const {hh,mm} = parseHM(hm);
  return hh*60 + mm;
}

function buildTable(){
  const container = document.getElementById('table-container');
  const isProfessional = document.getElementById('isProfessional')?.checked;
  const table = document.createElement('table');
  const thead = document.createElement('thead');
  const headRow = document.createElement('tr');
  headRow.appendChild(document.createElement('th'));
  headRow.appendChild(document.createElement('th')).textContent = '00:00 - 07:00';
  headRow.appendChild(document.createElement('th')).textContent = '07:00 - 19:00';
  headRow.appendChild(document.createElement('th')).textContent = '19:00 - 24:00';
  thead.appendChild(headRow);
  table.appendChild(thead);
  const tbody = document.createElement('tbody');

  for(let d=1; d<=7; d++){
    const dayIndex = d % 7; // 1..7 -> 1..6,0
    const row = document.createElement('tr');
    row.appendChild(document.createElement('th')).textContent = dayNames[dayIndex];
    const periods = schedule[dayIndex] || [];
    // order: 00-07,07-19,19-24
    const p00 = periods.find(p => timeToMinutes(p.start) === 0 && timeToMinutes(p.end)===420);
    const p07 = periods.find(p => timeToMinutes(p.start) === 420 && timeToMinutes(p.end)===1140);
    const p19 = periods.find(p => timeToMinutes(p.start) === 1140 && timeToMinutes(p.end)===1440);

    const td00 = document.createElement('td'); td00.className='period-early'; td00.textContent = p00 ? (p00.price + (isProfessional?professionalExtra:0))+'€/h' : '-';
    const td07 = document.createElement('td'); td07.className='period-day'; td07.textContent = p07 ? (p07.price + (isProfessional?professionalExtra:0))+'€/h' : '-';
    const td19 = document.createElement('td'); td19.className='period-evening'; td19.textContent = p19 ? (p19.price + (isProfessional?professionalExtra:0))+'€/h' : '-';

    row.appendChild(td00); row.appendChild(td07); row.appendChild(td19);
    tbody.appendChild(row);
  }

  // ligne jours fériés
  const rowHoliday = document.createElement('tr');
  rowHoliday.appendChild(document.createElement('th')).textContent = 'Jours fériés';
  const tdAll = document.createElement('td'); tdAll.colSpan = 3; tdAll.className = 'period-evening'; tdAll.textContent = (schedule.holidayPrice + (isProfessional?professionalExtra:0)) + '€/h';
  rowHoliday.appendChild(tdAll);
  tbody.appendChild(rowHoliday);

  table.appendChild(tbody);
  container.innerHTML = '';
  container.appendChild(table);
}

function nowFormatted(date){
  return date.toLocaleTimeString([], {hour:'2-digit',minute:'2-digit',second:'2-digit'});
}

function findCurrentPeriod(dayIndex, date, isHoliday){
  if(isHoliday) return {price: schedule.holidayPrice, until: endOfDay(date), periodClass: 'period-evening'};
  const periods = schedule[dayIndex] || [];
  const minutesNow = date.getHours()*60 + date.getMinutes();
  for(const p of periods){
    const startMin = timeToMinutes(p.start);
    const endMin = timeToMinutes(p.end === '24:00' ? '23:59' : p.end);
    // special case: treat 24:00 as end of day
    if(minutesNow >= startMin && minutesNow < (endMin===1439?1440:endMin)){
      const until = computeEndDate(date, p.end);
      let periodClass = 'period-day';
      if(startMin === 0) periodClass = 'period-early';
      else if(startMin === 420) periodClass = 'period-day';
      else if(startMin === 1140) periodClass = 'period-evening';
      return {price: p.price, until, periodClass};
    }
  }
  // fallback: end of day, use evening style
  return {price: schedule.holidayPrice, until: endOfDay(date), periodClass: 'period-evening'};
}

function computeEndDate(now, endHM){
  // endHM like '07:00' or '24:00'
  if(endHM === '24:00'){
    const d = new Date(now);
    d.setHours(23,59,59,999);
    return d;
  }
  const {hh,mm} = parseHM(endHM);
  const d = new Date(now);
  d.setHours(hh,mm,0,0);
  // if end is earlier or equal than current time, assume end next day
  if(d <= now){ d.setDate(d.getDate()+1); }
  return d;
}

function endOfDay(now){
  const d = new Date(now); d.setHours(23,59,59,999); return d;
}

function updateRealtime(){
  const now = new Date();
  const isHoliday = isFrenchHoliday(now);
  const holidayStatus = document.getElementById('holidayStatus');
  if (isHoliday) {
    holidayStatus.textContent = '📅 Aujourd\'hui est un jour férié';
    holidayStatus.className = 'holiday-yes';
  } else {
    holidayStatus.textContent = '📅 Aujourd\'hui n\'est pas un jour férié';
    holidayStatus.className = 'holiday-no';
  }
  const isProfessional = document.getElementById('isProfessional').checked;
  document.getElementById('now').textContent = `Il est ${nowFormatted(now)}`;
  const dayIndex = now.getDay();
  const cur = findCurrentPeriod(dayIndex, now, isHoliday);
  const adjustedPrice = cur.price + (isProfessional?professionalExtra:0);
  const until = cur.until;
  const untilStr = until ? until.toLocaleTimeString([], {hour:'2-digit',minute:'2-digit'}) : '-';
  const who = isProfessional ? 'Professionnel' : 'Particulier';
  const rateText = `(${who}) Le tarif est de ${adjustedPrice}€/h jusqu'à ${untilStr}`;
  const el = document.getElementById('current-rate');
  el.textContent = rateText;
  // appliquer couleur du prix du tableau comme fond de la boîte
  const cls = cur.periodClass || 'period-day';
  el.className = 'pill ' + cls;
  // mettre en gras la cellule correspondante dans le tableau
  highlightCurrentCell(dayIndex, cls);
  // trouver la cellule correspondante dans le tableau pour récupérer sa couleur de texte
  try{
    const table = document.querySelector('#table-container table');
    if(table){
      const tbody = table.tBodies[0];
      // mapping dayIndex -> rowIndex (table rows are Lundi..Dimanche)
      const rowIndex = dayIndex === 0 ? 6 : dayIndex - 1;
      const row = tbody.rows[rowIndex];
      let colIndex = 1; // default -> 00-07
      if(cls === 'period-early') colIndex = 1;
      else if(cls === 'period-day') colIndex = 2;
      else if(cls === 'period-evening') colIndex = 3;
      const cell = row && row.cells[colIndex];
      if(cell){
        const cs = getComputedStyle(cell);
        const priceColor = cs.color;
        // appliquer couleur en fond
        el.style.backgroundColor = priceColor;
        // définir la couleur du texte pour contraste
        el.style.color = getContrastColor(priceColor);
      }
    }
  }catch(e){
    // ignore si algo fail
  }
}

function clearHighlightedCell(){
  const prev = document.querySelectorAll('#table-container td.current-cell');
  prev.forEach(c => c.classList.remove('current-cell'));
  const removed = document.querySelectorAll('#table-container td.no-top-border');
  removed.forEach(c => c.classList.remove('no-top-border'));
}

function highlightCurrentCell(dayIndex, cls){
  try{
    const table = document.querySelector('#table-container table');
    if(!table) return;
    const tbody = table.tBodies[0];
    const rowIndex = dayIndex === 0 ? 6 : dayIndex - 1;
    const row = tbody.rows[rowIndex];
    if(!row) return;
    let colIndex = 1;
    if(cls === 'period-early') colIndex = 1;
    else if(cls === 'period-day') colIndex = 2;
    else if(cls === 'period-evening') colIndex = 3;
    clearHighlightedCell();
    const cell = row.cells[colIndex];
    if(cell) cell.classList.add('current-cell');
    // éviter la double bordure en retirant la bordure supérieure de la cellule en dessous
    const belowRow = tbody.rows[rowIndex+1];
    if(belowRow){
      const belowCell = belowRow.cells[colIndex];
      if(belowCell) belowCell.classList.add('no-top-border');
    }
  }catch(e){
    // ignore
  }
}

function parseRGB(colorStr){
  const m = colorStr.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/);
  if(!m) return null;
  return [Number(m[1]), Number(m[2]), Number(m[3])];
}

function getContrastColor(colorStr){
  const rgb = parseRGB(colorStr);
  if(!rgb) return '#000';
  // compute luminance
  const [r,g,b] = rgb.map(v => v/255).map(v => (v <= 0.03928) ? v/12.92 : Math.pow((v+0.055)/1.055, 2.4));
  const L = 0.2126*r + 0.7152*g + 0.0722*b;
  return L > 0.5 ? '#000' : '#fff';
}

// Calcule la date de Pâques pour une année donnée (algorithme grégorien anonyme)
function getEasterDate(year) {
  const a = year % 19;
  const b = Math.floor(year / 100);
  const c = year % 100;
  const d = Math.floor(b / 4);
  const e = b % 4;
  const f = Math.floor((b + 8) / 25);
  const g = Math.floor((b - f + 1) / 3);
  const h = (19 * a + b - d - g + 15) % 30;
  const i = Math.floor(c / 4);
  const k = c % 4;
  const l = (32 + 2 * e + 2 * i - h - k) % 7;
  const m = Math.floor((a + 11 * h + 22 * l) / 451);
  const month = Math.floor((h + l - 7 * m + 114) / 31);
  const day = ((h + l - 7 * m + 114) % 31) + 1;
  return new Date(year, month - 1, day);
}

// Vérifie si une date est un jour férié français
function isFrenchHoliday(date) {
  const y = date.getFullYear();
  const m = date.getMonth() + 1;
  const d = date.getDate();

  // Jours fériés fixes
  const fixed = [
    [1,  1],  // Jour de l'an
    [5,  1],  // Fête du Travail
    [5,  8],  // Victoire 1945
    [7,  14], // Fête Nationale
    [8,  15], // Assomption
    [11, 1],  // Toussaint
    [11, 11], // Armistice
    [12, 25], // Noël
  ];
  if (fixed.some(([fm, fd]) => fm === m && fd === d)) return true;

  // Jours fériés mobiles (basés sur Pâques)
  const easter = getEasterDate(y);
  const ms = easter.getTime();
  const day1 = 24 * 60 * 60 * 1000;
  const movable = [
    easter,                        // Dimanche de Pâques
    new Date(ms + day1),           // Lundi de Pâques
    new Date(ms + 39 * day1),      // Ascension
    new Date(ms + 49 * day1),      // Dimanche de Pentecôte
    new Date(ms + 50 * day1),      // Lundi de Pentecôte
  ];
  return movable.some(h => h.getFullYear() === y && h.getMonth() + 1 === m && h.getDate() === d);
}

document.addEventListener('DOMContentLoaded', ()=>{
  buildTable();
  updateRealtime();
  setInterval(updateRealtime, 1000);
  const prof = document.getElementById('isProfessional');
  if(prof){
    prof.addEventListener('change', ()=>{ buildTable(); updateRealtime(); });
  }
});
