import { NextRequest, NextResponse } from 'next/server';
import { db, generateId, getLinkedIds, indexUsername } from '@/lib/store';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const search = searchParams.get('search');
    const tagsParam = searchParams.get('tags');

    let people = db.people;
    if (search) {
      const q = search.toLowerCase();
      people = people.filter(
        (p: any) =>
          p.name.toLowerCase().includes(q) ||
          (p.expertise || '').toLowerCase().includes(q) ||
          (p.role || '').toLowerCase().includes(q) ||
          (p.tags || '').toLowerCase().includes(q)
      );
    }
    if (tagsParam) {
      const filterTags = tagsParam.split(',').map(t => t.trim().toLowerCase());
      people = people.filter((p: any) => {
        const entityTags = (p.tags || '').split(',').map(t => t.trim().toLowerCase()).filter(Boolean);
        return filterTags.some(ft => entityTags.includes(ft));
      });
    }

    const result = people.map((person: any) => {
      const p = { ...person };
      p.projects = getLinkedIds('person', p.id, 'project').map((id) => ({ id })).filter(Boolean);
      p.ideas = getLinkedIds('person', p.id, 'idea').map((id) => ({ id })).filter(Boolean);
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
      id: generateId('people'),
      name: data.name,
      role: data.role || '',
      expertise: data.expertise || '',
      company: data.company || '',
      contact: data.contact || '',
      summary: data.summary || '',
      interests: data.interests || '',
      tags: data.tags || '',
      username: data.username || null,
      isPublic: data.isPublic === true,
      created_at: now,
      updated_at: now,
    };

    indexUsername(newItem.id, newItem.username, null);

    db.people.push(newItem);
    const person = { ...newItem };
    person.projects = [];
    person.ideas = [];
    return NextResponse.json(person, { status: 201 });
  } catch (e: any) {
    return NextResponse.json({ detail: e.message }, { status: 500 });
  }
}
