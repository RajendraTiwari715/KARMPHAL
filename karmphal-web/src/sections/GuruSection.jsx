import React from 'react';
import SanatanAIAcharya from '../components/TheologicalChatbot/SanatanAIAcharya';
import { languageService } from '../services/languageService';
import guruAvatar from '../assets/guru_avatar.jpg';
import templeHero from '../assets/temple_hero.jpg';

export default function GuruSection({ panchangData }) {
  const t = languageService.t();

  return (
    <div className="space-y-4 sm:space-y-6 animate-fade-in">

      {/* Main AI Acharya Chatbot Component */}
      <SanatanAIAcharya panchangData={panchangData} />
    </div>
  );
}
