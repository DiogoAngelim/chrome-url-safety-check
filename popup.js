// popup.js
// Handles clear cache button in extension popup

document.addEventListener('DOMContentLoaded', () => {
  const btn = document.getElementById('clearCacheBtn');
  const status = document.getElementById('status');
  btn.addEventListener('click', () => {
    chrome.storage.local.clear(() => {
      status.textContent = 'Cache cleared!';
      setTimeout(() => { status.textContent = ''; }, 2000);
    });
  });
});
