// 16-Zone Vastu Purusha Mandala Calculation Engine (१६-कोणीय वास्तु पुरुष मण्डल)
// Computes 22.5° Angular Sectors from Brahmasthan with Elemental Balancing and Non-Destructive Remedies in Shuddh Hindi

export const VASTU_ZONES_16 = [
  { code: 'N', name: 'उत्तर दिशा (North)', angle: 0, range: '३४८.७५° - ११.२५°', element: 'जल तत्व (Water)', deity: 'कुबेर देव', domain: 'धन प्रवाह, नवीन अवसर व समृद्धि', ideal: 'मुख्य प्रवेश द्वार, तिजोरी, बैठक', avoid: 'शौचालय, भारी भण्डार, लाल रंग', remedy: 'हरे मार्बल की पट्टी अथवा पीतल का स्वस्तिक स्थापित करें।' },
  { code: 'NNE', name: 'उत्तर-उत्तर-पूर्व (NNE)', angle: 22.5, range: '११.२५° - ३३.७५°', element: 'जल तत्व (Water)', deity: 'भगवान् धन्वन्तरि', domain: 'आरोग्य, स्वास्थ्य व रोगमुक्ति', ideal: 'औषधि भण्डारण, चिकित्सा कक्ष', avoid: 'कचरा पात्र, सेप्टिक टैंक', remedy: 'धन्वन्तरि यन्त्र एवं तांबे के लोटे में गंगाजल स्थापित करें।' },
  { code: 'NE', name: 'ईशान्य कोण (NE)', angle: 45, range: '३३.७५° - ५६.२५°', element: 'जल तत्व (Water)', deity: 'भगवान् शिव / ईशान', domain: 'आध्यात्मिक चेतना, विवेक व स्पष्टता', ideal: 'पूजा घर, ध्यान कक्ष, खुला आँगन', avoid: 'रसोई, शौचालय, भारी अलमारी', remedy: 'शुद्ध समुद्री नमक का कटोरा रखें एवं पीतल की धातु पट्टी लगाएं।' },
  { code: 'ENE', name: 'पूर्व-उत्तर-पूर्व (ENE)', angle: 67.5, range: '५६.२५° - ७८.७५°', element: 'वायु तत्व (Air)', deity: 'जयन्त देव', domain: 'आनन्द, पारिवारिक सुख व स्फूर्ति', ideal: 'पारिवारिक लाउंज, मनोरंजन कक्ष', avoid: 'भारी लौह तिजोरी, कबाड़', remedy: 'हरे पौधे और स्फटिक श्रीयन्त्र स्थापित करें।' },
  { code: 'E', name: 'पूर्व दिशा (East)', angle: 90, range: '७८.७५° - १०१.२५°', element: 'वायु तत्व (Air)', deity: 'भगवान् सूर्यनारायण', domain: 'सामाजिक सम्बन्ध, प्रतिष्ठा व यश', ideal: 'मुख्य द्वार, बालकनी, अध्ययन', avoid: 'शौचालय, बन्द अन्धेरी दीवारें', remedy: 'ताम्र सूर्य देव का प्रतीक पूर्व दीवार पर स्थापित करें।' },
  { code: 'ESE', name: 'पूर्व-दक्षिण-पूर्व (ESE)', angle: 112.5, range: '१०१.२५° - १२३.७५°', element: 'अग्नि तत्व (Fire)', deity: 'मातङ्ग देव', domain: 'मन्थन, विश्लेषण व निर्णय क्षमता', ideal: 'अध्ययन कक्ष, विचार-विमर्श डेस्क', avoid: 'मुख्य शयन कक्ष (अति-चिन्तन कारक)', remedy: 'पीली धातु पट्टी फर्श पर लगाएं।' },
  { code: 'SE', name: 'आग्नेय कोण (SE)', angle: 135, range: '१२३.७५° - १४६.२५°', element: 'अग्नि तत्व (Fire)', deity: 'अग्नि देव', domain: 'नकदी धन प्रवाह, तेज व पराक्रम', ideal: 'रसोई घर (गैस चूल्हा), विद्युत मीटर', avoid: 'भूमिगत जल टैंक, नीला रंग, बोरिंग', remedy: 'शुद्ध ताम्बे की ३ मिमी धातु पट्टी फर्श में लगाएं एवं पीला बल्ब जलाएं।' },
  { code: 'SSE', name: 'दक्षिण-दक्षिण-पूर्व (SSE)', angle: 157.5, range: '१४६.२५° - १६८.७५°', element: 'अग्नि तत्व (Fire)', deity: 'गन्धर्व', domain: 'शारीरिक शक्ति, आत्मबल व ऊर्जा', ideal: 'व्यायाम कक्ष, डाइनिंग टेबल', avoid: 'गड्ढे व भूमिगत जल', remedy: 'लाल पिरामिड अथवा मंगल यन्त्र लगाएं।' },
  { code: 'S', name: 'दक्षिण दिशा (South)', angle: 180, range: '१६८.७५° - १९१.२५°', element: 'अग्नि / पृथ्वी', deity: 'धर्मराज यम', domain: 'विश्राम, ख्याति व मानसिक शान्ति', ideal: 'शयन कक्ष, विश्राम लाउंज', avoid: 'जल निकास, मुख्य द्वार बिना उपाय', remedy: 'लाल या नारंगी रंग की पट्टी का प्रयोग करें।' },
  { code: 'SSW', name: 'दक्षिण-दक्षिण-पश्चिम (SSW)', angle: 202.5, range: '१९१.२५° - २१३.७५°', element: 'पृथ्वी तत्व (Earth)', deity: 'भृङ्गराज', domain: 'विसर्जन (Disposal) एवं व्यय मुक्ति', ideal: 'शौचालय, कचरा विसर्जन स्थान', avoid: 'पूजा मन्दिर, तिजोरी, मुख्य बिस्तर', remedy: 'पीले रंग की पट्टी शौचालय के चारों ओर लगाएं।' },
  { code: 'SW', name: 'नैऋत्य कोण (SW)', angle: 225, range: '२१३.७५° - २३६.२५°', element: 'पृथ्वी तत्व (Earth)', deity: 'पितृ देव / निरृति', domain: 'स्थिरता, पारिवारिक मुखिया अधिकार व सम्बन्ध', ideal: 'मास्टर बेडरूम, भारी तिजोरी, भारी निर्माण', avoid: 'जल तत्व, मुख्य द्वार, गड्ढे', remedy: '१ इंच पीतल पट्टी देहरी पर लगाएं तथा सीसा (Lead) हेलिक्स पिरामिड लगाएं।' },
  { code: 'WSW', name: 'पश्चिम-दक्षिण-पश्चिम (WSW)', angle: 247.5, range: '२३६.२५° - २५८.७५°', element: 'आकाश तत्व (Space)', deity: 'दौवारिक', domain: 'विद्या, ज्ञानार्जन व एकाग्रता', ideal: 'बच्चों का अध्ययन कक्ष, पुस्तकालय', avoid: 'शौचालय, लाल रंग', remedy: 'सफेद मार्बल अथवा पीतल का पेन-स्टैण्ड रखें।' },
  { code: 'W', name: 'पश्चिम दिशा (West)', angle: 270, range: '२५८.७५° - २८१.२५°', element: 'आकाश तत्व (Space)', deity: 'वरुण देव', domain: 'प्राप्ति, व्यापारिक लाभ व मनोकामना पूर्ति', ideal: 'भोजन कक्ष, लाभ भण्डार, तिजोरी', avoid: 'भूमिगत पानी की टंकी, खुला चूल्हा', remedy: 'सफेद या सुनहरी धातु पट्टी लगाएं।' },
  { code: 'WNW', name: 'पश्चिम-उत्तर-पश्चिम (WNW)', angle: 292.5, range: '२८१.२५° - ३०३.७५°', element: 'आकाश / वायु', deity: 'रोग देव', domain: 'अवसाद मुक्ति व मानसिक डिटॉक्स', ideal: 'अतिथि स्नानागार', avoid: 'पूजा घर, मुख्य शयन कक्ष', remedy: 'नीले रंग की पट्टी अथवा जल पात्र रखें।' },
  { code: 'NW', name: 'वायव्य कोण (NW)', angle: 315, range: '३०३.७५° - ३२६.२५°', element: 'वायु तत्व (Air)', deity: 'वायु देव', domain: 'सहायता, बैंकिंग सम्बन्ध व अतिथि सत्कार', ideal: 'अतिथि कक्ष, बैंक दस्तावेज, तैयार माल', avoid: 'मास्टर बेडरूम, रसोई', remedy: 'चांदी का चन्द्र यन्त्र अथवा सफेद श्वेतार्क गणपति लगाएं।' },
  { code: 'NNW', name: 'उत्तर-उत्तर-पश्चिम (NNW)', angle: 337.5, range: '३२६.२५° - ३४८.७५°', element: 'जल तत्व (Water)', deity: 'सोम देव', domain: 'आकर्षण, वैवाहिक सौहार्द्र व स्नेह', ideal: 'दम्पति शयन कक्ष, श्रृंगार कक्ष', avoid: 'कबाड़, खुला चूल्हा', remedy: 'सुगन्धित श्वेत पुष्प व चांदी का स्वस्तिक रखें।' }
];

