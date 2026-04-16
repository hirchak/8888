import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/store';

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const id = Number(params.id);
    const row = db.tasks.find((t: any) => t.id === id);
    if (!row) return NextResponse.json({ detail: 'Task not found' }, { status: 404 });
    return NextResponse.json(row);
  } catch (e: any) {
    return NextResponse.json({ detail: e.message }, { status: 500 });
  }
}

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const data = await req.json();
    const id = Number(params.id);
    const idx = db.tasks.findIndex((t: any) => t.id === id);
    if (idx === -1) return NextResponse.json({ detail: 'Task not found' }, { status: 404 });

    const row = db.tasks[idx];
    for (const key of ['title', 'dueDate', 'entityId', 'entityType', 'priority', 'status']) {
      if (data[key] !== undefined) (row as any)[key] = data[key];
    }

    return NextResponse.json(row);
  } catch (e: any) {
    return NextResponse.json({ detail: e.message }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const id = Number(params.id);
    const idx = db.tasks.findIndex((t: any) => t.id === id);
    if (idx === -1) return NextResponse.json({ detail: 'Task not found' }, { status: 404 });

    db.tasks.splice(idx, 1);
    return NextResponse.json({ ok: true });
  } catch (e: any) {
    return NextResponse.json({ detail: e.message }, { status: 500 });
  }
}
