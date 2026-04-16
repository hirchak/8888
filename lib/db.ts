import Database from 'better-sqlite3';
import path from 'path';

const DB_PATH = path.join(process.cwd(), 'nexus.db');

let _db: Database.Database | null = null;

export function getDb(): Database.Database {
  if (!_db) {
    _db = new Database(DB_PATH);
    _db.pragma('journal_mode = WAL');
    _db.pragma('foreign_keys = ON');
    initDb(_db);
  }
  return _db;
}

function initDb(db: Database.Database) {
  db.exec(`
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
export function getLinkedProjects(db: Database.Database, personId: number) {
  return db.prepare(`
    SELECT pr.id, pr.name, pr.stage FROM projects pr
    JOIN person_project_links l ON l.project_id = pr.id
    WHERE l.person_id = ?
  `).all(personId) as { id: number; name: string; stage: string }[];
}

// Helper to get linked ideas for a person
export function getLinkedIdeas(db: Database.Database, personId: number) {
  return db.prepare(`
    SELECT i.id, i.name, i.status FROM ideas i
    JOIN person_idea_links l ON l.idea_id = i.id
    WHERE l.person_id = ?
  `).all(personId) as { id: number; name: string; status: string }[];
}

// Helper to get linked people for a project
export function getLinkedPeople(db: Database.Database, projectId: number) {
  return db.prepare(`
    SELECT p.id, p.name, p.role FROM people p
    JOIN person_project_links l ON l.person_id = p.id
    WHERE l.project_id = ?
  `).all(projectId) as { id: number; name: string; role: string }[];
}

// Helper to get linked opportunities for entity
export function getLinkedOpportunities(db: Database.Database, entityType: string, entityId: number) {
  if (entityType === 'project') {
    return db.prepare(`
      SELECT o.id, o.name, o.category FROM opportunities o
      JOIN project_opportunity_links l ON l.opportunity_id = o.id
      WHERE l.project_id = ?
    `).all(entityId) as { id: number; name: string; category: string }[];
  }
  if (entityType === 'idea') {
    return db.prepare(`
      SELECT o.id, o.name, o.category FROM opportunities o
      JOIN idea_opportunity_links l ON l.opportunity_id = o.id
      WHERE l.idea_id = ?
    `).all(entityId) as { id: number; name: string; category: string }[];
  }
  return [];
}

// Helper to get linked people for an idea
export function getLinkedPeopleForIdea(db: Database.Database, ideaId: number) {
  return db.prepare(`
    SELECT p.id, p.name, p.role FROM people p
    JOIN person_idea_links l ON l.person_id = p.id
    WHERE l.idea_id = ?
  `).all(ideaId) as { id: number; name: string; role: string }[];
}