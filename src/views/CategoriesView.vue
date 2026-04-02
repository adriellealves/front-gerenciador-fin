<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useAuth } from '../composables/useAuth'
import { useCategories } from '../composables/useCategories'
import { useToast } from '../composables/useToast'
import type { NewCategoryForm, CategoryType } from '../types'

const router = useRouter()
const { getUserId } = useAuth()
const { showToast } = useToast()

const userId = getUserId()
const {
  categories,
  fetchCategories,
  buildTree,
  getAvailableParents,
  createCategory,
  updateCategory,
  deleteCategory,
  defaultForm,
} = useCategories(userId)

const editingId = ref<string | null>(null)
const newCategory = ref<NewCategoryForm>(defaultForm())

const expenseCategoriesTree = computed(() => buildTree('EXPENSE'))
const incomeCategoriesTree = computed(() => buildTree('INCOME'))
const availableParentCategories = computed(() =>
  getAvailableParents(newCategory.value.type as CategoryType, editingId.value)
)

const loadCategories = async () => {
  try {
    await fetchCategories()
  } catch {
    showToast('Erro ao carregar categorias.', 'error')
  }
}

const saveCategory = async () => {
  try {
    if (editingId.value) {
      await updateCategory(editingId.value, newCategory.value)
      showToast('Categoria atualizada com sucesso!', 'success')
    } else {
      await createCategory(newCategory.value)
      showToast('Categoria criada com sucesso!', 'success')
    }
    cancelEdit()
    await loadCategories()
  } catch {
    showToast('Erro ao processar a categoria. Tente novamente.', 'error')
  }
}

const startEdit = (category: { id: string; name: string; type: CategoryType; colorHex: string; parentId: string | null }) => {
  editingId.value = category.id
  newCategory.value = {
    name: category.name,
    type: category.type,
    colorHex: category.colorHex || '#ff4757',
    parentId: category.parentId || '',
  }
  window.scrollTo(0, 0)
}

const cancelEdit = () => {
  editingId.value = null
  newCategory.value = defaultForm()
}

const handleDeleteCategory = async (id: string) => {
  const confirmed = window.confirm('Tem certeza de que deseja excluir esta categoria? Esta ação não pode ser desfeita.')
  if (!confirmed) return

  try {
    await deleteCategory(id)
    if (editingId.value === id) cancelEdit()
    showToast('Categoria excluída com sucesso.', 'success')
    await loadCategories()
  } catch {
    showToast('Não foi possível excluir a categoria. Verifique se ela não possui transações ou subcategorias vinculadas.', 'error')
  }
}

onMounted(loadCategories)
</script>

