// Canonical Swapna Shastra Engine (अग्नि पुराणोक्त स्वप्न शास्त्र एवं प्रहर काल फल विचार)
// Sources: Agni Purana (Chapter 14), Brihat Samhita (Varahamihira), Charaka Samhita (Indriya Sthana)
// 100% Shuddh Hindi (शुद्ध हिन्दी)

export const DREAM_PRAHARS = [
  {
    praharNumber: 1,
    name: 'प्रथम प्रहर (सायं ६:०० से रात्रि ९:००)',
    timeWindow: '१८:०० - २१:००',
    fulfillmentHorizon: '१ वर्ष में फलित',
    description: 'जाग्रत अवस्था के अवशिष्ट संस्कारों एवं पाचन क्रिया का प्रभाव अधिक रहता है। फल प्राप्ति में १ वर्ष का समय लगता है।'
  },
  {
    praharNumber: 2,
    name: 'द्वितीय प्रहर (रात्रि ९:०० से मध्यरात्रि १२:००)',
    timeWindow: '२१:०० - ००:००',
    fulfillmentHorizon: '६ से ८ मास में फलित',
    description: 'मध्यम स्तर का सूक्ष्म प्रभाव। स्वप्न का फल ६ से ८ महीने के भीतर दृष्टिगोचर होता है।'
  },
  {
    praharNumber: 3,
    name: 'तृतीय प्रहर (मध्यरात्रि १२:०० से प्रातः ३:००)',
    timeWindow: '००:०० - ०३:००',
    fulfillmentHorizon: '३ मास में फलित',
    description: 'गहरे अचेतन का संकेत। स्वप्न का फल ३ महीने के भीतर निश्चित रूप से प्राप्त होता है।'
  },
  {
    praharNumber: 4,
    name: 'चतुर्थ प्रहर / ब्रह्म मुहूर्त (प्रातः ३:०० से सूर्योदय)',
    timeWindow: '०३:०० - ०६:००',
    fulfillmentHorizon: '१० दिनों के भीतर फलित',
    description: 'सत्त्वगुण की प्रधानता। इस काल का स्वप्न १० दिनों के भीतर (अथवा १ से ७ दिन में) शत-प्रतिशत सत्य फलित होता है।'
  }
];

export const PRAHAR_TIMINGS = DREAM_PRAHARS;

