import React, { useState, useEffect, useRef } from 'react';
import { 
  X, 
  Loader, 
  WifiOff, 
  ChevronLeft, 
  ChevronRight, 
  ZoomIn, 
  ZoomOut, 
  RotateCcw,
  BookOpen
} from 'lucide-react';
import * as pdfjsLib from 'pdfjs-dist';
import pdfjsWorker from 'pdfjs-dist/build/pdf.worker.min.mjs?url';
import { libraryService } from '../services/libraryService';

// Configure local bundled worker (strictly local asset, NOT from external CDN)
if (!pdfjsLib.GlobalWorkerOptions.workerSrc) {
  pdfjsLib.GlobalWorkerOptions.workerSrc = pdfjsWorker;
}

export default function PDFReader({ book, onClose }) {
  const [loading, setLoading] = useState(true);
  const [renderingPage, setRenderingPage] = useState(false);
  const [error, setError] = useState(null);
  const [isOffline, setIsOffline] = useState(!navigator.onLine);

  // PDF Document & Pagination State
  const [pdfDoc, setPdfDoc] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [numPages, setNumPages] = useState(0);
  const [scale, setScale] = useState(1.2);
  const [jumpPageInput, setJumpPageInput] = useState('1');

  // References for memory management & render cancellation
  const canvasRef = useRef(null);
  const renderTaskRef = useRef(null);
  const loadedPdfDocRef = useRef(null);
  const currentLocalUrlRef = useRef(null);

  // Network offline detection
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

  // Revoke object URL & destroy PDF document when unmounting or switching books
  useEffect(() => {
    return () => {
      // 1. Cancel active page render task
      if (renderTaskRef.current) {
        try {
          renderTaskRef.current.cancel();
        } catch {}
        renderTaskRef.current = null;
      }
      // 2. Destroy loaded PDF document to free PDF.js memory
      if (loadedPdfDocRef.current) {
        try {
          loadedPdfDocRef.current.destroy();
        } catch {}
        loadedPdfDocRef.current = null;
      }
      // 3. Revoke active local object URL if created
      if (currentLocalUrlRef.current) {
        try {
          URL.revokeObjectURL(currentLocalUrlRef.current);
        } catch {}
        currentLocalUrlRef.current = null;
      }
      // 4. Revoke cached blob URL inside libraryService
      if (book?.id) {
        libraryService.revokeBookUrl(book.id);
      }
    };
  }, [book]);

  // Load PDF Document via pdf.js
  useEffect(() => {
    let isCancelled = false;

    async function loadPdfDocument() {
      if (!book) return;

      try {
        setLoading(true);
        setError(null);

        // Clean up any previously loaded document
        if (loadedPdfDocRef.current) {
          try {
            await loadedPdfDocRef.current.destroy();
          } catch {}
          loadedPdfDocRef.current = null;
        }

        // Clean up previous local URL if any
        if (currentLocalUrlRef.current) {
          try {
            URL.revokeObjectURL(currentLocalUrlRef.current);
          } catch {}
          currentLocalUrlRef.current = null;
        }

        let pdfSourceUrl = null;
        const isDownloaded = await libraryService.isBookDownloaded(book.id);

        if (isDownloaded) {
          pdfSourceUrl = await libraryService.getLocalBookUrl(book.id);
          currentLocalUrlRef.current = pdfSourceUrl;
        } else {
          if (isOffline) {
            setError('यह पवित्र ग्रन्थ डाउनलोड नहीं किया गया है और आप अभी ऑफ़लाइन हैं।');
            setLoading(false);
            return;
          }
          pdfSourceUrl = await libraryService.getPdfUrl(book.id);
        }

        if (!pdfSourceUrl) {
          setError('इस ग्रन्थ का PDF उपलब्ध नहीं हो सका।');
          setLoading(false);
          return;
        }

        if (isCancelled) return;

        // Load document through pdf.js using standard Uint8Array or URL
        const loadingTask = pdfjsLib.getDocument({
          url: pdfSourceUrl,
          cMapUrl: 'https://cdn.jsdelivr.net/npm/pdfjs-dist@4.10.38/cmaps/', // standard fallback for glyphs if needed
          cMapPacked: true
        });

        const doc = await loadingTask.promise;
        if (isCancelled) {
          doc.destroy().catch(() => {});
          return;
        }

        loadedPdfDocRef.current = doc;
        setPdfDoc(doc);
        setNumPages(doc.numPages);
        setCurrentPage(1);
        setJumpPageInput('1');
      } catch (err) {
        console.error('[PDFReader] Document loading failed:', err);
        if (!isCancelled) {
          setError('ग्रन्थ लोड करने में त्रुटि आई। कृपया पुनः प्रयास करें।');
        }
      } finally {
        if (!isCancelled) {
          setLoading(false);
        }
      }
    }

    loadPdfDocument();

    return () => {
      isCancelled = true;
    };
  }, [book, isOffline]);

  // Lazy Page Rendering on Canvas with cancellation
  useEffect(() => {
    if (!pdfDoc || !canvasRef.current || currentPage < 1 || currentPage > numPages) {
      return;
    }

    let isCancelled = false;

    // Cancel any previous running render task
    if (renderTaskRef.current) {
      try {
        renderTaskRef.current.cancel();
      } catch {}
      renderTaskRef.current = null;
    }

    setRenderingPage(true);

    pdfDoc.getPage(currentPage).then((page) => {
      if (isCancelled || !canvasRef.current) return;

      const canvas = canvasRef.current;
      const context = canvas.getContext('2d');
      const viewport = page.getViewport({ scale });

      // High-DPI support for ultra-sharp Devanagari Sanskrit/Hindi text
      const pixelRatio = window.devicePixelRatio || 1;
      canvas.width = Math.floor(viewport.width * pixelRatio);
      canvas.height = Math.floor(viewport.height * pixelRatio);
      canvas.style.width = `${Math.floor(viewport.width)}px`;
      canvas.style.height = `${Math.floor(viewport.height)}px`;

      const transform = pixelRatio !== 1 ? [pixelRatio, 0, 0, pixelRatio, 0, 0] : null;

      const renderContext = {
        canvasContext: context,
        transform,
        viewport
      };

      const renderTask = page.render(renderContext);
      renderTaskRef.current = renderTask;

      renderTask.promise
        .then(() => {
          if (!isCancelled) {
            setRenderingPage(false);
          }
        })
        .catch((err) => {
          if (err?.name !== 'RenderingCancelledException') {
            console.error('[PDFReader] Page render error:', err);
          }
          if (!isCancelled) {
            setRenderingPage(false);
          }
        });
    }).catch((err) => {
      console.error('[PDFReader] getPage error:', err);
      if (!isCancelled) {
        setRenderingPage(false);
      }
    });

    return () => {
      isCancelled = true;
      if (renderTaskRef.current) {
        try {
          renderTaskRef.current.cancel();
        } catch {}
        renderTaskRef.current = null;
      }
    };
  }, [pdfDoc, currentPage, scale, numPages]);

  // Page Navigation Handlers
  const handlePrevPage = () => {
    if (currentPage > 1) {
      const prev = currentPage - 1;
      setCurrentPage(prev);
      setJumpPageInput(String(prev));
    }
  };

  const handleNextPage = () => {
    if (currentPage < numPages) {
      const next = currentPage + 1;
      setCurrentPage(next);
      setJumpPageInput(String(next));
    }
  };

  const handleJumpSubmit = (e) => {
    e?.preventDefault();
    const p = parseInt(jumpPageInput, 10);
    if (!isNaN(p) && p >= 1 && p <= numPages) {
      setCurrentPage(p);
    } else {
      setJumpPageInput(String(currentPage));
    }
  };

  // Zoom Handlers
  const handleZoomIn = () => {
    setScale(prev => Math.min(3.0, Number((prev + 0.25).toFixed(2))));
  };

  const handleZoomOut = () => {
    setScale(prev => Math.max(0.6, Number((prev - 0.25).toFixed(2))));
  };

  const handleZoomReset = () => {
    setScale(1.2);
  };

  if (!book) return null;

  return (
    <div className="fixed inset-0 z-[100] bg-black/95 backdrop-blur-2xl flex flex-col animate-fade-in select-none">
      {/* Top Header Bar */}
      <div className="h-16 border-b border-[#C58B4E]/30 bg-black/70 flex items-center justify-between px-3 sm:px-6 shrink-0 shadow-lg">
        <div className="flex items-center gap-3 overflow-hidden">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#E0A96D] to-[#8C5E34] flex items-center justify-center text-slate-950 font-bold shrink-0 shadow-md">
            <BookOpen className="w-5 h-5 text-slate-950" />
          </div>
          <div className="flex flex-col min-w-0">
            <h2 className="text-[#F3CA9D] font-dharmik font-bold text-sm sm:text-base truncate">
              {book.title}
            </h2>
            <span className="text-[10px] sm:text-xs text-[#A67C52] truncate">
              {isOffline ? 'ऑफ़लाइन मोड (स्थानीय संचित ग्रन्थ)' : 'ई-पुस्तकालय मोड (Internet Archive)'}
            </span>
          </div>
        </div>

        {/* Action Controls & Close */}
        <div className="flex items-center gap-2">
          {/* Zoom Controls (Desktop / Tablet) */}
          <div className="hidden sm:flex items-center gap-1 bg-black/40 border border-[#C58B4E]/30 rounded-xl p-1">
            <button
              onClick={handleZoomOut}
              disabled={scale <= 0.6 || loading}
              title="ज़ूम कम करें (Zoom Out)"
              className="p-1.5 text-[#D4A373] hover:text-[#FFF] disabled:opacity-40 transition-colors cursor-pointer"
            >
              <ZoomOut className="w-4 h-4" />
            </button>
            <span className="text-[11px] font-mono font-bold text-[#F3CA9D] px-1.5 min-w-[42px] text-center">
              {Math.round(scale * 100)}%
            </span>
            <button
              onClick={handleZoomIn}
              disabled={scale >= 3.0 || loading}
              title="ज़ूम बढ़ाएं (Zoom In)"
              className="p-1.5 text-[#D4A373] hover:text-[#FFF] disabled:opacity-40 transition-colors cursor-pointer"
            >
              <ZoomIn className="w-4 h-4" />
            </button>
            <button
              onClick={handleZoomReset}
              disabled={loading}
              title="सामान्य आकार (Reset Zoom)"
              className="p-1.5 text-[#D4A373] hover:text-[#FFF] border-l border-[#C58B4E]/20 pl-1.5 transition-colors cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Close Modal Button */}
          <button 
            onClick={onClose}
            title="ग्रन्थ वाचन बन्द करें (Close)"
            className="p-2 rounded-xl bg-rose-500/10 text-rose-300 hover:bg-rose-500/20 border border-rose-500/30 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Main Reading Canvas Viewport */}
      <div className="flex-1 relative w-full h-full overflow-auto flex items-start justify-center p-2 sm:p-6 bg-[#0c0805]/90">
        {loading && (
          <div className="absolute inset-0 flex flex-col items-center justify-center text-[#E0A96D] space-y-4 bg-black/60 z-20">
            <Loader className="w-10 h-10 animate-spin text-amber-400" />
            <p className="font-dharmik text-sm sm:text-base text-amber-200 animate-pulse">
              पवित्र ग्रन्थ लोड हो रहा है... कृपया प्रतीक्षा करें
            </p>
          </div>
        )}

        {error && (
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-6 space-y-4 bg-black/80 z-20">
            <div className="w-16 h-16 rounded-full bg-rose-500/10 flex items-center justify-center text-rose-400 border border-rose-500/30 shadow-lg">
              <WifiOff className="w-8 h-8" />
            </div>
            <p className="text-[#F7E7D6] font-sans text-sm max-w-md leading-relaxed">{error}</p>
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-[#C58B4E]/30 text-[#F3CA9D] border border-[#E0A96D] text-xs font-bold hover:bg-[#C58B4E]/50 transition-all cursor-pointer"
            >
              वापस जाएँ
            </button>
          </div>
        )}

        {/* PDF Page Canvas */}
        {!error && (
          <div className="relative shadow-2xl rounded-lg overflow-hidden border border-[#C58B4E]/30 bg-white">
            {renderingPage && (
              <div className="absolute top-3 right-3 z-10 bg-black/60 backdrop-blur-md px-2.5 py-1 rounded-full border border-amber-400/30 flex items-center gap-1.5 text-[10px] text-amber-300">
                <Loader className="w-3 h-3 animate-spin" />
                <span>पृष्ठ प्रस्तुति...</span>
              </div>
            )}
            <canvas ref={canvasRef} className="block max-w-none" />
          </div>
        )}
      </div>

      {/* Bottom Sticky Page Navigation Bar */}
      {!error && numPages > 0 && (
        <div className="h-16 border-t border-[#C58B4E]/30 bg-black/80 backdrop-blur-xl flex items-center justify-between px-3 sm:px-6 shrink-0 shadow-2xl">
          {/* Previous Page Button */}
          <button
            onClick={handlePrevPage}
            disabled={currentPage <= 1 || renderingPage}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-[#C58B4E]/40 bg-black/40 text-amber-200 hover:bg-[#C58B4E]/20 disabled:opacity-40 transition-all text-xs font-bold cursor-pointer"
          >
            <ChevronLeft className="w-4 h-4" />
            <span className="hidden sm:inline">पूर्व पृष्ठ</span>
          </button>

          {/* Page Jump / Indicator */}
          <form onSubmit={handleJumpSubmit} className="flex items-center gap-2">
            <span className="text-xs text-[#D4A373] font-dharmik">पृष्ठ</span>
            <input
              type="text"
              inputMode="numeric"
              value={jumpPageInput}
              onChange={(e) => setJumpPageInput(e.target.value)}
              onBlur={handleJumpSubmit}
              className="w-12 sm:w-14 text-center font-mono font-bold text-xs py-1 px-1.5 rounded-lg bg-black border border-[#C58B4E]/50 text-amber-300 focus:outline-none focus:border-amber-400"
            />
            <span className="text-xs text-[#D4A373] font-mono">
              / <strong className="text-amber-200">{numPages}</strong>
            </span>
          </form>

          {/* Next Page Button */}
          <button
            onClick={handleNextPage}
            disabled={currentPage >= numPages || renderingPage}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-[#C58B4E]/40 bg-black/40 text-amber-200 hover:bg-[#C58B4E]/20 disabled:opacity-40 transition-all text-xs font-bold cursor-pointer"
          >
            <span className="hidden sm:inline">अगला पृष्ठ</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
}
