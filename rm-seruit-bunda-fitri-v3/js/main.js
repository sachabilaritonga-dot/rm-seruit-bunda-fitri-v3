const $ = s => document.querySelector(s);
const rp = v => 'Rp ' + v + '.000';
const pairs = s => s.split(';').map(x => x.split('|'));
const waLink = t => `https://wa.me/${WA}?text=${encodeURIComponent(t)}`;

// Menu andalan & paket (kartu muncul berurutan saat di-scroll)
$('#fav').innerHTML = FAV.map(([img, e, n, p, d], i) => `
  <article class="rv" style="--d:${(i % 3) * 90}ms"><div class="imgw" data-e="${e}"><img src="assets/img/${img}" alt="${n}" loading="lazy" onerror="this.remove()"></div>
  <div class="row"><h3>${n}</h3><span class="pr">${p}</span></div><p>${d}</p></article>`).join('');

$('#pkt').innerHTML = PAKET.map(([n, p, t, items], i) => `
  <article class="pk rv${i === 2 ? ' hot' : ''}" style="--d:${i * 90}ms">${t ? `<span class="tag">${t}</span>` : ''}
  <h3>${n}</h3><div class="big">${p}</div>
  <ul>${pairs(items).map(([a, b]) => `<li><span>${a}</span><span>×${b}</span></li>`).join('')}</ul>
  <a class="btn sm" target="_blank" rel="noopener" href="${waLink('Halo Bunda Fitri, saya mau pesan ' + n)}">Pesan paket</a></article>`).join('');

// Daftar menu (tab)
const tabs = $('#tabs'), panel = $('#panel'), note = $('#note');
function show(k, b) {
  tabs.querySelectorAll('.tab').forEach(t => t.classList.toggle('on', t === b));
  panel.innerHTML = MENU[k].map(([t, s], i) => `<div class="grp" style="--i:${i}"><h3>${t}</h3><ul>${
    pairs(s).map(([n, p]) => `<li>${n}<i></i><b>${rp(p)}</b></li>`).join('')}</ul></div>`).join('');
  note.hidden = !['Ikan', 'Nasi & Sop'].includes(k);
  // di HP, tab yang dipilih digeser ke tengah dengan halus
  if (tabs.scrollWidth > tabs.clientWidth) tabs.scrollTo({ left: b.offsetLeft - (tabs.clientWidth - b.offsetWidth) / 2, behavior: 'smooth' });
}
Object.keys(MENU).forEach((k, i) => {
  const b = document.createElement('button');
  b.className = 'tab'; b.textContent = k; b.onclick = () => show(k, b);
  tabs.append(b); if (!i) show(k, b);
});
tabs.scrollLeft = 0;

// Navbar
const nav = $('#nav'), links = $('#links'), burger = $('#burger');
const onScroll = () => nav.classList.toggle('on', scrollY > 40);
addEventListener('scroll', onScroll, { passive: true }); onScroll();
const setMenu = open => { links.classList.toggle('open', open); burger.setAttribute('aria-expanded', open); burger.setAttribute('aria-label', open ? 'Tutup menu' : 'Buka menu'); };
burger.onclick = () => setMenu(!links.classList.contains('open'));
links.onclick = e => { if (e.target.closest('a')) setMenu(false); };
document.addEventListener('click', e => { if (!nav.contains(e.target)) setMenu(false); });
addEventListener('keydown', e => { if (e.key === 'Escape') setMenu(false); });
addEventListener('resize', () => { if (innerWidth > 860) setMenu(false); });

// Link aktif sesuai bagian yang sedang dilihat
const spy = new IntersectionObserver(es => es.forEach(e => {
  if (e.isIntersecting) links.querySelectorAll('a').forEach(a => a.classList.toggle('act', a.getAttribute('href') === '#' + e.target.id));
}), { rootMargin: '-45% 0px -50% 0px' });
document.querySelectorAll('main section[id]').forEach(s => spy.observe(s));

// Muncul halus saat di-scroll; setelah selesai, kelas animasi dilepas agar efek hover tidak ikut tertunda
const io = new IntersectionObserver(es => es.forEach(e => {
  if (!e.isIntersecting) return;
  const el = e.target, d = parseInt(el.style.getPropertyValue('--d')) || 0;
  el.classList.add('in'); io.unobserve(el);
  setTimeout(() => { el.classList.remove('rv', 'in'); el.style.removeProperty('--d'); }, 1100 + d);
}), { threshold: .12, rootMargin: '0px 0px -6% 0px' });
document.querySelectorAll('.rv').forEach(el => io.observe(el));

// Form pesan -> WhatsApp
$('#wa').onsubmit = e => {
  e.preventDefault();
  window.open(waLink(`Halo Bunda Fitri, saya ${$('#nm').value.trim()}.\nSaya mau pesan:\n${$('#od').value.trim()}`), '_blank');
};
$('#fab').href = waLink('Halo Bunda Fitri, saya mau tanya menu.');
$('#yr').textContent = new Date().getFullYear();

// Banner slider (otomatis ganti, bisa diklik atau digeser)
const slides = $('#slides'), dots = $('#dots'), hero = $('#home');
slides.innerHTML = BANNER.map(([img, e, th, t, d, c, h], i) => `
  <div class="slide ${th}" aria-label="${i + 1} dari ${BANNER.length}">
    <img class="bg" src="assets/img/${img}" alt="" onload="this.parentNode.classList.add('has-img')" onerror="this.remove()">
    <div class="wrap sl-in"><div class="sl-txt">${i ? `<h2>${t}</h2>` : `<h1>${t}</h1>`}<p>${d}</p><a class="btn" href="${h}">${c}</a></div>
    <div class="sl-art" aria-hidden="true">${e}</div></div></div>`).join('');
dots.innerHTML = BANNER.map((_, i) => `<button aria-label="Banner ${i + 1}"></button>`).join('');
const sl = [...slides.children], dt = [...dots.children];
let cur = 0, timer;
const go = n => { cur = (n + sl.length) % sl.length; sl.forEach((s, i) => s.classList.toggle('on', i === cur)); dt.forEach((d, i) => d.classList.toggle('on', i === cur)); };
const stop = () => clearInterval(timer);
const play = () => { stop(); if (!matchMedia('(prefers-reduced-motion: reduce)').matches && !document.hidden) timer = setInterval(() => go(cur + 1), 6000); };
dt.forEach((d, i) => d.onclick = () => { go(i); play(); });
$('#prev').onclick = () => { go(cur - 1); play(); };
$('#next').onclick = () => { go(cur + 1); play(); };
hero.onmouseenter = stop; hero.onmouseleave = play;
document.addEventListener('visibilitychange', play);
// geser di HP (diabaikan jika gerakannya lebih ke arah scroll vertikal)
let x0 = null, y0 = 0;
hero.addEventListener('touchstart', e => { x0 = e.touches[0].clientX; y0 = e.touches[0].clientY; }, { passive: true });
hero.addEventListener('touchend', e => {
  if (x0 === null) return;
  const dx = e.changedTouches[0].clientX - x0, dy = e.changedTouches[0].clientY - y0;
  if (Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(dy)) { go(cur + (dx < 0 ? 1 : -1)); play(); }
  x0 = null;
});
go(0); play();
