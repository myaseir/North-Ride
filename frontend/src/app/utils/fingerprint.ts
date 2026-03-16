import FingerprintJS from '@fingerprintjs/fingerprintjs';

export const getDeviceIdentifier = async (): Promise<string | null> => {
  if (typeof window === 'undefined') return null;

  try {
    // 🚀 Change key from '_bb_id' (BrainBuffer) to '_gg_id' (GlaciaGo)
    let localId = localStorage.getItem('_gg_id');
    if (!localId) {
      localId = crypto.randomUUID();
      localStorage.setItem('_gg_id', localId);
    }

    const fp = await FingerprintJS.load();
    const result = await fp.get();
    const components = result.components;

    const getSafeValue = (component: any) => 
      component && 'value' in component ? component.value : 'unknown';

    // We keep the stable data to ensure one device = one account (security)
    const stableData = {
      platform: getSafeValue(components.platform),
      hardware: getSafeValue(components.hardwareConcurrency),
      vendor: getSafeValue(components.vendor),
      tid: localId 
    };

    return await hashString(JSON.stringify(stableData));

  } catch (error) {
    console.error("GlaciaGo Security - Identifier failed:", error);
    return null;
  }
};

async function hashString(str: string): Promise<string> {
  const msgUint8 = new TextEncoder().encode(str);
  const hashBuffer = await crypto.subtle.digest('SHA-256', msgUint8);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}