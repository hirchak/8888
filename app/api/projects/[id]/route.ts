import { NextRequest, NextResponse } from 'next/server';
import { db, getLinkedIds, removeLinksByEntity } from '@/lib/store';

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const id = Number(params.id);
    const proj = db.projects.find((p: any) => p.id === id);
    if (!proj) return NextResponse.json({ detail: 'Project not found' }, { status: 404 });

    const result: any = { ...proj };
    result.people = getLinkedIds('project', id, 'person')
      .map((pid: number) => db.people.find((x: any) => x.id === pid))
      .filter(Boolean);
    result.opportunities = getLinkedIds('project', id, 'opportunity')
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
    const idx = db.projects.findIndex((p: any) => p.id === id);
    if (idx === -1) return NextResponse.json({ detail: 'Project not found' }, { status: 404 });

    const proj = db.projects[idx];
    for (const key of ['name', 'description', 'goal', 'stage', 'bottleneck', 'founder_id', 'tags', 'isPublic', 'milestones']) {
      if (data[key] !== undefined) (proj as any)[key] = data[key];
    }
    // Auto-set completed_at when project is finished
    if (data.stage === 'Paused' || data.stage === 'Launched') {
      if (!proj.completed_at) proj.completed_at = new Date().toISOString();
    }
    proj.updated_at = new Date().toISOString();

    const result: any = { ...proj };
    result.people = getLinkedIds('project', id, 'person')
      .map((pid: number) => db.people.find((x: any) => x.id === pid))
      .filter(Boolean);
    result.opportunities = getLinkedIds('project', id, 'opportunity')
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
    const idx = db.projects.findIndex((p: any) => p.id === id);
    if (idx === -1) return NextResponse.json({ detail: 'Project not found' }, { status: 404 });

    removeLinksByEntity('project', id);
    db.projects.splice(idx, 1);
    return NextResponse.json({ ok: true });
  } catch (e: any) {
    return NextResponse.json({ detail: e.message }, { status: 500 });
  }
}
