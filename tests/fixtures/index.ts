/**
 * Test fixtures - Datos comunes para todas las pruebas
 */

export const testUsers = {
  validUser: {
    email: 'test@example.com',
    password: 'SecurePassword123!',
    name: 'Test User',
  },
  adminUser: {
    email: 'admin@example.com',
    password: 'AdminPassword123!',
    name: 'Admin User',
    role: 'admin',
  },
  invalidUser: {
    email: 'invalid',
    password: 'short',
    name: '',
  },
}

export const testAnswers = {
  valid: {
    climate: 'calido',
    budget: 'medio',
    duration: 'medio',
    interests: ['cultura', 'naturaleza', 'aventura'],
    travelStyle: 'comfort',
    continent: 'asia',
  },
  complete: {
    climate: 'tropical',
    budget: 'alto',
    duration: 'largo',
    interests: ['gastronomia', 'relax'],
    travelStyle: 'lujo',
    continent: 'americas',
    activities: ['playa', 'museos'],
    food: 'gourmet',
    accommodation: 'hotel',
    companion: 'pareja',
  },
}

export const testWeights = {
  valid: {
    climate: 8,
    budget: 7,
    duration: 6,
    interests: 9,
    travelStyle: 7,
    continent: 5,
  },
  balanced: {
    climate: 5,
    budget: 5,
    duration: 5,
    interests: 5,
    travelStyle: 5,
    continent: 5,
  },
}

export const testFavorites = {
  japan: {
    destination_name: 'Japón',
    destination_country: 'Japón',
    rating: 5,
  },
  thailand: {
    destination_name: 'Tailandia',
    destination_country: 'Tailandia',
    rating: 4,
  },
  peru: {
    destination_name: 'Perú',
    destination_country: 'Perú',
    rating: 3,
  },
}

export const testFeedback = {
  positive: {
    sentiment: 'positive',
    helpful_score: 8,
    feedback_text: 'Excelente recomendación, muy relevante para mis intereses.',
  },
  negative: {
    sentiment: 'negative',
    helpful_score: 2,
    feedback_text: 'No fue lo que esperaba, muy diferente a mis preferencias.',
  },
  neutral: {
    sentiment: 'neutral',
    helpful_score: 5,
    feedback_text: 'Era una opción interesante pero no completamente alineada.',
  },
}

export const testDestinations = {
  tokyo: {
    name: 'Tokio',
    country: 'Japón',
    description: 'Capital de Japón con arquitectura moderna y tradición.',
    highlights: ['Templos', 'Gastronomía', 'Tecnología'],
    climate: 'templado',
  },
  bangkok: {
    name: 'Bangkok',
    country: 'Tailandia',
    description: 'Capital de Tailandia con mercados flotantes y cultura.',
    highlights: ['Templos', 'Mercados', 'Gastronomía'],
    climate: 'tropical',
  },
  cusco: {
    name: 'Cusco',
    country: 'Perú',
    description: 'Antiguo corazón del Imperio Inca.',
    highlights: ['Historia', 'Montañas', 'Cultura'],
    climate: 'templado',
  },
}

export const validJWT =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6InRlc3QtdXNlci0xIiwibmFtZSI6IlRlc3QgVXNlciIsImVtYWlsIjoidGVzdEBleGFtcGxlLmNvbSIsImlhdCI6MTcxNjAwMDAwMH0.xyz'

export const expiredJWT =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6InRlc3QtdXNlciIsImV4cCI6MTYwMDAwMDAwMH0.expired'
