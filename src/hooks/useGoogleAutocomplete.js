import { useEffect, useRef } from "react";

export function useGoogleAutocomplete({
  ensureGoogleMapsApi,
  saveGeocodeCache,
  np,
  setNp,
  setPlaceCoords,
  setAddrValidPlace,
  showAdd,
  selD,
  addrValidPlace,
  setAddrOptionsPlace,
  setNameOptionsPlace,
  setAddrLoadingPlace,
  setNameLoadingPlace,
  newEvent,
  setNewEvent,
  addrValidEvent,
  setAddrOptionsEvent,
  setAddrValidEvent,
  setAddrLoadingEvent,
  newHousing,
  setNewHousing,
  showAddHousing,
  addrValidHousing,
  setAddrOptionsHousing,
  setAddrValidHousing,
  setAddrLoadingHousing,
}) {
  const googleAutocompleteRef = useRef(null);
  const googlePlacesServiceRef = useRef(null);

  const getGoogleComponent = (components, type, mode = "long") => {
    const found = (components || []).find((c) => (c.types || []).includes(type));
    if (!found) return "";
    return mode === "short" ? (found.short_name || "") : (found.long_name || "");
  };

  const shortAddressFromGoogle = (components, fallback = "") => {
    const streetNumber = getGoogleComponent(components, "street_number");
    const route = getGoogleComponent(components, "route");
    const city =
      getGoogleComponent(components, "locality") ||
      getGoogleComponent(components, "sublocality_level_1") ||
      getGoogleComponent(components, "postal_town") ||
      "Los Angeles";
    const state = getGoogleComponent(components, "administrative_area_level_1", "short") || "CA";
    const line = [streetNumber, route].filter(Boolean).join(" ").trim();
    if (line) return `${line}, ${city}, ${state}`;
    if (fallback) {
      const parts = String(fallback).split(",").map((p) => p.trim()).filter(Boolean);
      return parts.slice(0, 3).join(", ");
    }
    return `${city}, ${state}`;
  };

  const ensureGooglePlacesServices = async () => {
    const maps = await ensureGoogleMapsApi();
    if (!maps?.places) throw new Error("Google Places library is not available");
    if (!googleAutocompleteRef.current) {
      googleAutocompleteRef.current = new maps.places.AutocompleteService();
    }
    if (!googlePlacesServiceRef.current) {
      const el = document.createElement("div");
      googlePlacesServiceRef.current = new maps.places.PlacesService(el);
    }
    return { autocomplete: googleAutocompleteRef.current, placesService: googlePlacesServiceRef.current };
  };

  const getGooglePredictions = (autocomplete, input) => new Promise((resolve) => {
    const center = { lat: 34.0522, lng: -118.2437 };
    const req = {
      input,
      componentRestrictions: { country: "us" },
      locationBias: new window.google.maps.Circle({ center, radius: 90000 }).getBounds(),
    };
    autocomplete.getPlacePredictions(req, (predictions, status) => {
      const ok = status === window.google.maps.places.PlacesServiceStatus.OK;
      if (!ok && status !== window.google.maps.places.PlacesServiceStatus.ZERO_RESULTS) {
        console.error("Autocomplete status:", status);
      }
      resolve(ok ? predictions || [] : []);
    });
  });

  const getGooglePlaceDetails = (placesService, placeId) => new Promise((resolve) => {
    placesService.getDetails(
      { placeId, fields: ["name", "formatted_address", "address_components", "geometry"] },
      (result, status) => {
        const ok = status === window.google.maps.places.PlacesServiceStatus.OK;
        resolve(ok ? result : null);
      },
    );
  });

  const fetchAddressSuggestions = async (query) => {
    const q = (query || "").trim();
    if (q.length < 3) return [];
    try {
      const { autocomplete, placesService } = await ensureGooglePlacesServices();
      const predictions = await getGooglePredictions(autocomplete, q);
      const top = predictions.slice(0, 6);
      const detailed = await Promise.all(
        top.map(async (pred) => {
          const details = pred?.place_id ? await getGooglePlaceDetails(placesService, pred.place_id) : null;
          const short = shortAddressFromGoogle(details?.address_components, details?.formatted_address || pred?.description || "");
          const placeName = details?.name || pred?.structured_formatting?.main_text || "";
          const label = placeName && !short.toLowerCase().includes(String(placeName).toLowerCase())
            ? `${placeName} — ${short}`
            : short;
          const lat = details?.geometry?.location?.lat?.();
          const lng = details?.geometry?.location?.lng?.();
          return {
            label,
            value: short,
            placeName,
            lat: Number.isFinite(Number(lat)) ? Number(lat) : null,
            lng: Number.isFinite(Number(lng)) ? Number(lng) : null,
          };
        }),
      );
      const uniq = [];
      const seen = new Set();
      for (const item of detailed) {
        if (!item?.value) continue;
        if (!Number.isFinite(item.lat) || !Number.isFinite(item.lng)) continue;
        const key = `${item.value}|${item.label}`;
        if (seen.has(key)) continue;
        seen.add(key);
        uniq.push(item);
      }
      return uniq;
    } catch (err) {
      console.error("Address suggestions failed:", err);
      return [];
    }
  };

  const selectPlaceNameSuggestion = (opt) => {
    setNp((prev) => ({ ...prev, name: opt.placeName || prev.name, address: opt.value }));
    if (Number.isFinite(opt.lat) && Number.isFinite(opt.lng)) {
      saveGeocodeCache({ name: opt.placeName || np.name, address: opt.value }, { lat: opt.lat, lng: opt.lng });
      setPlaceCoords({ lat: opt.lat, lng: opt.lng });
      setAddrValidPlace(true);
    } else {
      setPlaceCoords({ lat: null, lng: null });
      setAddrValidPlace(false);
    }
    setNameOptionsPlace([]);
    setAddrOptionsPlace([]);
  };

  const selectPlaceAddressSuggestion = (opt) => {
    setNp((prev) => ({ ...prev, address: opt.value }));
    if (Number.isFinite(opt.lat) && Number.isFinite(opt.lng)) {
      saveGeocodeCache({ name: np.name, address: opt.value }, { lat: opt.lat, lng: opt.lng });
      setPlaceCoords({ lat: opt.lat, lng: opt.lng });
      setAddrValidPlace(true);
    } else {
      setPlaceCoords({ lat: null, lng: null });
      setAddrValidPlace(false);
    }
    setAddrOptionsPlace([]);
    setNameOptionsPlace([]);
  };

  const selectEventAddressSuggestion = (opt) => {
    setNewEvent((prev) => ({ ...prev, location: opt.value }));
    if (Number.isFinite(opt.lat) && Number.isFinite(opt.lng)) {
      saveGeocodeCache({ name: newEvent.title, address: opt.value }, { lat: opt.lat, lng: opt.lng });
    }
    setAddrValidEvent(true);
    setAddrOptionsEvent([]);
  };

  const selectHousingAddressSuggestion = (opt) => {
    setNewHousing((prev) => ({ ...prev, address: opt.value }));
    if (Number.isFinite(opt.lat) && Number.isFinite(opt.lng)) {
      saveGeocodeCache({ name: "", address: opt.value }, { lat: opt.lat, lng: opt.lng });
    }
    setAddrValidHousing(true);
    setAddrOptionsHousing([]);
  };

  useEffect(() => {
    const q = (np.address || "").trim();
    if (addrValidPlace) {
      setAddrOptionsPlace([]);
      return;
    }
    if (q.length < 3) {
      setAddrOptionsPlace([]);
      return;
    }
    const t = setTimeout(async () => {
      setAddrLoadingPlace(true);
      const opts = await fetchAddressSuggestions(q);
      setAddrOptionsPlace(opts);
      setAddrLoadingPlace(false);
    }, 280);
    return () => clearTimeout(t);
  }, [np.address, addrValidPlace, setAddrLoadingPlace, setAddrOptionsPlace]);

  useEffect(() => {
    const q = (np.name || "").trim();
    if (!showAdd || !selD || addrValidPlace) {
      setNameOptionsPlace([]);
      setNameLoadingPlace(false);
      return;
    }
    if (q.length < 3) {
      setNameOptionsPlace([]);
      setNameLoadingPlace(false);
      return;
    }
    let canceled = false;
    const t = setTimeout(async () => {
      setNameLoadingPlace(true);
      const opts = await fetchAddressSuggestions(q);
      if (canceled) return;
      setNameOptionsPlace(opts);
      setNameLoadingPlace(false);
    }, 320);
    return () => {
      canceled = true;
      clearTimeout(t);
    };
  }, [np.name, showAdd, selD, addrValidPlace, setNameLoadingPlace, setNameOptionsPlace]);

  useEffect(() => {
    const q = (newEvent.location || "").trim();
    if (addrValidEvent) {
      setAddrOptionsEvent([]);
      return;
    }
    if (q.length < 3) {
      setAddrOptionsEvent([]);
      return;
    }
    const t = setTimeout(async () => {
      setAddrLoadingEvent(true);
      const opts = await fetchAddressSuggestions(q);
      setAddrOptionsEvent(opts);
      setAddrLoadingEvent(false);
    }, 280);
    return () => clearTimeout(t);
  }, [newEvent.location, addrValidEvent, setAddrLoadingEvent, setAddrOptionsEvent]);

  useEffect(() => {
    const q = (newHousing.address || "").trim();
    if (!showAddHousing) {
      setAddrOptionsHousing([]);
      setAddrLoadingHousing(false);
      return;
    }
    if (addrValidHousing) {
      setAddrOptionsHousing([]);
      return;
    }
    if (q.length < 3) {
      setAddrOptionsHousing([]);
      return;
    }
    const t = setTimeout(async () => {
      setAddrLoadingHousing(true);
      const opts = await fetchAddressSuggestions(q);
      setAddrOptionsHousing(opts);
      setAddrLoadingHousing(false);
    }, 280);
    return () => clearTimeout(t);
  }, [newHousing.address, addrValidHousing, showAddHousing, setAddrLoadingHousing, setAddrOptionsHousing]);

  return {
    selectPlaceNameSuggestion,
    selectPlaceAddressSuggestion,
    selectEventAddressSuggestion,
    selectHousingAddressSuggestion,
  };
}

