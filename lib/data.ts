import "server-only";
import { getDb } from "@/lib/db";
import { slugify } from "@/lib/slug";
import type { Card, Career, Section, Tag, TagCategory } from "@/lib/types";

function rowToTag(row: { id: number; category: TagCategory; label: string }): Tag {
  return { id: row.id, category: row.category, label: row.label };
}

export function getFilterTags(): { clientes: Tag[]; objeciones: Tag[] } {
  const db = getDb();
  const rows = db
    .prepare(
      `SELECT id, category, label FROM filter_tags ORDER BY position ASC, id ASC`
    )
    .all() as { id: number; category: TagCategory; label: string }[];

  return {
    clientes: rows.filter((r) => r.category === "cliente").map(rowToTag),
    objeciones: rows.filter((r) => r.category === "objecion").map(rowToTag),
  };
}

export function createFilterTag(category: TagCategory, label: string): Tag {
  const db = getDb();
  const trimmed = label.trim();
  const maxPosition = db
    .prepare(`SELECT COALESCE(MAX(position), -1) as maxPos FROM filter_tags`)
    .get() as { maxPos: number };

  const result = db
    .prepare(
      `INSERT INTO filter_tags (category, label, position) VALUES (?, ?, ?)`
    )
    .run(category, trimmed, maxPosition.maxPos + 1);

  return { id: result.lastInsertRowid as number, category, label: trimmed };
}

export function deleteFilterTag(id: number) {
  getDb().prepare(`DELETE FROM filter_tags WHERE id = ?`).run(id);
}

function attachTags(cards: Omit<Card, "tags">[]): Card[] {
  if (cards.length === 0) return [];
  const db = getDb();
  const ids = cards.map((c) => c.id);
  const placeholders = ids.map(() => "?").join(",");
  const tagRows = db
    .prepare(
      `SELECT ct.card_id as cardId, ft.id, ft.category, ft.label
       FROM card_tags ct
       JOIN filter_tags ft ON ft.id = ct.tag_id
       WHERE ct.card_id IN (${placeholders})
       ORDER BY ft.position ASC, ft.id ASC`
    )
    .all(...ids) as { cardId: number; id: number; category: TagCategory; label: string }[];

  const tagsByCard = new Map<number, Tag[]>();
  for (const row of tagRows) {
    const list = tagsByCard.get(row.cardId) ?? [];
    list.push(rowToTag(row));
    tagsByCard.set(row.cardId, list);
  }

  return cards.map((c) => ({ ...c, tags: tagsByCard.get(c.id) ?? [] }));
}

function rowToCardBase(row: {
  id: number;
  section: Section;
  career_id: number | null;
  title: string;
  concept: string;
  speech: string;
  links: string;
  position: number;
}): Omit<Card, "tags"> {
  return {
    id: row.id,
    section: row.section,
    careerId: row.career_id,
    title: row.title,
    concept: row.concept,
    speech: row.speech,
    links: row.links,
    position: row.position,
  };
}

export function getCardsBySection(section: "universidad" | "modalidad"): Card[] {
  const db = getDb();
  const rows = db
    .prepare(
      `SELECT id, section, career_id, title, concept, speech, links, position
       FROM cards WHERE section = ? ORDER BY position ASC, id ASC`
    )
    .all(section) as Parameters<typeof rowToCardBase>[0][];

  return attachTags(rows.map(rowToCardBase));
}

export function getCardsByCareer(careerId: number): Card[] {
  const db = getDb();
  const rows = db
    .prepare(
      `SELECT id, section, career_id, title, concept, speech, links, position
       FROM cards WHERE section = 'carrera' AND career_id = ? ORDER BY position ASC, id ASC`
    )
    .all(careerId) as Parameters<typeof rowToCardBase>[0][];

  return attachTags(rows.map(rowToCardBase));
}

export function createCard(params: {
  section: Section;
  careerId: number | null;
  title: string;
  concept: string;
  speech: string;
}): number {
  const db = getDb();
  const scope =
    params.section === "carrera"
      ? { where: "section = 'carrera' AND career_id = ?", args: [params.careerId] }
      : { where: "section = ?", args: [params.section] };

  // Generic proposals (universidad/modalidad) appear newest-first, like the
  // reference tool. Career subcategories append at the end instead.
  const prepend = params.section !== "carrera";
  const aggregate = prepend
    ? `SELECT COALESCE(MIN(position), 1) as pos FROM cards WHERE ${scope.where}`
    : `SELECT COALESCE(MAX(position), -1) as pos FROM cards WHERE ${scope.where}`;

  const edge = db.prepare(aggregate).get(...scope.args) as { pos: number };
  const position = prepend ? edge.pos - 1 : edge.pos + 1;

  const result = db
    .prepare(
      `INSERT INTO cards (section, career_id, title, concept, speech, links, position)
       VALUES (@section, @careerId, @title, @concept, @speech, '', @position)`
    )
    .run({
      section: params.section,
      careerId: params.careerId,
      title: params.title,
      concept: params.concept,
      speech: params.speech,
      position,
    });

  return result.lastInsertRowid as number;
}

const EDITABLE_FIELDS = new Set(["title", "concept", "speech", "links"]);

