import os

from dotenv import load_dotenv
from flask import Flask, jsonify, request
from flask_cors import CORS
from google import genai
from google.genai import errors, types

load_dotenv()

app = Flask(__name__)

# FRONTEND_ORIGIN can hold one URL or several separated by commas.
ORIGINS = [
    o.strip().rstrip("/")
    for o in os.getenv("FRONTEND_ORIGIN", "http://localhost:5173").split(",")
    if o.strip()
]
CORS(app, origins=ORIGINS)

API_KEY = os.getenv("GEMINI_API_KEY", "")
MODEL = os.getenv("GEMINI_MODEL", "gemini-2.5-flash")
SYSTEM_PROMPT = (
    "You are PriChatBoat, a friendly and concise assistant. "
    "Answer clearly, and ask a short follow-up question only when it is needed."
)
MAX_TURNS = 30  # keep the request size bounded

client = genai.Client(api_key=API_KEY) if API_KEY else None


def clean_messages(raw):
    """Keep only valid user/assistant messages with non-empty text."""
    if not isinstance(raw, list):
        return []
    out = []
    for m in raw[-MAX_TURNS:]:
        if (
            isinstance(m, dict)
            and m.get("role") in ("user", "assistant")
            and isinstance(m.get("content"), str)
            and m["content"].strip()
        ):
            out.append({"role": m["role"], "content": m["content"].strip()})
    # The conversation must start with a user message.
    while out and out[0]["role"] != "user":
        out.pop(0)
    return out


def to_gemini_contents(messages):
    """Gemini calls the assistant role 'model'."""
    return [
        types.Content(
            role="user" if m["role"] == "user" else "model",
            parts=[types.Part(text=m["content"])],
        )
        for m in messages
    ]


@app.get("/")
def home():
    return jsonify(name="PriChatBoat API", status="running")


@app.get("/api/health")
def health():
    return jsonify(status="ok", model=MODEL, key_loaded=bool(client))


@app.post("/api/chat")
def chat():
    data = request.get_json(silent=True) or {}
    messages = clean_messages(data.get("messages"))

    if not messages or messages[-1]["role"] != "user":
        return jsonify(error="Send at least one user message."), 400

    if client is None or API_KEY == "your-gemini-key-here":
        return jsonify(error="The server has no API key. Set GEMINI_API_KEY in backend/.env."), 500

    try:
        response = client.models.generate_content(
            model=MODEL,
            contents=to_gemini_contents(messages),
            config=types.GenerateContentConfig(
                system_instruction=SYSTEM_PROMPT,
                max_output_tokens=2048,
            ),
        )
        reply = (response.text or "").strip()
        if not reply:
            return jsonify(error="The model returned an empty answer. Try rephrasing."), 502
        return jsonify(reply=reply)
    except errors.APIError as e:
        app.logger.error("Gemini API error: %s", e)
        return jsonify(error="The model could not answer right now. Try again."), 502
    except Exception as e:  # noqa: BLE001
        app.logger.exception("Unexpected error: %s", e)
        return jsonify(error="Something went wrong on the server."), 500


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=int(os.getenv("PORT", 5000)), debug=True)