import { useMemo, useState } from "react";
import { createMarketItem, deleteMarketItem, updateMarketItem, uploadMarketPhotos } from "../lib/market";

const EMPTY_FORM = {
  title: "",
  price: "",
  description: "",
  photos: [],
  telegram: "",
  phone: "",
};

export function useMarketForm({ user, onRequireAuth, onSaved }) {
  const [visible, setVisible] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

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
      price: item?.price || "",
      description: item?.description || "",
      photos: Array.isArray(item?.photos) ? item.photos.map((uri) => ({ uri, uploaded: true })) : [],
      telegram: item?.telegram || "",
      phone: item?.phone || "",
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

  const save = async () => {
    if (!user) {
      onRequireAuth?.();
      return;
    }

    const title = String(form.title || "").trim();
    const description = String(form.description || "").trim();

    if (!title || !description) {
      setError("Заполните название и описание");
      return;
    }

    setSaving(true);
    setError("");
    try {
      const existed = (form.photos || []).filter((p) => p?.uploaded && typeof p.uri === "string").map((p) => p.uri);
      const newAssets = (form.photos || []).filter((p) => !p?.uploaded && p?.uri);
      const uploaded = await uploadMarketPhotos(newAssets);
      const photos = [...existed, ...uploaded].slice(0, 5);

      const payload = {
        title,
        price: String(form.price || "").trim() || null,
        description,
        photos,
        telegram: String(form.telegram || "").trim() || null,
        phone: String(form.phone || "").trim() || null,
        author: user.name || user.email || "Пользователь",
        user_id: user.id || null,
      };

      if (editingItem?.id) {
        const updated = await updateMarketItem(editingItem.id, payload);
        onSaved?.(updated, { mode: "update" });
      } else {
        const created = await createMarketItem(payload);
        onSaved?.(created, { mode: "create" });
      }

      setVisible(false);
      setEditingItem(null);
      setForm(EMPTY_FORM);
    } catch (e) {
      setError(e?.message || "Не удалось сохранить объявление");
    } finally {
      setSaving(false);
    }
  };

  const remove = async () => {
    if (!editingItem?.id) return;
    setSaving(true);
    setError("");
    try {
      await deleteMarketItem(editingItem.id);
      onSaved?.(null, { mode: "delete", source: editingItem });
      setVisible(false);
      setEditingItem(null);
      setForm(EMPTY_FORM);
    } catch (e) {
      setError(e?.message || "Не удалось удалить объявление");
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
      openCreate,
      openEdit,
      close,
      save,
      remove,
    }),
    [visible, editingItem, form, saving, error]
  );
}