export function updateCardField(
  cardId: number,
  field: "title" | "concept" | "speech" | "links",
  value: string
) {
  if (!EDITABLE_FIELDS.has(field)) {
    throw new Error(`Campo no editable: ${field}`);
  }
  getDb()
    .prepare(`UPDATE cards SET ${field} = ?, updated_at = datetime('now') WHERE id = ?`)
    .run(value, cardId);
}

export function deleteCard(cardId: number) {
  getDb().prepare(`DELETE FROM cards WHERE id = ?`).run(cardId);
}

export function moveCard(cardId: number, direction: -1 | 1) {
  const db = getDb();
  const card = db
    .prepare(`SELECT id, section, career_id, position FROM cards WHERE id = ?`)
    .get(cardId) as
    | { id: number; section: Section; career_id: number | null; position: number }
    | undefined;
  if (!card) return;

  const scope =
    card.section === "carrera"
      ? { where: "section = 'carrera' AND career_id = ?", args: [card.career_id] }
      : { where: "section = ?", args: [card.section] };

  const neighbor = db
    .prepare(
      `SELECT id, position FROM cards WHERE ${scope.where} AND position ${
        direction === -1 ? "<" : ">"
      } ? ORDER BY position ${direction === -1 ? "DESC" : "ASC"} LIMIT 1`
    )
    .get(...scope.args, card.position) as { id: number; position: number } | undefined;

  if (!neighbor) return;

  const swap = db.transaction(() => {
    db.prepare(`UPDATE cards SET position = ? WHERE id = ?`).run(neighbor.position, card.id);
    db.prepare(`UPDATE cards SET position = ? WHERE id = ?`).run(card.position, neighbor.id);
  });
  swap();
}

export function addTagToCard(cardId: number, tagId: number) {
  getDb()
    .prepare(`INSERT OR IGNORE INTO card_tags (card_id, tag_id) VALUES (?, ?)`)
    .run(cardId, tagId);
}

export function removeTagFromCard(cardId: number, tagId: number) {
  getDb()
    .prepare(`DELETE FROM card_tags WHERE card_id = ? AND tag_id = ?`)
    .run(cardId, tagId);
}

export function getCareers(): Career[] {
  const db = getDb();
  const rows = db
    .prepare(`SELECT id, slug, name, position FROM careers ORDER BY name COLLATE NOCASE ASC`)
    .all() as Career[];
  return rows;
}

export function getCareerBySlug(slug: string): Career | null {
  const db = getDb();
  const row = db
    .prepare(`SELECT id, slug, name, position FROM careers WHERE slug = ?`)
    .get(slug) as Career | undefined;
  return row ?? null;
}

export function createCareer(name: string): Career {
  const db = getDb();
  const trimmed = name.trim();
  let slug = slugify(trimmed);

  const existing = db.prepare(`SELECT id FROM careers WHERE slug = ?`).get(slug);
  if (existing) {
    slug = `${slug}-${Date.now().toString(36)}`;
  }

  const maxPosition = db
    .prepare(`SELECT COALESCE(MAX(position), -1) as maxPos FROM careers`)
    .get() as { maxPos: number };

  const result = db
    .prepare(`INSERT INTO careers (slug, name, position) VALUES (?, ?, ?)`)
    .run(slug, trimmed, maxPosition.maxPos + 1);

  const careerId = result.lastInsertRowid as number;

  db.prepare(
    `INSERT INTO cards (section, career_id, title, concept, speech, links, position)
     VALUES ('carrera', ?, ?, ?, ?, '', 0)`
  ).run(
    careerId,
    "De qué trata la carrera",
    "Describe aquí el enfoque y las especialidades de la carrera.",
    "Escribe aquí el speech inicial para esta carrera."
  );

  return { id: careerId, slug, name: trimmed, position: maxPosition.maxPos + 1 };
}

export function renameCareer(careerId: number, name: string) {
  const trimmed = name.trim();
  if (!trimmed) return;
  getDb().prepare(`UPDATE careers SET name = ? WHERE id = ?`).run(trimmed, careerId);
}

export function deleteCareer(careerId: number) {
  getDb().prepare(`DELETE FROM careers WHERE id = ?`).run(careerId);
}

export type FilterParams = {
  q?: string;
  tag?: string;
};

export function filterCards(cards: Card[], { q, tag }: FilterParams): Card[] {
  const query = q?.toLowerCase().trim();
  const activeTag = tag?.toLowerCase().trim();

  return cards.filter((card) => {
    if (activeTag) {
      const hasTag = card.tags.some((t) => t.label.toLowerCase() === activeTag);
      if (!hasTag) return false;
    }
    if (query) {
      const haystack = `${card.title} ${card.concept} ${card.speech} ${card.links} ${card.tags
        .map((t) => t.label)
        .join(" ")}`.toLowerCase();
      if (!haystack.includes(query)) return false;
    }
    return true;
  });
}

export function exportFullDatabase() {
  const filters = getFilterTags();
  const careers = getCareers();

  const universidad = getCardsBySection("universidad");
  const modalidad = getCardsBySection("modalidad");
  const carreras = careers.map((career) => ({
    career,
    cards: getCardsByCareer(career.id),
  }));

  return { filters, universidad, modalidad, carreras };
}
