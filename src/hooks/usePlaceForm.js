import { useState } from "react";

export function usePlaceForm({
  user,
  selD,
  selPC,
  places,
  selPlace,
  canManagePlace,
  setPlaces,
  setSelPlace,
  setSelD,
  setScr,
  setExp,
  addrValidPlace,
  setAddrValidPlace,
  setNameOptionsPlace,
  setAddrOptionsPlace,
  dbAddPlace,
  dbUpdatePlace,
  dbDeletePlace,
  uploadPhoto,
  limitCardText,
  PLACE_CATS,
  DISTRICTS,
  onRequireAuth,
}) {
  const [showAdd, setShowAdd] = useState(false);
  const [np, setNp] = useState({ name: "", cat: "", district: "", address: "", tip: "" });
  const [placeCoords, setPlaceCoords] = useState({ lat: null, lng: null });
  const [nPhotos, setNPhotos] = useState([]);
  const [editingPlace, setEditingPlace] = useState(null);
  const [uploading, setUploading] = useState(false);

  const resetPlaceForm = (districtId = "") => {
    setShowAdd(false);
    setEditingPlace(null);
    setNp({ name: "", cat: "", district: districtId, address: "", tip: "" });
    setPlaceCoords({ lat: null, lng: null });
    setNPhotos([]);
    setAddrValidPlace(false);
    setNameOptionsPlace([]);
    setAddrOptionsPlace([]);
  };

  const handleAddPlace = async () => {
    if (!np.name || !np.cat || !np.tip || !user) return;
    const selectedDistrictId = np.district || selD?.id;
    if (!selectedDistrictId) {
      alert("Выберите район.");
      return;
    }
    if (!np.address.trim() || !addrValidPlace) {
      alert("Выберите реальный адрес из подсказок.");
      return;
    }
    if (!Number.isFinite(placeCoords.lat) || !Number.isFinite(placeCoords.lng)) {
      alert("Выберите адрес из подсказок, чтобы сохранить точку на карте.");
      return;
    }

    setUploading(true);
    try {
      const safeTip = limitCardText(np.tip).trim();
      const uploadedUrls = [];
      for (const p of nPhotos) {
        if (p.file) {
          const url = await uploadPhoto(p.file);
          if (url) uploadedUrls.push(url);
          else console.warn("Photo upload failed for:", p.name);
        } else if (p.preview && p.preview.startsWith("http")) {
          uploadedUrls.push(p.preview);
        }
      }

      if (editingPlace) {
        const allPhotos = uploadedUrls;
        const updates = {
          name: np.name,
          category: np.cat,
          district: selectedDistrictId,
          address: np.address,
          tip: safeTip,
          img: PLACE_CATS.find((c) => c.id === np.cat)?.icon || editingPlace.img,
          photos: allPhotos,
          lat: placeCoords.lat,
          lng: placeCoords.lng,
        };
        if (editingPlace.fromDB) await dbUpdatePlace(editingPlace.id, updates);
        setPlaces((prev) =>
          prev.map((p) =>
            p.id === editingPlace.id
              ? {
                  ...p,
                  name: np.name,
                  cat: np.cat,
                  district: selectedDistrictId,
                  address: np.address,
                  tip: safeTip,
                  img: updates.img,
                  photos: allPhotos,
                  lat: placeCoords.lat,
                  lng: placeCoords.lng,
                }
              : p,
          ),
        );
        setSelPlace((prev) =>
          prev?.id === editingPlace.id
            ? {
                ...prev,
                name: np.name,
                cat: np.cat,
                district: selectedDistrictId,
                address: np.address,
                tip: safeTip,
                img: updates.img,
                photos: allPhotos,
                lat: placeCoords.lat,
                lng: placeCoords.lng,
              }
            : prev,
        );
        const nextDistrict = DISTRICTS.find((d) => d.id === selectedDistrictId) || null;
        if (nextDistrict) setSelD(nextDistrict);
      } else {
        const dbData = {
          name: np.name,
          category: np.cat,
          district: selectedDistrictId,
          address: np.address || "",
          tip: safeTip,
          rating: 0,
          added_by: user.name,
          user_id: user.id,
          img: PLACE_CATS.find((c) => c.id === np.cat)?.icon || "📍",
          photos: uploadedUrls,
          lat: placeCoords.lat,
          lng: placeCoords.lng,
        };
        const { data } = await dbAddPlace(dbData);
        const newId = data?.[0]?.id || Date.now();
        setPlaces((prev) => [
          {
            id: newId,
            cat: np.cat,
            district: selectedDistrictId,
            name: np.name,
            address: np.address,
            tip: safeTip,
            addedBy: user.name,
            userId: user.id,
            img: dbData.img,
            photos: uploadedUrls,
            likes: 0,
            views: 0,
            comments: [],
            lat: placeCoords.lat,
            lng: placeCoords.lng,
            fromDB: true,
          },
          ...prev,
        ]);
      }

      resetPlaceForm(selD?.id || "");
    } catch (err) {
      console.error("Add place error:", err);
      alert("Ошибка при сохранении. Попробуйте ещё раз.");
    } finally {
      setUploading(false);
    }
  };

  const handleDeletePlace = async (placeId) => {
    const item = places.find((p) => p.id === placeId);
    if (!canManagePlace(item)) {
      alert("Редактировать и удалять это место может только автор или админ.");
      return false;
    }
    if (!window.confirm("Удалить это место?")) return false;

    const { error } = await dbDeletePlace(placeId);
    if (error) {
      alert(error.message || "Не удалось удалить место");
      return false;
    }

    setPlaces((prev) => prev.filter((p) => p.id !== placeId));
    if (selPlace?.id === placeId) {
      setSelPlace(null);
      setScr("places-cat");
    }
    setExp(null);
    if (editingPlace?.id === placeId) {
      setShowAdd(false);
      setEditingPlace(null);
      setNPhotos([]);
    }
    return true;
  };

  const startEditPlace = (place) => {
    if (!canManagePlace(place)) {
      alert("Редактировать это место может только автор или админ.");
      return;
    }
    setEditingPlace(place);
    setNp({
      name: place.name,
      cat: place.cat,
      district: place.district || selD?.id || "",
      address: place.address || "",
      tip: place.tip,
    });
    setPlaceCoords({
      lat: Number.isFinite(Number(place.lat)) ? Number(place.lat) : null,
      lng: Number.isFinite(Number(place.lng)) ? Number(place.lng) : null,
    });
    setNPhotos(
      (place.photos || [])
        .filter((ph) => typeof ph === "string" && ph.startsWith("http"))
        .map((ph) => ({ name: "existing", preview: ph })),
    );
    setAddrValidPlace(Number.isFinite(Number(place.lat)) && Number.isFinite(Number(place.lng)));
    setNameOptionsPlace([]);
    setAddrOptionsPlace([]);
    setShowAdd(true);
  };

  const openAddForm = () => {
    if (!user) {
      onRequireAuth?.();
      return;
    }
    setEditingPlace(null);
    setNp({ name: "", cat: selPC?.id || "", district: selD?.id || "", address: "", tip: "" });
    setPlaceCoords({ lat: null, lng: null });
    setNPhotos([]);
    setAddrValidPlace(false);
    setNameOptionsPlace([]);
    setAddrOptionsPlace([]);
    setShowAdd(true);
  };

  const handlePhotos = (e) => {
    const files = Array.from(e.target.files).slice(0, 5);
    const newFiles = files.map((f) => ({ file: f, name: f.name, preview: URL.createObjectURL(f) }));
    setNPhotos((prev) => [...prev, ...newFiles].slice(0, 5));
  };

  return {
    showAdd,
    setShowAdd,
    np,
    setNp,
    placeCoords,
    setPlaceCoords,
    nPhotos,
    setNPhotos,
    editingPlace,
    setEditingPlace,
    uploading,
    handleAddPlace,
    handleDeletePlace,
    startEditPlace,
    openAddForm,
    handlePhotos,
    resetPlaceForm,
  };
}
