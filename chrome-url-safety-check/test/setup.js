// test/setup.js
// Jest setup for Chrome extension tests

global.chrome = {
  runtime: {
    sendMessage: jest.fn()
  },
  storage: {
    local: {
      get: jest.fn(),
      set: jest.fn()
    }
  }
};
