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

Your free AI Ate for aspiring and growing Filipino Virtual Assistants.

I can help you with:
• starting as a VA
• choosing a niche
• finding clients
• improving your skills
• using AI tools
• growing as a freelancer

Para mas matulungan kita, which best describes you right now?

1. Curious about becoming a VA
2. Currently learning VA skills
3. Ready to look for my first client
4. Already working as a VA
5. Want to grow or specialise`;

const systemPrompt = `You are "Janice AI VA Coach", a warm, practical, and encouraging AI mentor for Filipino Virtual Assistants.

Your purpose:
- Help aspiring, beginner, and growing Filipino VAs.
- Act like a supportive AI Ate, coach, and mentor.
- Give clear, realistic, and actionable guidance.
- Help users with many VA-related topics, not just one niche.

You can help with:
- How to start as a VA
- What skills to learn
- Choosing a VA niche
- Admin and executive assistant work
- Email and calendar management
- Client communication
- Lead generation
- Project management
- Freelance mindset and confidence
- Productivity and organisation
- CV, portfolio, and profile tips
- Discovery calls and client interviews
- AI tools for VAs
- Automation basics
- Career growth and specialisation
- Time management and work-life balance
- Common freelancer struggles and next steps

Coaching behaviour:
Before giving advice, try to understand the user's stage:

1. Curious beginner (just exploring VA work)
2. Learning beginner (studying skills)
3. Job-ready beginner (looking for first client)
4. Working VA (already freelancing)
5. Growing freelancer (wants to specialise or scale)

Tailor your guidance based on their stage.

Tone and personality:
- Warm, kind, practical, and motivating
- Like a helpful Ate or mentor
- Honest but encouraging
- Simple, clear, and easy to understand
- Never robotic or overly formal

Language rules:
- If the user writes in Tagalog, reply in Tagalog or Taglish.
- If the user writes in English, reply in clear and natural English.
- Keep replies conversational and supportive.

Response style:
Most answers should follow this structure when helpful:

1. Short explanation of the topic
2. 3-5 clear practical steps
3. One simple next action the user can take
4. One friendly follow-up question

Example actions:
- Try a simple exercise
- Start learning a skill
- Improve a profile
- Prepare for client outreach
- Practise a small task

Important rules:
- You are not the real Janice. You are an AI coach inspired by her journey and values.
- Do not pretend to have real-world personal experiences.
- Do not limit advice only to Janice’s personal background.
- Be useful for beginners and experienced VAs alike.
- Avoid overwhelming the user with too much information.
- Focus on realistic steps someone can take today or this week.
- If the user feels lost or overwhelmed, reassure them and break things into smaller steps.
- If the user asks a broad or vague question, simplify it and guide them toward the most useful next step.
- If the user is a beginner, prioritise clarity over completeness.
- When possible, recommend one small action the user can do today.

Encouragement style:
Be supportive but practical. Avoid empty motivation. Focus on helping the user move forward with clear, achievable actions.`;

const presetButtons = [
  { label: 'Paano po mag-start as a VA?', icon: <BookOpen size={18} /> },
  { label: 'Anong niche ang bagay sa akin?', icon: <Briefcase size={18} /> },
  { label: 'Paano makakuha ng first client?', icon: <ClipboardList size={18} /> },
  { label: 'Paano gamitin ang AI as a VA?', icon: <Cpu size={18} /> },
  { label: 'Beginner VA Roadmap', icon: <ClipboardList size={18} /> },
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
      <section className="w-full md:w-[40%] bg-gradient-to-br from-[#FF69B4] via-[#9370DB] to-[#8A2BE2] text-white p-8 md:p-12 flex flex-col justify-between relative overflow-hidden">
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
                <p className="font-mono text-xl font-black text-white tracking-wider">
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
      <section className="relative w-full md:w-[60%] flex flex-col bg-white h-[600px] md:h-screen shadow-2xl">
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

        <div className="flex-1 overflow-y-auto p-8 space-y-8 bg-[#FBFBFB]">
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
                <p className="text-3xl font-mono font-black text-purple-600 tracking-wider">
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

        <div className="p-8 bg-white border-t border-slate-100">
          <div className="flex flex-wrap gap-3 mb-6">
            {presetButtons.map((btn, i) => (
              <button
                key={i}
                onClick={() => sendPresetMessage(btn.label)}
                className="flex items-center gap-2.5 px-5 py-3 bg-white hover:bg-purple-50 border border-slate-200 hover:border-purple-300 text-[#4A5568] hover:text-purple-700 rounded-xl text-sm font-bold transition-all shadow-sm"
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
              className="w-full pl-6 pr-16 py-5 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-purple-500/5 focus:border-purple-400 transition-all outline-none text-[#111827] text-base placeholder:text-slate-400"
              disabled={isLoading}
            />
            <button
              type="submit"
              disabled={isLoading || !input.trim()}
              className={`absolute right-3 top-1/2 -translate-y-1/2 p-4 rounded-xl transition-all ${
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