import React from 'react';
import SanatanAIAcharya from '../components/TheologicalChatbot/SanatanAIAcharya';

export default function GuruSection({ panchangData }) {
  return (
    <div className="space-y-4 sm:space-y-6 animate-fade-in">

      {/* Main AI Acharya Chatbot Component */}
      <SanatanAIAcharya panchangData={panchangData} />
    </div>
  );
}
