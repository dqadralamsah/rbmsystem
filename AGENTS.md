<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.

<!-- END:nextjs-agent-rules -->

# Agent Behavior & Workflow Rules

## Project Context & Purpose

You are an AI Coding Assistant responsible for developing the Internal E-Reimbursement System.

- Architecture: Monolith Fullstack using Next.js (App Router) and TypeScript.
- Styling Engine: Tailwind CSS, Shadcn UI, and Phosphor Icons.
- Database: PostgreSQL via Prisma ORM.
- PDF Generator: @react-pdf/renderer
- File Storage Target: MinIO
- Core Principle: Code must be simple, readable, maintainable, and strictly adhere to the Service-Layered Architecture to ensure a smooth, long-term handover process for the internal IT team.

## Architectural Guardrails (Absolute Rules)

🚫 STRICTLY FORBIDDEN:

1. DO NOT alter, modify, or rewrite the database schema. The prisma/schema.prisma file and database structures are READ-ONLY and must not be touched or altered under any circumstances.

2. DO NOT create a separate backend server (e.g., Express.js). All backend and API logic must leverage native Next.js features (Server Actions and Services).

3. DO NOT write Prisma queries (e.g., prisma.request.create) directly inside UI component files (/app/\*). All queries must reside exclusively in the /services directory.

4. DO NOT store receipt files or images directly in the database as Base64/Blobs. Use a TEXT column to store the string path as preparation for MinIO Storage integration.

✅ MANDATORY:

1. Use Server Actions for data mutations and interactions between the UI Component and the Service Layer.

2. Use the BigInt data type in Prisma (mapping to BIGINT in PostgreSQL) for all financial amounts (Rupiah) to avoid floating-point rounding errors.

3. Ensure all UI views are fully responsive using Tailwind CSS.

## Claim Status Workflow (State Machine)

Documents must transition linearly through the following statuses:
DRAFT ➡️ PENDING_ATASAN ➡️ PENDING_FINANCE ➡️ APPROVED or REJECTED.

If a document is moved to REJECTED (either by Atasan or Finance), the notes column in the history table is mandatory to explain the reason for rejection.

## Development Mode & Authentication Bypass

Since the production SSO (Single Sign-On) integration is not yet ready for the initial development phase, you must implement an authentication bypass simulation:

- Provide a dropdown menu on the login page (`/app/page.tsx`) with the roles: `Requester`, `Manager`, and `Finance`.
- When a role is selected, populate and save dummy session data (such as user_id, user_name, and role) into the application state or cookies so dashboards can correctly authorize access.

## How to Write Comments

Write comments to explain "Why" a specific workflow or workaround was built, not "What" the syntax does.

Example of a good comment:

TypeScript
// Utilizing BigInt to completely eliminate decimal rounding bugs in Rupiah financial calculations
const totalAmount: bigint = items.reduce((acc, item) => acc + item.amount, 0n);
Note for AI: Please parse and read this file every time you initialize or modify code within this project repository.
