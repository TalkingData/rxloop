module.exports = {
  "testRegex": "(/test/.*\\.spec\\.[tj]s)$",
  transform: {
    "^.+\\.js$": "babel-jest",
    // "^.+\\.(ts|tsx)$": "ts-jest"
  },
  // watchPathIgnorePatterns: ['/node_modules/'],
  moduleFileExtensions: ['ts', 'tsx', 'js', 'json'],
  // moduleNameMapper: {
  //   '^@rxloop/(.*?)$': '<rootDir>/packages/$1/src'
  // },
  rootDir: __dirname,
  testMatch: ['<rootDir>/packages/**/?*.(spec|test|e2e).(j|t)s?(x)']
};