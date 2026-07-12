import { useState, useRef, useEffect } from "react";

const PURPLE = "#7B5EA7";
const DARK = "#1A1A2E";
const CARD = "#22223B";
const LIGHT_PURPLE = "#A78BCA";
const OFF_WHITE = "#F0EEF6";
const MUTED = "#8888AA";

const SYSTEM_PROMPTS = {
  reframe: `You are the Thought Therapy Reframe tool, created by Suron. Your job is to help someone dismantle a negative or limiting thought they keep having about themselves, using CBT logic.

Your approach:
1. First, acknowledge what they've shared warmly but without being over the top.
2. Ask them how long they have been carrying this thought and where they think it came from originally.
3. Then walk them through a gentle but honest examination: What is the actual evidence FOR this thought? What is the evidence AGAINST it? Is this thought a fact, or is it a conclusion you have reached?
4. Help them arrive at a more ACCURATE thought, not falsely positive, not toxic positivity. Accurate. Grounded. Real.
5. End with a reframe they could actually say to themselves that feels true.

CRITICAL RULE: When offering a reframe, state only what IS true. Never frame it as "I am not" or "I no longer" or "unlike before." No comparisons to the old pattern. No contrasting the new with the old. Just the accurate, present truth stated cleanly and forward. The brain moves toward what you focus on, so only point it at the destination.

Important: Never say "you're not broken" or anything that sounds like generic therapy-speak. Be direct, warm, and real. Sound like a smart friend who happens to know how the brain works. Keep responses concise, 3-5 sentences max per response. Ask one question at a time. Do not lecture.`,

  narrative: `You are the Thought Therapy Narrative Builder, created by Suron. Your job is to help someone build their personalised identity narrative, the internal story they run alongside their behaviour to accelerate real change.

Your approach:
1. Ask them what they are working toward changing or becoming. Be specific.
2. Ask what is one small thing they have already done that points toward that new version of them, however small.
3. Ask what does the person they are becoming believe about themselves that they do not fully believe yet.
4. Using everything they have shared, generate 5-7 personalised "I am" statements. NOT generic affirmations. Specific to their actual situation, goals, and the evidence they have shared.
5. Explain briefly why each one works and what neural pathway it is reinforcing.

CRITICAL RULE FOR IDENTITY STATEMENTS: Every single statement must be purely positive and present tense. State only what the person IS, never what they are not, never what they no longer do, never what they used to be. No "I am no longer," no "I don't," no "I used to but now," no "I am not." If something is true, say it forward, not away from the old thing. Example of what NOT to do: "I am no longer someone who stress eats." Example of what TO do: "I am someone who takes care of my body." The brain moves toward what you focus on. Only give it the destination, never the starting point.

The statements must sound like a real person talking. No spiritual bypassing. No "I am worthy of love and abundance." Grounded, specific, personal. Keep responses concise. Ask one question at a time.`,

  process: `You are the Thought Therapy Re-Wired Coach, created by Suron. Your job is to walk someone through the full 7-step Re-Wired process for something specific they want to change in their life.

The 7 steps are:
1. Name the Pathway: what is the pattern, when does it show up, what triggers it. Reframe it as biology, not character.
2. Identify the Identity Belief: what they currently believe about themselves that keeps this in place. Find counter-evidence.
3. Check the Four Conditions: Discomfort, Attention, Repetition, Sleep. Rate each 1-5. Lowest score is priority.
4. Redesign the Environment: remove cues for old pattern, add cues for new behaviour.
5. Define the Minimum: the version they will do on their worst day.
6. Start the Evidence Log: one line per day, any moment they acted like the new version.
7. When they fall off: name it accurately, drop the story, return to minimum.

Walk them through ONE step at a time. Do not dump everything at once. Ask about the specific thing they want to change first, then guide them step by step conversationally. Be warm, direct, and real. Keep each response to 3-5 sentences. One step, one question at a time.

Important: Never say "you're not broken." No generic therapy language. Sound like Suron, direct, grounded, warm, real. Never frame anything as moving away from the old pattern. Always frame it as moving toward the new identity. Only forward-facing language.`
};

