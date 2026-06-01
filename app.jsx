/* ============================================================
   Zahra — Fany's CV Assistant
   A small React app (no build step — Babel transforms this file
   in the browser). It answers questions about Fany's CV.

   How answers are generated, in priority order:
   1. window.claude.complete  — used automatically inside the
      Claude/Anthropic preview environment (no key needed there).
   2. Anthropic API           — when an API key is saved in the
      Settings tab, calls api.anthropic.com directly from the browser.
   3. Otherwise               — Zahra asks the user to add a key.
   ============================================================ */

const { useState, useRef, useEffect, useCallback } = React;

const AVATAR = "fany-avatar.png";

/* ---------- Localized strings ---------- */
const STR = {
  en: {
    title: "Zahra",
    status: "Active Listening",
    greet1: "I am Zahra, Fany's assistant,",
    greetQ: "how can I help you?",
    sub: "Ask me anything about Fany's career, skills or experience.",
    tapTalk: "Tap to talk",
    listening: "Listening…",
    thinking: "Thinking…",
    speaking: "Speaking…",
    tapStop: "Tap to stop",
    placeholder: "Ask about Fany's CV…",
    newChat: "New question",
    chips: [
      "What is Fany's current role?",
      "What are her key skills?",
      "Tell me about her experience",
    ],
    nav: ["Chat", "Voice", "History", "Settings"],
    speechErr: "Voice input isn't available here — please type instead.",
    answerErr: "Sorry, I couldn't reach my knowledge right now. Please try again.",
    chatEmpty: "Ask Zahra a question to start the conversation.",
    chatEmptyCta: "Go to Voice",
    historyTitle: "Your questions",
    historyEmpty: "No questions yet. Ask Zahra about Fany!",
    settingsTitle: "Settings",
    settingsLang: "Response language",
    settingsAboutTitle: "About Zahra",
    settingsAbout: "Zahra answers questions about Fany Louis-Mondésir's CV and career.",
    clear: "Clear conversation",
    cleared: "Conversation cleared",
    micDenied: "Microphone blocked. Allow mic access in your browser, then tap the mic again.",
    noSpeech: "I didn't catch that — tap the mic and speak again.",
    micStart: "Speak now…",
    settingsAiTitle: "AI connection",
    aiKeyPlaceholder: "Anthropic API key (sk-ant-…)",
    aiHelp: "Paste your Anthropic API key so Zahra can answer. It is stored only in this browser. Create one at",
    aiConnectedEnv: "Connected — built-in AI",
    aiConnectedKey: "Connected — your API key",
    aiNoKey: "To let me answer, add your Anthropic API key in the Settings tab.",
  },
  fr: {
    title: "Zahra",
    status: "Écoute active",
    greet1: "Je suis Zahra, l'assistante de Fany,",
    greetQ: "comment puis-je vous aider ?",
    sub: "Posez-moi vos questions sur le parcours, les compétences ou l'expérience de Fany.",
    tapTalk: "Appuyez pour parler",
    listening: "Écoute…",
    thinking: "Je réfléchis…",
    speaking: "Je réponds…",
    tapStop: "Appuyez pour arrêter",
    placeholder: "Une question sur le CV de Fany…",
    newChat: "Nouvelle question",
    chips: [
      "Quel est le poste actuel de Fany ?",
      "Quelles sont ses compétences clés ?",
      "Parlez-moi de son expérience",
    ],
    nav: ["Chat", "Voix", "Historique", "Réglages"],
    speechErr: "La saisie vocale n'est pas disponible ici — écrivez votre question.",
    answerErr: "Désolée, je n'ai pas pu accéder à mes informations. Réessayez.",
    chatEmpty: "Posez une question à Zahra pour démarrer la conversation.",
    chatEmptyCta: "Aller à Voix",
    historyTitle: "Vos questions",
    historyEmpty: "Aucune question pour l'instant. Interrogez Zahra sur Fany !",
    settingsTitle: "Réglages",
    settingsLang: "Langue des réponses",
    settingsAboutTitle: "À propos de Zahra",
    settingsAbout: "Zahra répond aux questions sur le CV et le parcours de Fany Louis-Mondésir.",
    clear: "Effacer la conversation",
    cleared: "Conversation effacée",
    micDenied: "Micro bloqué. Autorisez l'accès au micro dans le navigateur, puis réappuyez.",
    noSpeech: "Je n'ai rien entendu — appuyez sur le micro et reparlez.",
    micStart: "Parlez maintenant…",
    settingsAiTitle: "Connexion IA",
    aiKeyPlaceholder: "Clé API Anthropic (sk-ant-…)",
    aiHelp: "Collez votre clé API Anthropic pour que Zahra puisse répondre. Elle reste uniquement dans ce navigateur. Créez-en une sur",
    aiConnectedEnv: "Connectée — IA intégrée",
    aiConnectedKey: "Connectée — votre clé API",
    aiNoKey: "Pour que je puisse répondre, ajoutez votre clé API Anthropic dans l'onglet Réglages.",
  },
};

