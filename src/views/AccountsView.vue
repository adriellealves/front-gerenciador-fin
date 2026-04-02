<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuth } from '../composables/useAuth'
import { useAccounts } from '../composables/useAccounts'
import { useToast } from '../composables/useToast'
import type { NewAccountForm, AccountType } from '../types'

const router = useRouter()
const { getUserId } = useAuth()
const { showToast } = useToast()

const userId = getUserId()
const { accounts, fetchAccounts, createAccount, updateAccount, inactivateAccount, formatCurrency, defaultForm } = useAccounts(userId)

const editingId = ref<string | null>(null)
const newAccount = ref<NewAccountForm>(defaultForm())

const loadAccounts = async () => {
  try {
    await fetchAccounts()
  } catch {
    showToast('Erro ao carregar as contas.', 'error')
  }
}

const saveAccount = async () => {
  try {
    if (editingId.value) {
      await updateAccount(editingId.value, newAccount.value)
      showToast('Conta atualizada com sucesso!', 'success')
    } else {
      await createAccount(newAccount.value)
      showToast('Conta criada com sucesso!', 'success')
    }
    cancelEdit()
    await loadAccounts()
  } catch {
    showToast('Erro ao processar a conta. Tente novamente.', 'error')
  }
}

const startEdit = (account: { id: string; name: string; type: AccountType; balance: number }) => {
  editingId.value = account.id
  newAccount.value = { name: account.name, type: account.type, balance: account.balance }
  window.scrollTo(0, 0)
}

const cancelEdit = () => {
  editingId.value = null
  newAccount.value = defaultForm()
}

const handleInactivate = async (id: string) => {
  const confirmed = window.confirm(
    'Deseja realmente inativar esta conta? Ela deixará de estar disponível para novas transações, mas o histórico será mantido.'
  )
  if (!confirmed) return

  try {
    await inactivateAccount(id)
    showToast('Conta inativada com sucesso.', 'success')
    await loadAccounts()
  } catch {
    showToast('Não foi possível inativar a conta.', 'error')
  }
}

onMounted(loadAccounts)
</script>

<template>
  <div class="accounts-container">
    <header class="header">
      <div>
        <h1>Gestão de Contas 🏦</h1>
        <p>Adicione ou visualize as suas contas bancárias.</p>
      </div>
      <button class="btn-back" @click="router.push('/')">Voltar ao Dashboard</button>
    </header>

    <div class="main-content">
      <section class="create-section" aria-label="Formulário de conta">
        <h2>{{ editingId ? '✏️ Editar Conta' : 'Nova Conta' }}</h2>
        <form @submit.prevent="saveAccount" class="account-form">
          <div class="form-group">
            <label for="acc-name">Nome da Instituição (ex: Nubank, Banco CTT)</label>
            <input id="acc-name" type="text" v-model="newAccount.name" required />
          </div>

          <div class="form-group">
            <label for="acc-type">Tipo de Conta</label>
            <select id="acc-type" v-model="newAccount.type" required>
              <option value="CREDIT_CARD">Cartão de Crédito</option>
              <option value="CASH">Carteira</option>
              <option value="CHECKING">Conta Corrente</option>
              <option value="SAVINGS">Conta Poupança</option>
              <option value="INVESTMENT">Investimento</option>
            </select>
          </div>

          <div class="form-group">
            <label for="acc-balance">Saldo Atual (R$)</label>
            <input id="acc-balance" type="number" step="0.01" v-model="newAccount.balance" required />
            <small v-if="editingId" class="hint">⚠️ Dica: Prefira ajustar o saldo via transações.</small>
          </div>

          <div class="form-row">
            <button type="button" v-if="editingId" class="btn-cancel" @click="cancelEdit">Cancelar</button>
            <button type="submit" class="btn-save">{{ editingId ? 'Atualizar Conta' : 'Criar Conta' }}</button>
          </div>
        </form>
      </section>

      <section class="list-section" aria-label="Lista de contas">
        <h2>As Minhas Contas</h2>
        <div v-if="accounts.length === 0" class="empty-state">
          <p>Não tem contas registadas.</p>
          <small>Use o formulário ao lado para criar a sua primeira conta.</small>
        </div>
        <div class="accounts-grid" v-else role="list">
          <div v-for="account in accounts" :key="account.id" class="account-card" role="listitem">
            <div class="account-info">
              <h3>{{ account.name }}</h3>
              <span class="badge" :aria-label="`Tipo: ${account.type}`">{{ account.type }}</span>
            </div>
            <div class="account-balance" :aria-label="`Saldo: ${formatCurrency(account.balance)}`">
              {{ formatCurrency(account.balance) }}
            </div>
            <div class="card-actions">
              <button @click="startEdit(account)" class="btn-edit" aria-label="Editar conta">✏️ Editar</button>
              <button @click="handleInactivate(account.id)" class="btn-inactivate" aria-label="Inativar conta">⏸️ Inativar</button>
            </div>
          </div>
        </div>
      </section>
    </div>
  </div>
