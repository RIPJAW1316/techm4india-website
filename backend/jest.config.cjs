module.exports = {
  moduleFileExtensions: ["js", "json", "ts"],
  rootDir: ".",
  testMatch: ["<rootDir>/test/**/*.(spec|e2e-spec).ts"],
  transform: {
    "^.+\\.(t|j)s$": "ts-jest",
  },
  testEnvironment: "node",
  setupFiles: ["<rootDir>/test/setup-env.ts"],
  collectCoverageFrom: ["src/**/*.ts"],
  coverageDirectory: "./coverage",
};
