// Location & Geolocation Service for Karmphal Panchang & Vedic Ephemeris
import { getCoordinatesForCity, CITY_COORDINATES } from './ephemerisEngine';
import { Capacitor } from '@capacitor/core';
import { Geolocation } from '@capacitor/geolocation';

const LOCATION_STORAGE_KEY = 'karmphal_user_location';
const PROMPT_STORAGE_KEY = 'karmphal_location_prompted_once';

export const DEFAULT_LOCATION = {
  cityName: 'नई दिल्ली',
  cityNameEn: 'Delhi',
  lat: 28.6139,
  lon: 77.2090,
  timezone: 'Asia/Kolkata',
  isDefaultLocation: true,
  source: 'fallback_default'
};

export const MAJOR_CITIES = [
  { cityName: 'वाराणसी (काशी)', cityNameEn: 'Varanasi', lat: 25.3176, lon: 82.9739, timezone: 'Asia/Kolkata' },
  { cityName: 'नई दिल्ली', cityNameEn: 'Delhi', lat: 28.6139, lon: 77.2090, timezone: 'Asia/Kolkata' },
  { cityName: 'मुम्बई', cityNameEn: 'Mumbai', lat: 19.0760, lon: 72.8777, timezone: 'Asia/Kolkata' },
  { cityName: 'उज्जैन (महाकाल)', cityNameEn: 'Ujjain', lat: 23.1765, lon: 75.7885, timezone: 'Asia/Kolkata' },
  { cityName: 'अयोध्या धाम', cityNameEn: 'Ayodhya', lat: 26.7922, lon: 82.1998, timezone: 'Asia/Kolkata' },
  { cityName: 'हरिद्वार', cityNameEn: 'Haridwar', lat: 29.9457, lon: 78.1642, timezone: 'Asia/Kolkata' },
  { cityName: 'प्रयागराज', cityNameEn: 'Prayagraj', lat: 25.4358, lon: 81.8463, timezone: 'Asia/Kolkata' },
  { cityName: 'मथुरा-वृन्दावन', cityNameEn: 'Mathura', lat: 27.4924, lon: 77.6737, timezone: 'Asia/Kolkata' },
  { cityName: 'कोलकाता', cityNameEn: 'Kolkata', lat: 22.5726, lon: 88.3639, timezone: 'Asia/Kolkata' },
  { cityName: 'बेंगलुरु', cityNameEn: 'Bengaluru', lat: 12.9716, lon: 77.5946, timezone: 'Asia/Kolkata' },
  { cityName: 'चेन्नई', cityNameEn: 'Chennai', lat: 13.0827, lon: 80.2707, timezone: 'Asia/Kolkata' },
  { cityName: 'जयपुर', cityNameEn: 'Jaipur', lat: 26.9124, lon: 75.7873, timezone: 'Asia/Kolkata' },
  { cityName: 'पटना', cityNameEn: 'Patna', lat: 25.5941, lon: 85.1376, timezone: 'Asia/Kolkata' },
  { cityName: 'पुणे', cityNameEn: 'Pune', lat: 18.5204, lon: 73.8567, timezone: 'Asia/Kolkata' },
  { cityName: 'अहमदाबाद', cityNameEn: 'Ahmedabad', lat: 23.0225, lon: 72.5714, timezone: 'Asia/Kolkata' },
  { cityName: 'लखनऊ', cityNameEn: 'Lucknow', lat: 26.8467, lon: 80.9462, timezone: 'Asia/Kolkata' }
];

class LocationService {
  constructor() {
    this.listeners = [];
    this.currentLocation = this.loadLocation();
  }

  subscribe(listener) {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  notify() {
    for (const listener of this.listeners) {
      try {
        listener(this.currentLocation);
      } catch (err) {
        console.warn('Location listener error:', err);
      }
    }
  }

  loadLocation() {
    if (typeof window === 'undefined') return DEFAULT_LOCATION;

    try {
      // 1. Check direct saved location
      const saved = localStorage.getItem(LOCATION_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed && typeof parsed.lat === 'number' && typeof parsed.lon === 'number') {
          return {
            ...DEFAULT_LOCATION,
            ...parsed,
            isDefaultLocation: !!parsed.isDefaultLocation
          };
        }
      }

      // 2. Check profile state from karmphal state
      const appStateRaw = localStorage.getItem('karmphal_sanatan_state_v2');
      if (appStateRaw) {
        const appState = JSON.parse(appStateRaw);
        const cityCandidate = appState?.userProfile?.city || appState?.city;
        if (cityCandidate) {
          const coords = getCoordinatesForCity(cityCandidate);
          return {
            cityName: cityCandidate,
            cityNameEn: coords.name || cityCandidate,
            lat: coords.lat,
            lon: coords.lon,
            timezone: 'Asia/Kolkata',
            isDefaultLocation: false,
            source: 'profile'
          };
        }
      }
    } catch (e) {
      console.warn('Error reading stored location:', e);
    }

    return DEFAULT_LOCATION;
  }

  getLocation() {
    return this.currentLocation;
  }

