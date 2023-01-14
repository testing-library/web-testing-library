const {
  collectCoverageFrom,
  coveragePathIgnorePatterns,
  coverageThreshold,
  watchPlugins,
} = require('kcd-scripts/jest')

module.exports = {
  collectCoverageFrom,
  coveragePathIgnorePatterns: [...coveragePathIgnorePatterns, '/__tests__/'],
  coverageThreshold,
  watchPlugins: [
    ...watchPlugins,
    require.resolve('jest-watch-select-projects'),
  ],
  projects: [
    // No idea why I need to specify a project instead of having a single config
    require.resolve('./tests/jest.config.js'),
  ],
}
