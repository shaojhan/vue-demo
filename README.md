# Vue Demo

基於 Vue 3 + TypeScript + Vite 的會員系統前端專案。

## 技術棧

- **Vue 3** - Composition API + `<script setup>`
- **TypeScript** - 類型安全
- **Vite** - 開發伺服器與構建工具
- **Vue Router 4** - 路由管理（含路由守衛）
- **Pinia** - 狀態管理（含持久化）
- **Naive UI** - UI 元件庫
- **openapi-typescript-codegen** - 自動生成 API 客戶端

## 功能

- 會員登入 / 註冊
- SSO 登入（OIDC / SAML）
- 個人資訊頁面
- 修改密碼
- JWT Token 認證
- 登入狀態持久化
- 路由守衛（未登入自動跳轉、角色權限控制）
- 排程管理（CRUD、日期篩選、Google Calendar 同步）
- AI 排程助理（浮動聊天視窗，支援自然語言管理排程）
- 非同步 CSV 上傳與任務進度追蹤
- MQTT 管理（連線狀態、訂閱、發布訊息、訊息紀錄）

## 專案結構

```
src/
├── api/                # 自動生成的 API 客戶端
│   ├── core/           # HTTP 請求核心
│   ├── models/         # TypeScript 類型定義
│   └── services/       # API 服務方法
├── components/
│   └── LoginPage.vue   # 登入頁面
├── composables/        # 共用 composables
│   ├── useFormSubmit.ts
│   ├── useLogout.ts
│   ├── useModal.ts
│   └── usePaginatedList.ts
├── views/
│   ├── HomePage.vue           # 首頁
│   ├── RegisterPage.vue       # 註冊頁面
│   ├── UserPage.vue           # 個人資訊頁面
│   ├── SSOLoginPage.vue       # SSO 登入頁面
│   ├── SchedulePage.vue       # 排程管理（含 AI 聊天視窗）
│   ├── ChatPage.vue           # AI 排程助理獨立頁面
│   ├── MqttPage.vue           # MQTT 管理頁面
│   └── NotFoundPage.vue       # 404 頁面
├── stores/
│   └── auth.ts         # 認證狀態管理
├── router/
│   └── index.ts        # 路由配置
└── main.ts             # 應用入口
```

## 開始使用

```bash
# 安裝依賴
npm install

# 啟動開發伺服器
npm run dev

# 構建生產版本
npm run build

# 重新生成 API 客戶端（需要後端服務運行中）
npm run generate
```

## API 代理

開發環境下，Vite 會將 `/api` 請求代理到 `http://localhost`。詳見 `vite.config.ts`。