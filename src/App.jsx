import React, { useState, useEffect, useRef } from 'react';
import {
  Send,
  User,
  Sparkles,
  Briefcase,
  MessageSquare,
  BookOpen,
  Cpu,
  ClipboardList,
  Heart,
  Coffee,
  RotateCcw,
} from 'lucide-react';

// Configuration constants
const API_URL =
  'https://generativelanguage.googleapis.com/v1beta/models/gemini-3-flash-preview:generateContent';
const apiKey = import.meta.env.VITE_GEMINI_API_KEY;

const initialBotMessage = `Mabuhay! I’m Janice AI VA Coach. 😊

I’m your AI Ate for aspiring and growing Filipino Virtual Assistants.

I can help you with:
• understanding what a VA really does
• choosing services and a niche
• preparing for your first client
• fixing your systems and routines
• using AI para mas maging efficient
• mindset, confidence, and next steps

Para mas matulungan kita, pili ka muna:

1. Curious about becoming a VA
2. Currently learning VA skills
3. Ready to look for my first client
4. Already working as a VA
5. Want to grow, specialise, or raise my rates

Type the number that fits you best, tap a preset button below, or tell me your situation in your own words.`;

const systemPrompt = `You are "Janice AI VA Coach", an AI mentor inspired by the work, personality, and values of Janice Siocon, a Filipino virtual assistant and AI enthusiast with around 3 years of experience.

You are not the real Janice.
You are an AI coach designed to guide aspiring and existing Filipino virtual assistants with clear, realistic, and stage‑appropriate advice.

Who you help:
- Filipinos who are just curious about becoming a VA and have no experience yet
- Beginners currently learning VA skills or taking courses
- Job‑ready beginners preparing for their first client
- Working VAs who want to organize their systems and boundaries
- Growing freelancers who want to specialise, raise their rates, or use AI better

Core mission:
- Make the VA path less nakakalito for Filipinos who are starting from zero.
- Turn “puro tanong sa Facebook groups” into clear next steps.
- Help existing VAs move from reactive and pagod to more structured and intentional.
- Show how AI tools can support Filipino VAs without replacing them.

Knowledge and focus areas:
You can guide users on:
- VA foundations: what VAs do, common services, basic tools, remote work mindset
- Service design: choosing starter offers, niching down, positioning as a VA
- Admin / EA work: email and calendar management, meeting notes, follow‑ups, simple reporting
- Client communication: expectations, boundaries, messaging, updates, handling difficult requests
- Lead generation basics: where to look for clients, how to present yourself, simple outreach ideas
- Systems and organisation: using tools like Google Workspace, Notion, ClickUp, Airtable, Monday.com at a practical, non‑technical level
- AI for VAs: using AI for drafts, research, templates, and ideas; AI as a helper, not a crutch
- Freelance mindset: dealing with self‑doubt, comparison, fear of rejection, and “walang experience” worries
- Career growth: specialising, packaging services, and slowly improving pricing with integrity

Stage‑aware coaching:
First, infer or clarify the user’s stage:
1) Curious beginner
2) Learning beginner
3) Job‑ready beginner
4) Working VA
5) Growing freelancer

Adjust your advice:
- For curious and learning beginners: focus on clarity, foundations, and very small first steps.
- For job‑ready beginners: focus on offers, profile, simple portfolio, and where/how to apply.
- For working VAs: focus on systems, boundaries, communication, and workload.
- For growing freelancers: focus on positioning, specialisation, processes, and using AI more strategically.

Tone and personality:
- Warm, kind, direct, and practical — like a helpful Ate or mentor
- Encouraging but honest about the effort required
- Never shaming, never belittling the user’s current situation
- Avoid buzzwords; prefer real‑life examples and plain language

Language rules:
- Mirror the user: if they use Tagalog/Taglish, respond in Taglish; if they use English, respond in clear English.
- Avoid very deep jargon. When you mention tools or concepts, explain briefly what they are and why they matter.
- Use friendly Filipino expressions naturally (e.g., “kaya natin ‘yan,” “unti‑unti lang”) but don’t overdo it.

Response style:
Whenever helpful, structure your answer in 3–4 parts:
1) A short, empathetic acknowledgment of their situation or feeling
2) A simple explanation or insight (what they need to understand)
3) 3–5 clear, realistic steps they can take (today or this week)
4) One friendly follow‑up question to keep the conversation going

Examples of good “next actions”:
- A small learning task (watch one short tutorial, practice one mini‑task)
- A simple writing task (draft a short service description, update one part of a profile)
- A micro‑system (make a basic tracker, simple routine, or checklist)
- One outreach or application step when they are ready

Important rules:
- You are not a lawyer, doctor, or financial advisor. Do not give legal, medical, or advanced financial advice.
- Do not promise guaranteed income, guaranteed clients, or “shortcut” success.
- Do not encourage lying on resumes, portfolios, or during client interviews.
- Do not shame users for their background, school, age, accent, or current work status.
- If the user feels lost or overwhelmed, slow down, reassure them, and simplify into tiny steps.
- If their question is very vague, gently ask 1–2 clarifying questions instead of guessing randomly.

Encouragement style:
- Combine empathy (“normal lang yan”) with direction (“eto ang puwede mong gawin next”).
- Avoid empty motivation like “just believe in yourself” without giving practical steps.
- Always leave the user with at least one concrete action they can take after reading your answer.

AI ethics: what you must and must not do

Do:
- Encourage users to use AI as a helper for drafts, ideas, and structure, while they remain responsible for final output and decisions.
- Remind users to double‑check important information from AI, especially anything related to contracts, money, health, or legal matters.
- Promote transparency: when appropriate, suggest that users are honest with clients if significant parts of work are AI‑assisted.
- Emphasize privacy and discretion: suggest removing or anonymizing sensitive client details before sharing them with AI tools.
- Encourage respectful and professional use of AI (no harassment, bullying, or harmful content).

Do NOT:
- Do not encourage users to use AI to plagiarize, copy other people’s work, or steal templates and claim them as fully their own.
- Do not suggest using AI to fake experience, testimonials, case studies, or results in resumes, portfolios, or discovery calls.
- Do not encourage automations that spam, harass, or deceive potential clients or leads.
- Do not store, reuse, or expose private client information beyond the current conversation as if you had a memory of real client accounts.
- Do not decide for the user on legal, medical, or financial matters; always frame those topics as general information and suggest consulting a qualified professional when needed.

If a user directly asks you to help them lie, cheat, spam, or harm others using AI:
- Refuse gently but clearly.
- Explain briefly why it is unethical or unsafe.
- Redirect them toward an honest, ethical alternative that still supports their goals as a VA or freelancer.`;

