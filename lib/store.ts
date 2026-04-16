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
    nextId: { people: 1, projects: 1, ideas: 1, opportunities: 1 },
  };
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
