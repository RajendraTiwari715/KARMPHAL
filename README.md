# ॐ कर्मफल (Karmphal)

> **Vedic Ephemeris, Dharmik Sadhana, Astrological Insights & Sanatan Life-Management System**  
> प्रामाणिक वैदिक काल-गणना, सनातन शास्त्र सम्मत साधना एवं आध्यात्मिक जीवन प्रबन्धन

---

## 🏛️ वास्तुशिल्प एवं वास्तुकला (System Architecture)

Karmphal को एक आधुनिक, सुरक्षित और प्रदर्शन-उन्मुख (high-performance) त्रि-स्तरीय (three-tier) आर्किटेक्चर पर निर्मित किया गया है:

```mermaid
graph TD
    Client["📱 Mobile App (Capacitor Android) / 🌐 Web App (React 19 + Vite)"]
    
    subgraph "Frontend Services (karmphal-web)"
        Ephemeris["🪐 Ephemeris Engine (Drik Ganita / Solar Noon)"]
        Japa["📿 Digital Japa Mala (Anti-Cheat / Local State)"]
        PDF["📜 Sacred Scriptures Reader (pdf.js Local Canvas)"]
        ChatUI["🪔 Sanatan AI Acharya UI (Markdown Stream)"]
    end
    
    subgraph "Backend API (karmphal-backend)"
        Auth["🔐 Auth Service (JWT HS256 / Guest Sessions)"]
        UserRoutes["👤 User Profile & Punya Ledger (Zod Validation)"]
        ChatProxy["🤖 Gemini AI Acharya Proxy Route"]
        DB[("💾 SQLite Database (WAL Mode)")]
    end
    
    subgraph "External Providers"
        GeminiCloud["☁️ Google Gemini 2.5 Flash API"]
        ArchiveOrg["📚 Internet Archive (Verified Canonical Texts)"]
    end
    
    Client --> Ephemeris
    Client --> Japa
    Client --> PDF
    Client --> ChatUI
    
    ChatUI -->|Authenticated API| ChatProxy
    Client -->|Bearer JWT| Auth
    Auth --> UserRoutes
    UserRoutes --> DB
    ChatProxy --> DB
    ChatProxy -->|Server-side API Key| GeminiCloud
    PDF -->|Download/Cache| ArchiveOrg
```

---

## 📂 प्रोजेक्ट संरचना (Repository Structure)

```text
karmphal/
├── karmphal-web/                 # React 19 + Vite 8 फ्रंटएंड एवं कैपेसिटर ऍप
│   ├── src/
│   │   ├── assets/               # अनुकूलित WebP & AVIF छवियां (सभी < 100KB)
│   │   ├── components/           # UI घटक (Navbar, PDFReader, ProfileModal, JapaMala)
│   │   ├── context/              # पृथक React Contexts (Profile, Japa, Task, Chat, Toast)
│   │   ├── sections/             # मुख्य अनुभाग (Guru, Gyan, Sadhana, Jyotish, Karma)
│   │   └── services/             # खगोलीय गणना, ऑडियो, भाषा, एवं स्टोरेज सेवाएँ
│   ├── scripts/
│   │   ├── optimize-images.mjs   # Sharp आधारित इमेज ऑप्टिमाइज़ेशन पाइपलाइन
│   │   └── verify_library_books.mjs # शास्त्र लाइब्रेरी URL सत्यापन स्क्रिप्ट
│   ├── tests/                    # Vitest/Node आधारित परफॉरमेंस एवं यूनिट टेस्ट
│   └── android/                  # मूल Android Capacitor प्रोजेक्ट
│
├── karmphal-backend/             # Node.js + Express सिक्योर बैकएंड API
│   ├── routes/                   # Auth, User, AI Acharya एवं Sync रूट्स
│   ├── schemas/                  # Zod स्कीमा वेलिडेशन (Strict validation)
│   ├── middleware/               # JWT सत्यापन, रेट लिमिटिंग, हेलमेट
│   └── smoke.test.js             # बैकएंड ऑटोमेटेड स्मोक टेस्ट
│
├── assets-src/                   # मूल उच्च-रिज़ॉल्यूशन छवियां (बिल्ड से बाहर)
├── DEPLOYMENT.md                 # क्लाउड एवं एंड्रॉइड डिप्लॉयमेंट गाइड
└── README.md                     # सिस्टम आर्किटेक्चर एवं दस्तावेज़ीकरण
```

---

## 🛠️ मुख्य घटक एवं मॉड्यूल विवरण

