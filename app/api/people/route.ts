import { NextRequest, NextResponse } from 'next/server';
import { getDb, getLinkedProjects, getLinkedIdeas } from '@/lib/db';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const search = searchParams.get('search');
    const db = getDb();

    let rows;
    if (search) {
      const result = await db.execute({
        sql: "SELECT * FROM people WHERE name LIKE ? OR expertise LIKE ? OR role LIKE ? ORDER BY updated_at DESC",
        args: [`%${search}%`, `%${search}%`, `%${search}%`],
      });
      rows = result.rows;
    } else {
      const result = await db.execute("SELECT * FROM people ORDER BY updated_at DESC");
      rows = result.rows;
    }

    const result = await Promise.all(
      (rows as any[]).map(async (row: any) => {
        const person = { ...row };
        person.projects = await getLinkedProjects(db, person.id);
        person.ideas = await getLinkedIdeas(db, person.id);
        return person;
      })
    );

    return NextResponse.json(result);
  } catch (e: any) {
    return NextResponse.json({ detail: e.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const data = await req.json();
    const db = getDb();
    const now = new Date().toISOString();

    const info = await db.execute({
      sql: `INSERT INTO people (name, role, expertise, company, contact, summary, interests, created_at, updated_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      args: [
        data.name,
        data.role || '',
        data.expertise || '',
        data.company || '',
        data.contact || '',
        data.summary || '',
        data.interests || '',
        now,
        now,
      ],
    });

    const rowResult = await db.execute({
      sql: "SELECT * FROM people WHERE id = ?",
      args: [info.lastInsertRowid],
    });
    const row = rowResult.rows[0] as any;
    const person = { ...row };
    person.projects = await getLinkedProjects(db, person.id);
    person.ideas = await getLinkedIdeas(db, person.id);
    return NextResponse.json(person, { status: 201 });
  } catch (e: any) {
    return NextResponse.json({ detail: e.message }, { status: 500 });
  }
}
