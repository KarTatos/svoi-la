import { useState } from "react";
import { createTip, deleteTip, updateTip } from "../lib/tips";

export function useTipForm({ user, selectedCategory, onRequireAuth, onSaved }) {
  const [visible, setVisible] = useState(false);
  const [editingTip, setEditingTip] = useState(null);
  const [form, setForm] = useState({ title: "", text: "" });
  const [photos, setPhotos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const reset = () => {
    setVisible(false);
    setEditingTip(null);
    setForm({ title: "", text: "" });
    setPhotos([]);
    setError("");
  };

  const openCreate = () => {
    if (!user) {
      onRequireAuth?.();
      return;
    }
    setEditingTip(null);
    setForm({ title: "", text: "" });
    setPhotos([]);
    setVisible(true);
  };

  const openEdit = (tip) => {
    if (!tip) return;
    setEditingTip(tip);
    setForm({ title: tip.title || "", text: tip.text || "" });
    setPhotos([]);
    setVisible(true);
  };

  const submit = async () => {
    if (!user) return;
    if (!selectedCategory?.id) {
      setError("Выберите категорию");
      return;
    }
    if (!form.title.trim() || !form.text.trim()) {
      setError("Заполните заголовок и текст");
      return;
    }

    setLoading(true);
    setError("");
    try {
      let saved;
      if (editingTip) {
        saved = await updateTip({
          id: editingTip.id,
          cat: selectedCategory.id,
          title: form.title,
          text: form.text,
          photos,
          existingPhotos: editingTip.photos || [],
          user,
        });
      } else {
        saved = await createTip({
          cat: selectedCategory.id,
          title: form.title,
          text: form.text,
          photos,
          user,
        });
      }
      onSaved?.(saved, { mode: editingTip ? "edit" : "create", source: editingTip });
      reset();
    } catch (e) {
      setError(e?.message || "Ошибка сохранения");
    } finally {
      setLoading(false);
    }
  };

  const remove = async () => {
    if (!editingTip?.id) return;
    setLoading(true);
    setError("");
    try {
      await deleteTip(editingTip.id);
      onSaved?.(null, { mode: "delete", source: editingTip });
      reset();
    } catch (e) {
      setError(e?.message || "Ошибка удаления");
    } finally {
      setLoading(false);
    }
  };

  const removeTip = async (tip) => {
    if (!tip?.id) return;
    setLoading(true);
    setError("");
    try {
      await deleteTip(tip.id);
      onSaved?.(null, { mode: "delete", source: tip });
      if (editingTip?.id === tip.id) reset();
    } catch (e) {
      setError(e?.message || "Ошибка удаления");
    } finally {
      setLoading(false);
    }
  };

  return {
    visible,
    editingTip,
    form,
    photos,
    loading,
    error,
    setVisible,
    setForm,
    setPhotos,
    openCreate,
    openEdit,
    submit,
    remove,
    removeTip,
    reset,
  };
}
