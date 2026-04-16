import { NextRequest, NextResponse } from 'next/server';
import { getDb, getLinkedProjects, getLinkedIdeas } from '@/lib/db';

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const db = getDb();
    const id = Number(params.id);
    const rowResult = await db.execute({ sql: "SELECT * FROM people WHERE id = ?", args: [id] });
    const row = rowResult.rows[0] as any;
    if (!row) return NextResponse.json({ detail: 'Person not found' }, { status: 404 });

    const person = { ...row };
    person.projects = await getLinkedProjects(db, id);
    person.ideas = await getLinkedIdeas(db, id);
    return NextResponse.json(person);
  } catch (e: any) {
    return NextResponse.json({ detail: e.message }, { status: 500 });
  }
}

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const data = await req.json();
    const db = getDb();
    const id = Number(params.id);

    const existingResult = await db.execute({ sql: "SELECT id FROM people WHERE id = ?", args: [id] });
    if (existingResult.rows.length === 0) return NextResponse.json({ detail: 'Person not found' }, { status: 404 });

    const fields: string[] = [];
    const vals: (string | number)[] = [];
    for (const key of ['name', 'role', 'expertise', 'company', 'contact', 'summary', 'interests']) {
      if (data[key] !== undefined) {
        fields.push(`${key} = ?`);
        vals.push(data[key]);
      }
    }
    if (fields.length > 0) {
      fields.push('updated_at = ?');
      vals.push(new Date().toISOString());
      vals.push(id);
      await db.execute({ sql: `UPDATE people SET ${fields.join(', ')} WHERE id = ?`, args: vals });
    }

    const rowResult = await db.execute({ sql: "SELECT * FROM people WHERE id = ?", args: [id] });
    const row = rowResult.rows[0] as any;
    const person = { ...row };
    person.projects = await getLinkedProjects(db, id);
    person.ideas = await getLinkedIdeas(db, id);
    return NextResponse.json(person);
  } catch (e: any) {
    return NextResponse.json({ detail: e.message }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const db = getDb();
    const id = Number(params.id);

    const existingResult = await db.execute({ sql: "SELECT id FROM people WHERE id = ?", args: [id] });
    if (existingResult.rows.length === 0) return NextResponse.json({ detail: 'Person not found' }, { status: 404 });

    await db.execute({ sql: "DELETE FROM person_project_links WHERE person_id = ?", args: [id] });
    await db.execute({ sql: "DELETE FROM person_idea_links WHERE person_id = ?", args: [id] });
    await db.execute({ sql: "DELETE FROM people WHERE id = ?", args: [id] });
    return NextResponse.json({ ok: true });
  } catch (e: any) {
    return NextResponse.json({ detail: e.message }, { status: 500 });
  }
}
