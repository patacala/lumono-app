module.exports = {
  moduleFileExtensions: ['js', 'json', 'ts'],
  rootDir: 'src',
  testRegex: '.*\\.spec\\.ts$',
  transform: {
    '^.+\\.(t|j)s$': 'ts-jest',
  },
  collectCoverageFrom: ['**/*.(t|j)s'],
  coverageDirectory: '../coverage',
  testEnvironment: 'node',
  moduleNameMapper: {
    '^@/domain/(.*)$': '<rootDir>/domain/$1',
    '^@/use-cases/(.*)$': '<rootDir>/use-cases/$1',
    '^@/adapters/(.*)$': '<rootDir>/adapters/$1',
    '^@/infrastructure/(.*)$': '<rootDir>/infrastructure/$1',
    '^@/shared/(.*)$': '<rootDir>/shared/$1',
  },
};

