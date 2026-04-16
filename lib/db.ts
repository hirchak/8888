import { createClient, type Client } from '@libsql/client';
import path from 'path';

const DB_PATH = path.join(process.cwd(), 'nexus.db');

let _db: Client | null = null;

export function getDb(): Client {
  if (!_db) {
    _db = createClient({ url: `file:${DB_PATH}` });
    initDb(_db);
  }
  return _db;
}

function initDb(db: Client) {
  db.executeMultiple(`
    CREATE TABLE IF NOT EXISTS people (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      role TEXT DEFAULT '',
      expertise TEXT DEFAULT '',
      company TEXT DEFAULT '',
      contact TEXT DEFAULT '',
      summary TEXT DEFAULT '',
      interests TEXT DEFAULT '',
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS projects (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      description TEXT DEFAULT '',
      goal TEXT DEFAULT '',
      stage TEXT DEFAULT 'Planning',
      bottleneck TEXT DEFAULT '',
      founder_id INTEGER DEFAULT NULL,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (founder_id) REFERENCES people(id)
    );

    CREATE TABLE IF NOT EXISTS ideas (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      pitch TEXT DEFAULT '',
      roi TEXT DEFAULT '',
      origin TEXT DEFAULT '',
      author TEXT DEFAULT '',
      requirements TEXT DEFAULT '',
      matched_assets TEXT DEFAULT '',
      status TEXT DEFAULT 'Hypothesis',
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS opportunities (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      description TEXT DEFAULT '',
      category TEXT DEFAULT '',
      source_type TEXT DEFAULT 'external',
      source_person_id INTEGER DEFAULT NULL,
      source_project_id INTEGER DEFAULT NULL,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (source_person_id) REFERENCES people(id),
      FOREIGN KEY (source_project_id) REFERENCES projects(id)
    );

    CREATE TABLE IF NOT EXISTS person_project_links (
      person_id INTEGER, project_id INTEGER,
      PRIMARY KEY (person_id, project_id),
      FOREIGN KEY (person_id) REFERENCES people(id) ON DELETE CASCADE,
      FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS person_idea_links (
      person_id INTEGER, idea_id INTEGER,
      PRIMARY KEY (person_id, idea_id),
      FOREIGN KEY (person_id) REFERENCES people(id) ON DELETE CASCADE,
      FOREIGN KEY (idea_id) REFERENCES ideas(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS idea_opportunity_links (
      idea_id INTEGER, opportunity_id INTEGER,
      PRIMARY KEY (idea_id, opportunity_id),
      FOREIGN KEY (idea_id) REFERENCES ideas(id) ON DELETE CASCADE,
      FOREIGN KEY (opportunity_id) REFERENCES opportunities(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS project_opportunity_links (
      project_id INTEGER, opportunity_id INTEGER,
      PRIMARY KEY (project_id, opportunity_id),
      FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE,
      FOREIGN KEY (opportunity_id) REFERENCES opportunities(id) ON DELETE CASCADE
    );
  `);
}

// Helper to get linked projects for a person
export async function getLinkedProjects(db: Client, personId: number) {
  const result = await db.execute({
    sql: `SELECT pr.id, pr.name, pr.stage FROM projects pr
          JOIN person_project_links l ON l.project_id = pr.id
          WHERE l.person_id = ?`,
    args: [personId],
  });
  return result.rows as unknown as { id: number; name: string; stage: string }[];
}

// Helper to get linked ideas for a person
export async function getLinkedIdeas(db: Client, personId: number) {
  const result = await db.execute({
    sql: `SELECT i.id, i.name, i.status FROM ideas i
          JOIN person_idea_links l ON l.idea_id = i.id
          WHERE l.person_id = ?`,
    args: [personId],
  });
  return result.rows as unknown as { id: number; name: string; status: string }[];
}

// Helper to get linked people for a project
export async function getLinkedPeople(db: Client, projectId: number) {
  const result = await db.execute({
    sql: `SELECT p.id, p.name, p.role FROM people p
          JOIN person_project_links l ON l.person_id = p.id
          WHERE l.project_id = ?`,
    args: [projectId],
  });
  return result.rows as unknown as { id: number; name: string; role: string }[];
}

// Helper to get linked opportunities for entity
export async function getLinkedOpportunities(db: Client, entityType: string, entityId: number) {
  if (entityType === 'project') {
    const result = await db.execute({
      sql: `SELECT o.id, o.name, o.category FROM opportunities o
            JOIN project_opportunity_links l ON l.opportunity_id = o.id
            WHERE l.project_id = ?`,
      args: [entityId],
    });
    return result.rows as unknown as { id: number; name: string; category: string }[];
  }
  if (entityType === 'idea') {
    const result = await db.execute({
      sql: `SELECT o.id, o.name, o.category FROM opportunities o
            JOIN idea_opportunity_links l ON l.opportunity_id = o.id
            WHERE l.idea_id = ?`,
      args: [entityId],
    });
    return result.rows as unknown as { id: number; name: string; category: string }[];
  }
  return [];
}

// Helper to get linked people for an idea
export async function getLinkedPeopleForIdea(db: Client, ideaId: number) {
  const result = await db.execute({
    sql: `SELECT p.id, p.name, p.role FROM people p
          JOIN person_idea_links l ON l.person_id = p.id
          WHERE l.idea_id = ?`,
    args: [ideaId],
  });
  return result.rows as unknown as { id: number; name: string; role: string }[];
}
