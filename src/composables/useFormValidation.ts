import { ref } from 'vue'

export interface FieldErrors {
  [field: string]: string
}

/**
 * Composable reutilizável para validação de formulários com mensagens de erro inline.
 */
export function useFormValidation() {
  const errors = ref<FieldErrors>({})

  const clearErrors = () => {
    errors.value = {}
  }

  const setError = (field: string, message: string) => {
    errors.value[field] = message
  }

  const hasErrors = (): boolean => Object.keys(errors.value).length > 0

  const validateEmail = (email: string): boolean => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!email) {
      setError('email', 'E-mail é obrigatório.')
      return false
    }
    if (!re.test(email)) {
      setError('email', 'Informe um e-mail válido.')
      return false
    }
    return true
  }

  const validatePassword = (password: string, minLength = 6): boolean => {
    if (!password) {
      setError('password', 'Senha é obrigatória.')
      return false
    }
    if (password.length < minLength) {
      setError('password', `A senha deve ter no mínimo ${minLength} caracteres.`)
      return false
    }
    return true
  }

  const validatePasswordMatch = (password: string, confirm: string): boolean => {
    if (password !== confirm) {
      setError('confirmPassword', 'As senhas não coincidem.')
      return false
    }
    return true
  }

  const validatePositiveAmount = (amount: number | null): boolean => {
    if (amount === null || amount === undefined) {
      setError('amount', 'Valor é obrigatório.')
      return false
    }
    if (amount <= 0) {
      setError('amount', 'O valor deve ser maior que zero.')
      return false
    }
    return true
  }

  const validateRequired = (value: string, field: string, label: string): boolean => {
    if (!value || value.trim() === '') {
      setError(field, `${label} é obrigatório.`)
      return false
    }
    return true
  }

  return {
    errors,
    clearErrors,
    setError,
    hasErrors,
    validateEmail,
    validatePassword,
    validatePasswordMatch,
    validatePositiveAmount,
    validateRequired,
  }
}
