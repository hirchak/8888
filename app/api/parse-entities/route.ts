import { NextRequest, NextResponse } from 'next/server';

const GROQ_API_KEY = process.env.GROQ_API_KEY;
const GROQ_URL = 'https://api.groq.com/openai/v1/chat/completions';

export async function POST(request: NextRequest) {
  const { text } = await request.json();

  const entities: any[] = [];

  const patterns = [
    { type: 'person', regex: /(?:додай|створи|знаю|зустрів|пам'ятаєш)\s+([А-ЯІЇЄЯ][а-яіїєя]+(?:\s+[А-ЯІЇЄЯ][а-яіїєя]+)?)/gi },
    { type: 'project', regex: /(?:проєкт|проект)\s+["']?([А-ЯІЇЄЯ][а-яіїєя\s]+)["']?/gi },
    { type: 'idea', regex: /(?:ідея|ідею)\s+["']?([А-ЯІЇЄЯ][а-яіїєя\s]+)["']?/gi },
    { type: 'opportunity', regex: /(?:можливість|opp)\s+["']?([А-ЯІЇЄЯ][а-яіїєя\s]+)["']?/gi },
  ];

  for (const pattern of patterns) {
    const matches = text.matchAll(pattern.regex);
    for (const match of matches) {
      entities.push({
        type: pattern.type,
        name: match[1].trim(),
        confidence: 0.8
      });
    }
  }

  // Groq fallback: if rule-based found nothing, try AI
  if (entities.length === 0 && GROQ_API_KEY && text && text.trim().length > 10) {
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

      if (response.ok) {
        const data = await response.json();
        const content = data.choices?.[0]?.message?.content || '';
        try {
          const jsonMatch = content.match(/\{[\s\S]*\}/);
          if (jsonMatch) {
            const parsed = JSON.parse(jsonMatch[0]);
            if (parsed.entities && parsed.entities.length > 0) {
              return NextResponse.json({ entities: parsed.entities });
            }
          }
        } catch {
          // AI parsing failed, return rule-based result
        }
      }
    } catch (error) {
      console.error('Groq fallback failed:', error);
    }
  }

  const unique = entities.filter((e, i, arr) =>
    arr.findIndex(x => x.type === e.type && x.name === e.name) === i
  );

  return NextResponse.json({ entities: unique });
}
