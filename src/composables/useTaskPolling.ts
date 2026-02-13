import { ref, computed, onUnmounted } from 'vue'
import { TaskService } from '@/api'
import type { TaskProgressInfo } from '@/api'

export function useTaskPolling(options?: { interval?: number }) {
  const interval = options?.interval ?? 1500

  const taskId = ref<string | null>(null)
  const status = ref('')
  const progress = ref<TaskProgressInfo | null>(null)
  const result = ref<any>(null)
  const error = ref('')

  let timerId: ReturnType<typeof setInterval> | null = null

  const isRunning = computed(() =>
    ['PENDING', 'STARTED', 'PROGRESS'].includes(status.value)
  )

  const stopPolling = () => {
    if (timerId !== null) {
      clearInterval(timerId)
      timerId = null
    }
  }

  const poll = async () => {
    if (!taskId.value) return

    try {
      const res = await TaskService.getTaskStatus(taskId.value)
      status.value = res.status
      progress.value = res.progress ?? null
      result.value = res.result ?? null
      error.value = res.error ?? ''

      if (!isRunning.value) {
        stopPolling()
      }
    } catch {
      error.value = '無法取得任務狀態'
      stopPolling()
    }
  }

  const start = (id: string) => {
    stopPolling()
    taskId.value = id
    status.value = 'PENDING'
    progress.value = null
    result.value = null
    error.value = ''
    poll()
    timerId = setInterval(poll, interval)
  }

  const cancel = async () => {
    if (!taskId.value) return
    try {
      await TaskService.cancelTask(taskId.value)
      status.value = 'REVOKED'
    } catch {
      // ignore
    }
    stopPolling()
  }

  const reset = () => {
    stopPolling()
    taskId.value = null
    status.value = ''
    progress.value = null
    result.value = null
    error.value = ''
  }

  onUnmounted(stopPolling)

  return { taskId, status, progress, result, error, isRunning, start, cancel, reset }
}
