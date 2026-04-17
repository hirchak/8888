import { NextRequest, NextResponse } from 'next/server';
import { db, getLinkedIds } from '@/lib/store';

const ENTITY_TYPES = ['people', 'projects', 'ideas', 'opportunities'] as const;
type EntityType = typeof ENTITY_TYPES[number];

interface Entity {
  id: number;
  name: string;
  tags?: string;
  type: EntityType;
  [key: string]: any;
}

function getEntityTable(type: EntityType): Entity[] {
  return db[type] as Entity[];
}

function parseTags(tagsStr?: string): string[] {
  if (!tagsStr) return [];
  return tagsStr.split(/[,\s]+/).map(t => t.trim().toLowerCase()).filter(Boolean);
}

function getNameKeywords(name: string): string[] {
  return name.toLowerCase().split(/[\s,\-_.]+/).filter(w => w.length > 2);
}

function computeScore(source: Entity, candidate: Entity): { score: number; reasons: string[] } {
  const reasons: string[] = [];
  let score = 0;

  // Same type bonus (same entity category)
  if (source.type === candidate.type) {
    score += 3;
    if (source.type === 'people') reasons.push('людина того ж типу');
    else if (source.type === 'projects') reasons.push('проєкт того ж типу');
    else if (source.type === 'ideas') reasons.push('ідея того ж типу');
    else if (source.type === 'opportunities') reasons.push('можливість того ж типу');
  }

  // Shared tags
  const srcTags = new Set(parseTags(source.tags));
  const candTags = new Set(parseTags(candidate.tags));
  const commonTags = [...srcTags].filter(t => candTags.has(t));
  if (commonTags.length > 0) {
    score += commonTags.length * 5;
    const displayTags = commonTags.slice(0, 3).map(t => `#${t}`).join(', ');
    reasons.push(`спільні теги: ${displayTags}`);
  }

  // Shared keywords in name
  const srcKw = new Set(getNameKeywords(source.name));
  const candKw = new Set(getNameKeywords(candidate.name));
  const commonKw = [...srcKw].filter(w => candKw.has(w) && w.length > 2);
  if (commonKw.length > 0) {
    score += commonKw.length * 2;
    reasons.push(`спільні слова: ${commonKw.join(', ')}`);
  }

  return { score, reasons };
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const entityType = searchParams.get('entityType') as EntityType;
    const entityId = parseInt(searchParams.get('entityId') || '0', 10);
    const limit = Math.min(parseInt(searchParams.get('limit') || '5', 10), 5);

    if (!entityType || !entityId || isNaN(entityId)) {
      return NextResponse.json({ detail: 'entityType and entityId are required' }, { status: 400 });
    }

    if (!ENTITY_TYPES.includes(entityType)) {
      return NextResponse.json({ detail: 'Invalid entityType' }, { status: 400 });
    }

    const sourceTable = getEntityTable(entityType);
    const source = sourceTable.find((e: Entity) => e.id === entityId);
    if (!source) {
      return NextResponse.json({ detail: 'Entity not found' }, { status: 404 });
    }

    // Get IDs of already-linked entities (in both directions)
    const linkedFrom = getLinkedIds(entityType, entityId, '');

    // Collect all candidates from all entity types
    const candidates: { entity: Entity; entityType: EntityType; score: number; reasons: string[] }[] = [];

    for (const type of ENTITY_TYPES) {
      // Skip same entity
      const pool = getEntityTable(type);

      for (const candidate of pool as Entity[]) {
        if (candidate.id === entityId) continue;
        // Skip already linked
        if (linkedFrom.includes(candidate.id)) continue;

        const { score, reasons } = computeScore(source, candidate);
        if (score > 0) {
          candidates.push({ entity: candidate, entityType: type, score, reasons });
        }
      }
    }

    // Sort by score descending
    candidates.sort((a, b) => b.score - a.score);

    const recommendations = candidates.slice(0, limit).map(c => ({
      entityId: c.entity.id,
      entityType: c.entityType,
      entityName: c.entity.name,
      reason: c.reasons.join(' · ') || 'потенційний зв\'язок',
      score: c.score,
    }));

    return NextResponse.json({ recommendations });
  } catch (e: any) {
    return NextResponse.json({ detail: e.message }, { status: 500 });
  }
}
