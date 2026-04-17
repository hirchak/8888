import { NextRequest, NextResponse } from 'next/server';
import { db, getLinkedIds, removeLinksByEntity } from '@/lib/store';

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const id = Number(params.id);
    const idea = db.ideas.find((i: any) => i.id === id);
    if (!idea) return NextResponse.json({ detail: 'Idea not found' }, { status: 404 });

    const result: any = { ...idea };
    result.people = getLinkedIds('idea', id, 'person')
      .map((pid: number) => db.people.find((x: any) => x.id === pid))
      .filter(Boolean);
    result.opportunities = getLinkedIds('idea', id, 'opportunity')
      .map((oid: number) => db.opportunities.find((x: any) => x.id === oid))
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
    const idx = db.ideas.findIndex((i: any) => i.id === id);
    if (idx === -1) return NextResponse.json({ detail: 'Idea not found' }, { status: 404 });

    const idea = db.ideas[idx];
    for (const key of ['name', 'pitch', 'roi', 'origin', 'author', 'requirements', 'matched_assets', 'status', 'tags', 'isPublic']) {
      if (data[key] !== undefined) (idea as any)[key] = data[key];
    }
    idea.updated_at = new Date().toISOString();

    const result: any = { ...idea };
    result.people = getLinkedIds('idea', id, 'person')
      .map((pid: number) => db.people.find((x: any) => x.id === pid))
      .filter(Boolean);
    result.opportunities = getLinkedIds('idea', id, 'opportunity')
      .map((oid: number) => db.opportunities.find((x: any) => x.id === oid))
      .filter(Boolean);
    return NextResponse.json(result);
  } catch (e: any) {
    return NextResponse.json({ detail: e.message }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const id = Number(params.id);
    const idx = db.ideas.findIndex((i: any) => i.id === id);
    if (idx === -1) return NextResponse.json({ detail: 'Idea not found' }, { status: 404 });

    removeLinksByEntity('idea', id);
    db.ideas.splice(idx, 1);
    return NextResponse.json({ ok: true });
  } catch (e: any) {
    return NextResponse.json({ detail: e.message }, { status: 500 });
  }
}
