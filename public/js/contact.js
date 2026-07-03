const contactForm = document.getElementById('contactForm');
const formMsg = document.getElementById('formMsg');
const submitBtn = document.getElementById('submitBtn');

function showMsg(text, type) {
  formMsg.textContent = text;
  formMsg.className = `form-msg show ${type}`;
}

contactForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  formMsg.className = 'form-msg';

  const name = document.getElementById('name').value.trim();
  const email = document.getElementById('email').value.trim();
  const subject = document.getElementById('subject').value;
  const message = document.getElementById('message').value.trim();

  if (!name || !email || !message) {
    showMsg('Please fill in your name, email, and message.', 'error');
    return;
  }

  submitBtn.disabled = true;
  submitBtn.textContent = 'Sending...';

  try {
    const res = await fetch('/api/contact', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, subject, message })
    });
    const data = await res.json();

    if (!res.ok) {
      showMsg(data.error || 'Something went wrong.', 'error');
      submitBtn.disabled = false;
      submitBtn.textContent = 'Send message';
      return;
    }

    showMsg('Message received. We will respond within 24 hours.', 'success');
    contactForm.reset();
    submitBtn.disabled = false;
    submitBtn.textContent = 'Send message';
  } catch (err) {
    showMsg('Could not reach the server. Please try again.', 'error');
    submitBtn.disabled = false;
    submitBtn.textContent = 'Send message';
  }
});
