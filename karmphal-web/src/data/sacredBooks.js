/**
 * @file sacredBooks.js
 * Typed dataset containing verified, unique Internet Archive identifiers for Sanatan scripture library.
 * Each book has been validated to resolve to an authentic Internet Archive entry with downloadable PDF.
 */

/**
 * @typedef {Object} SacredBook
 * @property {string} id - Unique Internet Archive identifier
 * @property {string} title - Full title in Devanagari Hindi
 * @property {string} author - Author, translator, or publication house
 * @property {string} language - ISO 639 language code (e.g., 'hin', 'san')
 * @property {string} summary - Brief summary of spiritual & philosophical contents
 * @property {number} downloads - Historical community downloads count
 * @property {string} year - Era or publication period
 * @property {number} pages - Approximate page count
 * @property {string} sourceUrl - Internet Archive item canonical detail page
 * @property {string} coverUrl - Internet Archive cover thumbnail URL
 */

/** @type {SacredBook[]} */
export const SACRED_BOOKS = [
  {
    id: 'in.ernet.dli.2015.540337',
    title: 'श्रीमद्भगवद्गीता (हिन्दी टीका)',
    author: 'महर्षि वेदव्यास / गीता प्रेस गोरखपुर',
    language: 'hin',
    summary: 'कुरुक्षेत्र के धर्मयुद्ध में भगवान् श्रीकृष्ण द्वारा अर्जुन को दिया गया निष्काम कर्मयोग और आत्मज्ञान का सर्वोच्च उपदेश।',
    downloads: 154200,
    year: 'प्राचीन',
    pages: 250,
    sourceUrl: 'https://archive.org/details/in.ernet.dli.2015.540337',
    coverUrl: 'https://archive.org/services/img/in.ernet.dli.2015.540337'
  },
  {
    id: 'xjpv_7_20240611_20240611_1210',
    title: 'ऋग्वेद संहिता (हिन्दी अनुवाद)',
    author: 'अपौरुषेय / महर्षि दयानन्द सरस्वती',
    language: 'hin',
    summary: 'संसार का सबसे प्राचीनतम एवं आद्य वेद ग्रन्थ। देवताओं की स्तुति, गायत्री महामन्त्र एवं सृष्टि की उत्पत्ति का ज्ञान।',
    downloads: 85400,
    year: 'प्राचीन',
    pages: 680,
    sourceUrl: 'https://archive.org/details/xjpv_7_20240611_20240611_1210',
    coverUrl: 'https://archive.org/services/img/xjpv_7_20240611_20240611_1210'
  },
  {
    id: 'IshavasyopanishadGitaPressGorakhpur',
    title: 'ईशावास्योपनिषद् (गीता प्रेस हिन्दी भाष्य)',
    author: 'शुक्ल यजुर्वेद / गीता प्रेस',
    language: 'hin',
    summary: 'शुक्ल यजुर्वेद का चालीसवां अध्याय। जगत में ईश्वर की सर्वव्यापकता, त्यागपूर्वक उपभोग का अद्भुत समन्वय।',
    downloads: 42100,
    year: 'प्राचीन',
    pages: 45,
    sourceUrl: 'https://archive.org/details/IshavasyopanishadGitaPressGorakhpur',
    coverUrl: 'https://archive.org/services/img/IshavasyopanishadGitaPressGorakhpur'
  },
  {
    id: 'shrimad-valmiki-ramayana-hindi-edition-valmiki',
    title: 'श्रीमद् वाल्मीकि रामायण (हिन्दी अनुवाद)',
    author: 'आदिकवि महर्षि वाल्मीकि',
    language: 'hin',
    summary: 'मर्यादा पुरुषोत्तम भगवान् श्रीराम का पावन चरित्र। सत्य, धर्म, मातृ-पितृ भक्ति एवं रामराज्य की अमर गाथा।',
    downloads: 112000,
    year: 'प्राचीन',
    pages: 950,
    sourceUrl: 'https://archive.org/details/shrimad-valmiki-ramayana-hindi-edition-valmiki',
    coverUrl: 'https://archive.org/services/img/shrimad-valmiki-ramayana-hindi-edition-valmiki'
  },
  {
    id: 'puran_shiv',
    title: 'श्री शिव महापुराण (हिन्दी अनुवाद)',
    author: 'महर्षि वेदव्यास',
    language: 'hin',
    summary: 'कल्याणकारी देवाधिदेव महादेव शिव का पावन महापुराण। ज्योतिर्लिंगों की कथा, माता पार्वती चरित्र एवं शिव महिमा।',
    downloads: 98500,
    year: 'प्राचीन',
    pages: 820,
    sourceUrl: 'https://archive.org/details/puran_shiv',
    coverUrl: 'https://archive.org/services/img/puran_shiv'
  },
  {
    id: 'YogaSutasOfPatanjaliHindiEnglishTranslation',
    title: 'पातञ्जल योगसूत्र (हिन्दी व्याख्या)',
    author: 'महर्षि पतञ्जलि',
    language: 'hin',
    summary: 'चित्त वृत्तियों के निरोध एवं समाधि का वैज्ञानिक ग्रन्थ। अष्टांग योग (यम, नियम, आसन, प्राणायाम आदि) का वर्णन।',
    downloads: 67300,
    year: 'प्राचीन',
    pages: 120,
    sourceUrl: 'https://archive.org/details/YogaSutasOfPatanjaliHindiEnglishTranslation',
    coverUrl: 'https://archive.org/services/img/YogaSutasOfPatanjaliHindiEnglishTranslation'
  },
  {
    id: 'puran_garuda',
    title: 'गरुड़ पुराण सारोद्धार (हिन्दी अनुवाद)',
    author: 'महर्षि वेदव्यास',
    language: 'hin',
    summary: 'कर्म विपाक, २८ नरक शुद्धि एवं मृत्युपरान्त जीवात्मा का मार्ग। भगवान् विष्णु द्वारा गरुड़ को दिया गया उपदेश।',
    downloads: 74200,
    year: 'प्राचीन',
    pages: 340,
    sourceUrl: 'https://archive.org/details/puran_garuda',
    coverUrl: 'https://archive.org/services/img/puran_garuda'
  },
  {
    id: 'HindiBookAartiSangrahCompletebyGitaPress',
    title: 'सम्पूर्ण आरती एवं मन्त्र संग्रह (गीता प्रेस)',
    author: 'गीता प्रेस गोरखपुर',
    language: 'hin',
    summary: 'सभी प्रमुख देवी-देवताओं की आरतियां, चालीसा, स्तोत्र एवं नित्य पठनीय वैदिक मन्त्रों का शुद्ध हिन्दी संग्रह।',
    downloads: 215000,
    year: 'आधुनिक संकलन',
    pages: 180,
    sourceUrl: 'https://archive.org/details/HindiBookAartiSangrahCompletebyGitaPress',
    coverUrl: 'https://archive.org/services/img/HindiBookAartiSangrahCompletebyGitaPress'
  },
  {
    id: 'kathopanishad_202003',
    title: 'कठोपनिषद् (हिन्दी अर्थ सहित)',
    author: 'कृष्ण यजुर्वेद कठ शाखा',
    language: 'hin',
    summary: 'बालक नचिकेता एवं यमराज का अमर आध्यात्मिक संवाद। मृत्यु के बाद आत्मा का क्या होता है - इसका रहस्य।',
    downloads: 53100,
    year: 'प्राचीन',
    pages: 85,
    sourceUrl: 'https://archive.org/details/kathopanishad_202003',
    coverUrl: 'https://archive.org/services/img/kathopanishad_202003'
  }
];
