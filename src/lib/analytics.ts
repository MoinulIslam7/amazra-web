export const GA_MEASUREMENT_ID = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID;
export const FB_PIXEL_ID = process.env.NEXT_PUBLIC_FB_PIXEL_ID;

declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
    fbq?: (...args: unknown[]) => void;
  }
}

export function pageview(url: string) {
  if (GA_MEASUREMENT_ID && typeof window.gtag === "function") {
    window.gtag("config", GA_MEASUREMENT_ID, { page_path: url });
  }
  if (FB_PIXEL_ID && typeof window.fbq === "function") {
    window.fbq("track", "PageView");
  }
}

export function trackEvent(name: string, params?: Record<string, unknown>) {
  if (GA_MEASUREMENT_ID && typeof window.gtag === "function") {
    window.gtag("event", name, params);
  }
}
