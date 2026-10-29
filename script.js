// Kilele Primary School — interactions
document.documentElement.classList.add('js');
const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

// Photos: if one fails to load, remove it so the illustrated fallback shows
document.querySelectorAll('img.photo').forEach(img => {
  const drop = () => img.remove();
  if (img.complete && img.naturalWidth === 0) drop();
  else img.addEventListener('error', drop);
});

// Announcement bar
document.getElementById('noticeClose').addEventListener('click', () => {
  document.getElementById('notice').hidden = true;
});

// Sticky header + back-to-top
const header = document.getElementById('header');
const menu = document.getElementById('menu');
const toTop = document.getElementById('toTop');
function onScroll() {
  header.classList.toggle('scrolled', window.scrollY > 20);
  header.classList.toggle('over', window.scrollY <= 20 && !menu.classList.contains('open'));
  toTop.classList.toggle('show', window.scrollY > 900);
}
window.addEventListener('scroll', onScroll, { passive: true });
onScroll();
toTop.addEventListener('click', () => window.scrollTo({ top: 0, behavior: reduce ? 'auto' : 'smooth' }));

// Mobile menu
const burger = document.getElementById('burger');
burger.addEventListener('click', () => {
  const open = menu.classList.toggle('open');
  burger.setAttribute('aria-expanded', open);
  burger.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
  onScroll();
});
menu.querySelectorAll('a').forEach(a => a.addEventListener('click', () => {
  menu.classList.remove('open');
  burger.setAttribute('aria-expanded', false);
}));

// Highlight the menu link for the section in view
const links = [...menu.querySelectorAll('a:not(.btn)')];
const sections = links.map(a => document.querySelector(a.getAttribute('href'))).filter(Boolean);

// Scroll reveal (content is always visible; below-the-fold items glide up)
const reveals = [...document.querySelectorAll('.rv')];
reveals.forEach(el => {
  if (el.getBoundingClientRect().top > window.innerHeight * 0.92) el.classList.add('low');
});

function countUp(el) {
  const end = +el.dataset.count;
  if (reduce) return;
  const t0 = performance.now(), dur = 1500;
  const tick = t => {
    const p = Math.min(1, (t - t0) / dur);
    el.textContent = Math.round(end * (1 - Math.pow(1 - p, 3)));
    if (p < 1) requestAnimationFrame(tick);
  };
  requestAnimationFrame(tick);
}

// Chart bars: shown at full width by default, animated in when scrolled to
const fills = [...document.querySelectorAll('.fill')];
fills.forEach(f => { f.style.width = f.dataset.w + '%'; });

// Signature
const sig = document.querySelector('.sign .draw');

if ('IntersectionObserver' in window) {
  const io = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (!e.isIntersecting) return;
      const el = e.target;
      const sibs = [...el.parentElement.children].filter(c => c.classList.contains('rv'));
      el.style.transitionDelay = (Math.max(0, sibs.indexOf(el)) * 0.08) + 's';
      el.classList.remove('low');
      io.unobserve(el);
    });
  }, { threshold: 0.12 });
  reveals.forEach(el => io.observe(el));

  const cio = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (!e.isIntersecting) return;
      countUp(e.target);
      cio.unobserve(e.target);
    });
  }, { threshold: 0.6 });
  document.querySelectorAll('[data-count]').forEach(el => cio.observe(el));

  const chart = document.getElementById('chart');
  if (!reduce && chart.getBoundingClientRect().top > window.innerHeight) {
    fills.forEach(f => { f.style.width = '0%'; });
    new IntersectionObserver((es, o) => {
      if (!es[0].isIntersecting) return;
      fills.forEach((f, i) => setTimeout(() => { f.style.width = f.dataset.w + '%'; }, i * 110));
      o.disconnect();
    }, { threshold: 0.35 }).observe(chart);
  }

  if (sig.getBoundingClientRect().top > window.innerHeight && !reduce) {
    new IntersectionObserver((es, o) => {
      if (!es[0].isIntersecting) return;
      sig.classList.add('go');
      requestAnimationFrame(() => sig.classList.remove('wait'));
      o.disconnect();
    }, { threshold: 0.8 }).observe(sig);
  } else {
    sig.classList.remove('wait');
  }

  const sio = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (!e.isIntersecting) return;
      links.forEach(a => a.classList.toggle('active', a.getAttribute('href') === '#' + e.target.id));
    });
  }, { rootMargin: '-45% 0px -50% 0px' });
  sections.forEach(s => sio.observe(s));
} else {
  reveals.forEach(el => el.classList.remove('low'));
  sig.classList.remove('wait');
}

