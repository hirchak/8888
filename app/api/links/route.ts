import { NextRequest, NextResponse } from 'next/server';
import { addLink, removeLink } from '@/lib/store';

const LINK_PAIRS: Record<string, [string, string]> = {
  'person_project': ['person', 'project'],
  'project_person': ['project', 'person'],
  'person_idea': ['person', 'idea'],
  'idea_person': ['idea', 'person'],
  'idea_opportunity': ['idea', 'opportunity'],
  'opportunity_idea': ['opportunity', 'idea'],
  'project_opportunity': ['project', 'opportunity'],
  'opportunity_project': ['opportunity', 'project'],
};

export async function POST(req: NextRequest) {
  try {
    const data = await req.json();
    const key = `${data.source_type}_${data.target_type}`;
    const pair = LINK_PAIRS[key];

    if (!pair) {
      return NextResponse.json(
        { detail: `Unsupported link: ${data.source_type} -> ${data.target_type}` },
        { status: 400 }
      );
    }

    addLink(pair[0], data.source_id, pair[1], data.target_id);
    return NextResponse.json({ ok: true }, { status: 201 });
  } catch (e: any) {
    return NextResponse.json({ detail: e.message }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const data = await req.json();
    const key = `${data.source_type}_${data.target_type}`;
    const pair = LINK_PAIRS[key];

    if (!pair) {
      return NextResponse.json(
        { detail: `Unsupported link: ${data.source_type} -> ${data.target_type}` },
        { status: 400 }
      );
    }

    removeLink(pair[0], data.source_id, pair[1], data.target_id);
    return NextResponse.json({ ok: true });
  } catch (e: any) {
    return NextResponse.json({ detail: e.message }, { status: 500 });
  }
}
