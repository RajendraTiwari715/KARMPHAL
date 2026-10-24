import React, { useState } from 'react';
import { MapPin, Search, Navigation, Check, X, Compass, AlertCircle } from 'lucide-react';
import { locationService, MAJOR_CITIES, DEFAULT_LOCATION } from '../services/locationService';
import { CITY_COORDINATES } from '../services/ephemerisEngine';
import { useProfile } from '../context/useProfile';

export default function LocationPickerModal({ isOpen, onClose }) {
  const { location, updateLocation } = useProfile();
  const currentLocation = location || locationService.getLocation();

  const [searchQuery, setSearchQuery] = useState('');
  const [isDetectingGps, setIsDetectingGps] = useState(false);
  const [gpsError, setGpsError] = useState(null);

  if (!isOpen) return null;

  const handleSelectMajorCity = (cityObj) => {
    updateLocation({
      cityName: cityObj.cityName,
      cityNameEn: cityObj.cityNameEn,
      lat: cityObj.lat,
      lon: cityObj.lon,
      timezone: cityObj.timezone || 'Asia/Kolkata',
      isDefaultLocation: false,
      source: 'user_picker'
    });
    locationService.markPrompted();
    onClose();
  };

  const handleSelectFromAll = (c) => {
    const major = MAJOR_CITIES.find(m => m.cityNameEn.toLowerCase() === c.name.toLowerCase());
    updateLocation({
      cityName: major ? major.cityName : (c.name.charAt(0).toUpperCase() + c.name.slice(1)),
      cityNameEn: c.name,
      lat: c.lat,
      lon: c.lon,
      timezone: 'Asia/Kolkata',
      isDefaultLocation: false,
      source: 'user_picker_all'
    });
    locationService.markPrompted();
    onClose();
  };

  const handleDetectGps = async () => {
    setIsDetectingGps(true);
    setGpsError(null);
    try {
      const res = await locationService.requestGeolocation();
      if (res.success) {
        updateLocation(res.location);
        onClose();
      } else {
        setGpsError(res.error === 'User denied Geolocation' || res.error?.includes('denied')
          ? 'स्थान अनुमति अस्वीकृत कर दी गई। कृपया नीचे दिए गए नगरों में से चुनें।'
          : 'स्थान का पता लगाने में असमर्थ। कृपया सूची से नगर चुनें।');
      }
    } catch {
      setGpsError('स्थान का पता लगाने में त्रुटि हुई।');
    } finally {
      setIsDetectingGps(false);
    }
  };

  const filteredAllCities = searchQuery.trim()
    ? CITY_COORDINATES.filter(c => c.name.toLowerCase().includes(searchQuery.toLowerCase().trim()))
    : [];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-fade-in">
      <div className="glass-card max-w-lg w-full p-6 sm:p-7 relative rounded-3xl border border-[#C58B4E]/50 shadow-2xl bg-gradient-to-b from-[#25150C] to-[#120904] text-[#F7E7D6] max-h-[90vh] flex flex-col">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-[#D4A373] hover:text-[#FFF] rounded-full bg-black/60 border border-[#C58B4E]/40 transition-colors"
          title="बंद करें"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-3.5 mb-4 pb-3 border-b border-[#C58B4E]/25">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#E0A96D] via-[#C58B4E] to-[#6A3B18] flex items-center justify-center text-[#120A05] text-xl shadow-lg border border-[#F3CA9D]">
            <Compass className="w-6 h-6 text-[#120A05]" />
          </div>
          <div>
            <h3 className="font-dharmik text-lg sm:text-xl font-bold text-[#F3CA9D]">
              साधना नगर एवं स्थान चयन
            </h3>
            <p className="text-[11px] text-[#C58B4E] mt-0.5">
              पञ्चाङ्ग, सूर्योदय एवं शुभ मुहूर्तों की सटीक गणना हेतु
            </p>
          </div>
        </div>

        {/* Current Active Location Info */}
        <div className="mb-4 p-3.5 rounded-2xl bg-black/40 border border-[#C58B4E]/30 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            <MapPin className="w-4 h-4 text-[#E0A96D] shrink-0" />
            <div>
              <span className="text-[#A67C52] text-[10px] block">वर्तमान सक्रिय स्थान:</span>
              <strong className="text-[#F7E7D6] text-sm">
                {currentLocation.cityName}
              </strong>
              <span className="text-[10px] text-slate-400 block font-mono">
                {currentLocation.lat.toFixed(2)}° N, {currentLocation.lon.toFixed(2)}° E
              </span>
            </div>
          </div>
          {currentLocation.isDefaultLocation ? (
            <span className="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40 text-[10px] font-semibold">
              पूर्वनिर्धारित (दिल्ली)
            </span>
          ) : (
            <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-[10px] font-semibold flex items-center gap-1">
              <Check className="w-3 h-3" /> सक्रिय
            </span>
          )}
        </div>

        {/* GPS Auto-Detect Button */}
        <button
          onClick={handleDetectGps}
          disabled={isDetectingGps}
          className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-gradient-to-r from-[#C58B4E]/20 to-[#E0A96D]/20 border border-[#C58B4E]/50 text-[#F3CA9D] hover:bg-[#C58B4E]/30 text-xs font-bold transition-all shadow mb-4 disabled:opacity-50"
        >
          <Navigation className={`w-3.5 h-3.5 text-[#E0A96D] ${isDetectingGps ? 'animate-spin' : ''}`} />
          <span>{isDetectingGps ? 'जीपीएस स्थान प्राप्त किया जा रहा है...' : 'वर्तमान जीपीएस स्थान से स्वतः पहचानें'}</span>
        </button>

        {gpsError && (
          <div className="mb-3 p-2.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-[11px] flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{gpsError}</span>
          </div>
        )}

        {/* City Search Bar */}
        <div className="relative mb-3">
          <Search className="w-4 h-4 text-[#C58B4E] absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="नगर का नाम खोजें (उदा: Varanasi, Mumbai, Ujjain)..."
            className="w-full pl-9 pr-3 py-2 rounded-xl bg-black/50 border border-[#C58B4E]/40 text-xs text-[#F7E7D6] placeholder-slate-400 outline-none focus:border-[#E0A96D]"
          />
        </div>

        {/* City List Area */}
        <div className="flex-1 overflow-y-auto pr-1 space-y-3">
          {searchQuery.trim() ? (
            <div>
              <span className="text-[10px] font-bold text-[#C58B4E] uppercase block mb-1.5">
                खोज परिणाम ({filteredAllCities.length}):
              </span>
              <div className="grid grid-cols-2 gap-2">
                {filteredAllCities.map(city => (
                  <button
                    key={city.name}
                    onClick={() => handleSelectFromAll(city)}
                    className="p-2.5 rounded-xl bg-black/40 border border-[#C58B4E]/30 hover:border-[#E0A96D] text-left transition-colors flex items-center justify-between"
                  >
                    <div>
                      <span className="text-xs font-bold text-[#F7E7D6] block capitalize">{city.name}</span>
                      <span className="text-[10px] text-slate-400 font-mono">{city.lat.toFixed(2)}°, {city.lon.toFixed(2)}°</span>
                    </div>
                    {currentLocation.cityNameEn.toLowerCase() === city.name.toLowerCase() && (
                      <Check className="w-4 h-4 text-emerald-400" />
                    )}
                  </button>
                ))}
                {filteredAllCities.length === 0 && (
                  <p className="col-span-2 text-center text-xs text-slate-400 py-4">कोई नगर नहीं मिला।</p>
                )}
              </div>
            </div>
          ) : (
            <div>
              <span className="text-[10px] font-bold text-[#C58B4E] uppercase block mb-2">
                प्रमुख तीर्थ एवं महानगर (त्वरित चयन):
              </span>
              <div className="grid grid-cols-2 gap-2">
                {MAJOR_CITIES.map(city => {
                  const isSelected = currentLocation.cityNameEn.toLowerCase() === city.cityNameEn.toLowerCase() ||
                    currentLocation.cityName.includes(city.cityNameEn);

                  return (
                    <button
                      key={city.cityNameEn}
                      onClick={() => handleSelectMajorCity(city)}
                      className={`p-2.5 rounded-xl text-left transition-all flex items-center justify-between border ${
                        isSelected
                          ? 'bg-[#C58B4E]/30 border-[#E0A96D] shadow-md'
                          : 'bg-black/40 border-[#C58B4E]/25 hover:border-[#C58B4E]/60'
                      }`}
                    >
                      <div>
                        <span className="text-xs font-bold text-[#F7E7D6] block">{city.cityName}</span>
                        <span className="text-[10px] text-[#C58B4E] block">{city.cityNameEn}</span>
                      </div>
                      {isSelected && <Check className="w-4 h-4 text-emerald-400" />}
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Footer Note */}
        <div className="pt-3 mt-3 border-t border-[#C58B4E]/20 text-[10px] text-slate-400 flex items-center justify-between">
          <span>पूर्वनिर्धारित: नई दिल्ली</span>
          <button
            onClick={() => handleSelectMajorCity(DEFAULT_LOCATION)}
            className="text-[#E0A96D] hover:underline"
          >
            दिल्ली पर रीसेट करें
          </button>
        </div>
      </div>
    </div>
  );
}
