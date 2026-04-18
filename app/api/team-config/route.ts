import { NextResponse } from 'next/server';
import { db } from '@/lib/store';

export async function GET() {
  return NextResponse.json(db.teamConfig);
}

export async function PUT(request: Request) {
  try {
    const body = await request.json();
    db.teamConfig = { ...db.teamConfig, ...body };
    return NextResponse.json(db.teamConfig);
  } catch (e) {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }
}
