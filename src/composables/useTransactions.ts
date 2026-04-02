import { ref } from 'vue'
import { api } from '../services/api'
import type { Transaction, TransactionType } from '../types'

type PaginatedResponse<T> = {
  content: T[]
}

/**
 * Composable para buscar e calcular dados de transações do usuário.
 */
export function useTransactions(userId: string | null) {
  const transactions = ref<Transaction[]>([])
  const isLoading = ref(false)

  const extractTransactions = (data: Transaction[] | PaginatedResponse<Transaction> | unknown): Transaction[] => {
    if (Array.isArray(data)) return data
    if (data && typeof data === 'object' && 'content' in data && Array.isArray((data as PaginatedResponse<Transaction>).content)) {
      return (data as PaginatedResponse<Transaction>).content
    }
    return []
  }

  const fetchTransactions = async (): Promise<Transaction[]> => {
    if (!userId) return []
    isLoading.value = true
    try {
      const response = await api.get<Transaction[]>(`/transactions/user/${userId}`)
      const sorted = extractTransactions(response.data).sort(
        (a, b) => new Date(b.transactionDate).getTime() - new Date(a.transactionDate).getTime()
      )
      transactions.value = sorted
      return sorted
    } finally {
      isLoading.value = false
    }
  }

  const calcMonthlyTotals = (list: Transaction[]): { income: number; expense: number } => {
    const now = new Date()
    const currentMonth = now.getMonth() + 1
    const currentYear = now.getFullYear()

    let income = 0
    let expense = 0

    list.forEach(t => {
      const [year, month] = t.transactionDate.split('-').map(Number)
      if (year === currentYear && month === currentMonth) {
        if (t.type === 'INCOME') income += t.amount
        else if (t.type === 'EXPENSE') expense += t.amount
      }
    })

    return { income, expense }
  }

  const determineStatus = (transactionDate: string): 'PAID' | 'PENDING' => {
    const today = new Date().toISOString().split('T')[0]
    return transactionDate > today ? 'PENDING' : 'PAID'
  }

  const createTransaction = async (payload: {
    userId: string | null
    accountId: string
    categoryId: string
    type: TransactionType
    amount: number | null
    description: string
    transactionDate: string
    status: 'PAID' | 'PENDING'
  }): Promise<void> => {
    await api.post('/transactions', payload)
  }

  const currencyFormatter = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' })

  const formatCurrency = (value: number): string => currencyFormatter.format(value)

  const formatDate = (dateString: string): string => {
    const [year, month, day] = dateString.split('-')
    return `${day}/${month}/${year}`
  }

  return {
    transactions,
    isLoading,
    fetchTransactions,
    calcMonthlyTotals,
    determineStatus,
    createTransaction,
    formatCurrency,
    formatDate,
  }
}
