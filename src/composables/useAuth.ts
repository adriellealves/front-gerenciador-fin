import { useRouter } from 'vue-router'

const TOKEN_KEY = '@CoreFinancas:token'
const USER_ID_KEY = '@CoreFinancas:userId'
const USER_NAME_KEY = '@CoreFinancas:userName'

/**
 * Composable para gerenciar autenticação: login, logout e leitura de dados do usuário.
 */
export function useAuth() {
  const router = useRouter()

  const getToken = (): string | null => localStorage.getItem(TOKEN_KEY)

  const getUserId = (): string | null => localStorage.getItem(USER_ID_KEY)

  const getUserName = (): string => localStorage.getItem(USER_NAME_KEY) ?? 'Usuário'

  const isAuthenticated = (): boolean => !!getToken()

  const saveSession = (token: string, userId: string, name: string) => {
    localStorage.setItem(TOKEN_KEY, token)
    localStorage.setItem(USER_ID_KEY, userId)
    localStorage.setItem(USER_NAME_KEY, name)
  }

  const logout = () => {
    localStorage.clear()
    router.push('/login')
  }

  return { getToken, getUserId, getUserName, isAuthenticated, saveSession, logout }
}
