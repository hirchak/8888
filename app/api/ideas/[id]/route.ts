import { NextRequest, NextResponse } from 'next/server';
import { getDb, getLinkedPeopleForIdea, getLinkedOpportunities } from '@/lib/db';

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const db = getDb();
    const id = Number(params.id);
    const row: any = db.prepare("SELECT * FROM ideas WHERE id = ?").get(id);
    if (!row) return NextResponse.json({ detail: 'Idea not found' }, { status: 404 });

    const idea = { ...row };
    idea.people = getLinkedPeopleForIdea(db, id);
    idea.opportunities = getLinkedOpportunities(db, 'idea', id);
    return NextResponse.json(idea);
  } catch (e: any) {
    return NextResponse.json({ detail: e.message }, { status: 500 });
  }
}

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const data = await req.json();
    const db = getDb();
    const id = Number(params.id);

    const existing: any = db.prepare("SELECT id FROM ideas WHERE id = ?").get(id);
    if (!existing) return NextResponse.json({ detail: 'Idea not found' }, { status: 404 });

    const fields: string[] = [];
    const vals: any[] = [];
    for (const key of ['name', 'pitch', 'roi', 'origin', 'author', 'requirements', 'matched_assets', 'status']) {
      if (data[key] !== undefined) {
        fields.push(`${key} = ?`);
        vals.push(data[key]);
      }
    }
    if (fields.length > 0) {
      fields.push('updated_at = ?');
      vals.push(new Date().toISOString());
      vals.push(id);
      db.prepare(`UPDATE ideas SET ${fields.join(', ')} WHERE id = ?`).run(...vals);
    }

    const row: any = db.prepare("SELECT * FROM ideas WHERE id = ?").get(id);
    const idea = { ...row };
    idea.people = getLinkedPeopleForIdea(db, id);
    idea.opportunities = getLinkedOpportunities(db, 'idea', id);
    return NextResponse.json(idea);
  } catch (e: any) {
    return NextResponse.json({ detail: e.message }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const db = getDb();
    const id = Number(params.id);

    const existing: any = db.prepare("SELECT id FROM ideas WHERE id = ?").get(id);
    if (!existing) return NextResponse.json({ detail: 'Idea not found' }, { status: 404 });

    db.prepare("DELETE FROM person_idea_links WHERE idea_id = ?").run(id);
    db.prepare("DELETE FROM idea_opportunity_links WHERE idea_id = ?").run(id);
    db.prepare("DELETE FROM ideas WHERE id = ?").run(id);
    return NextResponse.json({ ok: true });
  } catch (e: any) {
    return NextResponse.json({ detail: e.message }, { status: 500 });
  }
}