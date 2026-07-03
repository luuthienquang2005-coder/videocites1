// Fix read-only fetch getter issue in sandboxed preview environments
// This file MUST be imported before any other imports to run first.
try {
  const originalFetch = window.fetch || globalThis.fetch;
  if (originalFetch) {
    let activeFetch = originalFetch;

    const defineFetchOn = (obj: any) => {
      if (!obj) return;
      try {
        const desc = Object.getOwnPropertyDescriptor(obj, "fetch");
        if (!desc || desc.configurable) {
          Object.defineProperty(obj, "fetch", {
            get() {
              return activeFetch;
            },
            set(val) {
              activeFetch = val;
            },
            configurable: true,
            enumerable: true,
          });
        }
      } catch (err) {
        // Suppress expected errors on read-only environments
      }
    };

    defineFetchOn(window);
    defineFetchOn(globalThis);
    if (typeof self !== "undefined") {
      defineFetchOn(self);
    }
    if (typeof Window !== "undefined" && Window.prototype) {
      defineFetchOn(Window.prototype);
    }
  }
} catch (e) {
  // Silent fallback
}

export {};

