import React, { useState, useEffect } from 'react';
import { SACRED_BOOKS } from '../services/scripturesData';
import { BookOpen, Sparkles, ArrowLeft, Search, Copy, Check, ChevronRight, Download, Library, Globe, CloudOff, Loader } from 'lucide-react';
import { libraryService } from '../services/libraryService';
import PDFReader from '../components/PDFReader';

export default function GyanSection() {
  // Modes: 'curated' | 'elibrary'
  const [viewMode, setViewMode] = useState('curated');

  // Curated State
  const [selectedBook, setSelectedBook] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [copiedIndex, setCopiedIndex] = useState(null);

  // E-Library State
  const [elibraryQuery, setElibraryQuery] = useState('');
  const [elibraryBooks, setElibraryBooks] = useState([]);
  const [isSearchingLib, setIsSearchingLib] = useState(false);
  const [downloadingBooks, setDownloadingBooks] = useState({});
  const [downloadedBooks, setDownloadedBooks] = useState({});
  const [readingBook, setReadingBook] = useState(null);
  const [isOffline, setIsOffline] = useState(!navigator.onLine);

  useEffect(() => {
    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => setIsOffline(true);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Fetch initial e-library books
  useEffect(() => {
    if (viewMode === 'elibrary' && elibraryBooks.length === 0) {
      searchELibrary(elibraryQuery);
    }
  }, [viewMode]);

  const checkDownloadedStatus = async (books) => {
    const statusObj = {};
    for (const b of books) {
      statusObj[b.id] = await libraryService.isBookDownloaded(b.id);
    }
    setDownloadedBooks(prev => ({ ...prev, ...statusObj }));
  };

  const searchELibrary = async (query) => {
    setIsSearchingLib(true);
    try {
      const results = await libraryService.searchBooks(query);
      setElibraryBooks(results);
      await checkDownloadedStatus(results);
    } catch (err) {
      console.error(err);
    } finally {
      setIsSearchingLib(false);
    }
  };

  const handleDownload = async (book) => {
    setDownloadingBooks(prev => ({ ...prev, [book.id]: true }));
    try {
      await libraryService.downloadAndCacheBook(book.id);
      setDownloadedBooks(prev => ({ ...prev, [book.id]: true }));
    } catch (err) {
      alert('डाउनलोड विफल रहा। कृपया बाद में पुनः प्रयास करें।');
    } finally {
      setDownloadingBooks(prev => ({ ...prev, [book.id]: false }));
    }
  };

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

  // Render Curated Book Detail View
  if (selectedBook) {
    return (
      <div className="space-y-6 animate-fade-in pb-12">
        {/* Back Navigation Bar */}
        <div className="flex items-center justify-between">
          <button
            onClick={() => setSelectedBook(null)}
            className="flex items-center gap-2 px-4 py-2 rounded-2xl bg-black/40 backdrop-blur-sm border border-[#C58B4E]/30 text-[#F3CA9D] hover:bg-white/15 backdrop-blur-sm transition-all text-xs font-bold"
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
                      className="p-1.5 text-[#D4A373] hover:text-[#FFF] rounded-lg bg-black/60 backdrop-blur-sm border border-[#C58B4E]/30"
                      title="श्लोक प्रतिलिपि बनाएं"
                    >
                      {copiedIndex === idx ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                  <div className="p-4 rounded-2xl bg-black/50 backdrop-blur-sm border border-[#C58B4E]/30 text-center">
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
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in pb-12">
      {/* View Mode Toggle */}
      <div className="flex bg-black/40 backdrop-blur-md p-1 rounded-2xl border border-[#C58B4E]/20 max-w-md mx-auto">
        <button
          onClick={() => setViewMode('curated')}
          className={`flex-1 py-2.5 px-4 rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center gap-2 transition-all ${
            viewMode === 'curated' 
              ? 'bg-gradient-to-r from-[#E0A96D] to-[#C58B4E] text-[#120A05] shadow-md'
              : 'text-[#D4A373] hover:text-white hover:bg-white/5'
          }`}
        >
          <BookOpen className="w-4 h-4" />
          <span>ग्रन्थ सार</span>
        </button>
        <button
          onClick={() => setViewMode('elibrary')}
          className={`flex-1 py-2.5 px-4 rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center gap-2 transition-all ${
            viewMode === 'elibrary' 
              ? 'bg-gradient-to-r from-[#E0A96D] to-[#C58B4E] text-[#120A05] shadow-md'
              : 'text-[#D4A373] hover:text-white hover:bg-white/5'
          }`}
        >
          <Globe className="w-4 h-4" />
          <span>ई-पुस्तकालय (PDF)</span>
        </button>
      </div>

      {viewMode === 'curated' ? (
        <>
          {/* Curated Search & Filter Bar */}
          <div className="glass-card p-4 sm:p-5 space-y-3.5">
            <div className="relative">
              <Search className="w-4 h-4 text-[#A67C52] absolute left-3.5 top-3.5" />
              <input
                type="text"
                placeholder="गीता, रामायण, उपनिषद्, पुराण अथवा कोई भी ग्रन्थ खोजें..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full bg-black/50 backdrop-blur-sm border border-[#C58B4E]/30 text-[#F7E7D6] text-xs sm:text-sm pl-10 pr-4 py-3 rounded-2xl outline-none focus:border-[#E0A96D] font-sans"
              />
            </div>

            <div className="flex gap-1.5 overflow-x-auto pb-1 no-scrollbar">
              {categories.map(cat => (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`px-3 py-1.5 rounded-xl text-xs whitespace-nowrap transition-all font-semibold ${
                    selectedCategory === cat.id
                      ? 'bg-gradient-to-r from-[#E0A96D] to-[#C58B4E] text-[#120A05] shadow-md'
                      : 'bg-black/40 backdrop-blur-sm text-[#D4A373] hover:text-[#FFF] border border-[#C58B4E]/25'
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>
          </div>

          {/* Curated Books Cards */}
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
                    <span>ग्रन्थ सार पढ़ें</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </span>
                </div>
              </div>
            ))}
          </div>
        </>
      ) : (
        <>
          {/* E-Library Search */}
          <div className="glass-card p-4 sm:p-5 space-y-3.5">
            <div className="flex items-center justify-between mb-2">
              <h2 className="font-dharmik text-[#F3CA9D] font-bold flex items-center gap-2">
                <Library className="w-4 h-4 text-[#E0A96D]" />
                <span>डिजिटल ई-पुस्तकालय (Internet Archive)</span>
              </h2>
              {isOffline && (
                <span className="text-red-400 text-[10px] flex items-center gap-1 bg-red-500/10 px-2 py-1 rounded-full border border-red-500/20">
                  <CloudOff className="w-3 h-3" /> ऑफ़लाइन मोड
                </span>
              )}
            </div>
            <div className="relative flex gap-2">
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-[#A67C52] absolute left-3.5 top-3.5" />
                <input
                  type="text"
                  placeholder="वेद, पुराण, उपनिषद् खोजें..."
                  value={elibraryQuery}
                  onChange={e => setElibraryQuery(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && searchELibrary(elibraryQuery)}
                  className="w-full bg-black/50 backdrop-blur-sm border border-[#C58B4E]/30 text-[#F7E7D6] text-xs sm:text-sm pl-10 pr-4 py-3 rounded-2xl outline-none focus:border-[#E0A96D] font-sans"
                />
              </div>
              <button 
                onClick={() => searchELibrary(elibraryQuery)}
                disabled={isSearchingLib || isOffline}
                className="bg-gradient-to-r from-[#E0A96D] to-[#C58B4E] text-[#120A05] px-4 py-2 rounded-2xl font-bold text-sm disabled:opacity-50"
              >
                खोजें
              </button>
            </div>
          </div>

          {/* E-Library Results */}
          {isSearchingLib ? (
            <div className="flex flex-col items-center justify-center py-12 text-[#E0A96D] space-y-3">
              <Loader className="w-8 h-8 animate-spin" />
              <p className="text-sm font-dharmik">ग्रन्थ खोजे जा रहे हैं...</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
              {elibraryBooks.map(book => {
                const isCached = downloadedBooks[book.id];
                const isDownloading = downloadingBooks[book.id];

                return (
                  <div key={book.id} className="glass-card p-4 sm:p-5 flex flex-col gap-4 relative overflow-hidden group">
                    <div className="flex gap-4">
                      {/* 3D Digital Book Cover */}
                      <div className="w-24 h-32 shrink-0 book-wrapper ml-1 mr-3 mb-2">
                        <div className="w-full h-full book-volume border border-[#C58B4E]/40">
                          <img 
                            src={book.coverUrl} 
                            alt="Cover" 
                            className="w-full h-full object-cover rounded-[2px_5px_5px_2px] opacity-95 group-hover:opacity-100 transition-opacity relative z-0"
                            onError={(e) => { e.target.style.display = 'none'; }}
                          />
                        </div>
                      </div>
                      <div className="flex-1 flex flex-col">
                        <h3 className="font-dharmik text-sm sm:text-base font-bold text-[#F3CA9D] line-clamp-2 leading-snug">
                          {book.title}
                        </h3>
                        <p className="text-[11px] text-[#C58B4E] mt-1 line-clamp-1">{book.author}</p>
                        <p className="text-[10px] text-[#A67C52] mt-0.5">वर्ष: {book.year} | पृष्ठ: {book.pages}</p>
                        
                        <div className="mt-auto flex items-center justify-between pt-2">
                          <span className="text-[10px] text-[#A67C52] bg-black/40 px-2 py-0.5 rounded-full border border-[#C58B4E]/20">
                            {book.downloads.toLocaleString()} पाठकों ने पढ़ा
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2">
                      <button 
                        onClick={() => setReadingBook(book)}
                        disabled={isOffline && !isCached}
                        className="flex-1 bg-black/60 hover:bg-[#E0A96D]/10 text-[#F3CA9D] border border-[#C58B4E]/40 py-2 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-colors disabled:opacity-30"
                      >
                        <BookOpen className="w-3.5 h-3.5" /> पढ़ें
                      </button>
                      
                      <button 
                        onClick={() => handleDownload(book)}
                        disabled={isCached || isDownloading || isOffline}
                        className={`flex-1 py-2 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-colors border ${
                          isCached 
                            ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30' 
                            : 'bg-black/60 hover:bg-[#C58B4E]/10 text-[#C58B4E] border-[#C58B4E]/40'
                        } disabled:opacity-80`}
                      >
                        {isDownloading ? (
                          <><Loader className="w-3.5 h-3.5 animate-spin" /> ...</>
                        ) : isCached ? (
                          <><Check className="w-3.5 h-3.5" /> सहेजा गया</>
                        ) : (
                          <><Download className="w-3.5 h-3.5" /> सहेजें</>
                        )}
                      </button>
                    </div>
                  </div>
                );
              })}
              
              {elibraryBooks.length === 0 && !isSearchingLib && (
                <div className="col-span-full py-10 text-center text-[#A67C52] text-sm">
                  कोई परिणाम नहीं मिला। कृपया दूसरा कीवर्ड आज़माएं।
                </div>
              )}
            </div>
          )}
        </>
      )}

      {/* PDF Reader Modal */}
      {readingBook && (
        <PDFReader book={readingBook} onClose={() => setReadingBook(null)} />
      )}
    </div>
  );
}
