document.documentElement.classList.add('js');
const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;

// photos: drop any that fail to load so the illustration underneath shows
document.querySelectorAll('img.ph').forEach(img => {
  const drop = () => img.remove();
  if (img.complete && img.naturalWidth === 0) drop(); else img.addEventListener('error', drop);
});

// nav
const nav = document.querySelector('header.nav');
addEventListener('scroll', () => nav.classList.toggle('scrolled', scrollY > 10), {passive:true});
const menuBtn = document.getElementById('menuBtn'), links = document.getElementById('links');
menuBtn.addEventListener('click', () => {
  const open = links.classList.toggle('open');
  menuBtn.setAttribute('aria-expanded', open);
});
links.querySelectorAll('a').forEach(a => a.addEventListener('click', () => { links.classList.remove('open'); menuBtn.setAttribute('aria-expanded', false); }));

// reveal: only items below the fold get offset, content never hidden
const reveals = [...document.querySelectorAll('.reveal')];
const vh = innerHeight;
reveals.forEach((el, i) => {
  if (el.getBoundingClientRect().top > vh * 0.95) el.classList.add('below');
});
if ('IntersectionObserver' in window) {
  const io = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (!e.isIntersecting) return;
      const sibs = [...e.target.parentElement.children].filter(c => c.classList.contains('reveal'));
      e.target.style.transitionDelay = (sibs.indexOf(e.target) * 0.08) + 's';
      e.target.classList.remove('below');
      io.unobserve(e.target);
    });
  }, {threshold: .12});
  reveals.forEach(el => io.observe(el));

  // counters
  const cio = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (!e.isIntersecting) return;
      const el = e.target, end = +el.dataset.count, suf = el.dataset.suffix || '';
      cio.unobserve(el);
      if (reduce) return;
      const t0 = performance.now(), dur = 1600;
      const tick = t => {
        const p = Math.min(1, (t - t0) / dur), v = Math.round(end * (1 - Math.pow(1 - p, 3)));
        el.textContent = v + suf;
        if (p < 1) requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
    });
  }, {threshold: .6});
  document.querySelectorAll('[data-count]').forEach(el => cio.observe(el));

  const tl = document.getElementById('timeline');
  new IntersectionObserver((es, o) => { if (es[0].isIntersecting) { tl.classList.add('go'); o.disconnect(); } }, {threshold:.3}).observe(tl);
} else {
  reveals.forEach(el => el.classList.remove('below'));
}

// testimonials
const slides = [...document.querySelectorAll('.slide')], dots = document.getElementById('dots');
let cur = 0, timer;
slides.forEach((_, i) => {
  const b = document.createElement('button');
  b.setAttribute('aria-label', 'Testimonial ' + (i + 1));
  b.addEventListener('click', () => { show(i); restart(); });
  dots.appendChild(b);
});
function show(i){
  cur = i;
  slides.forEach((s, j) => s.classList.toggle('on', j === i));
  [...dots.children].forEach((d, j) => d.classList.toggle('on', j === i));
}
function restart(){ clearInterval(timer); if (!reduce) timer = setInterval(() => show((cur + 1) % slides.length), 6000); }
show(0); restart();

// rotating hero word
const rot = document.getElementById('rot');
const words = ['grow tall', 'read early', 'think big', 'shine bright'];
let wi = 0;
if (!reduce) setInterval(() => {
  rot.classList.add('out');
  setTimeout(() => { wi = (wi + 1) % words.length; rot.textContent = words[wi]; rot.classList.remove('out'); }, 450);
}, 3200);

// event countdowns
const cds = [...document.querySelectorAll('.countdown')];
function renderCountdowns(){
  const now = Date.now();
  cds.forEach(el => {
    let s = Math.max(0, Math.floor((new Date(el.dataset.date) - now) / 1000));
    const d = Math.floor(s / 86400); s %= 86400;
    const h = Math.floor(s / 3600); s %= 3600;
    const m = Math.floor(s / 60);
    el.innerHTML = [[d,'days'],[h,'hrs'],[m,'min']].map(([v,l]) => `<div><b>${String(v).padStart(2,'0')}</b><small>${l}</small></div>`).join('');
  });
}
renderCountdowns(); setInterval(renderCountdowns, 30000);

// form
document.getElementById('form').addEventListener('submit', e => {
  e.preventDefault();
  const name = document.getElementById('pname'), phone = document.getElementById('phone');
  const ok = document.getElementById('ok'), txt = document.getElementById('okText');
  if (!name.value.trim() || !phone.value.trim()) {
    (name.value.trim() ? phone : name).focus();
    txt.textContent = 'Please add your name and phone number so we can confirm your tour.';
    ok.classList.add('show'); return;
  }
  txt.textContent = 'Asante, ' + name.value.trim().split(' ')[0] + '! In a live site, the school office would now call you to confirm a tour date.';
  ok.classList.add('show');
  e.target.querySelectorAll('input,textarea').forEach(i => i.value = '');
});
