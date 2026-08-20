// src/utils/browserDetection.ts
export function getBrowserInfo() {
  const ua = navigator.userAgent;
  
  return {
    isSafari: /safari/i.test(ua) && !/chrome/i.test(ua),
    isSafariDesktop: /safari/i.test(ua) && !/chrome/i.test(ua) && !('ontouchstart' in window),
    isSafariIOS: /safari/i.test(ua) && !/chrome/i.test(ua) && ('ontouchstart' in window),
    isChrome: /chrome/i.test(ua) && !/edge/i.test(ua),
    isEdge: /edge/i.test(ua),
    isFirefox: /firefox/i.test(ua),
    isIOS: /iphone|ipad|ipod/.test(ua.toLowerCase()),
    isAndroid: /android/.test(ua.toLowerCase()),
    isMobile: /android|iphone|ipad|ipod|webos/i.test(ua),
    
    // Support PWA
    supportsPWAInstall: () => {
      // Chrome/Edge desktop
      if (/chrome|edge/i.test(ua) && !('ontouchstart' in window)) return true;
      // iOS Safari
      if (/safari/i.test(ua) && /iphone|ipad|ipod/.test(ua)) return true;
      // Android Chrome
      if (/chrome/i.test(ua) && /android/.test(ua)) return true;
      return false;
    },
    
    // Comment installer
    getInstallInstructions: () => {
      if (/safari/i.test(ua) && /iphone|ipad|ipod/.test(ua)) {
        return 'Appuyez sur 📤 puis "Sur l\'écran d\'accueil"';
      }
      if (/chrome/i.test(ua) && /android/.test(ua)) {
        return 'Menu ⋮ > "Ajouter à l\'écran d\'accueil"';
      }
      if (/safari/i.test(ua) && !('ontouchstart' in window)) {
        return 'Utilisez Chrome pour installer sur desktop';
      }
      return 'Bouton Installer dans la barre d\'adresse';
    }
  };
}