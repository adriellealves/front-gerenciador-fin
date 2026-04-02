import { describe, it, expect, beforeEach } from 'vitest'
import { useFormValidation } from '../composables/useFormValidation'

describe('useFormValidation', () => {
  let validation: ReturnType<typeof useFormValidation>

  beforeEach(() => {
    validation = useFormValidation()
  })

  describe('validateEmail', () => {
    it('returns true for a valid email', () => {
      expect(validation.validateEmail('user@example.com')).toBe(true)
    })

    it('returns false and sets error for empty email', () => {
      expect(validation.validateEmail('')).toBe(false)
      expect(validation.errors.value['email']).toBe('E-mail é obrigatório.')
    })

    it('returns false and sets error for invalid email format', () => {
      expect(validation.validateEmail('not-an-email')).toBe(false)
      expect(validation.errors.value['email']).toBe('Informe um e-mail válido.')
    })
  })

  describe('validatePassword', () => {
    it('returns true for a password meeting minimum length', () => {
      expect(validation.validatePassword('secret')).toBe(true)
    })

    it('returns false and sets error for empty password', () => {
      expect(validation.validatePassword('')).toBe(false)
      expect(validation.errors.value['password']).toBe('Senha é obrigatória.')
    })

    it('returns false and sets error for too-short password', () => {
      expect(validation.validatePassword('abc')).toBe(false)
      expect(validation.errors.value['password']).toContain('mínimo 6 caracteres')
    })
  })

  describe('validatePasswordMatch', () => {
    it('returns true when passwords match', () => {
      expect(validation.validatePasswordMatch('secret', 'secret')).toBe(true)
    })

    it('returns false and sets error when passwords do not match', () => {
      expect(validation.validatePasswordMatch('secret', 'other')).toBe(false)
      expect(validation.errors.value['confirmPassword']).toBe('As senhas não coincidem.')
    })
  })

  describe('validatePositiveAmount', () => {
    it('returns true for a positive amount', () => {
      expect(validation.validatePositiveAmount(10.5)).toBe(true)
    })

    it('returns false and sets error for null', () => {
      expect(validation.validatePositiveAmount(null)).toBe(false)
      expect(validation.errors.value['amount']).toBe('Valor é obrigatório.')
    })

    it('returns false and sets error for zero', () => {
      expect(validation.validatePositiveAmount(0)).toBe(false)
      expect(validation.errors.value['amount']).toBe('O valor deve ser maior que zero.')
    })

    it('returns false and sets error for negative amount', () => {
      expect(validation.validatePositiveAmount(-5)).toBe(false)
      expect(validation.errors.value['amount']).toBe('O valor deve ser maior que zero.')
    })
  })

  describe('validateRequired', () => {
    it('returns true for a non-empty value', () => {
      expect(validation.validateRequired('João', 'name', 'Nome')).toBe(true)
    })

    it('returns false and sets error for empty value', () => {
      expect(validation.validateRequired('', 'name', 'Nome')).toBe(false)
      expect(validation.errors.value['name']).toBe('Nome é obrigatório.')
    })

    it('returns false and sets error for whitespace-only value', () => {
      expect(validation.validateRequired('   ', 'name', 'Nome')).toBe(false)
    })
  })

  describe('clearErrors', () => {
    it('clears all existing errors', () => {
      validation.validateEmail('')
      validation.validatePassword('')
      expect(Object.keys(validation.errors.value).length).toBeGreaterThan(0)

      validation.clearErrors()
      expect(Object.keys(validation.errors.value).length).toBe(0)
    })
  })

  describe('hasErrors', () => {
    it('returns false when there are no errors', () => {
      expect(validation.hasErrors()).toBe(false)
    })

    it('returns true when there are errors', () => {
      validation.setError('email', 'test error')
      expect(validation.hasErrors()).toBe(true)
    })
  })
})
