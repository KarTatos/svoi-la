import { useState } from "react";
import MarketCard from "../cards/MarketCard";
import MarketDetailModal from "../modals/MarketDetailModal";
import MarketFormModal from "../forms/MarketFormModal";

const EMPTY_FORM = {
  title: "", price: "", description: "",
  photos: [], telegram: "", phone: "",
};

export default function MarketScreen({
  T, cd, bk, pl, iS,
  user, items, liked,
  onGoHome, onToggleLike, onShare, onRequireAuth,
  trackView, onAdd, onUpdate, onDelete, canManage, uploadPhoto,
}) {
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);

  const query = search.trim().toLowerCase();
  const filtered = items.filter((it) =>
    !query ||
    it.title?.toLowerCase().includes(query) ||
    it.description?.toLowerCase().includes(query)
  );

  const openAdd = () => {
    if (!user) { onRequireAuth(); return; }
    setEditing(null);
    setForm(EMPTY_FORM);
    setShowForm(true);
  };

  const openEdit = (item) => {
    setEditing(item);
    setForm({
      title: item.title || "",
      price: item.price || "",
      description: item.description || "",
      photos: item.photos || [],
      telegram: item.telegram || "",
      phone: item.phone || "",
    });
    setSelected(null);
    setShowForm(true);
  };

  const handleSave = async () => {
    const title = form.title.trim();
    const description = form.description.trim();
    if (!title || !description) return;
    setSaving(true);

    const uploadedPhotos = [];
    for (const p of form.photos || []) {
      if (typeof p === "string") {
        uploadedPhotos.push(p);
      } else if (p.file) {
        const url = await uploadPhoto(p.file);
        if (url) uploadedPhotos.push(url);
      }
    }

    const payload = {
      title,
      price: form.price.trim() || null,
      description,
      photos: uploadedPhotos,
      telegram: form.telegram.trim() || null,
      phone: form.phone.trim() || null,
      author: user?.name || user?.email?.split("@")[0] || "Аноним",
      user_id: user?.id || null,
    };

    if (editing) {
      await onUpdate(editing.id, payload);
    } else {
      await onAdd(payload);
    }

    setSaving(false);
    setShowForm(false);
    setEditing(null);
  };

  const handleDelete = async () => {
    if (!editing) return;
    setSaving(true);
    await onDelete(editing.id);
    setSaving(false);
    setShowForm(false);
    setEditing(null);
  };

  return (
    <div>
      <button onClick={onGoHome} style={bk}>← Главная</button>

      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", margin: "4px 0 14px" }}>
        <h2 style={{ fontSize: 20, fontWeight: 700, margin: 0 }}>🏷️ Продам</h2>
        <button
          onClick={openAdd}
          style={{ width: 38, height: 38, borderRadius: 12, border: `1.5px solid ${T.primary}55`, background: T.primaryLight, color: T.primary, fontSize: 28, lineHeight: 1, cursor: "pointer", fontFamily: "inherit", display: "flex", alignItems: "center", justifyContent: "center", padding: 0, flexShrink: 0 }}
          title="Добавить объявление"
        >+</button>
      </div>

      <input
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder="Поиск объявлений..."
        style={{ ...iS, marginBottom: 14 }}
      />

      {filtered.length === 0 ? (
        <div style={{ ...cd, padding: 20, textAlign: "center", fontSize: 13, color: T.mid }}>
          {query ? `Ничего не найдено по запросу «${search}»` : "Объявлений пока нет. Будьте первым!"}
        </div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
          {filtered.map((item) => (
            <MarketCard
              key={item.id}
              item={item}
              isLiked={!!liked[`market-${item.id}`]}
              T={T} cd={cd} pl={pl}
              onClick={() => { setSelected(item); trackView("market", item); }}
              onToggleLike={() => onToggleLike(item.id, "market")}
            />
          ))}
        </div>
      )}

      {selected && (
        <MarketDetailModal
          item={selected}
          isLiked={!!liked[`market-${selected.id}`]}
          canEdit={canManage(selected)}
          T={T} cd={cd} pl={pl}
          onClose={() => setSelected(null)}
          onToggleLike={() => onToggleLike(selected.id, "market")}
          onShare={() => onShare(selected)}
          onEdit={() => openEdit(selected)}
          onDelete={async () => { await onDelete(selected.id); setSelected(null); }}
        />
      )}

      <MarketFormModal
        open={showForm}
        editing={editing}
        form={form}
        setForm={setForm}
        saving={saving}
        onSave={handleSave}
        onDelete={handleDelete}
        onClose={() => { setShowForm(false); setEditing(null); }}
        T={T} cd={cd} pl={pl} iS={iS}
        user={user}
        onRequireAuth={onRequireAuth}
      />
    </div>
  );
}
