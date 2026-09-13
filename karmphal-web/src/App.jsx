import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import GuruSection from './sections/GuruSection';
import GyanSection from './sections/GyanSection';
import SadhanaSection from './sections/SadhanaSection';
import JyotishSection from './sections/JyotishSection';
import KarmaSection from './sections/KarmaSection';
import { computePanchang } from './services/ephemerisEngine';
import bgImage from './assets/vedic_ashram_bg.jpg';

export default function App() {
  const [activeSection, setActiveSection] = useState('guru'); // 'guru', 'gyan', 'sadhana', 'jyotish', 'karma'
  const [panchangData, setPanchangData] = useState(null);

  useEffect(() => {
    const initialPanchang = computePanchang(new Date(), 28.6139, 77.2090);
    setPanchangData(initialPanchang);
  }, []);

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
          {/* Render Active Section */}
          {activeSection === 'guru' && (
            <GuruSection panchangData={panchangData} />
          )}

          {activeSection === 'gyan' && (
            <GyanSection />
          )}

          {activeSection === 'sadhana' && (
            <SadhanaSection />
          )}

          {activeSection === 'jyotish' && (
            <JyotishSection
              panchangData={panchangData}
              setPanchangData={setPanchangData}
            />
          )}

          {activeSection === 'karma' && (
            <KarmaSection />
          )}
        </main>
      </div>
    </div>
  );
}
