# Vue Demo

基於 Vue 3 + TypeScript + Vite 的會員系統前端專案。

## 技術棧

- **Vue 3** - Composition API + `<script setup>`
- **TypeScript** - 類型安全
- **Vite** - 開發伺服器與構建工具
- **Vue Router 4** - 路由管理（含路由守衛）
- **Pinia** - 狀態管理（含持久化）
- **openapi-typescript-codegen** - 自動生成 API 客戶端

## 功能

- 會員登入 / 註冊
- 個人資訊頁面
- 修改密碼
- JWT Token 認證
- 登入狀態持久化
- 路由守衛（未登入自動跳轉）

## 專案結構

```
src/
├── api/                # 自動生成的 API 客戶端
│   ├── core/           # HTTP 請求核心
│   ├── models/         # TypeScript 類型定義
│   └── services/       # API 服務方法
├── components/
│   └── LoginPage.vue   # 登入頁面
├── views/
│   ├── HomePage.vue    # 首頁
│   ├── RegisterPage.vue # 註冊頁面
│   ├── UserPage.vue    # 個人資訊頁面
│   └── NotFoundPage.vue # 404 頁面
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
