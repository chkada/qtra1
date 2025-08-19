module.exports = {
  preset: 'jest-puppeteer',
  testEnvironment: 'node',
  testMatch: ['**/tests/ui/**/*.test.js'],
  setupFilesAfterEnv: ['<rootDir>/tests/setup/puppeteer.setup.js'],
  testTimeout: 30000,
  verbose: true,
  collectCoverage: false,
  globals: {
    URL: 'http://localhost:3000'
  },
  moduleFileExtensions: ['js', 'json'],
  transform: {
    '^.+\\.js$': 'babel-jest'
  },
  testPathIgnorePatterns: [
    '<rootDir>/.next/',
    '<rootDir>/node_modules/'
  ]
};