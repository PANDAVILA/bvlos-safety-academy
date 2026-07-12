// Bootstraps the SQLite database on startup: creates tables if they don't
// exist yet, and loads sample content the first time the app runs.
// Written in plain CommonJS (no drizzle-kit / tsx) so it's safe to run in
// a minimal production install on Railway, Render, or any Node host.
const Database = require("better-sqlite3");
const path = require("path");
const fs = require("fs");
const crypto = require("crypto");

const dbPath = process.env.DATABASE_PATH || path.join(process.cwd(), "data", "bvlos.db");
fs.mkdirSync(path.dirname(dbPath), { recursive: true });

const db = new Database(dbPath);
db.pragma("journal_mode = WAL");

db.exec(`
CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'student',
  company TEXT,
  country TEXT,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS courses (
  id TEXT PRIMARY KEY,
  slug TEXT NOT NULL UNIQUE,
  title TEXT NOT NULL,
  subtitle TEXT,
  description TEXT NOT NULL,
  level TEXT NOT NULL DEFAULT 'foundation',
  category TEXT NOT NULL DEFAULT 'bvlos',
  price_cents INTEGER NOT NULL DEFAULT 0,
  currency TEXT NOT NULL DEFAULT 'USD',
  duration_hours INTEGER NOT NULL DEFAULT 0,
  cover_image TEXT,
  published INTEGER NOT NULL DEFAULT 1,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS modules (
  id TEXT PRIMARY KEY,
  course_id TEXT NOT NULL REFERENCES courses(id),
  title TEXT NOT NULL,
  "order" INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS lessons (
  id TEXT PRIMARY KEY,
  module_id TEXT NOT NULL REFERENCES modules(id),
  title TEXT NOT NULL,
  content TEXT NOT NULL DEFAULT '',
  video_url TEXT,
  duration_minutes INTEGER NOT NULL DEFAULT 10,
  "order" INTEGER NOT NULL DEFAULT 0,
  is_preview INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS enrollments (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id),
  course_id TEXT NOT NULL REFERENCES courses(id),
  status TEXT NOT NULL DEFAULT 'active',
  progress_percent REAL NOT NULL DEFAULT 0,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS lesson_progress (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id),
  lesson_id TEXT NOT NULL REFERENCES lessons(id),
  completed INTEGER NOT NULL DEFAULT 0,
  completed_at TEXT
);

CREATE TABLE IF NOT EXISTS articles (
  id TEXT PRIMARY KEY,
  slug TEXT NOT NULL UNIQUE,
  title TEXT NOT NULL,
  excerpt TEXT NOT NULL,
  body TEXT NOT NULL,
  type TEXT NOT NULL DEFAULT 'news',
  cover_image TEXT,
  author TEXT NOT NULL DEFAULT 'BVLOS Safety Academy',
  published INTEGER NOT NULL DEFAULT 1,
  published_at TEXT DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS products (
  id TEXT PRIMARY KEY,
  slug TEXT NOT NULL UNIQUE,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  type TEXT NOT NULL DEFAULT 'ebook',
  price_cents INTEGER NOT NULL DEFAULT 0,
  currency TEXT NOT NULL DEFAULT 'USD',
  cover_image TEXT,
  file_url TEXT,
  published INTEGER NOT NULL DEFAULT 1
);

CREATE TABLE IF NOT EXISTS orders (
  id TEXT PRIMARY KEY,
  user_id TEXT REFERENCES users(id),
  item_type TEXT NOT NULL,
  item_id TEXT NOT NULL,
  amount_cents INTEGER NOT NULL,
  currency TEXT NOT NULL DEFAULT 'USD',
  provider TEXT NOT NULL,
  provider_ref TEXT,
  status TEXT NOT NULL DEFAULT 'pending',
  email TEXT,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS consulting_leads (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  company TEXT,
  service_interest TEXT NOT NULL,
  message TEXT,
  status TEXT NOT NULL DEFAULT 'new',
  created_at TEXT DEFAULT CURRENT_TIMESTAMP
);
`);

const courseCount = db.prepare("SELECT COUNT(*) AS n FROM courses").get().n;

