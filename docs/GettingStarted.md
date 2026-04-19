# Getting Started with dlms-sample-pg

This guide walks you through building and running the Team Outing Planner sample application on the DLMS AWS Polyglot stack.

## Prerequisites

| Tool | Version | Purpose |
|---|---|---|
| Node.js | 20+ | Application runtime |
| Docker | 24+ | Local PostgreSQL, OpenSearch, S3 (LocalStack) |
| Docker Compose | 2.x | Orchestrate local services |
| AWS CLI | 2.x | (Optional) Interact with LocalStack or real AWS |
| Git | any | Clone the repos |

## Step 1: Clone both repositories

The sample app depends on the `dlms-server-pg` package. For local development, clone both side-by-side:

```bash
git clone https://github.com/discoverfinancial/dlms-server-pg.git
git clone https://github.com/discoverfinancial/dlms-sample-pg.git
```

## Step 2: Build dlms-server-pg

```bash
cd dlms-server-pg
npm install
npm run build
cd ..
```

## Step 3: Install sample app dependencies

```bash
cd dlms-sample-pg
npm install
```

## Step 4: Start infrastructure services

```bash
docker compose up -d
```

This starts:
- **PostgreSQL 16** on `localhost:5432` (user: `dlms`, pass: `dlms`, db: `dlms`)
- **OpenSearch 2.13** on `localhost:9200` (single-node, security disabled for local dev)
- **OpenSearch Dashboards** on `localhost:5601`
- **LocalStack** on `localhost:4566` (S3 emulation; creates `dlms-attachments` and `dlms-backups` buckets automatically)

Wait for services to be healthy (~30 seconds):
```bash
docker compose ps
```

## Step 5: Configure environment

```bash
cp code/.env.example code/.env
```

The default values in `.env.example` are pre-configured for the docker compose services. No changes needed for local development.

## Step 6: Run in development mode

```bash
cd code
npm run dev
```

This runs:
- **Server** (`ts-node-dev`) on `http://localhost:4000`
- **React dev server** on `http://localhost:3000` (proxies API calls to port 4000)

Open **http://localhost:3000** in your browser.

## Step 7: Log in

Use one of the hardcoded demo accounts:

| Username | Password | Role |
|---|---|---|
| `admin` | `pw` | Administrator |
| `requestor` | `pw` | Employee (Requestor) |
| `reviewer` | `pw` | Employee + Reviewer group |

## Step 8: Verify the polyglot stack

### Check PostgreSQL
```bash
docker exec -it dlms-sample-postgres psql -U dlms -c "\dt"
# Should show: documents, user_groups, user_group_members, attachments
```

### Check OpenSearch
```bash
curl http://localhost:9200/_cat/indices?v
# After creating a request, you'll see: dlms_teamoutings
```

### Check S3 (LocalStack)
```bash
aws --endpoint-url=http://localhost:4566 s3 ls
# Should show: dlms-attachments, dlms-backups
```

## Running with Docker Compose (full stack)

To run the app server in Docker alongside the infrastructure:

```bash
docker compose --profile app up -d
```

Visit **http://localhost:4000**.

## Running production build locally

```bash
cd code
npm run build        # compiles TypeScript + React
npm start            # runs compiled server
```

## Stopping services

```bash
docker compose down          # stop services (preserve data)
docker compose down -v       # stop services + delete volumes (clean slate)
```

## Troubleshooting

**OpenSearch won't start / is unhealthy**
```bash
# Increase Docker memory to at least 4GB in Docker Desktop settings
docker compose logs opensearch
```

**`PG_* connect` errors**
```bash
# Ensure postgres container is healthy
docker compose ps postgres
docker compose restart postgres
```

**S3 upload errors with LocalStack**
```bash
# Confirm LocalStack is running and buckets exist
aws --endpoint-url=http://localhost:4566 s3 ls
```

**React app shows blank page**
```bash
# Ensure the dev server proxy is pointing to port 4000
# Check code/package.json "proxy" field
```
