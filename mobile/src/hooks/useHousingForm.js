import { useMemo, useState } from "react";
import { buildHousingPayload, createHousing, deleteHousing, updateHousing, uploadHousingPhotos } from "../lib/housing";
import { fetchPlaceSuggestions } from "../lib/googlePlaces";

const EMPTY_FORM = {
  title: "",
  address: "",
  district: "",
  type: "studio",
  minPrice: "",
  comment: "",
  telegram: "",
  messageContact: "",
  photos: [],
  addressOptions: [],
  addressSelected: false,
};

export function useHousingForm({ user, onRequireAuth, onSaved }) {
  const [visible, setVisible] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [addressLoading, setAddressLoading] = useState(false);

  const openCreate = () => {
    if (!user) {
      onRequireAuth?.();
      return;
    }
    setEditingItem(null);
    setForm(EMPTY_FORM);
    setError("");
    setVisible(true);
  };

  const openEdit = (item) => {
    setEditingItem(item);
    setForm({
      title: item?.title || "",
      address: item?.address || "",
      district: item?.district || "",
      type: item?.type || "studio",
      minPrice: String(item?.minPrice || ""),
      comment: item?.comment || "",
      telegram: item?.telegram || "",
      messageContact: item?.messageContact || "",
      photos: Array.isArray(item?.photos) ? item.photos.map((uri) => ({ uri, uploaded: true })) : [],
      addressOptions: [],
      addressSelected: Boolean(String(item?.address || "").trim()),
    });
    setError("");
    setVisible(true);
  };

  const close = () => {
    if (saving) return;
    setVisible(false);
    setEditingItem(null);
    setError("");
  };

  const searchAddress = async (value) => {
    const q = String(value || "").trim();
    setForm((prev) => ({ ...prev, address: value, addressSelected: false }));
    if (q.length < 3) {
      setForm((prev) => ({ ...prev, addressOptions: [] }));
      return;
    }

    setAddressLoading(true);
    try {
      const options = await fetchPlaceSuggestions(q);
      setForm((prev) => ({ ...prev, addressOptions: options }));
    } catch {
      setForm((prev) => ({ ...prev, addressOptions: [] }));
    } finally {
      setAddressLoading(false);
    }
  };

  const pickAddress = (option) => {
    setForm((prev) => ({
      ...prev,
      address: option?.value || prev.address,
      title: prev.title || option?.placeName || prev.title,
      addressOptions: [],
      addressSelected: true,
    }));
  };

  const save = async () => {
    if (!user) {
      onRequireAuth?.();
      return;
    }

    if (!String(form.address || "").trim() || !String(form.minPrice || "").trim()) {
      setError("Укажите адрес и цену");
      return;
    }
    if (!form.addressSelected) {
      setError("Выберите адрес из подсказок Google");
      return;
    }

    setSaving(true);
    setError("");

    try {
      const existedPhotos = (form.photos || []).filter((p) => p?.uploaded).map((p) => p.uri);
      const newAssets = (form.photos || []).filter((p) => !p?.uploaded && p?.uri);
      const uploadedPhotos = await uploadHousingPhotos(newAssets);
      const payload = buildHousingPayload(form, user, uploadedPhotos, existedPhotos);

      if (editingItem?.id) {
        const updated = await updateHousing(editingItem.id, payload);
        onSaved?.(updated, { mode: "update" });
      } else {
        const created = await createHousing(payload);
        onSaved?.(created, { mode: "create" });
      }

      setVisible(false);
      setEditingItem(null);
      setForm(EMPTY_FORM);
    } catch (e) {
      setError(e?.message || "Не удалось сохранить жильё");
    } finally {
      setSaving(false);
    }
  };

  const remove = async () => {
    if (!editingItem?.id) return;
    setSaving(true);
    setError("");
    try {
      await deleteHousing(editingItem.id);
      onSaved?.(null, { mode: "delete", source: editingItem });
      setVisible(false);
      setEditingItem(null);
      setForm(EMPTY_FORM);
    } catch (e) {
      setError(e?.message || "Не удалось удалить жильё");
    } finally {
      setSaving(false);
    }
  };

  return useMemo(
    () => ({
      visible,
      editingItem,
      form,
      setForm,
      saving,
      error,
      addressLoading,
      openCreate,
      openEdit,
      close,
      save,
      remove,
      searchAddress,
      pickAddress,
    }),
    [visible, editingItem, form, saving, error, addressLoading]
  );
}
