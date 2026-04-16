import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';

export async function GET() {
  try {
    const db = getDb();

    const peopleCount: any = db.prepare("SELECT COUNT(*) as count FROM people").get();
    const projectsCount: any = db.prepare("SELECT COUNT(*) as count FROM projects").get();
    const ideasCount: any = db.prepare("SELECT COUNT(*) as count FROM ideas").get();
    const opportunitiesCount: any = db.prepare("SELECT COUNT(*) as count FROM opportunities").get();

    const stageRows: any[] = db.prepare("SELECT stage, COUNT(*) as count FROM ideas GROUP BY stage").all();

    const ideaStages: Record<string, number> = {};
    for (const row of stageRows) {
      ideaStages[row.stage] = row.count;
    }

    return NextResponse.json({
      people: peopleCount?.count ?? 0,
      projects: projectsCount?.count ?? 0,
      ideas: ideasCount?.count ?? 0,
      opportunities: opportunitiesCount?.count ?? 0,
      idea_stages: ideaStages,
    });
  } catch (e: any) {
    return NextResponse.json({ detail: e.message }, { status: 500 });
  }
}