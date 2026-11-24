// Loads course content ONCE per course automatically on startup (called from bootstrap.cjs).
// A marker file in the data folder records that a course was already loaded, so later
// restarts do not overwrite edits made in the admin. To reload a course on purpose,
// bump its "version" below (or delete its marker file) and redeploy.
// This script never blocks startup: it always exits 0.

const fs = require("fs");
const path = require("path");
const { spawnSync } = require("child_process");

const COURSES = [
  // marker keeps the original name for the SMS course so it is not loaded twice
  { folder: "sms-course-data", marker: "sms-course-v1", applyMeta: false },
  { folder: "risk-course-data", marker: "risk-course-v1", applyMeta: true },
  { folder: "conops-course-data", marker: "conops-course-v1", applyMeta: true },
];

// One-off scripts (run once per marker; bump the marker name to run again)
const SCRIPTS = [
  { script: "seed-resources.cjs", marker: "resources-v1" },
];

const dbPath = process.env.DATABASE_PATH || path.join(process.cwd(), "data", "bvlos.db");
const dataDir = path.dirname(dbPath);

for (const c of COURSES) {
  try {
    if (!fs.existsSync(path.join(__dirname, c.folder, "course.json"))) continue;
    const marker = path.join(dataDir, `.${c.marker}.done`);
    if (fs.existsSync(marker)) {
      console.log(`[auto-seed] ${c.folder}: already loaded, skipping.`);
      continue;
    }
    console.log(`[auto-seed] ${c.folder}: loading (first run)...`);
    const args = [path.join(__dirname, "seed-course.cjs"), c.folder];
    if (c.applyMeta) args.push("--apply-meta");
    const res = spawnSync(process.execPath, args, { stdio: "inherit" });
    if (res.status === 0) {
      fs.writeFileSync(marker, new Date().toISOString() + "\n");
      console.log(`[auto-seed] ${c.folder}: done.`);
    } else {
      console.log(`[auto-seed] ${c.folder}: did not finish (exit ${res.status}). Will retry on next start.`);
    }
  } catch (e) {
    console.log(`[auto-seed] ${c.folder}: skipped:`, e && e.message);
  }
}
for (const s of SCRIPTS) {
  try {
    const marker = path.join(dataDir, `.${s.marker}.done`);
    if (fs.existsSync(marker)) {
      console.log(`[auto-seed] ${s.script}: already done, skipping.`);
      continue;
    }
    console.log(`[auto-seed] ${s.script}: running...`);
    const res = spawnSync(process.execPath, [path.join(__dirname, s.script)], { stdio: "inherit" });
    if (res.status === 0) {
      fs.writeFileSync(marker, new Date().toISOString() + "\n");
      console.log(`[auto-seed] ${s.script}: done.`);
    } else {
      console.log(`[auto-seed] ${s.script}: did not finish (exit ${res.status}). Will retry on next start.`);
    }
  } catch (e) {
    console.log(`[auto-seed] ${s.script}: skipped:`, e && e.message);
  }
}
process.exit(0);
