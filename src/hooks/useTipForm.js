import { useState } from "react";

export function useTipForm({
  user,
  selTC,
  tips,
  canManageTip,
  setTips,
  exp,
  setExp,
  dbAddTip,
  dbUpdateTip,
  dbDeleteTip,
  uploadPhoto,
  limitCardText,
  encodeRichText,
  onRequireAuth,
}) {
  const [showAddTip, setShowAddTip] = useState(false);
  const [newTip, setNewTip] = useState({ title: "", text: "" });
  const [newTipPhotos, setNewTipPhotos] = useState([]);
  const [editingTip, setEditingTip] = useState(null);

  const resetTipForm = () => {
    setShowAddTip(false);
    setEditingTip(null);
    setNewTip({ title: "", text: "" });
    setNewTipPhotos([]);
  };

  const openAddTipForm = () => {
    if (!user) {
      onRequireAuth?.();
      return;
    }
    setEditingTip(null);
    setNewTip({ title: "", text: "" });
    setNewTipPhotos([]);
    setShowAddTip(true);
  };

  const handleTipPhotos = (e) => {
    const files = Array.from(e.target.files).slice(0, 3);
    const newFiles = files.map((f) => ({ file: f, name: f.name, preview: URL.createObjectURL(f) }));
    setNewTipPhotos((prev) => [...prev, ...newFiles].slice(0, 3));
  };

  const startEditTip = (tip) => {
    if (!canManageTip(tip)) {
      alert("Редактировать совет может только автор или админ.");
      return;
    }
    setEditingTip(tip);
    setNewTip({ title: tip.title || "", text: tip.text || "" });
    setNewTipPhotos(
      (tip.photos || [])
        .filter((ph) => typeof ph === "string" && ph.startsWith("http"))
        .map((ph) => ({ name: "existing", preview: ph })),
    );
    setShowAddTip(true);
  };

  const handleDeleteTip = async (tipId) => {
    const item = tips.find((t) => t.id === tipId);
    if (!canManageTip(item)) {
      alert("Удалять совет может только автор или админ.");
      return;
    }
    if (!window.confirm("Удалить совет?")) return;
    const { error } = await dbDeleteTip(tipId);
    if (error) {
      alert(error.message || "Не удалось удалить совет");
      return;
    }
    setTips((prev) => prev.filter((t) => t.id !== tipId));
    setShowAddTip(false);
    setEditingTip(null);
    if (exp === `tip-${tipId}`) setExp(null);
  };

  const handleAddTip = async () => {
    if (!newTip.title || !newTip.text || !user || !selTC) return;
    const safeTipText = limitCardText(newTip.text).trim();
    const uploaded = [];
    for (const p of newTipPhotos) {
      if (p.file) {
        const url = await uploadPhoto(p.file);
        if (url) uploaded.push(url);
      } else if (p.preview && p.preview.startsWith("http")) {
        uploaded.push(p.preview);
      }
    }
    const dbData = {
      category: selTC.id,
      title: newTip.title,
      text: encodeRichText(safeTipText, uploaded),
      author: user.name,
      user_id: user.id,
    };
    if (editingTip) {
      await dbUpdateTip(editingTip.id, dbData);
      setTips((prev) =>
        prev.map((t) =>
          t.id === editingTip.id
            ? { ...t, cat: selTC.id, title: newTip.title, text: safeTipText, photos: uploaded }
            : t,
        ),
      );
    } else {
      const { data } = await dbAddTip(dbData);
      const newId = data?.[0]?.id || Date.now();
      setTips((prev) => [
        {
          id: newId,
          cat: selTC.id,
          author: user.name,
          userId: user.id,
          title: newTip.title,
          text: safeTipText,
          photos: uploaded,
          likes: 0,
          views: 0,
          comments: [],
          fromDB: true,
        },
        ...prev,
      ]);
    }
    resetTipForm();
  };

  return {
    showAddTip,
    setShowAddTip,
    newTip,
    setNewTip,
    newTipPhotos,
    setNewTipPhotos,
    editingTip,
    setEditingTip,
    resetTipForm,
    openAddTipForm,
    handleTipPhotos,
    startEditTip,
    handleDeleteTip,
    handleAddTip,
  };
}
