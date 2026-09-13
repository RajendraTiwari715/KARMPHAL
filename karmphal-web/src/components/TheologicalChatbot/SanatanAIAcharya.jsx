import React, { useState, useRef, useEffect } from 'react';
import { Send, Copy, Check, Sparkles } from 'lucide-react';
import { geminiService } from '../../services/geminiService';

export default function SanatanAIAcharya({ panchangData }) {
  const defaultMessage = {
    id: 1,
    sender: 'acharya',
    text: 'ॐ नमो नारायणाय । कल्याणमस्तु वत्स। आप धर्म, कर्म, कुण्डली, जीवन के कष्ट अथवा शास्त्र सम्बन्धी कोई भी प्रश्न पूछें, मैं आपको सप्रमाण व सटीक मार्गदर्शन प्रदान करूँगा।'
  };

  const [messages, setMessages] = useState([defaultMessage]);

  useEffect(() => {
    fetch('/api/user/chat-history')
      .then(res => res.json())
      .then(data => {
        if (data && data.length > 0) {
          const formatted = data.map((d, i) => ({ id: i + 1, sender: d.sender, text: d.text }));
          setMessages(formatted);
        }
      })
      .catch(err => console.warn('Failed to load chat history', err));
  }, []);

  const saveMessageToBackend = (sender, text) => {
    fetch('/api/user/chat-history', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ sender, text })
    }).catch(err => console.warn('Failed to save message', err));
  };

  const [inputQuery, setInputQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [copiedId, setCopiedId] = useState(null);
  const chatBottomRef = useRef(null);

  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  const handleSend = async (textToSend = null) => {
    const query = textToSend || inputQuery;
    if (!query.trim() || isLoading) return;

    const userMsg = {
      id: Date.now(),
      sender: 'user',
      text: query
    };

    setMessages(prev => [...prev, userMsg]);
    saveMessageToBackend('user', query);
    setInputQuery('');
    setIsLoading(true);

    try {
      const result = await geminiService.generateResponse(query, messages, panchangData);

      const acharyaMsg = {
        id: Date.now() + 1,
        sender: 'acharya',
        text: result.text
      };

      setMessages(prev => [...prev, acharyaMsg]);
      saveMessageToBackend('acharya', result.text);
    } catch (error) {
      console.error('Chat error:', error);
      const fallbackMsg = {
        id: Date.now() + 1,
        sender: 'acharya',
        text: 'कर्म का नियम सनातन और अटल है। श्रीमद्भगवद्गीता (२.४७) के अनुसार निष्काम कर्म और सात्विक पुरुषार्थ से चित्त की शुद्धि होती है। कृपया अपना प्रश्न पुनः पूछें।'
      };
      setMessages(prev => [...prev, fallbackMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = (id, text) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const samplePrompts = [
    'कर्म सिद्धान्त कैसे कार्य करता है?',
    'मेरी कुण्डली का मार्गदर्शन करें।',
    'गरुड़ पुराण के २८ नरक कौन से हैं?',
    'स्वप्न में श्वेत गौ देखने का क्या फल है?',
    'घर में ईशान्य (NE) कोण का क्या वास्तु है?'
  ];

  return (
    <div className="space-y-3 sm:space-y-4">
      {/* Main Chat Container - Responsive Height */}
      <div className="glass-card p-3.5 sm:p-6 flex flex-col h-[520px] sm:h-[600px] md:h-[640px] border border-[#C58B4E]/30 shadow-2xl relative rounded-2xl sm:rounded-3xl">
        {/* Messages Feed */}
        <div className="flex-1 overflow-y-auto pr-1 sm:pr-2 space-y-3 sm:space-y-4 mb-2 sm:mb-3">
          {messages.map(msg => {
            const isUser = msg.sender === 'user';

            return (
              <div
                key={msg.id}
                className={`flex flex-col ${isUser ? 'items-end' : 'items-start'} space-y-1`}
              >
                <div className={`max-w-[92%] sm:max-w-2xl lg:max-w-3xl rounded-2xl p-3 sm:p-4 text-xs sm:text-sm leading-relaxed ${
                  isUser
                    ? 'bg-gradient-to-r from-[#C58B4E]/30 to-[#8C4B19]/40 text-[#F7E7D6] border border-[#C58B4E]/40 rounded-br-none'
                    : 'bg-black/40 backdrop-blur-sm text-[#F7E7D6] border border-[#C58B4E]/25 rounded-bl-none shadow-xl'
                }`}>
                  {!isUser && (
                    <div className="flex items-center justify-between gap-2 mb-1.5 pb-1 border-b border-[#C58B4E]/20">
                      <span className="font-dharmik font-bold text-[#F3CA9D] text-xs sm:text-sm flex items-center gap-1.5">
                        <span className="animate-diya text-xs sm:text-sm">🪔</span>
                        <span>आचार्य जी</span>
                      </span>

                      <button
                        onClick={() => handleCopy(msg.id, msg.text)}
                        title="उत्तर प्रतिलिपि बनाएं"
                        className="p-1 text-[#D4A373] hover:text-[#FFF] rounded active:scale-95"
                      >
                        {copiedId === msg.id ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                  )}

                  <div className="whitespace-pre-line text-[#F7E7D6] leading-relaxed font-sans font-normal text-xs sm:text-sm">
                    {msg.text}
                  </div>
                </div>
              </div>
            );
          })}

          {/* Loading Indicator */}
          {isLoading && (
            <div className="flex items-center gap-2.5 p-3 rounded-2xl bg-black/40 backdrop-blur-sm border border-[#C58B4E]/30 max-w-[240px]">
              <span className="font-sanskrit text-base text-[#E0A96D] animate-spin">ॐ</span>
              <div className="text-[11px] sm:text-xs text-[#F3CA9D] font-semibold">
                आचार्य जी उत्तर दे रहे हैं...
              </div>
            </div>
          )}

          <div ref={chatBottomRef} />
        </div>

        {/* Suggestion Chips */}
        <div className="flex gap-1.5 overflow-x-auto pb-2 pt-1 no-scrollbar border-t border-[#C58B4E]/20">
          {samplePrompts.map((prompt, idx) => (
            <button
              key={idx}
              onClick={() => handleSend(prompt)}
              className="px-2.5 py-1.5 rounded-xl text-[10px] sm:text-[11px] whitespace-nowrap bg-black/40 backdrop-blur-sm hover:bg-[#C58B4E]/20 text-[#D4A373] hover:text-[#F3CA9D] border border-[#C58B4E]/20 hover:border-[#C58B4E]/50 transition-all font-medium shrink-0 active:scale-95"
            >
              {prompt}
            </button>
          ))}
        </div>

        {/* Input Bar */}
        <div className="flex items-center gap-2 pt-1 sm:pt-2">
          <input
            type="text"
            placeholder="आचार्य जी से कोई भी प्रश्न पूछें..."
            value={inputQuery}
            onChange={e => setInputQuery(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleSend()}
            className="flex-1 bg-black/50 backdrop-blur-sm border border-[#C58B4E]/30 text-[#F7E7D6] text-xs sm:text-sm px-3.5 sm:px-4 py-2.5 sm:py-3 rounded-xl outline-none focus:border-[#E0A96D] font-sans"
          />
          <button
            onClick={() => handleSend()}
            disabled={isLoading || !inputQuery.trim()}
            className="btn-gold py-2.5 sm:py-3 px-4 sm:px-5 disabled:opacity-40 shrink-0"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
