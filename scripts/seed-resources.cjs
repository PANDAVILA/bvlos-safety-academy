// Loads / updates the Resources (store products): title, description, type, cover and file.
// Existing products are matched by slug (or by an old Spanish slug); price and published flag of existing products are NEVER changed.
// Called from auto-seed.cjs (once per marker version). Always exits 0 unless nothing could be done.
const fs = require("fs");
const path = require("path");
const crypto = require("crypto");
const Database = require("better-sqlite3");

const dbPath = process.env.DATABASE_PATH || path.join(process.cwd(), "data", "bvlos.db");
const list = JSON.parse(fs.readFileSync(path.join(__dirname, "resources-data", "products.json"), "utf8"));
const filesDir = path.join(__dirname, "..", "resources-files");

// Price used only when a product has to be CREATED (cents, USD).
const DEFAULT_PRICE = {
  "step-by-step-sms-guide-ebook": 3900,
  "mitigation-management-catalog-ebook": 2900,
  "uas-sms-manual-template": 3900,
  "editable-conops-template": 1900,
  "bvlos-preflight-checklist": 900,
  "uas-emergency-response-plan-template": 1500,
  "part-107-bvlos-waiver-kit": 2900,
  "sms-risk-register-workbook": 1900,
};
// old slug -> new slug (Spanish slugs used by early versions)
let legacy = {};
try { legacy = JSON.parse(fs.readFileSync(path.join(__dirname, "..", "lib", "legacy-slugs.json"), "utf8")).products || {}; } catch (e) {}
const oldSlugOf = {};
for (const [o, n] of Object.entries(legacy)) oldSlugOf[n] = o;

const db = new Database(dbPath);
const find = db.prepare("SELECT id FROM products WHERE slug = ?");
const upd = db.prepare("UPDATE products SET slug=@slug, title=@title, description=@description, type=@type, cover_image=@coverImage, file_url=@fileUrl WHERE id=@id");
const ins = db.prepare("INSERT INTO products (id, slug, title, description, type, price_cents, currency, cover_image, file_url, published) VALUES (@id,@slug,@title,@description,@type,@priceCents,'USD',@coverImage,@fileUrl,1)");

let created = 0, updated = 0, failed = 0;
for (const p of list) {
  try {
    if (!fs.existsSync(path.join(filesDir, p.fileUrl))) {
      console.log(`[seed-resources] WARNING: file missing for ${p.slug}: ${p.fileUrl}`);
    }
    let row = find.get(p.slug);
    if (!row && oldSlugOf[p.slug]) row = find.get(oldSlugOf[p.slug]);
    if (row) { upd.run({ ...p, id: row.id }); updated++; console.log(`[seed-resources] updated ${p.slug}`); }
    else {
      const priceCents = p.priceCents != null ? p.priceCents : (DEFAULT_PRICE[p.slug] != null ? DEFAULT_PRICE[p.slug] : 1900);
      ins.run({ ...p, priceCents, id: crypto.randomUUID() }); created++; console.log(`[seed-resources] created ${p.slug}`);
    }
  } catch (e) {
    failed++;
    console.log(`[seed-resources] ERROR with ${p.slug}: ${e && e.message}`);
  }
}
db.close();
console.log(`[seed-resources] ${created} created, ${updated} updated, ${failed} failed.`);
process.exit(failed > 0 ? 1 : 0);