  setLocation(loc) {
    const isDefault = !!loc.isDefaultLocation;
    const newLoc = {
      cityName: loc.cityName || DEFAULT_LOCATION.cityName,
      cityNameEn: loc.cityNameEn || loc.cityName || DEFAULT_LOCATION.cityNameEn,
      lat: Number(loc.lat) || DEFAULT_LOCATION.lat,
      lon: Number(loc.lon) || DEFAULT_LOCATION.lon,
      timezone: loc.timezone || (typeof Intl !== 'undefined' ? Intl.DateTimeFormat().resolvedOptions().timeZone : 'Asia/Kolkata') || 'Asia/Kolkata',
      isDefaultLocation: isDefault,
      source: loc.source || (isDefault ? 'fallback_default' : 'user_selected')
    };

    this.currentLocation = newLoc;
    try {
      localStorage.setItem(LOCATION_STORAGE_KEY, JSON.stringify(newLoc));
    } catch (e) {
      console.warn('Error saving location to localStorage:', e);
    }

    this.notify();
    return newLoc;
  }

  setCity(cityName) {
    if (!cityName) return this.setLocation(DEFAULT_LOCATION);
    const coords = getCoordinatesForCity(cityName);
    // Find matching major city display if possible
    const majorMatch = MAJOR_CITIES.find(c => 
      c.cityNameEn.toLowerCase() === coords.name?.toLowerCase() ||
      c.cityName.includes(cityName) ||
      cityName.includes(c.cityNameEn)
    );

    return this.setLocation({
      cityName: majorMatch ? majorMatch.cityName : cityName,
      cityNameEn: coords.name || cityName,
      lat: coords.lat,
      lon: coords.lon,
      timezone: 'Asia/Kolkata',
      isDefaultLocation: false,
      source: 'user_selected_city'
    });
  }

  hasBeenPrompted() {
    if (typeof window === 'undefined') return true;
    return !!localStorage.getItem(PROMPT_STORAGE_KEY);
  }

  markPrompted() {
    if (typeof window === 'undefined') return;
    try {
      localStorage.setItem(PROMPT_STORAGE_KEY, 'true');
    } catch (e) {
      console.warn('Error setting prompt flag:', e);
    }
  }

  async requestGeolocation() {
    this.markPrompted();

    let lat = null;
    let lon = null;

    if (Capacitor.isNativePlatform()) {
      try {
        const checkStatus = await Geolocation.checkPermissions();
        if (checkStatus.location !== 'granted') {
          const reqStatus = await Geolocation.requestPermissions();
          if (reqStatus.location !== 'granted') {
            return {
              success: false,
              error: 'PERMISSION_DENIED',
              denied: true,
              message: 'स्थान (GPS) अनुमति अस्वीकृत है।'
            };
          }
        }

        const position = await Geolocation.getCurrentPosition({
          enableHighAccuracy: false,
          timeout: 10000
        });

        if (position && position.coords) {
          lat = position.coords.latitude;
          lon = position.coords.longitude;
        }
      } catch (nativeErr) {
        console.warn('Native geolocation error:', nativeErr);
        const errMsg = nativeErr?.message || '';
        const isDenied = errMsg.toLowerCase().includes('denied') || nativeErr?.code === 1;
        return {
          success: false,
          error: isDenied ? 'PERMISSION_DENIED' : (errMsg || 'LOCATION_ERROR'),
          denied: isDenied,
          message: isDenied ? 'स्थान (GPS) अनुमति अस्वीकृत है।' : 'स्थान प्राप्त नहीं हो सका।'
        };
      }
    } else {
      // Web Fallback
      if (typeof navigator === 'undefined' || !navigator.geolocation) {
        return { success: false, error: 'GEOLOCATION_UNSUPPORTED', denied: false };
      }

      try {
        const position = await new Promise((resolve, reject) => {
          navigator.geolocation.getCurrentPosition(resolve, reject, {
            timeout: 10000,
            enableHighAccuracy: false
          });
        });
        lat = position.coords.latitude;
        lon = position.coords.longitude;
      } catch (webErr) {
        console.warn('Web geolocation error:', webErr?.message);
        const isDenied = webErr?.code === 1 || webErr?.message?.toLowerCase().includes('denied');
        return {
          success: false,
          error: isDenied ? 'PERMISSION_DENIED' : (webErr?.message || 'LOCATION_ERROR'),
          denied: isDenied,
          message: isDenied ? 'स्थान अनुमति अस्वीकृत कर दी गई।' : 'स्थान का पता लगाने में असमर्थ।'
        };
      }
    }

    if (lat === null || lon === null) {
      return { success: false, error: 'LOCATION_UNAVAILABLE', denied: false };
    }

    const timezone = typeof Intl !== 'undefined' ? Intl.DateTimeFormat().resolvedOptions().timeZone : 'Asia/Kolkata';

    // Find closest known city
    let closest = null;
    let minDistance = Infinity;

    for (const city of CITY_COORDINATES) {
      const dLat = city.lat - lat;
      const dLon = city.lon - lon;
      const dist = dLat * dLat + dLon * dLon;
      if (dist < minDistance) {
        minDistance = dist;
        closest = city;
      }
    }

    const majorMatch = closest ? MAJOR_CITIES.find(c => c.cityNameEn.toLowerCase() === closest.name.toLowerCase()) : null;
    const displayName = majorMatch ? majorMatch.cityName : (closest ? closest.name : 'वर्तमान जीपीएस स्थान');

    const newLoc = this.setLocation({
      cityName: displayName,
      cityNameEn: closest ? closest.name : 'Current GPS',
      lat,
      lon,
      timezone,
      isDefaultLocation: false,
      source: 'geolocation'
    });

    return { success: true, location: newLoc };
  }
}

export const locationService = new LocationService();
