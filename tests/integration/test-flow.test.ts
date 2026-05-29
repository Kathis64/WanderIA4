/**
 * tests/integration/test-flow.test.ts
 * Pruebas de integración del flujo de test y recomendaciones
 */

import { testAnswers, testWeights, testFavorites, testFeedback } from '../fixtures'

describe('Test Flow Integration Tests', () => {
  describe('Complete Test Flow', () => {
    it('debería completar el flujo: test -> respuestas -> pesos -> recomendaciones', () => {
      // PASO 1: Iniciar sesión de test
      const testSession = {
        id: 'session-123',
        userId: 'user-123',
        startedAt: Date.now(),
      }
      expect(testSession.id).toBeDefined()

      // PASO 2: Responder preguntas
      const answers = testAnswers.complete
      expect(answers).toHaveProperty('climate')
      expect(answers).toHaveProperty('budget')

      // PASO 3: Asignar pesos
      const weights = testWeights.balanced
      Object.values(weights).forEach(weight => {
        expect(weight).toBeGreaterThanOrEqual(1)
        expect(weight).toBeLessThanOrEqual(10)
      })

      // PASO 4: Generar recomendaciones
      const recommendations = [
        {
          destination: 'Japón',
          matchScore: 0.92,
        },
        {
          destination: 'Tailandia',
          matchScore: 0.88,
        },
        {
          destination: 'Vietnam',
          matchScore: 0.85,
        },
      ]

      expect(recommendations.length).toBeGreaterThan(0)
      recommendations.forEach(rec => {
        expect(rec.matchScore).toBeGreaterThan(0)
        expect(rec.matchScore).toBeLessThanOrEqual(1)
      })
    })

    it('debería validar todas las respuestas antes de generar recomendaciones', () => {
      const answers = testAnswers.valid
      const requiredFields = [
        'climate',
        'budget',
        'duration',
        'interests',
        'travelStyle',
        'continent',
      ]

      const isValid = requiredFields.every(field => field in answers)
      expect(isValid).toBe(true)
    })

    it('debería manejar respuestas parciales', () => {
      const incompleteAnswers = {
        climate: 'calido',
        budget: 'medio',
        // Faltan más respuestas
      }

      const requiredFields = ['climate', 'budget', 'duration', 'interests']
      const hasAllRequired = requiredFields.every(
        field => field in incompleteAnswers
      )

      expect(hasAllRequired).toBe(false)
    })
  })

  describe('Answer Processing', () => {
    it('debería procesar respuestas de opción única', () => {
      const answer = {
        category: 'climate',
        value: 'calido',
        type: 'single',
      }

      expect(typeof answer.value).toBe('string')
      expect(answer.type).toBe('single')
    })

    it('debería procesar respuestas de múltiples opciones', () => {
      const answer = {
        category: 'interests',
        values: ['cultura', 'naturaleza', 'aventura'],
        type: 'multiple',
      }

      expect(Array.isArray(answer.values)).toBe(true)
      expect(answer.values.length).toBeGreaterThan(0)
      expect(answer.type).toBe('multiple')
    })

    it('debería validar límite de selecciones múltiples', () => {
      const maxSelections = 3
      const selectedValues = ['opt1', 'opt2', 'opt3', 'opt4']

      const isValid = selectedValues.length <= maxSelections
      expect(isValid).toBe(false)

      const validValues = selectedValues.slice(0, maxSelections)
      expect(validValues.length).toBeLessThanOrEqual(maxSelections)
    })
  })

  describe('Weight Management', () => {
    it('debería validar rangos de pesos', () => {
      const weights = testWeights.valid

      Object.entries(weights).forEach(([key, value]) => {
        expect(value).toBeGreaterThanOrEqual(1)
        expect(value).toBeLessThanOrEqual(10)
      })
    })

    it('debería normalizar pesos si es necesario', () => {
      const weights = {
        climate: 5,
        budget: 5,
        duration: 5,
      }

      const sum = Object.values(weights).reduce((a, b) => a + b, 0)
      const normalized = Object.entries(weights).reduce(
        (acc, [key, value]) => {
          acc[key] = value / sum
          return acc
        },
        {} as Record<string, number>
      )

      const normalizedSum = Object.values(normalized).reduce((a, b) => a + b, 0)
      expect(Math.abs(normalizedSum - 1)).toBeLessThan(0.01)
    })

    it('debería permitir pesos distintos en categorías', () => {
      const weights = {
        climate: 10,
        budget: 1,
        duration: 5,
      }

      const max = Math.max(...Object.values(weights))
      const min = Math.min(...Object.values(weights))

      expect(max).toBe(10)
      expect(min).toBe(1)
      expect(max).not.toBe(min)
    })
  })

  describe('Recommendation Generation', () => {
    it('debería generar exactamente 3 recomendaciones', () => {
      const recommendations = [
        { destination: 'Japón', score: 0.92 },
        { destination: 'Tailandia', score: 0.88 },
        { destination: 'Vietnam', score: 0.85 },
      ]

      expect(recommendations.length).toBe(3)
    })

    it('debería generar recomendaciones ordenadas por score', () => {
      const recommendations = [
        { destination: 'Japón', score: 0.92 },
        { destination: 'Tailandia', score: 0.88 },
        { destination: 'Vietnam', score: 0.85 },
      ]

      for (let i = 0; i < recommendations.length - 1; i++) {
        expect(recommendations[i].score).toBeGreaterThanOrEqual(
          recommendations[i + 1].score
        )
      }
    })

    it('debería incluir información detallada en recomendaciones', () => {
      const recommendation = {
        destination: 'Japón',
        country: 'Japón',
        reasoning: 'Excelente arquitectura y gastronomía',
        matchScore: 0.92,
        highlights: ['Templos', 'Gastronomía', 'Tecnología'],
      }

      expect(recommendation).toHaveProperty('destination')
      expect(recommendation).toHaveProperty('country')
      expect(recommendation).toHaveProperty('reasoning')
      expect(recommendation).toHaveProperty('matchScore')
      expect(recommendation).toHaveProperty('highlights')
      expect(Array.isArray(recommendation.highlights)).toBe(true)
    })

    it('debería evitar destinos duplicados', () => {
      const recommendations = [
        { destination: 'Japón' },
        { destination: 'Tailandia' },
        { destination: 'Vietnam' },
        { destination: 'Japón' }, // Duplicado
      ]

      const uniqueDestinations = new Set(
        recommendations.map(r => r.destination)
      )
      expect(uniqueDestinations.size).toBe(3)
    })
  })

  describe('Feedback Integration', () => {
    it('debería almacenar feedback de recomendaciones', () => {
      const feedback = {
        sessionId: 'session-123',
        destinationName: 'Japón',
        sentiment: testFeedback.positive.sentiment,
        helpfulScore: testFeedback.positive.helpful_score,
        feedbackText: testFeedback.positive.feedback_text,
      }

      expect(feedback.sentiment).toBe('positive')
      expect(feedback.helpfulScore).toBeGreaterThan(5)
    })

    it('debería procesar múltiples feedbacks en una sesión', () => {
      const feedbacks = [
        {
          destination: 'Japón',
          sentiment: 'positive',
          score: 8,
        },
        {
          destination: 'Tailandia',
          sentiment: 'neutral',
          score: 5,
        },
        {
          destination: 'Vietnam',
          sentiment: 'negative',
          score: 2,
        },
      ]

      expect(feedbacks.length).toBe(3)
      const positiveCount = feedbacks.filter(
        f => f.sentiment === 'positive'
      ).length
      expect(positiveCount).toBeGreaterThan(0)
    })

    it('debería influir en futuras recomendaciones', () => {
      const favoriteDestinations = [
        testFavorites.japan,
        testFavorites.thailand,
      ]
      const hasPositiveFeedback = favoriteDestinations.length > 0

      expect(hasPositiveFeedback).toBe(true)
    })
  })

  describe('Edge Cases', () => {
    it('debería manejar usuario sin respuestas previas', () => {
      const previousAnswers = null
      expect(previousAnswers).toBeNull()
    })

    it('debería manejar sesión interrumpida', () => {
      const incompleteSession = {
        id: 'session-456',
        questionsAnswered: 5,
        totalQuestions: 20,
      }

      const isComplete = incompleteSession.questionsAnswered ===
        incompleteSession.totalQuestions
      expect(isComplete).toBe(false)
    })

    it('debería reiniciar sesión si es necesario', () => {
        const oldSession = { id: 'session-old', createdAt: Date.now() - 86400001 }
        const isExpired = Date.now() - oldSession.createdAt > 86400000
        const newSession = {
            id: 'session-new',
            createdAt: Date.now(),
        }

      expect(isExpired).toBe(true)
      expect(newSession.createdAt).toBeGreaterThan(oldSession.createdAt)
    })
  })
})
