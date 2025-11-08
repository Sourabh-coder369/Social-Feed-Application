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
  verbose: true,
  testTimeout: 10000, // Increase timeout to 10 seconds
  maxWorkers: 1, // Run tests serially to avoid database connection issues
};
