// Local-First Storage & State Machine for Karmphal (Punya Ledger, Tasks, Japa Counters)
import { tokenStorage } from './tokenStorage';
import { apiClient } from './apiClient';

const STORAGE_KEY = 'karmphal_sanatan_state_v2';

const DEFAULT_TASKS = [
  { id: 'brahma_muhurta', title: 'ब्रह्म मुहूर्त जागरण (सूर्योदय पूर्व)', points: 50, completed: false },
  { id: 'surya_arghya', title: 'भगवान् सूर्यनारायण को अर्घ्य समर्पण', points: 30, completed: false },
  { id: 'gayatri_japa', title: 'गायत्री महामन्त्र १०८ जप', points: 40, completed: false },
  { id: 'deva_puja', title: 'दैनिक पञ्चदेव पूजन एवं दीप प्रज्वलन', points: 50, completed: false },
  { id: 'gau_seva', title: 'गौसेवा / पक्षियों को अन्न-जल दान', points: 35, completed: false },
  { id: 'sandhya_aarti', title: 'सायं सन्ध्या वन्दन एवं महाआरती', points: 45, completed: false }
];

const DEFAULT_STATE = {
  version: 2,
  punyaLedger: 0,
  currentStreak: 0,
  bestStreak: 0,
  lastCheckInDate: null,
  japaStats: {
    totalBeads: 0,
    completedMalas: 0,
    mantraCounters: {
      gayatri: 0,
      mahamrityunjaya: 0,
      om_namah_shivaya: 0,
      hare_krishna: 0
    }
  },
  swadhyayaMinutes: 0,
  tasks: DEFAULT_TASKS,
  mutationQueue: [] // Queue for offline sync
};

class StorageService {
  constructor() {
    this.state = this.loadState();
    this.listeners = [];
    this.isSyncing = false;
    
    // Attempt initial fetch
    this.fetchInitialStateFromBackend();
    
    // Listen for online events to sync queue
    if (typeof window !== 'undefined') {
       window.addEventListener('online', () => this.syncOfflineQueue());
    }
  }

