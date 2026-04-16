import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const db = getDb();
    const id = Number(params.id);
    const rowResult = await db.execute({ sql: "SELECT * FROM opportunities WHERE id = ?", args: [id] });
    const row = rowResult.rows[0] as any;
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

    const existingResult = await db.execute({ sql: "SELECT id FROM opportunities WHERE id = ?", args: [id] });
    if (existingResult.rows.length === 0) return NextResponse.json({ detail: 'Opportunity not found' }, { status: 404 });

    const fields: string[] = [];
    const vals: (string | number | null)[] = [];
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
      await db.execute({ sql: `UPDATE opportunities SET ${fields.join(', ')} WHERE id = ?`, args: vals });
    }

    const rowResult = await db.execute({ sql: "SELECT * FROM opportunities WHERE id = ?", args: [id] });
    return NextResponse.json(rowResult.rows[0]);
  } catch (e: any) {
    return NextResponse.json({ detail: e.message }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const db = getDb();
    const id = Number(params.id);

    const existingResult = await db.execute({ sql: "SELECT id FROM opportunities WHERE id = ?", args: [id] });
    if (existingResult.rows.length === 0) return NextResponse.json({ detail: 'Opportunity not found' }, { status: 404 });

    await db.execute({ sql: "DELETE FROM idea_opportunity_links WHERE opportunity_id = ?", args: [id] });
    await db.execute({ sql: "DELETE FROM project_opportunity_links WHERE opportunity_id = ?", args: [id] });
    await db.execute({ sql: "DELETE FROM opportunities WHERE id = ?", args: [id] });
    return NextResponse.json({ ok: true });
  } catch (e: any) {
    return NextResponse.json({ detail: e.message }, { status: 500 });
  }
}
