import { ref } from 'vue'

export type ToastType = 'success' | 'error' | 'info'

export interface Toast {
  id: number
  message: string
  type: ToastType
}

const toasts = ref<Toast[]>([])
let nextId = 0

/**
 * Composable global para exibir notificações toast.
 * Usar no componente ToastNotification para renderizar e em qualquer lugar para disparar.
 */
export function useToast() {
  const showToast = (message: string, type: ToastType = 'info', duration = 3500) => {
    const id = ++nextId
    toasts.value.push({ id, message, type })

    setTimeout(() => {
      removeToast(id)
    }, duration)
  }

  const removeToast = (id: number) => {
    toasts.value = toasts.value.filter(t => t.id !== id)
  }

  return { toasts, showToast, removeToast }
}
