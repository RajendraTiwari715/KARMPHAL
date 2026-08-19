import React from 'react';

// 1. GURU (आचार्य / ऋषि / दिव्य गुरु)
export function GuruIcon({ className = "w-6 h-6", active = false }) {
  return (
    <svg viewBox="0 0 48 48" fill="none" className={className} xmlns="http://www.w3.org/2000/svg">
      <defs>
        <radialGradient id="guruGlow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#FFF3D6" />
          <stop offset="60%" stopColor="#E0A96D" />
          <stop offset="100%" stopColor="#8C4B19" />
        </radialGradient>
        <linearGradient id="goldTrim" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#FFF2D4" />
          <stop offset="50%" stopColor="#E0A96D" />
          <stop offset="100%" stopColor="#7A3E11" />
        </linearGradient>
      </defs>
      {/* Divine Aura Halo */}
      <circle cx="24" cy="18" r="14" stroke="url(#goldTrim)" strokeWidth="1.5" strokeDasharray="3 3" opacity="0.8" />
      <circle cx="24" cy="18" r="11" fill="url(#guruGlow)" opacity="0.3" />
      
      {/* Meditative Head & Tilak */}
      <circle cx="24" cy="17" r="6.5" fill="url(#goldTrim)" />
      {/* Tilak / Third eye */}
      <path d="M24 13.5V16.5" stroke="#FFFFFF" strokeWidth="1.2" strokeLinecap="round" />
      <circle cx="24" cy="15" r="0.8" fill="#D9381E" />
      
      {/* Shoulders & Yoga Posture Mudra */}
      <path d="M12 36C12 30 17 26 24 26C31 26 36 30 36 36C36 38 34 40 24 40C14 40 12 38 12 36Z" fill="url(#goldTrim)" />
      
      {/* Uttariya Shawl Fold */}
      <path d="M19 28C21 32 23 35 24 38C25 35 27 32 29 28" stroke="#120A05" strokeWidth="1.2" strokeLinecap="round" />
      
      {/* Gyan Mudra Hands */}
      <circle cx="16" cy="36" r="2.5" fill="url(#goldTrim)" />
      <circle cx="32" cy="36" r="2.5" fill="url(#goldTrim)" />
    </svg>
  );
}

// 2. GYAN (वेद संहिता / ग्रन्थ / उपनिषद्)
export function GyanIcon({ className = "w-6 h-6", active = false }) {
  return (
    <svg viewBox="0 0 48 48" fill="none" className={className} xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="gyanGold" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#FFF2D4" />
          <stop offset="50%" stopColor="#E0A96D" />
          <stop offset="100%" stopColor="#8C4B19" />
        </linearGradient>
      </defs>
      {/* Sacred Scripture Book Openings */}
      <path d="M24 14C19 11 11 11 8 13V36C11 34 19 34 24 37C29 34 37 34 40 36V13C37 11 29 11 24 14Z" fill="url(#gyanGold)" />
      <path d="M24 14V37" stroke="#120A05" strokeWidth="1.5" />
      
      {/* Shloka lines on left page */}
      <line x1="12" y1="18" x2="20" y2="18" stroke="#120A05" strokeWidth="1.2" strokeLinecap="round" />
      <line x1="12" y1="23" x2="20" y2="23" stroke="#120A05" strokeWidth="1.2" strokeLinecap="round" />
      <line x1="12" y1="28" x2="18" y2="28" stroke="#120A05" strokeWidth="1.2" strokeLinecap="round" />
      
      {/* Shloka lines on right page */}
      <line x1="28" y1="18" x2="36" y2="18" stroke="#120A05" strokeWidth="1.2" strokeLinecap="round" />
      <line x1="28" y1="23" x2="36" y2="23" stroke="#120A05" strokeWidth="1.2" strokeLinecap="round" />
      <line x1="28" y1="28" x2="34" y2="28" stroke="#120A05" strokeWidth="1.2" strokeLinecap="round" />
      
      {/* Central Radiant Om Light */}
      <circle cx="24" cy="11" r="3" fill="#FFE5B4" />
    </svg>
  );
}

