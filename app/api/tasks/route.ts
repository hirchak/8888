import { NextRequest, NextResponse } from 'next/server';
import { db, generateId } from '@/lib/store';

export async function GET(req: NextRequest) {
  try {
    return NextResponse.json(db.tasks);
  } catch (e: any) {
    return NextResponse.json({ detail: e.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const data = await req.json();
    const now = new Date().toISOString();

    const newItem = {
      id: generateId('tasks'),
      title: data.title,
      dueDate: data.dueDate || null,
      entityId: data.entityId ?? null,
      entityType: data.entityType || null,
      priority: data.priority || 'medium',
      status: 'open',
      createdAt: now,
    };

    db.tasks.push(newItem);
    return NextResponse.json(newItem, { status: 201 });
  } catch (e: any) {
    return NextResponse.json({ detail: e.message }, { status: 500 });
  }
}
