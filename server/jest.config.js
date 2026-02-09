/** @type {import('ts-jest').JestConfigWithTsJest} */
export default {
    // Allow test file directly in typescript
    preset: "ts-jest",
    testEnvironment: "node",
    rootDir: "./",
    // Don't waste time to scan
    testMatch: ["<rootDir>/test/**/*.test.ts","<rootDir>/test/**/*.spec.ts"],
    extensionsToTreatAsEsm: ['.ts'],
    moduleFileExtensions: ["ts","js"],
    // Run before every test file
    setupFilesAfterEnv: ["<rootDir>/test/jest.setup.ts"],
    verbose: true,
    clearMocks: true,
    moduleNameMapper: {
        // Map path aliases
        '^@models/(.*)\\.js$': '<rootDir>/src/models/$1',
        '^@services/(.*)$': '<rootDir>/src/services/$1',
        '@/(.*)\\.js$': '<rootDir>/src/$1',
        '@utilities/(.*)\\.js$': '<rootDir>/src/utilities/$1',
        '@configs/(.*)\\.js$': '<rootDir>/src/configs/$1',
        '@db/(.*)\\.js$': '<rootDir>/src/db/$1',
        '@routes/(.*)\\.js$': '<rootDir>/src/routes/$1',
        '@custom/(.*)\\.js$': '<rootDir>/src/custom/$1',
        '@middleware/(.*)\\.js$': '<rootDir>/src/middleware/$1',
        '@schema/(.*)\\.js$': '<rootDir>/src/schema/$1',
        // Trick jest to find just the path and file name not include .js extension
        '^(\\.{1,2}/.*)\\.js$': '$1',
    },
    transform: {
        // Use ts-jest to convert the file with ts or tsx extension into js code with ESM
        '^.+\\.tsx?$': [
            'ts-jest',
            {
                useESM: true,
            },
        ],
    },
}