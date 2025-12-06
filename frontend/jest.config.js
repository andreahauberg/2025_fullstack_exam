// jest.config.js
module.exports = {
  preset: "ts-jest/presets/js-with-babel", // eller 'ts-jest' hvis du bruger TypeScript
  transform: {
    "^.+\\.(js|jsx|mjs|cjs|ts|tsx)$": "babel-jest",
  },
  transformIgnorePatterns: [
    "/node_modules/(?!axios)/", // Tillad transformation af axios
  ],
  moduleNameMapper: {
    "^axios$": require.resolve("axios"),
  },
  setupFilesAfterEnv: ["<rootDir>/src/setupTests.js"],
};
