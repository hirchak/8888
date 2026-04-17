import { NextRequest, NextResponse } from 'next/server';
import { db, removeLinksByEntity } from '@/lib/store';

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const id = Number(params.id);
    const row = db.opportunities.find((o: any) => o.id === id);
    if (!row) return NextResponse.json({ detail: 'Opportunity not found' }, { status: 404 });
    return NextResponse.json(row);
  } catch (e: any) {
    return NextResponse.json({ detail: e.message }, { status: 500 });
  }
}

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const data = await req.json();
    const id = Number(params.id);
    const idx = db.opportunities.findIndex((o: any) => o.id === id);
    if (idx === -1) return NextResponse.json({ detail: 'Opportunity not found' }, { status: 404 });

    const row = db.opportunities[idx];
    for (const key of ['name', 'description', 'category', 'source_type', 'source_person_id', 'source_project_id', 'lastUsedAt', 'tags', 'isPublic']) {
      if (data[key] !== undefined) (row as any)[key] = data[key];
    }
    row.updated_at = new Date().toISOString();

    return NextResponse.json(row);
  } catch (e: any) {
    return NextResponse.json({ detail: e.message }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const id = Number(params.id);
    const idx = db.opportunities.findIndex((o: any) => o.id === id);
    if (idx === -1) return NextResponse.json({ detail: 'Opportunity not found' }, { status: 404 });

    removeLinksByEntity('opportunity', id);
    db.opportunities.splice(idx, 1);
    return NextResponse.json({ ok: true });
  } catch (e: any) {
    return NextResponse.json({ detail: e.message }, { status: 500 });
  }
}
