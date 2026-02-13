import { ref } from 'vue'

export function useModal(onClose?: () => void) {
  const show = ref(false)

  const open = () => {
    show.value = true
  }

  const close = () => {
    show.value = false
    onClose?.()
  }

  return { show, open, close }
}