const MODES = {
  reframe: {
    id: "reframe",
    label: "I have a thought I can't shake",
    sub: "Reframe a limiting belief",
    icon: "🔄",
    intro: "Tell me the thought. The one that keeps coming back. Write it exactly as it sounds in your head, don't clean it up.",
    color: "#9B6FCA"
  },
  narrative: {
    id: "narrative",
    label: "I need to connect with who I'm becoming",
    sub: "Build your identity narrative",
    icon: "✦",
    intro: "Let's build your narrative. This is the story you run alongside your behaviour, the internal voice that tells your brain who it's becoming. What are you working toward right now?",
    color: "#7B5EA7"
  },
  process: {
    id: "process",
    label: "I want to work through something I want to change",
    sub: "Full Re-Wired process, guided",
    icon: "◈",
    intro: "Let's work through this properly. What's the specific pattern, habit, or behaviour you want to change? Describe it plainly, what you do, when you do it.",
    color: "#5E4A8A"
  }
};

function Message({ role, content }) {
  const isUser = role === "user";
  return (
    <div style={{ display: "flex", justifyContent: isUser ? "flex-end" : "flex-start", marginBottom: "16px", gap: "10px", alignItems: "flex-end" }}>
      {!isUser && (
        <div style={{ width: "28px", height: "28px", borderRadius: "50%", background: `linear-gradient(135deg, ${PURPLE}, ${LIGHT_PURPLE})`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "12px", flexShrink: 0, marginBottom: "2px" }}>✦</div>
      )}
      <div style={{ maxWidth: "80%", background: isUser ? `linear-gradient(135deg, ${PURPLE}22, ${PURPLE}11)` : CARD, border: isUser ? `1px solid ${PURPLE}44` : `1px solid #33335A`, borderRadius: isUser ? "18px 18px 4px 18px" : "18px 18px 18px 4px", padding: "12px 16px", color: isUser ? OFF_WHITE : "#D4D0E8", fontSize: "14px", lineHeight: "1.65", whiteSpace: "pre-wrap" }}>{content}</div>
    </div>
  );
}

function TypingIndicator() {
  return (
    <div style={{ display: "flex", alignItems: "flex-end", gap: "10px", marginBottom: "16px" }}>
      <div style={{ width: "28px", height: "28px", borderRadius: "50%", background: `linear-gradient(135deg, ${PURPLE}, ${LIGHT_PURPLE})`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "12px" }}>✦</div>
      <div style={{ background: CARD, border: `1px solid #33335A`, borderRadius: "18px 18px 18px 4px", padding: "14px 18px", display: "flex", gap: "5px", alignItems: "center" }}>
        {[0, 1, 2].map(i => (
          <div key={i} style={{ width: "6px", height: "6px", borderRadius: "50%", background: LIGHT_PURPLE, opacity: 0.7, animation: `pulse 1.2s ease-in-out ${i * 0.2}s infinite` }} />
        ))}
      </div>
    </div>
  );
}

const CONVERSATIONS_KEY = "tt_rewired_conversations";
const CURRENT_SESSION_KEY = "tt_rewired_current";
const UNLOCK_KEY = "tt_rewired_unlocked";

// Change this to whatever code you give customers on the Payhip download page.
const ACCESS_CODE = "REWIRED26";

