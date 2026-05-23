<script setup lang="ts">
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import StatCard from '@/components/StatCard.vue'

const router = useRouter()
const authStore = useAuthStore()

const greeting = computed(() => authStore.user?.uid || '使用者')

// Placeholder metrics — wired to real APIs in a later phase.
const kpis = [
  { label: '待簽核', value: '—', hint: '今日新增', to: '/approvals' },
  { label: '進行中排程', value: '—', hint: '本週', to: '/schedules' },
  { label: '未讀訊息', value: '—', hint: '訊息中心', to: '/messages' }
]

// External system integration status (MES ↔ ERP / WMS / CRM).
const integrations = [
  { name: 'ERP', desc: '企業資源規劃', status: 'pending' },
  { name: 'WMS', desc: '倉儲管理系統', status: 'pending' },
  { name: 'CRM', desc: '客戶關係管理', status: 'pending' },
  { name: 'Kafka', desc: '事件匯流排', status: 'pending' }
] as const

const statusText: Record<string, string> = {
  online: '連線中',
  pending: '待設定',
  offline: '離線'
}
</script>

<template>
  <div class="dashboard">
    <header class="welcome">
      <h2>歡迎回來，{{ greeting }}</h2>
      <p>MES 製造執行平台總覽</p>
    </header>

    <section class="kpi-grid" aria-label="關鍵指標">
      <StatCard
        v-for="kpi in kpis"
        :key="kpi.label"
        :label="kpi.label"
        :value="kpi.value"
        :hint="kpi.hint"
        clickable
        @click="router.push(kpi.to)"
      />
    </section>

    <section class="integrations" aria-label="外部系統串接狀態">
      <h3 class="section-title">外部系統串接</h3>
      <div class="integration-grid">
        <div v-for="sys in integrations" :key="sys.name" class="integration-card">
          <div class="integration-head">
            <span class="integration-name">{{ sys.name }}</span>
            <span class="status" :class="`status-${sys.status}`">
              <span class="status-dot" aria-hidden="true"></span>
              {{ statusText[sys.status] }}
            </span>
          </div>
          <p class="integration-desc">{{ sys.desc }}</p>
        </div>
      </div>
    </section>
  </div>
</template>

<style scoped>
.dashboard {
  display: flex;
  flex-direction: column;
  gap: var(--space-6);
}

.welcome h2 {
  font-size: var(--text-xl);
  font-weight: var(--weight-bold);
  color: var(--color-foreground);
  margin: 0 0 var(--space-1);
}

.welcome p {
  font-size: var(--text-sm);
  color: var(--color-foreground-muted);
  margin: 0;
}

.section-title {
  font-size: var(--text-base);
  font-weight: var(--weight-semibold);
  color: var(--color-foreground);
  margin: 0 0 var(--space-4);
}

.kpi-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: var(--space-4);
}

.integration-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: var(--space-4);
}

.integration-card {
  padding: var(--space-4) var(--space-5);
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  box-shadow: var(--shadow-sm);
}

.integration-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: var(--space-2);
}

.integration-name {
  font-size: var(--text-base);
  font-weight: var(--weight-semibold);
  color: var(--color-foreground);
}

.integration-desc {
  font-size: var(--text-xs);
  color: var(--color-foreground-muted);
  margin: 0;
}

.status {
  display: inline-flex;
  align-items: center;
  gap: var(--space-1);
  font-size: var(--text-xs);
  font-weight: var(--weight-medium);
}

.status-dot {
  width: 8px;
  height: 8px;
  border-radius: var(--radius-full);
  background: currentColor;
}

.status-online {
  color: var(--color-success);
}

.status-pending {
  color: var(--color-warning);
}

.status-offline {
  color: var(--color-foreground-muted);
}
</style>
