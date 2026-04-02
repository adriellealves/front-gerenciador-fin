import { ref } from 'vue'
import { api } from '../services/api'
import type { Account, AccountType, NewAccountForm } from '../types'

type PaginatedResponse<T> = {
  content: T[]
}

/**
 * Composable para CRUD de contas bancárias do usuário.
 */
export function useAccounts(userId: string | null) {
  const accounts = ref<Account[]>([])
  const isLoading = ref(false)

  const normalizeNumber = (value: unknown): number => {
    const numberValue = typeof value === 'number' ? value : Number(value)
    return Number.isFinite(numberValue) ? numberValue : 0
  }

  const normalizeAccount = (account: Account): Account => ({
    ...account,
    balance: normalizeNumber(account.balance),
  })

  const extractAccounts = (data: Account[] | PaginatedResponse<Account> | unknown): Account[] => {
    if (Array.isArray(data)) return data
    if (data && typeof data === 'object' && 'content' in data && Array.isArray((data as PaginatedResponse<Account>).content)) {
      return (data as PaginatedResponse<Account>).content
    }
    return []
  }

  const fetchAccounts = async (): Promise<Account[]> => {
    if (!userId) return []
    isLoading.value = true
    try {
      const response = await api.get<Account[]>(`/accounts/user/${userId}`)
      const normalizedAccounts = extractAccounts(response.data).map(normalizeAccount)
      accounts.value = normalizedAccounts
      return normalizedAccounts
    } finally {
      isLoading.value = false
    }
  }

  const createAccount = async (form: NewAccountForm): Promise<void> => {
    await api.post('/accounts', { userId, ...form, balance: normalizeNumber(form.balance) })
  }

  const updateAccount = async (id: string, form: NewAccountForm): Promise<void> => {
    await api.put(`/accounts/${id}`, { userId, ...form, balance: normalizeNumber(form.balance) })
  }

  const inactivateAccount = async (id: string): Promise<void> => {
    await api.patch(`/accounts/${id}/inactivate`, {})
  }

  const calcTotalBalance = (list: Account[]): number =>
    list.reduce((acc, account) => acc + normalizeNumber(account.balance), 0)

  const currencyFormatter = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' })

  const formatCurrency = (value: number): string => currencyFormatter.format(normalizeNumber(value))

  const defaultForm = (): NewAccountForm => ({
    name: '',
    type: 'CHECKING' as AccountType,
    balance: 0,
  })

  return {
    accounts,
    isLoading,
    fetchAccounts,
    createAccount,
    updateAccount,
    inactivateAccount,
    calcTotalBalance,
    formatCurrency,
    defaultForm,
  }
}