<template>
  <div class="categories-container">
    <header class="header">
      <div>
        <h1>Gestão de Categorias 🏷️</h1>
        <p>Organize as suas finanças por tags e cores.</p>
      </div>
      <button class="btn-back" @click="router.push('/')">Voltar ao Dashboard</button>
    </header>

    <div class="main-content">
      <section class="create-section" aria-label="Formulário de categoria">
        <h2>{{ editingId ? '✏️ Editar Categoria' : 'Nova Categoria' }}</h2>
        <form @submit.prevent="saveCategory" class="category-form">
          <div class="form-group">
            <label for="cat-name">Nome (ex: Moradia, Salário...)</label>
            <input id="cat-name" type="text" v-model="newCategory.name" required />
          </div>

          <div class="form-group row">
            <div class="col">
              <label for="cat-type">Tipo</label>
              <select id="cat-type" v-model="newCategory.type" required :disabled="editingId !== null">
                <option value="EXPENSE">Despesa</option>
                <option value="INCOME">Receita</option>
              </select>
            </div>
            <div class="col">
              <label for="cat-color">Cor</label>
              <input id="cat-color" type="color" v-model="newCategory.colorHex" class="color-picker" aria-label="Selecionar cor da categoria" />
            </div>
          </div>

          <div class="form-group">
            <label for="cat-parent">Categoria Pai (Opcional)</label>
            <select id="cat-parent" v-model="newCategory.parentId">
              <option value="">Nenhuma (Categoria Principal)</option>
              <option v-for="parent in availableParentCategories" :key="parent.id" :value="parent.id">
                {{ parent.name }}
              </option>
            </select>
          </div>

          <div class="form-actions">
            <button type="button" v-if="editingId" class="btn-cancel" @click="cancelEdit">Cancelar</button>
            <button type="submit" class="btn-save">{{ editingId ? 'Atualizar Categoria' : 'Criar Categoria' }}</button>
          </div>
        </form>
      </section>

      <section class="list-section" aria-label="Lista de categorias">
        <h2>As Minhas Categorias</h2>
        <div v-if="categories.length === 0" class="empty-state">
          <p>Não tem categorias registadas.</p>
          <small>Use o formulário ao lado para criar a sua primeira categoria.</small>
        </div>
        <div v-else class="categories-columns">
          <div class="categories-group">
            <h3 class="group-title">Despesas</h3>
            <div v-if="expenseCategoriesTree.length === 0" class="empty-sub">Sem categorias de despesa.</div>
            <div v-else class="categories-grid">
              <div
                v-for="category in expenseCategoriesTree"
                :key="category.id"
                class="category-card"
                :style="{ borderLeftColor: category.colorHex }"
              >
                <div class="cat-header">
                  <div class="color-dot" :style="{ backgroundColor: category.colorHex }" :aria-label="`Cor: ${category.colorHex}`"></div>
                  <h3>{{ category.name }}</h3>
                </div>
                <div class="cat-details">
                  <span class="badge expense">EXPENSE</span>
                  <span class="main-badge">Categoria principal</span>
                </div>

                <div v-if="category.children && category.children.length" class="subcategories-list">
                  <h4>Subcategorias</h4>
                  <ul>
                    <li v-for="sub in category.children" :key="sub.id" class="sub-item">
                      <div class="sub-info">
                        <span class="sub-color-dot" :style="{ backgroundColor: sub.colorHex }"></span>
                        <span class="sub-name">{{ sub.name }}</span>
                      </div>
                      <div class="sub-actions">
                        <button class="btn-edit small" @click="startEdit(sub)" :aria-label="`Editar subcategoria ${sub.name}`">✏️</button>
                        <button class="btn-delete small" @click="handleDeleteCategory(sub.id)" :aria-label="`Excluir subcategoria ${sub.name}`">🗑️</button>
                      </div>
                    </li>
                  </ul>
                </div>

                <div class="card-actions">
                  <button class="btn-edit" @click="startEdit(category)" :aria-label="`Editar categoria ${category.name}`">✏️ Editar</button>
                  <button class="btn-delete" @click="handleDeleteCategory(category.id)" :aria-label="`Excluir categoria ${category.name}`">🗑️ Excluir</button>
                </div>
              </div>
            </div>
          </div>

          <div class="categories-group">
            <h3 class="group-title">Receitas</h3>
            <div v-if="incomeCategoriesTree.length === 0" class="empty-sub">Sem categorias de receita.</div>
            <div v-else class="categories-grid">
              <div
                v-for="category in incomeCategoriesTree"
                :key="category.id"
                class="category-card"
                :style="{ borderLeftColor: category.colorHex }"
              >
                <div class="cat-header">
                  <div class="color-dot" :style="{ backgroundColor: category.colorHex }"></div>
                  <h3>{{ category.name }}</h3>
                </div>
                <div class="cat-details">
                  <span class="badge income">INCOME</span>
                  <span class="main-badge">Categoria principal</span>
                </div>

                <div v-if="category.children && category.children.length" class="subcategories-list">
                  <h4>Subcategorias</h4>
                  <ul>
                    <li v-for="sub in category.children" :key="sub.id" class="sub-item">
                      <div class="sub-info">
                        <span class="sub-color-dot" :style="{ backgroundColor: sub.colorHex }"></span>
                        <span class="sub-name">{{ sub.name }}</span>
                      </div>
                      <div class="sub-actions">
                        <button class="btn-edit small" @click="startEdit(sub)" :aria-label="`Editar subcategoria ${sub.name}`">✏️</button>
                        <button class="btn-delete small" @click="handleDeleteCategory(sub.id)" :aria-label="`Excluir subcategoria ${sub.name}`">🗑️</button>
                      </div>
                    </li>
                  </ul>
                </div>

                <div class="card-actions">
                  <button class="btn-edit" @click="startEdit(category)" :aria-label="`Editar categoria ${category.name}`">✏️ Editar</button>
                  <button class="btn-delete" @click="handleDeleteCategory(category.id)" :aria-label="`Excluir categoria ${category.name}`">🗑️ Excluir</button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  </div>
</template>

