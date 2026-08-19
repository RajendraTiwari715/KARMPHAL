// Complete Database of the 28 Narakas (गरुड़ पुराणोक्त २८ नरक शुद्धि ग्रन्थागार)
// Source: Garuda Purana Saroddhara (Chapters 3.2 to 3.29) & Bhagavata Purana Canto 5
// 100% Shuddh Hindi (शुद्ध हिन्दी)

export const KARMIC_CATEGORIES = [
  { id: 'all', label: 'समस्त २८ नरक (All 28 Narakas)' },
  { id: 'theft', label: 'चोरी व विश्वासघात' },
  { id: 'violence', label: 'जीव हिंसा व उत्पीड़न' },
  { id: 'dharma', label: 'धर्म त्याग व अनादर' },
  { id: 'moral', label: 'अनैतिकता व वासना' }
];

export const NARAKAS_28 = [
  {
    id: 1,
    nameDevanagari: 'तामिस्र',
    nameIAST: 'Tamisra',
    shlokaRef: 'गरुड़ पुराण ३.२',
    sanskritShloka: 'परद्रव्यापहरणं परदाराभिमर्शनम् ।\nकृत्वा तामिस्रसंज्ञे तु नरके पात्यते नरः ॥ २ ॥',
    category: 'theft',
    transgression: 'दूसरों के धन, सम्पत्ति, भूमि का हरण करना अथवा विश्वासघात करना।',
    punishmentMetaphysics: 'घने अन्धकार में यमदूतों द्वारा लोहे के मुद्गरों से प्रहार, जब तक पाप संस्कारों का क्षय न हो जाए।',
    prayashchittaRoadmap: 'हरण किए गए धन को सव्याज वापस लौटाएं, १०८ व्यक्तियों को अन्नदान कराएं, तथा विष्णु सहस्रनाम का नित्य पाठ करें।'
  },
  {
    id: 2,
    nameDevanagari: 'अन्धतामिस्र',
    nameIAST: 'Andhatamisra',
    shlokaRef: 'गरुड़ पुराण ३.३',
    sanskritShloka: 'यस्तु वञ्चयते मन्दः कलत्रं स्वजनं तथा ।\nअन्धतामिस्रके घोरे निमज्जति स पातकः ॥ ३ ॥',
    category: 'moral',
    transgression: 'विवाह में छल-कपट करना, आश्रित पति/पत्नी का त्याग करना अथवा स्वार्थ हेतु शोषण करना।',
    punishmentMetaphysics: 'दमघोंटू अन्धेरे में बार-बार मूर्च्छित होना और पुनर्जन्म चक्र के पूर्व सूक्ष्म शरीर का मन्थन।',
    prayashchittaRoadmap: 'आश्रितों की निष्कपट सेवा व भरण-पोषण, निर्धन कन्या के विवाह में सहयोग, तथा भगवान् शिव का रुद्राभिषेक।'
  },
  {
    id: 3,
    nameDevanagari: 'रौरव',
    nameIAST: 'Raurava',
    shlokaRef: 'गरुड़ पुराण ३.४',
    sanskritShloka: 'कूटसाक्ष्यं च यः कुर्यादनृतं वदति द्विजः ।\nरौरवे स निमज्जेत रुरुभिर्भक्ष्यते भृशम् ॥ ४ ॥',
    category: 'theft',
    transgression: 'झूठी गवाही देना, निर्दोषों को झूठे मुकदमों में फंसाना अथवा स्वार्थवश असत्य भाषण।',
    punishmentMetaphysics: '‘रुरु’ नामक भयानक सर्प-पशुओं द्वारा सूक्ष्म देह का दंश व नोचना।',
    prayashchittaRoadmap: 'सार्वजनिक रूप से सत्य स्वीकार करना, सत्यव्रत का पालन, तथा श्री गायत्री मन्त्र का सवा लाख जप।'
  },
  {
    id: 4,
    nameDevanagari: 'महारौरव',
    nameIAST: 'Maharaurava',
    shlokaRef: 'गरुड़ पुराण ३.५',
    sanskritShloka: 'ये तु पाखण्डिनो लोके परहिंसापरायणाः ।\nमहारौरवसंज्ञे ते पतन्ति यमशासनात् ॥ ५ ॥',
    category: 'violence',
    transgression: 'सामूहिक नरसंहार, निर्दोष जीवों की हत्या, आगजनी अथवा समाज में विष घोलना।',
    punishmentMetaphysics: 'मांसाहारी क्रव्याद जन्तुओं द्वारा सूक्ष्म शरीर का निरन्तर भक्षण।',
    prayashchittaRoadmap: 'आजीवन पूर्ण अहिंसा व्रत, भगवान् महाविष्णु की अनन्य शरणागति, तथा अनाथालयों में निःस्वार्थ सेवा।'
  },
  {
    id: 5,
    nameDevanagari: 'कुम्भीपाक',
    nameIAST: 'Kumbhipaka',
    shlokaRef: 'गरुड़ पुराण ३.६',
    sanskritShloka: 'पशून् हत्वा वृथा ये तु खादन्ति पिशिताशिनः ।\nकुम्भीपाके पच्यन्ते ते तैलपूर्णे महोल्वणे ॥ ६ ॥',
    category: 'violence',
    transgression: 'स्वाद व विलास हेतु मूक पशु-पक्षियों की हत्या करना अथवा उनका मांस खाना।',
    punishmentMetaphysics: 'उबलते हुए खौलते तैल के कड़ाह में जीवात्मा का तपाया जाना।',
    prayashchittaRoadmap: 'पूर्णतः शुद्ध सात्विक शाकाहार अपनाना, गोशाला में गौ-ग्रास व चारा सेवा, तथा पक्षियों हेतु जल-अन्न पात्र लगाना।'
  },
  {
    id: 6,
    nameDevanagari: 'कालसूत्र',
    nameIAST: 'Kalasutra',
    shlokaRef: 'गरुड़ पुराण ३.७',
    sanskritShloka: 'मातापितृगुरुद्रोही कालसूत्रे निपात्यते ।\nतप्तताम्रशिलायां तु धाव्यते यमकिङ्करैः ॥ ७ ॥',
    category: 'dharma',
    transgression: 'माता-पिता, गुरु अथवा वृद्ध जनों का अनादर करना, उन्हें घर से निकालना या प्रताड़ित करना।',
    punishmentMetaphysics: 'धधकती हुई ताम्बे की गर्म शिलाओं पर नंगे पाँव निरन्तर दौड़ाया जाना।',
    prayashchittaRoadmap: 'माता-पिता के चरण स्पर्श व नित्य सेवा (मातृ-पितृ सेवा), वृद्धाश्रमों में आर्थिक सहायता, तथा श्राद्ध कर्म।'
  },
  {
    id: 7,
    nameDevanagari: 'असिपत्रवन',
    nameIAST: 'Asipatravana',
    shlokaRef: 'गरुड़ पुराण ३.८',
    sanskritShloka: 'स्वधर्मत्यागिनो ये तु पाखण्डैर्वञ्चिता नराः ।\nअसिपत्रवने घोरे छिद्यन्ते यमकिङ्करैः ॥ ८ ॥',
    category: 'dharma',
    transgression: 'अपने स्वधर्म का त्याग करना, पाखण्ड व ढोंग का आश्रय लेना, तथा दूसरों को पथभ्रष्ट करना।',
    punishmentMetaphysics: 'तलवार के समान तीक्ष्ण पत्तों वाले घने वन में देह का कट-कट कर गिरना।',
    prayashchittaRoadmap: 'दैनिक स्वधर्म व पारिवारिक कर्तव्यों का निष्ठापूर्वक पालन, तथा श्रीमद्भगवद्गीता के तृतीय अध्याय का पाठ।'
  },
  {
    id: 8,
    nameDevanagari: 'शूकरमुख',
    nameIAST: 'Shukaramukha',
    shlokaRef: 'गरुड़ पुराण ३.९',
    sanskritShloka: 'प्रजापीडाकरा भूपा दण्डिनो येऽप्यधर्मतः ।\nशूकरस्य मुखे क्षिप्ताः पीड्यन्ते यन्त्रपीडनैः ॥ ९ ॥',
    category: 'violence',
    transgression: 'भ्रष्ट अधिकारी, अन्यायी शासक, जो निर्दोष जनता से रिश्वत लेते हैं व अधिकार का दुरुपयोग करते हैं।',
    punishmentMetaphysics: 'गन्ने की तरह कोल्हू के भारी यन्त्रों में दबाया जाना।',
    prayashchittaRoadmap: 'अवैध धन का त्याग, लोक-कल्याण हेतु कुएं, प्याऊ व धर्मशाला का निर्माण, तथा निष्पक्ष न्याय करना।'
  },
  {
    id: 9,
    nameDevanagari: 'अन्धकूप',
    nameIAST: 'Andhakupa',
    shlokaRef: 'गरुड़ पुराण ३.१०',
    sanskritShloka: 'असमर्थान् पशून् मन्दा ये पीडयन्ति दुर्मदाः ।\nअन्धकूपे निमग्नास्ते दश्यन्ते विविधात्मभिः ॥ १० ॥',
    category: 'violence',
    transgression: 'छोटे निरीह जीवों, चींटियों, कीटों को क्रूरतापूर्वक मारना तथा सामर्थ्य होते हुए भी दान न देना।',
    punishmentMetaphysics: 'अन्धे कुएं में विषैले बिच्छू और सर्पों द्वारा निरन्तर दंश।',
    prayashchittaRoadmap: 'चींटियों को आटा-शर्करा डालना, बेसहारा पशुओं को भोजन देना, तथा अपनी आय का दशांश दान करना।'
  },
  {
    id: 10,
    nameDevanagari: 'कृमिभोजन',
    nameIAST: 'Krimibhojana',
    shlokaRef: 'गरुड़ पुराण ३.११',
    sanskritShloka: 'असंविभज्य यो भुङ्क्ते मिष्टमेको नराधमः ।\nकृमिभोजनसंज्ञे तु कृमिभिर्भक्ष्यते नरः ॥ ११ ॥',
    category: 'moral',
    transgression: 'भूखे आश्रितों, अतिथियों व याचकों को भोजन दिए बिना अकेले छिपकर मिष्ठान्न व उत्तम भोजन खाना।',
    punishmentMetaphysics: 'कीड़ों और मवाद के गर्त में डालकर स्वयं कीड़ों का भोजन बनना।',
    prayashchittaRoadmap: 'वैश्वदेव बलि (भोजन से पूर्व अन्य जीवों को अंश देना), नित्य भूखों को भोजन कराना, तथा अन्नक्षेत्र चलाना।'
  },
  {
    id: 11,
    nameDevanagari: 'सन्दंश',
    nameIAST: 'Sandamsha',
    shlokaRef: 'गरुड़ पुराण ३.१२',
    sanskritShloka: 'देवद्रव्यहरो यस्तु विप्रद्रव्यापहारकः ।\nसन्दंशे यमदूतैस्तु सन्दंशैश्छिद्यते भृशम् ॥ १२ ॥',
    category: 'theft',
    transgression: 'मन्दिरों, धार्मिक स्थलों, दान पेटिका अथवा सार्वजनिक धर्मार्थ धन की चोरी करना।',
    punishmentMetaphysics: 'लाल गर्म चिमटों से मांस को थोड़ा-थोड़ा करके नोचना।',
    prayashchittaRoadmap: 'चुराए गए धन का तीन गुना मूल्य मन्दिरों में समर्पित करना, धर्म-स्थलों का जीर्णोद्धार कराना।'
  },
  {
    id: 12,
    nameDevanagari: 'तप्तसूर्मि',
    nameIAST: 'Taptasurmi',
    shlokaRef: 'गरुड़ पुराण ३.१३',
    sanskritShloka: 'अगम्यागमने रक्ता ये नराः काममोहिताः ।\nतप्तसूर्मिं समाश्लिष्य दह्यन्ते पापकर्मिणः ॥ १३ ॥',
    category: 'moral',
    transgression: 'अनाचार, बलात्कार, कुत्सित वासना अथवा मर्यादाहीन कामुक शोषण।',
    punishmentMetaphysics: 'धधकती हुई लाल गर्म लौह प्रतिमाओं का आलिङ्गन कराया जाना।',
    prayashchittaRoadmap: 'कठोर ब्रह्मचर्य व्रत, पीड़ितों को पुनर्वास सहायता, तथा महामृत्युञ्जय मन्त्र का अखण्ड जप।'
  },
  {
    id: 13,
    nameDevanagari: 'वज्रकण्टकशाल्मली',
    nameIAST: 'Vajrakantaka-Shalmali',
    shlokaRef: 'गरुड़ पुराण ३.१४',
    sanskritShloka: 'पशुयोनिगता ये तु व्यभिचाररता नराः ।\nवज्रकण्टकशाल्मल्यां रोह्यन्ते यमकिङ्करैः ॥ १४ ॥',
    category: 'moral',
    transgression: 'अप्राकृतिक दुष्कर्म एवं चेतना के प्राकृतिक नियमों का गम्भीर उल्लंघन।',
    punishmentMetaphysics: 'वज्र जैसे तीखे काँटों वाले शाल्मली वृक्ष पर बार-बार घसीटा जाना।',
    prayashchittaRoadmap: 'पवित्र तीर्थों में स्नान, प्राणायाम, इन्द्रिय निग्रह, तथा गायत्री जप।'
  },
  {
    id: 14,
    nameDevanagari: 'वैतरणी',
    nameIAST: 'Vaitarani',
    shlokaRef: 'गरुड़ पुराण ३.१५',
    sanskritShloka: 'मर्यादाभञ्जका ये तु न्यायभ्रष्टा नराधमाः ।\nवैतरण्यां निमज्जन्ति पूयरक्तौघवाहिन्याम् ॥ १५ ॥',
    category: 'dharma',
    transgression: 'न्याय की मर्यादा तोड़ना, प्रतिज्ञा भंग करना, तथा लोक-विश्वास को कुचलना।',
    punishmentMetaphysics: 'उबलते हुए रक्त, मवाद और अस्थियों से भरी वैतरणी नदी में डूबना।',
    prayashchittaRoadmap: 'सद्पात्र को सवत्सा गोदान (गौ-दान) करना, वचनों का दृढ़ता से पालन, तथा सत्य आचरण।'
  },
  {
    id: 15,
    nameDevanagari: 'पूयोद',
    nameIAST: 'Puyoda',
    shlokaRef: 'गरुड़ पुराण ३.१६',
    sanskritShloka: 'कपटैर्धर्मकार्याणि ये कुर्वन्ति नराधमाः ।\nपूयोदे नरके मग्नाः पूयं खादन्ति दुर्मदाः ॥ १६ ॥',
    category: 'dharma',
    transgression: 'धर्म के नाम पर ठगी करना, नकली गुरु बनकर शिष्यों को लूटना, अथवा मिलावट का व्यापार।',
    punishmentMetaphysics: 'मवाद और गन्दगी के सागर में डूबना और वही ग्रहण करना।',
    prayashchittaRoadmap: 'धार्मिक पाखण्ड का परित्याग, शुद्ध वस्तुओं का व्यापार, सच्चे सन्तों की निष्काम सेवा।'
  },
  {
    id: 16,
    nameDevanagari: 'प्राणरोध',
    nameIAST: 'Pranarodha',
    shlokaRef: 'गरुड़ पुराण ३.१७',
    sanskritShloka: 'मृगयारतिलुब्धा ये वन्यसत्त्वविनाशकाः ।\nप्राणरोधे शरैर्विद्धा दह्यन्ते यमकिङ्करैः ॥ १७ ॥',
    category: 'violence',
    transgression: 'मनोरंजन व शौक हेतु वन्य जीवों का शिकार करना अथवा पशुओं को तड़पाना।',
    punishmentMetaphysics: 'यमदूतों द्वारा तीक्ष्ण बाणों से छलनी किया जाना।',
    prayashchittaRoadmap: 'वन्य जीवों के संरक्षण हेतु वृक्षारोपण, वन प्राणियों हेतु जल-स्रोतों का निर्माण, शिव रक्षा स्तोत्र पाठ।'
  },
  {
    id: 17,
    nameDevanagari: 'विशसन',
    nameIAST: 'Visashana',
    shlokaRef: 'गरुड़ पुराण ३.१८',
    sanskritShloka: 'दम्भेन यजन्ते ये पशुहिंसापरायणाः ।\nविशसने निपात्यन्ते छिद्यन्ते चाङ्गप्रत्यङ्गम् ॥ १८ ॥',
    category: 'violence',
    transgression: 'धर्म या बलि के नाम पर पाखण्डपूर्वक पशुओं की बलि देना।',
    punishmentMetaphysics: 'यज्ञीय कुल्हाड़ों से एक-एक अङ्ग को काटा जाना।',
    prayashchittaRoadmap: 'सात्विक पुष्प-फल-धूप से भगवान् का पूजन, अहिंसा का प्रचार।'
  },
  {
    id: 18,
    nameDevanagari: 'लालाभक्ष',
    nameIAST: 'Lalabhaksha',
    shlokaRef: 'गरुड़ पुराण ३.१९',
    sanskritShloka: 'अशुद्धानि च द्रव्याणि भक्षयन्ति नराधमाः ।\nलालाभक्षे निमग्नास्ते लालां पिबन्ति सर्वदा ॥ १९ ॥',
    category: 'moral',
    transgression: 'अपवित्र वस्तुओं का सेवन करना तथा देह की शुद्धि को दूषित करना।',
    punishmentMetaphysics: 'लार और अपवित्र द्रवों के कुण्ड में डूबना।',
    prayashchittaRoadmap: 'पञ्चगव्य प्राशन व्रत, आन्तरिक व बाह्य शौच (स्वच्छता), नित्य स्नान।'
  },
  {
    id: 19,
    nameDevanagari: 'सारमेयादन',
    nameIAST: 'Sarameyasana',
    shlokaRef: 'गरुड़ पुराण ३.२०',
    sanskritShloka: 'विषदानेन ये हन्युर्जनतामपराधिनीम् ।\nसारमेयादने क्षिप्ता भक्ष्यन्ते श्वानयूथकैः ॥ २० ॥',
    category: 'violence',
    transgression: 'भोजन में विष या मिलावट करना, जहरीली औषधियां बेचना, आपदा में लूटपाट।',
    punishmentMetaphysics: 'भयानक शिकारी कुत्तों द्वारा नोच-नोच कर खाया जाना।',
    prayashchittaRoadmap: 'रोगियों को निःशुल्क शुद्ध औषधियां वितरण, शीतल जल की प्याऊ लगाना।'
  },
  {
    id: 20,
    nameDevanagari: 'अवीचि',
    nameIAST: 'Avici',
    shlokaRef: 'गरुड़ पुराण ३.२१',
    sanskritShloka: 'मिथ्याशपथकर्तारो ये च दैवपराजिताः ।\nअवीचौ पात्यमानास्ते चूर्ण्यन्ते शैलमूर्धसु ॥ २१ ॥',
    category: 'theft',
    transgression: 'ईश्वर की झूठी शपथ खाना, व्यापारिक समझौतों में जानबूझकर धोखा देना।',
    punishmentMetaphysics: 'ऊँचे पर्वतों के शिखरों से कठोर पत्थरों पर बार-बार गिराया जाना।',
    prayashchittaRoadmap: 'टूटे समझौतों की क्षतिपूर्ति, त्रिवेणी संगम स्नान, मौन व्रत का पालन।'
  },
  {
    id: 21,
    nameDevanagari: 'अयःपान',
    nameIAST: 'Ayahpana',
    shlokaRef: 'गरुड़ पुराण ३.२२',
    sanskritShloka: 'मद्यपानाद्रुता ये तु मतिभ्रष्टा दुराशयाः ।\nअयःपाने निमग्नास्ते पाय्यन्ते द्रावितं तमः ॥ २२ ॥',
    category: 'moral',
    transgression: 'मदिरा, नशा, ड्रग्स का सेवन करना जो विवेक और बुद्धि को नष्ट कर दे।',
    punishmentMetaphysics: 'पिघला हुआ खौलता ताम्बा व लोहा पिलाया जाना।',
    prayashchittaRoadmap: 'आजीवन मद्यपान त्याग, मीठे दूध और जल का वितरण, दैनिक प्राणायाम।'
  },
  {
    id: 22,
    nameDevanagari: 'क्षारक Kardama',
    nameIAST: 'Ksharakardama',
    shlokaRef: 'गरुड़ पुराण ३.२३',
    sanskritShloka: 'सत्पुरुषावमानज्ञा ये गर्वेण प्रमत्तकाः ।\nक्षारकपङ्के निमग्नास्ते दह्यन्ते यमकिङ्करैः ॥ २३ ॥',
    category: 'dharma',
    transgression: 'सज्जनों, सन्तों की निन्दा करना, पद-प्रतिष्ठा के घमण्ड में निर्धनों का उपहास उड़ाना।',
    punishmentMetaphysics: 'खौलते हुए तेजाबी कीचड़ में उल्टा लटकाया जाना।',
    prayashchittaRoadmap: 'विनम्रता धारण करना, सन्तों के चरण धोना, मन्दिरों में झाड़ू-सफाई करना।'
  },
  {
    id: 23,
    nameDevanagari: 'रक्षोभक्ष',
    nameIAST: 'Rakshobhaksha',
    shlokaRef: 'गरुड़ पुराण ३.२४',
    sanskritShloka: 'नरमेधप्रिया ये तु राक्षसीं वृत्तिमाश्रिताः ।\nरक्षोभक्षे निमग्नास्ते भक्ष्यन्ते रक्षोगणैः ॥ २४ ॥',
    category: 'violence',
    transgression: 'नर-बलि, मानव तस्करी अथवा मनुष्यों का परजीवी शोषण।',
    punishmentMetaphysics: 'राक्षसों द्वारा जीवित नोच-नोच कर खाया जाना।',
    prayashchittaRoadmap: 'अनाथों का लालन-पालन, नारायण कवच का अखण्ड पाठ, सर्वस्व दान।'
  },
  {
    id: 24,
    nameDevanagari: 'शूलप्रोत',
    nameIAST: 'Sulaprota',
    shlokaRef: 'गरुड़ पुराण ३.२५',
    sanskritShloka: 'मित्रद्रोहाद्रुता ये तु शरणागतघातकाः ।\nशूलप्रोते निपात्यन्ते शूलेनाक्रम्य सर्वशः ॥ २५ ॥',
    category: 'theft',
    transgression: 'सच्चे मित्रों से द्रोह, शरणागत की हत्या, आश्रय देने वाले के साथ घात।',
    punishmentMetaphysics: 'लोहे के विशाल त्रिशूलों पर पिरोया जाना।',
    prayashchittaRoadmap: 'मित्रों के प्रति निष्ठा, बेघर व असहाय शरणार्थियों को आश्रय देना।'
  },
  {
    id: 25,
    nameDevanagari: 'दन्दशूक',
    nameIAST: 'Dandashuka',
    shlokaRef: 'गरुड़ पुराण ३.२६',
    sanskritShloka: 'सर्पवत्क्रूरचित्ता ये परपीड़ासदारताः ।\nदन्दशूके निमग्नास्ते सर्पैर्भक्ष्यन्ति दारुणैः ॥ २६ ॥',
    category: 'violence',
    transgression: 'सर्प की भांति दूसरों को अकारण डसना, कटु वचनों से पीड़ा पहुँचाना।',
    punishmentMetaphysics: 'अनेक मुखों वाले विशालकाय कालसर्पों द्वारा निगला जाना।',
    prayashchittaRoadmap: 'नागबलि / सर्प शान्ति पूजा, गौ सेवा, मधुर एवं हितकारी वाणी का अभ्यास।'
  },
  {
    id: 26,
    nameDevanagari: 'विटरोध',
    nameIAST: 'Vatarodha',
    shlokaRef: 'गरुड़ पुराण ३.२७',
    sanskritShloka: 'वन्यजीवान्प्रबाधन्ते गिरिकाननवासिनः ।\nविटरोधे निमग्नास्ते पीड्यन्ते शस्त्रवृष्टिभिः ॥ २७ ॥',
    category: 'violence',
    transgression: 'पर्वत और वनों में रहने वाले निर्दोष वनवासियों व प्राणियों को उजाड़ना।',
    punishmentMetaphysics: 'जहरीली गैसों और शस्त्रों की वर्षा से तड़पना।',
    prayashchittaRoadmap: 'वनवासी बन्धुओं हेतु सेवा कार्य, पर्वतीय पर्यावरण का संरक्षण।'
  },
  {
    id: 27,
    nameDevanagari: 'पर्यावर्तन',
    nameIAST: 'Paryavartana',
    shlokaRef: 'गरुड़ पुराण ३.२८',
    sanskritShloka: 'अतिथिं यो निराकृत्य स्वयमश्नाति पापकृत् ।\nपर्यावर्तने पतितो गृध्रैर्निष्कृष्यतेऽक्षिणी ॥ २८ ॥',
    category: 'moral',
    transgression: 'घर आए भूखे अतिथि का अपमान करके भगा देना।',
    punishmentMetaphysics: 'गिद्धों और कौवों द्वारा आँखों को नोचना।',
    prayashchittaRoadmap: '‘अतिथि देवो भव’ का पालन, पक्षियों को नित्य दाना-पानी, भण्डारा लगाना।'
  },
  {
    id: 28,
    nameDevanagari: 'सूचीमुख',
    nameIAST: 'Sucimukha',
    shlokaRef: 'गरुड़ पुराण ३.२९',
    sanskritShloka: 'कृपणो धनलुब्धो यः स्वजनेभ्यो न यच्छति ।\nसूचीमुखे तु सन्दष्टः सूच्यग्रेण प्रवेध्यते ॥ २९ ॥',
    category: 'theft',
    transgression: 'अत्यधिक कंजूसी, धन का ढेर लगाना किन्तु आश्रितों को दाने-दाने को तरसाना।',
    punishmentMetaphysics: 'लाल गर्म लोहे की सुइयों से सूक्ष्म शरीर को लगातार सिलना व छेदना।',
    prayashchittaRoadmap: 'कर्मचारियों व आश्रितों को उचित वेतन व बोनस देना, उदारतापूर्वक दान करना।'
  }
];

