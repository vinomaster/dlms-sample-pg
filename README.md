# dlms-sample-pg

**DLMS Sample Application – Team Outing Planner (AWS Polyglot Edition)**

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Stack: PostgreSQL + OpenSearch](https://img.shields.io/badge/Stack-PostgreSQL%20%2B%20OpenSearch-orange)](https://github.com/discoverfinancial/dlms-server-pg/blob/main/decisions/ADR-001-POLYGLOT.md)

A complete, working sample application built on the [dlms-server-pg](https://github.com/vinomaster/dlms-server-pg) polyglot architecture. It replicates the Team Outing Planner from the original [dlms-sample](https://github.com/discoverfinancial/dlms-sample) — with identical UX and REST API — while replacing MongoDB with **Amazon RDS PostgreSQL + OpenSearch + S3**.

---

## What's New vs. dlms-sample

| Feature | dlms-sample (MongoDB) | dlms-sample-pg (Polyglot) |
|---|---|---|
| System of Record | MongoDB | **Amazon RDS PostgreSQL 16** |
| Full-text Search | MongoDB text index | **Amazon OpenSearch Service 2.x** |
| Binary Attachments | GridFS (MongoDB) | **Amazon S3** |
| Backup | `mongodump` | **Logical JSON → S3** + RDS snapshots |
| Restore | `mongorestore` | **`dlms-backup restore`** + OpenSearch reindex |
| New API endpoint | — | **`GET /api/docs/:type/search?q=`** |
| New admin endpoint | — | **`POST /api/admin/reindex`** |
| Licence risk | SSPL (MongoDB) | PostgreSQL Licence (open) |

---

## Application Overview

The sample models a team outing approval workflow:

```
[Requestor] creates draft
      │
      ▼  Submit
[Reviewer] reviews
      │              │
      ▼ Approve      ▼ Cancel
[Admin] closes    [Terminal]
      │
      ▼ Close
  [Terminal]
```

### Personas / Demo Accounts

| Username | Password | Role |
|---|---|---|
| `admin` | `pw` | Administrator – full access |
| `requestor` | `pw` | Employee – creates and edits requests |
| `reviewer` | `pw` | Employee + Reviewer group – approves/rejects |

---

## Repository Structure

```
dlms-sample-pg/
├── code/                        # Full-stack Node.js + React application
│   ├── src/
│   │   ├── server/
│   │   │   ├── server.ts            # App entry point
│   │   │   ├── appMgr.ts            # Extends DocMgr for team outing use case
│   │   │   ├── teamOutingTypes.ts   # Document states, roles, transitions
│   │   │   ├── myUserProfileService.ts  # Hardcoded users (replace with LDAP/OIDC)
│   │   │   └── puml.ts              # State diagram generator
│   │   └── client/src/
│   │       ├── App.tsx              # React router root
│   │       ├── AuthContext.tsx      # Auth state + Basic Auth helper
│   │       ├── api.ts               # Typed Axios API client
│   │       └── pages/
│   │           ├── LoginPage.tsx
│   │           ├── DashboardPage.tsx   # 4-tab dashboard with search
│   │           ├── RequestPage.tsx     # Create / edit / transition requests
│   │           └── AdminPage.tsx       # Group management + health + reindex
│   ├── Dockerfile
│   └── package.json
├── docs/
│   ├── GettingStarted.md
│   ├── UnderstandingSampleApp.md
│   └── CustomizingSampleApp.md
├── scripts/
│   └── localstack-init.sh
├── docker-compose.yml
└── README.md
```

---

## Getting Started

### Prerequisites

- Node.js 20+
- Docker & Docker Compose

### 1. Clone and install

```bash
git clone https://github.com/discoverfinancial/dlms-sample-pg.git
cd dlms-sample-pg
npm install
```

### 2. Start local infrastructure

```bash
docker compose up -d
# Starts: PostgreSQL 16 · OpenSearch 2.13 · LocalStack (S3)
```

Wait ~30 seconds for OpenSearch to become healthy:
```bash
docker compose ps   # all services should show "healthy" or "running"
```

### 3. Configure environment

```bash
cp code/.env.example code/.env
# Default values work with docker compose – no edits needed for local dev
```

### 4. Build and run

```bash
# Development (hot reload)
cd code && npm run dev

# OR with Docker
docker compose up app
```

Visit **http://localhost:4000** and log in as `admin / pw`.

### 5. Explore the app

Follow the [Understanding the Sample App](docs/UnderstandingSampleApp.md) tutorial — the steps are identical to the original dlms-sample.

---

## Full-Text Search

The polyglot edition adds a search bar on the dashboard backed by OpenSearch:

```bash
# API directly
curl "http://localhost:4000/api/docs/teamOutings/search?q=offsite"

# With state filter
curl "http://localhost:4000/api/docs/teamOutings/search?q=team+lunch&filters=%7B%22_state%22%3A%22submitted%22%7D"
```

---

## State Diagram

Generate a PlantUML diagram of the document lifecycle:

```bash
cd code && npm run puml
# Output: docs/teamOuting-states.puml
# Paste at https://www.plantuml.com/plantuml/uml/
```

---

## Backup & Restore

```bash
# Install backup CLI (from dlms-server-pg)
npm install -g dlms-backup-pg

# Backup to S3
dlms-backup backup --label pre-migration

# List backups
dlms-backup list

# Restore
dlms-backup restore dlms-backups/pre-migration/2025-01-15T...json.gz

# Rebuild OpenSearch index only
dlms-backup reindex
```

---

## Customising for Your Use Case

See [CustomizingSampleApp.md](docs/CustomizingSampleApp.md) for a step-by-step guide to:

1. Defining your own document type, states, and roles in `teamOutingTypes.ts`
2. Swapping in a real `UserProfileService` (LDAP, Okta, Azure AD)
3. Deploying to AWS with the Terraform in `dlms-server-pg/infra/terraform/`

---

## License

MIT — see [LICENSE](LICENSE)
