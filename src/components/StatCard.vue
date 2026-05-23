<script setup lang="ts">
/**
 * KPI / metric card for dashboards and module overviews (Data-Dense Dashboard).
 * Shows a label, a prominent value (tabular figures), an optional hint, and an
 * optional trend. Renders as a button when `clickable`, otherwise a static card.
 */
withDefaults(
  defineProps<{
    label: string
    value: string | number
    hint?: string
    trend?: 'up' | 'down' | 'flat'
    trendValue?: string
    clickable?: boolean
  }>(),
  { clickable: false }
)

defineEmits<{ click: [] }>()
</script>

<template>
  <component
    :is="clickable ? 'button' : 'div'"
    :type="clickable ? 'button' : undefined"
    class="stat-card"
    :class="{ clickable }"
    @click="clickable && $emit('click')"
  >
    <span class="stat-label">{{ label }}</span>
    <span class="stat-value tabular-nums">{{ value }}</span>
    <span class="stat-footer">
      <span v-if="trend" class="stat-trend" :class="`trend-${trend}`">
        <span aria-hidden="true">{{ trend === 'up' ? '▲' : trend === 'down' ? '▼' : '—' }}</span>
        {{ trendValue }}
      </span>
      <span v-if="hint" class="stat-hint">{{ hint }}</span>
    </span>
  </component>
</template>

<style scoped>
.stat-card {
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
  padding: var(--space-5);
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-sm);
  text-align: left;
  font-family: inherit;
}

.stat-card.clickable {
  cursor: pointer;
  transition: box-shadow var(--duration-base) var(--ease-out),
    transform var(--duration-base) var(--ease-out);
}

.stat-card.clickable:hover {
  box-shadow: var(--shadow-md);
  transform: translateY(-2px);
}

.stat-label {
  font-size: var(--text-sm);
  color: var(--color-foreground-secondary);
}

.stat-value {
  font-size: var(--text-2xl);
  font-weight: var(--weight-bold);
  color: var(--color-primary);
  line-height: 1.1;
}

.stat-footer {
  display: flex;
  align-items: center;
  gap: var(--space-2);
}

.stat-trend {
  display: inline-flex;
  align-items: center;
  gap: var(--space-1);
  font-size: var(--text-xs);
  font-weight: var(--weight-medium);
}

.trend-up {
  color: var(--color-success);
}

.trend-down {
  color: var(--color-destructive);
}

.trend-flat {
  color: var(--color-foreground-muted);
}

.stat-hint {
  font-size: var(--text-xs);
  color: var(--color-foreground-muted);
}
</style>
