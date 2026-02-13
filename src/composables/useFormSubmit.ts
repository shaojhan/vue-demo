import { ref } from 'vue'
import { ApiError } from '@/api'

export function useFormSubmit<T = void>(handler: () => Promise<T>) {
  const loading = ref(false)
  const error = ref('')

  const submit = async (validate?: () => string | null): Promise<T | undefined> => {
    if (validate) {
      const msg = validate()
      if (msg) {
        error.value = msg
        return undefined
      }
    }

    loading.value = true
    error.value = ''

    try {
      const result = await handler()
      return result
    } catch (e) {
      if (e instanceof ApiError) {
        error.value = '操作失敗，請稍後再試'
      } else {
        error.value = '網路連線錯誤'
      }
      return undefined
    } finally {
      loading.value = false
    }
  }

  return { loading, error, submit }
}
