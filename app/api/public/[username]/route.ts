import { NextRequest, NextResponse } from 'next/server';
import { db, getLinkedIds } from '@/lib/store';

export async function GET(req: NextRequest, { params }: { params: { username: string } }) {
  try {
    const rawUsername = params.username || req.nextUrl.searchParams.get('username') || '';
    const username = rawUsername.replace(/^@/, '').toLowerCase();

    // Find person by username
    const personId = db.usernameIndex ? db.usernameIndex[username] : null;
    const person = personId != null ? db.people.find((p: any) => p.id === personId) : null;

    if (!person) {
      return NextResponse.json({ detail: 'User not found' }, { status: 404 });
    }

    // Gather public entities
    const peopleList = db.people
      .filter((p: any) => p.isPublic === true)
      .slice(0, 5)
      .map((p: any) => ({
        id: p.id,
        name: p.name,
        role: p.role,
        expertise: p.expertise,
        tags: p.tags,
        type: 'person',
      }));

    const projectsList = db.projects
      .filter((p: any) => p.isPublic === true)
      .slice(0, 5)
      .map((p: any) => ({
        id: p.id,
        name: p.name,
        description: p.description,
        stage: p.stage,
        tags: p.tags,
        type: 'project',
      }));

    const ideasList = db.ideas
      .filter((i: any) => i.isPublic === true)
      .slice(0, 5)
      .map((i: any) => ({
        id: i.id,
        name: i.name,
        pitch: i.pitch,
        status: i.status,
        tags: i.tags,
        type: 'idea',
      }));

    const opportunitiesList = db.opportunities
      .filter((o: any) => o.isPublic === true)
      .slice(0, 5)
      .map((o: any) => ({
        id: o.id,
        name: o.name,
        description: o.description,
        category: o.category,
        tags: o.tags,
        type: 'opportunity',
      }));

    const totalEntities =
      db.people.filter((p: any) => p.isPublic === true).length +
      db.projects.filter((p: any) => p.isPublic === true).length +
      db.ideas.filter((i: any) => i.isPublic === true).length +
      db.opportunities.filter((o: any) => o.isPublic === true).length;

    // Count links
    const publicIds = new Set([
      ...peopleList.map((p: any) => p.id),
      ...projectsList.map((p: any) => p.id),
      ...ideasList.map((i: any) => i.id),
      ...opportunitiesList.map((o: any) => o.id),
    ]);

    const totalLinks = db.links.filter(
      (l: any) => publicIds.has(l.source_id) || publicIds.has(l.target_id)
    ).length;

    return NextResponse.json({
      username,
      displayName: person.name,
      role: person.role,
      expertise: person.expertise,
      summary: person.summary,
      people: peopleList,
      projects: projectsList,
      ideas: ideasList,
      opportunities: opportunitiesList,
      stats: {
        totalEntities,
        totalLinks,
        peopleCount: peopleList.length,
        projectsCount: projectsList.length,
        ideasCount: ideasList.length,
        opportunitiesCount: opportunitiesList.length,
      },
    });
  } catch (e: any) {
    return NextResponse.json({ detail: e.message }, { status: 500 });
  }
}
