import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const LINK_TABLES: Record<string, any> = {
  'person_project': ['person_project_links', 'person_id', 'project_id'],
  'project_person': ['person_project_links', 'project_id', 'person_id'],
  'person_idea': ['person_idea_links', 'person_id', 'idea_id'],
  'idea_person': ['person_idea_links', 'idea_id', 'person_id'],
  'idea_opportunity': ['idea_opportunity_links', 'idea_id', 'opportunity_id'],
  'opportunity_idea': ['idea_opportunity_links', 'opportunity_id', 'idea_id'],
  'project_opportunity': ['project_opportunity_links', 'project_id', 'opportunity_id'],
  'opportunity_project': ['project_opportunity_links', 'opportunity_id', 'project_id'],
};

export async function POST(req: NextRequest) {
  try {
    const data = await req.json();
    const key = `${data.source_type}_${data.target_type}`;
    const linkDef = LINK_TABLES[key];

    if (!linkDef) {
      return NextResponse.json({ detail: `Unsupported link: ${data.source_type} -> ${data.target_type}` }, { status: 400 });
    }

    const db = getDb();
    const [table, colA, colB] = linkDef;

    db.prepare(`INSERT OR IGNORE INTO ${table} (${colA}, ${colB}) VALUES (?, ?)`).run(data.source_id, data.target_id);
    return NextResponse.json({ ok: true }, { status: 201 });
  } catch (e: any) {
    return NextResponse.json({ detail: e.message }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const data = await req.json();
    const key = `${data.source_type}_${data.target_type}`;
    const linkDef = LINK_TABLES[key];

    if (!linkDef) {
      return NextResponse.json({ detail: `Unsupported link: ${data.source_type} -> ${data.target_type}` }, { status: 400 });
    }

    const db = getDb();
    const [table, colA, colB] = linkDef;

    db.prepare(`DELETE FROM ${table} WHERE ${colA} = ? AND ${colB} = ?`).run(data.source_id, data.target_id);
    return NextResponse.json({ ok: true });
  } catch (e: any) {
    return NextResponse.json({ detail: e.message }, { status: 500 });
  }
}