// 3. SADHANA (दीप शिखा / रुद्राक्ष जप माला / हवन कुण्ड)
export function SadhanaIcon({ className = "w-6 h-6", active = false }) {
  return (
    <svg viewBox="0 0 48 48" fill="none" className={className} xmlns="http://www.w3.org/2000/svg">
      <defs>
        <radialGradient id="flameGlow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#FFF8E7" />
          <stop offset="40%" stopColor="#FFB300" />
          <stop offset="80%" stopColor="#E65100" />
          <stop offset="100%" stopColor="#8C4B19" />
        </radialGradient>
        <linearGradient id="diyaGold" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#FFE0B2" />
          <stop offset="50%" stopColor="#E0A96D" />
          <stop offset="100%" stopColor="#6D3710" />
        </linearGradient>
      </defs>
      
      {/* Diya Base / Vessel */}
      <path d="M10 26C10 35 18 39 24 39C30 39 38 35 38 26H10Z" fill="url(#diyaGold)" />
      {/* Diya Stand */}
      <path d="M17 39L15 43H33L31 39" fill="url(#diyaGold)" />
      
      {/* Glowing Sacred Diya Flame */}
      <path d="M24 8C24 8 16 17 16 23C16 27.5 19.5 30 24 30C28.5 30 32 27.5 32 23C32 17 24 8 24 8Z" fill="url(#flameGlow)" />
      {/* Inner Flame Core */}
      <path d="M24 14C24 14 20 19 20 22.5C20 25 21.8 26.5 24 26.5C26.2 26.5 28 25 28 22.5C28 19 24 14 24 14Z" fill="#FFFFFF" opacity="0.9" />
    </svg>
  );
}

// 4. JYOTISH (सूर्य चक्र / नवग्रह / कुण्डली मण्डल)
export function JyotishIcon({ className = "w-6 h-6", active = false }) {
  return (
    <svg viewBox="0 0 48 48" fill="none" className={className} xmlns="http://www.w3.org/2000/svg">
      <defs>
        <radialGradient id="sunCenter" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#FFFFFF" />
          <stop offset="50%" stopColor="#FFD54F" />
          <stop offset="100%" stopColor="#C58B4E" />
        </radialGradient>
        <linearGradient id="zodiacRim" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#FFE082" />
          <stop offset="50%" stopColor="#E0A96D" />
          <stop offset="100%" stopColor="#7A3E11" />
        </linearGradient>
      </defs>
      
      {/* Outer Cosmic Orbit Circle */}
      <circle cx="24" cy="24" r="18" stroke="url(#zodiacRim)" strokeWidth="1.5" strokeDasharray="4 2" />
      
      {/* 12 Zodiac Rays / Sun Spikes */}
      <path d="M24 2V6M24 42V46M2 24H6M42 24H46M8.5 8.5L11.5 11.5M36.5 36.5L39.5 39.5M8.5 39.5L11.5 36.5M36.5 11.5L39.5 8.5" stroke="url(#zodiacRim)" strokeWidth="1.8" strokeLinecap="round" />
      
      {/* Planetary Orbit Nodes */}
      <circle cx="24" cy="9" r="1.8" fill="#FFE082" />
      <circle cx="37" cy="18" r="1.8" fill="#FFE082" />
      <circle cx="34" cy="33" r="1.8" fill="#FFE082" />
      <circle cx="14" cy="33" r="1.8" fill="#FFE082" />
      <circle cx="11" cy="18" r="1.8" fill="#FFE082" />
      
      {/* Radiant Sun Core */}
      <circle cx="24" cy="24" r="7.5" fill="url(#sunCenter)" />
      <circle cx="24" cy="24" r="4.5" stroke="#120A05" strokeWidth="1" />
    </svg>
  );
}

// 5. KARMA (धर्मचक्र / न्याय तुला / गरुड़ पुराण कर्मफल)
export function KarmaIcon({ className = "w-6 h-6", active = false }) {
  return (
    <svg viewBox="0 0 48 48" fill="none" className={className} xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="karmaGold" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#FFF2D4" />
          <stop offset="50%" stopColor="#E0A96D" />
          <stop offset="100%" stopColor="#6D3710" />
        </linearGradient>
      </defs>
      
      {/* Central Balance Beam (धर्मदण्ड) */}
      <line x1="24" y1="8" x2="24" y2="40" stroke="url(#karmaGold)" strokeWidth="2.5" strokeLinecap="round" />
      <circle cx="24" cy="9" r="3" fill="url(#karmaGold)" />
      
      {/* Horizontal Balance Crossbar */}
      <line x1="8" y1="17" x2="40" y2="17" stroke="url(#karmaGold)" strokeWidth="2.5" strokeLinecap="round" />
      
      {/* Left Pan (पुण्य पलड़ा) */}
      <line x1="11" y1="17" x2="6" y2="28" stroke="url(#karmaGold)" strokeWidth="1.2" />
      <line x1="11" y1="17" x2="16" y2="28" stroke="url(#karmaGold)" strokeWidth="1.2" />
      <path d="M5 28C5 32 17 32 17 28H5Z" fill="url(#karmaGold)" />
      
      {/* Right Pan (पाप पलड़ा) */}
      <line x1="37" y1="17" x2="32" y2="28" stroke="url(#karmaGold)" strokeWidth="1.2" />
      <line x1="37" y1="17" x2="42" y2="28" stroke="url(#karmaGold)" strokeWidth="1.2" />
      <path d="M31 28C31 32 43 32 43 28H31Z" fill="url(#karmaGold)" />
      
      {/* Base Stand */}
      <path d="M16 41H32" stroke="url(#karmaGold)" strokeWidth="3" strokeLinecap="round" />
    </svg>
  );
}
