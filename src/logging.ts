const SHOULD_DEBUG = false;

export const debugLog = (message: string, prefix?: string): void => {
  // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
  if (SHOULD_DEBUG) {
    const prefixMsg = prefix === undefined ? "" : `[${prefix}]`;
    Isaac.DebugString(`[Spider-Mod]${prefixMsg}: ${message}`);
  }
};
