import { ref } from 'vue'
import { api } from '../services/api'
import type { Account, AccountType, NewAccountForm } from '../types'

/**
 * Composable para CRUD de contas bancárias do usuário.
 */
export function useAccounts(userId: string | null) {
  const accounts = ref<Account[]>([])
  const isLoading = ref(false)

  const fetchAccounts = async (): Promise<Account[]> => {
    if (!userId) return []
    isLoading.value = true
    try {
      const response = await api.get<Account[]>(`/accounts/user/${userId}`)
      accounts.value = response.data
      return response.data
    } finally {
      isLoading.value = false
    }
  }

  const createAccount = async (form: NewAccountForm): Promise<void> => {
    await api.post('/accounts', { userId, ...form })
  }

  const updateAccount = async (id: string, form: NewAccountForm): Promise<void> => {
    await api.put(`/accounts/${id}`, { userId, ...form })
  }

  const inactivateAccount = async (id: string): Promise<void> => {
    await api.patch(`/accounts/${id}/inactivate`, {})
  }

  const calcTotalBalance = (list: Account[]): number =>
    list.reduce((acc, account) => acc + account.balance, 0)

  const currencyFormatter = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' })

  const formatCurrency = (value: number): string => currencyFormatter.format(value)

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
