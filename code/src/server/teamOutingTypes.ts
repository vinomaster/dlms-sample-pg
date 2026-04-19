/**
 * src/server/teamOutingTypes.ts
 *
 * Defines the Team Outing document type for the DLMS sample application.
 * This mirrors the original dlms-sample structure but wired to dlms-base-pg.
 *
 * Document lifecycle:
 *
 *   draft ──► submitted ──► approved ──► closed
 *                  │
 *                  └──► cancelled
 *
 * Roles:
 *   Admin      – full access
 *   Requestor  – creates and edits in draft
 *   Reviewer   – approves or cancels submitted requests
 *   Employee   – read-only on approved/closed
 */

import {
  Documents,
  DocState,
  Roles,
  StateCallbackContext,
  UserGroupCreate,
} from "dlms-base-pg";

// ─── Role definitions ─────────────────────────────────────────────────────────

export const TeamOutingRoles: Roles = {
  Administrator: "Admin",
  Requestor: {
    name: "Requestor",
    getMembers: async (ctx: StateCallbackContext) => {
      // The document owner is the requestor
      return ctx.document.owner ? [ctx.document.owner] : [];
    },
  },
  Reviewer: {
    name: "Reviewer",
    getMembers: async (ctx: StateCallbackContext) => {
      return ctx.document.reviewers ?? [];
    },
  },
  Employee: "Employee",
};

// ─── State definitions ────────────────────────────────────────────────────────

const draft: DocState = {
  label: "Draft",
  description: "The request is being prepared by the Requestor.",
  puml: { title: "Draft", color: "LightYellow" },
  entry: async (ctx: StateCallbackContext) => {
    // Anyone authenticated can create a draft
    return { roles: ["Employee", "Admin"] };
  },
  read: ["Employee", "Admin"],
  write: async (ctx: StateCallbackContext) => {
    if (
      ctx.user.roles.includes("Admin") ||
      ctx.document.owner?.email === ctx.user.email
    ) {
      return { roles: ["Admin", "Requestor"] };
    }
    ctx.accessDeniedError();
  },
  delete: ["Admin"],
  nextStates: {
    submitted: {
      label: "Submit Request",
      description: "Submit the request for review.",
    },
    cancelled: {
      label: "Cancel Request",
      description: "Cancel this draft.",
    },
  },
};

const submitted: DocState = {
  label: "Submitted",
  description: "The request has been submitted and is awaiting review.",
  puml: { title: "Submitted", color: "LightBlue" },
  entry: async (ctx: StateCallbackContext) => {
    if (
      ctx.user.roles.includes("Admin") ||
      ctx.document.owner?.email === ctx.user.email
    ) {
      return { roles: ["Admin", "Requestor"] };
    }
    ctx.accessDeniedError();
  },
  onEntry: async (ctx: StateCallbackContext) => {
    if (ctx.document.reviewers?.length > 0) {
      await ctx.notify(
        ctx.document.reviewers,
        "Team Outing Request – Awaiting Your Review",
        `A team outing request "${ctx.document.eventName}" has been submitted and requires your review.`
      );
    }
  },
  read: ["Employee", "Admin"],
  write: ["Admin"],
  delete: ["Admin"],
  nextStates: {
    approved: {
      label: "Approve",
      description: "Approve the request.",
    },
    cancelled: {
      label: "Cancel",
      description: "Cancel the request.",
    },
  },
};

const approved: DocState = {
  label: "Approved",
  description: "The request has been approved.",
  puml: { title: "Approved", color: "LightGreen" },
  entry: async (ctx: StateCallbackContext) => {
    const isReviewer = await ctx.isCallerInGroup(["Reviewer", "Admin"]);
    if (!isReviewer && !ctx.user.roles.includes("Admin")) {
      ctx.accessDeniedError();
    }
    return { groups: ["Reviewer", "Admin"] };
  },
  onEntry: async (ctx: StateCallbackContext) => {
    if (ctx.document.owner) {
      await ctx.notify(
        [ctx.document.owner],
        "Team Outing Request Approved! 🎉",
        `Your team outing request "${ctx.document.eventName}" has been approved.`
      );
    }
  },
  read: ["Employee", "Admin"],
  write: ["Admin"],
  delete: ["Admin"],
  nextStates: {
    closed: {
      label: "Close",
      description: "Mark the outing as completed.",
    },
  },
};

const cancelled: DocState = {
  label: "Cancelled",
  description: "The request has been cancelled.",
  puml: { title: "Cancelled", color: "LightCoral" },
  entry: async (ctx: StateCallbackContext) => {
    const allowed =
      ctx.user.roles.includes("Admin") ||
      ctx.document.owner?.email === ctx.user.email ||
      (await ctx.isCallerInGroup(["Reviewer"]));
    if (!allowed) ctx.accessDeniedError();
  },
  onEntry: async (ctx: StateCallbackContext) => {
    const recipients = [
      ...(ctx.document.reviewers ?? []),
      ...(ctx.document.owner ? [ctx.document.owner] : []),
    ];
    if (recipients.length > 0) {
      await ctx.notify(
        recipients,
        "Team Outing Request Cancelled",
        `The team outing request "${ctx.document.eventName}" has been cancelled.`
      );
    }
  },
  read: ["Employee", "Admin"],
  write: ["Admin"],
  delete: ["Admin"],
  nextStates: {},
};

const closed: DocState = {
  label: "Closed",
  description: "The outing has been completed and the request is closed.",
  puml: { title: "Closed", color: "LightGray" },
  entry: ["Admin"],
  read: ["Employee", "Admin"],
  write: ["Admin"],
  delete: ["Admin"],
  nextStates: {},
};

// ─── Documents registry ───────────────────────────────────────────────────────

export const teamOutingDocuments: Documents = {
  teamOutings: {
    collectionName: "teamOutings",
    docRoles: TeamOutingRoles,
    document_id_required: false,
    states: { draft, submitted, approved, cancelled, closed },
  },
};

// ─── Initial user groups ──────────────────────────────────────────────────────

export const initialUserGroups: UserGroupCreate[] = [
  { id: "Admin",    deletable: false },
  { id: "Reviewer", deletable: true },
  { id: "Employee", deletable: true },
];
