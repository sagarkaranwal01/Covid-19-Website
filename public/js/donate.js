const donateForm = document.getElementById('donateForm');
const formMsg = document.getElementById('formMsg');
const submitBtn = document.getElementById('submitBtn');
const amountInput = document.getElementById('amount');
const chips = document.querySelectorAll('.amount-chip');
const totalRaisedEl = document.getElementById('totalRaised');
const donorCountEl = document.getElementById('donorCount');

function showMsg(text, type) {
  formMsg.textContent = text;
  formMsg.className = `form-msg show ${type}`;
}

chips.forEach(chip => {
  chip.addEventListener('click', () => {
    chips.forEach(c => c.classList.remove('selected'));
    chip.classList.add('selected');
    amountInput.value = chip.dataset.amount;
  });
});
amountInput.addEventListener('input', () => chips.forEach(c => c.classList.remove('selected')));

function formatUSD(n) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(n);
}

async function loadStats() {
  try {
    const res = await fetch('/api/donate/stats');
    const data = await res.json();
    totalRaisedEl.textContent = formatUSD(data.total || 0);
    donorCountEl.textContent = `${data.count || 0} donor${data.count === 1 ? '' : 's'} so far`;
  } catch (err) {
    totalRaisedEl.textContent = '$0';
  }
}
loadStats();

donateForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  formMsg.className = 'form-msg';

  const amount = amountInput.value;
  const fund = document.getElementById('fund').value;
  const name = document.getElementById('name').value.trim();
  const email = document.getElementById('email').value.trim();
  const message = document.getElementById('message').value.trim();

  if (!name || !email || !amount || parseFloat(amount) <= 0) {
    showMsg('Please enter your name, email, and a valid amount.', 'error');
    return;
  }

  submitBtn.disabled = true;
  submitBtn.textContent = 'Processing...';

  try {
    const res = await fetch('/api/donate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, amount, fund, message })
    });
    const data = await res.json();

    if (!res.ok) {
      showMsg(data.error || 'Something went wrong.', 'error');
      submitBtn.disabled = false;
      submitBtn.textContent = 'Donate now';
      return;
    }

    showMsg(`Thank you, ${name.split(' ')[0]}! Your donation was recorded.`, 'success');
    donateForm.reset();
    amountInput.value = 25;
    totalRaisedEl.textContent = formatUSD(data.total);
    donorCountEl.textContent = `${data.count} donor${data.count === 1 ? '' : 's'} so far`;
    submitBtn.disabled = false;
    submitBtn.textContent = 'Donate now';
  } catch (err) {
    showMsg('Could not reach the server. Please try again.', 'error');
    submitBtn.disabled = false;
    submitBtn.textContent = 'Donate now';
  }
});
