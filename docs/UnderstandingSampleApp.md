# Understanding How the DLMS Sample Application Works (Polyglot Edition)

This tutorial mirrors the original `dlms-sample` walkthrough step-for-step, but highlights how the AWS Polyglot stack operates under the hood at each stage.

## Use Case

1. A team outing needs to be planned and scheduled.
2. A **Requestor** creates a request.
3. A **Reviewer** approves or rejects the request.
4. An **Admin** can close completed requests and manage user groups.

## Personas

| Persona | Username | Password | Capabilities |
|---|---|---|---|
| Admin | `admin` | `pw` | Full access, user group management |
| Requestor | `requestor` | `pw` | Create and edit requests |
| Reviewer | `reviewer` | `pw` | Approve or cancel submitted requests |

> Authentication uses HTTP Basic Auth in this sample. DLMS also supports OIDC/OAuth — see `OAUTH_ENABLED` in `.env.example`.

---

## Step 1: Admin Setup

**Objective:** Give the Reviewer user the `Reviewer` group privileges.

> In the Polyglot edition, the Reviewer group is pre-seeded in development mode (`NODE_ENV=development`). This step is still useful in production to add real users.

1. Visit `http://localhost:4000` and log in as `admin / pw`.
2. Click **Administrator** in the top navigation.
3. Select **Reviewer** from the Group Name dropdown.
4. Enter `reviewer@test.com` in the email field and click **+ Add**.

**What happens under the hood:**
- A `PATCH /api/user_groups/Reviewer` request is sent with the updated members array.
- The `PgAdapter` executes an `UPSERT` into the `user_group_members` table in PostgreSQL.
- No search indexing is needed for user groups — they are read directly from RDS.

---

## Step 2: Create a Request (Requestor)

1. Log in as `requestor / pw`.
2. Click **+ NEW TEAM-OUTING REQUEST**.
3. Fill in the **Event Details** tab: Event Name, Date, Location, Cost, Attendees, Description.
4. Switch to **Planning Topics** and fill in agenda items.
5. Click **Create Draft** — the request is saved in `draft` state.
6. Click **Submit Request** — the request transitions to `submitted`.

**What happens under the hood:**
- `POST /api/docs/teamOutings` creates a row in the PostgreSQL `documents` table with `collection='teamOutings'` and `state='draft'`.
- The document JSON is stored in the `data JSONB` column.
- Asynchronously, the document is indexed in OpenSearch index `dlms_teamoutings`.
- On Submit: `PATCH /api/docs/teamOutings/:id` with `{ _state: "submitted" }`.
  - `DocMgr` validates the transition: `draft → submitted` is in `nextStates`.
  - The `onEntry` callback fires and sends an email notification to reviewers (if `EMAIL_ENABLED=true`).
  - PostgreSQL row is updated; OpenSearch document is updated.

---

## Step 3: Review a Request (Reviewer)

1. Log in as `reviewer / pw`.
2. The **Needs Action** tab shows submitted requests awaiting review.
3. Click the ✏️ edit icon on a request.
4. Click **✅ Approve** or **❌ Cancel**.

**What happens under the hood:**
- `PATCH /api/docs/teamOutings/:id` with `{ _state: "approved" }`.
- `DocMgr._validateStateTransition()` checks that `submitted → approved` is a valid transition.
- `DocMgr._checkEntry()` verifies the caller is in the `Reviewer` group by querying the `user_group_members` table in PostgreSQL.
- The `onEntry` callback for the `approved` state notifies the requestor.
- RDS PostgreSQL is updated first (System of Record), then OpenSearch is updated asynchronously.

---

## Step 4: Full-Text Search

The Polyglot edition adds a **search bar** on the dashboard backed by OpenSearch.

1. Log in as any user.
2. Type in the search box on the dashboard — results filter in real time (client-side for the table, OpenSearch for the API).
3. For API-level search:

```bash
curl "http://localhost:4000/api/docs/teamOutings/search?q=offsite+planning"
curl "http://localhost:4000/api/docs/teamOutings/search?q=team&filters=%7B%22_state%22%3A%22submitted%22%7D"
```

**What happens under the hood:**
- `GET /api/docs/teamOutings/search?q=...` routes to `OsAdapter.search()`.
- OpenSearch executes a `multi_match` query across all document fields with fuzzy matching.
- Results include an `_score` relevance field.
- If OpenSearch is unavailable, the endpoint returns an empty list (graceful degradation — RDS is unaffected).

---

## Step 5: Editing a Request

1. Log in as `requestor / pw`.
2. On the **All Requests** tab, click ✏️ on your draft.
3. Edit fields — changes auto-save on **Save Changes**.

**What happens under the hood:**
- `PATCH /api/docs/teamOutings/:id` with the changed fields.
- `DocMgr._checkWrite()` verifies the caller is the document owner.
- PostgreSQL `data JSONB` column is updated with a JSON merge.
- OpenSearch document is updated asynchronously.

---

## Step 6: Deleting a Request (Admin)

1. Log in as `admin / pw`.
2. On **All Requests**, click 🗑️ on any request.
3. Confirm the deletion.

**What happens under the hood:**
- `DELETE /api/docs/teamOutings/:id` removes the row from PostgreSQL.
- The OpenSearch document is deleted asynchronously.
- Attachment metadata is removed from the `attachments` table; the S3 objects are deleted by `S3Store.delete()`.

---

## Step 7: Attaching Files

1. Open any request you own.
2. Click the **Attachments** tab.
3. Choose a file and click **Upload**.

**What happens under the hood:**
- `POST /api/docs/teamOutings/:docId/attachments` with `multipart/form-data`.
- The file buffer is uploaded to S3: `s3://<ATTACHMENTS_BUCKET>/teamOutings/<docId>/<attachmentId>/<filename>` with SSE-KMS encryption.
- Metadata (name, size, mime type, S3 key) is stored in the PostgreSQL `attachments` table — no binary data in the database.
- To download: the server streams the S3 object back to the client via `S3Store.download()`.

---

## Polyglot Architecture at a Glance

```
Browser
  │
  │ HTTP (Basic Auth or OIDC session)
  ▼
Express Server (ECS Fargate)
  │
  ├─── DocMgr.createDoc / updateDoc / deleteDoc
  │         │
  │         ▼ synchronous write
  │    PgAdapter → PostgreSQL (System of Record)
  │         │
  │         └─► async (non-blocking)
  │              OsAdapter → OpenSearch (Search Layer)
  │
  ├─── DocMgr.searchDocs
  │         │
  │         ▼
  │    OsAdapter → OpenSearch
  │
  ├─── DocMgr.createAttachment / getAttachment
  │         │
  │         ▼ metadata
  │    PgAdapter → PostgreSQL (attachments table)
  │         │
  │         ▼ binary
  │    S3Store → Amazon S3
  │
  └─── DocMgr.healthCheck
            │
            ├─► PostgreSQL: SELECT 1
            └─► OpenSearch: cluster health API
```

**Key principle:** PostgreSQL is always written first and is always authoritative. OpenSearch is a derived, eventually-consistent search replica that can be rebuilt at any time with `dlms-backup reindex`.
