/**
 * src/server/myUserProfileService.ts
 *
 * A simple, self-contained UserProfileService for the DLMS sample application.
 *
 * In this sample, users are hardcoded so the app can run without LDAP or an
 * identity provider.  Replace the `users` array with an LDAP/AD query or an
 * OIDC userinfo call for production use.
 *
 * Hardcoded users
 * ───────────────
 *   admin     / pw   → Admin role
 *   requestor / pw   → Employee role (becomes Requestor via document ownership)
 *   reviewer  / pw   → Employee role (granted Reviewer via Admin UI)
 */

import { UserContext, UserProfileService, User } from "dlms-base-pg";

const users: (User & { password: string })[] = [
  {
    id: "admin",
    email: "admin@test.com",
    name: "Admin User",
    department: "IT",
    title: "System Administrator",
    employeeNumber: "001",
    password: "pw",
    roles: ["Admin", "Employee"],
  },
  {
    id: "requestor",
    email: "requestor@test.com",
    name: "Alex Requestor",
    department: "Engineering",
    title: "Software Engineer",
    employeeNumber: "002",
    password: "pw",
    roles: ["Employee"],
  },
  {
    id: "reviewer",
    email: "reviewer@test.com",
    name: "Riley Reviewer",
    department: "Management",
    title: "Engineering Manager",
    employeeNumber: "003",
    password: "pw",
    roles: ["Employee"],
  },
];

export class MyUserProfileService implements UserProfileService {
  /**
   * Called after OAuth/OIDC token exchange.
   * `claimsOrUid` is the profile object returned by the OIDC provider or a uid string.
   */
  async get(claimsOrUid: any): Promise<UserContext[]> {
    const uid =
      typeof claimsOrUid === "string"
        ? claimsOrUid
        : claimsOrUid?.id ?? claimsOrUid?.sub ?? claimsOrUid?.email;

    const user = users.find(
      (u) => u.id === uid || u.email === uid
    );

    if (!user) return [];

    const { password, ...safeUser } = user;
    return [
      {
        user: safeUser,
        isAdmin: safeUser.roles.includes("Admin"),
      },
    ];
  }

  /**
   * Called for HTTP Basic Auth verification.
   */
  async verify(uid: string, pwd: string): Promise<UserContext> {
    const user = users.find(
      (u) => (u.id === uid || u.email === uid) && u.password === pwd
    );

    if (!user) {
      throw new Error("Invalid credentials");
    }

    const { password, ...safeUser } = user;
    return {
      user: safeUser,
      isAdmin: safeUser.roles.includes("Admin"),
    };
  }

  /** Expose the user list (useful for admin UI seeding) */
  getAllUsers(): Omit<User, never>[] {
    return users.map(({ password, ...u }) => u);
  }
}
