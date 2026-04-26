import { useEffect, useState } from "react";

export function useSessionState(key, initialValue, options = {}) {
  const {
    serialize = (value) => JSON.stringify(value),
    deserialize = (raw) => JSON.parse(raw),
  } = options;

  const resolveInitial = () => (
    typeof initialValue === "function" ? initialValue() : initialValue
  );

  const [value, setValue] = useState(() => {
    try {
      const raw = sessionStorage.getItem(key);
      if (raw === null || raw === "") return resolveInitial();
      return deserialize(raw);
    } catch {
      return resolveInitial();
    }
  });

  useEffect(() => {
    try {
      if (value === null || value === undefined || value === "") {
        sessionStorage.setItem(key, "");
        return;
      }
      sessionStorage.setItem(key, serialize(value));
    } catch {}
  }, [key, value, serialize]);

  return [value, setValue];
}

