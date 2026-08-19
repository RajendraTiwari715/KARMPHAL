import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import GuruSection from './sections/GuruSection';
import GyanSection from './sections/GyanSection';
import SadhanaSection from './sections/SadhanaSection';
import JyotishSection from './sections/JyotishSection';
import KarmaSection from './sections/KarmaSection';
import { computePanchang } from './services/ephemerisEngine';

export default function App() {
  const [activeSection, setActiveSection] = useState('guru'); // 'guru', 'gyan', 'sadhana', 'jyotish', 'karma'
  const [panchangData, setPanchangData] = useState(null);

  useEffect(() => {
    const initialPanchang = computePanchang(new Date(), 28.6139, 77.2090);
    setPanchangData(initialPanchang);
  }, []);

  return (
    <div className="min-h-screen bg-[#120A05] text-[#F7E7D6] flex flex-col selection:bg-[#C58B4E]/30 selection:text-[#F3CA9D]">
      {/* Top Navbar */}
      <Navbar
        activeSection={activeSection}
        setActiveSection={setActiveSection}
        panchangData={panchangData}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-3 sm:px-4 lg:px-6 py-4 sm:py-6 space-y-6 pb-24 md:pb-12">
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

      {/* Sacred Footer */}
      <footer className="border-t border-[#C58B4E]/20 bg-[#0E0703]/95 py-6 px-4 text-center text-xs text-[#A67C52] hidden md:block">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="text-[#E0A96D] font-sanskrit text-lg font-bold">ॐ</span>
            <span className="font-dharmik text-[#F3CA9D] text-sm font-bold">कर्मफल सनातन डिजिटल प्लेटफॉर्म</span>
          </div>

          <div className="font-sanskrit text-[#D4A373] text-xs tracking-wider">
            सर्वे भवन्तु सुखिनः सर्वे सन्तु निरामयाः । सर्वे भद्राणि पश्यन्तु मा कश्चिद्दुःखभाग्भवेत् ॥
          </div>
        </div>
      </footer>
    </div>
  );
}
