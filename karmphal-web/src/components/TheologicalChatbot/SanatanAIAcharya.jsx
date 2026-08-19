import React, { useState, useRef, useEffect } from 'react';
import { Send, Copy, Check } from 'lucide-react';
import { geminiService } from '../../services/geminiService';

export default function SanatanAIAcharya({ panchangData }) {
  const [messages, setMessages] = useState([
    {
      id: 1,
      sender: 'acharya',
      text: 'ॐ नमो नारायणाय । कल्याणमस्तु वत्स। आप धर्म, कर्म, कुण्डली, जीवन के कष्ट अथवा शास्त्र सम्बन्धी कोई भी प्रश्न पूछें, मैं आपको सप्रमाण व सटीक मार्गदर्शन प्रदान करूँगा।'
    }
  ]);

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
    'कर्म सिद्धान्त कैसे कार्य करता है और क्या प्रारब्ध बदला जा सकता है?',
    'मेरी कुण्डली का लग्न, चन्द्र नक्षत्र व ग्रह स्थिति देखकर मार्गदर्शन करें।',
    'गरुड़ पुराण के २८ नरक कौन से हैं और महापापों का प्रायश्चित क्या है?',
    'स्वप्न में श्वेत गौ, पर्वत पर चढ़ना अथवा सर्प देखने का क्या फल होता है?',
    'घर में ईशान्य (NE) कोण में क्या होना चाहिए और वास्तु दोष का क्या उपाय है?'
  ];

  return (
    <div className="space-y-4">
      {/* Main Chat Container */}
      <div className="glass-card p-4 sm:p-6 flex flex-col h-[620px] border border-[#C58B4E]/30 shadow-2xl relative">
        {/* Messages Feed */}
        <div className="flex-1 overflow-y-auto pr-1 sm:pr-2 space-y-4 mb-3">
          {messages.map(msg => {
            const isUser = msg.sender === 'user';

            return (
              <div
                key={msg.id}
                className={`flex flex-col ${isUser ? 'items-end' : 'items-start'} space-y-1.5`}
              >
                <div className={`max-w-3xl rounded-2xl p-4 text-xs sm:text-sm leading-relaxed ${
                  isUser
                    ? 'bg-gradient-to-r from-[#C58B4E]/30 to-[#8C4B19]/40 text-[#F7E7D6] border border-[#C58B4E]/40 rounded-br-none'
                    : 'bg-[#1C1008] text-[#F7E7D6] border border-[#C58B4E]/25 rounded-bl-none shadow-xl'
                }`}>
                  {!isUser && (
                    <div className="flex items-center justify-between gap-2 mb-2 pb-1.5 border-b border-[#C58B4E]/20">
                      <span className="font-dharmik font-bold text-[#F3CA9D] text-sm flex items-center gap-1.5">
                        <span className="animate-diya text-sm">🪔</span>
                        <span>आचार्य जी</span>
                      </span>

                      <button
                        onClick={() => handleCopy(msg.id, msg.text)}
                        title="उत्तर प्रतिलिपि बनाएं"
                        className="p-1 text-[#D4A373] hover:text-[#FFF] rounded"
                      >
                        {copiedId === msg.id ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                  )}

                  <div className="whitespace-pre-line text-[#F7E7D6] leading-relaxed font-sans font-normal">
                    {msg.text}
                  </div>
                </div>
              </div>
            );
          })}

          {/* Loading Indicator */}
          {isLoading && (
            <div className="flex items-center gap-3 p-3.5 rounded-2xl bg-[#1C1008] border border-[#C58B4E]/30 max-w-xs">
              <span className="font-sanskrit text-lg text-[#E0A96D] animate-spin">ॐ</span>
              <div className="text-xs text-[#F3CA9D] font-semibold">
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
              className="px-3 py-1.5 rounded-xl text-[11px] whitespace-nowrap bg-[#1C1008] hover:bg-[#C58B4E]/20 text-[#D4A373] hover:text-[#F3CA9D] border border-[#C58B4E]/20 hover:border-[#C58B4E]/50 transition-all font-medium"
            >
              {prompt}
            </button>
          ))}
        </div>

        {/* Input Bar */}
        <div className="flex items-center gap-2 pt-2">
          <input
            type="text"
            placeholder="आचार्य जी से कोई भी प्रश्न पूछें..."
            value={inputQuery}
            onChange={e => setInputQuery(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleSend()}
            className="flex-1 bg-[#140B06] border border-[#C58B4E]/30 text-[#F7E7D6] text-xs sm:text-sm px-4 py-3 rounded-xl outline-none focus:border-[#E0A96D] font-sans"
          />
          <button
            onClick={() => handleSend()}
            disabled={isLoading || !inputQuery.trim()}
            className="btn-gold py-3 px-5 disabled:opacity-40"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
