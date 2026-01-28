import { describe, it, expect } from 'vitest'
import {
  calculateExamForecast,
  calculateAverageCorrectRate,
  calculateCourseCompletion,
  calculateTrend,
} from '../algorithms'
import { ExamForecastRawData } from '../types'

describe('Practice Algorithms', () => {
  describe('calculateAverageCorrectRate', () => {
    it('should calculate correct rate correctly', () => {
      const attempts = [
        { isCorrect: true },
        { isCorrect: true },
        { isCorrect: false },
        { isCorrect: true },
      ]
      expect(calculateAverageCorrectRate(attempts)).toBe(75)
    })

    it('should return 0 for empty attempts', () => {
      expect(calculateAverageCorrectRate([])).toBe(0)
    })
  })

  describe('calculateCourseCompletion', () => {
    it('should calculate completion rate correctly', () => {
      expect(calculateCourseCompletion(10, 5)).toBe(50)
    })

    it('should cap at 100%', () => {
      expect(calculateCourseCompletion(10, 12)).toBe(100)
    })
  })

  describe('calculateTrend', () => {
    it('should detect UP trend', () => {
      const now = new Date()
      const attempts = [
        // Recent (high score)
        ...Array(5).fill(0).map(() => ({ isCorrect: true, createdAt: now })),
        // Old (low score)
        ...Array(5).fill(0).map(() => ({ 
          isCorrect: false, 
          createdAt: new Date(now.getTime() - 10 * 24 * 60 * 60 * 1000) 
        })),
      ]
      
      expect(calculateTrend(attempts)).toBe('UP')
    })
  })

  describe('calculateExamForecast', () => {
    it('should calculate forecast score and grade', () => {
      // Mock data: High performance
      const rawData: ExamForecastRawData = {
        recentAttempts: Array(20).fill({ isCorrect: true, createdAt: new Date() }), // 100% correct
        totalLessons: 10,
        completedLessons: 10, // 100% completion
        userStreak: 20 // 10 bonus points
      }

      // Score = 100*0.6 + 100*0.3 + 10*0.1 = 60 + 30 + 1 = 91 (Wait, logic check)
      // Logic in code: avgCorrectRate * 0.6 + courseCompletion * 0.3 + streakBonus * 0.1
      // Streak bonus max is 10. 
      // 100*0.6 (60) + 100*0.3 (30) + 10 (10) = 100.
      
      const result = calculateExamForecast(rawData)
      
      expect(result.score).toBe(100)
      expect(result.grade).toBe('A+')
      expect(result.confidence).toBeGreaterThan(50)
    })
  })
})