  subscribe(listener) {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  notify() {
    for (const listener of this.listeners) {
      listener(this.state);
    }
  }

  loadState() {
    try {
      const data = localStorage.getItem(STORAGE_KEY);
      if (data) {
        const parsed = JSON.parse(data);
        return {
          ...DEFAULT_STATE,
          ...parsed,
          tasks: parsed.tasks && parsed.tasks.length > 0 ? parsed.tasks : DEFAULT_TASKS
        };
      }
    } catch (e) {
      console.warn('LocalStorage error, falling back to default state', e);
    }
    return { ...DEFAULT_STATE, tasks: [...DEFAULT_TASKS] };
  }

  async initializeAuth() {
    let token = await tokenStorage.getToken();
    if (!token) {
      try {
        token = await apiClient.createGuestSession();
      } catch (err) {
        console.warn('Failed to create guest session', err);
      }
    }
    this.token = token;
    return token;
  }

  getToken() {
    return this.token || localStorage.getItem('karmphal_jwt_token');
  }

  getAuthHeaders() {
    const token = this.getToken();
    return token ? { 'Authorization': `Bearer ${token}` } : {};
  }

  async fetchInitialStateFromBackend() {
    await this.initializeAuth();
    try {
      const user = await apiClient.get('/api/user/profile');
      if (user && user.totalPunya !== undefined) {
        this.state.punyaLedger = user.totalPunya || this.state.punyaLedger;
        this.state.currentStreak = user.sadhanaStreak || this.state.currentStreak;
        this.saveStateToLocalOnly(); // Just save local, no need to push to backend what we just fetched
        this.notify();
      }
    } catch (e) {
      console.warn('Backend load failed', e);
    }
  }

  saveStateToLocalOnly() {
     try {
       localStorage.setItem(STORAGE_KEY, JSON.stringify(this.state));
     } catch (e) {
       console.warn('LocalStorage save error', e);
     }
  }

  saveState() {
    this.saveStateToLocalOnly();
    this.notify();

    // Add to mutation queue for offline sync safety
    const mutation = {
       totalPunya: this.state.punyaLedger, 
       sadhanaStreak: this.state.currentStreak,
       timestamp: Date.now()
    };
    
    // We keep only the latest mutation to avoid redundant calls, since it overwrites the state
    this.state.mutationQueue = [mutation]; 
    this.saveStateToLocalOnly();

    this.syncOfflineQueue();
  }

  async syncOfflineQueue() {
     if (this.isSyncing || this.state.mutationQueue.length === 0 || !navigator.onLine) {
        return;
     }

     this.isSyncing = true;
     try {
       const mutation = this.state.mutationQueue[0];
       await apiClient.post('/api/user/punya', { 
         totalPunya: mutation.totalPunya, 
         sadhanaStreak: mutation.sadhanaStreak 
       });

       // Sync successful, clear queue
       this.state.mutationQueue = [];
       this.saveStateToLocalOnly();
     } catch (err) {
       console.warn('Backend sync failed, keeping in queue', err.message);
     } finally {
       this.isSyncing = false;
     }
  }

  getState() {
    if (!this.state.tasks) {
      this.state.tasks = [...DEFAULT_TASKS];
    }
    return this.state;
  }

  addPunya(pointsDelta = 0, _reason = '') {
    this.state.punyaLedger += pointsDelta;
    this.saveState();
    return this.state;
  }

  incrementJapa(mantraName, count = 1, isLegitimate = true) {
    this.state.japaStats.totalBeads += count;
    const pointsAwarded = isLegitimate ? count : 0;
    this.state.punyaLedger += pointsAwarded;
    this.saveState();
    return this.state;
  }

  incrementMala(mantraId = 'gayatri') {
    this.state.japaStats.completedMalas += 1;
    if (!this.state.japaStats.mantraCounters[mantraId]) {
      this.state.japaStats.mantraCounters[mantraId] = 0;
    }
    this.state.japaStats.mantraCounters[mantraId] += 108;
    this.addPunya(50, '१०८ मनके माला पूर्णाहूति');
    return this.state;
  }

  toggleTask(taskId) {
    if (!this.state.tasks) {
      this.state.tasks = [...DEFAULT_TASKS];
    }
    this.state.tasks = this.state.tasks.map(task => {
      if (task.id === taskId) {
        const newCompleted = !task.completed;
        const delta = newCompleted ? task.points : -task.points;
        this.state.punyaLedger += delta;
        return { ...task, completed: newCompleted };
      }
      return task;
    });
    this.saveState();
    return this.state;
  }

  recordSwadhyayaTime(minutes) {
    this.state.swadhyayaMinutes += minutes;
    this.addPunya(minutes * 2, 'स्वाध्याय ग्रन्थ अध्ययन');
    return this.state;
  }

  exportAllData() {
    const backup = {
      app: 'karmphal',
      version: 2,
      exportedAt: new Date().toISOString(),
      sadhanaState: this.state,
      localStorage: {}
    };

    if (typeof window !== 'undefined' && window.localStorage) {
      const keysToBackup = [
        'karmphal_location',
        'karmphal_kundali_form_data',
        'karmphal_lang',
        'karmphal_audio_muted'
      ];
      for (const k of keysToBackup) {
        const val = window.localStorage.getItem(k);
        if (val !== null) backup.localStorage[k] = val;
      }
    }

    const jsonStr = JSON.stringify(backup, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    const dateStr = new Date().toISOString().split('T')[0];
    link.href = url;
    link.download = `karmphal_backup_${dateStr}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    return true;
  }

  importAllData(jsonString) {
    try {
      const data = typeof jsonString === 'string' ? JSON.parse(jsonString) : jsonString;
      if (!data || (!data.sadhanaState && !data.punyaLedger)) {
        throw new Error('अमान्य डेटा संरचना: कर्मफल बैकअप डेटा नहीं मिला।');
      }

      if (data.sadhanaState) {
        this.state = {
          ...DEFAULT_STATE,
          ...data.sadhanaState
        };
      } else if (data.punyaLedger !== undefined) {
        this.state = {
          ...DEFAULT_STATE,
          ...data
        };
      }

      this.saveStateToLocalOnly();

      if (data.localStorage && typeof window !== 'undefined' && window.localStorage) {
        for (const [k, v] of Object.entries(data.localStorage)) {
          window.localStorage.setItem(k, v);
        }
      }

      this.notify();
      return { success: true, message: 'समस्त डेटा सफलतापूर्वक पुनर्स्थापित किया गया।' };
    } catch (err) {
      console.error('Data import failed', err);
      return { success: false, error: err.message || 'फ़ाइल पार्स करने में त्रुटि' };
    }
  }
}

export const storageService = new StorageService();
