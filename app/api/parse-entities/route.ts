import { NextRequest } from 'next/server';

export async function POST(request: NextRequest) {
  const { text } = await request.json();

  const entities: any[] = [];

  const patterns = [
    { type: 'people', regex: /(?:додай|створи|знаю|зустрів|пам'ятаєш)\s+([А-ЯІЇЄЯ][а-яіїєя]+(?:\s+[А-ЯІЇЄЯ][а-яіїєя]+)?)/gi },
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

  const unique = entities.filter((e, i, arr) =>
    arr.findIndex(x => x.type === e.type && x.name === e.name) === i
  );

  return Response.json({ entities: unique });
}
