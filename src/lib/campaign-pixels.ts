type CampaignPixels = {
  meta: string | null;
  tiktok: string | null;
};

type PurchaseInput = {
  reference: string;
  value: number;
  contentId: string;
  contentName: string;
  contentPrice: number;
  quantity: number;
};

type FbqFn = {
  (...args: unknown[]): void;
  callMethod?: (...args: unknown[]) => void;
  queue: unknown[];
  loaded: boolean;
  version: string;
  push: FbqFn;
};

type PixelBucket = {
  push: (entry: unknown[]) => void;
  page: () => void;
  track: (event: string, payload?: Record<string, unknown>) => void;
  _u?: string;
};

type TikTokQueue = PixelBucket & {
  methods: string[];
  setAndDefer: (target: PixelBucket, method: string) => void;
  instance: (pixelId: string) => PixelBucket;
  load: (pixelId: string) => void;
  _i: Record<string, PixelBucket>;
  _t: Record<string, number>;
  _o: Record<string, unknown>;
};

declare global {
  interface Window {
    fbq?: FbqFn;
    _fbq?: FbqFn;
    ttq?: TikTokQueue;
    TiktokAnalyticsObject?: string;
    __michketPixels?: {
      meta: Set<string>;
      tiktok: Set<string>;
      purchases: Set<string>;
    };
  }
}

function state() {
  window.__michketPixels ??= {
    meta: new Set<string>(),
    tiktok: new Set<string>(),
    purchases: new Set<string>(),
  };
  return window.__michketPixels;
}

function ensureMetaBase() {
  if (window.fbq) return;

  const fbq = function (...args: unknown[]) {
    const current = fbq as FbqFn;
    if (current.callMethod) {
      current.callMethod(...args);
      return;
    }
    current.queue.push(args);
  } as FbqFn;

  fbq.queue = [];
  fbq.loaded = true;
  fbq.version = "2.0";
  fbq.push = fbq;
  window.fbq = fbq;
  window._fbq = fbq;

  const script = document.createElement("script");
  script.async = true;
  script.src = "https://connect.facebook.net/en_US/fbevents.js";
  document.head.appendChild(script);
}

function ensureTikTokBase() {
  if (window.ttq) return;

  const ttq = [] as unknown as TikTokQueue;
  ttq.methods = [
    "page",
    "track",
    "identify",
    "instances",
    "debug",
    "on",
    "off",
    "once",
    "ready",
    "alias",
    "group",
    "enableCookie",
    "disableCookie",
    "holdConsent",
    "revokeConsent",
    "grantConsent",
  ];
  ttq.setAndDefer = (target, method) => {
    (target as unknown as Record<string, (...args: unknown[]) => void>)[method] =
      (...args: unknown[]) => {
        target.push([method, ...args]);
      };
  };
  ttq._i = {};
  ttq._t = {};
  ttq._o = {};

  for (const method of ttq.methods) {
    ttq.setAndDefer(ttq, method);
  }

  ttq.instance = (pixelId) => {
    const bucket = ttq._i[pixelId] ?? ([] as unknown as PixelBucket);
    ttq._i[pixelId] = bucket;
    for (const method of ttq.methods) {
      ttq.setAndDefer(bucket, method);
    }
    return bucket;
  };

  ttq.load = (pixelId) => {
    const scriptUrl = "https://analytics.tiktok.com/i18n/pixel/events.js";
    const bucket = [] as unknown as PixelBucket;
    bucket._u = scriptUrl;
    ttq._i[pixelId] = bucket;
    ttq._t[pixelId] = Date.now();
    ttq._o[pixelId] = {};
    for (const method of ttq.methods) {
      ttq.setAndDefer(bucket, method);
    }

    const script = document.createElement("script");
    script.async = true;
    script.src = `${scriptUrl}?sdkid=${encodeURIComponent(pixelId)}&lib=ttq`;
    document.head.appendChild(script);
  };

  window.TiktokAnalyticsObject = "ttq";
  window.ttq = ttq;
}

function prepareMeta(pixelId: string) {
  ensureMetaBase();
  const loaded = state();
  if (loaded.meta.has(pixelId)) return;
  window.fbq?.("set", "autoConfig", false, pixelId);
  window.fbq?.("init", pixelId);
  loaded.meta.add(pixelId);
}

function prepareTikTok(pixelId: string) {
  ensureTikTokBase();
  const loaded = state();
  if (loaded.tiktok.has(pixelId)) return;
  window.ttq?.load(pixelId);
  loaded.tiktok.add(pixelId);
}

export function loadCampaignPixels(pixels: CampaignPixels | null | undefined) {
  if (typeof window === "undefined" || !pixels) return;
  const loaded = state();

  if (pixels.meta && !loaded.meta.has(pixels.meta)) {
    prepareMeta(pixels.meta);
    window.fbq?.("trackSingle", pixels.meta, "PageView");
  }

  if (pixels.tiktok && !loaded.tiktok.has(pixels.tiktok)) {
    prepareTikTok(pixels.tiktok);
    window.ttq?.instance(pixels.tiktok).page();
  }
}

export function trackCampaignPurchase(
  pixels: CampaignPixels | null | undefined,
  purchase: PurchaseInput,
) {
  if (typeof window === "undefined" || !pixels) return;
  if (!pixels.meta && !pixels.tiktok) return;

  const reference = purchase.reference.trim();
  if (!reference) return;

  const loaded = state();
  if (loaded.purchases.has(reference)) return;
  loaded.purchases.add(reference);

  const value = Math.max(0, Math.round(purchase.value));
  const quantity = Math.max(1, Math.round(purchase.quantity));
  const contentPrice = Math.max(0, Math.round(purchase.contentPrice));

  if (pixels.meta) {
    prepareMeta(pixels.meta);
    window.fbq?.("trackSingle", pixels.meta, "Purchase", {
      value,
      currency: "DZD",
      content_ids: [purchase.contentId],
      content_name: purchase.contentName,
      content_type: "product",
      num_items: quantity,
    }, { eventID: reference });
  }

  if (pixels.tiktok) {
    prepareTikTok(pixels.tiktok);
    window.ttq?.instance(pixels.tiktok).track("CompletePayment", {
      value,
      currency: "DZD",
      event_id: reference,
      contents: [
        {
          content_id: purchase.contentId,
          content_type: "product",
          content_name: purchase.contentName,
          quantity,
          price: contentPrice,
        },
      ],
    });
  }
}