// Curriculum tabs
const tabs = [...document.querySelectorAll('.tab')];
function selectTab(tab) {
  tabs.forEach(t => {
    const on = t === tab;
    t.setAttribute('aria-selected', on);
    t.tabIndex = on ? 0 : -1;
    document.getElementById(t.getAttribute('aria-controls')).classList.toggle('on', on);
  });
}
tabs.forEach((t, i) => {
  t.addEventListener('click', () => selectTab(t));
  t.addEventListener('keydown', e => {
    if (e.key !== 'ArrowRight' && e.key !== 'ArrowLeft') return;
    const next = tabs[(i + (e.key === 'ArrowRight' ? 1 : tabs.length - 1)) % tabs.length];
    selectTab(next);
    next.focus();
  });
});

// Testimonial carousel
const track = document.getElementById('track');
const step = () => track.querySelector('.quote').getBoundingClientRect().width + 24;
document.getElementById('next').addEventListener('click', () => {
  const atEnd = track.scrollLeft + track.clientWidth >= track.scrollWidth - 10;
  track.scrollTo({ left: atEnd ? 0 : track.scrollLeft + step() });
});
document.getElementById('prev').addEventListener('click', () => {
  track.scrollTo({ left: Math.max(0, track.scrollLeft - step()) });
});

// FAQ accordion (one open at a time)
const qs = [...document.querySelectorAll('.acc-q')];
qs.forEach(q => q.addEventListener('click', () => {
  const open = q.getAttribute('aria-expanded') === 'true';
  qs.forEach(o => o.setAttribute('aria-expanded', 'false'));
  q.setAttribute('aria-expanded', String(!open));
}));

// Visit form (front-end demo only)
document.getElementById('form').addEventListener('submit', e => {
  e.preventDefault();
  const name = document.getElementById('f-name');
  const phone = document.getElementById('f-phone');
  const msg = document.getElementById('formMsg');
  [name, phone].forEach(f => f.parentElement.classList.toggle('err', !f.value.trim()));
  if (!name.value.trim() || !phone.value.trim()) {
    msg.textContent = 'Please add your name and phone number so we can call you back.';
    msg.className = 'msg bad';
    msg.hidden = false;
    (name.value.trim() ? phone : name).focus();
    return;
  }
  msg.textContent = 'Asante, ' + name.value.trim().split(' ')[0] + '. On the live site, the admissions office would now call you to arrange a visit.';
  msg.className = 'msg';
  msg.hidden = false;
  e.target.reset();
});

// Full-screen hero slider
const slider = document.getElementById('slider');
const slides = [...slider.querySelectorAll('.slide')];
const dots = [...document.querySelectorAll('#dots button')];
const DUR = 6500;
let cur = 0, timer = null, paused = reduce;
slider.style.setProperty('--dur', DUR + 'ms');
function go(i) {
  cur = (i + slides.length) % slides.length;
  slides.forEach((s, k) => { s.classList.toggle('on', k === cur); s.setAttribute('aria-hidden', k !== cur); });
  dots.forEach((d, k) => {
    d.setAttribute('aria-selected', k === cur);
    const bar = d.querySelector('i');           // restart the progress bar
    bar.style.display = 'none'; void bar.offsetWidth; bar.style.display = '';
  });
  schedule();
}
function schedule() {
  clearTimeout(timer);
  if (!paused) timer = setTimeout(() => go(cur + 1), DUR);
}
dots.forEach((d, k) => d.addEventListener('click', () => go(k)));
document.getElementById('sNext').addEventListener('click', () => go(cur + 1));
document.getElementById('sPrev').addEventListener('click', () => go(cur - 1));
const pauseBtn = document.getElementById('sPause');
function setPaused(p) {
  paused = p;
  slider.classList.toggle('paused', p);
  pauseBtn.setAttribute('aria-label', p ? 'Play slideshow' : 'Pause slideshow');
  schedule();
}
pauseBtn.addEventListener('click', () => setPaused(!paused));
// swipe on phones
let x0 = null;
slider.addEventListener('touchstart', e => { x0 = e.touches[0].clientX; }, { passive: true });
slider.addEventListener('touchend', e => {
  if (x0 === null) return;
  const dx = e.changedTouches[0].clientX - x0;
  if (Math.abs(dx) > 50) go(cur + (dx < 0 ? 1 : -1));
  x0 = null;
});
document.addEventListener('visibilitychange', () => { if (document.hidden) clearTimeout(timer); else schedule(); });
setPaused(paused);
go(0);
