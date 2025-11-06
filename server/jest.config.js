module.exports = {
  testEnvironment: 'node',
  coverageDirectory: 'coverage',
  collectCoverageFrom: [
    'src/**/*.js',
    '!src/app.js',
    '!src/db/migrate.js',
    '!src/db/seed.js'
  ],
  testMatch: ['**/tests/**/*.test.js'],
  verbose: true
};
