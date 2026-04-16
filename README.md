# AI Nexus Platform

> "Другий мозок" для візіонерів. Інтелектуальна платформа для управління знаннями та зв'язками між Людьми, Проєктами, Ідеями та Можливостями.

## 🏗 Архітектура (MVP)

```
ai-nexus-platform/
├── backend/            # FastAPI + SQLite
│   ├── main.py         # FastAPI app entry
│   ├── database.py     # SQLite setup + init
│   ├── schemas.py      # Pydantic models
│   └── routers/
│       └── entities.py # All API endpoints
├── frontend/           # React + Vite + Tailwind CSS
│   └── src/
│       ├── pages/      # Dashboard, Person/Project/Idea/Opportunity cards, AddEntity
│       └── components/ # Layout
└── README.md
```

## 🚀 Запуск

### Backend
```bash
cd backend
pip install -r requirements.txt
uvicorn main:app --reload --port 8000
```

### Frontend
```bash
cd frontend
npm install
npm run dev        # Development
npm run build      # Production build
```

**Vercel (frontend):** `vercel --prod` з кореня `frontend/`
**Railway (backend):** Підключіть Railway до папки `backend/` з командою `uvicorn main:app --host 0.0.0.0 --port $PORT`

## 📡 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/stats` | Dashboard stats |
| GET/POST | `/api/people` | List / create people |
| GET/PUT/DELETE | `/api/people/{id}` | Read / update / delete person |
| GET/POST | `/api/projects` | List / create projects |
| GET/PUT/DELETE | `/api/projects/{id}` | Read / update / delete project |
| GET/POST | `/api/ideas` | List / create ideas |
| GET/PUT/DELETE | `/api/ideas/{id}` | Read / update / delete idea |
| GET/POST | `/api/opportunities` | List / create opportunities |
| GET/PUT/DELETE | `/api/opportunities/{id}` | Read / update / delete opportunity |
| POST/DELETE | `/api/links` | Bi-directional links |

## 🧩 Сутності

- **👤 Людина** — контакти, експертиза, історія комунікацій
- **🚀 Проєкт** — активні ініціативи (цілі, етапи, bottleneck)
- **💡 Ідея** — гіпотези та концепти з пайплайном статусів
- **🧩 Можливість** — активи, ресурси, таланти, знижки

## 🔗 Bi-directional Linking

Всі сутності підтримують двосторонні зв'язки:
- Людина ↔ Проєкт
- Людина ↔ Ідея
- Ідея ↔ Можливість
- Проєкт ↔ Можливість
