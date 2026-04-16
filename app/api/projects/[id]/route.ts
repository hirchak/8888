import { NextRequest, NextResponse } from 'next/server';
import { getDb, getLinkedPeople, getLinkedOpportunities } from '@/lib/db';

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const db = getDb();
    const id = Number(params.id);
    const row: any = db.prepare("SELECT * FROM projects WHERE id = ?").get(id);
    if (!row) return NextResponse.json({ detail: 'Project not found' }, { status: 404 });

    const proj = { ...row };
    proj.people = getLinkedPeople(db, id);
    proj.opportunities = getLinkedOpportunities(db, 'project', id);
    return NextResponse.json(proj);
  } catch (e: any) {
    return NextResponse.json({ detail: e.message }, { status: 500 });
  }
}

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const data = await req.json();
    const db = getDb();
    const id = Number(params.id);

    const existing: any = db.prepare("SELECT id FROM projects WHERE id = ?").get(id);
    if (!existing) return NextResponse.json({ detail: 'Project not found' }, { status: 404 });

    const fields: string[] = [];
    const vals: any[] = [];
    for (const key of ['name', 'description', 'goal', 'stage', 'bottleneck', 'founder_id']) {
      if (data[key] !== undefined) {
        fields.push(`${key} = ?`);
        vals.push(data[key]);
      }
    }
    if (fields.length > 0) {
      fields.push('updated_at = ?');
      vals.push(new Date().toISOString());
      vals.push(id);
      db.prepare(`UPDATE projects SET ${fields.join(', ')} WHERE id = ?`).run(...vals);
    }

    const row: any = db.prepare("SELECT * FROM projects WHERE id = ?").get(id);
    const proj = { ...row };
    proj.people = getLinkedPeople(db, id);
    proj.opportunities = getLinkedOpportunities(db, 'project', id);
    return NextResponse.json(proj);
  } catch (e: any) {
    return NextResponse.json({ detail: e.message }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const db = getDb();
    const id = Number(params.id);

    const existing: any = db.prepare("SELECT id FROM projects WHERE id = ?").get(id);
    if (!existing) return NextResponse.json({ detail: 'Project not found' }, { status: 404 });

    db.prepare("DELETE FROM person_project_links WHERE project_id = ?").run(id);
    db.prepare("DELETE FROM project_opportunity_links WHERE project_id = ?").run(id);
    db.prepare("DELETE FROM projects WHERE id = ?").run(id);
    return NextResponse.json({ ok: true });
  } catch (e: any) {
    return NextResponse.json({ detail: e.message }, { status: 500 });
  }
}