export const DREAM_MOTIFS = [
  {
    id: 1,
    motif: 'पर्वत, मन्दिर, राजमहल अथवा हाथी पर चढ़ना',
    sanskrit: 'पर्वत/मन्दिर/गज आरोहण',
    isShubha: true,
    category: 'परम शुभ (Auspicious)',
    scripturalRef: 'अग्नि पुराण १४.८ एवं बृहत्संहिता',
    interpretation: 'सामाजिक पद-प्रतिष्ठा में अप्रत्याशित वृद्धि, धन लाभ, राजकीय या प्रशासनिक कृपा, तथा आध्यात्मिक उन्नति का सूचक है।',
    remedy: 'भगवान् श्री गणेश जी को मोदक/दूर्वा अर्पित करें तथा शुद्ध गो-घृत का दीपक प्रज्वलित करें।'
  },
  {
    id: 2,
    motif: 'निर्मल जल प्रवाह, मूसलाधार वर्षा या समुद्र',
    sanskrit: 'निर्मल जल प्रवाह / वृष्टि',
    isShubha: true,
    category: 'अत्यन्त शुभ (Auspicious)',
    scripturalRef: 'अग्नि पुराण १४.१२',
    interpretation: 'दीर्घकालिक रोगों से मुक्ति, ऋण मुक्ति, मानसिक शान्ति तथा अटके हुए कार्यों की सिद्धि।',
    remedy: 'उदय होते सूर्य को गायत्री मन्त्र के साथ तांबे के लोटे से पवित्र अर्घ्य समर्पित करें।'
  },
  {
    id: 3,
    motif: 'श्वेत पुष्प, श्वेत गौ, बैल, अथवा हंस का दर्शन',
    sanskrit: 'श्वेत पुष्प / गौ / हंस दर्शन',
    isShubha: true,
    category: 'परम कल्याणकारी (Divine)',
    scripturalRef: 'बृहत्संहिता एवं अग्नि पुराण',
    interpretation: 'महान पुण्य फल की प्राप्ति, वंश वृद्धि, विद्या लाभ तथा साक्षात् भगवत्-कृपा का संकेत।',
    remedy: '२४ घण्टे के भीतर किसी श्वेत गौ को हरा चारा अथवा गुड़-रोटी खिलाएं।'
  },
  {
    id: 4,
    motif: 'गधा, ऊँट या सूअर पर बैठकर दक्षिण दिशा में जाना',
    sanskrit: 'गर्दभ/उष्ट्र दक्षिण गमन',
    isShubha: false,
    category: 'अशुभ / अरिष्ट (Inauspicious)',
    scripturalRef: 'चरक संहिता इन्द्रिय स्थान एवं अग्नि पुराण',
    interpretation: 'स्वास्थ्य हानि, आर्थिक संकट अथवा किसी अप्रिय समाचार की पूर्व चेतावनी।',
    remedy: 'तुरन्त १०८ बार महामृत्युञ्जय मन्त्र का जप करें, शिव मन्दिर में जलाभिषेक करें तथा काले तिल का दान करें।'
  },
  {
    id: 5,
    motif: 'कीचड़, तेल या गन्दगी में डूबना',
    sanskrit: 'पंक/तैल निमज्जन',
    isShubha: false,
    category: 'अशुभ (Inauspicious)',
    scripturalRef: 'अग्नि पुराण १४.२३',
    interpretation: 'अपयश का भय, झूठे आरोपों का खतरा अथवा धन की व्यर्थ हानि।',
    remedy: 'गायत्री मन्त्र की ३ माला जपें तथा कांसे की कटोरी में सरसों के तेल का छाया दान करें।'
  },
  {
    id: 6,
    motif: 'दाँत टूटना, सिर मुण्डन अथवा दीवार गिरना',
    sanskrit: 'दन्त पतन / मुण्डन',
    isShubha: false,
    category: 'अशुभ (Inauspicious)',
    scripturalRef: 'बृहत्संहिता अध्याय ६८',
    interpretation: 'पारिवारिक सम्बन्धियों को कष्ट अथवा गृह कलह का सूचक।',
    remedy: 'सूर्य देव को कुमकुम युक्त जल चढ़ाएं और पक्षियों को गुड़-अनाज खिलाएं।'
  },
  {
    id: 7,
    motif: 'सर्प का काटना अथवा तेजोमय नाग देखना',
    sanskrit: 'सर्पदंश / नाग दर्शन',
    isShubha: true,
    category: 'शुभ (Auspicious)',
    scripturalRef: 'अग्नि पुराण १४.१९',
    interpretation: 'अचानक गुप्त धन प्राप्ति, शत्रुओं पर विजय, तथा कुण्डलिनी शक्ति के जागरण का संकेत।',
    remedy: 'शिवलिंग पर कच्चा दूध एवं बिल्वपत्र अर्पित करें।'
  },
  {
    id: 8,
    motif: 'ऋषि-मुनियों के साथ खीर या शहद खाना',
    sanskrit: 'पायस / मधु भक्षण',
    isShubha: true,
    category: 'परम शुभ (Auspicious)',
    scripturalRef: 'बृहत्संहिता',
    interpretation: 'बुद्धि व प्रतिभा का विकास, परीक्षा-प्रतियोगिता में सफलता, तथा पूर्वजों की तृप्ति।',
    remedy: 'छोटे बालकों को मीठी खीर का प्रसाद वितरण करें।'
  },
  {
    id: 9,
    motif: 'काले वस्त्र पहनना अथवा दक्षिण दिशा की शवयात्रा',
    sanskrit: 'कृष्ण वस्त्र / दक्षिण यात्रा',
    isShubha: false,
    category: 'अशुभ (Inauspicious)',
    scripturalRef: 'चरक संहिता',
    interpretation: 'शनि व वात दोष का प्रभाव, कार्यों में विलम्ब एवं मानसिक तनाव।',
    remedy: 'हनुमान चालीसा का ७ बार पाठ करें तथा निर्धनों को भोजन व केले दान करें।'
  },
  {
    id: 10,
    motif: 'आकाश में निर्बाध उड़ना अथवा सूर्य-चन्द्रमा का स्पर्श',
    sanskrit: 'आकाश गमन / सूर्य स्पर्श',
    isShubha: true,
    category: 'दिव्य सिद्धिदायक (Divine)',
    scripturalRef: 'अग्नि पुराण १४.१५',
    interpretation: 'सर्वोच्च आत्म-साक्षात्कार, बन्धनों से मुक्ति तथा लोक-ख्याति की प्राप्ति।',
    remedy: 'भगवान् विष्णु को श्वेत चन्दन अर्पित करें तथा २० मिनट मौन ध्यान करें।'
  }
];

export function analyzeDream(keyword = '', praharNumber = 4) {
  const prahar = DREAM_PRAHARS.find(p => p.praharNumber === Number(praharNumber)) || DREAM_PRAHARS[3];
  
  const searchLower = keyword.toLowerCase().trim();
  const matchedMotif = DREAM_MOTIFS.find(m => 
    m.motif.toLowerCase().includes(searchLower) ||
    m.sanskrit.includes(searchLower) ||
    searchLower.includes(m.motif.split(' ')[0]) ||
    searchLower.includes(m.sanskrit.split('/')[0])
  ) || DREAM_MOTIFS[0];

  return {
    matchedMotif,
    isShubha: matchedMotif.isShubha,
    praharHorizon: prahar.fulfillmentHorizon,
    praharName: prahar.name,
    interpretation: matchedMotif.interpretation,
    remedy: matchedMotif.remedy
  };
}
