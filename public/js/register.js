const registerForm = document.getElementById('registerForm');
const formMsg = document.getElementById('formMsg');
const submitBtn = document.getElementById('submitBtn');

function showMsg(text, type) {
  formMsg.textContent = text;
  formMsg.className = `form-msg show ${type}`;
}

registerForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  formMsg.className = 'form-msg';

  const full_name = document.getElementById('full_name').value.trim();
  const email = document.getElementById('email').value.trim();
  const password = document.getElementById('password').value;

  if (!full_name || !email || !password) {
    showMsg('Please fill in every field.', 'error');
    return;
  }
  if (password.length < 6) {
    showMsg('Password must be at least 6 characters.', 'error');
    return;
  }

  submitBtn.disabled = true;
  submitBtn.textContent = 'Creating account...';

  try {
    const res = await fetch('/api/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ full_name, email, password })
    });
    const data = await res.json();

    if (!res.ok) {
      showMsg(data.error || 'Something went wrong.', 'error');
      submitBtn.disabled = false;
      submitBtn.textContent = 'Create account';
      return;
    }

    showMsg('Account created. Redirecting you home...', 'success');
    setTimeout(() => { window.location.href = 'index.html'; }, 1200);
  } catch (err) {
    showMsg('Could not reach the server. Please try again.', 'error');
    submitBtn.disabled = false;
    submitBtn.textContent = 'Create account';
  }
});
