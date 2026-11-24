// Generic course content loader.
//   node scripts/seed-course.cjs <data-folder-name> [--dry-run] [--apply-meta]
// where <data-folder-name> is a folder inside scripts/ (for example sms-course-data)
// that holds course.json, lessons/, narration/ and quizzes/.
//
// Safe to re-run. It UPDATES the course in place:
//  - lessons and modules are matched by title, so lesson ids and student progress are kept
//  - Synthesia / video URLs you set in the admin (per lesson or per module) are NOT overwritten
//  - module quizzes, lesson text and illustrations are refreshed from scripts/sms-course-data/
//  - price, duration, title, cover image and published status are NOT changed,
//    unless you pass --apply-meta (used once, automatically, for brand-new courses)
//  - add --dry-run to see what would change without writing anything

const Database = require("better-sqlite3");
const path = require("path");
const fs = require("fs");
const crypto = require("crypto");

const DRY = process.argv.includes("--dry-run");
const APPLY_META = process.argv.includes("--apply-meta");
const folder = process.argv.slice(2).find((a) => !a.startsWith("--"));
if (!folder) {
  console.error("Usage: node scripts/seed-course.cjs <data-folder-name> [--dry-run] [--apply-meta]");
  process.exit(1);
}
const dataDir = path.join(__dirname, folder);
const TAG = `[seed:${folder}]`;
const spec = JSON.parse(fs.readFileSync(path.join(dataDir, "course.json"), "utf8"));

const dbPath = process.env.DATABASE_PATH || path.join(process.cwd(), "data", "bvlos.db");
const db = new Database(dbPath);
db.pragma("journal_mode = WAL");
const uuid = () => crypto.randomUUID();

function ensureColumn(table, column, definition) {
  const cols = db.prepare(`PRAGMA table_info(${table})`).all();
  if (!cols.some((c) => c.name === column)) db.exec(`ALTER TABLE ${table} ADD COLUMN ${column} ${definition}`);
}
ensureColumn("modules", "video_url", "TEXT");

function transcript(id) {
  const f = path.join(dataDir, "narration", `${id}.txt`);
  if (!fs.existsSync(f)) return "";
  const paras = fs.readFileSync(f, "utf8").trim().split(/\n\s*\n/);
  return `<details>\n<summary>Video script (transcript)</summary>\n\n${paras.join("\n\n")}\n\n</details>`;
}
function lessonContent(l) {
  let md = fs.readFileSync(path.join(dataDir, "lessons", `${l.file}.md`), "utf8").trim();
  md = md.replace("{{TRANSCRIPT}}", transcript(l.file));
  return md;
}
function quiz(name) {
  const q = JSON.parse(fs.readFileSync(path.join(dataDir, "quizzes", `${name}.json`), "utf8"));
  for (const item of q) {
    const correct = item.options.filter((o) => o.correct).length;
    if (correct !== 1) throw new Error(`Quiz ${name}: "${item.question.slice(0, 50)}" has ${correct} correct answers`);
  }
  return q;
}

const legacy = [].concat(spec.legacySlug || []);
let course = db.prepare("SELECT * FROM courses WHERE slug = ?").get(spec.slug);
for (const l of legacy) if (!course) course = db.prepare("SELECT * FROM courses WHERE slug = ?").get(l);
const meta = spec.meta || null;

if (!course) {
  if (!meta) {
    console.error(`${TAG} No course found with slug "${spec.slug}" and no "meta" block to create it. Nothing was changed.`);
    process.exit(1);
  }
  const id = uuid();
  console.log(`${TAG} Creating new course: ${meta.title}`);
  if (!DRY) {
    db.prepare(
      "INSERT INTO courses (id, slug, title, subtitle, description, learning_outcomes, frameworks, level, category, price_cents, currency, duration_hours, cover_image, published) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'USD', ?, ?, ?)"
    ).run(id, spec.slug, meta.title, spec.subtitle, spec.description, spec.learningOutcomes.join("\n"), spec.frameworks || null, meta.level, meta.category, meta.priceCents, meta.durationHours, meta.coverImage || null, meta.published === false ? 0 : 1);
  }
  course = { id, title: meta.title, slug: spec.slug };
} else if (meta && APPLY_META) {
  console.log(`${TAG} Applying course settings (title, level, price, duration, cover, published) to: ${course.title}`);
  if (!DRY) {
    db.prepare(
      "UPDATE courses SET slug = ?, title = ?, level = ?, category = ?, price_cents = ?, duration_hours = ?, cover_image = COALESCE(?, cover_image), published = ?, frameworks = COALESCE(?, frameworks) WHERE id = ?"
    ).run(spec.slug, meta.title, meta.level, meta.category, meta.priceCents, meta.durationHours, meta.coverImage || null, meta.published === false ? 0 : 1, spec.frameworks || null, course.id);
  }
}
console.log(`${TAG} Course: ${course.title} (${course.id})${DRY ? "  [dry run]" : ""}`);

