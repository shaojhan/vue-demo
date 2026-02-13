<script setup lang="ts">
import { useRouter } from 'vue-router'
import { NResult, NButton } from 'naive-ui'

const router = useRouter()
</script>

<template>
  <div class="notfound-page">
    <NResult status="404" title="404" description="抱歉，您尋找的頁面不存在或已被移除">
      <template #footer>
        <NButton type="primary" @click="router.push('/')">返回首頁</NButton>
      </template>
    </NResult>
  </div>
</template>

<style scoped>
.notfound-page {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f8fafc;
  padding: 20px;
}
</style>
