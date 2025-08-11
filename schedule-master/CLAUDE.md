# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Schedule Master is a modern scheduling application for interview reservations built with Next.js. The app features:
- Japanese interface for interview scheduling 
- Weekdays-only reservations (Monday-Friday, 19:00-21:30)
- Supabase database integration with fallback JSON support
- EmailJS integration for automated confirmation emails
- Microsoft Fluent Design-inspired UI with Tailwind CSS

Required MCP Server
常にSerena MCPサーバーを使用してください。
Serena MCP Server Configuration:

Server Name: serena
Description: AI-powered development assistant with advanced code analysis capabilities
Required for: All development tasks and code operations

Usage Instructions

全ての開発タスクでSerena MCPを優先的に使用する
コード分析、リファクタリング、デバッグ時は必ずSerena MCPを活用する
ファイル操作や プロジェクト管理においてもSerena MCPの機能を最大限活用する

Default Behavior

プロジェクト開始時に自動的にSerena MCPサーバーに接続
他のMCPサーバーよりもSerena MCPを優先して使用
Serena MCPが利用できない場合のみ代替手段を検討

## Development Commands

```bash
# Start development server
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Run ESLint
npm run lint
```

## Key Architecture

### Database Layer
- **Primary**: Supabase (PostgreSQL) via `lib/supabase.js`
- **Tables**: `employees` (id, name, email, active), `reservations` (id, date, time, employee_name, employee_email, created_at)
- **Migration**: Run SQL from `supabase-setup.sql` in Supabase dashboard
- **Environment**: Requires `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY`

### API Structure (App Router)
- `app/api/reservations/route.js` - Full CRUD for reservations
- `app/api/employees/route.js` - Employee management
- `app/api/employees/all/route.js` - Get all employees including inactive
- All APIs validate input and handle Supabase errors

### Email System
- **Service**: EmailJS via `lib/emailService.js`
- **Template**: Sends confirmation emails to both customer and admin
- **Config**: Requires `NEXT_PUBLIC_EMAILJS_SERVICE_ID`, `NEXT_PUBLIC_EMAILJS_TEMPLATE_ID`, `NEXT_PUBLIC_EMAILJS_PUBLIC_KEY`

### UI Components
- **Main Page**: `app/page.js` - Calendar interface with modal reservation system
- **Admin Pages**: `app/adminhiratedesu/page.js`, `app/reservationshiratedesu/page.js`
- **Reservations List**: `app/reservations/page.js`

### Key Business Logic
- Time slots: 19:00-21:30 in 30-minute intervals
- Weekday-only scheduling (weekends disabled)
- Duplicate reservation prevention
- Email validation and confirmation system

## Environment Setup

Required `.env.local` variables:
```
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
NEXT_PUBLIC_EMAILJS_SERVICE_ID=your_service_id
NEXT_PUBLIC_EMAILJS_TEMPLATE_ID=your_template_id  
NEXT_PUBLIC_EMAILJS_PUBLIC_KEY=your_public_key
```

## Styling
- **Framework**: Tailwind CSS 4.0
- **Design System**: Microsoft Fluent Design inspiration
- **Responsive**: Mobile-first with grid-based calendar layout
- **Colors**: Indigo primary, gray neutrals

## Testing & Deployment
After making changes, always run `npm run lint` to check code quality before deployment.