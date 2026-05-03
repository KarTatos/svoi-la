import { useEffect } from "react";

export function useSvoiRouter({ scr, setScr, user, selPlace, places, selHousing, housing }) {
  const hasActivePlace = Boolean(
    selPlace && (places || []).some((p) => String(p?.id) === String(selPlace?.id))
  );
  const hasActiveHousing = Boolean(
    selHousing && (housing || []).some((h) => String(h?.id) === String(selHousing?.id))
  );

  useEffect(() => {
    if (scr === "place-item" && !hasActivePlace) setScr("places-cat");
  }, [scr, hasActivePlace, setScr]);

  useEffect(() => {
    if (scr === "profile" && !user) setScr("home");
  }, [scr, user, setScr]);

  useEffect(() => {
    if (scr === "my-places" && !user) setScr("home");
  }, [scr, user, setScr]);

  useEffect(() => {
    if (scr === "support" && !user) setScr("home");
  }, [scr, user, setScr]);

  useEffect(() => {
    if (scr === "housing-item" && (housing || []).length > 0 && !hasActiveHousing) setScr("housing");
  }, [scr, housing, hasActiveHousing, setScr]);

  return { scr, setScr };
}

