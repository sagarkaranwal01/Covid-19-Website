const loginForm = document.getElementById('loginForm');
const formMsg = document.getElementById('formMsg');
const submitBtn = document.getElementById('submitBtn');

function showMsg(text, type) {
  formMsg.textContent = text;
  formMsg.className = `form-msg show ${type}`;
}

loginForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  formMsg.className = 'form-msg';

  const email = document.getElementById('email').value.trim();
  const password = document.getElementById('password').value;

  if (!email || !password) {
    showMsg('Please enter your email and password.', 'error');
    return;
  }

  submitBtn.disabled = true;
  submitBtn.textContent = 'Logging in...';

  try {
    const res = await fetch('/api/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    const data = await res.json();

    if (!res.ok) {
      showMsg(data.error || 'Invalid email or password.', 'error');
      submitBtn.disabled = false;
      submitBtn.textContent = 'Log in';
      return;
    }

    showMsg('Logged in. Redirecting you home...', 'success');
    setTimeout(() => { window.location.href = 'index.html'; }, 1000);
  } catch (err) {
    showMsg('Could not reach the server. Please try again.', 'error');
    submitBtn.disabled = false;
    submitBtn.textContent = 'Log in';
  }
});
