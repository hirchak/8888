import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';

export async function GET() {
  try {
    const db = getDb();

    const [peopleResult, projectsResult, ideasResult, opportunitiesResult, stageRows] = await Promise.all([
      db.execute("SELECT COUNT(*) as count FROM people"),
      db.execute("SELECT COUNT(*) as count FROM projects"),
      db.execute("SELECT COUNT(*) as count FROM ideas"),
      db.execute("SELECT COUNT(*) as count FROM opportunities"),
      db.execute("SELECT status, COUNT(*) as count FROM ideas GROUP BY status"),
    ]);

    const ideaStages: Record<string, number> = {};
    for (const row of stageRows.rows as any[]) {
      ideaStages[row.status] = row.count;
    }

    return NextResponse.json({
      people: (peopleResult.rows[0] as any)?.count ?? 0,
      projects: (projectsResult.rows[0] as any)?.count ?? 0,
      ideas: (ideasResult.rows[0] as any)?.count ?? 0,
      opportunities: (opportunitiesResult.rows[0] as any)?.count ?? 0,
      idea_stages: ideaStages,
    });
  } catch (e: any) {
    return NextResponse.json({ detail: e.message }, { status: 500 });
  }
}
