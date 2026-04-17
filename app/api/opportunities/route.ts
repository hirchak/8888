import { NextRequest, NextResponse } from 'next/server';
import { db, generateId } from '@/lib/store';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const search = searchParams.get('search');
    const tagsParam = searchParams.get('tags');

    let rows = db.opportunities;
    if (search) {
      const q = search.toLowerCase();
      rows = rows.filter(
        (o: any) =>
          o.name.toLowerCase().includes(q) ||
          (o.description || '').toLowerCase().includes(q) ||
          (o.category || '').toLowerCase().includes(q) ||
          (o.tags || '').toLowerCase().includes(q)
      );
    }
    if (tagsParam) {
      const filterTags = tagsParam.split(',').map(t => t.trim().toLowerCase());
      rows = rows.filter((o: any) => {
        const entityTags = (o.tags || '').split(',').map(t => t.trim().toLowerCase()).filter(Boolean);
        return filterTags.some(ft => entityTags.includes(ft));
      });
    }

    return NextResponse.json(rows);
  } catch (e: any) {
    return NextResponse.json({ detail: e.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const data = await req.json();
    const now = new Date().toISOString();

    const newItem: any = {
      id: generateId('opportunities'),
      name: data.name,
      description: data.description || '',
      category: data.category || '',
      source_type: data.source_type || 'external',
      source_person_id: data.source_person_id ?? null,
      source_project_id: data.source_project_id ?? null,
      tags: data.tags || '',
      isPublic: data.isPublic === true,
      created_at: now,
      updated_at: now,
      lastUsedAt: now,
    };

    db.opportunities.push(newItem);
    return NextResponse.json(newItem, { status: 201 });
  } catch (e: any) {
    return NextResponse.json({ detail: e.message }, { status: 500 });
  }
}
