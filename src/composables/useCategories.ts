import { ref } from 'vue'
import { api } from '../services/api'
import type { Category, CategoryType, NewCategoryForm } from '../types'

/**
 * Composable para CRUD de categorias e construção da árvore hierárquica.
 */
export function useCategories(userId: string | null) {
  const categories = ref<Category[]>([])
  const isLoading = ref(false)

  const fetchCategories = async (): Promise<Category[]> => {
    if (!userId) return []
    isLoading.value = true
    try {
      const response = await api.get<Category[]>(`/categories/user/${userId}`)
      categories.value = response.data
      return response.data
    } finally {
      isLoading.value = false
    }
  }

  const buildTree = (type: CategoryType): Category[] => {
    const filtered = categories.value.filter(cat => cat.type === type)
    const byId = new Map<string, Category>()

    filtered.forEach(cat => {
      byId.set(cat.id, { ...cat, children: [] })
    })

    byId.forEach(cat => {
      if (cat.parentId && byId.has(cat.parentId)) {
        const parent = byId.get(cat.parentId)!
        parent.children = parent.children ?? []
        parent.children.push(cat)
      }
    })

    return Array.from(byId.values()).filter(
      cat => !cat.parentId || !byId.has(cat.parentId)
    )
  }

  const getAvailableParents = (type: CategoryType, excludeId?: string | null): Category[] =>
    categories.value.filter(cat => cat.type === type && cat.id !== excludeId)

  const createCategory = async (form: NewCategoryForm): Promise<void> => {
    const payload = {
      userId,
      ...form,
      parentId: form.parentId === '' ? null : form.parentId,
    }
    await api.post('/categories', payload)
  }

  const updateCategory = async (id: string, form: NewCategoryForm): Promise<void> => {
    const payload = {
      userId,
      ...form,
      parentId: form.parentId === '' ? null : form.parentId,
    }
    await api.put(`/categories/${id}`, payload)
  }

  const deleteCategory = async (id: string): Promise<void> => {
    await api.delete(`/categories/${id}`)
  }

  const defaultForm = (): NewCategoryForm => ({
    name: '',
    type: 'EXPENSE' as CategoryType,
    colorHex: '#ff4757',
    parentId: '',
  })

  return {
    categories,
    isLoading,
    fetchCategories,
    buildTree,
    getAvailableParents,
    createCategory,
    updateCategory,
    deleteCategory,
    defaultForm,
  }
}
