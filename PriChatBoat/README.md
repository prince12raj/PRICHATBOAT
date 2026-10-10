# PriChatBoat

A small full-stack chatbot: a React (Vite) frontend talking to a Flask backend that calls the Google Gemini API.

```
PriChatBoat/
├── frontend/   React + Vite chat UI
└── backend/    Flask API (POST /api/chat)
```

## 1. Backend

```bash
cd backend
python -m venv .venv
source .venv/bin/activate        # Windows: .venv\Scripts\activate
pip install -r requirements.txt
```

Edit `backend/.env` and set your key:

```
GEMINI_API_KEY=your-gemini-key-here
```

Run it:

```bash
python app.py                    # http://localhost:5000
```

Check it works: open http://localhost:5000/api/health

## 2. Frontend

```bash
cd frontend
npm install
npm run dev                      # http://localhost:5173
```

`frontend/.env` points the UI at the backend (`VITE_API_URL=http://localhost:5000`).

## API

`POST /api/chat`

```json
{ "messages": [ { "role": "user", "content": "Hello" } ] }
```

Response:

```json
{ "reply": "Hi! How can I help?" }
```

## Configuration

| File | Variable | Purpose |
|------|----------|---------|
| backend/.env | GEMINI_API_KEY | Your Gemini API key (get one at aistudio.google.com) |
| backend/.env | GEMINI_MODEL | Model name (default `gemini-2.5-flash`) |
| backend/.env | FRONTEND_ORIGIN | Allowed CORS origin (default `http://localhost:5173`) |
| frontend/.env | VITE_API_URL | Backend base URL |

## Deploying

- Backend: run with `gunicorn app:app` on any Python host; set the env vars there.
- Frontend: `npm run build`, host the `dist/` folder, and set `VITE_API_URL` to your backend URL before building.
- Never commit `.env` files.
