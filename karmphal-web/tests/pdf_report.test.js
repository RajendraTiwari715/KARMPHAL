import { describe, it } from 'node:test';
import assert from 'node:assert';
import React from 'react';
import { renderToString } from 'react-dom/server';
import KundaliPrintReport from '../src/components/AstrologicalCore/KundaliPrintReport.jsx';

console.log('=== Kundali Print Report Layout & PDF Service Unit Tests ===\n');

describe('Kundali Dedicated Print Report Layout Tests', () => {
  const mockFormData = {
    name: 'राहुल शर्मा',
    dob: '1998-08-15',
    time: '08:30',
    place: 'नई दिल्ली (New Delhi)',
    isTimeApproximate: false
  };

  const mockPlanets = [
    { name: 'लग्न', signSanskrit: 'सिंह', signIndex: 5, house: 1, degreeInSign: 12.4, isRetro: false },
    { name: 'सूर्य', signSanskrit: 'कर्क', signIndex: 4, house: 12, degreeInSign: 28.1, isRetro: false, nakshatra: 'आश्लेषा', pada: 4 },
    { name: 'चन्द्र', signSanskrit: 'वृषभ', signIndex: 2, house: 10, degreeInSign: 14.8, isRetro: false, nakshatra: 'रोहिणी', pada: 2, nakshatraLord: 'चन्द्र' },
    { name: 'मंगल', signSanskrit: 'मिथुन', signIndex: 3, house: 11, degreeInSign: 6.2, isRetro: false, nakshatra: 'मृगशिरा', pada: 4 },
    { name: 'बुध', signSanskrit: 'कर्क', signIndex: 4, house: 12, degreeInSign: 19.5, isRetro: false, nakshatra: 'पुष्य', pada: 2 },
    { name: 'गुरु', signSanskrit: 'कुम्भ', signIndex: 11, house: 7, degreeInSign: 3.1, isRetro: true, nakshatra: 'धनिष्ठा', pada: 3 },
    { name: 'शुक्र', signSanskrit: 'मिथुन', signIndex: 3, house: 11, degreeInSign: 22.9, isRetro: false, nakshatra: 'पुनर्वसु', pada: 1 },
    { name: 'शनि', signSanskrit: 'मेष', signIndex: 1, house: 9, degreeInSign: 8.7, isRetro: true, nakshatra: 'अश्विनी', pada: 3 },
    { name: 'राहु', signSanskrit: 'कर्क', signIndex: 4, house: 12, degreeInSign: 10.0, isRetro: true, nakshatra: 'पुष्य', pada: 1 },
    { name: 'केतु', signSanskrit: 'मकर', signIndex: 10, house: 6, degreeInSign: 10.0, isRetro: true, nakshatra: 'श्रवण', pada: 3 }
  ];

  const mockDashaTimeline = [
    { lord: 'चन्द्र', years: 10, startDate: '1998-08-15', endDate: '2008-08-15' },
    { lord: 'मंगल', years: 7, startDate: '2008-08-15', endDate: '2015-08-15' },
    { lord: 'राहु', years: 18, startDate: '2015-08-15', endDate: '2033-08-15' },
    { lord: 'गुरु', years: 16, startDate: '2033-08-15', endDate: '2049-08-15' },
    { lord: 'शनि', years: 19, startDate: '2049-08-15', endDate: '2068-08-15' }
  ];

  const mockDoshas = {
    manglik: { status: 'निर्दोष', color: 'emerald' },
    kaalSarp: { status: 'निर्दोष', color: 'emerald' },
    sadesati: { status: 'सक्रिय', color: 'amber' },
    pitru: { status: 'निर्दोष', color: 'emerald' }
  };

  it('Test 1: Dedicated report renders distinct A4 pages with strict page-break layout', () => {
    const html = renderToString(
      React.createElement(KundaliPrintReport, {
        formData: mockFormData,
        calculatedData: {
          planets: mockPlanets,
          dashaTimeline: mockDashaTimeline,
          coords: { lat: 28.61, lon: 77.20 }
        },
        chartType: 'north',
        doshas: mockDoshas,
        aiReading: 'आपकी कुण्डली में गजकेसरी योग का निर्माण हो रहा है। आर्थिक एवं आध्यात्मिक उन्नति निश्चित है।'
      })
    );

    // Verify Page 1 & Page 2 markers exist
    assert(html.includes('data-page="1"'), 'Page 1 container must be present');
    assert(html.includes('data-page="2"'), 'Page 2 container must be present');
    assert(html.includes('page-break-after'), 'CSS page-break-after must be present');
    console.log('✔ Test 1 Passed: Both A4 Page 1 and Page 2 exist with strict page break markers.');
  });

  it('Test 2: Header contains authentic person birth details and Devanagari typography', () => {
    const html = renderToString(
      React.createElement(KundaliPrintReport, {
        formData: mockFormData,
        calculatedData: {
          planets: mockPlanets,
          dashaTimeline: mockDashaTimeline,
          coords: { lat: 28.61, lon: 77.20 }
        },
        chartType: 'north',
        doshas: mockDoshas
      })
    );

    assert(html.includes('राहुल शर्मा'), 'Must contain person name in Hindi');
    assert(html.includes('1998-08-15'), 'Must contain DOB');
    assert(html.includes('08:30'), 'Must contain birth time');
    assert(html.includes('नई दिल्ली'), 'Must contain birth place in Hindi');
    assert(html.includes('श्री भृगु संहिता वैदिक जन्म पत्रिका'), 'Must contain sacred title');
    assert(html.includes('श्री गणेशाय नमः'), 'Must contain Ganesh invocation');
    console.log('✔ Test 2 Passed: Header contains authentic name, birth details and sacred Devanagari titles.');
  });

  it('Test 3: Page 1 includes Dosha Samiksha and high-precision SVG Kundali chart', () => {
    const html = renderToString(
      React.createElement(KundaliPrintReport, {
        formData: mockFormData,
        calculatedData: {
          planets: mockPlanets,
          dashaTimeline: mockDashaTimeline,
          coords: { lat: 28.61, lon: 77.20 }
        },
        chartType: 'north',
        doshas: mockDoshas
      })
    );

    // Check Doshas
    assert(html.includes('मांगलिक'), 'Must include Manglik Dosha');
    assert(html.includes('कालसर्प'), 'Must include Kaal Sarp Dosha');
    assert(html.includes('साढ़े साती'), 'Must include Sade Sati');
    assert(html.includes('पितृ दोष'), 'Must include Pitru Dosha');

    // Check SVG Chart Elements
    assert(html.includes('<svg'), 'Must render SVG chart');
    assert(html.includes('viewBox="0 0 400 400"'), 'SVG chart must have high-res 400x400 viewBox');
    assert(html.includes('polygon points="200,8 392,200 200,392 8,200"'), 'North Indian diamond polygon must be present');
    console.log('✔ Test 3 Passed: Dosha Samiksha and North Indian SVG chart are rendered accurately.');
  });

  it('Test 4: Page 2 includes complete Planetary Degrees table and Vimshottari Dasha timeline', () => {
    const html = renderToString(
      React.createElement(KundaliPrintReport, {
        formData: mockFormData,
        calculatedData: {
          planets: mockPlanets,
          dashaTimeline: mockDashaTimeline,
          coords: { lat: 28.61, lon: 77.20 }
        },
        chartType: 'north',
        doshas: mockDoshas
      })
    );

    // Check Planetary Table
    assert(html.includes('ग्रह स्पष्ट सारणी'), 'Must include planetary table heading');
    assert(html.includes('सूर्य'), 'Must include Sun');
    assert(html.includes('चन्द्र'), 'Must include Moon');
    assert(html.includes('मंगल'), 'Must include Mars');
    assert(html.includes('गुरु'), 'Must include Jupiter');
    assert(html.includes('वक्री (R)'), 'Must indicate retrograde status in Hindi');

    // Check Vimshottari Mahadashas
    assert(html.includes('विंशोत्तरी महादशा चक्र'), 'Must include Vimshottari Dasha heading');
    assert(html.includes('राहु') && html.includes('महादशा'), 'Must include Rahu Mahadasha');
    assert(html.includes('वर्तमान'), 'Must mark current active Mahadasha');
    console.log('✔ Test 4 Passed: Planetary degrees table and Vimshottari Dasha timeline are rendered.');
  });

  it('Test 5: South Indian chart type renders square grid correctly', () => {
    const html = renderToString(
      React.createElement(KundaliPrintReport, {
        formData: mockFormData,
        calculatedData: {
          planets: mockPlanets,
          dashaTimeline: mockDashaTimeline,
          coords: { lat: 28.61, lon: 77.20 }
        },
        chartType: 'south',
        doshas: mockDoshas
      })
    );

    assert(html.includes('दक्षिण भारतीय चक्र'), 'Must specify South Indian chart');
    assert(html.includes('viewBox="0 0 380 380"'), 'South Indian chart has square 380x380 viewBox');
    console.log('✔ Test 5 Passed: South Indian square grid renders cleanly.');
  });
});
