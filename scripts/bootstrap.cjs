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
  console.log("[bootstrap] Base de datos vacía: cargando contenido de ejemplo…");

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
    { slug: "fundamentos-bvlos", title: "Fundamentos de Operaciones BVLOS", subtitle: "La base normativa y operativa para volar más allá de la línea de visión.", description: "Curso introductorio que cubre el marco regulatorio, la terminología esencial (BVLOS, VLOS, GRC, ARC) y los principios de una operación segura. Diseñado para pilotos remotos y gestores de operaciones que inician su camino hacia BVLOS.", level: "foundation", category: "bvlos", priceCents: 24900, durationHours: 8, coverImage: "/brand/hero-1.png" },
    { slug: "metodologia-sora-avanzada", title: "Metodología SORA Avanzada", subtitle: "Evaluación cuantitativa del riesgo de tierra y aire para expedientes reales.", description: "Profundiza en el proceso SORA paso a paso: definición del ConOps, cálculo del GRC intrínseco, mitigaciones, determinación del ARC y estrategias de contención. Incluye plantillas descargables usadas en expedientes reales ante autoridad.", level: "advanced", category: "risk-assessment", priceCents: 44900, durationHours: 14, coverImage: "/brand/drift-1.png" },
    { slug: "sms-para-operadores-uas", title: "Sistemas de Gestión de Seguridad (SMS) para Operadores UAS", subtitle: "Diseña, implementa y audita un SMS conforme a estándares internacionales.", description: "Aprende a construir un Sistema de Gestión de Seguridad completo: política de seguridad, identificación de peligros, gestión de riesgo, aseguramiento y promoción de la seguridad, adaptado a operadores de aeronaves no tripuladas.", level: "specialist", category: "sms", priceCents: 59900, durationHours: 20, coverImage: "/brand/hero-2.png" },
    { slug: "conops-y-volumen-operacional", title: "Diseño de ConOps y Volumen Operacional", subtitle: "De la idea de misión a un concepto de operaciones defendible.", description: "Curso práctico para redactar un Concepto de Operaciones (ConOps) robusto: definición de la misión, volumen operacional, volumen de contingencia, y su integración en el espacio aéreo.", level: "foundation", category: "conops", priceCents: 19900, durationHours: 6, coverImage: "/brand/drift-2.png" },
    { slug: "gestion-de-mitigaciones-bvlos", title: "Gestión de Mitigaciones en Operaciones BVLOS", subtitle: "Del catálogo de mitigaciones al seguimiento de su eficacia operativa.", description: "Cómo seleccionar, justificar y hacer seguimiento de mitigaciones operacionales y técnicas (M1, M2, M3) a lo largo del ciclo de vida de la operación, con foco en trazabilidad ante auditoría.", level: "advanced", category: "risk-assessment", priceCents: 34900, durationHours: 10, coverImage: "/brand/drift-3.png" },
    { slug: "introduccion-espacio-aereo-no-segregado", title: "Introducción al Espacio Aéreo No Segregado para UAS", subtitle: "Clasificación del espacio aéreo, NOTAM y coordinación con ATC.", description: "Curso gratuito de nivelación: clasificación del espacio aéreo, lectura de cartas aeronáuticas, publicación de NOTAM y fundamentos de coordinación con control de tránsito aéreo para operaciones no tripuladas.", level: "foundation", category: "bvlos", priceCents: 0, durationHours: 3, coverImage: "/brand/hero-1.png" },
  ];

  for (const c of courses) {
    const courseId = uuid();
    insertCourse.run({ id: courseId, ...c });

    const moduleTitles = ["Introducción y marco normativo", "Metodología y herramientas", "Aplicación práctica y evaluación"];
    moduleTitles.forEach((mt, mi) => {
      const moduleId = uuid();
      insertModule.run({ id: moduleId, courseId, title: mt, order: mi });
      for (let li = 0; li < 3; li++) {
        insertLesson.run({
          id: uuid(),
          moduleId,
          title: `${mt} — Lección ${li + 1}`,
          content: "Contenido de la lección en formato texto enriquecido. Aquí iría el desarrollo teórico, ejemplos y referencias normativas correspondientes a este bloque del curso.",
          durationMinutes: 15 + li * 5,
          order: li,
          isPreview: mi === 0 && li === 0 ? 1 : 0,
        });
      }
    });
  }

  const articles = [
    { slug: "easa-actualiza-marco-bvlos-2026", title: "EASA actualiza el marco normativo para operaciones BVLOS en 2026", excerpt: "Nuevos requisitos de la categoría específica afectan a operadores que ya cuentan con autorización SORA.", body: "Contenido completo del artículo con el análisis detallado de los cambios normativos, su impacto en los operadores existentes y los plazos de adaptación previstos.", type: "news", coverImage: "/brand/hero-2.png", author: "Equipo Editorial BSA" },
    { slug: "corredores-bvlos-infraestructura-critica", title: "Corredores BVLOS para inspección de infraestructura crítica: primeros resultados", excerpt: "Un análisis de los primeros doce meses de operación de corredores aéreos dedicados a inspección energética.", body: "Contenido completo del artículo con estadísticas operativas, incidentes reportados y lecciones aprendidas del primer año de corredores BVLOS dedicados.", type: "news", coverImage: "/brand/drift-2.png", author: "Equipo Editorial BSA" },
    { slug: "estudio-deriva-operacional-2025", title: "Estudio técnico: deriva operacional como precursor de eventos reportables", excerpt: "Análisis de 340 vuelos BVLOS que identifica patrones de deriva antes de incidentes de pérdida de enlace.", body: "Informe técnico completo con metodología, muestra analizada, hallazgos estadísticos y recomendaciones de mitigación para operadores y diseñadores de sistemas de detección temprana.", type: "report", coverImage: "/brand/drift-1.png", author: "Departamento de Investigación BSA" },
    { slug: "benchmark-sms-operadores-uas", title: "Benchmark 2026: madurez de los Sistemas de Gestión de Seguridad en operadores UAS", excerpt: "Comparativa de madurez SMS entre 45 operadores certificados en tres regiones.", body: "Informe completo con la metodología de evaluación de madurez, resultados por región y categoría de operador, y recomendaciones para cerrar brechas identificadas.", type: "report", coverImage: "/brand/hero-1.png", author: "Departamento de Investigación BSA" },
  ];
  for (const a of articles) insertArticle.run({ id: uuid(), ...a });

  const products = [
    { slug: "ebook-guia-sora-paso-a-paso", title: "Guía SORA Paso a Paso (eBook)", description: "Manual práctico de 120 páginas con ejemplos reales de cálculo de GRC y ARC, y plantillas editables.", type: "ebook", priceCents: 3900, coverImage: "/brand/hero-2.png" },
    { slug: "plantilla-conops-editable", title: "Plantilla de ConOps Editable", description: "Documento editable en formato profesional, listo para adaptar a tu operación y presentar ante autoridad.", type: "template", priceCents: 1900, coverImage: "/brand/drift-2.png" },
    { slug: "checklist-preflight-bvlos", title: "Checklist Pre-Vuelo BVLOS", description: "Lista de verificación imprimible y digital para operaciones BVLOS, alineada con buenas prácticas SMS.", type: "checklist", priceCents: 900, coverImage: "/brand/drift-3.png" },
    { slug: "ebook-gestion-mitigaciones", title: "Gestión de Mitigaciones: Catálogo de Referencia (eBook)", description: "Catálogo comentado de mitigaciones M1, M2 y M3 con criterios de justificación y evidencia requerida.", type: "ebook", priceCents: 2900, coverImage: "/brand/hero-1.png" },
  ];
  for (const p of products) insertProduct.run({ id: uuid(), ...p });

  console.log("[bootstrap] Contenido de ejemplo cargado.");
} else {
  console.log(`[bootstrap] Base de datos ya inicializada (${courseCount} cursos). Nada que hacer.`);
}

db.close();