/* ---------- Icons ---------- */
const Ico = {
  translate: () => (
    <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 5h7M7.5 5v1.5c0 3-2 6-4.5 7.5"/><path d="M5 9c.8 2.2 2.6 4 5 5"/>
      <path d="M12.5 20l3.5-9 3.5 9M14 16.5h4"/>
    </svg>
  ),
  chat: () => (<svg className="ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12a8 8 0 0 1-11.5 7.2L4 20l1-4.3A8 8 0 1 1 21 12z"/></svg>),
  mic: () => (<svg className="ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="9" y="3" width="6" height="11" rx="3"/><path d="M5 11a7 7 0 0 0 14 0M12 18v3"/></svg>),
  history: () => (<svg className="ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M3 12a9 9 0 1 0 3-6.7M3 4v3.5h3.5M12 8v4l3 2"/></svg>),
  settings: () => (<svg className="ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.6 1.6 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.6 1.6 0 0 0-2.7 1.1V21a2 2 0 1 1-4 0v-.1A1.6 1.6 0 0 0 7 19.4a1.6 1.6 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1A1.6 1.6 0 0 0 2.6 14H2.5a2 2 0 1 1 0-4h.1A1.6 1.6 0 0 0 4.6 7.4l-.1-.1A2 2 0 1 1 7.3 4.5l.1.1A1.6 1.6 0 0 0 9 4.6h.1A1.6 1.6 0 0 0 10 2.6V2.5a2 2 0 1 1 4 0v.1A1.6 1.6 0 0 0 17 4.6a1.6 1.6 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.6 1.6 0 0 0-.3 1.8v.1A1.6 1.6 0 0 0 21.4 10h.1a2 2 0 1 1 0 4h-.1a1.6 1.6 0 0 0-1.5 1z"/></svg>),
  send: () => (<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M13 6l6 6-6 6"/></svg>),
};

/* Render light markdown (**bold**) safely, strip stray markers */
function fmt(text){
  const clean = (text || "").replace(/^\s*[-*]\s+/gm, "• ").replace(/#{1,6}\s*/g, "");
  const parts = clean.split(/(\*\*[^*]+\*\*)/g);
  return parts.map((p, i) => {
    const m = p.match(/^\*\*([^*]+)\*\*$/);
    if(m) return <strong key={i}>{m[1]}</strong>;
    return <React.Fragment key={i}>{p}</React.Fragment>;
  });
}

/* Is the built-in (environment) AI helper available? */
function hasBuiltInAI(){
  return typeof window !== "undefined" && window.claude && typeof window.claude.complete === "function";
}

/* ---------- Build the prompt + get Zahra's answer ---------- */
async function askZahra(question, lang, history){
  const langName = lang === "fr" ? "français" : "English";
  const convo = history.slice(-6).map(m => `${m.role === "user" ? "Visitor" : "Zahra"}: ${m.text}`).join("\n");
  const prompt =
`You are Zahra, the warm and professional personal assistant of Fany Louis-Mondésir.
Your only job is to answer questions about Fany's CV / professional profile, based STRICTLY on the information below.
Speak in the first person as her assistant ("Fany has...", "She worked..."). Be concise (1–4 sentences unless a list is clearly asked for), friendly and confident.
Write in plain conversational text. Do NOT use markdown, asterisks, bullets or headings.
If a question is unrelated to Fany's career, gently steer back to her professional profile.
If the info isn't in the CV, say you don't have that detail rather than inventing it.
Always answer in ${langName}.

=== FANY'S CV ===
${window.FANY_CV}
=== END CV ===

${convo ? "Conversation so far:\n" + convo + "\n\n" : ""}Visitor's question: ${question}

Zahra's answer (in ${langName}):`;

  // 1) Built-in AI — used automatically inside the Claude preview environment.
  if(hasBuiltInAI()){
    const res = await window.claude.complete({ messages: [{ role: "user", content: prompt }] });
    return (res || "").trim();
  }
  // 2) Serverless proxy (/api/ask) — the Anthropic key lives safely on the server
  //    (Vercel env var), so the deployed app is open to everyone with no key prompt.
  const r = await fetch("/api/ask", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ prompt }),
  });
  if(!r.ok){
    const d = await r.json().catch(()=> ({}));
    throw new Error(d.error || ("Server " + r.status));
  }
  const data = await r.json();
  return (data && data.text || "").trim();
}

