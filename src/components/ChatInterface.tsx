import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Send, Heart, MessageCircle, Sparkles, User, Coffee } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { cn } from '../lib/utils';
import { getSandyResponse } from '../services/gemini';

interface Message {
  id: string;
  role: 'user' | 'model';
  text: string;
  timestamp: Date;
}

export default function ChatInterface() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'model',
      text: "Hi there! I'm Sandy. I was just thinking about you. How has your day been so far? I'd love to hear about any happy or even not-so-happy moments you've had.",
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  const moodOptions = [
    { label: "I'm happy! 😊", value: "I'm feeling really happy today!" },
    { label: "A bit sad 😔", value: "I'm feeling a bit sad right now." },
    { label: "Just tired 😴", value: "I'm just feeling very tired." },
    { label: "Need to talk 💬", value: "I have something on my mind and I need to talk." },
  ];

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      text: input,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    const history = messages.concat(userMessage).map((m) => ({
      role: m.role,
      parts: [{ text: m.text }],
    }));

    const responseText = await getSandyResponse(history);

    const sandyMessage: Message = {
      id: (Date.now() + 1).toString(),
      role: 'model',
      text: responseText || "I'm listening...",
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, sandyMessage]);
    setIsLoading(false);
  };

  const handleMoodClick = (moodValue: string) => {
    setInput(moodValue);
    // Auto-send after a short delay for better UX
    setTimeout(() => {
      const sendBtn = document.getElementById('send-button');
      sendBtn?.click();
    }, 100);
  };

  return (
    <div className="flex flex-col h-screen max-w-2xl mx-auto bg-sandy-bg shadow-sm border-x border-sandy-warm">
      {/* Header */}
      <header className="p-6 border-bottom border-sandy-warm flex items-center justify-between bg-white/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-full bg-sandy-accent flex items-center justify-center text-white shadow-md">
            <Heart size={24} fill="currentColor" />
          </div>
          <div>
            <h1 className="serif text-2xl font-semibold text-sandy-accent leading-tight">Sandy</h1>
            <p className="text-xs uppercase tracking-widest text-gray-500 font-medium">Your Best Friend</p>
          </div>
        </div>
        <div className="flex gap-2">
           <button className="p-2 rounded-full hover:bg-sandy-soft transition-colors text-sandy-accent">
             <Coffee size={20} />
           </button>
        </div>
      </header>

      {/* Chat Area */}
      <div 
        ref={scrollRef}
        className="flex-1 overflow-y-auto p-6 space-y-8 scroll-smooth"
      >
        <AnimatePresence initial={false}>
          {messages.map((message) => (
            <motion.div
              key={message.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={cn(
                "flex flex-col max-w-[85%]",
                message.role === 'user' ? "ml-auto items-end" : "mr-auto items-start"
              )}
            >
              <div className="flex items-center gap-2 mb-1 px-1">
                <span className="text-[10px] uppercase tracking-tighter text-gray-400 font-bold">
                  {message.role === 'user' ? 'You' : 'Sandy'}
                </span>
                <span className="text-[10px] text-gray-300">
                  {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
              
              <div className={cn(
                "p-4 rounded-2xl text-sm leading-relaxed shadow-sm",
                message.role === 'user' 
                  ? "bg-sandy-accent text-white rounded-tr-none" 
                  : "bg-white text-gray-800 rounded-tl-none border border-sandy-warm"
              )}>
                <div className="prose prose-sm max-w-none">
                  <ReactMarkdown>{message.text}</ReactMarkdown>
                </div>
              </div>
              
              {message.role === 'model' && (
                <motion.div 
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="mt-2 text-sandy-accent/40"
                >
                  <Sparkles size={12} />
                </motion.div>
              )}
            </motion.div>
          ))}
        </AnimatePresence>
        
        {isLoading && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex items-center gap-2 text-sandy-accent/60 italic text-xs ml-1"
          >
            <div className="flex gap-1">
              <span className="animate-bounce">.</span>
              <span className="animate-bounce delay-100">.</span>
              <span className="animate-bounce delay-200">.</span>
            </div>
            Sandy is thinking...
          </motion.div>
        )}
      </div>

      {/* Mood Quick Select */}
      <div className="px-6 py-2 flex gap-2 overflow-x-auto no-scrollbar bg-sandy-bg/50">
        {moodOptions.map((mood) => (
          <button
            key={mood.label}
            onClick={() => handleMoodClick(mood.value)}
            className="whitespace-nowrap px-3 py-1.5 rounded-full bg-white border border-sandy-warm text-xs text-sandy-accent hover:bg-sandy-soft transition-colors shadow-sm"
          >
            {mood.label}
          </button>
        ))}
      </div>

      {/* Input Area */}
      <div className="p-6 bg-white/80 backdrop-blur-md border-t border-sandy-warm">
        <div className="relative flex items-center gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Tell Sandy anything..."
            className="w-full p-4 pr-14 rounded-full bg-sandy-soft border-none focus:ring-2 focus:ring-sandy-accent/20 outline-none text-sm transition-all placeholder:text-gray-400"
          />
          <button
            id="send-button"
            onClick={handleSend}
            disabled={!input.trim() || isLoading}
            className={cn(
              "absolute right-2 p-2 rounded-full transition-all",
              input.trim() && !isLoading 
                ? "bg-sandy-accent text-white shadow-lg scale-100" 
                : "bg-gray-200 text-gray-400 scale-90"
            )}
          >
            <Send size={20} />
          </button>
        </div>
        <p className="text-[10px] text-center mt-3 text-gray-400 uppercase tracking-widest">
          Sandy is here to listen, always.
        </p>
      </div>
    </div>
  );
}
