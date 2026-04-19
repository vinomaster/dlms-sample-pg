/**
 * src/server/appMgr.ts
 *
 * AppMgr extends DocMgr to provide the Team Outing sample application's
 * specific initialisation, mirroring the pattern shown in the original
 * dlms-server README.
 */

import { DocMgr } from "dlms-server-pg";
import { teamOutingDocuments, initialUserGroups } from "./teamOutingTypes";
import { MyUserProfileService } from "./myUserProfileService";
import { logger } from "./logger";

export class AppMgr extends DocMgr {
  private static _appInstance: AppMgr;

  public static async init(simpleInit?: boolean): Promise<AppMgr> {
    logger.info("Initialising AppMgr (Polyglot edition)");
    const mgr = new AppMgr();
    DocMgr.setInstance(mgr);
    await mgr.init(simpleInit);
    AppMgr._appInstance = mgr;
    logger.info("AppMgr ready");
    return mgr;
  }

  public static getInstance(): AppMgr {
    return DocMgr.getInstance() as AppMgr;
  }

  constructor() {
    super({
      appName: "TeamOutingPlanner",
      documents: teamOutingDocuments,
      adminGroups: ["Admin"],
      adminRole: "Admin",
      roles: ["Admin", "Reviewer", "Employee"],
      email: process.env.APP_EMAIL ?? "noreply@dlms-sample.local",
      userGroups: initialUserGroups,
      userProfileService: new MyUserProfileService(),
      // pgUrl and openSearchUrl are picked up from environment variables
    });
  }

  public async init(simpleInit?: boolean): Promise<void> {
    await super.init(simpleInit);

    // Seed the Reviewer group with the hardcoded reviewer user if empty
    // (so the app works out-of-the-box without the Admin setup step)
    try {
      const reviewerGroup = await this.getUserGroup("Reviewer");
      if (reviewerGroup.members.length === 0 && process.env.NODE_ENV !== "production") {
        await this.db.updateGroup("Reviewer", {
          members: [
            {
              email: "reviewer@test.com",
              name: "Riley Reviewer",
              department: "Management",
              title: "Engineering Manager",
              employeeNumber: "003",
            },
          ],
        });
        logger.info("Dev seed: added reviewer@test.com to Reviewer group");
      }
    } catch {
      // Group may not exist yet – that's fine, it will be created by super.init()
    }
  }
}
