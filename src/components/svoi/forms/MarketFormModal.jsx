import { useRef, useState } from "react";

const MAX_PHOTOS = 5;

export default function MarketFormModal({
  open,
  editing,
  form,
  setForm,
  saving,
  onSave,
  onDelete,
  onClose,
  T,
  cd,
  pl,
  iS,
  user,
  onRequireAuth,
}) {
  const fileRef = useRef(null);
  const [photoError, setPhotoError] = useState("");

  if (!open) return null;

  const field = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));
  const valid = String(form.title || "").trim() && String(form.description || "").trim();

  const handleFileChange = (e) => {
    setPhotoError("");
    const files = Array.from(e.target.files || []);
    const existing = form.photos || [];
    const slots = MAX_PHOTOS - existing.length;
    if (slots <= 0) { setPhotoError(`Максимум ${MAX_PHOTOS} фото`); return; }
    const toAdd = files.slice(0, slots).map((file) => ({ file, preview: URL.createObjectURL(file) }));
    setForm((f) => ({ ...f, photos: [...(f.photos || []), ...toAdd] }));
    e.target.value = "";
  };

  const removePhoto = (idx) => {
    setForm((f) => {
      const next = [...(f.photos || [])];
      const removed = next.splice(idx, 1)[0];
      if (removed?.preview) URL.revokeObjectURL(removed.preview);
      return { ...f, photos: next };
    });
  };

  const photoSrc = (p) => (typeof p === "string" ? p : p.preview);

  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 200, background: "rgba(0,0,0,0.45)", display: "flex", alignItems: "flex-end" }}>
      <div style={{ width: "100%", maxWidth: 480, margin: "0 auto", background: T.card, borderRadius: "20px 20px 0 0", maxHeight: "93vh", overflowY: "auto", padding: "20px 16px 40px" }}>

        {/* Header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 18 }}>
          <div style={{ fontSize: 17, fontWeight: 700 }}>{editing ? "Редактировать" : "Новое объявление"}</div>
          <button onClick={onClose} style={{ background: "none", border: "none", fontSize: 24, cursor: "pointer", color: T.mid, lineHeight: 1, padding: 0, fontFamily: "inherit" }}>×</button>
        </div>

        {/* Photos */}
        <div style={{ marginBottom: 16 }}>
          <div style={{ fontSize: 12, color: T.mid, marginBottom: 8 }}>Фото (до {MAX_PHOTOS})</div>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            {(form.photos || []).map((p, i) => (
              <div key={i} style={{ position: "relative", width: 72, height: 72, borderRadius: 10, overflow: "hidden", flexShrink: 0 }}>
                <img src={photoSrc(p)} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                <button
                  onClick={() => removePhoto(i)}
                  style={{ position: "absolute", top: 3, right: 3, background: "rgba(0,0,0,0.55)", border: "none", borderRadius: "50%", width: 20, height: 20, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", color: "#fff", fontSize: 12, lineHeight: 1, padding: 0 }}
                >×</button>
              </div>
            ))}
            {(form.photos || []).length < MAX_PHOTOS && (
              <button
                type="button"
                onClick={() => fileRef.current?.click()}
                style={{ width: 72, height: 72, borderRadius: 10, border: `1.5px dashed ${T.borderL}`, background: T.bg, color: T.mid, fontSize: 24, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}
              >+</button>
            )}
          </div>
          {photoError && <div style={{ fontSize: 12, color: "#E74C3C", marginTop: 6 }}>{photoError}</div>}
          <input ref={fileRef} type="file" accept="image/*" multiple style={{ display: "none" }} onChange={handleFileChange} />
        </div>

        {/* Title */}
        <div style={{ marginBottom: 14 }}>
          <div style={{ fontSize: 12, color: T.mid, marginBottom: 6 }}>Название *</div>
          <input value={form.title} onChange={field("title")} placeholder="iPhone 14, диван, велосипед..." style={{ ...iS, marginBottom: 0 }} />
        </div>

        {/* Price */}
        <div style={{ marginBottom: 14 }}>
          <div style={{ fontSize: 12, color: T.mid, marginBottom: 6 }}>Цена</div>
          <input value={form.price} onChange={field("price")} placeholder="$150, Бесплатно, Торг" style={{ ...iS, marginBottom: 0 }} />
        </div>

        {/* Description */}
        <div style={{ marginBottom: 14 }}>
          <div style={{ fontSize: 12, color: T.mid, marginBottom: 6 }}>Описание *</div>
          <textarea
            value={form.description}
            onChange={field("description")}
            placeholder="Состояние, причина продажи, особенности..."
            rows={4}
            style={{ ...iS, marginBottom: 0, resize: "vertical", minHeight: 90 }}
          />
        </div>

        {/* Contacts */}
        <div style={{ marginBottom: 14 }}>
          <div style={{ fontSize: 12, color: T.mid, marginBottom: 6 }}>Telegram</div>
          <input value={form.telegram} onChange={field("telegram")} placeholder="@username" style={{ ...iS, marginBottom: 0 }} />
        </div>
        <div style={{ marginBottom: 24 }}>
          <div style={{ fontSize: 12, color: T.mid, marginBottom: 6 }}>Телефон (необязательно)</div>
          <input value={form.phone} onChange={field("phone")} placeholder="+1 (323) 555-0100" style={{ ...iS, marginBottom: 0 }} />
        </div>

        {/* Save */}
        <button
          onClick={user ? onSave : onRequireAuth}
          disabled={saving || !valid}
          style={{ ...pl(true), width: "100%", padding: 16, fontSize: 15, fontWeight: 700, opacity: (!valid || saving) ? 0.5 : 1 }}
        >
          {saving ? "Публикуем..." : editing ? "Сохранить" : "Опубликовать"}
        </button>

        {editing && (
          <button
            onClick={onDelete}
            style={{ ...pl(false), width: "100%", marginTop: 10, padding: 14, fontSize: 14, border: "1.5px solid #fecaca", color: "#E74C3C", background: "#FFF5F5" }}
          >
            🗑 Удалить объявление
          </button>
        )}
      </div>
    </div>
  );
}
