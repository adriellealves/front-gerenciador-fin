import { describe, it, expect, beforeEach } from 'vitest'
import { useAuth } from '../composables/useAuth'

const TOKEN_KEY = '@CoreFinancas:token'
const USER_ID_KEY = '@CoreFinancas:userId'
const USER_NAME_KEY = '@CoreFinancas:userName'

vi.mock('vue-router', () => ({
  useRouter: () => ({ push: vi.fn() }),
}))

describe('useAuth', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it('getToken returns null when not logged in', () => {
    const { getToken } = useAuth()
    expect(getToken()).toBeNull()
  })

  it('getToken returns token after saveSession', () => {
    const { saveSession, getToken } = useAuth()
    saveSession('my-token', 'uid-123', 'Alice')
    expect(getToken()).toBe('my-token')
  })

  it('getUserId returns null when not logged in', () => {
    const { getUserId } = useAuth()
    expect(getUserId()).toBeNull()
  })

  it('getUserId returns userId after saveSession', () => {
    const { saveSession, getUserId } = useAuth()
    saveSession('tok', 'uid-456', 'Bob')
    expect(getUserId()).toBe('uid-456')
  })

  it('getUserName returns fallback when not set', () => {
    const { getUserName } = useAuth()
    expect(getUserName()).toBe('Usuário')
  })

  it('getUserName returns name after saveSession', () => {
    const { saveSession, getUserName } = useAuth()
    saveSession('tok', 'uid', 'Carol')
    expect(getUserName()).toBe('Carol')
  })

  it('isAuthenticated returns false when no token', () => {
    const { isAuthenticated } = useAuth()
    expect(isAuthenticated()).toBe(false)
  })

  it('isAuthenticated returns true when token is set', () => {
    localStorage.setItem(TOKEN_KEY, 'some-token')
    const { isAuthenticated } = useAuth()
    expect(isAuthenticated()).toBe(true)
  })

  it('saveSession stores all three values in localStorage', () => {
    const { saveSession } = useAuth()
    saveSession('tok', 'uid', 'Diana')
    expect(localStorage.getItem(TOKEN_KEY)).toBe('tok')
    expect(localStorage.getItem(USER_ID_KEY)).toBe('uid')
    expect(localStorage.getItem(USER_NAME_KEY)).toBe('Diana')
  })
})
