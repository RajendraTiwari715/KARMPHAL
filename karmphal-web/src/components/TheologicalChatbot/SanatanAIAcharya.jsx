import React, { useState, useRef, useEffect } from 'react';
import { Send, Copy, Check, Trash2, Loader2 } from 'lucide-react';
import { useChat } from '../../context/useChat';
import { useToast, useConfirm } from '../../context/useToast';
import { useTranslation } from '../../services/languageService';
const AcharyaMarkdown = React.lazy(() => import('./AcharyaMarkdown'));
import guruAvatar, { handleImageError, OM_FALLBACK_SVG } from '../../assets';

export default function SanatanAIAcharya({ panchangData }) {
  const { t } = useTranslation();
  const {
    messages,
    isLoading,
    isLoadingOlder,
    hasMore,
    isSending,
    sendMessage,
    loadOlderMessages,
    clearConversation
  } = useChat();

  const toast = useToast();
  const confirm = useConfirm();

  const [inputQuery, setInputQuery] = useState('');
  const [copiedId, setCopiedId] = useState(null);
  const chatBottomRef = useRef(null);
  const chatContainerRef = useRef(null);

  // Auto scroll to bottom when messages update or sending changes, unless loading older
  useEffect(() => {
    if (!isLoading && !isLoadingOlder) {
      chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isSending, isLoading, isLoadingOlder]);

  // Handle visualViewport resize on mobile when soft keyboard opens/closes
  useEffect(() => {
    if (typeof window === 'undefined' || !window.visualViewport) return;
    const handleViewportChange = () => {
      if (window.visualViewport.height < window.innerHeight * 0.85) {
        chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
      }
    };
    window.visualViewport.addEventListener('resize', handleViewportChange);
    return () => {
      window.visualViewport?.removeEventListener('resize', handleViewportChange);
    };
  }, []);

  const handleSend = async (textToSend = null) => {
    const query = textToSend || inputQuery;
    if (!query.trim() || isSending) return;

    if (typeof navigator !== 'undefined' && !navigator.onLine) {
      toast.error('आप ऑफ़लाइन हैं। आचार्य संवाद हेतु इंटरनेट कनेक्शन आवश्यक है। आपका सन्देश सुरक्षित है।');
      return; // Keep typed text in inputQuery!
    }

    try {
      setInputQuery('');
      await sendMessage(query, panchangData);
    } catch {
      setInputQuery(query); // Restore typed text
      toast.error('सन्देश भेजने में समस्या हुई। कृपया पुनः प्रयास करें।');
    }
  };

  const handleCopy = (id, text) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleClearChat = async () => {
    const isConfirmed = await confirm({
      title: 'वार्तालाप इतिहास साफ़ करें (Clear Chat)',
      message: 'क्या आप निश्चित रूप से संपूर्ण आचार्य वार्तालाप इतिहास को हटाना चाहते हैं? यह क्रिया पूर्ववत नहीं की जा सकती।',
      confirmText: 'हाँ, साफ़ करें',
      cancelText: 'रद्द करें',
      isDestructive: true
    });

    if (isConfirmed) {
      try {
        await clearConversation();
        toast.success('वार्तालाप इतिहास सफलतापूर्वक साफ़ कर दिया गया।');
      } catch {
        toast.error('इतिहास साफ़ करने में त्रुटि हुई। कृपया पुनः प्रयास करें।');
      }
    }
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
      <div className="glass-card p-3.5 sm:p-6 flex flex-col h-[540px] sm:h-[620px] md:h-[660px] border border-[#C58B4E]/30 shadow-2xl relative rounded-2xl sm:rounded-3xl">
        {/* Top Header with Clear Conversation Action */}
        <div className="flex items-center justify-between pb-3 mb-2 border-b border-[#C58B4E]/20">
          <div className="flex items-center gap-2.5">
            <img 
              src={guruAvatar} 
              alt="सनातन आचार्य अवतार (Acharya Avatar)" 
              width="44" 
              height="44" 
              loading="lazy" 
              onError={handleImageError(OM_FALLBACK_SVG)}
              className="w-10 h-10 sm:w-11 sm:h-11 rounded-2xl object-cover border border-[#C58B4E]/50 shadow-md shrink-0" 
            />
            <div>
              <h3 className="font-dharmik text-xs sm:text-sm font-bold text-[#F3CA9D]">
                सनातन धर्म संवाद एवं शास्त्र मार्गदर्शन
              </h3>
              <p className="text-[10px] text-[#C58B4E]">
                प्रमाणित श्रुति-स्मृति भाष्य व प्रामाणिक समाधान
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={handleClearChat}
            disabled={isLoading || isSending}
            title="संपूर्ण वार्तालाप इतिहास साफ़ करें"
            className="flex items-center gap-1.5 px-2.5 py-1 text-[11px] font-medium text-rose-300 hover:text-white bg-rose-950/40 hover:bg-rose-900/60 rounded-xl border border-rose-500/30 hover:border-rose-400/50 transition-all active:scale-95 disabled:opacity-40"
          >
            <Trash2 className="w-3.5 h-3.5 text-rose-400" />
            <span className="hidden sm:inline">वार्तालाप साफ़ करें</span>
          </button>
        </div>

        {/* Persistent Crisis & Professional Care Disclaimer Banner (Part D.4) */}
        <div className="bg-[#1a140d]/90 border border-[#C58B4E]/30 px-3 py-2 rounded-xl mb-2.5 flex flex-wrap items-center justify-between gap-2 text-[11px] text-[#E0A96D]/90 shadow-inner shrink-0">
          <div className="flex items-center gap-1.5 flex-1 min-w-[200px]">
            <span className="text-amber-400 font-semibold text-xs shrink-0">{t.crisisNoticePrefix}</span>
            <span>{t.crisisDisclaimer}</span>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <a
              href="tel:18005990019"
              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-950/70 border border-emerald-500/50 text-emerald-300 font-medium hover:bg-emerald-900/90 transition-all active:scale-95 text-[10px]"
              title={t.kiranHelplineTitle}
            >
              {t.kiranHelplineLabel}
            </a>
            <a
              href="tel:14416"
              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-amber-950/70 border border-amber-500/50 text-amber-300 font-medium hover:bg-amber-900/90 transition-all active:scale-95 text-[10px]"
              title={t.teleManasTitle}
            >
              {t.teleManasLabel}
            </a>
          </div>
        </div>

        {/* Messages Feed */}
        <div
          ref={chatContainerRef}
          className="flex-1 overflow-y-auto pr-1 sm:pr-2 space-y-3 sm:space-y-4 mb-2 sm:mb-3"
        >
          {/* Pagination: Load Older Messages Trigger */}
          {hasMore && !isLoading && (
            <div className="flex justify-center py-1">
              <button
                type="button"
                onClick={loadOlderMessages}
                disabled={isLoadingOlder}
                className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs text-[#E0A96D] hover:text-[#FFF] bg-[#C58B4E]/15 hover:bg-[#C58B4E]/25 border border-[#C58B4E]/30 transition-all active:scale-95 disabled:opacity-50"
              >
                {isLoadingOlder ? (
                  <>
                    <Loader2 className="w-3 h-3 animate-spin text-[#E0A96D]" />
                    <span>पूर्व संदेश लोड हो रहे हैं...</span>
                  </>
                ) : (
                  <span>↑ पूर्व संदेश लोड करें (Load older)</span>
                )}
              </button>
            </div>
          )}

          {/* Initial Loading Skeleton */}
          {isLoading ? (
            <div className="space-y-4 p-2 animate-pulse">
              {/* Skeleton Model Message */}
              <div className="flex flex-col items-start space-y-2">
                <div className="max-w-[85%] sm:max-w-xl w-full rounded-2xl p-4 bg-black/40 border border-[#C58B4E]/20 space-y-2.5">
                  <div className="flex items-center gap-2 border-b border-[#C58B4E]/20 pb-2">
                    <div className="w-4 h-4 rounded-full bg-[#C58B4E]/30" />
                    <div className="h-3 w-20 bg-[#C58B4E]/30 rounded" />
                  </div>
                  <div className="h-3 bg-[#C58B4E]/20 rounded w-full" />
                  <div className="h-3 bg-[#C58B4E]/20 rounded w-4/5" />
                </div>
              </div>

              {/* Skeleton User Message */}
              <div className="flex flex-col items-end space-y-2">
                <div className="max-w-[70%] sm:max-w-md w-full rounded-2xl p-3 bg-gradient-to-r from-[#C58B4E]/20 to-[#8C4B19]/20 border border-[#C58B4E]/30 space-y-2">
                  <div className="h-3 bg-[#C58B4E]/30 rounded w-full" />
                  <div className="h-3 bg-[#C58B4E]/30 rounded w-2/3" />
                </div>
              </div>

              {/* Skeleton Model Message */}
              <div className="flex flex-col items-start space-y-2">
                <div className="max-w-[85%] sm:max-w-xl w-full rounded-2xl p-4 bg-black/40 border border-[#C58B4E]/20 space-y-2.5">
                  <div className="h-3 bg-[#C58B4E]/20 rounded w-11/12" />
                  <div className="h-3 bg-[#C58B4E]/20 rounded w-3/4" />
                </div>
              </div>
            </div>
          ) : (
            messages.map((msg, idx) => {
              const isUser = msg.sender === 'user';

              return (
                <div
                  key={msg.id || idx}
                  className={`flex flex-col ${isUser ? 'items-end' : 'items-start'} space-y-1`}
                >
                  <div
                    className={`max-w-[92%] sm:max-w-2xl lg:max-w-3xl rounded-2xl p-3 sm:p-4 text-xs sm:text-sm leading-relaxed ${
                      isUser
                        ? 'bg-gradient-to-r from-[#C58B4E]/30 to-[#8C4B19]/40 text-[#F7E7D6] border border-[#C58B4E]/40 rounded-br-none'
                        : msg.isError
                        ? 'bg-amber-950/40 backdrop-blur-sm text-amber-200 border border-amber-500/50 rounded-bl-none shadow-xl'
                        : msg.isCrisis
                        ? 'bg-rose-950/40 backdrop-blur-sm text-rose-100 border border-rose-500/50 rounded-bl-none shadow-xl ring-1 ring-rose-500/30'
                        : 'bg-black/40 backdrop-blur-sm text-[#F7E7D6] border border-[#C58B4E]/25 rounded-bl-none shadow-xl'
                    }`}
                  >
                    {!isUser && (
                      <div className="flex items-center justify-between gap-2 mb-1.5 pb-1 border-b border-[#C58B4E]/20">
                        <span className="font-dharmik font-bold text-[#F3CA9D] text-xs sm:text-sm flex items-center gap-1.5">
                          {msg.isError ? (
                            <span className="text-amber-400 font-sans font-medium text-xs flex items-center gap-1">
                              {t.connNotice}
                            </span>
                          ) : (
                            <>
                              <img 
                                src={guruAvatar} 
                                alt="आचार्य जी" 
                                width="20" 
                                height="20" 
                                loading="lazy" 
                                onError={handleImageError(OM_FALLBACK_SVG)}
                                className="w-5 h-5 rounded-full object-cover border border-[#C58B4E]/50 shadow shrink-0" 
                              />
                              <span>आचार्य जी</span>
                              {msg.isCrisis && (
                                <span className="ml-2 px-2 py-0.5 rounded text-[10px] bg-rose-500/20 text-rose-300 border border-rose-500/40">
                                  {t.safetySupportBadge}
                                </span>
                              )}
                            </>
                          )}
                        </span>

                        <button
                          type="button"
                          onClick={() => handleCopy(msg.id, msg.text)}
                          title="उत्तर प्रतिलिपि बनाएं"
                          className="p-1 text-[#D4A373] hover:text-[#FFF] rounded active:scale-95"
                        >
                          {copiedId === msg.id ? (
                            <Check className="w-3.5 h-3.5 text-emerald-400" />
                          ) : (
                            <Copy className="w-3.5 h-3.5" />
                          )}
                        </button>
                      </div>
                    )}

                    {isUser || msg.id === 'default-greeting' || msg.isError ? (
                      <div className="whitespace-pre-line text-[#F7E7D6] leading-[1.75] font-sans font-normal text-xs sm:text-sm break-words">
                        {msg.text}
                      </div>
                    ) : (
                      <React.Suspense fallback={
                        <div className="whitespace-pre-line text-[#F7E7D6] leading-[1.75] font-sans font-normal text-xs sm:text-sm break-words">
                          {msg.text}
                        </div>
                      }>
                        <AcharyaMarkdown content={msg.text} />
                      </React.Suspense>
                    )}

                    {/* Quick Helpline Tap-to-Call Buttons for Crisis Flagged Responses */}
                    {msg.isCrisis && (
                      <div className="mt-3 pt-2.5 border-t border-rose-500/30 flex flex-wrap items-center gap-2">
                        <span className="text-[11px] font-semibold text-rose-300">{t.immediateHelpLabel}</span>
                        <a
                          href="tel:18005990019"
                          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-medium text-[11px] shadow transition-all active:scale-95"
                        >
                          {t.kiranCallBtn}
                        </a>
                        <a
                          href="tel:14416"
                          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-sky-700 hover:bg-sky-600 text-white font-medium text-[11px] shadow transition-all active:scale-95"
                        >
                          {t.teleManasCallBtn}
                        </a>
                        <a
                          href="tel:112"
                          className="inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-rose-700 hover:bg-rose-600 text-white font-medium text-[11px] shadow transition-all active:scale-95"
                        >
                          🚨 112
                        </a>
                      </div>
                    )}
                  </div>
                </div>
              );
            })
          )}

          {/* Realtime AI Generating Indicator */}
          {isSending && (
            <div className="flex items-center gap-2.5 p-3 rounded-2xl bg-black/40 backdrop-blur-sm border border-[#C58B4E]/30 max-w-[240px] animate-fade-in">
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
              type="button"
              onClick={() => handleSend(prompt)}
              disabled={isSending || isLoading}
              className="px-2.5 py-1.5 rounded-xl text-[10px] sm:text-[11px] whitespace-nowrap bg-black/40 backdrop-blur-sm hover:bg-[#C58B4E]/20 text-[#D4A373] hover:text-[#F3CA9D] border border-[#C58B4E]/20 hover:border-[#C58B4E]/50 transition-all font-medium shrink-0 active:scale-95 disabled:opacity-40"
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
            onChange={(e) => setInputQuery(e.target.value)}
            onFocus={() => {
              setTimeout(() => {
                chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
              }, 300);
            }}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            disabled={isSending || isLoading}
            className="flex-1 bg-black/50 backdrop-blur-sm border border-[#C58B4E]/30 text-[#F7E7D6] text-xs sm:text-sm px-3.5 sm:px-4 py-2.5 sm:py-3 rounded-xl outline-none focus:border-[#E0A96D] font-sans disabled:opacity-50"
          />
          <button
            type="button"
            onClick={() => handleSend()}
            disabled={isSending || isLoading || !inputQuery.trim()}
            aria-label="संदेश भेजें (Send Message)"
            title="संदेश भेजें (Send Message)"
            className="btn-gold py-2.5 sm:py-3 px-4 sm:px-5 disabled:opacity-40 shrink-0 cursor-pointer"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
