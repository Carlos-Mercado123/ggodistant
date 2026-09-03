import "server-only";
import path from "node:path";
import fs from "node:fs";
import Database from "better-sqlite3";
import { hashPassword } from "@/lib/password";
import { slugify } from "@/lib/slug";
import seedData from "@/lib/seed/propuesta-valor.json";

const DATA_DIR = path.join(process.cwd(), "data");
const DB_PATH = path.join(DATA_DIR, "app.db");

declare global {
  var __db: Database.Database | undefined;
}

function createConnection(): Database.Database {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }

  const isNewDatabase = !fs.existsSync(DB_PATH);
  const db = new Database(DB_PATH);
  db.pragma("journal_mode = WAL");
  db.pragma("foreign_keys = ON");

  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS filter_tags (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      category TEXT NOT NULL CHECK(category IN ('cliente','objecion')),
      label TEXT UNIQUE NOT NULL,
      position INTEGER NOT NULL DEFAULT 0,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS careers (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      slug TEXT UNIQUE NOT NULL,
      name TEXT NOT NULL,
      position INTEGER NOT NULL DEFAULT 0,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS cards (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      section TEXT NOT NULL CHECK(section IN ('universidad','modalidad','carrera')),
      career_id INTEGER REFERENCES careers(id) ON DELETE CASCADE,
      title TEXT NOT NULL DEFAULT '',
      concept TEXT NOT NULL DEFAULT '',
      speech TEXT NOT NULL DEFAULT '',
      links TEXT NOT NULL DEFAULT '',
      position INTEGER NOT NULL DEFAULT 0,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      updated_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS card_tags (
      card_id INTEGER NOT NULL REFERENCES cards(id) ON DELETE CASCADE,
      tag_id INTEGER NOT NULL REFERENCES filter_tags(id) ON DELETE CASCADE,
      PRIMARY KEY (card_id, tag_id)
    );

    CREATE INDEX IF NOT EXISTS idx_cards_section ON cards(section);
    CREATE INDEX IF NOT EXISTS idx_cards_career ON cards(career_id);
  `);

  if (isNewDatabase) {
    seedDatabase(db);
  }

  return db;
}

function seedDatabase(db: Database.Database) {
  const seedTx = db.transaction(() => {
    const adminUsername = process.env.ADMIN_USERNAME || "admin";
    const adminPassword = process.env.ADMIN_PASSWORD || "admin123";
    db.prepare(
      `INSERT INTO users (username, password_hash) VALUES (?, ?)`
    ).run(adminUsername, hashPassword(adminPassword));

    const tagCache = new Map<string, number>();
    const insertTag = db.prepare(
      `INSERT INTO filter_tags (category, label, position) VALUES (?, ?, ?)`
    );
    const findTagId = db.prepare(
      `SELECT id FROM filter_tags WHERE lower(label) = lower(?)`
    );

    function ensureTag(category: "cliente" | "objecion", label: string): number {
      const key = label.toLowerCase().trim();
      if (tagCache.has(key)) return tagCache.get(key)!;
      const existing = findTagId.get(label) as { id: number } | undefined;
      if (existing) {
        tagCache.set(key, existing.id);
        return existing.id;
      }
      const result = insertTag.run(category, label, tagCache.size);
      const id = result.lastInsertRowid as number;
      tagCache.set(key, id);
      return id;
    }

    seedData.config_filtros.clientes.forEach((label) => ensureTag("cliente", label));
    seedData.config_filtros.objeciones.forEach((label) => ensureTag("objecion", label));

    const linkCardTag = db.prepare(
      `INSERT OR IGNORE INTO card_tags (card_id, tag_id) VALUES (?, ?)`
    );

    function attachTags(cardId: number, tagsCsv: string | undefined) {
      if (!tagsCsv) return;
      const labels = tagsCsv
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean);
      for (const label of labels) {
        const key = label.toLowerCase();
        const tagId = tagCache.get(key) ?? ensureTag("cliente", label);
        linkCardTag.run(cardId, tagId);
      }
    }

    const insertCard = db.prepare(`
      INSERT INTO cards (section, career_id, title, concept, speech, links, position)
      VALUES (@section, @career_id, @title, @concept, @speech, @links, @position)
    `);

    seedData.universidad.forEach((item, index) => {
      const result = insertCard.run({
        section: "universidad",
        career_id: null,
        title: item.titulo,
        concept: item.concepto,
        speech: item.speech,
        links: ("links" in item ? item.links : "") ?? "",
        position: index,
      });
      attachTags(result.lastInsertRowid as number, item.tags);
    });

    seedData.modalidad.forEach((item, index) => {
      const result = insertCard.run({
        section: "modalidad",
        career_id: null,
        title: item.titulo,
        concept: item.concepto,
        speech: item.speech,
        links: ("links" in item ? item.links : "") ?? "",
        position: index,
      });
      attachTags(result.lastInsertRowid as number, item.tags);
    });

    const insertCareer = db.prepare(
      `INSERT INTO careers (slug, name, position) VALUES (?, ?, ?)`
    );

    const careerEntries = Object.values(seedData.carreras);
    careerEntries.forEach((career, careerIndex) => {
      const slug = slugify(career.nombre);
      const careerResult = insertCareer.run(slug, career.nombre, careerIndex);
      const careerId = careerResult.lastInsertRowid as number;

      career.subcategories.forEach((sub, index) => {
        const result = insertCard.run({
          section: "carrera",
          career_id: careerId,
          title: sub.item,
          concept: sub.concepto,
          speech: sub.speech,
          links: ("links" in sub ? sub.links : "") ?? "",
          position: index,
        });
        attachTags(result.lastInsertRowid as number, sub.tags);
      });
    });
  });

  seedTx();
}

export function getDb(): Database.Database {
  if (!global.__db) {
    global.__db = createConnection();
  }
  return global.__db;
}
