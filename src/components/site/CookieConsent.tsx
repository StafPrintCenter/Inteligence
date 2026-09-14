export const STORAGE_KEY = "spc_ai_cookie_consent_v1";
const GA_ID = "G-5PP91S5CSV";

export type Consent = "accepted" | "declined";

declare global {
  interface Window {
    dataLayer: unknown[];
    gtag: (...args: unknown[]) => void;
    __spcGaLoaded?: boolean;
  }
}

// 1. Charge la balise Google Analytics de manière dynamique
export function loadGA() {
  if (typeof window === "undefined" || window.__spcGaLoaded) return;
  window.__spcGaLoaded = true;

  const s = document.createElement("script");
  s.async = true;
  s.src = `https://www.googletagmanager.com/gtag/js?id=${GA_ID}`;
  document.head.appendChild(s);

  window.dataLayer = window.dataLayer || [];
  window.gtag = function gtag() {
    // eslint-disable-next-line prefer-rest-params
    window.dataLayer.push(arguments);
  };

  window.gtag("js", new Date());
  window.gtag("consent", "update", {
    ad_storage: "granted",
    analytics_storage: "granted",
  });
  window.gtag("config", GA_ID, { anonymize_ip: true });
}

// 2. Met à jour le choix de l'utilisateur dans LocalStorage + GA
export function updateGaConsent(status: Consent) {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY, status);

  if (status === "accepted") {
    loadGA();
  } else if (window.gtag) {
    window.gtag("consent", "update", {
      ad_storage: "denied",
      analytics_storage: "denied",
    });
  }
}

// 3. Initialise Analytics au démarrage du site si le choix a déjà été fait dans l'onboarding
export function initGaFromStorage() {
  if (typeof window === "undefined") return;

  window.dataLayer = window.dataLayer || [];
  if (!window.gtag) {
    window.gtag = function gtag() {
      // eslint-disable-next-line prefer-rest-params
      window.dataLayer.push(arguments);
    };
  }

  // Par défaut : refusé tant que l'utilisateur n'a pas validé l'onboarding
  window.gtag("consent", "default", {
    ad_storage: "denied",
    analytics_storage: "denied",
    wait_for_update: 500,
  });

  const saved = localStorage.getItem(STORAGE_KEY) as Consent | null;
  if (saved === "accepted") {
    loadGA();
  }
}