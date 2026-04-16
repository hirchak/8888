import { NextResponse } from 'next/server';
import { db } from '@/lib/store';

export async function GET() {
  try {
    const ideaStages: Record<string, number> = {};
    for (const idea of db.ideas) {
      const s = (idea as any).status || 'Hypothesis';
      ideaStages[s] = (ideaStages[s] || 0) + 1;
    }

    return NextResponse.json({
      people: db.people.length,
      projects: db.projects.length,
      ideas: db.ideas.length,
      opportunities: db.opportunities.length,
      idea_stages: ideaStages,
    });
  } catch (e: any) {
    return NextResponse.json({ detail: e.message }, { status: 500 });
  }
}