export const VASTU_ZONES = VASTU_ZONES_16;

export function evaluateRoomPlacement(roomType, zoneCode) {
  const zone = VASTU_ZONES_16.find(z => z.code === zoneCode) || VASTU_ZONES_16[0];

  const rules = {
    pujaRoom: {
      idealZones: ['NE', 'N', 'E'],
      badZones: ['SW', 'SE', 'SSW', 'S'],
      optimalScore: 98,
      advice: 'पूजा घर हेतु ईशान्य (NE), उत्तर (N) अथवा पूर्व (E) दिशा सर्वथा श्रेष्ठ एवं आध्यात्मिक ऊर्जा संवाहक है।'
    },
    kitchen: {
      idealZones: ['SE', 'SSE', 'NW'],
      badZones: ['NE', 'N', 'SW'],
      optimalScore: 95,
      advice: 'रसोई घर हेतु आग्नेय (SE) कोण अग्नि तत्व का प्राकृतिक स्थान है।'
    },
    masterBed: {
      idealZones: ['SW', 'S', 'W'],
      badZones: ['NE', 'SE', 'SSW'],
      optimalScore: 95,
      advice: 'गृहस्वामी का मुख्य शयन कक्ष नैऋत्य (SW) कोण में होना स्थिरता एवं सुख प्रदान करता है।'
    },
    studyRoom: {
      idealZones: ['WSW', 'E', 'NE'],
      badZones: ['SE', 'SSW', 'S'],
      optimalScore: 92,
      advice: 'विद्यार्थियों का अध्ययन कक्ष पश्चिम-दक्षिण-पश्चिम (WSW) अथवा पूर्व में एकाग्रता बढ़ाता है।'
    },
    toilet: {
      idealZones: ['SSW', 'WSW', 'WNW'],
      badZones: ['NE', 'N', 'SE', 'SW'],
      optimalScore: 90,
      advice: 'शौचालय विसर्जन क्षेत्र (SSW / WNW) में होना चाहिए। ईशान्य में शौचालय महादोष कारक है।'
    },
    mainDoor: {
      idealZones: ['N', 'E', 'NE'],
      badZones: ['SW', 'SE', 'S'],
      optimalScore: 96,
      advice: 'मुख्य प्रवेश द्वार उत्तर, पूर्व अथवा ईशान्य में होने से निरन्तर शुभ अवसरों की प्राप्ति होती है।'
    }
  };

  const rule = rules[roomType] || rules.pujaRoom;
  let score = 50;
  let verdict = 'मध्यम सन्तुलन (साधारण स्थिति)';

  if (rule.idealZones.includes(zoneCode)) {
    score = rule.optimalScore;
    verdict = 'उत्तम वास्तु सन्तुलन (अत्यन्त शुभ एवं फलदायी)';
  } else if (rule.badZones.includes(zoneCode)) {
    score = 25;
    verdict = 'गम्भीर वास्तु दोष (अ-विनाशक उपाय अनिवार्य)';
  }

  return {
    score,
    verdict,
    advice: rule.advice,
    remedy: zone.remedy
  };
}
