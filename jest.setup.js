import '@testing-library/jest-dom'

// Mock de variables de entorno
process.env.OLLAMA_URL = 'http://localhost:11434'
process.env.NODE_ENV = 'test'

// Suprimir logs en pruebas si es necesario
global.console = {
  ...console,
  // log: jest.fn(),
  // debug: jest.fn(),
  error: jest.fn(),
  warn: jest.fn(),
}
