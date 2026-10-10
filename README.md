# ⛵ PriChatBoat

A full-stack AI chatbot with a React (Vite) frontend and a Flask backend powered by the Google Gemini API.

### 🌊 [Live Demo → prichatboat-afvh.vercel.app](https://prichatboat-afvh.vercel.app)

![React](https://img.shields.io/badge/React-18-61DAFB?logo=react&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-5-646CFF?logo=vite&logoColor=white)
![Flask](https://img.shields.io/badge/Flask-3-000000?logo=flask&logoColor=white)
![Gemini](https://img.shields.io/badge/Google-Gemini-4285F4?logo=google&logoColor=white)
![Vercel](https://img.shields.io/badge/Deployed%20on-Vercel-000000?logo=vercel&logoColor=white)

---

## Features

- Clean, responsive chat interface with a harbor theme and animated waves
- A little boat sails across the screen while the model is thinking
- Starter prompts on the empty screen
- Code blocks with a one-click **Copy** button, plus inline `code` and **bold** rendering
- Conversation history sent with every request, so follow-up questions work
- Auto-growing input box (Enter to send, Shift+Enter for a new line)
- Clear error messages and a **Try again** button
- Input cleaning and a history limit on the backend
- Works on phones and respects the reduced-motion setting

## Tech stack

| Layer | Technology |
|-------|------------|
| Frontend | React 18, Vite, plain CSS |
| Backend | Python, Flask, Flask-CORS |
| AI | Google Gemini API (`google-genai` SDK) |
| Hosting | Vercel (two projects: frontend and backend) |

## Project structure

```
PriChatBoat/
├── frontend/
│   ├── src/
│   │   ├── App.jsx        # chat UI and logic
│   │   ├── App.css        # styles
│   │   └── main.jsx       # React entry point
│   ├── index.html
│   ├── package.json
│   └── .env               # VITE_API_URL
├── backend/
│   ├── app.py             # Flask API
│   ├── requirements.txt
│   └── .env               # GEMINI_API_KEY, etc.
└── README.md
```

## Run it locally

You need Python 3.10+, Node.js 18+, and a Gemini API key from [Google AI Studio](https://aistudio.google.com).

### 1. Clone

```bash
git clone https://github.com/prince12raj/PRICHATBOAT.git
cd PRICHATBOAT
```

### 2. Backend

```bash
cd backend
python -m venv .venv
source .venv/bin/activate        # Windows: .venv\Scripts\activate
pip install -r requirements.txt
```

Create `backend/.env`:

```env
GEMINI_API_KEY=your-gemini-key-here
GEMINI_MODEL=gemini-3.8-flash
FRONTEND_ORIGIN=http://localhost:5173
PORT=5000
```

Start it:

```bash
python app.py
```

Check it at http://localhost:5000/api/health. You should see `"key_loaded": true`.

### 3. Frontend

In a second terminal:

```bash
cd frontend
npm install
```

Create `frontend/.env`:

```env
VITE_API_URL=http://localhost:5000
```

Start it:

```bash
npm run dev
```

Open http://localhost:5173.

## API

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/` | Service status |
| GET | `/api/health` | Health check, shows the model and whether the key is loaded |
| POST | `/api/chat` | Send the conversation, get a reply |

**Request**

```json
{
  "messages": [
    { "role": "user", "content": "Explain how React hooks work" }
  ]
}
```

**Response**

```json
{ "reply": "React hooks let function components use state and other features..." }
```

## Environment variables

**Backend (`backend/.env`)**

| Variable | Description |
|----------|-------------|
| `GEMINI_API_KEY` | Your Gemini API key (keep it secret) |
| `GEMINI_MODEL` | Gemini model name |
| `FRONTEND_ORIGIN` | Allowed CORS origin(s), comma-separated, no trailing slash |
| `PORT` | Local port (default 5000) |

**Frontend (`frontend/.env`)**

| Variable | Description |
|----------|-------------|
| `VITE_API_URL` | Base URL of the backend |

Never commit `.env` files. They are already listed in `.gitignore`.

## Deploying to Vercel

The frontend and backend are two separate Vercel projects from the same repository.

1. **Backend:** import the repo, set **Root Directory** to `backend`, and add `GEMINI_API_KEY`, `GEMINI_MODEL`, and `FRONTEND_ORIGIN`. Vercel detects Flask automatically.
2. **Frontend:** import the repo again, set **Root Directory** to `frontend`, and add `VITE_API_URL` with the backend URL.
3. Set the backend's `FRONTEND_ORIGIN` to the frontend's URL, then redeploy both projects. Environment variable changes only apply to new deployments.

## Troubleshooting

| Problem | Fix |
|---------|-----|
| "Can't reach the server" | `VITE_API_URL` is wrong, or the frontend wasn't redeployed after setting it |
| CORS error in the browser console | `FRONTEND_ORIGIN` doesn't exactly match the frontend URL |
| "The server has no API key" | `GEMINI_API_KEY` is missing on the backend |
| "Model not found" or "no longer available" | Set `GEMINI_MODEL` to a model your key supports |

## Roadmap

- [ ] Streaming responses
- [ ] Markdown lists and tables in replies
- [ ] Saved chat history
- [ ] Light and dark theme toggle

## Author

Built by **Prince** ([@prince12raj](https://github.com/prince12raj)).

## License

This project is open source under the MIT License.
