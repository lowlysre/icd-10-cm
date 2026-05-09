module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  moduleFileExtensions: ['ts', 'js', 'json'],
  transform: {
    '^.+\\.ts$': ['ts-jest', {
      tsconfig: 'tsconfig.test.json',
    }],
  },
  testRegex: '(/__tests__/.*|(\\.|/)(test|spec))\\.ts$',
  globals: {},
  collectCoverage: true,
  coverageDirectory: 'coverage',
};