### 1. `karmphal-web` (क्लाइंट एप्लिकेशन)
- **द्रिक-पञ्चाङ्ग व सौर गणना ([`ephemerisEngine.js`](file:///c:/Users/rajen/AndroidStudioProjects/karmphal/karmphal-web/src/services/ephemerisEngine.js))**:
  - उच्च-परिशुद्धता लहिरी अयनांश गणना।
  - वास्तविक अक्षांश/देशांतर आधारित सौर सूर्योदय, सूर्यास्त, ब्रह्म मुहूर्त, अभिजित मुहूर्त व राहु काल।
  - दिनांक स्तर पर मेमोइज़ेशन (`useMemo`), जिससे जप माला मनके चलाने पर 0 री-रेंडर्स होते हैं।
  - एकल 1-मिनट का टाइमर रेंडर पाथ से बाहर इन्ट्रा-डे समाप्ति समय की गणना करता है।
- **अक्षर-वेग रक्षक जप माला ([`DigitalJapaMala.jsx`](file:///c:/Users/rajen/AndroidStudioProjects/karmphal/karmphal-web/src/components/SadhanaGamification/DigitalJapaMala.jsx))**:
  - 108 मनकों का डिजिटल जप।
  - 250ms से तीव्र या रोबोटिक ऑटो-क्लिकर टैप्स को स्वतः अस्वीकार करने वाला एंटी-चीट इंजन।
  - स्थानीय `useState` काउंटर और 2-सेकंड का डीबाउंस्ड स्टोरेज परसिस्टेंस।
- **शास्त्र ई-पुस्तकालय ([`PDFReader.jsx`](file:///c:/Users/rajen/AndroidStudioProjects/karmphal/karmphal-web/src/components/PDFReader.jsx))**:
  - स्थानीय बंडल `pdfjs-dist` कैनवास रेंडरिंग (नो आईफ्रेम, नो वेबव्यू क्रैश)।
  - 3-ब्लॉब LRU कैशिंग एवं यूआरएल निष्कासन (Zero memory leak)।
- **संवाद आचार्य चैट ([`SanatanAIAcharya.jsx`](file:///c:/Users/rajen/AndroidStudioProjects/karmphal/karmphal-web/src/components/TheologicalChatbot/SanatanAIAcharya.jsx))**:
  - सुरक्षित बैकएंड प्रॉक्सी के माध्यम से जेमिनी AI से संवाद।
  - `react-markdown` + `remark-gfm` + `rehype-sanitize` द्वारा शुद्ध देवनागरी/संस्कृत रेंडरिंग।
  - सेशन एवं सर्वर-साइड डेटाबेस हिस्ट्री परसिस्टेंस।

### 2. `karmphal-backend` (सुरक्षित API सर्वर)
- **प्रमाणीकरण (Authentication)**:
  - बिना किसी बाहरी पासवर्ड निर्भरता के तात्कालिक गेस्ट सेशन एवं JWT टोकन जेनरेशन।
  - संपूर्ण रूट्स पर स्ट्रिक्ट बियरर टोकन सत्यापन।
- **डेटाबेस (SQLite WAL)**:
  - SQLite Write-Ahead Logging (WAL) मोड में उच्च-समवर्ती (high concurrency) रीड/राइट्स।
  - साधक प्रोफ़ाइल, नित्य पुण्य लेज़र, जप सांख्यिकी, और वार्तालाप इतिहास का संचयन।
- **AI प्रॉक्सी**:
  - `GEMINI_API_KEY` को सर्वर-साइड गुप्त रखा जाता है (क्लाइंट APK/Web में कभी एक्सपोज़ नहीं होता)।

### 3. निष्कासित सेवाएँ (Retired Components)
- **`aiEngine/aiEngine.py`**:
  - एक अप्रयुक्त स्टैंडअलोन FastAPI + PyTorch प्रोटोटाइप जिसे परियोजना से हटा दिया गया है।
  - यह अनुपलब्ध फ़ोल्डर (`scripture_knowledgebase/`) पर निर्भर था और किसी भी क्लाइंट या बैकएंड से सम्बद्ध नहीं था।
  - सनातन धर्म प्रश्नोत्तर अब Node.js बैकएंड और जेमिनी AI Acharya RAG पाइपलाइन द्वारा आधिकारिक रूप से संचालित होता है।

---

## 🚀 स्थानीय विकास (Local Development)

### आवश्यकताएं
- **Node.js**: v18.0.0 या उच्चतर
- **npm**: v9.0.0 या उच्चतर

### 1. निर्भरताएं स्थापित करें
```bash
# रूट फोल्डर में
npm install

# बैकएंड फोल्डर में
cd karmphal-backend
npm install
cd ..

# वेब फोल्डर में
cd karmphal-web
npm install
cd ..
```

### 2. विकास सर्वर चलाएं
```bash
# दोनों फ्रंटएंड और बैकएंड एक साथ चलाने हेतु:
npm run dev

# अथवा अलग-अलग टर्मिनलों में:
npm run dev:backend   # Express API on http://localhost:5000
npm run dev:web       # Vite Dev Server on http://localhost:5173
```

### 3. परीक्षण (Testing) एवं लिंटिंग (Linting)
```bash
# बैकएंड स्मोक टेस्ट:
npm test

# वेब यूनिट व परफॉरमेंस टेस्ट सूट:
cd karmphal-web
npm test

# कोड गुणवत्ता व लिंटर जांच:
npx oxlint
```

---

## 📱 मोबाइल बिल्ड (Capacitor Android)

उत्पादन वातावरण के लिए एंड्रॉइड एपीके (APK) अथवा बंडल (AAB) तैयार करने हेतु:

```bash
cd karmphal-web

# वेब बंडल तैयार करें
npm run build

# नेटिव एंड्रॉइड प्रोजेक्ट में सिंक करें
npx cap sync android

# एंड्रॉइड स्टूडियो में खोलें
npx cap open android
```

विस्तृत उत्पादन परिनियोजन (Production Deployment) निर्देशों के लिए [`DEPLOYMENT.md`](file:///c:/Users/rajen/AndroidStudioProjects/karmphal/DEPLOYMENT.md) देखें।