</template>

<style scoped>
.accounts-container { max-width: 1000px; margin: 0 auto; padding: 2rem; font-family: sans-serif; }
.header { display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid #eee; padding-bottom: 1rem; margin-bottom: 2rem; }
.btn-back { background: #f1f2f6; border: none; padding: 0.75rem 1.5rem; border-radius: 6px; cursor: pointer; font-weight: bold; }
.btn-back:hover { background: #dfe4ea; }

.main-content { display: grid; grid-template-columns: 1fr 2fr; gap: 2rem; }
@media (max-width: 768px) { .main-content { grid-template-columns: 1fr; } }

.create-section { background: white; padding: 1.5rem; border-radius: 12px; border: 1px solid #eaeaea; box-shadow: 0 4px 6px rgba(0,0,0,0.02); height: fit-content; }
.account-form { display: flex; flex-direction: column; gap: 1rem; }
.form-group { display: flex; flex-direction: column; gap: 0.5rem; }
.form-group label { font-weight: bold; color: #57606f; font-size: 0.9rem; }
input, select { padding: 0.75rem; border: 1px solid #ddd; border-radius: 6px; }
.hint { color: #e67e22; font-size: 0.85rem; }
.form-row { display: flex; gap: 1rem; margin-top: 1rem; }
.btn-cancel { flex: 1; background: #f1f2f6; border: none; border-radius: 6px; cursor: pointer; padding: 0.75rem; }
.btn-save { flex: 2; background: #3742fa; color: white; border: none; padding: 0.75rem; border-radius: 6px; cursor: pointer; font-weight: bold; }
.btn-save:hover { background: #2f3542; }

.accounts-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(250px, 1fr)); gap: 1rem; }
.account-card { background: white; padding: 1.5rem; border-radius: 12px; border: 1px solid #eaeaea; display: flex; flex-direction: column; gap: 1rem; }
.account-info h3 { margin: 0; font-size: 1.1rem; }
.badge { display: inline-block; background: #eccc68; color: #2f3542; font-size: 0.75rem; padding: 0.2rem 0.5rem; border-radius: 4px; font-weight: bold; width: fit-content; margin-top: 0.5rem; }
.account-balance { font-size: 1.5rem; font-weight: bold; color: #2ed573; }
.empty-state { color: #747d8c; font-style: italic; }
.card-actions { display: flex; gap: 0.5rem; border-top: 1px solid #eee; padding-top: 0.5rem; }
.btn-edit, .btn-inactivate { flex: 1; background: none; padding: 0.4rem; border-radius: 4px; cursor: pointer; font-size: 0.85rem; }
.btn-edit { border: 1px solid #ddd; color: #555; }
.btn-edit:hover { background: #f8f9fa; }
.btn-inactivate { border: 1px solid #f1c40f; color: #f39c12; }
.btn-inactivate:hover { background: #fef9e7; }
</style>