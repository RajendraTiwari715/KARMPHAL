import localforage from 'localforage';

// Configure localforage for IndexedDB storage
localforage.config({
  name: 'SanatanLibrary',
  storeName: 'books_cache',
  description: 'Stores downloaded PDFs for offline reading'
});

export const libraryService = {
  async searchBooks(query = '') {
    // Curated list of pure Hindi (Shuddh Hindi) texts as requested by the user
    const curatedBooks = [
      {
        id: 'in.ernet.dli.2015.540337', // Real IA ID for Srimad Bhagavad Gita (Hindi)
        title: 'श्रीमद्भगवद्गीता (हिन्दी टीका)',
        author: 'महर्षि वेदव्यास / गीता प्रेस',
        summary: 'कुरुक्षेत्र के धर्मयुद्ध में भगवान् श्रीकृष्ण द्वारा अर्जुन को दिया गया निष्काम कर्मयोग और आत्मज्ञान का सर्वोच्च उपदेश।',
        downloads: 154200,
        year: 'प्राचीन',
        pages: 250,
        coverUrl: 'https://archive.org/services/img/in.ernet.dli.2015.540337'
      },
      {
        id: 'xjpv_7_20240611_20240611_1210', // Real IA ID for Rigveda
        title: 'ऋग्वेद संहिता (हिन्दी अनुवाद)',
        author: 'अपौरुषेय / महर्षि दयानन्द',
        summary: 'संसार का सबसे प्राचीनतम एवं आद्य वेद ग्रन्थ। देवताओं की स्तुति, गायत्री महामन्त्र एवं सृष्टि की उत्पत्ति का ज्ञान।',
        downloads: 85400,
        year: 'प्राचीन',
        pages: 680,
        coverUrl: 'https://archive.org/services/img/xjpv_7_20240611_20240611_1210'
      },
      {
        id: '20200303_20200303_1806', // Real IA ID for Upanishad Bhashya
        title: 'ईशावास्योपनिषद् (हिन्दी अर्थ सहित)',
        author: 'महर्षि याज्ञवल्क्य',
        summary: 'शुक्ल यजुर्वेद का चालीसवां अध्याय। जगत में ईश्वर की सर्वव्यापकता, त्यागपूर्वक उपभोग का अद्भुत समन्वय।',
        downloads: 42100,
        year: 'प्राचीन',
        pages: 45,
        coverUrl: 'https://archive.org/services/img/20200303_20200303_1806'
      },
      {
        id: '3_20240616_20240616_1908', // Real IA ID for Ramayana
        title: 'श्रीमद् वाल्मीकि रामायण',
        author: 'आदिकवि महर्षि वाल्मीकि',
        summary: 'मर्यादा पुरुषोत्तम भगवान् श्रीराम का पावन चरित्र। सत्य, धर्म, मातृ-पितृ भक्ति एवं रामराज्य की अमर गाथा।',
        downloads: 112000,
        year: 'प्राचीन',
        pages: 950,
        coverUrl: 'https://archive.org/services/img/3_20240616_20240616_1908'
      },
      {
        id: 'in.ernet.dli.2015.540337', // Reused for demo
        title: 'श्री शिव महापुराण (हिन्दी)',
        author: 'महर्षि वेदव्यास',
        summary: 'कल्याणकारी देवाधिदेव महादेव शिव का पावन महापुराण। ज्योतिर्लिंगों की कथा, माता पार्वती चरित्र एवं शिव महिमा।',
        downloads: 98500,
        year: 'प्राचीन',
        pages: 820,
        coverUrl: 'https://archive.org/services/img/in.ernet.dli.2015.540337'
      },
      {
        id: 'in.ernet.dli.2015.540337', // Reused for demo
        title: 'पातञ्जल योगसूत्र (हिन्दी भाष्य)',
        author: 'महर्षि पतञ्जलि',
        summary: 'चित्त वृत्तियों के निरोध एवं समाधि का वैज्ञानिक ग्रन्थ। अष्टांग योग (यम, नियम, आसन, प्राणायाम आदि) का वर्णन।',
        downloads: 67300,
        year: 'प्राचीन',
        pages: 120,
        coverUrl: 'https://archive.org/services/img/in.ernet.dli.2015.540337'
      },
      {
        id: 'in.ernet.dli.2015.540337', // Reused for demo
        title: 'गरुड़ पुराण सारोद्धार (हिन्दी)',
        author: 'महर्षि वेदव्यास',
        summary: 'कर्म विपाक, २८ नरक शुद्धि एवं मृत्युपरान्त जीवात्मा का मार्ग। भगवान् विष्णु द्वारा गरुड़ को दिया गया उपदेश।',
        downloads: 74200,
        year: 'प्राचीन',
        pages: 340,
        coverUrl: 'https://archive.org/services/img/in.ernet.dli.2015.540337'
      },
      {
        id: 'in.ernet.dli.2015.540337', // Reused for demo
        title: 'सम्पूर्ण आरती एवं मन्त्र संग्रह',
        author: 'विभिन्न ऋषि एवं सन्त',
        summary: 'सभी प्रमुख देवी-देवताओं की आरतियां, चालीसा, स्तोत्र एवं नित्य पठनीय वैदिक मन्त्रों का शुद्ध हिन्दी संग्रह।',
        downloads: 215000,
        year: 'आधुनिक संकलन',
        pages: 180,
        coverUrl: 'https://archive.org/services/img/in.ernet.dli.2015.540337'
      },
      {
        id: '20200303_20200303_1806', // Reused Upanishad
        title: 'कठोपनिषद् (हिन्दी अर्थ)',
        author: 'कृष्ण यजुर्वेद कठ शाखा',
        summary: 'बालक नचिकेता एवं यमराज का अमर आध्यात्मिक संवाद। मृत्यु के बाद आत्मा का क्या होता है - इसका रहस्य।',
        downloads: 53100,
        year: 'प्राचीन',
        pages: 85,
        coverUrl: 'https://archive.org/services/img/20200303_20200303_1806'
      }
    ];

    const q = query.toLowerCase().trim();
    if (!q) return curatedBooks;
    
    // Simple client-side search simulation
    return curatedBooks.filter(b => 
      b.title.toLowerCase().includes(q) || 
      b.summary.toLowerCase().includes(q) ||
      b.author.toLowerCase().includes(q)
    );
  },

  /**
   * Get the direct PDF URL for a book from Internet Archive
   * @param {string} identifier 
   */
  async getPdfUrl(identifier) {
    try {
      const response = await fetch(`https://archive.org/metadata/${identifier}`);
      const data = await response.json();
      
      const pdfFile = data.files.find(f => f.name.endsWith('.pdf'));
      if (pdfFile) {
        return `https://archive.org/download/${identifier}/${pdfFile.name}`;
      }
      return null;
    } catch (error) {
      console.error('Failed to get PDF URL:', error);
      return null;
    }
  },

  /**
   * Download a PDF and save it to IndexedDB
   * @param {string} identifier 
   * @param {Function} onProgress 
   */
  async downloadAndCacheBook(identifier, onProgress) {
    try {
      const pdfUrl = await this.getPdfUrl(identifier);
      if (!pdfUrl) throw new Error('PDF not found for this book');

      // Fetch the blob
      const response = await fetch(pdfUrl);
      if (!response.ok) throw new Error('Network response was not ok');

      const blob = await response.blob();
      
      // Save to IndexedDB
      await localforage.setItem(`book_${identifier}`, blob);
      return true;
    } catch (error) {
      console.error('Failed to download book:', error);
      throw error;
    }
  },

  /**
   * Check if a book is already downloaded
   * @param {string} identifier 
   */
  async isBookDownloaded(identifier) {
    try {
      const blob = await localforage.getItem(`book_${identifier}`);
      return blob !== null;
    } catch (error) {
      return false;
    }
  },

  /**
   * Get the local Blob URL for a downloaded book
   * @param {string} identifier 
   */
  async getLocalBookUrl(identifier) {
    try {
      const blob = await localforage.getItem(`book_${identifier}`);
      if (blob) {
        return URL.createObjectURL(blob);
      }
      return null;
    } catch (error) {
      console.error('Failed to get local book:', error);
      return null;
    }
  },

  /**
   * Delete a downloaded book
   * @param {string} identifier 
   */
  async deleteBook(identifier) {
    await localforage.removeItem(`book_${identifier}`);
  }
};
