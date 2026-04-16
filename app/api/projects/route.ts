import { NextRequest, NextResponse } from 'next/server';
import { getDb, getLinkedPeople, getLinkedOpportunities } from '@/lib/db';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const search = searchParams.get('search');
    const db = getDb();

    let rows;
    if (search) {
      rows = db.prepare(
        "SELECT * FROM projects WHERE name LIKE ? OR description LIKE ? ORDER BY updated_at DESC"
      ).all(`%${search}%`, `%${search}%`);
    } else {
      rows = db.prepare("SELECT * FROM projects ORDER BY updated_at DESC").all();
    }

    const result = rows.map((row: any) => {
      const proj = { ...row };
      proj.people = getLinkedPeople(db, proj.id);
      proj.opportunities = getLinkedOpportunities(db, 'project', proj.id);
      return proj;
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
      INSERT INTO projects (name, description, goal, stage, bottleneck, founder_id, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      data.name,
      data.description || '',
      data.goal || '',
      data.stage || 'Planning',
      data.bottleneck || '',
      data.founder_id ?? null,
      now,
      now
    );

    const row: any = db.prepare("SELECT * FROM projects WHERE id = ?").get(info.lastInsertRowid);
    const proj = { ...row };
    proj.people = getLinkedPeople(db, proj.id);
    proj.opportunities = getLinkedOpportunities(db, 'project', proj.id);
    return NextResponse.json(proj, { status: 201 });
  } catch (e: any) {
    return NextResponse.json({ detail: e.message }, { status: 500 });
  }
}