/* ==========================================================
   Q'NOTA — interacciones
   Pasaporte de entrada, panel de destinos, pasaporte de
   sabores con sellos, carta con buscador, rockola de vídeos,
   carrusel de postales arrastrable y reseñas.
   ========================================================== */
(() => {
'use strict';

const $  = (s, c = document) => c.querySelector(s);
const $$ = (s, c = document) => [...c.querySelectorAll(s)];
const norm = (s) => s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();

const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
const hasGSAP = typeof window.gsap !== 'undefined' && typeof window.ScrollTrigger !== 'undefined';
const motion = hasGSAP && !reduced;
if (hasGSAP) gsap.registerPlugin(ScrollTrigger);
if ('scrollRestoration' in history) history.scrollRestoration = 'manual';
// si el navegador congela los fotogramas (pestaña oculta), la animación se completa igual
const watchdog = (tl, ms) => { setTimeout(() => { if (tl.progress() < 1) tl.progress(1); }, ms); return tl; };

/* ----------------------------------------------------------
   BANDERAS (SVG dibujadas a mano, recortadas en círculo)
   ---------------------------------------------------------- */
const star = (cx, cy, r, fill) => {
  let d = '';
  for (let i = 0; i < 10; i++) {
    const a = -Math.PI / 2 + i * Math.PI / 5, rr = i % 2 ? r * .45 : r;
    d += (i ? 'L' : 'M') + (cx + rr * Math.cos(a)).toFixed(2) + ' ' + (cy + rr * Math.sin(a)).toFixed(2);
  }
  return `<path d="${d}Z" fill="${fill}"/>`;
};
const veStars = () => {
  let s = '';
  for (let i = 0; i < 8; i++) {
    const a = (200 + i * 20) * Math.PI / 180;
    s += `<circle cx="${(30 + 11 * Math.cos(a)).toFixed(2)}" cy="${(34 + 11 * Math.sin(a)).toFixed(2)}" r="1.5" fill="#fff"/>`;
  }
  return s;
};
const FLAG_ART = {
  ve: () => `<rect width="60" height="20" fill="#FCD116"/><rect y="20" width="60" height="20" fill="#00247D"/><rect y="40" width="60" height="20" fill="#CF142B"/>${veStars()}`,
  co: () => `<rect width="60" height="30" fill="#FCD116"/><rect y="30" width="60" height="15" fill="#003893"/><rect y="45" width="60" height="15" fill="#CE1126"/>`,
  cu: () => `<rect width="60" height="60" fill="#fff"/><rect width="60" height="12" fill="#002A8F"/><rect y="24" width="60" height="12" fill="#002A8F"/><rect y="48" width="60" height="12" fill="#002A8F"/><path d="M0 0 L32 30 L0 60Z" fill="#CF142B"/>${star(11, 30, 6, '#fff')}`,
  pe: () => `<rect width="60" height="60" fill="#fff"/><rect width="20" height="60" fill="#D91023"/><rect x="40" width="20" height="60" fill="#D91023"/>`,
  bo: () => `<rect width="60" height="20" fill="#D52B1E"/><rect y="20" width="60" height="20" fill="#F9E300"/><rect y="40" width="60" height="20" fill="#007934"/>`,
  mx: () => `<rect width="60" height="60" fill="#fff"/><rect width="20" height="60" fill="#006847"/><rect x="40" width="20" height="60" fill="#CE1126"/><circle cx="30" cy="30" r="5.5" fill="#8C6A2F"/><path d="M24 33 Q30 39 36 33" fill="none" stroke="#006847" stroke-width="1.6"/>`,
  ar: () => `<rect width="60" height="60" fill="#fff"/><rect width="60" height="20" fill="#74ACDF"/><rect y="40" width="60" height="20" fill="#74ACDF"/><circle cx="30" cy="30" r="5" fill="#F6B40E"/>`,
  uy: () => { let s = '<rect width="60" height="60" fill="#fff"/>'; for (let i = 1; i < 9; i += 2) s += `<rect y="${(i * 60 / 9).toFixed(2)}" width="60" height="${(60 / 9).toFixed(2)}" fill="#0038A8"/>`; return s + `<rect width="28" height="33.4" fill="#fff"/><circle cx="14" cy="16.5" r="7" fill="#FCD116"/>`; },
  es: () => `<rect width="60" height="60" fill="#AA151B"/><rect y="15" width="60" height="30" fill="#F1BF00"/>`,
  qn: () => `<rect width="60" height="60" fill="#12100E"/><text x="30" y="41" text-anchor="middle" font-family="Arial Black, Arial" font-weight="900" font-size="30" fill="#F5C21B">Q'</text>`
};
let uid = 0;
const flagSVG = (code, cls = 'flag', shape = 'circle') => {
  const id = `fl${code}${++uid}`;
  const clip = shape === 'circle' ? '<circle cx="30" cy="30" r="30"/>' : '<rect width="60" height="60" rx="2"/>';
  const vb = shape === 'circle' ? '0 0 60 60' : '6 0 48 60';
  return `<svg class="${cls}" viewBox="${vb}" aria-hidden="true" preserveAspectRatio="xMidYMid slice"><defs><clipPath id="${id}">${clip}</clipPath></defs><g clip-path="url(#${id})">${FLAG_ART[code]()}</g></svg>`;
};

/* ----------------------------------------------------------
   DATOS (carta en sala de Q'Nota)
   ---------------------------------------------------------- */
const COUNTRIES = [
  { c: 've', name: 'Venezuela', ink: '#1F4FA8', img: 'cachapa-oriental.jpg', cap: 'Cachapa La Oriental', note: 'La base de la casa: Q\'Nota se define como «comida venezolana y mucho más». Arepas, cachapas, tequeños, pabellón…',
    dishes: [['06', 'Arepa (carne, pollo, queso latino o chicharrón)', '6,50'], ['07', 'Arepa mixta', '7,00'], ['08', 'Reina pepiada', '7,50'], ['02', 'Empanada (carne, pollo o queso latino)', '4,00'], ['10', 'Tequeños (queso o bocadillo)', '8,00'], ['19', 'Patacones (ternera y pollo, 6 u.)', '13,00'], ['25', 'Pabellón', '17,60'], ['27', 'Cachapa normal', '15,50'], ['33', 'Cachapa mixta', '17,50'], ['23', 'Tabla surtida', '24,50'], ['28', 'Dorada frita (600 g)', '17,00']] },
  { c: 'co', name: 'Colombia', ink: '#A87A0C', img: 'bandeja.jpg', cap: 'Bandeja Q\'Nota', note: 'Carne desmechada, frijoles antioqueños, arroz, huevo y tajadas: la bandeja más pedida.',
    dishes: [['26', 'Bandeja paisa', '18,95'], ['29', 'Encocado de camarón', '16,50']] },
  { c: 'cu', name: 'Cuba', ink: '#D7262E', img: 'chicharron.jpg', cap: 'Chicharrón con arepitas · foto de cliente', note: 'Chicharrón crujiente con patacones, yuca y ensalada dulce.',
    dishes: [['20', 'Chicharrón con patacones, yuca y ensalada dulce', '13,50']] },
  { c: 'pe', name: 'Perú', ink: '#A51C30', img: 'chaufa.jpg', cap: 'Arroz chaufa · foto de cliente', note: 'El arroz salteado que une Perú y Asia.',
    dishes: [['24', 'Arroz chaufa', '14,50']] },
  { c: 'mx', name: 'México', ink: '#2F6B3A', img: null, note: 'Tres tacos para compartir… o no.',
    dishes: [['31', 'Trío de tacos (frijol negro, carne y pollo)', '12,00']] },
  { c: 'ar', name: 'Argentina', ink: '#3D7FC1', img: null, note: 'La milanesa, gratinada a la napolitana.',
    dishes: [['22', 'Milanesa de pollo napolitana', '14,50']] },
  { c: 'uy', name: 'Uruguay', ink: '#1F4FA8', img: null, note: 'El chivito, también llamado pepito.',
    dishes: [['32', 'Chivito (pepito)', '16,50']] },
  { c: 'bo', name: 'Bolivia', ink: '#2F8F5B', img: null, note: 'Con su bandera en la carta: el ceviche.',
    dishes: [['18', 'Ceviche', '13,50']] },
  { c: 'es', name: 'España', ink: '#C0262E', img: 'gambas.jpg', cap: 'Gambas al ajillo · foto de cliente', note: 'Porque estamos en Lloret: paella marinera y clásicos de tapeo.',
    dishes: [['30', 'Paella marinera (mín. 2, precio por persona)', '13,95'], ['05', 'Patatas bravas', '5,00'], ['15', 'Chipirones a la andaluza', '14,50'], ['16', 'Gambas al ajillo', '17,50']] }
];

const MENU = [
  { id: 'entradas', t: 'Entradas', items: [
    ['01', 'Perro caliente', '4,50'], ['02', 'Empanada (carne, pollo o queso latino)', '4,00'], ['03', 'Empanada mixta', '4,50'], ['04', 'Patatas fritas', '4,50'],
    ['05', 'Patatas bravas', '5,00'], ['06', 'Arepa (carne, pollo, queso latino o chicharrón)', '6,50'], ['07', 'Arepa mixta', '7,00'], ['08', 'Reina pepiada', '7,50'],
    ['09', 'Yuca frita', '7,60'], ['10', 'Tequeños (queso o bocadillo)', '8,00'], ['11', 'Chicharrón', '8,50'], ['12', 'Tajadas con queso', '7,50'],
    ['13', 'Salchipapa', '10,50'], ['14', 'Alitas fritas', '8,50'], ['15', 'Chipirones a la andaluza', '14,50'], ['16', 'Gambas al ajillo', '17,50'], ['17', 'Tequeños de Nutella', '8,50']
  ] },
  { id: 'latinos', t: 'Platos latinos', items: [
    ['18', 'Ceviche', '13,50', 'bo'], ['19', 'Patacones (ternera y pollo, 6 u.)', '13,00', 've'], ['20', 'Chicharrón con patacones, yuca y ensalada dulce', '13,50', 'cu'],
    ['21', 'Hamburguesa', '10,00', 've'], ['22', 'Milanesa de pollo napolitana', '14,50', 'ar'], ['23', 'Tabla surtida', '24,50', 've'], ['24', 'Arroz chaufa', '14,50', 'pe'],
    ['25', 'Pabellón', '17,60', 've'], ['26', 'Bandeja paisa', '18,95', 'co'], ['27', 'Cachapa normal', '15,50', 've'], ['28', 'Dorada frita (600 g)', '17,00', 've'],
    ['29', 'Encocado de camarón', '16,50', 'co'], ['30', 'Paella marinera (mín. 2, por persona)', '13,95', 'es'], ['31', 'Trío de tacos (frijol negro, carne y pollo)', '12,00', 'mx'],
    ['32', 'Chivito (pepito)', '16,50', 'uy'], ['33', 'Cachapa mixta', '17,50', 've']
  ] },
  { id: 'carnes', t: 'Carnes', items: [
    ['34', 'Entrecot de Girona 350 g', '21,50'], ['35', 'Picada (carne, pollo, cerdo, chorizo, queso y patatas)', '22,00'], ['36', 'Costillas de cerdo a la barbacoa con arroz y patatas', '16,00']
  ] },
  { id: 'sopas', t: 'Sopas de domingo', note: 'solo domingos', items: [
    ['37', 'Hervido de costilla de res', '13,50'], ['38', 'Hervido de gallina', '13,50'], ['39', 'Mondongo', '14,50'], ['40', 'Asopado', '13,50']
  ] },
  { id: 'guarnicion', t: 'Guarnición adicional', note: '3,50 € cada una', sides: ['Arroz', 'Yuca', 'Ensalada', 'Patatas fritas', 'Arepas', 'Tostones'] }
];

const TRACKS = [
  { v: 'plancha', t: 'Cachapa en la plancha', s: 'Con @venezolanos_en_barcelona', d: '0:20' },
  { v: 'cachapa', t: 'Cachapa con queso y chicharrón', s: 'Recién doblada', d: '0:09' },
  { v: 'picada', t: 'La picada, chisporroteando', s: 'Carne, pollo y cerdo a la plancha', d: '0:06' },
  { v: 'encocado', t: 'Camarones con patacones', s: 'Con arroz y ensalada de aguacate', d: '0:15' },
  { v: 'sopa', t: 'Sopa y empanaditas', s: 'Comida latina de domingo', d: '0:16' },
  { v: 'arepa', t: 'Arepas, empanadas y tequeñones', s: 'Lo más pedido para picar', d: '0:12' },
  { v: 'frescolita', t: 'Frescolita y bandeja', s: 'Refresco venezolano y plato completo', d: '0:10' },
  { v: 'navidad', t: 'Postres y hallacas', s: 'La tradición venezolana de Navidad', d: '0:30' },
  { v: 'rincon', t: 'Rincón latino', s: 'El comedor y la barra', d: '0:15' },
  { v: 'local', t: 'Bienvenidos', s: 'La calle, la terraza, la puerta', d: '0:15' }
];

const PHOTOS = [
  ['cachapa-oriental.jpg', 'Cachapa La Oriental', 've', 'Instagram'], ['patacones.jpg', 'Patacones con mechada y pollo', 've', 'Instagram'],
  ['mesa-latina.jpg', 'Empanadas, tequeños y arepitas', 've', 'Instagram'], ['bandeja.jpg', 'Bandeja Q\'Nota', 'co', 'Instagram'],
  ['yuca.jpg', 'Yuca frita con salsa de la casa', 've', 'Instagram'], ['cachapa-pollo.jpg', 'Cachapa de pollo mechado y queso', 've', 'Instagram'],
  ['sala.jpg', 'El comedor', 'qn', 'Instagram'], ['reina-pepiada.jpg', 'Arepa reina pepiada', 've', 'Google'],
  ['bandeja-paisa.jpg', 'Bandeja paisa, desde arriba', 'co', 'Instagram'], ['gambas.jpg', 'Gambas al ajillo', 'es', 'Google'],
  ['chicharron.jpg', 'Chicharrón con arepitas', 'cu', 'Google'], ['postre.jpg', 'Postres de la casa', 'qn', 'Instagram'],
  ['chaufa.jpg', 'Arroz chaufa', 'pe', 'Google'], ['alitas.jpg', 'Alitas fritas', 'qn', 'Google'],
  ['terraza.jpg', 'La terraza de las banderas', 'qn', 'Instagram']
];

/* ----------------------------------------------------------
   SCROLL SUAVE + NAVEGACIÓN
   ---------------------------------------------------------- */
let lenis = null;
if (motion && window.Lenis) {
  lenis = new Lenis({ lerp: 0.1 });
  lenis.on('scroll', ScrollTrigger.update);
  gsap.ticker.add((t) => lenis.raf(t * 1000));
  gsap.ticker.lagSmoothing(0);
}
const lock = (on) => { document.body.classList.toggle('is-locked', on); if (lenis) on ? lenis.stop() : lenis.start(); };

const nav = $('#nav'), burger = $('#burger'), links = $('#navLinks');
const onScroll = () => nav.classList.toggle('is-solid', scrollY > 40);
addEventListener('scroll', onScroll, { passive: true }); onScroll();
burger.addEventListener('click', () => {
  const open = burger.getAttribute('aria-expanded') !== 'true';
  burger.setAttribute('aria-expanded', open); links.classList.toggle('is-open', open);
});
$$('a[href^="#"]').forEach((a) => a.addEventListener('click', (e) => {
  const id = a.getAttribute('href'); const t = id.length > 1 ? $(id) : document.body;
  if (!t) return;
  e.preventDefault();
  burger.setAttribute('aria-expanded', 'false'); links.classList.remove('is-open');
  if (lenis) lenis.scrollTo(id === '#top' ? 0 : t, { offset: -60, duration: 1.4 });
  else t.scrollIntoView({ behavior: reduced ? 'auto' : 'smooth' });
}));
if (hasGSAP) {
  $$('.nav__links a').forEach((a) => {
    const sec = $(a.getAttribute('href'));
    if (sec) ScrollTrigger.create({ trigger: sec, start: 'top 50%', end: 'bottom 50%', onToggle: (s) => a.classList.toggle('is-active', s.isActive) });
  });
}

/* ----------------------------------------------------------
   ¿ABIERTO? (hora de Lloret de Mar)
   ---------------------------------------------------------- */
const DAYS = ['domingo', 'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado'];
const OPEN = { 0: [[780, 1380]], 1: [[780, 1380]], 2: [[780, 1380]], 3: [], 4: [[780, 1380]], 5: [[780, 1380]], 6: [[780, 1380]] };
const hhmm = (m) => `${String(Math.floor(m / 60)).padStart(2, '0')}:${String(m % 60).padStart(2, '0')}`;
const madridNow = () => {
  const p = Object.fromEntries(new Intl.DateTimeFormat('en-GB', { timeZone: 'Europe/Madrid', weekday: 'short', hour: '2-digit', minute: '2-digit', hourCycle: 'h23' }).formatToParts(new Date()).map((x) => [x.type, x.value]));
  return { d: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].indexOf(p.weekday), m: +p.hour * 60 + +p.minute };
};
const liveStatus = () => {
  const { d, m } = madridNow();
  const slot = OPEN[d].find(([a, b]) => m >= a && m < b);
  if (slot) return { open: true, txt: `Abierto · cierra a las ${hhmm(slot[1])}` };
  const later = OPEN[d].find(([a]) => a > m);
  if (later) return { open: false, txt: `Cerrado · abre hoy a las ${hhmm(later[0])}` };
  for (let i = 1; i <= 7; i++) {
    const nd = (d + i) % 7;
    if (OPEN[nd].length) return { open: false, txt: `Cerrado · abre ${i === 1 ? 'mañana' : 'el ' + DAYS[nd]} a las ${hhmm(OPEN[nd][0][0])}` };
  }
  return { open: false, txt: 'Cerrado' };
};
const paintLive = () => {
  const s = liveStatus();
  $$('[data-live]').forEach((el) => {
    el.classList.toggle('is-open', s.open); el.classList.toggle('is-closed', !s.open);
    $('[data-live-text]', el).textContent = s.txt;
  });
  const { d } = madridNow();
  $$('#hours li').forEach((li) => li.classList.toggle('is-today', +li.dataset.day === d));
};
paintLive(); setInterval(paintLive, 60000);

/* ----------------------------------------------------------
   INTRO · el pasaporte se abre y se sella la entrada
   ---------------------------------------------------------- */
const intro = $('#intro');
const heroIn = () => {
  if (!motion) return;
  gsap.from('.hero__title .line > span', { yPercent: 110, duration: 1.2, ease: 'expo.out', stagger: .09 });
  gsap.from('.hero .eyebrow, .board, .hero__cta', { y: 24, opacity: 0, duration: 1, ease: 'power3.out', stagger: .08, delay: .35 });
  gsap.from('.ticket', { y: 80, rotate: 10, opacity: 0, duration: 1.4, ease: 'expo.out', delay: .2 });
  gsap.from('.seal', { scale: 0, rotate: -90, duration: 1.2, ease: 'back.out(1.6)', delay: .7 });
};
if (!motion) { intro.remove(); }
else {
  lock(true);
  scrollTo(0, 0);
  let done = false;
  const finish = () => {
    if (done) return; done = true;
    gsap.to(intro, { yPercent: -100, duration: 1, ease: 'expo.inOut', onComplete: () => { intro.remove(); lock(false); ScrollTrigger.refresh(); } });
    heroIn();
  };
  const tl = gsap.timeline({ delay: .35, onComplete: finish });
  tl.from('.intro__book', { y: 40, opacity: 0, duration: .8, ease: 'power3.out' })
    .to('.intro__cover', { rotateY: -168, duration: 1.15, ease: 'power3.inOut' }, '+=.25')
    .to('.stamp--intro', { opacity: 1, scale: 1, duration: .28, ease: 'power4.in' }, '-=.15')
    .to('.intro__book', { x: 3, duration: .05, yoyo: true, repeat: 3 })
    .to({}, { duration: .3 });
  watchdog(tl, 6000);
  intro.addEventListener('click', () => { tl.kill(); finish(); });
  addEventListener('wheel', () => { if (!done && tl.progress() > .3) { tl.kill(); finish(); } }, { passive: true, once: true });
}

/* ----------------------------------------------------------
   PANEL DE DESTINOS (letras que giran, como en un aeropuerto)
   ---------------------------------------------------------- */
const flaps = $('#flaps');
const DEST = ['VENEZUELA', 'COLOMBIA', 'CUBA', 'PERÚ', 'MÉXICO', 'ARGENTINA', 'URUGUAY', 'BOLIVIA', 'ESPAÑA'];
const W = 9, ABC = 'ABCDEFGHIJKLMNÑOPQRSTUVWXYZÁÉÚ ';
for (let i = 0; i < W; i++) flaps.insertAdjacentHTML('beforeend', '<span class="flap"> </span>');
const cells = $$('.flap', flaps);
let di = 0;
const showDest = (word) => {
  flaps.setAttribute('aria-label', word);
  const w = word.padEnd(W, ' ');
  cells.forEach((cell, i) => {
    const target = w[i];
    if (reduced) { cell.textContent = target; return; }
    let n = 0; const steps = 3 + Math.floor(Math.random() * 6) + i;
    const tick = () => {
      cell.classList.remove('is-flip'); void cell.offsetWidth; cell.classList.add('is-flip');
      cell.textContent = n < steps ? ABC[Math.floor(Math.random() * ABC.length)] : target;
      if (n++ < steps) setTimeout(tick, 55);
    };
    setTimeout(tick, i * 30);
  });
};
showDest(DEST[0]);
setInterval(() => { if (!document.hidden) showDest(DEST[++di % DEST.length]); }, 3400);

/* ----------------------------------------------------------
   QUÉ NOTA · texto que se enciende, cifras y collage
   ---------------------------------------------------------- */
const words = $('[data-words]');
if (words) {
  words.innerHTML = words.textContent.trim().split(/\s+/).map((w) => `<span class="w">${w}</span>`).join(' ');
  if (motion) gsap.to($$('.w', words), { opacity: 1, stagger: .1, ease: 'none', scrollTrigger: { trigger: words, start: 'top 80%', end: 'bottom 45%', scrub: true } });
  else $$('.w', words).forEach((w) => (w.style.opacity = 1));
}
if (motion) {
  $$('[data-count]').forEach((el) => {
    const end = +el.dataset.count, o = { v: 0 };
    gsap.to(o, { v: end, duration: 1.6, ease: 'power2.out', scrollTrigger: { trigger: el, start: 'top 88%' }, onUpdate: () => (el.textContent = Math.round(o.v)) });
  });
  $$('[data-parallax]').forEach((el) => gsap.to(el, { yPercent: +el.dataset.parallax, ease: 'none', scrollTrigger: { trigger: el.parentElement, start: 'top bottom', end: 'bottom top', scrub: true } }));
}

/* ----------------------------------------------------------
   PASAPORTE DE SABORES · sellos y visados
   ---------------------------------------------------------- */
const flagsEl = $('#flags'), slotsEl = $('#slots'), visa = $('#visa');
const stamped = new Set();
COUNTRIES.forEach((k, i) => {
  flagsEl.insertAdjacentHTML('beforeend', `<button class="flag-btn" type="button" role="tab" aria-selected="false" data-i="${i}">${flagSVG(k.c)}<span>${k.name}</span></button>`);
  slotsEl.insertAdjacentHTML('beforeend', `<div class="slot" data-slot="${i}">${k.name}</div>`);
});
const renderVisa = (k) => {
  const photo = k.img
    ? `<figure class="visa__photo"><img src="assets/img/${k.img}" alt="${k.cap}"><figcaption>${k.cap}</figcaption></figure>`
    : `<figure class="visa__photo">${flagSVG(k.c, 'flag', 'rect')}<figcaption>Ven a probarlo</figcaption></figure>`;
  visa.innerHTML = `
    <div class="visa__top"><div><p class="visa__kicker">Visado de sabor · ${k.dishes.length} ${k.dishes.length > 1 ? 'platos' : 'plato'}</p><h3 class="visa__country">${k.name}</h3></div>${flagSVG(k.c, 'visa__flag')}</div>
    <div class="visa__body"><ul class="dishes">${k.dishes.map(([n, d, p]) => `<li><span class="n">${n}</span><span class="d">${d}</span><span class="p">${p} €</span></li>`).join('')}</ul>${photo}</div>
    <p class="visa__note">${k.note}</p>`;
};
visa.innerHTML = '<div class="visa__empty"><div><i class="ph ph-airplane-takeoff"></i><p>Toca una bandera<br>para empezar el viaje</p></div></div>';
const stampSlot = (i) => {
  const k = COUNTRIES[i], slot = $(`[data-slot="${i}"]`, slotsEl);
  if (stamped.has(i)) return;
  stamped.add(i);
  const r = (Math.random() * 24 - 12).toFixed(1);
  slot.innerHTML = `<div class="stamp" style="color:${k.ink};transform:rotate(${r}deg)"><span>Visado</span><b>${k.name}</b><span>Q'Nota · Lloret</span></div>`;
  if (motion) {
    gsap.from($('.stamp', slot), { scale: 2.4, opacity: 0, rotate: +r + 25, duration: .38, ease: 'power4.in' });
    gsap.fromTo('#book', { x: 0 }, { x: 4, duration: .05, yoyo: true, repeat: 3, delay: .36, clearProps: 'x' });
  }
  $('#stampCount').textContent = `${stamped.size} / ${COUNTRIES.length} sellos`;
  $$('.flag-btn')[i].classList.add('is-stamped');
  if (stamped.size === COUNTRIES.length) $('#bookDone').hidden = false;
};
const selectCountry = (i) => {
  $$('.flag-btn').forEach((b, j) => b.setAttribute('aria-selected', j === i));
  const k = COUNTRIES[i];
  if (motion) {
    gsap.timeline()
      .to(visa, { rotateY: -80, opacity: 0, duration: .28, ease: 'power2.in', onComplete: () => renderVisa(k) })
      .fromTo(visa, { rotateY: 80, opacity: 0 }, { rotateY: 0, opacity: 1, duration: .5, ease: 'power3.out' });
  } else renderVisa(k);
  stampSlot(i);
};
flagsEl.addEventListener('click', (e) => { const b = e.target.closest('.flag-btn'); if (b) selectCountry(+b.dataset.i); });
flagsEl.addEventListener('keydown', (e) => {
  if (!['ArrowRight', 'ArrowLeft'].includes(e.key)) return;
  const bs = $$('.flag-btn'), cur = bs.indexOf(document.activeElement);
  if (cur < 0) return;
  const nx = (cur + (e.key === 'ArrowRight' ? 1 : -1) + bs.length) % bs.length;
  bs[nx].focus(); selectCountry(nx);
});

/* ----------------------------------------------------------
   CARTA · pestañas y buscador
   ---------------------------------------------------------- */
const tabsEl = $('#menuTabs'), body = $('#menuBody'), search = $('#menuSearch');
let tab = 'all';
const count = (s) => s.items ? s.items.length : s.sides.length;
tabsEl.innerHTML = `<button class="tab" role="tab" data-t="all" aria-selected="true">Todo<small>40</small></button>` +
  MENU.map((s) => `<button class="tab" role="tab" data-t="${s.id}" aria-selected="false">${s.t}<small>${count(s)}</small></button>`).join('');
const hl = (txt, q) => {
  if (!q) return txt;
  const i = norm(txt).indexOf(q);
  return i < 0 ? txt : `${txt.slice(0, i)}<mark>${txt.slice(i, i + q.length)}</mark>${txt.slice(i + q.length)}`;
};
const renderMenu = () => {
  const q = norm(search.value.trim());
  let html = '';
  MENU.forEach((s) => {
    if (tab !== 'all' && tab !== s.id) return;
    const head = `<h3>${s.t}${s.note ? `<small>${s.note}</small>` : ''}</h3>`;
    if (s.sides) {
      const sides = s.sides.filter((x) => !q || norm(x).includes(q));
      if (sides.length) html += `<div class="menu__group">${head}<div class="sides">${sides.map((x) => `<span>${hl(x, q)}</span>`).join('')}</div></div>`;
      return;
    }
    const rows = s.items.filter(([, n]) => !q || norm(n).includes(q));
    if (!rows.length) return;
    html += `<div class="menu__group">${head}${rows.map(([n, name, p, f]) => `<div class="row"><span class="row__n">${n}</span><span class="row__name">${f ? flagSVG(f) : ''}<span>${hl(name, q)}</span></span><span class="row__dots"></span><span class="row__p">${p} €</span></div>`).join('')}</div>`;
  });
  body.innerHTML = html || `<p class="menu__empty">No encontramos «${search.value}». Prueba con «arepa» o «cachapa».</p>`;
  if (motion) gsap.from($$('.row, .sides span', body), { opacity: 0, y: 10, duration: .5, stagger: .012, ease: 'power2.out' });
};
tabsEl.addEventListener('click', (e) => {
  const b = e.target.closest('.tab'); if (!b) return;
  tab = b.dataset.t; $$('.tab', tabsEl).forEach((x) => x.setAttribute('aria-selected', x === b)); renderMenu();
});
search.addEventListener('input', () => {
  if (search.value && tab !== 'all') { tab = 'all'; $$('.tab', tabsEl).forEach((x) => x.setAttribute('aria-selected', x.dataset.t === 'all')); }
  renderMenu();
});
renderMenu();

/* ----------------------------------------------------------
   ROCKOLA · cada tema es un vídeo del Instagram
   ---------------------------------------------------------- */
const tracksEl = $('#tracks'), jv = $('#jbVideo'), vinyl = $('#vinyl'), bar = $('#jbProgress');
const playBtn = $('#jbPlay'), soundBtn = $('#jbSound');
let cur = -1, inView = false, userPaused = false;
const codeOf = (i) => (i < 6 ? 'A' + (i + 1) : 'B' + (i - 5));
TRACKS.forEach((t, i) => tracksEl.insertAdjacentHTML('beforeend', `<li><button class="track" type="button" data-i="${i}"><span class="track__code">${codeOf(i)}</span><span class="track__t">${t.t}<small>${t.s}</small></span><span class="track__d">${t.d}</span></button></li>`));
const setPlayIcon = () => {
  const playing = !jv.paused;
  playBtn.innerHTML = `<i class="ph ph-${playing ? 'pause' : 'play'}"></i>`;
  playBtn.setAttribute('aria-label', playing ? 'Pausar' : 'Reproducir');
  vinyl.classList.toggle('is-spin', playing);
};
const tryPlay = () => { const p = jv.play(); if (p && p.catch) p.catch(() => setPlayIcon()); };
const loadTrack = (i, autoplay = true) => {
  cur = (i + TRACKS.length) % TRACKS.length;
  const t = TRACKS[cur];
  $$('.track', tracksEl).forEach((b, j) => b.classList.toggle('is-on', j === cur));
  $('#vinylLabel').textContent = codeOf(cur);
  $('#jbNow').textContent = `${codeOf(cur)} · ${t.t}`;
  jv.classList.add('is-swap');
  setTimeout(() => {
    jv.poster = `assets/img/poster-${t.v}.jpg`;
    jv.src = `assets/video/${t.v}.mp4`;
    jv.load();
    jv.classList.remove('is-swap');
    if (autoplay && inView && !userPaused) tryPlay();
    setPlayIcon();
  }, motion ? 260 : 0);
  if (motion) gsap.fromTo(vinyl, { y: -14, rotate: -40 }, { y: 0, rotate: 0, duration: .6, ease: 'bounce.out' });
};
tracksEl.addEventListener('click', (e) => { const b = e.target.closest('.track'); if (b) { userPaused = false; loadTrack(+b.dataset.i); } });
$('#jbPrev').addEventListener('click', () => { userPaused = false; loadTrack(cur - 1); });
$('#jbNext').addEventListener('click', () => { userPaused = false; loadTrack(cur + 1); });
playBtn.addEventListener('click', () => { if (jv.paused) { userPaused = false; tryPlay(); } else { userPaused = true; jv.pause(); } });
soundBtn.addEventListener('click', () => {
  jv.muted = !jv.muted;
  soundBtn.setAttribute('aria-pressed', !jv.muted);
  soundBtn.setAttribute('aria-label', jv.muted ? 'Activar sonido' : 'Silenciar');
  soundBtn.innerHTML = `<i class="ph ph-speaker-${jv.muted ? 'slash' : 'high'}"></i>`;
  if (jv.paused) { userPaused = false; tryPlay(); }
});
jv.addEventListener('play', setPlayIcon); jv.addEventListener('pause', setPlayIcon);
jv.addEventListener('timeupdate', () => { if (jv.duration) bar.style.width = (jv.currentTime / jv.duration * 100) + '%'; });
jv.addEventListener('ended', () => loadTrack(cur + 1));
new IntersectionObserver(([en]) => {
  inView = en.isIntersecting;
  if (inView) { if (cur < 0) loadTrack(0); else if (!userPaused) tryPlay(); }
  else if (!jv.paused) jv.pause();
}, { threshold: .35 }).observe($('.jukebox'));

// el vídeo de la portada solo corre cuando se ve
const heroVideo = $('.hero__video');
new IntersectionObserver(([en]) => { en.isIntersecting ? heroVideo.play().catch(() => {}) : heroVideo.pause(); }, { threshold: .1 }).observe(heroVideo);

/* ----------------------------------------------------------
   POSTALES · carrusel arrastrable con inercia
   ---------------------------------------------------------- */
const strip = $('#strip'), track = $('#stripTrack');
const postmark = '<svg class="postcard__mark" viewBox="0 0 96 40" aria-hidden="true"><circle cx="20" cy="20" r="17" fill="none" stroke="#12100E" stroke-width="1.4"/><text x="20" y="23" text-anchor="middle" font-family="Space Mono, monospace" font-size="7" fill="#12100E">LLORET</text><path d="M40 10 q7 -5 14 0 t14 0 t14 0 t14 0 M40 20 q7 -5 14 0 t14 0 t14 0 t14 0 M40 30 q7 -5 14 0 t14 0 t14 0 t14 0" fill="none" stroke="#12100E" stroke-width="1.2"/></svg>';
PHOTOS.forEach(([src, cap, f, from], i) => {
  const r = ((i % 3) - 1) * 1.6 + (i % 2 ? .6 : -.4);
  track.insertAdjacentHTML('beforeend', `<article class="postcard" style="--r:${r}deg" data-src="${src}" data-cap="${cap}"><div class="postcard__img"><img src="assets/img/${src}" alt="${cap}" loading="lazy" draggable="false"></div><div class="postcard__stamp">${flagSVG(f, 'flag', 'rect')}</div>${postmark}<div class="postcard__cap"><b>${cap}</b><span>${from}</span></div></article>`);
});
let x = 0, minX = 0, dragging = false, startX = 0, startPos = 0, lastX = 0, lastT = 0, vel = 0, moved = 0, glideTw = null;
const bounds = () => { minX = Math.min(0, strip.clientWidth - track.scrollWidth); x = Math.max(minX, Math.min(0, x)); setX(x); };
const setX = (v) => { track.style.transform = `translate3d(${v}px,0,0)`; };
const glide = (to) => {
  to = Math.max(minX, Math.min(0, to));
  glideTw?.kill();
  if (motion) { const o = { v: x }; glideTw = gsap.to(o, { v: to, duration: 1.1, ease: 'power3.out', onUpdate: () => { x = o.v; setX(x); } }); }
  else { x = to; setX(x); }
};
strip.addEventListener('pointerdown', (e) => {
  dragging = true; moved = 0; startX = lastX = e.clientX; startPos = x; lastT = performance.now(); vel = 0;
  glideTw?.kill();
  strip.classList.add('is-drag');
});
addEventListener('pointermove', (e) => {
  if (!dragging) return;
  const dx = e.clientX - startX; moved = Math.max(moved, Math.abs(dx));
  if (moved > 4 && !strip.hasPointerCapture?.(e.pointerId)) { try { strip.setPointerCapture(e.pointerId); } catch (_) {} }
  const now = performance.now(); vel = (e.clientX - lastX) / Math.max(1, now - lastT); lastX = e.clientX; lastT = now;
  let nx = startPos + dx;
  if (nx > 0) nx *= .35; if (nx < minX) nx = minX + (nx - minX) * .35;
  x = nx; setX(x);
});
const endDrag = () => { if (!dragging) return; dragging = false; strip.classList.remove('is-drag'); glide(x + vel * 380); };
addEventListener('pointerup', endDrag); addEventListener('pointercancel', endDrag);
strip.addEventListener('click', (e) => {
  if (moved > 6) { e.preventDefault(); return; }
  const card = e.target.closest('.postcard'); if (card) openLB(`assets/img/${card.dataset.src}`, card.dataset.cap);
});
const step = () => Math.min(strip.clientWidth * .8, 700);
$('#cardsNext').addEventListener('click', () => glide(x - step()));
$('#cardsPrev').addEventListener('click', () => glide(x + step()));
strip.addEventListener('keydown', (e) => { if (e.key === 'ArrowRight') glide(x - 320); if (e.key === 'ArrowLeft') glide(x + 320); });
addEventListener('resize', bounds); addEventListener('load', bounds); bounds();

/* ----------------------------------------------------------
   RESEÑAS
   ---------------------------------------------------------- */
const quotes = $$('.quote'), dots = $('#quoteDots');
let qi = 0, qTimer;
quotes.forEach((_, i) => dots.insertAdjacentHTML('beforeend', `<button type="button" aria-label="Reseña ${i + 1}" class="${i ? '' : 'is-on'}"></button>`));
const showQuote = (i) => {
  qi = (i + quotes.length) % quotes.length;
  quotes.forEach((q, j) => q.classList.toggle('is-on', j === qi));
  $$('button', dots).forEach((b, j) => b.classList.toggle('is-on', j === qi));
};
const runQuotes = () => { clearInterval(qTimer); qTimer = setInterval(() => !document.hidden && showQuote(qi + 1), 6000); };
dots.addEventListener('click', (e) => { const b = e.target.closest('button'); if (b) { showQuote($$('button', dots).indexOf(b)); runQuotes(); } });
runQuotes();

/* ----------------------------------------------------------
   VISOR DE FOTOS
   ---------------------------------------------------------- */
const lb = $('#lb');
function openLB(src, cap) {
  $('img', lb).src = src; $('img', lb).alt = cap; $('figcaption', lb).textContent = cap;
  lb.hidden = false; lock(true);
  if (motion) gsap.from('.lb__fig', { scale: .94, opacity: 0, duration: .5, ease: 'power3.out' });
  $('.lb__close', lb).focus();
}
const closeLB = () => { lb.hidden = true; lock(false); };
lb.addEventListener('click', (e) => { if (e.target === lb || e.target.closest('.lb__close')) closeLB(); });
addEventListener('keydown', (e) => { if (e.key === 'Escape' && !lb.hidden) closeLB(); });
$$('.collage img').forEach((im) => { im.style.cursor = 'zoom-in'; im.addEventListener('click', () => openLB(im.src, im.alt)); });

/* ----------------------------------------------------------
   APARICIONES SUAVES
   ---------------------------------------------------------- */
if (motion) {
  ScrollTrigger.batch('.about .h2, .about .eyebrow, .facts li, .passport__head > *, .flag-btn, .book, .menu__head > *, .tabs, .rockola__head > *, .track, .jukebox, .cards__head > *, .reviews__score, .visit__info > *, .visit__map', {
    start: 'top 88%', once: true,
    onEnter: (els) => gsap.from(els, { y: 46, opacity: 0, duration: 1.1, ease: 'expo.out', stagger: .06, overwrite: true })
  });
  gsap.from('.postcard', { y: 90, rotate: 8, opacity: 0, duration: 1.2, ease: 'expo.out', stagger: .07, scrollTrigger: { trigger: '#strip', start: 'top 85%' } });
  gsap.from('.foot__big', { yPercent: 40, opacity: 0, duration: 1.4, ease: 'expo.out', scrollTrigger: { trigger: '.foot', start: 'top 85%' } });
  addEventListener('load', () => ScrollTrigger.refresh());
}
})();
