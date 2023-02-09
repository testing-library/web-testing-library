const {
  collectCoverageFrom,
  coveragePathIgnorePatterns,
  coverageThreshold,
  watchPlugins,
} = require('kcd-scripts/jest')

module.exports = {
  collectCoverageFrom,
  coveragePathIgnorePatterns: [...coveragePathIgnorePatterns, '/__tests__/'],
  coverageThreshold: {
    ...coverageThreshold,
    // full coverage across the build matrix (Node.js versions) but not in a single job
    // minimum coverage of jobs using different Node.js version
    './src/waitFor.ts': {
      branches: 96.77,
      functions: 100,
      lines: 97.95,
      statements: 98,
    },
  },
  watchPlugins: [
    ...watchPlugins,
    require.resolve('jest-watch-select-projects'),
  ],
  projects: [
    // No idea why I need to specify a project instead of having a single config
    require.resolve('./tests/jest.config.js'),
  ],
}
