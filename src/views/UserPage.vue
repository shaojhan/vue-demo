<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { UserService, ApiError } from '@/api'
import type { CurrentUserResponse } from '@/api'
import {
  NButton, NCard, NTag, NSpin, NSpace, NAlert,
  NDescriptions, NDescriptionsItem
} from 'naive-ui'
import { useLogout } from '@/composables/useLogout'
import {
  resolveAvatarUrl,
  roleTagType as resolveRoleTagType,
  roleLabel,
  validateAvatarFile,
  avatarUploadErrorMessage,
  AVATAR_NETWORK_ERROR_MESSAGE,
} from '@/views/user.logic'
import PageLayout from '@/components/PageLayout.vue'
import LoadingState from '@/components/LoadingState.vue'

const router = useRouter()
const authStore = useAuthStore()
const { logout: handleLogout } = useLogout()

const currentUser = ref<CurrentUserResponse | null>(null)
const isLoading = ref(true)

// 頭像上傳
const avatarInput = ref<HTMLInputElement | null>(null)
const isUploading = ref(false)
const uploadError = ref('')
const uploadSuccess = ref(false)
const avatarCacheKey = ref(Date.now())

// 計算完整頭像 URL（統一走 UserService.getAvatar 的端點，附加 cache-busting）
const avatarUrl = computed(() => resolveAvatarUrl(currentUser.value?.profile?.avatar, avatarCacheKey.value))

const roleTagType = computed(() => resolveRoleTagType(currentUser.value?.role))

const fetchUser = async () => {
  try {
    currentUser.value = await UserService.getCurrentUser()
  } catch (error) {
    if (error instanceof ApiError && error.status === 401) {
      handleLogout()
    }
  } finally {
    isLoading.value = false
  }
}

onMounted(fetchUser)

// 點擊頭像觸發檔案選擇
const triggerAvatarUpload = () => {
  avatarInput.value?.click()
}

// 處理頭像上傳
const handleAvatarChange = async (event: Event) => {
  const input = event.target as HTMLInputElement
  const file = input.files?.[0]
  if (!file) return

  const validationError = validateAvatarFile(file)
  if (validationError) {
    uploadError.value = validationError
    uploadSuccess.value = false
    return
  }

  isUploading.value = true
  uploadError.value = ''
  uploadSuccess.value = false

  try {
    await UserService.uploadAvatar({ file })
    avatarCacheKey.value = Date.now()
    await fetchUser()
    uploadSuccess.value = true
  } catch (error) {
    if (error instanceof ApiError) {
      const detail = typeof error.body?.detail === 'string' ? error.body.detail : null
      uploadError.value = avatarUploadErrorMessage(error.status, detail)
    } else {
      uploadError.value = AVATAR_NETWORK_ERROR_MESSAGE
    }
  } finally {
    isUploading.value = false
    input.value = ''
  }
}
</script>

<template>
  <PageLayout max-width="720px">
    <LoadingState v-if="isLoading" />

    <template v-else>
      <div class="welcome-section">
        <div class="avatar-wrapper">
          <div class="avatar-container" :class="{ clickable: !isUploading }" @click="triggerAvatarUpload">
            <NSpin :show="isUploading" size="small">
              <div class="avatar-circle" :style="{ cursor: isUploading ? 'default' : 'pointer' }">
                <img v-if="avatarUrl" :key="avatarUrl" :src="avatarUrl" alt="" />
                <span v-else>{{ (currentUser?.profile?.name || currentUser?.uid || '?').charAt(0).toUpperCase() }}</span>
              </div>
            </NSpin>
          </div>
          <input
            ref="avatarInput"
            type="file"
            accept="image/jpeg,image/jpg,image/png,image/gif,image/webp"
            style="display: none;"
            @change="handleAvatarChange"
          />
          <NAlert v-if="uploadSuccess" type="success" :bordered="false" style="margin-top: 8px;">
            頭像已更新成功
          </NAlert>
          <NAlert v-else-if="uploadError" type="error" :bordered="false" style="margin-top: 8px;">
            {{ uploadError }}
          </NAlert>
        </div>
        <h1>歡迎回來，{{ currentUser?.profile?.name || currentUser?.uid }}</h1>
        <p class="welcome-sub">這是您的個人資訊頁面</p>
      </div>

      <NCard>
        <NDescriptions label-placement="left" bordered :column="1">
          <NDescriptionsItem label="帳號">
            {{ currentUser?.uid }}
          </NDescriptionsItem>
          <NDescriptionsItem v-if="currentUser?.profile?.name" label="姓名">
            {{ currentUser.profile.name }}
          </NDescriptionsItem>
          <NDescriptionsItem label="電子郵件">
            {{ currentUser?.email }}
          </NDescriptionsItem>
          <NDescriptionsItem label="角色">
            <NTag :type="roleTagType" size="small" round>
              {{ roleLabel[currentUser?.role || ''] || currentUser?.role }}
            </NTag>
          </NDescriptionsItem>
          <NDescriptionsItem v-if="currentUser?.profile?.birthdate" label="出生日期">
            {{ currentUser.profile.birthdate }}
          </NDescriptionsItem>
          <NDescriptionsItem v-if="currentUser?.profile?.description" label="自我介紹">
            {{ currentUser.profile.description }}
          </NDescriptionsItem>
          <NDescriptionsItem label="使用者 ID">
            <code>{{ currentUser?.id }}</code>
          </NDescriptionsItem>
        </NDescriptions>
      </NCard>

      <div class="action-section">
        <NSpace justify="center" :wrap="true">
          <NButton type="primary" @click="router.push('/messages')">
            訊息中心
          </NButton>
          <NButton
            v-if="authStore.user?.role === 'EMPLOYEE' || authStore.user?.role === 'ADMIN'"
            type="success"
            @click="router.push('/schedules')"
          >
            排程管理
          </NButton>
          <NButton
            v-if="authStore.user?.role === 'ADMIN'"
            type="warning"
            @click="router.push('/admin')"
          >
            管理員後台
          </NButton>
          <NButton @click="router.push('/login-records')">
            登入紀錄
          </NButton>
          <NButton @click="router.push('/change-password')">
            修改密碼
          </NButton>
        </NSpace>
      </div>
    </template>
  </PageLayout>
</template>

<style scoped>
.welcome-section {
  text-align: center;
  margin-bottom: 48px;
}

.avatar-wrapper {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-bottom: 20px;
}

.avatar-container {
  display: inline-block;
}

.avatar-container.clickable {
  cursor: pointer;
}

.avatar-circle {
  width: 100px;
  height: 100px;
  border-radius: 50%;
  overflow: hidden;
  background-color: var(--color-border-strong);
  color: var(--color-foreground-secondary);
  font-size: 40px;
  font-weight: 600;
  display: flex;
  align-items: center;
  justify-content: center;
}

.avatar-circle img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}

.welcome-section h1 {
  font-size: 28px;
  font-weight: 700;
  color: var(--color-foreground);
  margin: 0 0 8px;
}

.welcome-sub {
  font-size: 15px;
  color: var(--color-foreground-muted);
  margin: 0;
}

.action-section {
  margin-top: 24px;
}

@media (max-width: 640px) {
  .welcome-section h1 {
    font-size: 22px;
  }
}
</style>
