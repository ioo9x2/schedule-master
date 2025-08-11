# Schedule Master - Project Overview

## Purpose
Schedule Master is a modern scheduling application for interview reservations built with Next.js. The app features a Japanese interface for interview scheduling with weekdays-only reservations (Monday-Friday, 19:00-21:30).

## Tech Stack
- **Frontend**: Next.js 15.4.4 with React 19.1.0
- **Styling**: Tailwind CSS 4.0 (Microsoft Fluent Design inspired)
- **Database**: Supabase (PostgreSQL) with fallback JSON support
- **Email**: EmailJS for automated confirmation emails
- **Development**: ESLint for code quality

## Key Features
- Japanese interface for interview scheduling
- Weekdays-only reservations (Monday-Friday, 19:00-21:30)
- Supabase database integration with fallback JSON support
- EmailJS integration for automated confirmation emails
- Microsoft Fluent Design-inspired UI with Tailwind CSS
- Employee management system
- Real-time availability checking
- Email validation and confirmation system

## Database Schema
- `employees` table: (id, name, email, active)
- `reservations` table: (id, date, time, employee_name, employee_email, created_at)

## Environment Requirements
- NEXT_PUBLIC_SUPABASE_URL
- NEXT_PUBLIC_SUPABASE_ANON_KEY
- NEXT_PUBLIC_EMAILJS_SERVICE_ID
- NEXT_PUBLIC_EMAILJS_TEMPLATE_ID
- NEXT_PUBLIC_EMAILJS_PUBLIC_KEY