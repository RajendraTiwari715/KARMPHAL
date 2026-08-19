import React, { useState } from 'react';
import { SACRED_BOOKS } from '../services/scripturesData';
import { BookOpen, Sparkles, ArrowLeft, Search, Copy, Check, ChevronRight } from 'lucide-react';

export default function GyanSection() {
  const [selectedBook, setSelectedBook] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [copiedIndex, setCopiedIndex] = useState(null);

  const categories = [
    { id: 'all', label: 'समस्त ग्रन्थ' },
    { id: 'श्रुति / वेद संहिता', label: 'वेद संहिता' },
    { id: 'श्रुति / प्रधान उपनिषद्', label: 'उपनिषद्' },
    { id: 'स्मृति / इतिहास', label: 'गीता व रामायण' },
    { id: 'स्मृति / १८ महापुराण', label: 'महापुराण' },
    { id: 'षड् दर्शन / योग दर्शन', label: 'योग दर्शन' }
  ];

  const filteredBooks = SACRED_BOOKS.filter(b => {
    const matchesCategory = selectedCategory === 'all' || b.category.includes(selectedCategory) || b.category === selectedCategory;
    const matchesSearch = !searchQuery || 
      b.title.includes(searchQuery) ||
      b.subtitle.includes(searchQuery) ||
      b.summary.includes(searchQuery);
    return matchesCategory && matchesSearch;
  });

  const handleOpenBook = (book) => {
    setSelectedBook(book);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleCopyShloka = (index, text) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  // If a book is selected, show the Virtual Reading Room
  if (selectedBook) {
    return (
      <div className="space-y-6 animate-fade-in pb-12">
        {/* Back Navigation Bar */}
        <div className="flex items-center justify-between">
          <button
            onClick={() => setSelectedBook(null)}
            className="flex items-center gap-2 px-4 py-2 rounded-2xl bg-[#1C1008] border border-[#C58B4E]/30 text-[#F3CA9D] hover:bg-[#2A180E] transition-all text-xs font-bold"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>ग्रन्थागार में वापस जाएं</span>
          </button>

          <span className="badge-gold font-bold text-xs">{selectedBook.category}</span>
        </div>

        {/* Book Header Card */}
        <div className="glass-card-gold p-6 sm:p-8 relative overflow-hidden">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-3xl bg-gradient-to-br from-[#E0A96D] via-[#C58B4E] to-[#6A3B18] flex items-center justify-center text-3xl sm:text-4xl shadow-xl shadow-[#C58B4E]/30 border border-[#F3CA9D]/50 shrink-0">
                {selectedBook.icon}
              </div>
              <div>
                <h1 className="text-2xl sm:text-3xl font-dharmik font-bold text-[#F3CA9D]">
                  {selectedBook.title}
                </h1>
                <p className="text-xs sm:text-sm text-[#D4A373] mt-1 font-sans">
                  {selectedBook.subtitle}
                </p>
                <div className="flex flex-wrap items-center gap-3 mt-2 text-[11px] text-[#C58B4E] font-medium">
                  <span>रचयिता: <strong className="text-[#F7E7D6]">{selectedBook.author}</strong></span>
                  <span>•</span>
                  <span>विस्तार: <strong className="text-[#F7E7D6]">{selectedBook.totalAdhyayas}</strong></span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Virtual Story / Essence */}
        <div className="glass-card p-6 sm:p-8 space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-[#C58B4E]/20">
            <BookOpen className="w-5 h-5 text-[#E0A96D]" />
            <h2 className="font-dharmik text-lg font-bold text-[#F3CA9D]">
              सम्पूर्ण कथा, रहस्य एवं ग्रन्थ सार
            </h2>
          </div>

          <div className="text-[#F7E7D6] text-sm sm:text-base leading-relaxed whitespace-pre-line font-sans">
            {selectedBook.story}
          </div>
        </div>

        {/* Key Shlokas & Mantras */}
        {selectedBook.keyVerses && selectedBook.keyVerses.length > 0 && (
          <div className="space-y-4">
            <h3 className="font-dharmik text-base font-bold text-[#F3CA9D] flex items-center gap-2 px-1">
              <Sparkles className="w-4 h-4 text-[#E0A96D]" />
              <span>प्रमुख सिद्ध मन्त्र एवं श्लोक</span>
            </h3>

            <div className="grid grid-cols-1 gap-4">
              {selectedBook.keyVerses.map((verse, idx) => (
                <div key={idx} className="glass-card p-5 sm:p-6 border-l-4 border-[#E0A96D] space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="badge-gold text-[10px]">श्लोक #{idx + 1}</span>
                    <button
                      onClick={() => handleCopyShloka(idx, `${verse.shloka}\n\n[अर्थ]: ${verse.meaning}`)}
                      className="p-1.5 text-[#D4A373] hover:text-[#FFF] rounded-lg bg-[#120A05] border border-[#C58B4E]/30"
                      title="श्लोक प्रतिलिपि बनाएं"
                    >
                      {copiedIndex === idx ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                  </div>

                  <div className="p-4 rounded-2xl bg-[#140B06] border border-[#C58B4E]/30 text-center">
                    <pre className="font-sanskrit text-base sm:text-lg text-[#F7E7D6] whitespace-pre-line leading-relaxed">
                      {verse.shloka}
                    </pre>
                  </div>

                  <div className="text-xs sm:text-sm text-[#E6D0BA] leading-relaxed font-sans">
                    <strong className="text-[#E0A96D] block mb-0.5">हिन्दी भावार्थ:</strong>
                    {verse.meaning}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Life Lessons */}
        {selectedBook.lessons && (
          <div className="glass-card p-6 border-t-4 border-emerald-500 space-y-3">
            <h3 className="font-dharmik text-base font-bold text-emerald-300 flex items-center gap-2">
              <span>🌟 जीवन जीने की प्रेरणा एवं मुख्य उपदेश</span>
            </h3>
            <div className="space-y-2">
              {selectedBook.lessons.map((lesson, lIdx) => (
                <div key={lIdx} className="flex items-start gap-2.5 text-xs sm:text-sm text-slate-200">
                  <span className="text-[#E0A96D] font-bold">•</span>
                  <span>{lesson}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  }

  // Books Gallery View
  return (
    <div className="space-y-6 animate-fade-in pb-12">
      {/* Search & Filter Bar */}
      <div className="glass-card p-4 sm:p-5 space-y-3.5">
        <div className="relative">
          <Search className="w-4 h-4 text-[#A67C52] absolute left-3.5 top-3.5" />
          <input
            type="text"
            placeholder="गीता, रामायण, उपनिषद्, पुराण अथवा कोई भी ग्रन्थ खोजें..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full bg-[#140B06] border border-[#C58B4E]/30 text-[#F7E7D6] text-xs sm:text-sm pl-10 pr-4 py-3 rounded-2xl outline-none focus:border-[#E0A96D] font-sans"
          />
        </div>

        {/* Category Pills */}
        <div className="flex gap-1.5 overflow-x-auto pb-1 no-scrollbar">
          {categories.map(cat => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-3 py-1.5 rounded-xl text-xs whitespace-nowrap transition-all font-semibold ${
                selectedCategory === cat.id
                  ? 'bg-gradient-to-r from-[#E0A96D] to-[#C58B4E] text-[#120A05] font-bold shadow-md'
                  : 'bg-[#1C1008] text-[#D4A373] hover:text-[#FFF] border border-[#C58B4E]/25'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* Books Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
        {filteredBooks.map(book => (
          <div
            key={book.id}
            onClick={() => handleOpenBook(book)}
            className="glass-card p-5 sm:p-6 flex flex-col justify-between cursor-pointer group hover:border-[#E0A96D] hover:scale-[1.02] transition-all relative overflow-hidden"
          >
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="badge-gold text-[10px]">{book.category}</span>
                <span className="text-2xl group-hover:scale-110 transition-transform">{book.icon}</span>
              </div>

              <h3 className="font-dharmik text-lg sm:text-xl font-bold text-[#F3CA9D] group-hover:text-[#FFF] transition-colors">
                {book.title}
              </h3>
              <p className="text-xs text-[#C58B4E] font-medium mt-0.5">
                {book.subtitle}
              </p>

              <p className="text-xs text-[#D4A373] mt-3 line-clamp-3 leading-relaxed font-sans">
                {book.summary}
              </p>
            </div>

            <div className="mt-4 pt-3 border-t border-white/5 flex items-center justify-between text-xs">
              <span className="text-[#A67C52] text-[11px]">{book.totalAdhyayas}</span>
              <span className="text-[#E0A96D] font-bold flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                <span>ग्रन्थ पढ़ें</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
