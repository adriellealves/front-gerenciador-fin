export type AccountType = 'CREDIT_CARD' | 'CASH' | 'CHECKING' | 'SAVINGS' | 'INVESTMENT'

export type CategoryType = 'EXPENSE' | 'INCOME'

export type TransactionType = 'EXPENSE' | 'INCOME'

export type TransactionStatus = 'PAID' | 'PENDING'

export interface Account {
  id: string
  userId: string
  name: string
  type: AccountType
  balance: number
  active?: boolean
}

export interface Category {
  id: string
  userId: string
  name: string
  type: CategoryType
  colorHex: string
  parentId: string | null
  children?: Category[]
}

export interface Transaction {
  id: string
  userId: string
  accountId: string
  categoryId: string
  type: TransactionType
  amount: number
  description: string
  transactionDate: string
  status: TransactionStatus
}

export interface User {
  id: string
  name: string
  email: string
}

export interface TransactionFormData {
  description: string
  amount: number | null
  date: string
  categoryId: string
  accountId: string
  type: TransactionType
}

export interface NewAccountForm {
  name: string
  type: AccountType
  balance: number
}

export interface NewCategoryForm {
  name: string
  type: CategoryType
  colorHex: string
  parentId: string
}
