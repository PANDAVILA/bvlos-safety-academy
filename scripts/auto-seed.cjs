// Runs the SMS course loader ONCE automatically on startup (after bootstrap).
// A marker file in the data folder records that it already ran, so later restarts
// do not overwrite edits made in the admin. To reload the course content on purpose,
// bump SEED_VERSION below (or delete the marker file) and redeploy.
// This script never blocks startup: it always exits 0.

const fs = require("fs");
const path = require("path");
const { spawnSync } = require("child_process");

const SEED_VERSION = "v1";
const dbPath = process.env.DATABASE_PATH || path.join(process.cwd(), "data", "bvlos.db");
const marker = path.join(path.dirname(dbPath), `.sms-course-${SEED_VERSION}.done`);

try {
  if (fs.existsSync(marker)) {
    console.log("[auto-seed] SMS course already loaded, skipping.");
  } else {
    console.log("[auto-seed] Loading SMS course (first run)...");
    const res = spawnSync(process.execPath, [path.join(__dirname, "seed-sms-course.cjs")], { stdio: "inherit" });
    if (res.status === 0) {
      fs.writeFileSync(marker, new Date().toISOString() + "\n");
      console.log("[auto-seed] Done.");
    } else {
      console.log("[auto-seed] Loader did not finish (exit " + res.status + "). Will retry on next start.");
    }
  }
} catch (e) {
  console.log("[auto-seed] Skipped:", e && e.message);
}
process.exit(0);
