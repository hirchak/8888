// Global in-memory store for Vercel MVP
// Data persists per-instance (survives between requests on same Vercel instance)
// Data is lost on cold-start / instance rotation

const g = globalThis as any;

if (!g.nexusData) {
  g.nexusData = {
    people: [],
    projects: [],
    ideas: [],
    opportunities: [],
    links: [],
    tasks: [],
    nextId: { people: 1, projects: 1, ideas: 1, opportunities: 1, tasks: 1 },
    // Username index: username string (without @) -> person id
    usernameIndex: {},
    // Team space config
    teamConfig: {
      mode: 'welcome', // 'welcome' | 'datetime' | 'team'
      welcomeText: 'Вітаємо у просторі',
      quote: 'Команда — це не люди які працюють разом. Команда — це люди які довіряють одне одному.',
      quoteAuthor: 'Саймон Сінек',
      city: 'Prague',
      country: 'Czech Republic',
      teamName: 'Hirchak & Pycha',
      teamMotto: 'Від ідеї до справи',
      teamLogo: '🌟',
    },
  };
}

// Sync username index when people are added/removed/updated
function indexUsername(personId: number, username: string | null, prevUsername: string | null) {
  const idx = g.nexusData.usernameIndex;
  if (prevUsername && prevUsername in idx) delete idx[prevUsername];
  if (username) idx[username.toLowerCase()] = personId;
}

function getPersonIdByUsername(username: string): number | null {
  return g.nexusData.usernameIndex[username.toLowerCase()] ?? null;
}

export const db = g.nexusData;

export function generateId(table: keyof typeof db) {
  return db.nextId[table]++;
}

// Link helpers
export type Link = {
  source_id: number;
  source_type: 'person' | 'project' | 'idea' | 'opportunity';
  target_id: number;
  target_type: 'person' | 'project' | 'idea' | 'opportunity';
};

export type Task = {
  id: number;
  title: string;
  dueDate: string | null;
  entityId: number | null;
  entityType: 'person' | 'project' | 'idea' | 'opportunity' | null;
  priority: 'high' | 'medium' | 'low';
  status: 'open' | 'done';
  createdAt: string;
};

export function getLinks(sourceType: string, sourceId: number, targetType: string) {
  return db.links.filter(
    (l: Link) => l.source_type === sourceType && l.source_id === sourceId && l.target_type === targetType
  );
}

export function getLinkedIds(sourceType: string, sourceId: number, targetType: string): number[] {
  return getLinks(sourceType, sourceId, targetType).map((l: Link) => l.target_id);
}

export function addLink(sourceType: string, sourceId: number, targetType: string, targetId: number) {
  const exists = db.links.some(
    (l: Link) => l.source_type === sourceType && l.source_id === sourceId && l.target_type === targetType && l.target_id === targetId
  );
  if (!exists) {
    db.links.push({ source_type: sourceType as any, source_id: sourceId, target_type: targetType as any, target_id: targetId });
  }
}

export function removeLink(sourceType: string, sourceId: number, targetType: string, targetId: number) {
  db.links = db.links.filter(
    (l: Link) => !(l.source_type === sourceType && l.source_id === sourceId && l.target_type === targetType && l.target_id === targetId)
  );
}

export function removeLinksByEntity(entityType: string, entityId: number) {
  db.links = db.links.filter(
    (l: Link) => !(l.source_type === entityType && l.source_id === entityId) && !(l.target_type === entityType && l.target_id === entityId)
  );
}

export { indexUsername, getPersonIdByUsername };
