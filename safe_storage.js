(function (global) {
  const SafeStorage = (() => {
    const isAvailable = (() => {
      try {
        const testKey = '__test__';
        localStorage.setItem(testKey, testKey);
        localStorage.removeItem(testKey);
        return true;
      } catch {
        return false;
      }
    })();

    const memoryStore = {};

    return {
      setItem: (key, value) => {
        const val = typeof value === 'string' ? value : JSON.stringify(value);
        if (isAvailable) {
          localStorage.setItem(key, val);
        } else {
          memoryStore[key] = val;
        }
      },
      getItem: (key) => {
        const val = isAvailable ? localStorage.getItem(key) : memoryStore[key];
        try {
          return JSON.parse(val);
        } catch {
          return val;
        }
      },
      removeItem: (key) => {
        if (isAvailable) {
          localStorage.removeItem(key);
        } else {
          delete memoryStore[key];
        }
      },
      clear: () => {
        if (isAvailable) {
          localStorage.clear();
        } else {
          Object.keys(memoryStore).forEach(k => delete memoryStore[k]);
        }
      }
    };
  })();

  global.SafeStorage = SafeStorage;
})(this);

console.log("✅ safe_storage.js loaded");