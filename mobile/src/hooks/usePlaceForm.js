import { useEffect, useMemo, useRef, useState } from "react";
import { PLACE_CATS } from "../config/places";
import { createPlace, updatePlace, uploadPlacePhotos } from "../lib/places";
import { fetchPlaceSuggestions } from "../lib/googlePlaces";

const CARD_TEXT_MAX = 280;
const EN_TEXT_RE = /[^A-Za-z0-9 .,'\-#/&()]/g;
const sanitizeEn = (v) => String(v || "").replace(EN_TEXT_RE, "");

export function usePlaceForm({
  user,
  initialDistrict = "",
  initialCategory = "",
  initialData = null,   // existing place object for edit mode
  onSaved,
}) {
  const editMode = Boolean(initialData?.id);

  const [form, setForm] = useState(() => ({
    name: initialData?.name || "",
    cat: initialData?.cat || initialCategory || "",
    district: initialData?.district || initialDistrict || "",
    address: initialData?.address || "",
    tip: initialData?.tip || "",
  }));

  const [placeCoords, setPlaceCoords] = useState(() => ({
    lat: initialData?.lat ?? null,
    lng: initialData?.lng ?? null,
  }));

  // In edit mode address is already validated (has coords from DB)
  const [addrValidPlace, setAddrValidPlace] = useState(() => editMode);

  const [nameOptions, setNameOptions] = useState([]);
  const [addrOptions, setAddrOptions] = useState([]);
  const [nameLoading, setNameLoading] = useState(false);
  const [addrLoading, setAddrLoading] = useState(false);

  // Existing photos (URLs) + new assets to upload
  const [existingPhotos, setExistingPhotos] = useState(() =>
    Array.isArray(initialData?.photos) ? initialData.photos : []
  );
  const [photos, setPhotos] = useState([]); // new photo assets

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const nameTimer = useRef(null);
  const addrTimer = useRef(null);

  useEffect(() => {
    if (!editMode) {
      setForm((prev) => ({
        ...prev,
        district: prev.district || initialDistrict,
        cat: prev.cat || initialCategory,
      }));
    }
  }, [initialDistrict, initialCategory]);

  const reset = () => {
    setForm({
      name: initialData?.name || "",
      cat: initialData?.cat || initialCategory || "",
      district: initialData?.district || initialDistrict || "",
      address: initialData?.address || "",
      tip: initialData?.tip || "",
    });
    setPlaceCoords({ lat: initialData?.lat ?? null, lng: initialData?.lng ?? null });
    setAddrValidPlace(editMode);
    setNameOptions([]);
    setAddrOptions([]);
    setPhotos([]);
    setExistingPhotos(Array.isArray(initialData?.photos) ? initialData.photos : []);
    setError("");
  };

  const onChangeField = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const onChangeName = (value) => {
    const clean = sanitizeEn(value);
    setForm((prev) => ({ ...prev, name: clean }));
    if (!editMode) {
      setAddrValidPlace(false);
      setPlaceCoords({ lat: null, lng: null });
      setAddrOptions([]);
    }

    if (nameTimer.current) clearTimeout(nameTimer.current);
    nameTimer.current = setTimeout(async () => {
      const q = clean.trim();
      if (q.length < 3) { setNameOptions([]); setNameLoading(false); return; }
      setNameLoading(true);
      try {
        const data = await fetchPlaceSuggestions(q);
        setNameOptions(data);
      } catch {
        setNameOptions([]);
      } finally {
        setNameLoading(false);
      }
    }, 280);
  };

  const onChangeAddress = (value) => {
    const clean = sanitizeEn(value);
    setForm((prev) => ({ ...prev, address: clean }));
    setAddrValidPlace(false);
    setPlaceCoords({ lat: null, lng: null });

    if (addrTimer.current) clearTimeout(addrTimer.current);
    addrTimer.current = setTimeout(async () => {
      const q = clean.trim();
      if (q.length < 3) { setAddrOptions([]); setAddrLoading(false); return; }
      setAddrLoading(true);
      try {
        const data = await fetchPlaceSuggestions(q);
        setAddrOptions(data);
      } catch {
        setAddrOptions([]);
      } finally {
        setAddrLoading(false);
      }
    }, 280);
  };

  const onSelectNameSuggestion = (opt) => {
    setForm((prev) => ({ ...prev, name: opt.placeName || opt.value, address: opt.value }));
    setPlaceCoords({ lat: opt.lat, lng: opt.lng });
    setAddrValidPlace(true);
    setNameOptions([]);
    setAddrOptions([]);
  };

  const onSelectAddressSuggestion = (opt) => {
    setForm((prev) => ({ ...prev, address: opt.value }));
    setPlaceCoords({ lat: opt.lat, lng: opt.lng });
    setAddrValidPlace(true);
    setAddrOptions([]);
  };

  const canSubmit = useMemo(() => {
    return (
      !!form.name.trim() &&
      !!form.cat &&
      !!form.district &&
      !!form.address.trim() &&
      !!form.tip.trim() &&
      Number.isFinite(placeCoords.lat) &&
      Number.isFinite(placeCoords.lng) &&
      addrValidPlace
    );
  }, [form, placeCoords, addrValidPlace]);

  const submit = async () => {
    setError("");
    if (!user?.id) {
      setError("Нужно войти в аккаунт");
      return { ok: false, reason: "auth" };
    }
    if (!canSubmit) {
      setError(
        editMode && !addrValidPlace
          ? "Если меняете адрес — выберите его из подсказок"
          : "Заполните обязательные поля и выберите адрес из подсказок"
      );
      return { ok: false, reason: "validation" };
    }

    setLoading(true);
    try {
      // Upload new photos, keep existing URLs
      const uploaded = await uploadPlacePhotos(photos);
      if (uploaded.length !== photos.length) throw new Error("Не все фото загрузились");
      const allPhotos = [...existingPhotos, ...uploaded];

      const catIcon = PLACE_CATS.find((c) => c.id === form.cat)?.icon || "📍";

      const payload = {
        name: form.name.trim(),
        category: form.cat,
        district: form.district,
        address: form.address.trim(),
        tip: form.tip.trim().slice(0, CARD_TEXT_MAX),
        img: catIcon,
        photos: allPhotos,
        lat: placeCoords.lat,
        lng: placeCoords.lng,
      };

      let saved;
      if (editMode) {
        saved = await updatePlace(initialData.id, payload);
      } else {
        saved = await createPlace({
          ...payload,
          rating: 0,
          added_by: user.name || user.email || "пользователь",
          user_id: user.id,
        });
      }

      onSaved?.(saved);
      if (!editMode) reset();
      return { ok: true, data: saved };
    } catch (e) {
      setError(e?.message || "Ошибка при сохранении");
      return { ok: false, reason: "submit" };
    } finally {
      setLoading(false);
    }
  };

  return {
    editMode,
    form: {
      ...form,
      photos,
      existingPhotos,
      nameOptions,
      addrOptions,
      nameLoading,
      addrLoading,
      addrValidPlace,
    },
    state: {
      loading,
      error,
      canSubmit,
      placeCoords,
    },
    actions: {
      reset,
      submit,
      onChangeField,
      onChangeName,
      onChangeAddress,
      onSelectNameSuggestion,
      onSelectAddressSuggestion,
      onPhotosChange: setPhotos,
      onRemoveExistingPhoto: (url) =>
        setExistingPhotos((prev) => prev.filter((p) => p !== url)),
    },
  };
}
