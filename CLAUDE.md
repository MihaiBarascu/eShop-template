# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

### Development
- `pnpm dev` - Start development server (Next.js + Payload)
- `pnpm build` - Build for production
- `pnpm start` - Start production server
- `pnpm dev:prod` - Build and start production locally

### Code Quality
- `pnpm lint` - Run ESLint
- `pnpm lint:fix` - Run ESLint with auto-fix

### Testing
- `pnpm test` - Run all tests (integration + e2e)
- `pnpm test:int` - Run integration tests with Vitest
- `pnpm test:e2e` - Run end-to-end tests with Playwright

### Payload CMS
- `pnpm payload` - Access Payload CLI
- `pnpm generate:types` - Generate TypeScript types from Payload config
- `pnpm generate:importmap` - Generate import map for admin components

### Database Migrations (when using SQL)
- `pnpm payload migrate:create` - Create new migration
- `pnpm payload migrate` - Run pending migrations

## Architecture Overview

This is a Payload CMS website template built with Next.js App Router. The architecture follows a monolithic approach with both CMS backend and frontend website in the same codebase.

### Core Technologies
- **Payload CMS 3.x**: Headless CMS with admin panel
- **Next.js 15**: React framework with App Router
- **TypeScript**: Type safety throughout
- **MongoDB**: Primary database (configurable to Postgres)
- **TailwindCSS + shadcn/ui**: Styling and components
- **Lexical**: Rich text editor

### Directory Structure
```
src/
├── app/                    # Next.js App Router
│   ├── (frontend)/        # Public website pages
│   └── (payload)/         # Payload admin routes
├── collections/           # Payload collections (Users, Posts, Pages, Media, Categories)
├── blocks/               # Layout building blocks (Hero, Content, CTA, etc.)
├── components/           # React components (both frontend and admin)
├── heros/               # Hero section variants
├── Header/ & Footer/    # Global navigation configs
└── payload.config.ts    # Main Payload configuration
```

### Key Collections
- **Pages**: Layout builder enabled pages with draft/live preview
- **Posts**: Blog posts with layout blocks and draft preview
- **Media**: File uploads with automatic image optimization
- **Categories**: Nested taxonomy for organizing posts
- **Users**: Admin authentication and content management

### Layout Builder System
Pages and Posts use a flexible layout builder with these blocks:
- Hero, Content, MediaBlock, CallToAction, ArchiveBlock, Banner, Code, Form, RelatedPosts

Each block has both backend configuration (in `src/blocks/`) and frontend rendering components.

### Live Preview & Drafts
- All content supports draft/live preview
- Uses Next.js revalidation for published content updates
- Admin bar integration for in-context editing

### Environment Setup
1. Copy `.env.example` to `.env`
2. Configure `DATABASE_URI` for MongoDB connection
3. Set `PAYLOAD_SECRET` for session encryption
4. Set `NEXT_PUBLIC_SERVER_URL` for frontend URL

### Development Workflow
1. Run `pnpm dev` to start both Payload admin and Next.js frontend
2. Access admin at `/admin` (seed database from admin panel if needed)
3. Frontend renders at root with live content from Payload
4. Use the layout builder to create pages with drag-and-drop blocks

### Type Safety
- Payload automatically generates types in `src/payload-types.ts`
- Run `pnpm generate:types` after schema changes
- All components are strongly typed with Payload collection types

### Package Manager
This project uses **pnpm** exclusively. All commands should use `pnpm` rather than `npm` or `yarn`.

## E-commerce Integration Workflow

### Tailstore4 Template Integration
This project integrates components from tailstore4 (Tailwind CSS v4 e-commerce template) into Payload CMS.

**Source Template**: `/home/evr/Desktop/tailstore4-main/`
- Built with Tailwind CSS v4.1.6
- Uses Swiper.js for sliders
- Manrope font family
- E-commerce specific components

### Component Migration Strategy

When integrating components from tailstore4 to Payload:

1. **Backup Strategy**: Always create `.old` versions of files before major changes
   ```bash
   cp src/Header/config.ts src/Header/config.old.ts
   cp src/Header/Component.client.tsx src/Header/Component.client.old.tsx
   ```

2. **Analysis Phase**:
   - Extract HTML structure from tailstore4
   - Identify dynamic content areas
   - Map to Payload field types

3. **Payload Configuration**:
   - Update `config.ts` with appropriate fields
   - Add support for dropdowns, logos, auth buttons
   - Include conditional field visibility

4. **React Component**:
   - Convert HTML to React (JSX)
   - Replace static content with Payload data
   - Maintain Tailwind classes and structure
   - Add TypeScript types

5. **Reference Files**:
   - Keep original `.old` files for reference
   - Document field mappings in comments
   - Maintain compatibility with existing Payload structure

### File Naming Convention
- `config.ts` - Payload field configuration
- `Component.tsx` - Server component wrapper
- `Component.client.tsx` - Client-side React component
- `*.old.*` - Backup files for reference
- `RowLabel.tsx` - Admin panel row labels

### Integration Checklist
- [ ] Extract component HTML from tailstore4
- [ ] Create backup files (.old versions)
- [ ] Update Payload configuration (config.ts)
- [ ] Convert to React component (Component.client.tsx)
- [ ] Update TypeScript types (payload-types.ts)
- [ ] Test in admin panel and frontend
- [ ] Ensure mobile responsiveness