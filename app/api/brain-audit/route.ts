import { NextRequest, NextResponse } from 'next/server';

const GROQ_API_KEY = process.env.GROQ_API_KEY;
const GROQ_URL = 'https://api.groq.com/openai/v1/chat/completions';

export async function POST(request: NextRequest) {
  const { text } = await request.json();

  if (!text || text.trim().length < 10) {
    return NextResponse.json(
      { detail: 'Текст занадто короткий (мін. 10 символів)' },
      { status: 400 }
    );
  }

  // Use Groq AI for parsing if key is available
  if (GROQ_API_KEY) {
    try {
      const response = await fetch(GROQ_URL, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${GROQ_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'llama-3.3-70b-versatile',
          messages: [
            {
              role: 'system',
              content: `Ти AI-парсер для платформи AI Nexus. З тексту витягни всіх людей, проєкти, ідеї, можливості. Відповідь ТІЛЬКИ у форматі JSON: {"entities": [{"type": "person|project|idea|opportunity", "name": "...", "confidence": 0.0-1.0}, ...]}. Типи: person (людина), project (проєкт/стартап), idea (ідея/концепція), opportunity (можливість/грант/інвестиція).`
            },
            {
              role: 'user',
              content: `Знайди всі сутності в цьому тексті: "${text}"`
            }
          ],
          temperature: 0.3,
        }),
      });

      if (!response.ok) {
        throw new Error(`Groq API error: ${response.status}`);
      }

      const data = await response.json();
      const content = data.choices?.[0]?.message?.content || '';
      
      // Parse JSON from response
      let parsed = { entities: [] };
      try {
        const jsonMatch = content.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          parsed = JSON.parse(jsonMatch[0]);
        }
      } catch {
        // Fallback to rule-based if AI parsing fails
      }

      if (parsed.entities && parsed.entities.length > 0) {
        return NextResponse.json({
          entities: parsed.entities,
          summary: {
            total: parsed.entities.length,
            people: parsed.entities.filter((e: any) => e.type === 'person').length,
            projects: parsed.entities.filter((e: any) => e.type === 'project').length,
            ideas: parsed.entities.filter((e: any) => e.type === 'idea').length,
            opportunities: parsed.entities.filter((e: any) => e.type === 'opportunity').length,
          },
        });
      }
    } catch (error) {
      console.error('Groq AI parsing failed, falling back to rule-based:', error);
      // Fall through to rule-based below
    }
  }

  // ── Rule-based fallback ──────────────────────────────────────
  const entities: any[] = [];

  // ── People ──────────────────────────────────────────────────
  const namePattern = /\b([А-ЯІЇЄҐ][а-яіїєя']+(?:\s+[А-ЯІЇЄҐ][а-яіїєя']+){0,2})\b/g;
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
