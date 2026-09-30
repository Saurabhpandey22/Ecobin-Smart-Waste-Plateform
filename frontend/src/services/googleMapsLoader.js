/**
 * Google Maps JavaScript API Dynamic Script Loader
 * Supports environment key (import.meta.env.VITE_GOOGLE_MAPS_API_KEY)
 * and runtime user-supplied API key.
 */

let loadPromise = null;

export function loadGoogleMapsApi(apiKey) {
  if (window.google && window.google.maps) {
    return Promise.resolve(window.google.maps);
  }

  const keyToUse = apiKey || (typeof import.meta !== 'undefined' && import.meta.env?.VITE_GOOGLE_MAPS_API_KEY) || localStorage.getItem('ecobin_gmaps_key') || '';

  if (loadPromise) {
    return loadPromise;
  }

  loadPromise = new Promise((resolve, reject) => {
    // If no key is provided, we can still load standard script (will run in dev/watermarked mode)
    const script = document.createElement('script');
    script.id = 'google-maps-api-script';
    script.type = 'text/javascript';
    script.async = true;
    script.defer = true;
    
    const keyParam = keyToUse ? `&key=${encodeURIComponent(keyToUse)}` : '';
    script.src = `https://maps.googleapis.com/maps/api/js?v=weekly${keyParam}&libraries=places,geometry,visualization`;

    script.onload = () => {
      if (window.google && window.google.maps) {
        resolve(window.google.maps);
      } else {
        reject(new Error('Google Maps loaded but google.maps namespace is missing.'));
      }
    };

    script.onerror = (err) => {
      loadPromise = null;
      reject(new Error('Failed to load Google Maps script from Google servers: ' + (err?.message || 'Network error')));
    };

    document.head.appendChild(script);
  });

  return loadPromise;
}
