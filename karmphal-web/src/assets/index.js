// Centralized Asset Registry according to FSD Architecture
import appLogo from './app_logo.webp';
import guruAvatar from './guru_avatar.webp';
import templeHero from './temple_hero.webp';
import appLogoAvif from './app_logo.avif';
import guruAvatarAvif from './guru_avatar.avif';
import templeHeroAvif from './temple_hero.avif';
import vedicAshramBg from './vedic_ashram_bg.webp';
import vedicAshramBgAvif from './vedic_ashram_bg.avif';

// Graceful gold "ॐ" inline fallback placeholders (RFC 2397 compliant SVGs)
export const OM_FALLBACK_SVG = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'%3E%3Cdefs%3E%3ClinearGradient id='g' x1='0%25' y1='0%25' x2='100%25' y2='100%25'%3E%3Cstop offset='0%25' stop-color='%23E0A96D'/%3E%3Cstop offset='50%25' stop-color='%23C58B4E'/%3E%3Cstop offset='100%25' stop-color='%238C4B19'/%3E%3C/linearGradient%3E%3C/defs%3E%3Crect width='100' height='100' rx='18' fill='%23120A05' stroke='%23C58B4E' stroke-width='2'/%3E%3Ctext x='50' y='68' font-size='56' text-anchor='middle' fill='url(%23g)' font-family='serif' font-weight='bold'%3Eॐ%3C/text%3E%3C/svg%3E";

export const BOOK_COVER_FALLBACK_SVG = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 200 280'%3E%3Cdefs%3E%3ClinearGradient id='bg' x1='0%25' y1='0%25' x2='100%25' y2='100%25'%3E%3Cstop offset='0%25' stop-color='%23221208'/%3E%3Cstop offset='50%25' stop-color='%23160B04'/%3E%3Cstop offset='100%25' stop-color='%230D0502'/%3E%3C/linearGradient%3E%3ClinearGradient id='gold' x1='0%25' y1='0%25' x2='100%25' y2='100%25'%3E%3Cstop offset='0%25' stop-color='%23F3CA9D'/%3E%3Cstop offset='50%25' stop-color='%23C58B4E'/%3E%3Cstop offset='100%25' stop-color='%238C4B19'/%3E%3C/linearGradient%3E%3C/defs%3E%3Crect width='200' height='280' rx='8' fill='url(%23bg)' stroke='%23C58B4E' stroke-width='3'/%3E%3Crect x='10' y='10' width='180' height='260' rx='4' fill='none' stroke='%23C58B4E' stroke-width='1' stroke-dasharray='4,3' opacity='0.7'/%3E%3Ctext x='100' y='130' font-size='64' text-anchor='middle' fill='url(%23gold)' font-family='serif' font-weight='bold'%3Eॐ%3C/text%3E%3Ctext x='100' y='175' font-size='14' text-anchor='middle' fill='%23F3CA9D' font-family='sans-serif' font-weight='600'%3Eसनातन ग्रन्थ%3C/text%3E%3Ctext x='100' y='200' font-size='11' text-anchor='middle' fill='%23C58B4E' font-family='sans-serif'%3Eवैदिक ज्ञान निधि%3C/text%3E%3C/svg%3E";

/**
 * Creates an image onError event handler that replaces broken image with sacred fallback.
 * Prevents infinite loop by unhooking onError and checking target.
 */
export const handleImageError = (fallback = OM_FALLBACK_SVG) => (e) => {
  if (e && e.currentTarget && e.currentTarget.src !== fallback) {
    e.currentTarget.onerror = null;
    e.currentTarget.src = fallback;
  }
};

export const ASSETS = {
  logos: {
    appLogo,
    appLogoAvif
  },
  images: {
    guruAvatar,
    guruAvatarAvif,
    templeHero,
    templeHeroAvif,
    vedicAshramBg,
    vedicAshramBgAvif
  },
  fallbacks: {
    om: OM_FALLBACK_SVG,
    bookCover: BOOK_COVER_FALLBACK_SVG
  }
};

export { 
  appLogo, 
  guruAvatar, 
  templeHero, 
  vedicAshramBg,
  appLogoAvif,
  guruAvatarAvif,
  templeHeroAvif,
  vedicAshramBgAvif
};
export default ASSETS;
