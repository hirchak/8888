import { NextRequest, NextResponse } from 'next/server';
import { db, generateId, getLinkedIds } from '@/lib/store';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const search = searchParams.get('search');

    let ideas = db.ideas;
    if (search) {
      const q = search.toLowerCase();
      ideas = ideas.filter(
        (i: any) =>
          i.name.toLowerCase().includes(q) ||
          (i.pitch || '').toLowerCase().includes(q)
      );
    }

    const result = ideas.map((idea: any) => {
      const i = { ...idea };
      i.people = getLinkedIds('idea', i.id, 'person')
        .map((pid: number) => db.people.find((x: any) => x.id === pid))
        .filter(Boolean);
      i.opportunities = getLinkedIds('idea', i.id, 'opportunity')
        .map((oid: number) => db.opportunities.find((x: any) => x.id === oid))
        .filter(Boolean);
      return i;
    });

    return NextResponse.json(result);
  } catch (e: any) {
    return NextResponse.json({ detail: e.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const data = await req.json();
    const now = new Date().toISOString();

    const newItem: any = {
      id: generateId('ideas'),
      name: data.name,
      pitch: data.pitch || '',
      roi: data.roi || '',
      origin: data.origin || '',
      author: data.author || '',
      requirements: data.requirements || '',
      matched_assets: data.matched_assets || '',
      status: data.status || 'Hypothesis',
      created_at: now,
      updated_at: now,
    };

    db.ideas.push(newItem);
    const idea = { ...newItem, people: [], opportunities: [] };
    return NextResponse.json(idea, { status: 201 });
  } catch (e: any) {
    return NextResponse.json({ detail: e.message }, { status: 500 });
  }
}
