import { NextRequest, NextResponse } from 'next/server';
import { getDb, getLinkedPeopleForIdea, getLinkedOpportunities } from '@/lib/db';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const search = searchParams.get('search');
    const db = getDb();

    let rows;
    if (search) {
      const result = await db.execute({
        sql: "SELECT * FROM ideas WHERE name LIKE ? OR pitch LIKE ? ORDER BY updated_at DESC",
        args: [`%${search}%`, `%${search}%`],
      });
      rows = result.rows;
    } else {
      const result = await db.execute("SELECT * FROM ideas ORDER BY updated_at DESC");
      rows = result.rows;
    }

    const result = await Promise.all(
      (rows as any[]).map(async (row: any) => {
        const idea = { ...row };
        idea.people = await getLinkedPeopleForIdea(db, idea.id);
        idea.opportunities = await getLinkedOpportunities(db, 'idea', idea.id);
        return idea;
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
      sql: `INSERT INTO ideas (name, pitch, roi, origin, author, requirements, matched_assets, status, created_at, updated_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      args: [
        data.name,
        data.pitch || '',
        data.roi || '',
        data.origin || '',
        data.author || '',
        data.requirements || '',
        data.matched_assets || '',
        data.status || 'Hypothesis',
        now,
        now,
      ],
    });

    const rowResult = await db.execute({
      sql: "SELECT * FROM ideas WHERE id = ?",
      args: [info.lastInsertRowid],
    });
    const row = rowResult.rows[0] as any;
    const idea = { ...row };
    idea.people = await getLinkedPeopleForIdea(db, idea.id);
    idea.opportunities = await getLinkedOpportunities(db, 'idea', idea.id);
    return NextResponse.json(idea, { status: 201 });
  } catch (e: any) {
    return NextResponse.json({ detail: e.message }, { status: 500 });
  }
}
