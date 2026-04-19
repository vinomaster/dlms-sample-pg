/**
 * src/server/server.ts
 *
 * Entry point for the Team Outing Planner sample application.
 * Initialises AppMgr then starts the DLMS Polyglot Express server.
 */

import path from "path";
import { createApp } from "dlms-server-pg";
import { AppMgr } from "./appMgr";
import { logger } from "./logger";

// Load .env in development
if (process.env.NODE_ENV !== "production") {
  try { require("dotenv").config({ path: path.resolve(__dirname, "../../.env") }); }
  catch { /* dotenv optional */ }
}

const PORT = parseInt(process.env.PORT ?? "4000", 10);

async function main() {
  // 1. Initialise DocMgr with PostgreSQL + OpenSearch
  await AppMgr.init();

  // 2. Create and configure the Express app
  const app = createApp();

  // 3. Listen
  const server = app.listen(PORT, () => {
    logger.info(`Team Outing Planner running at http://localhost:${PORT}`);
    logger.info(`  PostgreSQL : ${process.env.PG_HOST ?? "localhost"}:${process.env.PG_PORT ?? "5432"}`);
    logger.info(`  OpenSearch : ${process.env.OPENSEARCH_ENDPOINT ?? "http://localhost:9200"}`);
    logger.info(`  S3 Bucket  : ${process.env.ATTACHMENTS_BUCKET ?? "dlms-attachments"}`);
  });

  // Graceful shutdown
  const stop = async (sig: string) => {
    logger.info(`${sig} – shutting down`);
    server.close(async () => {
      await AppMgr.getInstance().shutdown();
      process.exit(0);
    });
  };
  process.on("SIGTERM", () => stop("SIGTERM"));
  process.on("SIGINT", () => stop("SIGINT"));
}

main().catch((err) => {
  logger.error("Fatal startup error", { err });
  process.exit(1);
});
