# Kanban AI

🚀 Kanban board dengan AI task execution - Multi-agent support

## Features

- 📋 **Kanban Board** - Drag & drop cards between columns
- 🤖 **AI Task Execution** - Assign AI tasks to cards
- 🔌 **Multi-Agent Support** - Multiple AI agents untuk berbagai tugas
- ☁️ **Supabase Backend** - Real-time database & auth
- 🌐 **Cloudflare Pages** - Fast global deployment

## Tech Stack

- **Frontend:** React + Vite
- **Backend:** Supabase (PostgreSQL + REST API)
- **Drag & Drop:** @dnd-kit
- **Icons:** Lucide React
- **Deploy:** Cloudflare Pages

## Quick Start

### 1. Clone & Install

```bash
git clone https://github.com/junandia/kanban-ai.git
cd kanban-ai/frontend
npm install
```

### 2. Setup Supabase

1. Buat project di [Supabase](https://supabase.com)
2. Run SQL schema dari `schema.sql` di SQL Editor
3. Copy credentials ke `.env`:

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

### 3. Run Development

```bash
npm run dev
```

### 4. Build & Deploy

```bash
npm run build
# Upload dist/ ke Cloudflare Pages
```

## Database Schema

- `boards` - Kanban boards
- `columns` - Kolom (To Do, In Progress, Done)
- `cards` - Task cards
- `ai_tasks` - AI execution tasks
- `ai_agents` - Multi-agent configuration

## License

MIT
