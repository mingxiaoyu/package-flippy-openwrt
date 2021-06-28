module.exports = {
  clearMocks: true,
  moduleFileExtensions: ['js', 'ts'],
  roots: ['<rootDir>'],
  testEnvironment: 'node',
  testMatch: ['**/*.test.ts'],
  testRunner: 'jest-circus/runner',
  transform: {
    "^.+\\.js$": "babel-jest",
    '^.+\\.ts$': 'ts-jest'
  },
  transformIgnorePatterns: ["<rootDir>/node_modules/(?!(ansi-styles))"],
  verbose: true
}