export default function RewiredCoach() {
  const [unlocked, setUnlocked] = useState(() => {
    try { return localStorage.getItem(UNLOCK_KEY) === "true"; } catch { return false; }
  });
  const [codeInput, setCodeInput] = useState("");
  const [codeError, setCodeError] = useState("");

  const [screen, setScreen] = useState("home");
  const [mode, setMode] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [history, setHistory] = useState([]);
  const [viewingConvo, setViewingConvo] = useState(null);
  const [savedNarratives, setSavedNarratives] = useState(() => {
    try { return JSON.parse(localStorage.getItem("tt_narratives") || "[]"); } catch { return []; }
  });
  const [conversations, setConversations] = useState(() => {
    try { return JSON.parse(localStorage.getItem(CONVERSATIONS_KEY) || "[]"); } catch { return []; }
  });
  const [hasResumableSession, setHasResumableSession] = useState(() => {
    try {
      const saved = JSON.parse(localStorage.getItem(CURRENT_SESSION_KEY) || "null");
      return !!(saved && saved.messages && saved.messages.length > 1);
    } catch { return false; }
  });
  const bottomRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  // Autosave the active session as the conversation progresses, so a refresh
  // or accidental close never loses where they were.
  useEffect(() => {
    if (screen !== "chat" || !mode) return;
    try {
      localStorage.setItem(CURRENT_SESSION_KEY, JSON.stringify({ mode, messages, history, updatedAt: Date.now() }));
    } catch {}
  }, [messages, history, mode, screen]);

  function resumeSession() {
    try {
      const saved = JSON.parse(localStorage.getItem(CURRENT_SESSION_KEY) || "null");
      if (saved && saved.mode) {
        setMode(saved.mode);
        setMessages(saved.messages || []);
        setHistory(saved.history || []);
        setScreen("chat");
        setTimeout(() => inputRef.current?.focus(), 100);
      }
    } catch {}
  }

  function archiveCurrentConversation() {
    if (!mode || messages.length <= 1) return;
    const entry = { id: Date.now(), mode, messages, updatedAt: Date.now() };
    const updated = [entry, ...conversations].slice(0, 100);
    setConversations(updated);
    try { localStorage.setItem(CONVERSATIONS_KEY, JSON.stringify(updated)); } catch {}
  }

  function deleteConversation(id) {
    const updated = conversations.filter(c => c.id !== id);
    setConversations(updated);
    try { localStorage.setItem(CONVERSATIONS_KEY, JSON.stringify(updated)); } catch {}
  }

  function clearAllConversations() {
    setConversations([]);
    try { localStorage.removeItem(CONVERSATIONS_KEY); } catch {}
  }

  function saveNarrative(text) {
    const lines = text.split("\n").filter(l => l.trim().match(/^(\d+\.\s*)?I am/i));
    if (lines.length) {
      const cleaned = lines.map(l => l.replace(/^\d+\.\s*/, "").trim());
      const updated = [...savedNarratives, ...cleaned];
      setSavedNarratives(updated);
      try { localStorage.setItem("tt_narratives", JSON.stringify(updated)); } catch {}
    }
  }

  function clearNarratives() {
    setSavedNarratives([]);
    try { localStorage.removeItem("tt_narratives"); } catch {}
  }

  function startMode(m) {
    setMode(m);
    const intro = { role: "assistant", content: MODES[m].intro };
    setMessages([intro]);
    setHistory([{ role: "assistant", content: MODES[m].intro }]);
    setScreen("chat");
    setHasResumableSession(false);
    setTimeout(() => inputRef.current?.focus(), 100);
  }

  async function send() {
    if (!input.trim() || loading) return;
    const userMsg = input.trim();
    setInput("");
    const newHistory = [...history, { role: "user", content: userMsg }];
    setHistory(newHistory);
    setMessages(prev => [...prev, { role: "user", content: userMsg }]);
    setLoading(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: newHistory, system: SYSTEM_PROMPTS[mode] })
      });
      const data = await res.json();
      const reply = data.text || "Something went wrong. Try again.";
      setHistory(prev => [...prev, { role: "assistant", content: reply }]);
      setMessages(prev => [...prev, { role: "assistant", content: reply }]);
      if (mode === "narrative") saveNarrative(reply);
    } catch {
      setMessages(prev => [...prev, { role: "assistant", content: "Something went wrong. Please try again." }]);
    }
    setLoading(false);
  }

  function handleKey(e) {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(); }
  }

  function reset() {
    archiveCurrentConversation();
    try { localStorage.removeItem(CURRENT_SESSION_KEY); } catch {}
    setHasResumableSession(false);
    setScreen("home");
    setMode(null);
    setMessages([]);
    setHistory([]);
    setInput("");
  }

  function tryUnlock() {
    if (codeInput.trim().toUpperCase() === ACCESS_CODE.toUpperCase()) {
      try { localStorage.setItem(UNLOCK_KEY, "true"); } catch {}
      setUnlocked(true);
      setCodeError("");
    } else {
      setCodeError("That code doesn't match. Check your purchase page and try again.");
    }
  }

  if (!unlocked) {
    return (
      <div style={{ minHeight: "100vh", background: DARK, fontFamily: "'Georgia', serif", color: OFF_WHITE, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "24px" }}>
        <div style={{ maxWidth: "360px", width: "100%", textAlign: "center" }}>
          <div style={{ color: LIGHT_PURPLE, fontSize: "13px", letterSpacing: "2px", fontFamily: "Arial", marginBottom: "12px" }}>RE-WIRED</div>
          <p style={{ color: MUTED, fontSize: "14px", fontFamily: "Arial", marginBottom: "24px", lineHeight: 1.5 }}>
            Enter the access code from your purchase page to continue. You'll only need to do this once on this device.
          </p>
          <input
            type="text"
            value={codeInput}
            onChange={(e) => { setCodeInput(e.target.value); setCodeError(""); }}
            onKeyDown={(e) => { if (e.key === "Enter") tryUnlock(); }}
            placeholder="Access code"
            style={{ width: "100%", padding: "12px 16px", borderRadius: "10px", border: `1px solid #33335A`, background: CARD, color: OFF_WHITE, fontSize: "15px", fontFamily: "Arial", textAlign: "center", marginBottom: "12px", boxSizing: "border-box" }}
          />
          {codeError && <p style={{ color: "#E08585", fontSize: "12px", fontFamily: "Arial", marginBottom: "12px" }}>{codeError}</p>}
          <button onClick={tryUnlock} style={{ width: "100%", padding: "12px", borderRadius: "10px", border: "none", background: PURPLE, color: OFF_WHITE, fontSize: "14px", fontFamily: "Arial", cursor: "pointer" }}>
            Unlock
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: "100vh", background: DARK, fontFamily: "'Georgia', serif", color: OFF_WHITE, display: "flex", flexDirection: "column" }}>
      <style>{`
        @keyframes pulse { 0%, 100% { opacity: 0.3; transform: scale(0.8); } 50% { opacity: 1; transform: scale(1); } }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
        textarea:focus { outline: none; }
        textarea { resize: none; }
        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: #33335A; border-radius: 4px; }
        .mode-card:hover { border-color: ${LIGHT_PURPLE} !important; transform: translateY(-2px); }
        .send-btn:hover { background: ${LIGHT_PURPLE} !important; }
        .back-btn:hover { color: ${LIGHT_PURPLE} !important; }
      `}</style>

      <div style={{ padding: "20px 24px", borderBottom: `1px solid #2A2A45`, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          {screen === "chat" && (
            <button className="back-btn" onClick={reset} style={{ background: "none", border: "none", color: MUTED, cursor: "pointer", fontSize: "13px", padding: "0", transition: "color 0.2s", marginRight: "4px" }}>← back</button>
          )}
          <span style={{ fontSize: "18px", color: LIGHT_PURPLE, letterSpacing: "3px", fontFamily: "Arial, sans-serif", fontWeight: "300" }}>RE-WIRED</span>
          <span style={{ color: MUTED, fontSize: "12px", fontFamily: "Arial, sans-serif" }}>by Thought Therapy</span>
        </div>
        {screen === "chat" && mode && (
          <div style={{ fontSize: "11px", color: MUTED, fontFamily: "Arial, sans-serif", background: "#2A2A45", padding: "4px 12px", borderRadius: "20px" }}>
            {MODES[mode].sub}
          </div>
        )}
      </div>

      {screen === "home" ? (
        <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "40px 24px", animation: "fadeIn 0.4s ease" }}>
          <div style={{ textAlign: "center", marginBottom: "48px", maxWidth: "460px" }}>
            <div style={{ width: "56px", height: "56px", borderRadius: "50%", background: `linear-gradient(135deg, ${PURPLE}, ${LIGHT_PURPLE})`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "22px", margin: "0 auto 20px" }}>✦</div>
            <h1 style={{ fontSize: "28px", fontWeight: "400", margin: "0 0 12px", letterSpacing: "0.5px", color: OFF_WHITE }}>What do you need right now?</h1>
            <p style={{ color: MUTED, fontSize: "14px", margin: 0, fontFamily: "Arial, sans-serif", lineHeight: "1.6" }}>Change isn't one thing. Pick where you are today.</p>
          </div>

          <div style={{ width: "100%", maxWidth: "480px", display: "flex", flexDirection: "column", gap: "14px" }}>
            {Object.values(MODES).map(m => (
              <button key={m.id} className="mode-card" onClick={() => startMode(m.id)} style={{ background: CARD, border: `1px solid #33335A`, borderRadius: "14px", padding: "20px 22px", cursor: "pointer", textAlign: "left", transition: "all 0.2s", display: "flex", alignItems: "center", gap: "16px" }}>
                <div style={{ width: "40px", height: "40px", borderRadius: "10px", background: `${m.color}22`, border: `1px solid ${m.color}44`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "18px", flexShrink: 0 }}>{m.icon}</div>
                <div>
                  <div style={{ color: OFF_WHITE, fontSize: "15px", marginBottom: "4px", fontWeight: "400" }}>{m.label}</div>
                  <div style={{ color: MUTED, fontSize: "12px", fontFamily: "Arial, sans-serif" }}>{m.sub}</div>
                </div>
                <div style={{ marginLeft: "auto", color: MUTED, fontSize: "18px" }}>›</div>
              </button>
            ))}
          </div>

          {hasResumableSession && (
            <button onClick={resumeSession} style={{ marginTop: "24px", background: `${PURPLE}22`, border: `1px solid ${PURPLE}66`, borderRadius: "20px", color: LIGHT_PURPLE, fontSize: "12px", padding: "8px 20px", cursor: "pointer", fontFamily: "Arial" }}>
              continue where you left off
            </button>
          )}

          <div style={{ display: "flex", gap: "12px", marginTop: hasResumableSession ? "12px" : "24px", flexWrap: "wrap", justifyContent: "center" }}>
            {savedNarratives.length > 0 && (
              <button onClick={() => setScreen("saved")} style={{ background: "none", border: `1px solid ${PURPLE}44`, borderRadius: "20px", color: LIGHT_PURPLE, fontSize: "12px", padding: "8px 20px", cursor: "pointer", fontFamily: "Arial" }}>
                view my saved identity statements ({savedNarratives.length})
              </button>
            )}
            {conversations.length > 0 && (
              <button onClick={() => setScreen("history")} style={{ background: "none", border: `1px solid ${PURPLE}44`, borderRadius: "20px", color: LIGHT_PURPLE, fontSize: "12px", padding: "8px 20px", cursor: "pointer", fontFamily: "Arial" }}>
                past conversations ({conversations.length})
              </button>
            )}
          </div>

          <p style={{ marginTop: "40px", color: "#44446A", fontSize: "11px", fontFamily: "Arial, sans-serif", textAlign: "center" }}>
            Thought Therapy by Suron · hello@thoughttherapy.co
          </p>
        </div>
      ) : screen === "saved" ? (
        <div style={{ flex: 1, padding: "24px 20px", overflowY: "auto" }}>
          <div style={{ maxWidth: "640px", margin: "0 auto" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px" }}>
              <span style={{ color: LIGHT_PURPLE, fontSize: "13px", fontFamily: "Arial", letterSpacing: "1px" }}>MY IDENTITY STATEMENTS</span>
              <div style={{ display: "flex", gap: "12px" }}>
                <button onClick={clearNarratives} style={{ background: "none", border: "none", color: MUTED, fontSize: "12px", cursor: "pointer", fontFamily: "Arial" }}>clear all</button>
                <button onClick={reset} style={{ background: "none", border: "none", color: MUTED, fontSize: "12px", cursor: "pointer", fontFamily: "Arial" }}>← back</button>
              </div>
            </div>
            <p style={{ color: MUTED, fontSize: "13px", fontFamily: "Arial", marginBottom: "20px", lineHeight: "1.6" }}>Read these daily. Each read is a repetition, and repetition is how your brain updates what it expects.</p>
            {savedNarratives.map((s, i) => (
              <div key={i} style={{ color: OFF_WHITE, fontSize: "16px", padding: "16px 0", borderBottom: `1px solid #2A2A45`, fontFamily: "Georgia", lineHeight: "1.6" }}>
                {s}
              </div>
            ))}
          </div>
        </div>
      ) : screen === "history" ? (
        <div style={{ flex: 1, padding: "24px 20px", overflowY: "auto" }}>
          <div style={{ maxWidth: "640px", margin: "0 auto" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px" }}>
              <span style={{ color: LIGHT_PURPLE, fontSize: "13px", fontFamily: "Arial", letterSpacing: "1px" }}>PAST CONVERSATIONS</span>
              <div style={{ display: "flex", gap: "12px" }}>
                <button onClick={clearAllConversations} style={{ background: "none", border: "none", color: MUTED, fontSize: "12px", cursor: "pointer", fontFamily: "Arial" }}>clear all</button>
                <button onClick={() => setScreen("home")} style={{ background: "none", border: "none", color: MUTED, fontSize: "12px", cursor: "pointer", fontFamily: "Arial" }}>← back</button>
              </div>
            </div>
            {conversations.length === 0 ? (
              <p style={{ color: MUTED, fontSize: "13px", fontFamily: "Arial" }}>No saved conversations yet.</p>
            ) : conversations.map(c => (
              <button key={c.id} onClick={() => { setViewingConvo(c); setScreen("viewConvo"); }} style={{ width: "100%", textAlign: "left", background: CARD, border: `1px solid #33335A`, borderRadius: "12px", padding: "16px 18px", marginBottom: "12px", cursor: "pointer" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span style={{ color: OFF_WHITE, fontSize: "14px" }}>{MODES[c.mode]?.sub || c.mode}</span>
                  <span style={{ color: MUTED, fontSize: "11px", fontFamily: "Arial" }}>{new Date(c.updatedAt).toLocaleDateString()}</span>
                </div>
                <div style={{ color: MUTED, fontSize: "12px", marginTop: "6px", fontFamily: "Arial", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                  {c.messages[c.messages.length - 1]?.content}
                </div>
              </button>
            ))}
          </div>
        </div>
      ) : screen === "viewConvo" && viewingConvo ? (
        <div style={{ flex: 1, display: "flex", flexDirection: "column", maxHeight: "calc(100vh - 65px)" }}>
          <div style={{ flex: 1, overflowY: "auto", padding: "24px 20px 8px" }}>
            <div style={{ maxWidth: "640px", margin: "0 auto" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
                <span style={{ color: LIGHT_PURPLE, fontSize: "13px", fontFamily: "Arial", letterSpacing: "1px" }}>{MODES[viewingConvo.mode]?.sub?.toUpperCase() || ""}</span>
                <div style={{ display: "flex", gap: "12px" }}>
                  <button onClick={() => { deleteConversation(viewingConvo.id); setScreen("history"); }} style={{ background: "none", border: "none", color: MUTED, fontSize: "12px", cursor: "pointer", fontFamily: "Arial" }}>delete</button>
                  <button onClick={() => setScreen("history")} style={{ background: "none", border: "none", color: MUTED, fontSize: "12px", cursor: "pointer", fontFamily: "Arial" }}>← back</button>
                </div>
              </div>
              {viewingConvo.messages.map((m, i) => (
                <Message key={i} role={m.role} content={m.content} />
              ))}
            </div>
          </div>
        </div>
      ) : (
        <div style={{ flex: 1, display: "flex", flexDirection: "column", maxHeight: "calc(100vh - 65px)" }}>
          <div style={{ flex: 1, overflowY: "auto", padding: "24px 20px 8px" }}>
            <div style={{ maxWidth: "640px", margin: "0 auto" }}>
              {messages.map((m, i) => (
                <div key={i} style={{ animation: "fadeIn 0.3s ease" }}>
                  <Message role={m.role} content={m.content} />
                </div>
              ))}
              {loading && <TypingIndicator />}
              <div ref={bottomRef} />
            </div>
          </div>

          <div style={{ padding: "16px 20px 24px", borderTop: `1px solid #2A2A45`, background: DARK }}>
            <div style={{ maxWidth: "640px", margin: "0 auto", display: "flex", gap: "10px", alignItems: "flex-end" }}>
              <textarea ref={inputRef} value={input} onChange={e => setInput(e.target.value)} onKeyDown={handleKey} placeholder="Type your response..." rows={2} style={{ flex: 1, background: CARD, border: `1px solid #33335A`, borderRadius: "14px", padding: "12px 16px", color: OFF_WHITE, fontSize: "14px", fontFamily: "Arial, sans-serif", lineHeight: "1.5", maxHeight: "120px", overflowY: "auto" }} />
              <button className="send-btn" onClick={send} disabled={!input.trim() || loading} style={{ width: "42px", height: "42px", borderRadius: "50%", background: input.trim() && !loading ? PURPLE : "#33335A", border: "none", cursor: input.trim() && !loading ? "pointer" : "default", color: "white", fontSize: "16px", flexShrink: 0, transition: "all 0.2s", display: "flex", alignItems: "center", justifyContent: "center" }}>›</button>
            </div>
            <div style={{ textAlign: "center", marginTop: "8px", color: "#33335A", fontSize: "11px", fontFamily: "Arial, sans-serif" }}>
              Enter to send · Shift+Enter for new line
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
