# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

VoteCerto is a voting platform built with Next.js 16 (App Router) that enables role-based voting sessions. Users are divided into three types: ADMIN, GESTOR (manager), and PARTICIPANT.

## Language Requirement

All source code must be written in Portuguese (pt-br), including:
- Variable and function names
- Comments
- Error messages
- UI labels and text
- Database field names

This applies to the entire codebase.

## Common Commands

```bash
# Development
npm run dev          # Start development server
npm run build        # Production build
npm run start        # Start production server

# Linting
npm run lint         # Run ESLint

# Database
npm run db:studio    # Open Prisma Studio
npm run db:generate  # Generate Prisma client

# User management scripts
npm run criar-usuario-admin       # Create admin user
npm run criar-usuario-gestor      # Create gestor user
npm run criar-usuario-participante # Create participant user
```

## Architecture

### Tech Stack
- **Framework**: Next.js 16 with App Router
- **Language**: TypeScript
- **Database**: MariaDB with Prisma ORM
- **Styling**: Tailwind CSS 4 + Radix UI components (shadcn-style)
- **Authentication**: JWT via jose library, cookie-based storage
- **Validation**: Zod with react-hook-form

### Directory Structure

```
app/                  # Next.js App Router pages
├── api/             # API routes (REST endpoints)
├── auth/            # Authentication pages (login, cadastro)
├── admin/           # Admin dashboard pages
├── gestor/          # Manager dashboard pages
├── participante/    # Participant voting pages
└── layout.tsx       # Root layout

components/
├── ui/              # Reusable UI components (Radix-based)
├── sidebar-*.tsx    # Role-specific sidebars
└── header.tsx       # Global header

lib/
├── auth.ts          # JWT utilities (sign, verify, cookie helpers)
├── prisma.ts        # Database client (MariaDB adapter)
└── utils.ts         # General utilities (cn helper)

prisma/
└── schema.prisma    # Database schema

hooks/               # Custom React hooks for data fetching (SWR-based)
scripts/             # Utility scripts (user creation)

generated/prisma/    # Generated Prisma client
```

### Database Schema

Key models in `prisma/schema.prisma`:
- **usuarios**: Users with tipos (ADMIN, GESTOR, PARTICIPANTE)
- **sessoes**: Voting sessions with start/end dates
- **projetos**: Projects within sessions
- **votos**: Votes linking users to projects in sessions
- **comunidades**: Communities users can join
- **participantes**: Community membership relation

### Authentication Flow

1. Login at `/api/auth/login` returns JWT token
2. Token stored in `auth_token` cookie (HttpOnly)
3. `middleware.ts` enforces route access by user type
4. API routes receive user info via `x-usuario-id` and `x-usuario-tipo` headers

### Route Protection

- `/admin/*` - ADMIN only
- `/gestor/*` - GESTOR and ADMIN
- `/participante/*` - PARTICIPANTE only
- `/api/*` - Authenticated users (type-specific in route handlers)

### API Patterns

API routes follow Next.js App Router conventions in `app/api/`. Route handlers receive authenticated user ID from request headers set by middleware.

### Component Patterns

UI components in `components/ui/` are built on Radix UI primitives with Tailwind styling. Use the `cn()` utility from `lib/utils.ts` for class merging.
