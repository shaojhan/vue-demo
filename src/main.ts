import { createApp } from 'vue'
import { createPinia } from 'pinia'
import piniaPluginPersistedstate from 'pinia-plugin-persistedstate'
import { AllCommunityModule, ModuleRegistry } from 'ag-grid-community'
import '@/style.css'
import App from '@/App.vue'
import router from '@/router'

ModuleRegistry.registerModules([AllCommunityModule])

const app = createApp(App)

const pinia = createPinia()
pinia.use(piniaPluginPersistedstate)

app.use(pinia)
app.use(router)
app.mount('#app')
