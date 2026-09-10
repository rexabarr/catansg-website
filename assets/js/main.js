// TODO: replace with the real Make.com webhook URL once the scenario is created (plan step 8).
const MAKE_WEBHOOK_URL = 'https://hook.us1.make.com/REPLACE_ME';

document.addEventListener('DOMContentLoaded', () => {
  setUpGateReveal();
  hydrateHeroFigures();
  hydrateThoughtsPreview();
  wireWaitlistForm();
});

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
  const totalEl = document.querySelector('[data-seats-total]');
  const listEl = document.querySelector('[data-list-count]');
  const reviewEl = document.querySelector('[data-next-review]');
  const standingEl = document.querySelector('[data-standing]');
  if (!occupiedEl && !standingEl) return;

  const status = await fetchPracticeStatus();
  if (!status) return;

  const occupied = status.seats_occupied;
  const total = status.seats_total;

  if (occupiedEl) occupiedEl.textContent = String(occupied).padStart(2, '0') + ' / ' + String(total).padStart(2, '0');
  if (totalEl) totalEl.textContent = String(total).padStart(2, '0');
  if (listEl) listEl.textContent = String(status.list_count).padStart(2, '0');
  if (reviewEl) reviewEl.textContent = status.next_review || '—';
  if (standingEl) standingEl.textContent = occupied >= total ? 'Not accepting' : 'Accepting';
}

async function hydrateThoughtsPreview() {
  const container = document.querySelector('[data-thoughts-preview]');
  if (!container) return;

  const posts = await fetchPublishedPosts(3);
  if (!posts.length) {
    container.innerHTML = '<li class="microlabel">More soon.</li>';
    return;
  }

  container.innerHTML = posts
    .map(
      (post) => `
        <li>
          <a class="title" href="/owners-thoughts/${post.slug}/">${escapeHtml(post.title)}</a>
          <div class="thoughts-meta microlabel">
            <span>${escapeHtml(post.tag || '')}</span>
            <span>${post.published_at ? formatDate(post.published_at) : ''}</span>
          </div>
        </li>`
    )
    .join('');
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

function escapeHtml(str) {
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}

function formatDate(iso) {
  const d = new Date(iso);
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}
