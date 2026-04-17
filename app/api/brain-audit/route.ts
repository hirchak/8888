import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  const { text } = await request.json();

  if (!text || text.trim().length < 10) {
    return NextResponse.json(
      { detail: 'Текст занадто короткий (мін. 10 символів)' },
      { status: 400 }
    );
  }

  const entities: any[] = [];

  // ── People ──────────────────────────────────────────────────
  // Full name patterns (capitalized words, 1-3 words)
  const namePattern = /\b([А-ЯІЇЄҐ][а-яіїєя']+(?:\s+[А-ЯІЇЄҐ][а-яіїєя']+){0,2})\b/g;
  // Context clues for people
  const peopleContext = [
    /(?:зустрів|знайомий|знайома|працює|працюю|колега|друг|знайшов|рекомендує|контакт|зв'язатись|пишу|написав|написала|додав|додала)\s+([А-ЯІЇЄҐ][а-яіїєя]+(?:\s+[А-ЯІЇЄҐ][а-яіїєя]+){0,2})/gi,
    /(?:CEO|CTO|CFO|COO|Founder|Co-founder|VP|Lead|Manager|Директор|менеджер|розробник|дизайнер|маркетолог|юрист|бухгалтер|аналітик|консультант)\s+([А-ЯІЇЄҐ][а-яіїєя]+(?:\s+[А-ЯІЇЄҐ][а-яіїєя]+)?)/gi,
    /(?:@|telegram|телефон|email)\s*:?\s*([A-Za-z0-9_@.\-]+)/gi,
  ];

  const seenPeople = new Set();
  for (const ctx of peopleContext) {
    const matches = text.matchAll(ctx);
    for (const match of matches) {
      const name = match[1].trim();
      if (name && name.length > 2 && !seenPeople.has(name.toLowerCase())) {
        seenPeople.add(name.toLowerCase());
        entities.push({ type: 'person', name, confidence: 0.85 });
      }
    }
  }

  // Standalone capitalized names that look like people (not company names)
  const allNames = text.match(namePattern) || [];
  for (const name of allNames) {
    if (
      name.length > 3 &&
      !seenPeople.has(name.toLowerCase()) &&
      !['Україна', 'Київ', 'Львів', 'Одеса', 'Харків', 'Дніпро'].includes(name)
    ) {
      seenPeople.add(name.toLowerCase());
      entities.push({ type: 'person', name, confidence: 0.6 });
    }
  }

  // ── Projects ────────────────────────────────────────────────
  const projectPatterns = [
    /(?:проєкт|проект|стартап|app|додаток|платформа|сервіс)\s+["']?([А-ЯІЇЄҐа-яіїєя\s\d]+?)["']?\s*(?:\,|\.|та\s|є|буде|роблю)/gi,
    /(?:роблю|робимо|запускаємо|будуємо)\s+["']?([А-ЯІЇЄҐа-яіїєя\s\d]+?)["']?\s*(?:\,|\.|та\s|є|буде)/gi,
    /(?:MVP|Alpha|Beta|version|v)\d*\s*[:\-]?\s*["']?([А-ЯІЇЄҐа-яіїєя\s\d]+)/gi,
  ];
  const seenProjects = new Set();
  for (const pattern of projectPatterns) {
    const matches = text.matchAll(pattern);
    for (const match of matches) {
      const name = match[1].trim();
      if (name && name.length > 2 && !seenProjects.has(name.toLowerCase())) {
        seenProjects.add(name.toLowerCase());
        entities.push({ type: 'project', name, confidence: 0.8 });
      }
    }
  }

  // Standalone project names in quotes
  const quotedProjectMatches = text.matchAll(/["'«]([А-ЯІЇЄҐа-яіїєя\d\s]{3,30})["'»]/g);
  for (const match of quotedProjectMatches) {
    const name = match[1].trim();
    if (!seenProjects.has(name.toLowerCase())) {
      seenProjects.add(name.toLowerCase());
      entities.push({ type: 'project', name, confidence: 0.7 });
    }
  }

  // ── Ideas ────────────────────────────────────────────────────
  const ideaPatterns = [
    /(?:ідея|ідею|концепція|візіонерсь|рішення)\s+["']?([А-ЯІЇЄҐа-яіїєя\s\d]+?)["']?\s*(?:\,|\.|є|буде|може)/gi,
    /(?:хочу|можна|варто|треба|новий|нова)\s+["']?([А-ЯІЇЄҐа-яіїєя\s\d]{4,40})/gi,
  ];
  const seenIdeas = new Set();
  for (const pattern of ideaPatterns) {
    const matches = text.matchAll(pattern);
    for (const match of matches) {
      const name = match[1].trim();
      if (name && name.length > 3 && !seenIdeas.has(name.toLowerCase())) {
        seenIdeas.add(name.toLowerCase());
        entities.push({ type: 'idea', name, confidence: 0.8 });
      }
    }
  }

  // ── Opportunities ────────────────────────────────────────────
  const opportunityPatterns = [
    /(?:можливість|опція|варіант|вигідно|перспектива)\s+["']?([А-ЯІЇЄҐа-яіїєя\s\d]+?)["']?\s*(?:\,|\.|$)/gi,
    /(?:потенціал| Cohn |потрібно|є сенс|можна отримати)\s+["']?([А-ЯІЇЄҐа-яіїєя\s\d]+)/gi,
    /(?:грант|дотація|інвестиці|фонд|субсидія|підтримка)\s+["']?([А-ЯІЇЄҐа-яіїєя\s\d]+)/gi,
  ];
  const seenOpportunities = new Set();
  for (const pattern of opportunityPatterns) {
    const matches = text.matchAll(pattern);
    for (const match of matches) {
      const name = match[1].trim();
      if (name && name.length > 3 && !seenOpportunities.has(name.toLowerCase())) {
        seenOpportunities.add(name.toLowerCase());
        entities.push({ type: 'opportunity', name, confidence: 0.8 });
      }
    }
  }

  // ── Deduplicate by type+name ─────────────────────────────────
  const unique = entities.filter((e, i, arr) =>
    arr.findIndex(x => x.type === e.type && x.name.toLowerCase() === e.name.toLowerCase()) === i
  );

  return NextResponse.json({
    entities: unique,
    summary: {
      total: unique.length,
      people: unique.filter(e => e.type === 'person').length,
      projects: unique.filter(e => e.type === 'project').length,
      ideas: unique.filter(e => e.type === 'idea').length,
      opportunities: unique.filter(e => e.type === 'opportunity').length,
    },
  });
}