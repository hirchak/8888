import { NextRequest, NextResponse } from 'next/server';
import { getDb, getLinkedPeople, getLinkedOpportunities } from '@/lib/db';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const search = searchParams.get('search');
    const db = getDb();

    let rows;
    if (search) {
      const result = await db.execute({
        sql: "SELECT * FROM projects WHERE name LIKE ? OR description LIKE ? ORDER BY updated_at DESC",
        args: [`%${search}%`, `%${search}%`],
      });
      rows = result.rows;
    } else {
      const result = await db.execute("SELECT * FROM projects ORDER BY updated_at DESC");
      rows = result.rows;
    }

    const result = await Promise.all(
      (rows as any[]).map(async (row: any) => {
        const proj = { ...row };
        proj.people = await getLinkedPeople(db, proj.id);
        proj.opportunities = await getLinkedOpportunities(db, 'project', proj.id);
        return proj;
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
      sql: `INSERT INTO projects (name, description, goal, stage, bottleneck, founder_id, created_at, updated_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      args: [
        data.name,
        data.description || '',
        data.goal || '',
        data.stage || 'Planning',
        data.bottleneck || '',
        data.founder_id ?? null,
        now,
        now,
      ],
    });

    const rowResult = await db.execute({
      sql: "SELECT * FROM projects WHERE id = ?",
      args: [info.lastInsertRowid],
    });
    const row = rowResult.rows[0] as any;
    const proj = { ...row };
    proj.people = await getLinkedPeople(db, proj.id);
    proj.opportunities = await getLinkedOpportunities(db, 'project', proj.id);
    return NextResponse.json(proj, { status: 201 });
  } catch (e: any) {
    return NextResponse.json({ detail: e.message }, { status: 500 });
  }
}