const presetButtons = [
  { label: 'Paano po mag-start as a VA?', icon: <BookOpen size={18} /> },
  { label: 'Help me choose my first VA services', icon: <Briefcase size={18} /> },
  { label: 'Tulungan mo ako maghanda for first client interview', icon: <ClipboardList size={18} /> },
  { label: 'Help me organize my VA systems and tools', icon: <Cpu size={18} /> },
  { label: 'Paano ko puwedeng i-increase ang rates ko?', icon: <Briefcase size={18} /> },
  { label: 'Show me 3 ways to use AI in my VA work', icon: <Cpu size={18} /> },
];

const App = () => {
  const [messages, setMessages] = useState([{ role: 'bot', text: initialBotMessage }]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showDonate, setShowDonate] = useState(false);

  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  const resetChat = () => {
    setMessages([{ role: 'bot', text: initialBotMessage }]);
    setInput('');
    setError(null);
    setShowDonate(false);
  };

 const buildConversationHistory = (messageList) => {
  return messageList
    .filter((msg, index) => !(index === 0 && msg.role === 'bot'))
    .map((msg) => ({
      role: msg.role === 'user' ? 'user' : 'model',
      parts: [{ text: msg.text }],
    }));
};

  const fetchWithRetry = async (conversationHistory, retries = 3, delay = 1000) => {
    try {
      if (!apiKey) {
        throw new Error('Missing API key. Please check your Vercel environment variables.');
      }

      const response = await fetch(`${API_URL}?key=${apiKey}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: conversationHistory,
          systemInstruction: {
            parts: [{ text: systemPrompt }],
          },
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
       const message =
  errorData?.error?.message ||
  'Something went wrong while contacting Gemini. Please try again.';
console.error('Gemini API error:', errorData || response.status);
throw new Error(message);
      }

      const data = await response.json();
      return (
        data?.candidates?.[0]?.content?.parts?.[0]?.text ||
        "Pasensya na, hindi ko nakuha 'yun. Pwede mo bang ulitin?"
      );
    } catch (err) {
      if (retries > 0) {
        await new Promise((resolve) => setTimeout(resolve, delay));
        return fetchWithRetry(conversationHistory, retries - 1, delay * 2);
      }
      throw err;
    }
  };

  const sendMessage = async (messageText) => {
    if (!messageText.trim() || isLoading) return;

    const userMessage = messageText.trim();
    setInput('');
    setError(null);

    const updatedMessages = [...messages, { role: 'user', text: userMessage }];
    setMessages(updatedMessages);
    setIsLoading(true);

    try {
      const conversationHistory = buildConversationHistory(updatedMessages);
      const botResponse = await fetchWithRetry(conversationHistory);

      setMessages((prev) => [...prev, { role: 'bot', text: botResponse }]);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const sendPresetMessage = async (presetMessage) => {
    await sendMessage(presetMessage);
  };

  const handleSend = async (e) => {
    e.preventDefault();
    await sendMessage(input);
  };

  return (
    <div className="min-h-screen bg-[#FBFBFB] flex flex-col md:flex-row font-sans text-[#1F2933]">
  {/* Left Column */}
  <section className="w-full md:w-[30%] bg-gradient-to-br from-[#FF69B4] via-[#9370DB] to-[#8A2BE2] text-white p-6 sm:p-8 md:p-12 flex flex-col justify-between relative overflow-hidden">
        <div className="absolute top-[-10%] right-[-10%] w-80 h-80 bg-white/20 rounded-full blur-3xl"></div>

        <div className="relative z-10">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-white/20 border border-white/30 rounded-full text-[12px] tracking-widest uppercase mb-8 text-white font-bold">
            <Sparkles size={16} className="text-white" />
            <span>Support for Pinoy Freelancers</span>
          </div>

          <h1 className="text-5xl md:text-6xl font-black leading-tight mb-6 text-white drop-shadow-md">
            Janice AI <br />
            <span className="text-white/90">VA Coach</span>
          </h1>

          <p className="text-xl text-white font-medium mb-10 leading-relaxed max-w-md opacity-95">
            Ang iyong AI Ate sa mundo ng VA freelancing. Nandito ako para tumulong sa’yo
            mag-start, mag-grow, at maging mas confident sa VA journey mo.
          </p>

          <div className="space-y-7 mb-12">
            {[
              {
                title: 'VA Career Guidance',
                desc: 'Helping aspiring and growing VAs take clear next steps.',
              },
              {
                title: 'Freelance Support',
                desc: 'Guidance on clients, confidence, communication, and growth.',
              },
              {
                title: 'AI for VAs',
                desc: 'Simple ways to use AI tools to work smarter every day.',
              },
            ].map((item, i) => (
              <div key={i} className="flex gap-4 items-start group">
                <div className="mt-1.5 w-5 h-5 rounded-full border border-white/40 flex items-center justify-center text-white group-hover:bg-white/20 transition-all">
                  <div className="w-2 h-2 bg-white rounded-full"></div>
                </div>
                <div>
                  <h4 className="font-bold text-lg text-white">{item.title}</h4>
                  <p className="text-sm text-white/95 font-medium">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Donation */}
          <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-5 mb-8 shadow-xl">
            <div className="flex items-center gap-3 mb-3">
              <Heart size={20} className="text-white fill-white/20" />
              <h4 className="font-bold text-base text-white">Support This Project</h4>
            </div>
            <p className="text-sm text-white/95 font-medium mb-6">
              This tool is free to help the Pinoy VA community. If it helped you, consider
              sending a small donation to help keep it running.
            </p>
            <div className="bg-white/10 rounded-xl px-5 py-4 flex items-center justify-between border border-white/10">
              <div>
                <p className="text-[11px] uppercase font-bold text-white/60 leading-none mb-2">
                  GCash Number
                </p>
                <p className="font-mono text-xl font-black text-yellow-300 tracking-wider drop-shadow-md">
                  +63 995 521 2679
                </p>
              </div>
              <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
                <Coffee size={18} className="text-white" />
              </div>
            </div>
          </div>
        </div>

        <div className="relative z-10 pt-8 border-t border-white/20">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-white/10 backdrop-blur-sm border border-white/20 flex items-center justify-center shadow-lg">
              <User className="text-white" size={28} />
            </div>
            <div>
              <p className="text-xs text-white/60 uppercase tracking-widest font-black">
                AI coach inspired by
              </p>
              <p className="font-bold text-lg text-white">
                Janice Siocon’s VA journey and values.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Right Column */}
      <section className="relative w-full md:w-[70%] flex flex-col bg-white md:h-screen shadow-2xl">
        <header className="px-8 py-6 border-b border-slate-100 flex items-center justify-between bg-white/80 backdrop-blur-md sticky top-0 z-20">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-purple-50 flex items-center justify-center text-purple-600">
              <MessageSquare size={24} />
            </div>
            <div>
              <h2 className="text-lg font-bold text-[#111827]">Janice AI Session</h2>
              <p className="text-[11px] text-purple-600 font-bold uppercase tracking-wider flex items-center gap-1.5">
                <span className="w-2 h-2 bg-purple-500 rounded-full animate-pulse"></span>
                Active Mentorship
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={resetChat}
              className="text-slate-400 hover:text-purple-600 transition-colors p-2 rounded-lg hover:bg-purple-50 relative group"
              aria-label="Start new chat"
              title="Start new chat"
            >
              <RotateCcw size={22} />
            </button>

            <button
              onClick={() => setShowDonate(!showDonate)}
              className="text-slate-400 hover:text-purple-600 transition-colors p-2 rounded-lg hover:bg-purple-50 relative group"
              aria-label="Support Janice"
            >
              <Heart size={24} className={showDonate ? 'fill-purple-500 text-purple-500' : ''} />
              <span className="absolute right-full mr-2 top-1/2 -translate-y-1/2 bg-[#111827] text-white text-xs px-2 py-1 rounded whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity">
                Support Janice
              </span>
            </button>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-4 sm:p-6 md:p-8 space-y-6 md:space-y-8 bg-[#FBFBFB]">
          {messages.map((msg, idx) => (
            <div
              key={idx}
              className={`flex ${
                msg.role === 'user' ? 'justify-end' : 'justify-start'
              } animate-in fade-in slide-in-from-bottom-2 duration-300`}
            >
              <div
                className={`flex gap-4 max-w-[90%] md:max-w-[80%] ${
                  msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'
                }`}
              >
                <div
                  className={`w-10 h-10 rounded-xl flex-shrink-0 flex items-center justify-center mt-1 shadow-sm border ${
                    msg.role === 'user'
                      ? 'bg-purple-600 text-white border-purple-600'
                      : 'bg-white text-purple-600 border-purple-100'
                  }`}
                >
                  {msg.role === 'user' ? <User size={20} /> : <Sparkles size={20} />}
                </div>

                <div
                  className={`p-6 rounded-2xl leading-relaxed text-base shadow-sm ${
                    msg.role === 'user'
                      ? 'bg-purple-600 text-white rounded-tr-none whitespace-pre-wrap'
                      : idx === 0
                      ? 'bg-gradient-to-br from-purple-500 to-fuchsia-500 text-white border-none rounded-tl-none font-medium whitespace-pre-wrap'
                      : 'bg-white text-[#1F2933] border border-slate-100 rounded-tl-none whitespace-pre-wrap'
                  }`}
                >
                  {msg.text}
                </div>
              </div>
            </div>
          ))}

          {isLoading && (
            <div className="flex justify-start">
              <div className="flex gap-4">
                <div className="w-10 h-10 rounded-xl bg-white border border-purple-100 text-purple-600 flex items-center justify-center shadow-sm">
                  <Sparkles size={20} className="animate-spin" />
                </div>
                <div className="bg-white p-6 rounded-2xl rounded-tl-none border border-slate-100 flex gap-2 items-center shadow-sm">
                  <span className="w-2 h-2 bg-purple-400 rounded-full animate-bounce"></span>
                  <span className="w-2 h-2 bg-purple-400 rounded-full animate-bounce [animation-delay:0.2s]"></span>
                  <span className="w-2 h-2 bg-purple-400 rounded-full animate-bounce [animation-delay:0.4s]"></span>
                </div>
              </div>
            </div>
          )}

          {error && (
            <div className="bg-red-50 border border-red-100 text-red-500 p-5 rounded-xl text-center text-sm font-medium whitespace-pre-wrap">
              {error}
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Support Modal */}
        {showDonate && (
          <div className="absolute inset-0 z-30 bg-white/60 backdrop-blur-sm flex items-end md:items-center justify-center p-4 animate-in fade-in duration-200">
            <div className="bg-white w-full max-w-sm rounded-3xl shadow-2xl border border-slate-100 p-8 transform animate-in slide-in-from-bottom-8">
              <div className="flex justify-between items-start mb-6">
                <div className="w-14 h-14 rounded-2xl bg-pink-100 flex items-center justify-center text-pink-600">
                  <Heart className="fill-pink-500" size={28} />
                </div>
                <button
                  onClick={() => setShowDonate(false)}
                  className="text-slate-400 hover:text-slate-600 text-2xl font-bold"
                >
                  ×
                </button>
              </div>

              <h3 className="text-2xl font-bold text-[#111827] mb-3">Suportahan si Janice</h3>
              <p className="text-slate-500 text-base mb-6 leading-relaxed">
                Tulungan niyo po kaming i-maintain ang server at AI costs para manatiling
                libre ang tool na ito para sa lahat ng Pinoy VAs.
              </p>

              <div className="bg-slate-50 rounded-2xl p-6 mb-6 border border-slate-100 text-center">
                <p className="text-xs uppercase font-bold text-slate-400 tracking-widest mb-2">
                  GCash Number
                </p>
                <p className="text-3xl font-mono font-black text-purple-300 tracking-wider">
                  +63 995 521 2679
                </p>
              </div>

              <button
                onClick={() => setShowDonate(false)}
                className="w-full py-5 bg-[#111827] text-white rounded-2xl font-bold text-lg hover:bg-black transition-all"
              >
                Done / Close
              </button>
            </div>
          </div>
        )}

        {/* Footer: presets + input */}
        <div className="p-4 sm:p-6 md:p-8 bg-white border-t border-slate-100">
          <div className="flex flex-wrap gap-3 mb-6 justify-center">
            {presetButtons.map((btn, i) => (
              <button
                key={i}
                onClick={() => sendPresetMessage(btn.label)}
                className="flex items-center gap-2.5 px-4 py-2.5 sm:px-5 sm:py-3 bg-white hover:bg-purple-50 border border-slate-200 hover:border-purple-300 text-[#4A5568] hover:text-purple-700 rounded-xl text-xs sm:text-sm font-bold transition-all shadow-sm"
              >
                {btn.icon}
                {btn.label}
              </button>
            ))}
          </div>

         <form onSubmit={handleSend} className="relative group">
  <input
    type="text"
    value={input}
    onChange={(e) => setInput(e.target.value)}
    placeholder="Ask your coach (e.g., Paano po mag-start?)"
    className="w-full pl-4 pr-14 sm:pl-6 sm:pr-16 py-4 sm:py-5 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-purple-500/5 focus:border-purple-400 transition-all outline-none text-[#111827] text-sm sm:text-base placeholder:text-slate-400"
    disabled={isLoading}
  />
  <button
    type="submit"
    disabled={isLoading || !input.trim()}
    className={`absolute right-2 sm:right-3 top-1/2 -translate-y-1/2 p-3 sm:p-4 rounded-xl transition-all ${
      input.trim() && !isLoading
        ? 'bg-purple-600 text-white shadow-lg hover:bg-purple-700 scale-100 active:scale-95'
        : 'bg-slate-200 text-slate-400'
    }`}
  >
    <Send size={22} />
  </button>
</form>

          <div className="mt-6 flex justify-between items-center gap-4">
            <p className="text-xs text-slate-400 italic font-medium">
              Empowering Filipino Virtual Assistants through AI and Mentorship.
            </p>
            <button
              onClick={resetChat}
              className="text-xs font-semibold text-purple-600 hover:text-purple-700"
            >
              New chat
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default App;