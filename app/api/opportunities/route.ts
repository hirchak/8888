import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const search = searchParams.get('search');
    const db = getDb();

    let rows;
    if (search) {
      rows = db.prepare(
        "SELECT * FROM opportunities WHERE name LIKE ? OR description LIKE ? OR category LIKE ? ORDER BY updated_at DESC"
      ).all(`%${search}%`, `%${search}%`, `%${search}%`);
    } else {
      rows = db.prepare("SELECT * FROM opportunities ORDER BY updated_at DESC").all();
    }

    return NextResponse.json(rows);
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
      INSERT INTO opportunities (name, description, category, source_type, source_person_id, source_project_id, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      data.name,
      data.description || '',
      data.category || '',
      data.source_type || 'external',
      data.source_person_id ?? null,
      data.source_project_id ?? null,
      now,
      now
    );

    const row: any = db.prepare("SELECT * FROM opportunities WHERE id = ?").get(info.lastInsertRowid);
    return NextResponse.json(row, { status: 201 });
  } catch (e: any) {
    return NextResponse.json({ detail: e.message }, { status: 500 });
  }
}