const API_URL = 'https://profit-gen-20.preview.emergentagent.com/api';

let apiKey = '';
let userId = '';

// Initialize
document.addEventListener('DOMContentLoaded', async () => {
  const stored = await chrome.storage.local.get(['apiKey', 'userId']);
  if (stored.apiKey && stored.userId) {
    apiKey = stored.apiKey;
    userId = stored.userId;
    showMainView();
    fetchCredits();
  } else {
    showLoginView();
  }
});

function showLoginView() {
  document.getElementById('login-view').style.display = 'block';
  document.getElementById('main-view').style.display = 'none';
}

function showMainView() {
  document.getElementById('login-view').style.display = 'none';
  document.getElementById('main-view').style.display = 'block';
}

async function saveApiKey() {
  const key = document.getElementById('api-key-input').value.trim();
  if (!key || !key.startsWith('cai_')) {
    alert('Please enter a valid API key (starts with cai_)');
    return;
  }

  try {
    // Verify API key by making a test request
    const res = await fetch(`${API_URL}/v1/generate?api_key=${key}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        content_type: 'social_media',
        topic: 'test',
        user_id: 'test'
      })
    });

    if (res.status === 401) {
      alert('Invalid API key');
      return;
    }

    // Get user ID from the key (we'll store it)
    apiKey = key;
    // For now, use a placeholder - in production, we'd verify and get user ID
    await chrome.storage.local.set({ apiKey: key, userId: 'api-user' });
    showMainView();
    fetchCredits();
  } catch (e) {
    console.error(e);
    alert('Failed to connect. Check your API key.');
  }
}

async function fetchCredits() {
  // For demo purposes - in production, add endpoint to get credits by API key
  document.getElementById('credits').textContent = 'Connected';
}

async function generate() {
  const topic = document.getElementById('topic').value.trim();
  const contentType = document.getElementById('content-type').value;

  if (!topic) {
    alert('Please enter a topic');
    return;
  }

  const btn = document.getElementById('generate-btn');
  const btnText = document.getElementById('btn-text');
  const spinner = document.getElementById('spinner');
  const output = document.getElementById('output');
  const copyBtn = document.getElementById('copy-btn');

  btn.disabled = true;
  btnText.style.display = 'none';
  spinner.style.display = 'block';
  output.textContent = '';
  copyBtn.style.display = 'none';

  try {
    const res = await fetch(`${API_URL}/v1/generate?api_key=${apiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        content_type: contentType,
        topic: topic,
        tone: 'professional',
        language: 'en',
        user_id: userId
      })
    });

    const data = await res.json();

    if (res.ok) {
      output.textContent = data.generated_content;
      copyBtn.style.display = 'block';
    } else {
      output.textContent = `Error: ${data.detail || 'Generation failed'}`;
    }
  } catch (e) {
    output.textContent = `Error: ${e.message}`;
  } finally {
    btn.disabled = false;
    btnText.style.display = 'inline';
    spinner.style.display = 'none';
  }
}

function copyOutput() {
  const output = document.getElementById('output').textContent;
  navigator.clipboard.writeText(output).then(() => {
    const btn = document.getElementById('copy-btn');
    btn.textContent = '✓ Copied!';
    setTimeout(() => { btn.textContent = '📋 Copy to Clipboard'; }, 2000);
  });
}
