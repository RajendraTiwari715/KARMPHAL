import React, { useState } from 'react';
import Navbar from './components/Navbar';
import GuruSection from './sections/GuruSection';
import GyanSection from './sections/GyanSection';
import SadhanaSection from './sections/SadhanaSection';
import JyotishSection from './sections/JyotishSection';
import KarmaSection from './sections/KarmaSection';
import { computePanchang } from './services/ephemerisEngine';
import { vedicAshramBg as bgImage } from './assets';

import ErrorBoundary from './components/ErrorBoundary';

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
  const [panchangData, setPanchangData] = useState(() => computePanchang(new Date(), 28.6139, 77.2090));

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
          setActiveSection={setActiveSection}
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
              <GyanSection />
            </ErrorBoundary>
          )}

          {activeSection === 'sadhana' && (
            <ErrorBoundary section="sadhana" onGoHome={() => setActiveSection('guru')}>
              <ForcedErrorTester section="sadhana" />
              <SadhanaSection />
            </ErrorBoundary>
          )}

          {activeSection === 'jyotish' && (
            <ErrorBoundary section="jyotish" onGoHome={() => setActiveSection('guru')}>
              <ForcedErrorTester section="jyotish" />
              <JyotishSection
                panchangData={panchangData}
                setPanchangData={setPanchangData}
              />
            </ErrorBoundary>
          )}

          {activeSection === 'karma' && (
            <ErrorBoundary section="karma" onGoHome={() => setActiveSection('guru')}>
              <ForcedErrorTester section="karma" />
              <KarmaSection />
            </ErrorBoundary>
          )}
        </main>
      </div>
    </div>
  );
}
