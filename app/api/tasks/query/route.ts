import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/store';

const GROQ_API_KEY = process.env.GROQ_API_KEY;
const GROQ_URL = 'https://api.groq.com/openai/v1/chat/completions';

export async function POST(request: NextRequest) {
  const { query, tasks } = await request.json();

  if (!query || query.trim().length < 3) {
    return NextResponse.json({ detail: 'Query too short' }, { status: 400 });
  }

  if (!tasks || !Array.isArray(tasks)) {
    return NextResponse.json({ detail: 'Tasks array required' }, { status: 400 });
  }

  // Use Groq AI to parse natural language query into filters
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
              content: `Ти фільтруєш задачі за натуральним запитом користувача.
Повертай ТІЛЬКИ ЧИСТИЙ JSON (без маркдаун код блоків, без пояснень).

ЗАПИТ: "${query}"

ВИТЯГУЙ ФІЛЬТРИ:
- dateFilter: "today" | "week" | "month" | "overdue" | null
- priority: "high" | "medium" | "low" | null
- status: "done" | "open" | null
- keywords: массив слів для пошуку в назві задачі (тільки іменники/теми)
- assignee: ім'я людини яка згадується (наприклад "для Юри", "від Андрія")

ПРАВИЛА:
- Якщо в запиті є слова "сьогодні", "today" → dateFilter: "today"
- "на цьому тижні", "за тиждень" → dateFilter: "week"  
- "прострочені", "протерміновані", "прострочено" → dateFilter: "overdue"
- "високий пріоритет", "терміново", "urgent", "важливо" → priority: "high"
- "завершені", "зроблені", "done" → status: "done"
- "відкриті", "незроблені" → status: "open"
- Слова типу "Юрій", "Андрій", "маркетинг", "AI" → додати в keywords

Формат:
{"filters": {"dateFilter": null, "priority": null, "status": null, "keywords": [], "assignee": null}}

Приклад запиту: "покажи термінові задачі на сьогодні для Юрія"
Відповідь: {"filters": {"dateFilter": "today", "priority": "high", "status": null, "keywords": [], "assignee": "Юрій"}}

Приклад запиту: "всі задачі по темі AI Nexus"
Відповідь: {"filters": {"dateFilter": null, "priority": null, "status": null, "keywords": ["AI", "Nexus"], "assignee": null}}`
            },
            {
              role: 'user',
              content: query
            }
          ],
          temperature: 0.1,
          max_tokens: 256,
        }),
      });

      if (!response.ok) throw new Error(`Groq API error: ${response.status}`);
      const data = await response.json();
      const content = data.choices?.[0]?.message?.content || '';

      let parsed = { filters: { dateFilter: null, priority: null, status: null, keywords: [], assignee: null } };
      try {
        const jsonMatch = content.match(/\{[\s\S]*\}/);
        if (jsonMatch) parsed = JSON.parse(jsonMatch[0]);
      } catch {}

      const { filters } = parsed;

      // Apply filters
      const now = new Date();
      const filtered = tasks.filter((task: any) => {
        // Date filter
        if (filters.dateFilter === 'today') {
          if (!task.dueDate || task.status === 'done') return false;
          const due = new Date(task.dueDate);
          if (due.getFullYear() !== now.getFullYear() || due.getMonth() !== now.getMonth() || due.getDate() !== now.getDate()) return false;
        }
        if (filters.dateFilter === 'week') {
          if (!task.dueDate || task.status === 'done') return false;
          const due = new Date(task.dueDate).getTime();
          const weekMs = 7 * 24 * 60 * 60 * 1000;
          if (due < now.getTime() || due > now.getTime() + weekMs) return false;
        }
        if (filters.dateFilter === 'overdue') {
          if (!task.dueDate || task.status === 'done') return false;
          if (new Date(task.dueDate) >= now) return false;
        }

        // Priority filter
        if (filters.priority && task.priority !== filters.priority) return false;

        // Status filter
        if (filters.status === 'done' && task.status !== 'done') return false;
        if (filters.status === 'open' && task.status !== 'open') return false;

        // Keywords
        if (filters.keywords && filters.keywords.length > 0) {
          const titleLower = task.title.toLowerCase();
          const matches = filters.keywords.some((kw: string) => titleLower.includes(kw.toLowerCase()));
          if (!matches) return false;
        }

        return true;
      });

      return NextResponse.json({
        filtered,
        filters,
        query,
      });
    } catch (error) {
      console.error('Groq task query failed:', error);
    }
  }

  // Fallback: simple keyword search
  const keywords = query.toLowerCase().split(/\s+/).filter(w => w.length > 2);
  const filtered = tasks.filter((task: any) =>
    keywords.some(w => task.title.toLowerCase().includes(w))
  );

  return NextResponse.json({
    filtered,
    filters: { keywords, dateFilter: null, priority: null, status: null, assignee: null },
    query,
  });
}
