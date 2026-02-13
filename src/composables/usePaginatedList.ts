import { ref, type Ref } from 'vue'

export interface PaginatedResponse<T> {
  items: T[]
  total: number
  page: number
}

export function usePaginatedList<T>(
  fetcher: (page: number) => Promise<PaginatedResponse<T>>,
  options?: { pageSize?: number }
) {
  const pageSize = options?.pageSize ?? 10
  const items: Ref<T[]> = ref([]) as Ref<T[]>
  const total = ref(0)
  const page = ref(1)
  const loading = ref(false)

  const fetch = async (p = 1) => {
    loading.value = true
    try {
      const res = await fetcher(p)
      items.value = res.items
      total.value = res.total
      page.value = res.page
    } catch {
      items.value = []
    } finally {
      loading.value = false
    }
  }

  const reset = () => {
    page.value = 1
    fetch()
  }

  return { items, total, page, pageSize, loading, fetch, reset }
}
