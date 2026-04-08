// jest.config.js
module.exports = {
  testEnvironment: 'node',
  testMatch: ['**/tests/**/*.test.js'],
  collectCoverageFrom: ['src/**/*.js', '!src/server.js'],
  coverageThreshold: {
    global: { branches: 50, functions: 60, lines: 60, statements: 60 }
  },
  setupFiles: ['dotenv/config'],
  testTimeout: 10000,
};
