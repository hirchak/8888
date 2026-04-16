import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const db = getDb();
    const id = Number(params.id);
    const row: any = db.prepare("SELECT * FROM opportunities WHERE id = ?").get(id);
    if (!row) return NextResponse.json({ detail: 'Opportunity not found' }, { status: 404 });
    return NextResponse.json(row);
  } catch (e: any) {
    return NextResponse.json({ detail: e.message }, { status: 500 });
  }
}

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const data = await req.json();
    const db = getDb();
    const id = Number(params.id);

    const existing: any = db.prepare("SELECT id FROM opportunities WHERE id = ?").get(id);
    if (!existing) return NextResponse.json({ detail: 'Opportunity not found' }, { status: 404 });

    const fields: string[] = [];
    const vals: any[] = [];
    for (const key of ['name', 'description', 'category', 'source_type', 'source_person_id', 'source_project_id']) {
      if (data[key] !== undefined) {
        fields.push(`${key} = ?`);
        vals.push(data[key]);
      }
    }
    if (fields.length > 0) {
      fields.push('updated_at = ?');
      vals.push(new Date().toISOString());
      vals.push(id);
      db.prepare(`UPDATE opportunities SET ${fields.join(', ')} WHERE id = ?`).run(...vals);
    }

    const row: any = db.prepare("SELECT * FROM opportunities WHERE id = ?").get(id);
    return NextResponse.json(row);
  } catch (e: any) {
    return NextResponse.json({ detail: e.message }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const db = getDb();
    const id = Number(params.id);

    const existing: any = db.prepare("SELECT id FROM opportunities WHERE id = ?").get(id);
    if (!existing) return NextResponse.json({ detail: 'Opportunity not found' }, { status: 404 });

    db.prepare("DELETE FROM idea_opportunity_links WHERE opportunity_id = ?").run(id);
    db.prepare("DELETE FROM project_opportunity_links WHERE opportunity_id = ?").run(id);
    db.prepare("DELETE FROM opportunities WHERE id = ?").run(id);
    return NextResponse.json({ ok: true });
  } catch (e: any) {
    return NextResponse.json({ detail: e.message }, { status: 500 });
  }
}