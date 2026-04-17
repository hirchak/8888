import { NextRequest, NextResponse } from 'next/server';
import { db, generateId, getLinkedIds, addLink, removeLinksByEntity, indexUsername } from '@/lib/store';

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const id = Number(params.id);
    const person = db.people.find((p: any) => p.id === id);
    if (!person) return NextResponse.json({ detail: 'Person not found' }, { status: 404 });

    const result = { ...person };
    result.projects = getLinkedIds('person', id, 'project')
      .map((pid: number) => db.projects.find((p: any) => p.id === pid))
      .filter(Boolean);
    result.ideas = getLinkedIds('person', id, 'idea')
      .map((iid: number) => db.ideas.find((i: any) => i.id === iid))
      .filter(Boolean);
    return NextResponse.json(result);
  } catch (e: any) {
    return NextResponse.json({ detail: e.message }, { status: 500 });
  }
}

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const data = await req.json();
    const id = Number(params.id);
    const idx = db.people.findIndex((p: any) => p.id === id);
    if (idx === -1) return NextResponse.json({ detail: 'Person not found' }, { status: 404 });

    const person = db.people[idx];
    const now = new Date().toISOString();
    const prevUsername = (person as any).username;
    for (const key of ['name', 'role', 'expertise', 'company', 'contact', 'summary', 'interests', 'tags', 'username', 'isPublic']) {
      if (data[key] !== undefined) (person as any)[key] = data[key];
    }
    if (data.username !== undefined) indexUsername(id, data.username, prevUsername);
    person.updated_at = now;

    const result = { ...person };
    result.projects = getLinkedIds('person', id, 'project')
      .map((pid: number) => db.projects.find((p: any) => p.id === pid))
      .filter(Boolean);
    result.ideas = getLinkedIds('person', id, 'idea')
      .map((iid: number) => db.ideas.find((i: any) => i.id === iid))
      .filter(Boolean);
    return NextResponse.json(result);
  } catch (e: any) {
    return NextResponse.json({ detail: e.message }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const id = Number(params.id);
    const idx = db.people.findIndex((p: any) => p.id === id);
    if (idx === -1) return NextResponse.json({ detail: 'Person not found' }, { status: 404 });
    const person = db.people[idx];
    if (person.username) indexUsername(id, null, person.username);

    removeLinksByEntity('person', id);
    db.people.splice(idx, 1);
    return NextResponse.json({ ok: true });
  } catch (e: any) {
    return NextResponse.json({ detail: e.message }, { status: 500 });
  }
}
