import { NextRequest, NextResponse } from 'next/server';
import { getDb, getLinkedProjects, getLinkedIdeas } from '@/lib/db';

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const db = getDb();
    const id = Number(params.id);
    const row: any = db.prepare("SELECT * FROM people WHERE id = ?").get(id);
    if (!row) return NextResponse.json({ detail: 'Person not found' }, { status: 404 });

    const person = { ...row };
    person.projects = getLinkedProjects(db, id);
    person.ideas = getLinkedIdeas(db, id);
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

    const existing: any = db.prepare("SELECT id FROM people WHERE id = ?").get(id);
    if (!existing) return NextResponse.json({ detail: 'Person not found' }, { status: 404 });

    const fields: string[] = [];
    const vals: any[] = [];
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
      db.prepare(`UPDATE people SET ${fields.join(', ')} WHERE id = ?`).run(...vals);
    }

    const row: any = db.prepare("SELECT * FROM people WHERE id = ?").get(id);
    const person = { ...row };
    person.projects = getLinkedProjects(db, id);
    person.ideas = getLinkedIdeas(db, id);
    return NextResponse.json(person);
  } catch (e: any) {
    return NextResponse.json({ detail: e.message }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const db = getDb();
    const id = Number(params.id);

    const existing: any = db.prepare("SELECT id FROM people WHERE id = ?").get(id);
    if (!existing) return NextResponse.json({ detail: 'Person not found' }, { status: 404 });

    db.prepare("DELETE FROM person_project_links WHERE person_id = ?").run(id);
    db.prepare("DELETE FROM person_idea_links WHERE person_id = ?").run(id);
    db.prepare("DELETE FROM people WHERE id = ?").run(id);
    return NextResponse.json({ ok: true });
  } catch (e: any) {
    return NextResponse.json({ detail: e.message }, { status: 500 });
  }
}