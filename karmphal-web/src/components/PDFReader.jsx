import React, { useState, useEffect } from 'react';
import { X, Loader, WifiOff, Download } from 'lucide-react';
import { libraryService } from '../services/libraryService';

export default function PDFReader({ book, onClose }) {
  const [pdfUrl, setPdfUrl] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
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

  useEffect(() => {
    async function loadPdf() {
      try {
        setLoading(true);
        // First check if we have it downloaded
        const isDownloaded = await libraryService.isBookDownloaded(book.id);
        
        if (isDownloaded) {
          const localUrl = await libraryService.getLocalBookUrl(book.id);
          setPdfUrl(localUrl);
        } else {
          if (isOffline) {
            setError('यह पुस्तक डाउनलोड नहीं की गई है और आप अभी ऑफ़लाइन हैं।');
            return;
          }
          // Fetch remote URL
          const remoteUrl = await libraryService.getPdfUrl(book.id);
          if (remoteUrl) {
            setPdfUrl(remoteUrl);
          } else {
            setError('इस पुस्तक का PDF उपलब्ध नहीं है।');
          }
        }
      } catch (err) {
        setError('PDF लोड करने में त्रुटि आई।');
        console.error(err);
      } finally {
        setLoading(false);
      }
    }

    if (book) {
      loadPdf();
    }
  }, [book, isOffline]);

  if (!book) return null;

  return (
    <div className="fixed inset-0 z-[100] bg-black/95 backdrop-blur-xl flex flex-col animate-fade-in">
      {/* Header */}
      <div className="h-16 border-b border-[#C58B4E]/30 bg-black/50 flex items-center justify-between px-4 sm:px-6 shrink-0">
        <div className="flex flex-col">
          <h2 className="text-[#F3CA9D] font-dharmik font-bold text-lg line-clamp-1">{book.title}</h2>
          <span className="text-xs text-[#A67C52]">
            {isOffline ? 'ऑफ़लाइन मोड (स्थानीय फ़ाइल)' : 'ई-पुस्तकालय मोड'}
          </span>
        </div>
        
        <button 
          onClick={onClose}
          className="p-2 rounded-full bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Content Area */}
      <div className="flex-1 relative w-full h-full flex items-center justify-center">
        {loading && (
          <div className="absolute inset-0 flex flex-col items-center justify-center text-[#E0A96D] space-y-4">
            <Loader className="w-8 h-8 animate-spin" />
            <p className="font-dharmik animate-pulse">पवित्र ग्रन्थ लोड हो रहा है...</p>
          </div>
        )}

        {error && (
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-6 space-y-4">
            <div className="w-16 h-16 rounded-full bg-red-500/10 flex items-center justify-center text-red-400">
              <WifiOff className="w-8 h-8" />
            </div>
            <p className="text-[#F7E7D6] font-sans">{error}</p>
          </div>
        )}

        {pdfUrl && !error && (
          <iframe
            src={pdfUrl}
            title={book.title}
            className="w-full h-full border-none"
            onLoad={() => setLoading(false)}
            style={{ backgroundColor: '#1e1e1e' }}
          />
        )}
      </div>
    </div>
  );
}
