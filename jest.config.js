module.exports = {
  collectCoverageFrom: ["<rootDir>/src/**/*.ts"],
  coveragePathIgnorePatterns: ["<rootDir>/node_modules"],
  coverageReporters: ["json", "lcov", "text"],
  transform: {
    ".ts": "ts-jest",
  },
  testEnvironment: "node",
  moduleFileExtensions: ["ts", "js", "json"],
  testRegex: "(/tests/.*|(\\.|/)(test|spec))\\.ts?$",
  testTimeout: 30000
};
