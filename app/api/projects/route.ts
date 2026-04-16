import { NextRequest, NextResponse } from 'next/server';
import { db, generateId, getLinkedIds } from '@/lib/store';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const search = searchParams.get('search');
    const tagsParam = searchParams.get('tags');

    let projects = db.projects;
    if (search) {
      const q = search.toLowerCase();
      projects = projects.filter(
        (p: any) =>
          p.name.toLowerCase().includes(q) ||
          (p.description || '').toLowerCase().includes(q) ||
          (p.tags || '').toLowerCase().includes(q)
      );
    }
    if (tagsParam) {
      const filterTags = tagsParam.split(',').map(t => t.trim().toLowerCase());
      projects = projects.filter((p: any) => {
        const entityTags = (p.tags || '').split(',').map(t => t.trim().toLowerCase()).filter(Boolean);
        return filterTags.some(ft => entityTags.includes(ft));
      });
    }

    const result = projects.map((proj: any) => {
      const p = { ...proj };
      p.people = getLinkedIds('project', p.id, 'person')
        .map((pid: number) => db.people.find((x: any) => x.id === pid))
        .filter(Boolean);
      p.opportunities = getLinkedIds('project', p.id, 'opportunity')
        .map((oid: number) => db.opportunities.find((x: any) => x.id === oid))
        .filter(Boolean);
      return p;
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
      id: generateId('projects'),
      name: data.name,
      description: data.description || '',
      goal: data.goal || '',
      stage: data.stage || 'Planning',
      bottleneck: data.bottleneck || '',
      founder_id: data.founder_id ?? null,
      tags: data.tags || '',
      created_at: now,
      updated_at: now,
    };

    db.projects.push(newItem);
    const proj = { ...newItem, people: [], opportunities: [] };
    return NextResponse.json(proj, { status: 201 });
  } catch (e: any) {
    return NextResponse.json({ detail: e.message }, { status: 500 });
  }
}
