import { NextRequest, NextResponse } from 'next/server';
import { getDb, getLinkedProjects, getLinkedIdeas } from '@/lib/db';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const search = searchParams.get('search');
    const db = getDb();

    let rows;
    if (search) {
      rows = db.prepare(
        "SELECT * FROM people WHERE name LIKE ? OR expertise LIKE ? OR role LIKE ? ORDER BY updated_at DESC"
      ).all(`%${search}%`, `%${search}%`, `%${search}%`);
    } else {
      rows = db.prepare("SELECT * FROM people ORDER BY updated_at DESC").all();
    }

    const result = rows.map((row: any) => {
      const person = { ...row };
      person.projects = getLinkedProjects(db, person.id);
      person.ideas = getLinkedIdeas(db, person.id);
      return person;
    });

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

    const info = db.prepare(`
      INSERT INTO people (name, role, expertise, company, contact, summary, interests, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      data.name,
      data.role || '',
      data.expertise || '',
      data.company || '',
      data.contact || '',
      data.summary || '',
      data.interests || '',
      now,
      now
    );

    const row: any = db.prepare("SELECT * FROM people WHERE id = ?").get(info.lastInsertRowid);
    const person = { ...row };
    person.projects = getLinkedProjects(db, person.id);
    person.ideas = getLinkedIdeas(db, person.id);
    return NextResponse.json(person, { status: 201 });
  } catch (e: any) {
    return NextResponse.json({ detail: e.message }, { status: 500 });
  }
}