import React, { useState, useEffect, useCallback } from 'react';
import Navbar from './components/Navbar';
import GuruSection from './sections/GuruSection';
const GyanSection = React.lazy(() => import('./sections/GyanSection'));
const SadhanaSection = React.lazy(() => import('./sections/SadhanaSection'));
const JyotishSection = React.lazy(() => import('./sections/JyotishSection'));
const KarmaSection = React.lazy(() => import('./sections/KarmaSection'));
import { computePanchang } from './services/ephemerisEngine';
import { vedicAshramBg as bgImage } from './assets';
import { backButtonService } from './services/backButtonService';
import ErrorBoundary from './components/ErrorBoundary';

function SectionSkeleton() {
  return (
    <div className="flex flex-col items-center justify-center py-24 px-4 text-center">
      <div className="w-10 h-10 border-3 border-[#C58B4E] border-t-transparent rounded-full animate-spin mb-3"></div>
      <p className="font-dharmik text-[#F3CA9D] text-sm">लोड हो रहा है...</p>
    </div>
  );
}

// Resilience & Crash Demo: allows intentional crash simulation per section
function ForcedErrorTester({ section }) {
  if (typeof window !== 'undefined') {
    const search = window.location?.search;
    if (search) {
      const urlParams = new URLSearchParams(search);
      if (urlParams.get('forceCrash') === section) {
        throw new Error(`[FORCED DEMO ERROR] Intentional crash in section: ${section}`);
      }
    }
    if (window.__karmphalForceCrashSection === section) {
      throw new Error(`[FORCED DEMO ERROR] Intentional crash in section: ${section}`);
    }
  }
  return null;
}

export default function App() {
  const [activeSection, setActiveSection] = useState('guru'); // 'guru', 'gyan', 'sadhana', 'jyotish', 'karma'
  const [sectionHistory, setSectionHistory] = useState(['guru']);
  const [panchangData, setPanchangData] = useState(() => computePanchang(new Date(), 28.6139, 77.2090));

  const handleNavigateSection = useCallback((newSection) => {
    setActiveSection(newSection);
    setSectionHistory(prev => {
      if (prev[prev.length - 1] === newSection) return prev;
      return [...prev, newSection];
    });
  }, []);

  useEffect(() => {
    backButtonService.initNativeListener();
    backButtonService.configureNavigation({
      isHome: () => activeSection === 'guru' && sectionHistory.length <= 1,
      popNavigation: () => {
        if (sectionHistory.length > 1) {
          const nextHistory = sectionHistory.slice(0, -1);
          const prevSection = nextHistory[nextHistory.length - 1];
          setSectionHistory(nextHistory);
          setActiveSection(prevSection);
          return true;
        } else if (activeSection !== 'guru') {
          setActiveSection('guru');
          setSectionHistory(['guru']);
          return true;
        }
        return false;
      }
    });
  }, [activeSection, sectionHistory]);

  return (
    <div 
      className="min-h-screen text-[#FEF3E2] flex flex-col selection:bg-[#C58B4E]/30 selection:text-[#FFF4E6] bg-cover bg-center bg-fixed relative"
      style={{ backgroundImage: `url(${bgImage})` }}
    >
      {/* Warm spiritual overlay to balance contrast without being purely black */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#1A0F0A]/60 via-[#0A0502]/40 to-[#2A0E1D]/60 z-0 pointer-events-none"></div>
      
      <div className="relative z-10 flex flex-col min-h-screen">
        {/* Top Clean Navbar */}
        <Navbar
          activeSection={activeSection}
          setActiveSection={handleNavigateSection}
          panchangData={panchangData}
        />

        {/* Main Content Area */}
        <main className="flex-1 max-w-7xl w-full mx-auto px-3 sm:px-4 lg:px-6 py-3 sm:py-6 space-y-5 pb-24 md:pb-10">
          {/* Render Active Section with Section-Level Error Boundaries */}
          {activeSection === 'guru' && (
            <ErrorBoundary section="guru" onGoHome={() => setActiveSection('guru')}>
              <ForcedErrorTester section="guru" />
              <GuruSection panchangData={panchangData} />
            </ErrorBoundary>
          )}

          {activeSection === 'gyan' && (
            <ErrorBoundary section="gyan" onGoHome={() => setActiveSection('guru')}>
              <ForcedErrorTester section="gyan" />
              <React.Suspense fallback={<SectionSkeleton />}>
                <GyanSection />
              </React.Suspense>
            </ErrorBoundary>
          )}

          {activeSection === 'sadhana' && (
            <ErrorBoundary section="sadhana" onGoHome={() => setActiveSection('guru')}>
              <ForcedErrorTester section="sadhana" />
              <React.Suspense fallback={<SectionSkeleton />}>
                <SadhanaSection />
              </React.Suspense>
            </ErrorBoundary>
          )}

          {activeSection === 'jyotish' && (
            <ErrorBoundary section="jyotish" onGoHome={() => setActiveSection('guru')}>
              <ForcedErrorTester section="jyotish" />
              <React.Suspense fallback={<SectionSkeleton />}>
                <JyotishSection
                  panchangData={panchangData}
                  setPanchangData={setPanchangData}
                />
              </React.Suspense>
            </ErrorBoundary>
          )}

          {activeSection === 'karma' && (
            <ErrorBoundary section="karma" onGoHome={() => setActiveSection('guru')}>
              <ForcedErrorTester section="karma" />
              <React.Suspense fallback={<SectionSkeleton />}>
                <KarmaSection />
              </React.Suspense>
            </ErrorBoundary>
          )}
        </main>
      </div>
    </div>
  );
}
