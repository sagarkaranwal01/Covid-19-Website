// Mobile nav toggle
document.addEventListener('DOMContentLoaded', () => {
  const toggle = document.querySelector('.nav-toggle');
  const links = document.querySelector('.nav-links');
  if (toggle && links) {
    toggle.addEventListener('click', () => links.classList.toggle('open'));
  }

  // Highlight active nav link
  const path = window.location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.nav-links a[data-page]').forEach(a => {
    if (a.dataset.page === path) a.classList.add('active');
  });

  // Session-aware login/logout button
  const authSlot = document.querySelector('[data-auth-slot]');
  if (authSlot) {
    fetch('/api/session')
      .then(r => r.json())
      .then(data => {
        if (data.loggedIn) {
          authSlot.innerHTML = `
            <span style="font-size:0.85rem;color:var(--ink-soft);margin-right:8px;">Hi, ${escapeHtml(data.full_name.split(' ')[0])}</span>
            <a href="#" class="nav-cta" id="logoutBtn">Log out</a>`;
          document.getElementById('logoutBtn').addEventListener('click', async (e) => {
            e.preventDefault();
            await fetch('/api/logout', { method: 'POST' });
            window.location.href = 'index.html';
          });
        } else {
          authSlot.innerHTML = `<a href="login.html" class="nav-cta" data-page="login.html">Log in</a>`;
        }
      })
      .catch(() => {
        authSlot.innerHTML = `<a href="login.html" class="nav-cta" data-page="login.html">Log in</a>`;
      });
  }
});

function escapeHtml(str) {
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}

// Reusable pulse-line SVG (ECG waveform), used as the signature divider
function pulseSVG() {
  return `<svg viewBox="0 0 1200 46" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M0,23 L220,23 L250,23 L268,4 L286,42 L304,10 L320,23 L360,23 L900,23 L920,23 L938,4 L956,42 L974,10 L990,23 L1200,23" />
  </svg>`;
}
document.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('.pulse-divider[data-auto]').forEach(el => {
    el.innerHTML = pulseSVG();
  });
});
