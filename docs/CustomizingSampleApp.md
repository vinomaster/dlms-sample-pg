# Customising the Sample Application

This guide explains how to adapt the Team Outing Planner into your own DLMS-based application on the AWS Polyglot stack.

## Overview

The sample application has four customisation points:

1. **Document types & states** – `code/src/server/teamOutingTypes.ts`
2. **User profile service** – `code/src/server/myUserProfileService.ts`
3. **AppMgr** – `code/src/server/appMgr.ts`
4. **React UI** – `code/src/client/src/`

## Step 1: Define your document type

Open `teamOutingTypes.ts` and replace the `teamOutingDocuments` object with your own:

```typescript
export const myDocuments: Documents = {
  // Collection name → DocType
  conceptProposals: {
    collectionName: "conceptProposals",
    document_id_required: false,
    docRoles: MyRoles,
    states: {
      draft:     { ... },
      inReview:  { ... },
      approved:  { ... },
      rejected:  { ... },
    },
  },
};
```

### State definition checklist

Each `DocState` should define:

| Property | Purpose |
|---|---|
| `label` | Human-readable state name |
| `description` | What this state means |
| `entry` | Who can transition a document **into** this state |
| `read` | Who can read a document in this state |
| `write` | Who can update a document in this state |
| `delete` | Who can delete a document in this state |
| `onEntry` | Async callback when state is entered (e.g. send email) |
| `nextStates` | Valid state transitions out of this state |
| `puml` | (Optional) PlantUML diagram styling |

## Step 2: Define roles

```typescript
export const MyRoles: Roles = {
  Administrator: "Admin",           // string = group name
  Author: {
    name: "Author",
    getMembers: async (ctx) => {
      // Dynamic: the document owner is the author
      return ctx.document.owner ? [ctx.document.owner] : [];
    },
  },
  Reviewer: "Reviewers",            // static group managed via Admin UI
};
```

## Step 3: Connect a real UserProfileService

Replace `MyUserProfileService` with your identity provider:

### LDAP / Active Directory

```typescript
import ldap from "ldapjs";

export class LdapUserProfileService implements UserProfileService {
  async verify(uid: string, pwd: string): Promise<UserContext> {
    // Bind with user credentials to verify
    const client = ldap.createClient({ url: process.env.LDAP_URL! });
    await bindAsync(client, `uid=${uid},ou=people,dc=example,dc=com`, pwd);

    // Fetch user attributes
    const entry = await searchAsync(client, uid);
    return {
      user: {
        id: uid,
        email: entry.mail,
        name: entry.cn,
        department: entry.department,
        title: entry.title,
        employeeNumber: entry.employeeNumber,
        roles: entry.memberOf.includes("cn=Admins") ? ["Admin", "Employee"] : ["Employee"],
      },
      isAdmin: entry.memberOf.includes("cn=Admins"),
    };
  }

  async get(claimsOrUid: any): Promise<UserContext[]> {
    // Called post-OAuth; claimsOrUid is the OIDC profile
    const uid = claimsOrUid.preferred_username ?? claimsOrUid.sub;
    const ctx = await this.verify(uid, ""); // no password for OAuth
    return [ctx];
  }
}
```

### Okta / Azure AD (OIDC)

Set the following environment variables:

```
OAUTH_ENABLED=true
OAUTH_ISSUER_URL=https://your-org.okta.com
OAUTH_CLIENT_ID=<your-client-id>
OAUTH_CLIENT_SECRET=<your-client-secret>
```

Then implement `get()` to map the OIDC profile to a `UserContext`.

## Step 4: Update AppMgr

```typescript
export class AppMgr extends DocMgr {
  constructor() {
    super({
      appName: "ConceptProposalManager",
      documents: myDocuments,           // ← your documents
      adminGroups: ["Admin"],
      adminRole: "Admin",
      roles: ["Admin", "Author", "Reviewer", "Employee"],
      email: "proposals@company.com",
      userGroups: [
        { id: "Admin",     deletable: false },
        { id: "Reviewers", deletable: true },
        { id: "Employee",  deletable: true },
      ],
      userProfileService: new LdapUserProfileService(),
    });
  }
}
```

## Step 5: Customise the React UI

The UI is a standard Create React App project. Key files to update:

- `api.ts` – update the `TeamOuting` interface to match your document shape
- `DashboardPage.tsx` – update column names and tab logic
- `RequestPage.tsx` – replace form fields with your document's fields
- `AuthContext.tsx` – update role detection for your roles

## Step 6: Deploy to AWS

1. Push your container image to ECR:
   ```bash
   aws ecr get-login-password | docker login --username AWS --password-stdin <account>.dkr.ecr.us-east-1.amazonaws.com
   docker build -t dlms-my-app ./code
   docker tag dlms-my-app:latest <ecr-uri>:latest
   docker push <ecr-uri>:latest
   ```

2. Apply Terraform (from `dlms-server-pg/infra/terraform/`):
   ```bash
   terraform apply \
     -var="container_image=<ecr-uri>:latest" \
     -var="pg_username=dlms" \
     -var="pg_password=<secure>"
   ```

3. Store secrets in SSM Parameter Store:
   ```bash
   aws ssm put-parameter --name /dlms/pg_pass --value "<secure>" --type SecureString
   aws ssm put-parameter --name /dlms/session_secret --value "<random>" --type SecureString
   ```

## Step 7: Backup Strategy

Complement the logical backups with RDS automated snapshots:

- **RDS automated snapshots**: 30-day retention (configured in Terraform)
- **Point-in-time recovery**: restore to any second within retention window
- **Logical backups**: `dlms-backup backup` on a cron schedule for portable exports
- **OpenSearch**: can always be rebuilt from PostgreSQL via `dlms-backup reindex`

Recommended backup cron (add to ECS scheduled task or EventBridge):
```bash
dlms-backup backup --label scheduled
```
