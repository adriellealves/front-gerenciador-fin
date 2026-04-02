import { describe, it, expect, vi } from 'vitest'
import { useTransactions } from '../composables/useTransactions'
import type { Transaction } from '../types'

const mocks = vi.hoisted(() => ({
  apiGet: vi.fn(),
  apiPost: vi.fn(),
}))

vi.mock('../services/api', () => ({
  api: {
    get: mocks.apiGet,
    post: mocks.apiPost,
  },
}))

const makeTransaction = (overrides: Partial<Transaction> = {}): Transaction => ({
  id: '1',
  userId: 'user1',
  accountId: 'acc1',
  categoryId: 'cat1',
  type: 'INCOME',
  amount: 100,
  description: 'Test',
  transactionDate: '2026-04-01',
  status: 'PAID',
  ...overrides,
})

describe('useTransactions', () => {
  describe('calcMonthlyTotals', () => {
    it('sums income and expense for the current month', () => {
      const { calcMonthlyTotals } = useTransactions('user1')

      const now = new Date()
      const year = now.getFullYear()
      const month = String(now.getMonth() + 1).padStart(2, '0')
      const date = `${year}-${month}-01`

      const transactions: Transaction[] = [
        makeTransaction({ type: 'INCOME', amount: 1000, transactionDate: date }),
        makeTransaction({ type: 'EXPENSE', amount: 300, transactionDate: date }),
        makeTransaction({ type: 'INCOME', amount: 500, transactionDate: date }),
      ]

      const totals = calcMonthlyTotals(transactions)
      expect(totals.income).toBe(1500)
      expect(totals.expense).toBe(300)
    })

    it('ignores transactions from other months', () => {
      const { calcMonthlyTotals } = useTransactions('user1')

      const transactions: Transaction[] = [
        makeTransaction({ type: 'INCOME', amount: 999, transactionDate: '2020-01-15' }),
        makeTransaction({ type: 'EXPENSE', amount: 999, transactionDate: '2020-06-20' }),
      ]

      const totals = calcMonthlyTotals(transactions)
      expect(totals.income).toBe(0)
      expect(totals.expense).toBe(0)
    })

    it('returns zeroes for empty list', () => {
      const { calcMonthlyTotals } = useTransactions('user1')
      const totals = calcMonthlyTotals([])
      expect(totals.income).toBe(0)
      expect(totals.expense).toBe(0)
    })
  })

  describe('determineStatus', () => {
    it('returns PAID for past date', () => {
      const { determineStatus } = useTransactions('user1')
      expect(determineStatus('2020-01-01')).toBe('PAID')
    })

    it('returns PENDING for future date', () => {
      const { determineStatus } = useTransactions('user1')
      expect(determineStatus('2099-12-31')).toBe('PENDING')
    })

    it('returns PAID for today', () => {
      const { determineStatus } = useTransactions('user1')
      const today = new Date().toISOString().split('T')[0]
      expect(determineStatus(today)).toBe('PAID')
    })
  })

  describe('formatCurrency', () => {
    it('formats a number as BRL currency', () => {
      const { formatCurrency } = useTransactions('user1')
      const result = formatCurrency(1234.56)
      expect(result).toContain('1.234,56')
    })
  })

  describe('formatDate', () => {
    it('converts YYYY-MM-DD to DD/MM/YYYY', () => {
      const { formatDate } = useTransactions('user1')
      expect(formatDate('2026-04-02')).toBe('02/04/2026')
    })
  })

  describe('fetchTransactions', () => {
    it('handles empty paginated responses without failing', async () => {
      mocks.apiGet.mockResolvedValueOnce({
        data: {
          content: [],
        },
      })

      const { fetchTransactions, transactions } = useTransactions('user1')
      const result = await fetchTransactions()

      expect(result).toEqual([])
      expect(transactions.value).toEqual([])
    })
  })
})
