<script setup lang="ts">
import { useToast } from '../composables/useToast'

const { toasts, removeToast } = useToast()
</script>

<template>
  <Teleport to="body">
    <div class="toast-container" role="status" aria-live="polite" aria-atomic="false">
      <TransitionGroup name="toast">
        <div
          v-for="toast in toasts"
          :key="toast.id"
          class="toast"
          :class="toast.type"
          role="alert"
        >
          <span>{{ toast.message }}</span>
          <button class="toast-close" @click="removeToast(toast.id)" aria-label="Fechar notificação">×</button>
        </div>
      </TransitionGroup>
    </div>
  </Teleport>
</template>

<style scoped>
.toast-container {
  position: fixed;
  bottom: 1.5rem;
  right: 1.5rem;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  z-index: 9999;
  max-width: 380px;
  width: 100%;
}

.toast {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.9rem 1.2rem;
  border-radius: 8px;
  font-size: 0.95rem;
  font-weight: 500;
  color: #fff;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  gap: 0.75rem;
}

.toast.success { background-color: #2ed573; }
.toast.error   { background-color: #ff4757; }
.toast.info    { background-color: #3742fa; }

.toast-close {
  background: none;
  border: none;
  color: inherit;
  font-size: 1.3rem;
  line-height: 1;
  cursor: pointer;
  opacity: 0.8;
  padding: 0;
  flex-shrink: 0;
}

.toast-close:hover { opacity: 1; }

.toast-enter-active,
.toast-leave-active {
  transition: all 0.3s ease;
}

.toast-enter-from {
  opacity: 0;
  transform: translateX(100%);
}

.toast-leave-to {
  opacity: 0;
  transform: translateX(100%);
}
</style>
