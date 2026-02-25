// test/background.test.js
// Tests for background.js (Google Safe Browsing API logic)
// These are Node-style tests using Jest. Chrome APIs are mocked.

const fetchMock = require('jest-fetch-mock');
fetchMock.enableMocks();

describe('background.js', () => {
  beforeEach(() => {
    fetchMock.resetMocks();
    global.chrome = {
      storage: {
        local: {
          get: jest.fn((keys, cb) => cb({})),
          set: jest.fn()
        }
      }
    };
  });

  it('should return safe for URLs with no matches', (done) => {
    fetchMock.mockResponseOnce(JSON.stringify({}));
    const sendResponse = (result) => {
      try {
        expect(result).toEqual({ safe: true });
        done();
      } catch (err) {
        done(err);
      }
    };
    const message = { type: 'checkUrl', url: 'http://example.com' };
    const background = require('../background.js');
    background.handleCheckUrl(message, sendResponse);
  });

  it('should return unsafe for URLs with matches', (done) => {
    fetchMock.mockResponseOnce(JSON.stringify({ matches: [{ threatType: 'MALWARE' }] }));
    const sendResponse = (result) => {
      try {
        expect(result).toEqual({ safe: false });
        done();
      } catch (err) {
        done(err);
      }
    };
    const message = { type: 'checkUrl', url: 'http://malicious.com' };
    const background = require('../background.js');
    background.handleCheckUrl(message, sendResponse);
  });
});