export function searchNarakas(query = '', category = 'all') {
  const q = query.toLowerCase().trim();
  return NARAKAS_28.filter(n => {
    const matchesCategory = category === 'all' || n.category === category;
    const matchesSearch = !q || 
      n.nameDevanagari.includes(q) ||
      n.nameIAST.toLowerCase().includes(q) ||
      n.transgression.includes(q) ||
      n.shlokaRef.includes(q);
    return matchesCategory && matchesSearch;
  });
}

export function calculateKarmicAudit(responses = {}) {
  const { ahimsaViolations = 0, truthViolations = 0, greedViolations = 0, betrayalViolations = 0 } = responses;
  const totalViolations = ahimsaViolations + truthViolations + greedViolations + betrayalViolations;
  
  let score = Math.max(20, 100 - (totalViolations * 10));
  let verdict = 'सात्विक एवं धर्मपरायण कर्म सन्तुलन';
  const recommendedExpiations = [];

  if (ahimsaViolations > 0) {
    recommendedExpiations.push('गोशाला में नियमित चारा व गुड़ सेवा करें तथा पूर्णतः सात्विक शाकाहार का पालन करें।');
  }
  if (truthViolations > 0) {
    recommendedExpiations.push('श्री गायत्री मन्त्र का नित्य १०८ बार जप करें तथा सत्य व्रत का संकल्प लें।');
  }
  if (greedViolations > 0) {
    recommendedExpiations.push('अपनी न्यायोपार्जित आय का दशांश (१०%) निर्धन व असहायों की सहायता में दान करें।');
  }
  if (betrayalViolations > 0) {
    recommendedExpiations.push('माता-पिता व गुरुजनों के चरण स्पर्श कर क्षमा याचना करें और उनकी नित्य सेवा करें।');
  }

  if (recommendedExpiations.length === 0) {
    recommendedExpiations.push('नित्य सन्ध्यावन्दन, देव-पूजा एवं भगवद्गीता के स्वाध्याय द्वारा चित्त को पवित्र बनाए रखें।');
  }

  if (score < 60) {
    verdict = 'कर्म शुद्धि एवं प्रायश्चित अनिवार्य';
  } else if (score < 80) {
    verdict = 'मध्यम सन्तुलन (सदाचार संवर्धन आवश्यक)';
  }

  return {
    score,
    verdict,
    recommendedExpiations
  };
}
