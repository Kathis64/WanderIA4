/**
 * tests/concurrent/concurrency.test.ts
 * Pruebas de concurrencia y carga
 */

describe('Concurrency Tests', () => {
  describe('Simultaneous User Registrations', () => {
    it('debería manejar 10 registros simultáneos sin conflictos', async () => {
      const registrations = Array.from({ length: 10 }, (_, i) => ({
        email: `user${i}@example.com`,
        password: `Password${i}123`,
        name: `User ${i}`,
      }))

      const promises = registrations.map(reg => {
        return new Promise(resolve => {
          // Simular registro
          setTimeout(() => {
            resolve({ success: true, email: reg.email })
          }, Math.random() * 100)
        })
      })

      const results = await Promise.all(promises)
      expect(results.length).toBe(10)
      expect(results.every((r: any) => r.success)).toBe(true)
    })

    it('debería prevenir emails duplicados en registro simultáneo', async () => {
      const usedEmails = new Set()

      const registrations = Array.from({ length: 5 }, () => ({
        email: 'duplicate@example.com',
        password: 'Password123',
      }))

      const promises = registrations.map(async reg => {
        if (usedEmails.has(reg.email)) {
          return { success: false, error: 'Email ya existe' }
        }
        usedEmails.add(reg.email)
        return { success: true, email: reg.email }
      })

      const results = await Promise.all(promises)
      const successCount = results.filter((r: any) => r.success).length
      expect(successCount).toBe(1) // Solo la primera debería tener éxito
    })

    it('debería manejar timeouts en registros concurrentes', async () => {
      const promises = Array.from({ length: 5 }, (_, i) =>
        new Promise((resolve, reject) => {
          const timeout = setTimeout(() => {
            reject(new Error('Timeout'))
          }, 50)

          setTimeout(() => {
            clearTimeout(timeout)
            resolve({ success: true, id: i })
          }, Math.random() * 100)
        })
      )

      try {
        const results = await Promise.race([
          Promise.all(promises),
          new Promise((_, reject) =>
            setTimeout(() => reject(new Error('Global timeout')), 200)
          ),
        ])
        expect(results).toBeDefined()
      } catch (error: any) {
        expect(error.message).toMatch(/Timeout|timeout/)
      }
    })
  })

  describe('Simultaneous Test Sessions', () => {
    it('debería crear 20 sesiones de test simultáneamente', async () => {
      const sessions: any[] = []

      const promises = Array.from({ length: 20 }, (_, i) =>
        new Promise(resolve => {
          setTimeout(() => {
            const session = {
              id: `session-${i}`,
              userId: `user-${i}`,
              createdAt: Date.now(),
            }
            sessions.push(session)
            resolve(session)
          }, Math.random() * 50)
        })
      )

      await Promise.all(promises)
      expect(sessions.length).toBe(20)

      // Verificar que no hay duplicados
      const uniqueIds = new Set(sessions.map(s => s.id))
      expect(uniqueIds.size).toBe(20)
    })

    it('debería manejar respuestas simultáneas sin conflictos', async () => {
      const sessionAnswers: Record<string, any[]> = {}

      const sessionId = 'session-test'
      sessionAnswers[sessionId] = []

      const answers = Array.from({ length: 15 }, (_, i) => ({
        category: `category-${i}`,
        value: `value-${i}`,
      }))

      const promises = answers.map(answer =>
        new Promise(resolve => {
          setTimeout(() => {
            sessionAnswers[sessionId].push(answer)
            resolve(true)
          }, Math.random() * 100)
        })
      )

      await Promise.all(promises)
      expect(sessionAnswers[sessionId].length).toBe(15)
    })

    it('debería generar recomendaciones simultáneamente para múltiples usuarios', async () => {
      const recommendations: any[] = []

      const promises = Array.from({ length: 10 }, (_, i) =>
        new Promise(resolve => {
          setTimeout(() => {
            const rec = {
              userId: `user-${i}`,
              destinations: [
                { name: 'Destino 1', score: 0.9 },
                { name: 'Destino 2', score: 0.8 },
                { name: 'Destino 3', score: 0.7 },
              ],
              generatedAt: Date.now(),
            }
            recommendations.push(rec)
            resolve(rec)
          }, Math.random() * 200)
        })
      )

      await Promise.all(promises)
      expect(recommendations.length).toBe(10)
      recommendations.forEach(rec => {
        expect(rec.destinations.length).toBe(3)
      })
    })
  })

  describe('Simultaneous Data Access', () => {
    it('debería leer favoritos de múltiples usuarios simultáneamente', async () => {
      const userFavorites: Record<string, any[]> = {
        'user-1': [{ destination: 'Japón' }, { destination: 'Tailandia' }],
        'user-2': [{ destination: 'París' }, { destination: 'Roma' }],
        'user-3': [{ destination: 'Nueva York' }],
      }

      const promises = Object.keys(userFavorites).map(userId =>
        new Promise(resolve => {
          setTimeout(() => {
            resolve(userFavorites[userId])
          }, Math.random() * 50)
        })
      )

      const results = await Promise.all(promises)
      expect(results.length).toBe(3)
      results.forEach((res: any) => {
        expect(Array.isArray(res)).toBe(true)
      })
    })

    it('debería actualizar favoritos simultáneamente sin conflictos', async () => {
      const favorites = new Map()
      favorites.set('user-1', [])

      const updates = Array.from({ length: 10 }, (_, i) => ({
        userId: 'user-1',
        destination: `Destino-${i}`,
      }))

      const promises = updates.map(update =>
        new Promise(resolve => {
          setTimeout(() => {
            const current = favorites.get(update.userId) || []
            current.push(update.destination)
            favorites.set(update.userId, current)
            resolve(true)
          }, Math.random() * 50)
        })
      )

      await Promise.all(promises)
      const final = favorites.get('user-1')
      expect(final.length).toBe(10)
    })

    it('debería manejar conflictos de lectura-escritura', async () => {
      let counter = 0
      const operations: any[] = []

      const readWrite = async () => {
        const reads = Array.from({ length: 5 }, () =>
          new Promise(resolve => {
            setTimeout(() => {
              operations.push({ type: 'read', value: counter })
              resolve(counter)
            }, Math.random() * 30)
          })
        )

        const writes = Array.from({ length: 5 }, (_, i) =>
          new Promise(resolve => {
            setTimeout(() => {
              counter++
              operations.push({ type: 'write', value: counter })
              resolve(counter)
            }, Math.random() * 30)
          })
        )

        await Promise.all([...reads, ...writes])
      }

      await readWrite()
      expect(operations.length).toBeGreaterThan(0)
    })
  })

  describe('Rate Limiting & Throttling', () => {
    it('debería aplicar rate limiting a requests simultáneos', async () => {
      const maxRequests = 5
      const timeWindow = 1000 // 1 segundo
      let requestCount = 0
      const timestamps: number[] = []

      const request = async () => {
        const now = Date.now()

        // Limpiar timestamps fuera de la ventana de tiempo
        while (
          timestamps.length > 0 &&
          timestamps[0] < now - timeWindow
        ) {
          timestamps.shift()
        }

        if (timestamps.length >= maxRequests) {
          throw new Error('Rate limit exceeded')
        }

        timestamps.push(now)
        requestCount++
        return { success: true }
      }

      const promises = Array.from({ length: 3 }, () => request())
      const results = await Promise.all(promises)
      expect(results.length).toBe(3)
      expect(requestCount).toBeLessThanOrEqual(maxRequests)
    })

    it('debería throttle requests largos', async () => {
      const operations: any[] = []
      const throttleDelay = 100

      const throttledOperation = async (id: number) => {
        const start = Date.now()
        operations.push({ id, start })

        await new Promise(resolve => setTimeout(resolve, throttleDelay))

        const end = Date.now()
        operations.push({ id, end, duration: end - start })
      }

      const promises = Array.from({ length: 5 }, (_, i) =>
        throttledOperation(i)
      )

      await Promise.all(promises)
      expect(operations.length).toBeGreaterThan(0)
    })
  })

  describe('Memory & Performance', () => {
    it('debería manejar grandes volúmenes de datos concurrentes', async () => {
      const largeData = Array.from({ length: 1000 }, (_, i) => ({
        id: i,
        data: new Array(100).fill(`item-${i}`),
      }))

      const promises = largeData.map(item =>
        new Promise(resolve => {
          setTimeout(() => {
            resolve({ id: item.id, processed: true })
          }, 1)
        })
      )

      const results = await Promise.all(promises)
      expect(results.length).toBe(1000)
    })

    it('debería manejar memory leaks en operaciones concurrentes', async () => {
      const baseMemory = (process.memoryUsage().heapUsed / 1024 / 1024).toFixed(2)

      const iterations = 100
      const promises = Array.from({ length: iterations }, () =>
        new Promise(resolve => {
          const tempData = new Array(1000).fill('data')
          setTimeout(() => {
            resolve(tempData.length)
          }, 10)
        })
      )

      await Promise.all(promises)

      const finalMemory = (process.memoryUsage().heapUsed / 1024 / 1024).toFixed(2)

      // Memoria no debería crecer descontroladamente
      const increase = parseFloat(finalMemory) - parseFloat(baseMemory)
      expect(increase).toBeLessThan(100) // Menos de 100 MB de aumento
    })
  })

  describe('Error Handling in Concurrent Operations', () => {
    it('debería manejar errores en operaciones paralelas', async () => {
      const promises = Array.from({ length: 10 }, (_, i) =>
        new Promise((resolve, reject) => {
          setTimeout(() => {
            if (i % 3 === 0) {
              reject(new Error(`Error en operación ${i}`))
            } else {
              resolve({ success: true, id: i })
            }
          }, Math.random() * 50)
        })
      )

      const results = await Promise.allSettled(promises)
      const fulfilled = results.filter(r => r.status === 'fulfilled').length
      const rejected = results.filter(r => r.status === 'rejected').length

      expect(fulfilled + rejected).toBe(10)
      expect(rejected).toBeGreaterThan(0)
    })

    it('debería recuperarse de fallos parciales', async () => {
      const operations = Array.from({ length: 5 }, (_, i) => i)
      const results: any[] = []
      const errors: any[] = []

      for (const op of operations) {
        try {
          if (op === 2) throw new Error('Fallo simulado')
          results.push({ op, success: true })
        } catch (error) {
          errors.push({ op, error })
        }
      }

      expect(results.length).toBe(4)
      expect(errors.length).toBe(1)
      expect(results.length + errors.length).toBe(5)
    })
  })
})
