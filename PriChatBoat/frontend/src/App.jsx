import { useEffect, useRef, useState } from "react";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

const SUGGESTIONS = [
  "Explain how React hooks work",
  "Help me fix a CORS error in Flask",
  "Make a 7-day plan to learn SQL",
  "Review my idea for a college project",
];

/* ---------- small pieces ---------- */

function Boat({ size = 28 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" aria-hidden="true">
      <path d="M32 7v37" stroke="#FFF8EC" strokeWidth="2.5" strokeLinecap="round" />
      <path d="M30 10 12 41h18z" fill="#FFF8EC" />
      <path d="M35 17l17 24H35z" fill="#FFC857" />
      <path d="M7 45h50l-7 10H15z" fill="#1E7F74" />
    </svg>
  );
}

function Sea() {
  const d =
    "M0 60 Q90 20 180 60 T360 60 T540 60 T720 60 T900 60 T1080 60 T1260 60 T1440 60 V120 H0Z";
  return (
    <div className="sea" aria-hidden="true">
      {[1, 2, 3].map((n) => (
        <svg key={n} className={`wave w${n}`} viewBox="0 0 1440 120" preserveAspectRatio="none">
          <path d={d} />
        </svg>
      ))}
    </div>
  );
}

/* ---------- message rendering (code blocks, `code`, **bold**) ---------- */

function inline(text) {
  return text.split(/(`[^`]+`|\*\*[^*]+\*\*)/g).map((part, i) => {
    if (part.length > 2 && part.startsWith("`") && part.endsWith("`"))
      return <code key={i} className="inline">{part.slice(1, -1)}</code>;
    if (part.length > 4 && part.startsWith("**") && part.endsWith("**"))
      return <strong key={i}>{part.slice(2, -2)}</strong>;
    return part;
  });
}

function CodeBlock({ lang, code }) {
  const [copied, setCopied] = useState(false);

  async function copy() {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      /* clipboard blocked by the browser */
    }
  }

  return (
    <div className="code">
      <div className="code-bar">
        <span>{lang || "code"}</span>
        <button type="button" onClick={copy}>{copied ? "Copied" : "Copy"}</button>
      </div>
      <pre><code>{code}</code></pre>
    </div>
  );
}

function Rich({ text }) {
  const nodes = [];
  const fence = /```(\w*)\n?([\s\S]*?)```/g;
  let last = 0;
  let key = 0;
  let m;

  const pushText = (chunk) => {
    chunk.split(/\n{2,}/).forEach((para) => {
      if (para.trim()) nodes.push(<p key={key++}>{inline(para.trim())}</p>);
    });
  };

  while ((m = fence.exec(text))) {
    pushText(text.slice(last, m.index));
    nodes.push(<CodeBlock key={key++} lang={m[1]} code={m[2].replace(/\n$/, "")} />);
    last = m.index + m[0].length;
  }
  pushText(text.slice(last));
  return <>{nodes}</>;
}

/* ---------- app ---------- */

export default function App() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const endRef = useRef(null);
  const areaRef = useRef(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [messages, loading, error]);

  useEffect(() => {
    const el = areaRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = Math.min(el.scrollHeight, 160) + "px";
  }, [input]);

  async function ask(history) {
    setError("");
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/api/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: history }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Request failed.");
      setMessages([...history, { role: "assistant", content: data.reply }]);
    } catch (err) {
      setError(
        err.message === "Failed to fetch"
          ? "Can't reach the server. Check that the backend is running."
          : err.message
      );
    } finally {
      setLoading(false);
    }
  }

  function submit(raw) {
    const text = raw.trim();
    if (!text || loading) return;
    const next = [...messages, { role: "user", content: text }];
    setMessages(next);
    setInput("");
    ask(next);
  }

  function onKeyDown(e) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      submit(input);
    }
  }

  function clearChat() {
    setMessages([]);
    setError("");
  }

  const empty = messages.length === 0;

  return (
    <>
      <Sea />
      <div className="shell">
        <div className="panel">
          <header className="top">
            <div className="brand">
              <span className="logo"><Boat size={26} /></span>
              <h1>PriChatBoat</h1>
            </div>
            {!empty && (
              <button className="pill" onClick={clearChat} disabled={loading}>
                New chat
              </button>
            )}
          </header>

          <main className="log" aria-live="polite">
            {empty && !loading ? (
              <section className="hero">
                <div className="hero-boat"><Boat size={72} /></div>
                <h2>What are we working on?</h2>
                <p>Ask a question, paste some code, or start from one of these.</p>
                <div className="chips">
                  {SUGGESTIONS.map((s) => (
                    <button key={s} className="chip" onClick={() => submit(s)}>
                      {s}
                    </button>
                  ))}
                </div>
              </section>
            ) : (
              messages.map((m, i) => (
                <div key={i} className={`row ${m.role}`}>
                  {m.role === "assistant" && (
                    <span className="avatar"><Boat size={22} /></span>
                  )}
                  <div className={`bubble ${m.role}`}>
                    <Rich text={m.content} />
                  </div>
                </div>
              ))
            )}

            {loading && (
              <div className="row assistant" role="status" aria-label="PriChatBoat is thinking">
                <span className="avatar"><Boat size={22} /></span>
                <div className="thinking">
                  <div className="lane">
                    <span className="sailer"><Boat size={26} /></span>
                  </div>
                  <span>Thinking</span>
                </div>
              </div>
            )}

            {error && (
              <div className="error" role="alert">
                <span>{error}</span>
                {!loading && messages.length > 0 && (
                  <button onClick={() => ask(messages)}>Try again</button>
                )}
              </div>
            )}
            <div ref={endRef} />
          </main>

          <form
            className="composer"
            onSubmit={(e) => {
              e.preventDefault();
              submit(input);
            }}
          >
            <textarea
              ref={areaRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={onKeyDown}
              placeholder="Message PriChatBoat"
              rows={1}
              aria-label="Message"
            />
            <button
              type="submit"
              className="send"
              disabled={loading || !input.trim()}
              aria-label="Send message"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <path
                  d="M12 19V5m0 0-6 6m6-6 6 6"
                  stroke="currentColor"
                  strokeWidth="2.4"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>
          </form>
          <p className="hint">Press Enter to send, Shift+Enter for a new line.</p>
        </div>
      </div>
    </>
  );
}
