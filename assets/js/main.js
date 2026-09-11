const MAKE_WEBHOOK_URL = 'https://hook.us1.make.com/w7i4j382d7eg2rnvi4brdfghxqdkvhso';

document.addEventListener('DOMContentLoaded', () => {
  setUpGateReveal();
  setUpProofAutoScroll();
  setUpMandateCards();
  hydrateHeroFigures();
  wireWaitlistForm();
});

function setUpMandateCards() {
  document.querySelectorAll('.mandate-card').forEach((card) => {
    card.addEventListener('click', () => {
      card.classList.toggle('flipped');
    });
  });
}

function setUpProofAutoScroll() {
  const el = document.querySelector('[data-proof-scroll]');
  const track = el && el.querySelector('.scroll-track');
  if (!el || !track) return;
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  let paused = false;

  el.addEventListener('mouseenter', () => (paused = true));
  el.addEventListener('mouseleave', () => (paused = false));
  el.addEventListener('touchstart', () => (paused = true), { passive: true });
  el.addEventListener('touchend', () => (paused = false));
  el.addEventListener('focusin', () => (paused = true));
  el.addEventListener('focusout', () => (paused = false));

  function step() {
    const loopPoint = track.offsetHeight; // height of one copy of the list
    if (!paused && loopPoint > 0) {
      el.scrollTop += 0.2;
      if (el.scrollTop >= loopPoint) el.scrollTop -= loopPoint;
    }
    requestAnimationFrame(step);
  }
  requestAnimationFrame(step);
}

function setUpGateReveal() {
  const groups = document.querySelectorAll('.gate');
  if (!groups.length) return;

  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (prefersReduced) {
    groups.forEach((g) => g.classList.add('revealed'));
    return;
  }

  const observer = new IntersectionObserver(
    (entries, obs) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('revealed');
          obs.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.3 }
  );

  groups.forEach((g) => observer.observe(g));
}

async function hydrateHeroFigures() {
  const occupiedEl = document.querySelector('[data-seats-occupied]');
  const reviewEl = document.querySelector('[data-next-review]');
  const standingEl = document.querySelector('[data-standing]');
  if (!occupiedEl && !standingEl) return;

  const status = await fetchPracticeStatus();
  if (!status) return;

  const occupied = status.seats_occupied;
  const total = status.seats_total;

  if (occupiedEl) occupiedEl.textContent = String(occupied).padStart(2, '0') + ' / ' + String(total).padStart(2, '0');
  if (reviewEl) reviewEl.textContent = status.next_review || '—';
  if (standingEl) standingEl.textContent = occupied >= total ? 'Not Accepting Projects' : 'Accepting Projects';
}

function wireWaitlistForm() {
  const form = document.querySelector('#waitlist-form');
  if (!form) return;

  const statusEl = form.querySelector('.form-status');
  const submitBtn = form.querySelector('button[type="submit"]');

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    if (!form.reportValidity()) return;

    const payload = Object.fromEntries(new FormData(form).entries());

    submitBtn.disabled = true;
    if (statusEl) {
      statusEl.textContent = 'Sending...';
      statusEl.className = 'form-status';
    }

    try {
      const res = await fetch(MAKE_WEBHOOK_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error('Request failed');

      form.reset();
      if (statusEl) {
        statusEl.textContent = 'Received. Entries are reviewed in the order received — a principal will reply within one business day.';
        statusEl.className = 'form-status success';
      }
    } catch (err) {
      console.error(err);
      if (statusEl) {
        statusEl.textContent = 'Something went wrong sending this. Please email info@catansg.com directly.';
        statusEl.className = 'form-status error';
      }
    } finally {
      submitBtn.disabled = false;
    }
  });
}