const run = (fn) => {
  if (!DRY) fn();
};

const tx = db.transaction(() => {
  run(() =>
    db
      .prepare("UPDATE courses SET subtitle = ?, description = ?, learning_outcomes = ?, frameworks = COALESCE(?, frameworks) WHERE id = ?")
      .run(spec.subtitle, spec.description, spec.learningOutcomes.join("\n"), spec.frameworks || null, course.id)
  );

  const existingModules = db.prepare('SELECT * FROM modules WHERE course_id = ? ORDER BY "order"').all(course.id);
  const keepModuleIds = new Set();
  let nLessons = 0;

  spec.modules.forEach((m, mi) => {
    const qjson = JSON.stringify(quiz(m.quiz));
    let mod = existingModules.find((x) => x.title === m.title);
    let moduleId;
    if (mod) {
      moduleId = mod.id;
      run(() => db.prepare('UPDATE modules SET "order" = ?, quiz_json = ? WHERE id = ?').run(mi, qjson, moduleId));
    } else {
      moduleId = uuid();
      run(() =>
        db.prepare('INSERT INTO modules (id, course_id, title, "order", quiz_json) VALUES (?, ?, ?, ?, ?)').run(moduleId, course.id, m.title, mi, qjson)
      );
    }
    keepModuleIds.add(moduleId);

    const existingLessons = mod ? db.prepare('SELECT * FROM lessons WHERE module_id = ?').all(moduleId) : [];
    const keepLessonIds = new Set();
    m.lessons.forEach((l, li) => {
      const content = lessonContent(l);
      const old = existingLessons.find((x) => x.title === l.title);
      const att = l.attachmentUrl || null;
      const attName = l.attachmentName || null;
      if (old) {
        keepLessonIds.add(old.id);
        run(() =>
          db
            .prepare('UPDATE lessons SET content = ?, duration_minutes = ?, "order" = ?, is_preview = ?, image = ?, attachment_url = ?, attachment_name = ? WHERE id = ?')
            .run(content, l.duration, li, l.preview ? 1 : 0, l.image || null, att, attName, old.id)
        );
      } else {
        const id = uuid();
        keepLessonIds.add(id);
        run(() =>
          db
            .prepare('INSERT INTO lessons (id, module_id, title, content, duration_minutes, "order", is_preview, image, attachment_url, attachment_name) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)')
            .run(id, moduleId, l.title, content, l.duration, li, l.preview ? 1 : 0, l.image || null, att, attName)
        );
      }
      nLessons++;
    });
    // lessons that are no longer part of the course
    for (const old of existingLessons) {
      if (!keepLessonIds.has(old.id)) {
        console.log(`${TAG}   removing old lesson: ${old.title}`);
        run(() => {
          db.prepare("DELETE FROM lesson_progress WHERE lesson_id = ?").run(old.id);
          db.prepare("DELETE FROM lessons WHERE id = ?").run(old.id);
        });
      }
    }
    console.log(`${TAG} Module ${mi + 1}: ${m.title} — ${m.lessons.length} lessons, ${JSON.parse(qjson).length} quiz questions${mod ? "" : " (new)"}`);
  });

  for (const old of existingModules) {
    if (!keepModuleIds.has(old.id)) {
      console.log(`${TAG} removing old module: ${old.title}`);
      run(() => {
        for (const l of db.prepare("SELECT id FROM lessons WHERE module_id = ?").all(old.id)) {
          db.prepare("DELETE FROM lesson_progress WHERE lesson_id = ?").run(l.id);
        }
        db.prepare("DELETE FROM lessons WHERE module_id = ?").run(old.id);
        db.prepare("DELETE FROM modules WHERE id = ?").run(old.id);
      });
    }
  }
  console.log(`${TAG} ${DRY ? "Would load" : "Loaded"} ${spec.modules.length} modules and ${nLessons} lessons.`);
});
tx();
db.close();
console.log(DRY ? `${TAG} Dry run finished, nothing was written.` : `${TAG} Done. Course loaded: ${spec.slug}`);
