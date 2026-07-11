import { sqliteTable, text, integer, real } from "drizzle-orm/sqlite-core";
import { sql } from "drizzle-orm";

// ---------- AUTH / USERS ----------
export const users = sqliteTable("users", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  passwordHash: text("password_hash").notNull(),
  role: text("role").notNull().default("student"), // student | admin | instructor
  company: text("company"),
  country: text("country"),
  createdAt: text("created_at").default(sql`CURRENT_TIMESTAMP`),
});

// ---------- LMS: COURSES ----------
export const courses = sqliteTable("courses", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  slug: text("slug").notNull().unique(),
  title: text("title").notNull(),
  subtitle: text("subtitle"),
  description: text("description").notNull(),
  level: text("level").notNull().default("foundation"), // foundation | advanced | specialist
  category: text("category").notNull().default("bvlos"), // bvlos | sms | conops | risk-assessment
  priceCents: integer("price_cents").notNull().default(0),
  currency: text("currency").notNull().default("USD"),
  durationHours: integer("duration_hours").notNull().default(0),
  coverImage: text("cover_image"),
  published: integer("published", { mode: "boolean" }).notNull().default(true),
  createdAt: text("created_at").default(sql`CURRENT_TIMESTAMP`),
});

export const modules = sqliteTable("modules", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  courseId: text("course_id").notNull().references(() => courses.id),
  title: text("title").notNull(),
  order: integer("order").notNull().default(0),
});

export const lessons = sqliteTable("lessons", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  moduleId: text("module_id").notNull().references(() => modules.id),
  title: text("title").notNull(),
  content: text("content").notNull().default(""),
  videoUrl: text("video_url"),
  durationMinutes: integer("duration_minutes").notNull().default(10),
  order: integer("order").notNull().default(0),
  isPreview: integer("is_preview", { mode: "boolean" }).notNull().default(false),
});

export const enrollments = sqliteTable("enrollments", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  userId: text("user_id").notNull().references(() => users.id),
  courseId: text("course_id").notNull().references(() => courses.id),
  status: text("status").notNull().default("active"), // active | completed
  progressPercent: real("progress_percent").notNull().default(0),
  createdAt: text("created_at").default(sql`CURRENT_TIMESTAMP`),
});

export const lessonProgress = sqliteTable("lesson_progress", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  userId: text("user_id").notNull().references(() => users.id),
  lessonId: text("lesson_id").notNull().references(() => lessons.id),
  completed: integer("completed", { mode: "boolean" }).notNull().default(false),
  completedAt: text("completed_at"),
});

// ---------- NEWS / REPORTS (content hub) ----------
export const articles = sqliteTable("articles", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  slug: text("slug").notNull().unique(),
  title: text("title").notNull(),
  excerpt: text("excerpt").notNull(),
  body: text("body").notNull(),
  type: text("type").notNull().default("news"), // news | report
  coverImage: text("cover_image"),
  author: text("author").notNull().default("BVLOS Safety Academy"),
  published: integer("published", { mode: "boolean" }).notNull().default(true),
  publishedAt: text("published_at").default(sql`CURRENT_TIMESTAMP`),
});

// ---------- DIGITAL PRODUCTS (ebooks, templates) ----------
export const products = sqliteTable("products", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  slug: text("slug").notNull().unique(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  type: text("type").notNull().default("ebook"), // ebook | template | checklist
  priceCents: integer("price_cents").notNull().default(0),
  currency: text("currency").notNull().default("USD"),
  coverImage: text("cover_image"),
  fileUrl: text("file_url"),
  published: integer("published", { mode: "boolean" }).notNull().default(true),
});

// ---------- ORDERS (courses + products, Stripe or PayPal) ----------
export const orders = sqliteTable("orders", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  userId: text("user_id").references(() => users.id),
  itemType: text("item_type").notNull(), // course | product | consulting
  itemId: text("item_id").notNull(),
  amountCents: integer("amount_cents").notNull(),
  currency: text("currency").notNull().default("USD"),
  provider: text("provider").notNull(), // stripe | paypal
  providerRef: text("provider_ref"), // session id / order id
  status: text("status").notNull().default("pending"), // pending | paid | failed
  email: text("email"),
  createdAt: text("created_at").default(sql`CURRENT_TIMESTAMP`),
});

// ---------- CONSULTING LEADS ----------
export const consultingLeads = sqliteTable("consulting_leads", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  name: text("name").notNull(),
  email: text("email").notNull(),
  company: text("company"),
  serviceInterest: text("service_interest").notNull(),
  message: text("message"),
  status: text("status").notNull().default("new"),
  createdAt: text("created_at").default(sql`CURRENT_TIMESTAMP`),
});
