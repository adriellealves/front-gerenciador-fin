<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { api } from '../services/api'
import { useRouter } from 'vue-router'

const router = useRouter()
const USER_ID = 'f273b341-bd6b-4306-a004-155d2f2e6716' // 🚨 Mantenha o seu UUID aqui!

const categories = ref<any[]>([])

// NOVA VARIÁVEL: Guarda o ID da categoria que estamos a editar (null se for nova)
const editingId = ref<string | null>(null)

const newCategory = ref({
  name: '',
  type: 'EXPENSE',
  colorHex: '#ff4757',
  parentId: ''
})

const loadCategories = async () => {
  try {
    const response = await api.get(`/categories/user/${USER_ID}`)
    categories.value = response.data
  } catch (error) {
    console.error("Erro ao carregar categorias:", error)
  }
}

const availableParentCategories = computed(() => {
  // Filtra as categorias do mesmo tipo, e EVITA que a categoria seja pai de si mesma!
  return categories.value.filter(cat => cat.type === newCategory.value.type && cat.id !== editingId.value)
})

// FUNÇÃO ATUALIZADA: Serve tanto para Criar como para Editar
const saveCategory = async () => {
  try {
    const payload = {
      userId: USER_ID,
      name: newCategory.value.name,
      type: newCategory.value.type,
      colorHex: newCategory.value.colorHex,
      parentId: newCategory.value.parentId === '' ? null : newCategory.value.parentId 
    }

    if (editingId.value) {
      // Se temos um ID, fazemos PUT (Atualizar)
      await api.put(`/categories/${editingId.value}`, payload)
    } else {
      // Se não temos ID, fazemos POST (Criar)
      await api.post('/categories', payload)
    }
    
    cancelEdit() // Limpa o formulário
    await loadCategories()
  } catch (error) {
    console.error("Erro ao guardar categoria:", error)
    alert("Erro ao processar a categoria.")
  }
}

// NOVA FUNÇÃO: Prepara o formulário com os dados da categoria clicada
const startEdit = (category: any) => {
  editingId.value = category.id
  newCategory.value = {
    name: category.name,
    type: category.type,
    colorHex: category.colorHex || '#ff4757',
    parentId: category.parentId || ''
  }
  window.scrollTo(0, 0) // Sobe a página para o utilizador ver o formulário
}

// NOVA FUNÇÃO: Limpa o formulário e sai do modo de edição
const cancelEdit = () => {
  editingId.value = null
  newCategory.value = { name: '', type: 'EXPENSE', colorHex: '#ff4757', parentId: '' }
}

// NOVA FUNÇÃO: Excluir categoria com confirmação
const deleteCategory = async (id: string) => {
  // O window.confirm cria aquela caixinha nativa do navegador perguntando "Tem certeza?"
  const confirmed = window.confirm("Tem certeza de que deseja excluir esta categoria? Esta ação não pode ser desfeita.")
  
  if (!confirmed) return // Se o utilizador clicar em Cancelar, paramos aqui.

  try {
    await api.delete(`/categories/${id}`)
    
    // Se estávamos a editar a categoria que acabou de ser apagada, limpamos o formulário
    if (editingId.value === id) {
      cancelEdit()
    }
    
    // Atualiza a lista na tela
    await loadCategories()
  } catch (error: any) {
    console.error("Erro ao excluir categoria:", error)
    // Se o backend retornar erro (provavelmente por violação de Foreign Key)
    alert("Não foi possível excluir a categoria. Verifique se ela não possui transações ou subcategorias vinculadas a ela.")
  }
}

onMounted(() => {
  loadCategories()
})
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
      <section class="create-section">
        <h2>{{ editingId ? '✏️ Editar Categoria' : 'Nova Categoria' }}</h2>
        <form @submit.prevent="saveCategory" class="category-form">
          <div class="form-group">
            <label>Nome (ex: Moradia, Salário...)</label>
            <input type="text" v-model="newCategory.name" required />
          </div>
          
          <div class="form-group row">
            <div class="col">
              <label>Tipo</label>
              <select v-model="newCategory.type" required :disabled="editingId !== null">
                <option value="EXPENSE">Despesa</option>
                <option value="INCOME">Receita</option>
              </select>
            </div>
            <div class="col">
              <label>Cor</label>
              <input type="color" v-model="newCategory.colorHex" class="color-picker" />
            </div>
          </div>

          <div class="form-group">
            <label>Categoria Pai (Opcional)</label>
            <select v-model="newCategory.parentId">
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

      <section class="list-section">
        <h2>As Minhas Categorias</h2>
        <div v-if="categories.length === 0" class="empty-state">
          Não tem categorias registadas.
        </div>
        <div class="categories-grid" v-else>
          <div v-for="category in categories" :key="category.id" class="category-card" :style="{ borderLeftColor: category.colorHex }">
            <div class="cat-header">
              <div class="color-dot" :style="{ backgroundColor: category.colorHex }"></div>
              <h3>{{ category.name }}</h3>
            </div>
            <div class="cat-details">
              <span class="badge" :class="category.type.toLowerCase()">{{ category.type }}</span>
              <span v-if="category.parentId" class="sub-badge">Subcategoria</span>
            </div>
            <div class="card-actions">
              <button class="btn-edit" @click="startEdit(category)">✏️ Editar</button>
              <button class="btn-delete" @click="deleteCategory(category.id)">🗑️ Excluir</button>
            </div>
          </div>
        </div>
      </section>
    </div>
  </div>
</template>

<style scoped>
/* Aproveitamos muito do CSS da tela de contas para manter a consistência visual */
.categories-container { max-width: 1000px; margin: 0 auto; padding: 2rem; font-family: sans-serif; }
.header { display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid #eee; padding-bottom: 1rem; margin-bottom: 2rem; }
.btn-back { background: #f1f2f6; border: none; padding: 0.75rem 1.5rem; border-radius: 6px; cursor: pointer; font-weight: bold; }
.btn-back:hover { background: #dfe4ea; }

.main-content { display: grid; grid-template-columns: 1fr 2fr; gap: 2rem; }
@media (max-width: 768px) { .main-content { grid-template-columns: 1fr; } }

.create-section { background: white; padding: 1.5rem; border-radius: 12px; border: 1px solid #eaeaea; box-shadow: 0 4px 6px rgba(0,0,0,0.02); height: fit-content; }
.category-form { display: flex; flex-direction: column; gap: 1rem; }
.form-group { display: flex; flex-direction: column; gap: 0.5rem; }
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
.sub-badge { font-size: 0.7rem; padding: 0.2rem 0.4rem; border-radius: 4px; background: #dfe6e9; color: #636e72; }
.empty-state { color: #747d8c; font-style: italic; }
.form-actions { display: flex; gap: 1rem; margin-top: 1rem; }
.btn-cancel { background: #f1f2f6; color: #333; border: none; padding: 0.75rem; border-radius: 6px; cursor: pointer; font-weight: bold; flex: 1; }
.btn-save { flex: 2; } /* O botão de guardar ocupa mais espaço */
/* Adicione estas classes no final do seu <style scoped> */
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
</style>