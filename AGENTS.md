<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.

<!-- END:nextjs-agent-rules -->

<!-- AGENTS AI GUIDELINES -->

# AI Development Guidelines

## Project Overview

Project Name: Reimbursement System (RBM System)
Description: Develop an internal web-based reimbursement management system for corporate use. The system manages reimbursement requests from draft creation, approval workflow, finance verification, payment, and audit history.

## Source of Truth

The AI must always follow the project documentation before generating or modifying code.

Priority order:

1. PRD (Product Requirement Document)
2. Database Schema (prisma/schema.prisma)
3. AGENTS.md

If there is any conflict, follow the PRD.

## Technology Stack

Framework: Next.js 16 (App Router)
Language: TypeScript (Strict Mode)
Styling: Tailwind CSS
UI Components: shadcn/ui
Icons: Phosphor Icons
Database: PostgreSQL
ORM: Prisma ORM
Validation: Zod
PDF Generator: @react-pdf/renderer (Prepared)
Object Storage: MinIO (Prepared)

## Architecture Principles

The project follows a Monolithic Feature-Based Architecture.

- Feature Module Based
- Server Components by Default
- Business Logic inside Service Layer
- Database access only through Repository Layer
- UI must never communicate directly with Prisma
- Shared components must be reusable
- Business logic must remain independent from UI

## Project Structure

```
├── prisma/
│ ├── schema.prisma
│ └── seed.ts
│
├── public/
│
├── src/
│ ├── app/
│ │ ├── (auth)/
│ │ ├── (dashboard)/
│ │ │
│ │ ├── api/
│ │ │ ├── auth/
│ │ │ ├── reimbursement/
│ │ │
│ │ ├── layout.tsx
│ │ └── page.tsx
│ │
│ ├── modules/
│ │ ├── auth/
│ │ ├── reimbursement/
│ │ │ ├── components/
│ │ │ ├── constants/
│ │ │ ├── hooks/
│ │ │ ├── actions/
│ │ │ ├── services/
│ │ │ ├── repositories/
│ │ │ ├── validation/
│ │ │ ├── types.ts
│ │ │ ├── index.ts
│ │
│ ├── components/
│ │ ├── ui/
│ │ ├── layouts/
│ │ └── shared/
│ │
│ ├── hooks/
│ ├── lib/
│ ├── utils/
│ ├── types/
│ │
│ └── middleware.ts
│
├── package.json
└── tsconfig.json
```

## Development Principles

Always write code that is:

Simple
Readable
Maintainable
Modular
Reusable
Type-safe

Avoid unnecessary abstractions.
Prefer readability over clever implementations.

## Database Rules

The database schema is considered stable.

AI MUST NOT:

Modify existing database structure.
Rename tables.
Rename Prisma models.
Rename columns.
Change relationships.
Change enums.
Modify business workflow stored in the schema.

Only generate migrations when explicitly requested.

## Current Database Models

Master Data

- Department
- Role
- Permission
- RolePermission
- User
- ReimbursementCategory

Transaction

- Reimbursement
- ReimbursementItem
- Attachment

Supporting

- WorkflowHistory
- Notification

## Authentication

- Development Environment
- Use Mock Authentication.
- The login page must provide Role Impersonation using predefined users.
- Production Environment
- Authentication will use Company SSO (OAuth2 / OpenID Connect).
- Never implement custom authentication logic intended for production.

## Authorization

Authorization uses Role-Based Access Control (RBAC).

Structure:

User > Role > RolePermission > Permission

Never hardcode permissions inside UI components.
Always check permissions through the authorization layer.

## Business Workflow

Workflow must remain unchanged.

Draft > Submitted > Manager Review > Approved by Manager > Finance Review > Approved by Finance > Paid > Completed

Rejected and Returned workflows must always be recorded inside WorkflowHistory.

## Financial Data

- Financial values represent Indonesian Rupiah.
- Always use Prisma Decimal for monetary values.
- Never use floating-point calculations.
- Always calculate:

Total Amount = SUM(ReimbursementItem.amount)

Store the calculated total inside Reimbursement.

## File Storage

Receipt files are NOT stored inside the database.
Only store metadata:

fileName
objectKey
mimeType
fileSize

Files will be stored in MinIO.
Never store Base64 or Blob inside PostgreSQL.

# Coding Rules

DO:

- Use Server Actions for mutations.
- Keep UI components focused on presentation.
- Place business logic inside Services.
- Place database queries inside Repositories.
- Validate every input using Zod.
- Reuse existing components whenever possible.
- Prefer Server Components over Client Components.
- Keep functions small and focused.
- Write meaningful variable names.

DO NOT:

- Write Prisma queries inside UI.
- Duplicate business logic.
- Create unnecessary helper functions.
- Create unnecessary abstractions.
- Introduce new libraries without explicit request.
- Change folder structure.
- Change naming conventions.
- Modify workflow without approval.
- Modify Prisma schema unless requested.

## Code Style

Use:

- TypeScript Strict Mode
- Async/Await
- Early Return
- Small Functions
- Named Exports

Avoid:

- any
- Nested conditionals
- Magic strings
- Magic numbers

## Comments

Write comments only to explain:

- Why something exists.
- Why a workaround is required.
- Why a business rule exists.

Never comment obvious syntax.

Good example:
// Store totalAmount to optimize dashboard aggregation queries.

Bad example:
// Loop through array.

## AI Behavior

Before generating code:

1. Understand the requested feature.
2. Follow the existing architecture.
3. Reuse existing modules.
4. Avoid unnecessary refactoring.
5. Keep changes minimal.
6. Preserve backward compatibility whenever possible.

When unsure:

Do not invent new business rules.
Follow the PRD.

## Goal

Generate production-ready code that is:

- Consistent
- Predictable
- Easy to maintain
- Easy for the internal IT team to understand
- Aligned with the project's architecture and business rules
