import { NextRequest, NextResponse } from 'next/server';
import { getDb, getLinkedPeopleForIdea, getLinkedOpportunities } from '@/lib/db';

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const db = getDb();
    const id = Number(params.id);
    const rowResult = await db.execute({ sql: "SELECT * FROM ideas WHERE id = ?", args: [id] });
    const row = rowResult.rows[0] as any;
    if (!row) return NextResponse.json({ detail: 'Idea not found' }, { status: 404 });

    const idea = { ...row };
    idea.people = await getLinkedPeopleForIdea(db, id);
    idea.opportunities = await getLinkedOpportunities(db, 'idea', id);
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

    const existingResult = await db.execute({ sql: "SELECT id FROM ideas WHERE id = ?", args: [id] });
    if (existingResult.rows.length === 0) return NextResponse.json({ detail: 'Idea not found' }, { status: 404 });

    const fields: string[] = [];
    const vals: (string | number | null)[] = [];
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
      await db.execute({ sql: `UPDATE ideas SET ${fields.join(', ')} WHERE id = ?`, args: vals });
    }

    const rowResult = await db.execute({ sql: "SELECT * FROM ideas WHERE id = ?", args: [id] });
    const row = rowResult.rows[0] as any;
    const idea = { ...row };
    idea.people = await getLinkedPeopleForIdea(db, id);
    idea.opportunities = await getLinkedOpportunities(db, 'idea', id);
    return NextResponse.json(idea);
  } catch (e: any) {
    return NextResponse.json({ detail: e.message }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const db = getDb();
    const id = Number(params.id);

    const existingResult = await db.execute({ sql: "SELECT id FROM ideas WHERE id = ?", args: [id] });
    if (existingResult.rows.length === 0) return NextResponse.json({ detail: 'Idea not found' }, { status: 404 });

    await db.execute({ sql: "DELETE FROM person_idea_links WHERE idea_id = ?", args: [id] });
    await db.execute({ sql: "DELETE FROM idea_opportunity_links WHERE idea_id = ?", args: [id] });
    await db.execute({ sql: "DELETE FROM ideas WHERE id = ?", args: [id] });
    return NextResponse.json({ ok: true });
  } catch (e: any) {
    return NextResponse.json({ detail: e.message }, { status: 500 });
  }
}
