import { useCallback, useState } from "react";

export function useUscisNavigation({ setScr, civicsTest }) {
  const [selU, setSelU] = useState(null);
  const [expF, setExpF] = useState(null);

  const openUscisCategory = useCallback((category) => {
    setSelU(category);
    setScr("uscis-cat");
    setExpF(null);
  }, [setScr]);

  const startTest = useCallback(() => {
    civicsTest.start();
    setScr("test");
  }, [civicsTest, setScr]);

  return {
    selU,
    setSelU,
    expF,
    setExpF,
    openUscisCategory,
    startTest,
  };
}

