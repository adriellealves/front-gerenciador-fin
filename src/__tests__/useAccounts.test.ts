import { beforeEach, describe, expect, it, vi } from 'vitest'
import { useAccounts } from '../composables/useAccounts'
import type { Account } from '../types'

const mocks = vi.hoisted(() => ({
  apiGet: vi.fn(),
  apiPost: vi.fn(),
  apiPut: vi.fn(),
  apiPatch: vi.fn(),
}))

vi.mock('../services/api', () => ({
  api: {
    get: mocks.apiGet,
    post: mocks.apiPost,
    put: mocks.apiPut,
    patch: mocks.apiPatch,
  },
}))

describe('useAccounts', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('normalizes invalid balances when fetching accounts', async () => {
    mocks.apiGet.mockResolvedValueOnce({
      data: {
        content: [
          { id: '1', userId: 'u1', name: 'Conta 1', type: 'CHECKING', balance: undefined },
          { id: '2', userId: 'u1', name: 'Conta 2', type: 'SAVINGS', balance: '12.50' },
        ],
        totalElements: 2,
        totalPages: 1,
        page: 0,
        size: 20,
      },
    })

    const { accounts, fetchAccounts, formatCurrency, calcTotalBalance } = useAccounts('u1')
    const result = await fetchAccounts()

    expect(result[0].balance).toBe(0)
    expect(result[1].balance).toBe(12.5)
    expect(accounts.value).toEqual(result)
    expect(formatCurrency(result[0].balance)).toBe('R$ 0,00')
    expect(calcTotalBalance(result as Account[])).toBe(12.5)
  })

  it('sends numeric balance when creating and updating accounts', async () => {
    mocks.apiPost.mockResolvedValueOnce({ data: {} })
    mocks.apiPut.mockResolvedValueOnce({ data: {} })

    const { createAccount, updateAccount } = useAccounts('u1')

    await createAccount({ name: 'Nova', type: 'CHECKING', balance: '99.90' as unknown as number })
    await updateAccount('acc-1', { name: 'Nova', type: 'CHECKING', balance: '' as unknown as number })

    expect(mocks.apiPost).toHaveBeenCalledWith('/accounts', {
      userId: 'u1',
      name: 'Nova',
      type: 'CHECKING',
      balance: 99.9,
    })
    expect(mocks.apiPut).toHaveBeenCalledWith('/accounts/acc-1', {
      userId: 'u1',
      name: 'Nova',
      type: 'CHECKING',
      balance: 0,
    })
  })

  it('returns zero for invalid values in formatCurrency', () => {
    const { formatCurrency } = useAccounts('u1')
    expect(formatCurrency(Number.NaN)).toBe('R$ 0,00')
  })
})
