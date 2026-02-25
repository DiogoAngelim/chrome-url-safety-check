// content.js
// Main content script for Chrome extension
// Detects when a user hovers over any <a> tag (link), debounces the event,
// checks the URL using Google Safe Browsing API via background.js,
// caches results, and displays a tooltip near the cursor.
// Uses Shadow DOM for CSS isolation.

// Debounce timer for hover events
let debounceTimer = null;
// Stores the last URL checked (not strictly needed, but can be used for future improvements)
let lastUrl = null;

// Tooltip element reference
let tooltip = null;

// Allow injection of checkUrlSafety for testing
let injectedCheckUrlSafety = null;

/**
 * Creates a tooltip element using Shadow DOM for CSS isolation.
 * Ensures host page styles do not affect the tooltip.
 * Returns the tooltip element.
 */
function createTooltip() {
  if (tooltip) return tooltip;
  tooltip = document.createElement('div');
  // Attach shadow root for CSS isolation
  const shadow = tooltip.attachShadow({ mode: 'open' });
  // Tooltip box styled by tooltip.css
  const tooltipBox = document.createElement('div');
  tooltipBox.className = 'url-safety-tooltip';
  shadow.appendChild(tooltipBox);
  document.body.appendChild(tooltip);
  return tooltip;
}

/**
 * Displays the tooltip near the cursor with the given text.
 * @param {string} text - Text to display ("Safe" or "Warning: Malicious")
 * @param {number} x - Cursor X position
 * @param {number} y - Cursor Y position
 */
function showTooltip(text, x, y) {
  const tip = createTooltip();
  const box = tip.shadowRoot.querySelector('.url-safety-tooltip');
  box.textContent = text;
  tip.style.position = 'fixed';
  tip.style.left = x + 10 + 'px'; // Offset from cursor
  tip.style.top = y + 10 + 'px';
  tip.style.zIndex = 999999;
  tip.style.pointerEvents = 'none';
  tip.style.display = 'block';
}

/**
 * Hides the tooltip from view.
 */
function hideTooltip() {
  if (tooltip) tooltip.style.display = 'none';
}

/**
 * Sends a message to the background script to check URL safety.
 * Shows tooltip with result.
 * @param {string} url - URL to check
 * @param {number} x - Cursor X position
 * @param {number} y - Cursor Y position
 */
function checkUrlSafety(url, x, y) {
  if (injectedCheckUrlSafety) {
    injectedCheckUrlSafety(url, x, y);
    return;
  }
  chrome.runtime.sendMessage({ type: 'checkUrl', url }, (response) => {
    if (!response) return;
    showTooltip(response.safe ? 'Safe' : 'Warning: Malicious', x, y);
  });
}

/**
 * Handles mouseover event on links.
 * Debounces the event and checks URL safety after 400ms.
 * @param {MouseEvent} e
 */
function onLinkHover(e) {
  const a = e.target.closest('a');
  if (!a || !a.href) {
    hideTooltip();
    return;
  }
  const url = a.href;
  const { clientX, clientY } = e;
  // Debounce: clear previous timer
  if (debounceTimer) clearTimeout(debounceTimer);
  debounceTimer = setTimeout(() => {
    lastUrl = url;
    checkUrlSafety(url, clientX, clientY);
  }, 400);
}

/**
 * Handles mouseout event to hide tooltip and clear debounce timer.
 * @param {MouseEvent} e
 */
function onLinkOut(e) {
  hideTooltip();
  if (debounceTimer) clearTimeout(debounceTimer);
}

// Attach listeners only if running in browser context (not test)
if (typeof window !== 'undefined' && typeof document !== 'undefined') {
  window.addEventListener('mouseover', onLinkHover);
  window.addEventListener('mouseout', onLinkOut);
}

// Export for testing
if (typeof module !== 'undefined') {
  module.exports = {
    createTooltip,
    showTooltip,
    hideTooltip,
    checkUrlSafety,
    onLinkHover,
    onLinkOut,
    setInjectedCheckUrlSafety: fn => { injectedCheckUrlSafety = fn; }
  };
}
