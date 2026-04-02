import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import TransactionModal from '../components/TransactionModal.vue'
import type { Account, Category } from '../types'

const accounts: Account[] = [
  { id: 'acc1', userId: 'u1', name: 'Nubank', type: 'CHECKING', balance: 1000 },
]

const categories: Category[] = [
  { id: 'cat1', userId: 'u1', name: 'Alimentação', type: 'EXPENSE', colorHex: '#ff4757', parentId: null },
]

describe('TransactionModal', () => {
  it('does not render when isOpen is false', () => {
    const wrapper = mount(TransactionModal, {
      props: { isOpen: false, type: 'expense', accounts, categories },
    })
    expect(wrapper.find('.modal-overlay').exists()).toBe(false)
  })

  it('renders modal when isOpen is true', () => {
    const wrapper = mount(TransactionModal, {
      props: { isOpen: true, type: 'expense', accounts, categories },
    })
    expect(wrapper.find('.modal-overlay').exists()).toBe(true)
  })

  it('shows "Nova Despesa" title for expense type', () => {
    const wrapper = mount(TransactionModal, {
      props: { isOpen: true, type: 'expense', accounts, categories },
    })
    expect(wrapper.find('h2').text()).toBe('Nova Despesa')
  })

  it('shows "Nova Receita" title for income type', () => {
    const wrapper = mount(TransactionModal, {
      props: { isOpen: true, type: 'income', accounts, categories },
    })
    expect(wrapper.find('h2').text()).toBe('Nova Receita')
  })

  it('emits close when cancel button is clicked', async () => {
    const wrapper = mount(TransactionModal, {
      props: { isOpen: true, type: 'expense', accounts, categories },
    })
    await wrapper.find('.btn-cancel').trigger('click')
    expect(wrapper.emitted('close')).toBeTruthy()
  })

  it('shows validation errors when form is submitted empty', async () => {
    const wrapper = mount(TransactionModal, {
      props: { isOpen: true, type: 'expense', accounts, categories },
    })
    await wrapper.find('form').trigger('submit')
    const errors = wrapper.findAll('.field-error')
    expect(errors.length).toBeGreaterThan(0)
  })

  it('emits save with correct data when form is filled and submitted', async () => {
    const wrapper = mount(TransactionModal, {
      props: { isOpen: true, type: 'expense', accounts, categories },
    })

    await wrapper.find('#t-description').setValue('Conta de luz')
    await wrapper.find('#t-amount').setValue('150')
    await wrapper.find('#t-date').setValue('2026-04-01')
    await wrapper.find('#t-account').setValue('acc1')
    await wrapper.find('#t-category').setValue('cat1')

    await wrapper.find('form').trigger('submit')

    const saveEvents = wrapper.emitted('save')
    expect(saveEvents).toBeTruthy()
    expect(saveEvents![0][0]).toMatchObject({
      description: 'Conta de luz',
      date: '2026-04-01',
      accountId: 'acc1',
      categoryId: 'cat1',
      type: 'EXPENSE',
    })
  })
})
