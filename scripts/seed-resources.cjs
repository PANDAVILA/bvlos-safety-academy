// Loads / updates the Resources (store products): title, description, type, cover and file.
// Existing products are matched by slug; price and published flag of existing products are NEVER changed.
// Called from auto-seed.cjs (once per marker version). Always exits 0.
const fs = require("fs");
const path = require("path");
const crypto = require("crypto");
const Database = require("better-sqlite3");

const dbPath = process.env.DATABASE_PATH || path.join(process.cwd(), "data", "bvlos.db");
const list = JSON.parse(fs.readFileSync(path.join(__dirname, "resources-data", "products.json"), "utf8"));
const filesDir = path.join(__dirname, "..", "resources-files");

const db = new Database(dbPath);
const find = db.prepare("SELECT id FROM products WHERE slug = ?");
const upd = db.prepare("UPDATE products SET title=@title, description=@description, type=@type, cover_image=@coverImage, file_url=@fileUrl WHERE id=@id");
const ins = db.prepare("INSERT INTO products (id, slug, title, description, type, price_cents, currency, cover_image, file_url, published) VALUES (@id,@slug,@title,@description,@type,@priceCents,'USD',@coverImage,@fileUrl,1)");

let created = 0, updated = 0;
for (const p of list) {
  if (!fs.existsSync(path.join(filesDir, p.fileUrl))) {
    console.log(`[seed-resources] WARNING: file missing for ${p.slug}: ${p.fileUrl}`);
  }
  const row = find.get(p.slug);
  if (row) { upd.run({ ...p, id: row.id }); updated++; }
  else { ins.run({ ...p, id: crypto.randomUUID() }); created++; }
}
db.close();
console.log(`[seed-resources] ${created} created, ${updated} updated.`);
