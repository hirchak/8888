import { NextRequest, NextResponse } from 'next/server';
import { getDb, getLinkedPeopleForIdea, getLinkedOpportunities } from '@/lib/db';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const search = searchParams.get('search');
    const db = getDb();

    let rows;
    if (search) {
      rows = db.prepare(
        "SELECT * FROM ideas WHERE name LIKE ? OR pitch LIKE ? ORDER BY updated_at DESC"
      ).all(`%${search}%`, `%${search}%`);
    } else {
      rows = db.prepare("SELECT * FROM ideas ORDER BY updated_at DESC").all();
    }

    const result = rows.map((row: any) => {
      const idea = { ...row };
      idea.people = getLinkedPeopleForIdea(db, idea.id);
      idea.opportunities = getLinkedOpportunities(db, 'idea', idea.id);
      return idea;
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
      INSERT INTO ideas (name, pitch, roi, origin, author, requirements, matched_assets, status, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      data.name,
      data.pitch || '',
      data.roi || '',
      data.origin || '',
      data.author || '',
      data.requirements || '',
      data.matched_assets || '',
      data.status || 'Hypothesis',
      now,
      now
    );

    const row: any = db.prepare("SELECT * FROM ideas WHERE id = ?").get(info.lastInsertRowid);
    const idea = { ...row };
    idea.people = getLinkedPeopleForIdea(db, idea.id);
    idea.opportunities = getLinkedOpportunities(db, 'idea', idea.id);
    return NextResponse.json(idea, { status: 201 });
  } catch (e: any) {
    return NextResponse.json({ detail: e.message }, { status: 500 });
  }
}