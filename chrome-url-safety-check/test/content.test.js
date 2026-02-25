// test/content.test.js
// Tests for content.js (debouncing, tooltip logic)
// These are Node-style tests using Jest. DOM APIs are mocked.

describe('content.js', () => {
  let content;
  beforeEach(() => {
    document.body.innerHTML = '';
    content = require('../content.js');
  });

  it('should create tooltip with Shadow DOM', () => {
    const tooltip = content.createTooltip();
    expect(tooltip).toBeDefined();
    expect(tooltip.shadowRoot).toBeDefined();
    expect(tooltip.shadowRoot.querySelector('.url-safety-tooltip')).toBeDefined();
  });

  it('should debounce URL checks', () => {
    jest.useFakeTimers();
    const mockCheck = jest.fn();
    content.setInjectedCheckUrlSafety(mockCheck);
    const event = { target: { closest: () => ({ href: 'http://test.com' }) }, clientX: 10, clientY: 20 };
    content.onLinkHover(event);
    expect(mockCheck).not.toBeCalled();
    jest.runAllTimers();
    expect(mockCheck).toBeCalledWith('http://test.com', 10, 20);
    content.setInjectedCheckUrlSafety(null);
    jest.useRealTimers();
  });
});
