# 🎓 Northstar LMS & Online Assessment Platform

<div align="center">

[![TypeScript](https://img.shields.io/badge/TypeScript-5.9-blue.svg?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-19.2-61dafb.svg?logo=react&logoColor=black)](https://react.dev/)
[![TailwindCSS](https://img.shields.io/badge/TailwindCSS-v4-38bdf8.svg?logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)
[![Express](https://img.shields.io/badge/Express-4.21-lightgrey.svg?logo=express&logoColor=black)](https://expressjs.com/)
[![tRPC](https://img.shields.io/badge/tRPC-11.6-25c2a0.svg?logo=trpc&logoColor=white)](https://trpc.io/)
[![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-47A248.svg?logo=mongodb&logoColor=white)](https://www.mongodb.com/)
[![Vite](https://img.shields.io/badge/Vite-7.1-646CFF.svg?logo=vite&logoColor=white)](https://vitejs.dev/)
[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)](https://opensource.org/licenses/MIT)

**A high-performance, commercial-grade, multi-tenant Learning Management & Proctored Assessment Platform.**  
Designed for universities, colleges, and schools to conduct secure, scheduled MCQ exams with active anti-cheat detection, automated scoring, and real-time institutional isolation.

[Features](#-key-features) • [Architecture](#-architecture--tech-stack) • [Role Workflows](#-roles--access-control) • [Quick Start](#-quick-start) • [Anti-Cheat Engine](#-anti-cheat--integrity-engine) • [API & Database](#-database--persistence)

</div>

---

## 📌 Overview

**Northstar LMS** is a full-stack TypeScript monorepo combining a modern React 19 single-page application with a type-safe Express/tRPC backend and MongoDB Atlas persistence. 

Built with deliberate tenant isolation, every institution operates within a self-contained data boundary governed by an upstream administrative hierarchy. All permissions, exam timers, answer validation, randomization, and scoring are **100% server-authoritative** — ensuring student clients cannot tamper with exam content or results.

---

## 🚀 Key Features

### 🏢 Multi-Tenant Institutional Hierarchy
- **Strict Tenant Boundaries:** Every institution is provisioned with a globally unique institution code. Cross-school data leaks are mathematically impossible at the query level.
- **Controlled Account Provisioning:** No anonymous self-registration. Accounts are provisioned top-down: Super Admin ➔ School Admin ➔ Faculty (Teacher) ➔ Student.
- **Isolated Sessions:** Per-tab JWT isolation via encrypted session storage and signed HttpOnly cookies.

### 📝 Assessment Engine
- **Rich MCQ Authoring:** Question authoring with variable positive/negative marking, custom option sets, and rich descriptions.
- **Flexible Scheduling:** Window-based scheduling with automated availability calculations (`UPCOMING`, `AVAILABLE`, `EXPIRED`, `COMPLETED`).
- **Cryptographic Randomization:** Question sequence and individual option orders are shuffled using cryptographically secure random integers (`crypto.randomInt()`) and persisted per attempt.
- **Access Code Protection:** Optional secondary security codes with auto-generation and instant regeneration.
- **Selective Assignment:** Target exams to all active students, specific student tables/groups, or confirmed Excel import rosters.

### 🛡️ Active Anti-Cheat & Integrity Engine
- **Browser Event Interception:** Real-time monitoring of tab-switches (`visibilitychange`), window blurs, fullscreen exits, copy/paste/cut actions, context menus, and restricted shortcut keys.
- **Configurable Violation Thresholds:** Teachers configure allowed violation counts (1–30) per exam.
- **Auto-Submit on Breach:** Exceeding threshold automatically scores and submits the test as `AUTO_SUBMITTED`.
- **Zero Client Trust:** Correct answer keys are completely stripped from student-facing payloads.

### 📊 Excel / CSV Roster & Question Import
- **Two-Stage Verification:** `UPLOAD` ➔ `PREVIEW` (validation, deduplication, formula injection sanitization) ➔ `CONFIRM`.
- **Spreadsheet Security:** Formula injection protection (auto-escapes `=,+,-,@` prefixes).
- **Template Download:** Built-in downloadable structured templates for batch student onboarding and questions.

### 📈 Instant Analytics & Reporting
- **Automated Server Scoring:** Instant calculations accounting for negative marking.
- **Result Visibility Control:** Teachers publish/unpublish exam results to students on demand.
- **Audit Logs:** Immutable tracking of logins, role actions, test launches, and security violations with IP and User-Agent capture.

---

## 🏗️ Architecture & Tech Stack

```
┌──────────────────────────────────────────────────────────────┐
│                    React 19 Client SPA                      │
│     Vite 7 • Tailwind CSS v4 • Wouter • Radix UI • Recharts   │
└──────────────────────────────┬───────────────────────────────┘
                               │  tRPC over HTTP (SuperJSON)
                               │  Bearer Token + HttpOnly Cookie
┌──────────────────────────────▼───────────────────────────────┐
│                    Express & tRPC API                        │
│    Session Verification (jose JWT) • Role & Scope Guards      │
│     Scoring Engine • Shuffle Logic • Excel Processing        │
└──────────────┬───────────────────────────────┬───────────────┘
               │                               │
┌──────────────▼──────────────┐ ┌──────────────▼───────────────┐
│     MongoDB Atlas (CRUD)    │ │   MySQL / Drizzle ORM       │
│  Dynamic Collections &      │ │   Canonical Schema & Types   │
│  Partial Compound Indexes   │ │   Migrations Management      │
└─────────────────────────────┘ └──────────────────────────────┘
```

### Core Technologies

| Layer | Tools & Libraries |
|---|---|
| **Frontend** | React 19, TypeScript, Vite 7, Tailwind CSS v4, Wouter, Radix UI, TanStack React Query 5, Lucide Icons, Sonner |
| **Backend** | Node.js (v22+), Express 4.21, tRPC 11.6, Zod, SuperJSON, bcryptjs, jose (JWT) |
| **Databases** | MongoDB Atlas (Runtime Persistence) + Drizzle ORM / MySQL (Schema Definition) |
| **File Processing** | xlsx, PapaParse, AWS S3 SDK |
| **Testing** | Vitest, TypeScript Typecheck (`tsc --noEmit`) |

---

## 👥 Roles & Access Control

```
                 ┌──────────────────┐
                 │   SUPER ADMIN    │  (Platform Owner)
                 └────────┬─────────┘
                          │ Provisions Institutions
                          ▼
                 ┌──────────────────┐
                 │   SCHOOL ADMIN   │  (Institution Administrator)
                 └────────┬─────────┘
                          │ Creates Faculty
                          ▼
                 ┌──────────────────┐
                 │     TEACHER      │  (Faculty / Course Instructor)
                 └────────┬─────────┘
                          │ Enrolls & Publishes Exams
                          ▼
                 ┌──────────────────┐
                 │     STUDENT      │  (Examinee)
                 └──────────────────┘
```

| Role | Allowed Scope | Key Capabilities |
|---|---|---|
| **Super Admin** | Platform-Wide | Provision institutions, generate institutional codes, create school admin accounts, archive/remove institutions, monitor global platform telemetry. |
| **School Admin** | School Tenant | Manage teaching faculty, reset staff credentials, toggle instructor status, inspect school audit trails and metrics. |
| **Teacher** | Assigned Students & Tests | Author MCQ assessments, configure anti-cheat policies, manage student groups/tables, import rosters via Excel/CSV, publish exams, grade & export results. |
| **Student** | Own Profile & Attempts | Authenticate with institution credentials, take assigned tests in a proctored full-screen interface, view permitted results & scores. |

---

## 🔒 Anti-Cheat & Integrity Engine

During an exam, the student client enters a controlled testing environment governed by browser event listeners:

```
[Student Exam Session]
       │
       ├─► Tab switch / Blur ──────► Event: TAB_HIDDEN / WINDOW_BLUR
       ├─► Exit Fullscreen ────────► Event: FULLSCREEN_EXIT
       ├─► Copy / Paste / Cut ─────► Event: CLIPBOARD_VIOLATION
       ├─► Right Click / Context ──► Event: CONTEXT_MENU
       └─► Developer / Alt Keys ───► Event: RESTRICTED_SHORTCUT
                     │
                     ▼
             tRPC: attempts.recordViolation
                     │
         [Server Integrity Verification]
                     │
     Does policy enable this event detection?
       ├── YES: Atomic $inc violationCount
       └── NO:  Ignore benign event
                     │
     Did violationCount >= Threshold?
       ├── YES: Execute scoreAndClose(AUTO_SUBMITTED) ➔ End Test Immediately
       └── NO:  Return warning toast with current counter
```

---

## 📁 Repository Structure

```plaintext
lms-software/
├── client/                     # Frontend Application
│   ├── src/
│   │   ├── components/         # Reusable UI & Layout Components (BlueprintShell, etc.)
│   │   ├── contexts/           # React Context Providers (ThemeContext)
│   │   ├── hooks/              # Custom React Hooks
│   │   ├── lib/                # tRPC client, Excel template generators, Anti-cheat handlers
│   │   ├── pages/              # Role-specific route views
│   │   │   ├── Home.tsx                # Landing & Login routing
│   │   │   ├── Login.tsx               # Institutional role login
│   │   │   ├── SuperAdminLogin.tsx     # Owner-isolated login
│   │   │   ├── SuperAdminDashboard.tsx # Platform owner command center
│   │   │   ├── AdminDashboard.tsx      # School administration
│   │   │   ├── TeacherDashboard.tsx    # Assessment authoring & overview
│   │   │   ├── TeacherStudents.tsx     # Student roster directory
│   │   │   ├── TeacherTables.tsx       # Student grouping & tables
│   │   │   ├── TeacherResults.tsx      # Analytics & scores
│   │   │   ├── StudentDashboard.tsx    # Student exam launcher
│   │   │   └── TakeAssessment.tsx      # Proctored exam room
│   │   ├── App.tsx             # Route definitions & top-level shell
│   │   └── main.tsx            # tRPC & React Query bootstrap
├── server/                     # Backend API & Server
│   ├── _core/                  # Framework infrastructure (Express, tRPC setup, Cookies, LLM proxy)
│   ├── lms/                    # Domain-specific LMS Routers & Business Logic
│   │   ├── assessmentRouter.ts # Test authoring, publishing, & result endpoints
│   │   ├── attemptRouter.ts    # Secure exam execution, autosave, scoring, violations
│   │   ├── authRouter.ts       # Institutional and Owner authentication
│   │   ├── guards.ts           # Centralized authorization & ownership guards
│   │   ├── peopleRouter.ts     # Faculty & Student account CRUD
│   │   ├── platformRouter.ts   # Super Admin school provisioning
│   │   ├── tableRouter.ts      # Group / class management
│   │   └── importRouter.ts     # Excel / CSV parsing and batch ingestion
│   ├── db.ts                   # Database connection abstraction
│   ├── mongo.ts                # MongoDB Atlas client & collection typings
│   ├── mongoIndexes.ts         # Idempotent index initializer
│   └── routers.ts              # Root tRPC AppRouter definition
├── drizzle/                    # Database schema definitions & SQL migrations
├── shared/                     # Cross-boundary constants, contracts, and type definitions
├── package.json                # Project dependencies and scripts
└── vite.config.ts              # Vite bundler configuration
```

---

## ⚡ Quick Start

### Prerequisites
- **Node.js**: `v22.0.0` or higher
- **pnpm**: `v10.0.0` or higher
- **MongoDB Atlas** cluster or local MongoDB instance (v7.0+)

### 1. Clone & Install Dependencies
```bash
git clone https://github.com/vinayaka2329/lms-software.git
cd lms-software
pnpm install
```

### 2. Configure Environment Variables
Create a `.env` file in the project root:

```env
# Application Server
PORT=3000
NODE_ENV=development

# Session Signing Secret (Must be 32+ characters)
JWT_SECRET="your-ultra-secure-random-jwt-secret-string-here"

# MongoDB Atlas Persistence Connection
MONGODB_URI="mongodb+srv://<username>:<password>@cluster0.mongodb.net/lms_platform?retryWrites=true&w=majority"

# Platform Owner (Super Admin) Credentials
SUPER_ADMIN_EMAIL="superadmin@platform.internal"
SUPER_ADMIN_PASSWORD="YourStrongSuperAdminPassword123!"
```

### 3. Initialize Database Indexes
Run the idempotent index script to configure MongoDB compound and partial indexes:

```bash
pnpm tsx server/mongoIndexes.ts
```

### 4. Start Development Server
```bash
pnpm dev
```
The server will boot up and Vite will serve the client at `http://localhost:3000`.

---

## 🧪 Testing & Quality Assurance

Run the test suite with **Vitest**:

```bash
# Run unit and procedure tests
pnpm test

# Run TypeScript typechecks
pnpm check

# Run live MongoDB Atlas integration tests (Requires active MONGODB_URI)
RUN_MONGO_INTEGRATION=true pnpm vitest run server/mongo.constraints.integration.test.ts
```

---

## 🚢 Production Deployment

Compile both the React client (via Vite) and the Express server (via esbuild):

```bash
# Production build
pnpm build

# Start production server
pnpm start
```

---

## 📜 Documentation Index

For deeper technical specifications, refer to the included documentation:
- 📐 **[ARCHITECTURE.md](./ARCHITECTURE.md)** — Detailed domain models, data boundaries, and attempt state machines.
- 📡 **[API_CONTRACTS.md](./API_CONTRACTS.md)** — Complete tRPC procedure inputs, outputs, and status guarantees.
- 🛡️ **[SECURITY.md](./SECURITY.md)** — Tenant isolation policies, input sanitization, and cryptographic standards.
- 📋 **[VALIDATION.md](./VALIDATION.md)** — Test evidence and automated test execution matrix.

---

## 📄 License

This project is licensed under the [MIT License](./package.json).