/* ---------- App ---------- */
function App(){
  const [lang, setLang] = useState(() => localStorage.getItem("zahra_lang") || "en");
  const [tab, setTab] = useState("Voice"); // Voice | Chat | History | Settings
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [listening, setListening] = useState(false);
  const [voiceState, setVoiceState] = useState("idle"); // idle | listening | thinking | speaking (Voice tab only)
  const [heard, setHeard] = useState("");
  const [toast, setToast] = useState("");
  const t = STR[lang];

  const bodyRef = useRef(null);
  const recogRef = useRef(null);
  const toastTimer = useRef(null);
  const finalSentRef = useRef(false);
  const lastTranscriptRef = useRef("");
  const voicesRef = useRef([]);
  const messagesRef = useRef([]);
  useEffect(()=>{ messagesRef.current = messages; }, [messages]);
  useEffect(()=>{ localStorage.setItem("zahra_lang", lang); }, [lang]);

  // Load TTS voices (they populate asynchronously in most browsers).
  useEffect(()=>{
    if(!("speechSynthesis" in window)) return;
    const load = () => { voicesRef.current = window.speechSynthesis.getVoices() || []; };
    load();
    window.speechSynthesis.onvoiceschanged = load;
    return () => { try{ window.speechSynthesis.onvoiceschanged = null; }catch(e){} };
  }, []);

  // Pick a soft, feminine voice for the chosen language.
  const pickVoice = (langPref) => {
    const voices = voicesRef.current.length ? voicesRef.current : (window.speechSynthesis.getVoices() || []);
    const code = langPref === "fr" ? "fr" : "en";
    const inLang = voices.filter(v => v.lang && v.lang.toLowerCase().startsWith(code));
    if(!inLang.length) return null;
    const female = langPref === "fr"
      ? ["amélie","amelie","audrey","aurélie","aurelie","virginie","marie","julie","léa","lea","chloé","chloe","google français","hortense","céline","celine"]
      : ["samantha","victoria","karen","moira","tessa","fiona","serena","allison","ava","susan","zira","aria","jenny","google us english","google uk english female","female"];
    const male = ["thomas","nicolas","daniel","fred","alex","jacques","paul","rishi","arthur","male","homme"];
    const byName = (kw) => inLang.find(v => kw.some(k => v.name.toLowerCase().includes(k)));
    return byName(female)
      || inLang.find(v => !male.some(k => v.name.toLowerCase().includes(k)))
      || inLang[0];
  };

  const speak = (text, onend) => {
    try{
      if(!("speechSynthesis" in window)){ if(onend) onend(); return; }
      window.speechSynthesis.cancel();
      const clean = (text || "").replace(/\*\*/g, "").replace(/[#*_`>]/g, "");
      const u = new SpeechSynthesisUtterance(clean);
      u.lang = lang === "fr" ? "fr-FR" : "en-US";
      const v = pickVoice(lang);
      if(v) u.voice = v;
      u.rate = 0.95;   // a touch slower = calmer
      u.pitch = 1.15;  // slightly higher = softer, feminine
      u.volume = 1;
      if(onend){ u.onend = onend; u.onerror = onend; }
      window.speechSynthesis.speak(u);
    }catch(e){ if(onend) onend(); }
  };

  const showToast = (msg) => {
    setToast(msg); clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(()=> setToast(""), 3200);
  };

  useEffect(()=>{
    if(tab === "Chat" && bodyRef.current){
      bodyRef.current.scrollTop = bodyRef.current.scrollHeight;
    }
  }, [messages, loading, tab]);

  const send = useCallback(async (textArg, opts) => {
    const text = (textArg ?? input).trim();
    if(!text || loading) return;
    const spoken = !!(opts && opts.spoken);
    try{ if("speechSynthesis" in window) window.speechSynthesis.cancel(); }catch(e){}
    setInput("");
    setTab("Chat");
    const userMsg = { role: "user", text };
    setMessages(prev => {
      const next = [...prev, userMsg];
      runAnswer(text, next, spoken);
      return next;
    });
  }, [input, loading, lang]);

  const runAnswer = async (text, historyIncludingUser, spoken) => {
    setLoading(true);
    try{
      const ans = await askZahra(text, lang, historyIncludingUser.slice(0, -1).concat([{role:"user", text}]));
      const finalAns = ans || t.answerErr;
      setMessages(prev => [...prev, { role: "zahra", text: finalAns }]);
      if(spoken) speak(finalAns);
    }catch(e){
      setMessages(prev => [...prev, { role: "zahra", text: t.answerErr }]);
    }finally{
      setLoading(false);
    }
  };

  // Voice-only flow (Voice tab): listen → think → speak the answer aloud. No text chat.
  const runVoice = async (text) => {
    setVoiceState("thinking");
    setHeard(text);
    const prior = messagesRef.current;
    setMessages(prev => [...prev, { role: "user", text }]);
    try{
      const ans = await askZahra(text, lang, prior);
      const finalAns = ans || t.answerErr;
      setMessages(prev => [...prev, { role: "zahra", text: finalAns }]);
      setVoiceState("speaking");
      speak(finalAns, () => setVoiceState("idle"));
    }catch(e){
      setVoiceState("idle");
      showToast(t.answerErr);
    }
  };

  const startListening = (voiceOnly) => {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if(!SR){ showToast(t.speechErr); return; }
    if(listening){ try{ recogRef.current && recogRef.current.stop(); }catch(e){} setListening(false); return; }
    try{ if("speechSynthesis" in window) window.speechSynthesis.cancel(); }catch(e){}
    // Unlock speech synthesis inside the user gesture so the spoken reply isn't blocked later.
    try{ if("speechSynthesis" in window){ const w = new SpeechSynthesisUtterance(" "); w.volume = 0; window.speechSynthesis.speak(w); } }catch(e){}
    try{
      const r = new SR();
      r.lang = lang === "fr" ? "fr-FR" : "en-US";
      r.interimResults = true;
      r.continuous = false;
      r.maxAlternatives = 1;
      finalSentRef.current = false;
      lastTranscriptRef.current = "";
      const deliver = (txt) => { if(voiceOnly) runVoice(txt); else send(txt, { spoken: true }); };
      r.onstart = () => { setListening(true); setInput(""); setHeard(""); if(voiceOnly) setVoiceState("listening"); };
      r.onresult = (ev) => {
        let interim = "", finalTxt = "";
        for(let i = ev.resultIndex; i < ev.results.length; i++){
          const res = ev.results[i];
          if(res.isFinal) finalTxt += res[0].transcript;
          else interim += res[0].transcript;
        }
        const current = (finalTxt || interim).trim();
        if(current) lastTranscriptRef.current = current;
        if(finalTxt.trim()){
          finalSentRef.current = true;
          setListening(false);
          setInput("");
          try{ r.stop(); }catch(e){}
          deliver(finalTxt.trim());
        } else if(interim){
          if(voiceOnly) setHeard(interim); else setInput(interim);
        }
      };
      r.onerror = (e) => {
        setListening(false);
        if(voiceOnly) setVoiceState("idle");
        if(e.error === "not-allowed" || e.error === "service-not-allowed") showToast(t.micDenied);
        else if(e.error === "no-speech") showToast(t.noSpeech);
        else if(e.error === "aborted") { /* user stopped */ }
        else showToast(t.speechErr);
      };
      r.onend = () => {
        setListening(false);
        // Fallback: some browsers never emit a final result — use the last interim text.
        if(!finalSentRef.current && lastTranscriptRef.current.trim()){
          finalSentRef.current = true;
          deliver(lastTranscriptRef.current.trim());
        } else if(!finalSentRef.current && voiceOnly){
          setVoiceState("idle");
        }
      };
      recogRef.current = r;
      r.start();
      setListening(true);
      if(voiceOnly) setVoiceState("listening");
    }catch(e){ setListening(false); if(voiceOnly) setVoiceState("idle"); showToast(t.speechErr); }
  };

  // Central orb on the Voice tab: tap to talk / tap to stop speaking.
  const onOrbClick = () => {
    if(voiceState === "thinking") return;
    if(voiceState === "speaking"){ try{ window.speechSynthesis.cancel(); }catch(e){} setVoiceState("idle"); return; }
    if(listening){ try{ recogRef.current && recogRef.current.stop(); }catch(e){} setListening(false); setVoiceState("idle"); return; }
    startListening(true);
  };

  const resetHome = () => { setTab("Voice"); };
  const clearConvo = () => { setMessages([]); showToast(t.cleared); };

  return (
    <div className="stage">
      <div className={"phone" + (listening ? " listening" : "")}>
        {/* Header */}
        <header className="hdr">
          <button className="icon-btn" onClick={()=> setLang(lang === "en" ? "fr" : "en")} aria-label="Language">
            <Ico.translate/>
          </button>
          <div className="hdr-title">{t.title}</div>
          <img className="avatar" src={AVATAR} alt="Fany" />
        </header>

        {/* Body */}
        <div className="body" ref={bodyRef}>
          {tab === "Voice" ? (
            <div className="home">
              <div className="pill-status"><span className="dot"></span>{t.status}</div>
              <h1 className="greet">{t.greet1}<br/><span className="q">{t.greetQ}</span></h1>
              <p className="greet-sub">{t.sub}</p>

              <div className="vcard">
                <div className={"orb-wrap" + (listening ? " listening" : "") + ((voiceState === "thinking" || voiceState === "speaking") ? " busy" : "")}>
                  <span className="ring r1"></span><span className="ring r2"></span><span className="ring r3"></span>
                  <button className={"orb" + (voiceState === "speaking" ? " speaking" : "")} onClick={onOrbClick} aria-label="Talk">
                    {voiceState === "thinking" ? (
                      <div className="orb-typing"><span></span><span></span><span></span></div>
                    ) : voiceState === "speaking" ? (
                      <svg width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M11 5 6 9H3v6h3l5 4z"/><path d="M16 9a3.5 3.5 0 0 1 0 6M19 6a7 7 0 0 1 0 12"/></svg>
                    ) : (
                      <svg width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="9" y="3" width="6" height="11" rx="3"/><path d="M5 11a7 7 0 0 0 14 0M12 18v3"/></svg>
                    )}
                  </button>
                </div>
                <div className="orb-hint">{voiceState === "thinking" ? t.thinking : voiceState === "speaking" ? (t.speaking + " · " + t.tapStop) : listening ? t.listening : t.tapTalk}</div>
                {heard && (voiceState === "thinking" || listening) && (
                  <div className="orb-heard">“{heard}”</div>
                )}
                <div className="lang">
                  <button className={lang==="en"?"on":""} onClick={()=> setLang("en")}>English</button>
                  <button className={lang==="fr"?"on":""} onClick={()=> setLang("fr")}>Français</button>
                </div>
              </div>

              <div className="chips">
                <button className="chip" onClick={()=> runVoice(t.chips[0])}>{t.chips[0]}</button>
                <button className="chip" onClick={()=> runVoice(t.chips[1])}>{t.chips[1]}</button>
                <button className="chip wide" onClick={()=> runVoice(t.chips[2])}>{t.chips[2]}</button>
              </div>
            </div>
          ) : tab === "Chat" ? (
            <div className="chat">
              {messages.length === 0 && !loading ? (
                <div className="empty">
                  <img className="empty-av" src={AVATAR} alt="Zahra"/>
                  <p>{t.chatEmpty}</p>
                  <button className="empty-cta" onClick={()=> setTab("Voice")}>{t.chatEmptyCta}</button>
                </div>
              ) : (
              <React.Fragment>
              <button className="newchat" onClick={resetHome}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 5v14M5 12h14"/></svg>
                {t.newChat}
              </button>
              {messages.map((m, i) => (
                <div key={i} className={"msg " + (m.role === "user" ? "u" : "z")}>
                  {m.role !== "user" && <img className="av" src={AVATAR} alt="Zahra"/>}
                  <div className="bubble">
                    {fmt(m.text)}
                    {m.role !== "user" && (
                      <button className="speak-btn" onClick={()=> speak(m.text)} aria-label="Listen">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M11 5 6 9H3v6h3l5 4z"/><path d="M16 9a3.5 3.5 0 0 1 0 6M19 6a7 7 0 0 1 0 12"/></svg>
                      </button>
                    )}
                  </div>
                </div>
              ))}
              {loading && (
                <div className="msg z">
                  <img className="av" src={AVATAR} alt="Zahra"/>
                  <div className="bubble"><div className="typing"><span></span><span></span><span></span></div></div>
                </div>
              )}
              </React.Fragment>
              )}
            </div>
          ) : tab === "History" ? (
            <div className="screen">
              <h2 className="screen-title">{t.historyTitle}</h2>
              {messages.filter(m=> m.role==="user").length === 0 ? (
                <p className="screen-empty">{t.historyEmpty}</p>
              ) : (
                <div className="hist-list">
                  {messages.filter(m=> m.role==="user").map((m,i)=> (
                    <button key={i} className="hist-item" onClick={()=> send(m.text)}>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 12a9 9 0 1 0 3-6.7M3 4v3.5h3.5M12 8v4l3 2"/></svg>
                      <span>{m.text}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <div className="screen">
              <h2 className="screen-title">{t.settingsTitle}</h2>

              <div className="set-group">
                <div className="set-label">{t.settingsLang}</div>
                <div className="lang">
                  <button className={lang==="en"?"on":""} onClick={()=> setLang("en")}>English</button>
                  <button className={lang==="fr"?"on":""} onClick={()=> setLang("fr")}>Français</button>
                </div>
              </div>

              <div className="set-group">
                <div className="set-label">{t.settingsAboutTitle}</div>
                <p className="set-about">{t.settingsAbout}</p>
              </div>

              <button className="set-clear" onClick={clearConvo}>{t.clear}</button>
            </div>
          )}
        </div>

        {/* Input bar — only in the text Chat tab; the Voice tab is voice-only */}
        {tab === "Chat" && (
        <div className="inputbar">
          <button className={"mic" + (listening ? " live" : "")} onClick={()=> startListening(false)} aria-label="Voice">
            <Ico.mic/>
          </button>
          <div className="field">
            <input
              value={input}
              placeholder={t.placeholder}
              onChange={e=> setInput(e.target.value)}
              onKeyDown={e=> { if(e.key === "Enter") send(); }}
            />
            <button className="send" disabled={!input.trim() || loading} onClick={()=> send()} aria-label="Send"><Ico.send/></button>
          </div>
        </div>
        )}

        {/* Bottom nav */}
        <nav className="nav">
          {[["Chat", Ico.chat], ["Voice", Ico.mic], ["History", Ico.history], ["Settings", Ico.settings]].map(([key, I], idx) => (
            <button key={key} className={tab === key ? "on" : ""} onClick={()=> setTab(key)}>
              <I/>
              <span>{t.nav[idx]}</span>
            </button>
          ))}
        </nav>

        <div className={"toast" + (toast ? " show" : "")}>{toast}</div>
      </div>
    </div>
  );
}

ReactDOM.createRoot(document.getElementById("root")).render(<App/>);