<style scoped>
.categories-container { max-width: 1000px; margin: 0 auto; padding: 2rem; font-family: sans-serif; }
.header { display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid #eee; padding-bottom: 1rem; margin-bottom: 2rem; }
.btn-back { background: #f1f2f6; border: none; padding: 0.75rem 1.5rem; border-radius: 6px; cursor: pointer; font-weight: bold; }
.btn-back:hover { background: #dfe4ea; }

.main-content { display: grid; grid-template-columns: 1fr 2fr; gap: 2rem; }
@media (max-width: 768px) { .main-content { grid-template-columns: 1fr; } }

.create-section { background: white; padding: 1.5rem; border-radius: 12px; border: 1px solid #eaeaea; box-shadow: 0 4px 6px rgba(0,0,0,0.02); height: fit-content; }
.category-form { display: flex; flex-direction: column; gap: 1rem; }
.form-group { display: flex; flex-direction: column; gap: 0.5rem; }
.form-group label { font-weight: bold; color: #57606f; font-size: 0.9rem; }
.row { display: flex; gap: 1rem; }
.col { flex: 1; display: flex; flex-direction: column; gap: 0.5rem; }
input, select { padding: 0.75rem; border: 1px solid #ddd; border-radius: 6px; }
.color-picker { padding: 0.2rem; height: 45px; width: 100%; cursor: pointer; }

.btn-save { background: #ffa502; color: white; border: none; padding: 0.75rem; border-radius: 6px; cursor: pointer; font-weight: bold; margin-top: 1rem; }
.btn-save:hover { background: #eccc68; }

.categories-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)); gap: 1rem; }
.category-card { background: white; padding: 1rem; border-radius: 8px; border: 1px solid #eaeaea; border-left-width: 5px; border-left-style: solid; display: flex; flex-direction: column; gap: 0.5rem; box-shadow: 0 2px 4px rgba(0,0,0,0.02); }
.cat-header { display: flex; align-items: center; gap: 0.5rem; }
.color-dot { width: 12px; height: 12px; border-radius: 50%; }
.cat-header h3 { margin: 0; font-size: 1rem; color: #333; }
.cat-details { display: flex; gap: 0.5rem; margin-top: 0.5rem; }
.badge { font-size: 0.7rem; padding: 0.2rem 0.4rem; border-radius: 4px; font-weight: bold; }
.expense { background: #ffeaa7; color: #d63031; }
.income { background: #55efc4; color: #00b894; }
.empty-state { color: #747d8c; font-style: italic; }
.form-actions { display: flex; gap: 1rem; margin-top: 1rem; }
.btn-cancel { background: #f1f2f6; color: #333; border: none; padding: 0.75rem; border-radius: 6px; cursor: pointer; font-weight: bold; flex: 1; }
.btn-save { flex: 2; }
.card-actions {
  display: flex;
  gap: 0.5rem;
  margin-top: 1rem;
  border-top: 1px solid #eee;
  padding-top: 0.5rem;
}

.btn-edit, .btn-delete {
  flex: 1;
  background: none;
  border: 1px solid #ddd;
  padding: 0.4rem;
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.85rem;
  transition: 0.2s;
}

.btn-edit { color: #555; }
.btn-edit:hover { background: #f8f9fa; border-color: #bbb; }

.btn-delete { color: #e74c3c; border-color: #fadbd8; }
.btn-delete:hover { background: #fdedec; border-color: #e74c3c; }

.categories-columns {
  display: flex;
  gap: 1.5rem;
  align-items: flex-start;
}

.categories-group {
  flex: 1;
}

.group-title {
  margin: 0 0 0.75rem 0;
  font-size: 1.1rem;
}

.empty-sub {
  font-size: 0.9rem;
  color: #747d8c;
  font-style: italic;
}

.main-badge {
  font-size: 0.7rem;
  padding: 0.2rem 0.4rem;
  border-radius: 4px;
  background: #f1f2f6;
  color: #2f3542;
}

.subcategories-list {
  margin-top: 0.75rem;
  border-top: 1px dashed #ecf0f1;
  padding-top: 0.5rem;
}

.subcategories-list h4 {
  margin: 0 0 0.4rem 0;
  font-size: 0.8rem;
  color: #636e72;
}

.subcategories-list ul {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 0.3rem;
}

.sub-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 0.85rem;
}

.sub-info {
  display: flex;
  align-items: center;
  gap: 0.3rem;
}

.sub-color-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
}

.sub-actions {
  display: flex;
  gap: 0.25rem;
}

.btn-edit.small,
.btn-delete.small {
  padding: 0.2rem 0.35rem;
  font-size: 0.7rem;
}

@media (max-width: 768px) {
  .categories-columns {
    flex-direction: column;
  }
}
</style>