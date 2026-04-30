import { useEffect, useState } from "react";

export function useSessionState(key, initialValue, options = {}) {
  const {
    serialize = (value) => JSON.stringify(value),
    deserialize = (raw) => JSON.parse(raw),
  } = options;

  const resolveInitial = () => (
    typeof initialValue === "function" ? initialValue() : initialValue
  );

  const [value, setValue] = useState(resolveInitial);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const raw = sessionStorage.getItem(key);
      if (raw !== null && raw !== "") {
        setValue(deserialize(raw));
      }
    } catch {}
    setHydrated(true);
  }, [key]);

  useEffect(() => {
    if (!hydrated) return;
    try {
      if (value === null || value === undefined || value === "") {
        sessionStorage.setItem(key, "");
        return;
      }
      sessionStorage.setItem(key, serialize(value));
    } catch {}
  }, [key, value, hydrated]);

  return [value, setValue];
}

