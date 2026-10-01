type CampaignPixels = {
  meta: string | null;
  tiktok: string | null;
};

type PurchaseInput = {
  value: number;
  contentId: string;
  contentName: string;
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

type TikTokEventTarget = {
  page: () => void;
  track: (event: string, payload?: Record<string, unknown>) => void;
  push: (entry: unknown[]) => void;
};

type TikTokQueue = TikTokEventTarget & {
  methods: string[];
  setAndDefer: (target: { push: (entry: unknown[]) => void }, method: string) => void;
  instance: (pixelId: string) => TikTokEventTarget;
  load: (pixelId: string, options?: Record<string, unknown>) => void;
  _i: Record<string, TikTokEventTarget & unknown[]>;
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
    };
  }
}

function state() {
  window.__michketPixels ??= {
    meta: new Set<string>(),
    tiktok: new Set<string>(),
  };
  return window.__michketPixels;
}

function ensureMeta() {
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

function ensureTikTok() {
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
  for (const method of ttq.methods) {
    ttq.setAndDefer(ttq, method);
  }
  ttq.instance = (pixelId) => {
    const bucket =
      ttq._i?.[pixelId] ??
      ([] as unknown as TikTokQueue["_i"][string]);
    for (const method of ttq.methods) {
      ttq.setAndDefer(bucket, method);
    }
    return bucket;
  };
  ttq.load = (pixelId, options) => {
    ttq._i = ttq._i || {};
    ttq._i[pixelId] = [] as unknown as TikTokQueue["_i"][string];
    ttq._t = ttq._t || {};
    ttq._t[pixelId] = Date.now();
    ttq._o = ttq._o || {};
    ttq._o[pixelId] = options || {};
    const script = document.createElement("script");
    script.async = true;
    script.src = `https://analytics.tiktok.com/i18n/pixel/events.js?sdkid=${encodeURIComponent(pixelId)}&lib=ttq`;
    document.head.appendChild(script);
  };

  window.TiktokAnalyticsObject = "ttq";
  window.ttq = ttq;
}

export function loadCampaignPixels(pixels: CampaignPixels | null | undefined) {
  if (typeof window === "undefined" || !pixels) return;
  const loaded = state();

  if (pixels.meta && !loaded.meta.has(pixels.meta)) {
    ensureMeta();
    window.fbq?.("init", pixels.meta);
    window.fbq?.("trackSingle", pixels.meta, "PageView");
    loaded.meta.add(pixels.meta);
  }

  if (pixels.tiktok && !loaded.tiktok.has(pixels.tiktok)) {
    ensureTikTok();
    window.ttq?.load(pixels.tiktok);
    window.ttq?.instance(pixels.tiktok).page();
    loaded.tiktok.add(pixels.tiktok);
  }
}

export function trackCampaignPurchase(
  pixels: CampaignPixels | null | undefined,
  purchase: PurchaseInput,
) {
  if (typeof window === "undefined" || !pixels) return;

  const value = Math.max(0, Math.round(purchase.value));
  const quantity = Math.max(1, purchase.quantity);

  if (pixels.meta) {
    ensureMeta();
    window.fbq?.("trackSingle", pixels.meta, "Purchase", {
      value,
      currency: "DZD",
      content_ids: [purchase.contentId],
      content_name: purchase.contentName,
      content_type: "product",
      num_items: quantity,
    });
  }

  if (pixels.tiktok) {
    ensureTikTok();
    window.ttq?.instance(pixels.tiktok).track("CompletePayment", {
      value,
      currency: "DZD",
      contents: [
        {
          content_id: purchase.contentId,
          content_type: "product",
          content_name: purchase.contentName,
          quantity,
          price: quantity > 0 ? value / quantity : value,
        },
      ],
    });
  }
}
