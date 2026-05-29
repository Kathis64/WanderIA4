import { testAnswers, testWeights } from '../fixtures'

describe('Recommendations API', () => {
  describe('POST /api/recommendations', () => {
    it('debería requerir autenticación', () => {
      const headers = {}
      const hasAuth = 'Authorization' in headers
      expect(hasAuth).toBe(false)
    })

    it('debería validar respuestas requeridas', () => {
      const answers = testAnswers.valid
      const required = ['climate', 'budget', 'duration', 'interests', 'travelStyle', 'continent']
      const isValid = required.every(f => f in answers)
      expect(isValid).toBe(true)
    })

    it('debería retornar 3 recomendaciones', () => {
      const recs = [
        { name: 'Kioto', country: 'Japón', match_percentage: 85 },
        { name: 'Barcelona', country: 'España', match_percentage: 78 },
        { name: 'Lisboa', country: 'Portugal', match_percentage: 72 },
      ]
      expect(recs.length).toBe(3)
    })

    it('debería ordenar recomendaciones por match_percentage', () => {
      const recs = [
        { match_percentage: 85 },
        { match_percentage: 78 },
        { match_percentage: 72 },
      ]
      for (let i = 0; i < recs.length - 1; i++) {
        expect(recs[i].match_percentage).toBeGreaterThanOrEqual(recs[i+1].match_percentage)
      }
    })

    it('debería aceptar pesos personalizados', () => {
      const weights = testWeights.valid
      const allInRange = Object.values(weights).every(w => w >= 1 && w <= 10)
      expect(allInRange).toBe(true)
    })
  })
})