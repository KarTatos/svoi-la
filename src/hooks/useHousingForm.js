import { useState } from "react";

const EMPTY_HOUSING = {
  address: "",
  district: "",
  type: "studio",
  minPrice: "",
  comment: "",
  telegram: "",
  messageContact: "",
};

function normalizeAddressText(value) {
  const text = String(value || "").trim();
  if (!text) return "";
  return text
    .replace(/\s+/g, " ")
    .replace(/,\s*USA$/i, "")
    .replace(/,\s*CA$/i, "");
}

function parseTagValue(tags, prefix) {
  const hit = (Array.isArray(tags) ? tags : []).find((t) => String(t).startsWith(prefix)) || "";
  return String(hit).replace(prefix, "");
}

function parseComment(tags) {
  const raw = parseTagValue(tags, "comment:");
  try {
    return decodeURIComponent(raw);
  } catch {
    return raw;
  }
}

function mapHousingRow(row, decodeHousingPhotos) {
  const photos = decodeHousingPhotos(row.photo);
  return {
    id: row.id,
    title: row.title || "",
    address: normalizeAddressText(row.address || ""),
    district: row.district || "",
    type: row.type || "studio",
    minPrice: Number(row.min_price || 0),
    options: Array.isArray(row.price_options) ? row.price_options : [],
    beds: Number(row.beds || 0),
    baths: Number(row.baths || 0),
    updatedLabel: row.updated_label || "",
    tags: (Array.isArray(row.tags) ? row.tags : []).filter(
      (t) =>
        !String(t).startsWith("contact_tg:") &&
        !String(t).startsWith("contact_msg:") &&
        !String(t).startsWith("comment:"),
    ),
    comment: parseComment(row.tags),
    telegram: parseTagValue(row.tags, "contact_tg:"),
    messageContact: parseTagValue(row.tags, "contact_msg:"),
    photos,
    photo: photos[0] || "",
    userId: row.user_id,
    likes: row.likes_count || 0,
    views: Number(row.views || 0),
    fromDB: true,
  };
}

export function useHousingForm({
  user,
  isAdmin,
  housing,
  selHousing,
  canManageHousing,
  setHousing,
  setSelHousing,
  setScr,
  setAddrValidHousing,
  setAddrOptionsHousing,
  dbAddHousing,
  dbUpdateHousing,
  dbDeleteHousing,
  uploadPhoto,
  encodeHousingPhotos,
  decodeHousingPhotos,
  onRequireAuth,
}) {
  const [showAddHousing, setShowAddHousing] = useState(false);
  const [editingHousing, setEditingHousing] = useState(null);
  const [newHousing, setNewHousing] = useState(EMPTY_HOUSING);
  const [newHousingPhotos, setNewHousingPhotos] = useState([]);

  const resetHousingForm = () => {
    setNewHousing(EMPTY_HOUSING);
    setNewHousingPhotos([]);
    setAddrValidHousing(false);
    setAddrOptionsHousing([]);
    setEditingHousing(null);
    setShowAddHousing(false);
  };

  const openAddHousingForm = () => {
    if (!user) {
      onRequireAuth?.();
      return;
    }
    setEditingHousing(null);
    setNewHousing(EMPTY_HOUSING);
    setNewHousingPhotos([]);
    setAddrValidHousing(false);
    setAddrOptionsHousing([]);
    setShowAddHousing(true);
  };

  const handleAddHousing = async () => {
    if (!user) {
      onRequireAuth?.();
      return;
    }
    if (!newHousing.address.trim() || !newHousing.minPrice) return;
    if (editingHousing && !canManageHousing(editingHousing)) {
      alert("Редактировать жильё может только автор или админ.");
      return;
    }

    const uploaded = [];
    for (const p of newHousingPhotos) {
      if (p.file) {
        const url = await uploadPhoto(p.file);
        if (url) uploaded.push(url);
      } else if (p.preview && p.preview.startsWith("http")) {
        uploaded.push(p.preview);
      }
    }

    const typeMap = { room: "Комната", studio: "Студия", "1bd": "1 bd", "2bd": "2 bd" };
    const title = `${typeMap[newHousing.type] || "Жильё"} · ${newHousing.district.trim() || "LA"}`;
    const contactTags = [];
    const tg = (newHousing.telegram || "").trim();
    const msg = (newHousing.messageContact || "").trim();
    const comment = String(newHousing.comment || "").slice(0, 1000).trim();
    if (tg) contactTags.push(`contact_tg:${tg}`);
    if (msg) contactTags.push(`contact_msg:${msg}`);
    if (comment) contactTags.push(`comment:${encodeURIComponent(comment)}`);

    const payload = {
      title,
      address: normalizeAddressText(newHousing.address.trim()),
      district: newHousing.district.trim(),
      type: (newHousing.type || "studio").trim(),
      min_price: Number(newHousing.minPrice || 0),
      price_options: [],
      beds: 0,
      baths: 0,
      updated_label: "",
      tags: contactTags,
      photo: encodeHousingPhotos(uploaded),
      user_id: user.id,
    };

    const saveFn = editingHousing ? dbUpdateHousing : dbAddHousing;
    const saveRes = editingHousing
      ? await saveFn(editingHousing.id, payload, isAdmin ? null : user.id)
      : await saveFn(payload);
    const { data, error } = saveRes || {};
    if (error) {
      alert(error.message || "Не удалось сохранить жильё");
      return;
    }

    const row = data?.[0];
    if (!row) {
      resetHousingForm();
      return;
    }
    const mapped = mapHousingRow(row, decodeHousingPhotos);
    if (editingHousing) {
      setHousing((prev) => prev.map((h) => (h.id === editingHousing.id ? mapped : h)));
    } else {
      setHousing((prev) => [mapped, ...prev]);
    }

    resetHousingForm();
  };

  const startEditHousing = (item) => {
    if (!item) return;
    if (!canManageHousing(item)) {
      alert("Редактировать жильё может только автор или админ.");
      return;
    }
    setEditingHousing(item);
    setNewHousing({
      address: item.address || "",
      district: item.district || "",
      type: item.type || "studio",
      minPrice: String(item.minPrice || ""),
      comment: item.comment || "",
      telegram: item.telegram || "",
      messageContact: item.messageContact || "",
    });
    setNewHousingPhotos(
      (item.photos || [])
        .filter((ph) => typeof ph === "string" && ph.startsWith("http"))
        .map((ph) => ({ name: "existing", preview: ph })),
    );
    setAddrValidHousing(!!(item.address || "").trim());
    setAddrOptionsHousing([]);
    setShowAddHousing(true);
  };

  const handleDeleteHousing = async (housingId) => {
    if (!housingId) return;
    const item = housing.find((h) => h.id === housingId);
    if (!canManageHousing(item)) {
      alert("Удалять жильё может только автор или админ.");
      return;
    }
    if (!confirm("Удалить это жильё?")) return;

    const { error } = await dbDeleteHousing(housingId, isAdmin ? null : user.id);
    if (error) {
      alert(error.message || "Не удалось удалить жильё");
      return;
    }

    setHousing((prev) => prev.filter((h) => h.id !== housingId));
    if (selHousing?.id === housingId) {
      setSelHousing(null);
      setScr("housing");
    }
    setEditingHousing(null);
    setShowAddHousing(false);
  };

  return {
    showAddHousing,
    setShowAddHousing,
    editingHousing,
    setEditingHousing,
    newHousing,
    setNewHousing,
    newHousingPhotos,
    setNewHousingPhotos,
    resetHousingForm,
    openAddHousingForm,
    handleAddHousing,
    startEditHousing,
    handleDeleteHousing,
  };
}
