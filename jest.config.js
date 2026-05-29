const nextJest = require('next/jest')

const createJestConfig = nextJest({
  // Proporcionar la ruta al archivo de configuración de Next.js
  dir: './',
})

// Proporcionar cualquier configuración global personalizada de Jest
const customJestConfig = {
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  testEnvironment: 'jest-environment-jsdom',
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/$1',
  },
  testPathIgnorePatterns: [
    '<rootDir>/.next/',
    '<rootDir>/node_modules/',
  ],
  collectCoverageFrom: [
    'app/**/*.{js,jsx,ts,tsx}',
    'lib/**/*.{js,jsx,ts,tsx}',
    'components/**/*.{js,jsx,ts,tsx}',
    'context/**/*.{js,jsx,ts,tsx}',
    '!**/*.d.ts',
    '!**/node_modules/**',
    '!**/.next/**',
    '!**/coverage/**',
    '!**/tests/**',
    '!lib/ollama.ts',
    '!lib/test-questions.ts',
  ],
  /* coverageThreshold: {
    global: {
      branches: 70,
      functions: 70,
      lines: 70,
      statements: 70,
    },
  }, */
  testTimeout: 30000,
}

// createJestConfig es exportado de esta manera para asegurar que next/jest pueda cargar la configuración asincrónica de Next.js
module.exports = createJestConfig(customJestConfig)
