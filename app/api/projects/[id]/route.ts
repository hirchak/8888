import { NextRequest, NextResponse } from 'next/server';
import { getDb, getLinkedPeople, getLinkedOpportunities } from '@/lib/db';

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const db = getDb();
    const id = Number(params.id);
    const rowResult = await db.execute({ sql: "SELECT * FROM projects WHERE id = ?", args: [id] });
    const row = rowResult.rows[0] as any;
    if (!row) return NextResponse.json({ detail: 'Project not found' }, { status: 404 });

    const proj = { ...row };
    proj.people = await getLinkedPeople(db, id);
    proj.opportunities = await getLinkedOpportunities(db, 'project', id);
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

    const existingResult = await db.execute({ sql: "SELECT id FROM projects WHERE id = ?", args: [id] });
    if (existingResult.rows.length === 0) return NextResponse.json({ detail: 'Project not found' }, { status: 404 });

    const fields: string[] = [];
    const vals: (string | number | null)[] = [];
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
      await db.execute({ sql: `UPDATE projects SET ${fields.join(', ')} WHERE id = ?`, args: vals });
    }

    const rowResult = await db.execute({ sql: "SELECT * FROM projects WHERE id = ?", args: [id] });
    const row = rowResult.rows[0] as any;
    const proj = { ...row };
    proj.people = await getLinkedPeople(db, id);
    proj.opportunities = await getLinkedOpportunities(db, 'project', id);
    return NextResponse.json(proj);
  } catch (e: any) {
    return NextResponse.json({ detail: e.message }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const db = getDb();
    const id = Number(params.id);

    const existingResult = await db.execute({ sql: "SELECT id FROM projects WHERE id = ?", args: [id] });
    if (existingResult.rows.length === 0) return NextResponse.json({ detail: 'Project not found' }, { status: 404 });

    await db.execute({ sql: "DELETE FROM person_project_links WHERE project_id = ?", args: [id] });
    await db.execute({ sql: "DELETE FROM project_opportunity_links WHERE project_id = ?", args: [id] });
    await db.execute({ sql: "DELETE FROM projects WHERE id = ?", args: [id] });
    return NextResponse.json({ ok: true });
  } catch (e: any) {
    return NextResponse.json({ detail: e.message }, { status: 500 });
  }
}
