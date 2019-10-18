module.exports = {
  verbose: true,
  rootDir: __dirname,
  transform: {
    // "^.+\\.js$": "babel-jest",
    "^.+\\.js$": "<rootDir>/babel.upward.js",
    // "^.+\\.(ts|tsx)$": "ts-jest"
  },
  watchPathIgnorePatterns: ['/node_modules/'],
  moduleFileExtensions: ['ts', 'tsx', 'js', 'json'],
  moduleNameMapper: {
    '^@rxloop/(.*?)$': '<rootDir>/packages/$1'
  },
  testMatch: [`${process.cwd()}/test/**/*spec.[jt]s?(x)`]
};