if (courseCount === 0) {
  console.log("[bootstrap] Empty database: loading sample content…");

  const uuid = () => crypto.randomUUID();

  const insertCourse = db.prepare(`
    INSERT INTO courses (id, slug, title, subtitle, description, level, category, price_cents, currency, duration_hours, cover_image, published)
    VALUES (@id, @slug, @title, @subtitle, @description, @level, @category, @priceCents, 'USD', @durationHours, @coverImage, 1)
  `);
  const insertModule = db.prepare(`INSERT INTO modules (id, course_id, title, "order") VALUES (@id, @courseId, @title, @order)`);
  const insertLesson = db.prepare(`
    INSERT INTO lessons (id, module_id, title, content, duration_minutes, "order", is_preview)
    VALUES (@id, @moduleId, @title, @content, @durationMinutes, @order, @isPreview)
  `);
  const insertArticle = db.prepare(`
    INSERT INTO articles (id, slug, title, excerpt, body, type, cover_image, author)
    VALUES (@id, @slug, @title, @excerpt, @body, @type, @coverImage, @author)
  `);
  const insertProduct = db.prepare(`
    INSERT INTO products (id, slug, title, description, type, price_cents, currency, cover_image)
    VALUES (@id, @slug, @title, @description, @type, @priceCents, 'USD', @coverImage)
  `);

  const courses = [
    { slug: "fundamentos-bvlos", title: "BVLOS Operations Fundamentals", subtitle: "The regulatory and operational foundation for flying beyond visual line of sight.", description: "An introductory course covering the regulatory framework, essential terminology (BVLOS, VLOS, GRC, ARC), and the principles of a safe operation. Designed for remote pilots and operations managers starting their journey into BVLOS.", level: "foundation", category: "bvlos", priceCents: 24900, durationHours: 8, coverImage: "/brand/hero-1.png" },
    { slug: "metodologia-sora-avanzada", title: "Advanced SORA Methodology", subtitle: "Quantitative ground and air risk assessment for real operational dossiers.", description: "A deep dive into the SORA process step by step: ConOps definition, intrinsic GRC calculation, mitigations, ARC determination, and containment strategies. Includes downloadable templates used in real dossiers submitted to authorities.", level: "advanced", category: "risk-assessment", priceCents: 44900, durationHours: 14, coverImage: "/brand/drift-1.png" },
    { slug: "sms-para-operadores-uas", title: "Safety Management Systems (SMS) for UAS Operators", subtitle: "Design, implement, and audit an SMS aligned with international standards.", description: "Learn to build a complete Safety Management System: safety policy, hazard identification, risk management, safety assurance, and safety promotion, adapted for uncrewed aircraft operators.", level: "specialist", category: "sms", priceCents: 59900, durationHours: 20, coverImage: "/brand/hero-2.png" },
    { slug: "conops-y-volumen-operacional", title: "ConOps and Operational Volume Design", subtitle: "From mission concept to a defensible concept of operations.", description: "A hands-on course for drafting a robust Concept of Operations (ConOps): mission definition, operational volume, contingency volume, and its integration into the airspace.", level: "foundation", category: "conops", priceCents: 19900, durationHours: 6, coverImage: "/brand/drift-2.png" },
    { slug: "gestion-de-mitigaciones-bvlos", title: "Mitigation Management in BVLOS Operations", subtitle: "From the mitigation catalog to tracking its operational effectiveness.", description: "How to select, justify, and track operational and technical mitigations (M1, M2, M3) throughout the operation's lifecycle, with a focus on audit traceability.", level: "advanced", category: "risk-assessment", priceCents: 34900, durationHours: 10, coverImage: "/brand/drift-3.png" },
    { slug: "introduccion-espacio-aereo-no-segregado", title: "Introduction to Non-Segregated Airspace for UAS", subtitle: "Airspace classification, NOTAMs, and coordination with ATC.", description: "A free foundation course: airspace classification, reading aeronautical charts, publishing NOTAMs, and the fundamentals of air traffic control coordination for uncrewed operations.", level: "foundation", category: "bvlos", priceCents: 0, durationHours: 3, coverImage: "/brand/hero-1.png" },
  ];

  for (const c of courses) {
    const courseId = uuid();
    insertCourse.run({ id: courseId, ...c });

    const moduleTitles = ["Introduction and regulatory framework", "Methodology and tools", "Practical application and assessment"];
    moduleTitles.forEach((mt, mi) => {
      const moduleId = uuid();
      insertModule.run({ id: moduleId, courseId, title: mt, order: mi });
      for (let li = 0; li < 3; li++) {
        insertLesson.run({
          id: uuid(),
          moduleId,
          title: `${mt} — Lesson ${li + 1}`,
          content: "Lesson content in rich text format. This is where the theoretical development, examples, and regulatory references for this block of the course would go.",
          durationMinutes: 15 + li * 5,
          order: li,
          isPreview: mi === 0 && li === 0 ? 1 : 0,
        });
      }
    });
  }

  const articles = [
    { slug: "easa-actualiza-marco-bvlos-2026", title: "EASA updates the regulatory framework for BVLOS operations in 2026", excerpt: "New specific-category requirements affect operators who already hold a SORA authorization.", body: "Full article content with a detailed analysis of the regulatory changes, their impact on existing operators, and the expected adaptation timelines.", type: "news", coverImage: "/brand/hero-2.png", author: "BSA Editorial Team" },
    { slug: "corredores-bvlos-infraestructura-critica", title: "BVLOS corridors for critical infrastructure inspection: first results", excerpt: "An analysis of the first twelve months of dedicated aerial corridors for energy-sector inspection.", body: "Full article content with operational statistics, reported incidents, and lessons learned from the first year of dedicated BVLOS corridors.", type: "news", coverImage: "/brand/drift-2.png", author: "BSA Editorial Team" },
    { slug: "estudio-deriva-operacional-2025", title: "Technical study: operational drift as a precursor to reportable events", excerpt: "An analysis of 340 BVLOS flights identifying drift patterns before link-loss incidents.", body: "Full technical report with methodology, sample analyzed, statistical findings, and mitigation recommendations for operators and early-detection system designers.", type: "report", coverImage: "/brand/drift-1.png", author: "BSA Research Department" },
    { slug: "benchmark-sms-operadores-uas", title: "2026 Benchmark: Safety Management System maturity among UAS operators", excerpt: "An SMS maturity comparison across 45 certified operators in three regions.", body: "Full report with the maturity assessment methodology, results by region and operator category, and recommendations for closing identified gaps.", type: "report", coverImage: "/brand/hero-1.png", author: "BSA Research Department" },
  ];
  for (const a of articles) insertArticle.run({ id: uuid(), ...a });

  const products = [
    { slug: "ebook-guia-sora-paso-a-paso", title: "The Step-by-Step SORA Guide (eBook)", description: "A 120-page practical manual with real-world GRC and ARC calculation examples and editable templates.", type: "ebook", priceCents: 3900, coverImage: "/brand/hero-2.png" },
    { slug: "plantilla-conops-editable", title: "Editable ConOps Template", description: "A professionally formatted, editable document ready to adapt to your operation and submit to authorities.", type: "template", priceCents: 1900, coverImage: "/brand/drift-2.png" },
    { slug: "checklist-preflight-bvlos", title: "BVLOS Pre-Flight Checklist", description: "A printable and digital checklist for BVLOS operations, aligned with SMS best practices.", type: "checklist", priceCents: 900, coverImage: "/brand/drift-3.png" },
    { slug: "ebook-gestion-mitigaciones", title: "Mitigation Management: Reference Catalog (eBook)", description: "An annotated catalog of M1, M2, and M3 mitigations with justification criteria and required evidence.", type: "ebook", priceCents: 2900, coverImage: "/brand/hero-1.png" },
  ];
  for (const p of products) insertProduct.run({ id: uuid(), ...p });

  console.log("[bootstrap] Sample content loaded.");
} else {
  console.log(`[bootstrap] Database already initialized (${courseCount} courses). Nothing to do.`);
}

db.close();
