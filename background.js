// background.js
// Service worker for Chrome extension
// Handles Google Safe Browsing API requests, debouncing, and local caching using chrome.storage.local
// Responds to content script requests for URL safety checks

// Google Safe Browsing API key (replace with your own key from Google Cloud Console)
const API_KEY = 'YOUR_GOOGLE_API_KEY_HERE'; // TODO: Replace with your actual API key
const API_URL = 'https://safebrowsing.googleapis.com/v4/threatMatches:find?key=' + API_KEY;

/**
 * Checks if the URL is cached, otherwise queries Google Safe Browsing API.
 * Caches results in chrome.storage.local for performance and quota savings.
 * @param {object} message - Message object with type and url
 * @param {function} sendResponse - Callback to send response
 * @returns {Promise<void>}
 */
async function handleCheckUrl(message, sendResponse) {
  if (message.type === 'checkUrl') {
    const url = message.url;
    // Check cache first
    chrome.storage.local.get([url], async (result) => {
      if (result[url] !== undefined) {
        // Cached result: return immediately
        sendResponse({ safe: result[url] });
      } else {
        // Not cached: build request body for Safe Browsing API
        const body = {
          client: { clientId: 'chrome-url-safety-check', clientVersion: '1.0' },
          threatInfo: {
            threatTypes: ['MALWARE', 'SOCIAL_ENGINEERING', 'UNWANTED_SOFTWARE', 'POTENTIALLY_HARMFUL_APPLICATION'],
            platformTypes: ['ANY_PLATFORM'],
            threatEntryTypes: ['URL'],
            threatEntries: [{ url }]
          }
        };
        try {
          // Send POST request to Google Safe Browsing API
          const response = await fetch(API_URL, {
            method: 'POST',
            body: JSON.stringify(body),
            headers: { 'Content-Type': 'application/json' }
          });
          const data = await response.json();
          // Log the full API response for debugging
          console.log('[SafeBrowsing API] Response for', url, data);
          // If no matches, URL is safe
          const isSafe = !data.matches;
          // Cache result for future queries
          chrome.storage.local.set({ [url]: isSafe });
          sendResponse({ safe: isSafe });
        } catch (e) {
          // Log error for debugging
          console.error('[SafeBrowsing API] Error for', url, e);
          // On error, default to safe (fail open)
          sendResponse({ safe: true });
        }
      }
    });
    // Return true to indicate async response
    return true;
  }
}

// Attach Chrome listener only if running in extension context
if (typeof chrome !== 'undefined' && chrome.runtime && chrome.runtime.onMessage) {
  chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    handleCheckUrl(message, sendResponse);
    return true;
  });
}

// Export for testing
if (typeof module !== 'undefined') {
  module.exports = { handleCheckUrl };
}
