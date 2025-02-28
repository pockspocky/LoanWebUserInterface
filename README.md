# 贷款管理系统前端

一个基于 Vue 3 + TypeScript 开发的现代化贷款管理系统前端项目。

## 功能特点

- 🔐 完整的用户认证系统
- 💰 贷款申请和管理
- 📊 还款记录追踪
- 💳 批量还款处理
- 📱 响应式设计
- 🎨 现代化 UI 界面

## 技术栈

- Vue 3
- TypeScript
- Vite
- Pinia
- Vue Router
- Naive UI
- Element Plus
- Axios

## 开发环境要求

- Node.js >= 16
- npm >= 7

## 快速开始

1. 克隆项目
```bash
git clone [repository-url]
cd [project-name]
```

2. 安装依赖
```bash
npm install
```

3. 启动开发服务器
```bash
npm run dev
```

4. 构建生产版本
```bash
npm run build
```

## 项目结构

```
frontend/
├── src/
│   ├── api/          # API 接口
│   ├── assets/       # 静态资源
│   ├── components/   # 公共组件
│   ├── router/       # 路由配置
│   ├── stores/       # Pinia 状态管理
│   ├── types/        # TypeScript 类型定义
│   ├── utils/        # 工具函数
│   └── views/        # 页面组件
├── public/           # 公共资源
└── vite.config.ts    # Vite 配置
```

## 主要功能模块

### 用户管理
- 用户登录/注册
- 权限控制
- 用户信息管理

### 贷款管理
- 贷款申请
- 贷款列表查看
- 贷款详情查看
- 贷款状态更新

### 还款管理
- 还款记录查看
- 单笔还款处理
- 批量还款处理
- 还款状态追踪

## API 接口

项目使用 RESTful API 接口，主要包括：

- `/api/auth/*` - 认证相关
- `/api/loans/*` - 贷款相关
- `/api/users/*` - 用户相关

## 开发指南

### 代码规范
- 使用 ESLint 进行代码检查
- 使用 Prettier 进行代码格式化
- 遵循 TypeScript 严格模式

### 组件开发
- 使用 Composition API
- 保持组件的单一职责
- 编写清晰的组件文档

### 状态管理
- 使用 Pinia 进行状态管理
- 按模块划分 store
- 保持状态的响应式

## 部署

1. 构建生产版本
```bash
npm run build
```

2. 将 `dist` 目录部署到服务器

## 贡献指南

1. Fork 项目
2. 创建特性分支
3. 提交改动
4. 推送到分支
5. 创建 Pull Request

## 许可证

[MIT License](LICENSE) 