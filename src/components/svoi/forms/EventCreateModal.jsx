import { useEffect, useMemo, useRef, useState } from "react";

export default function EventCreateModal({
  open,
  onClose,
  onSubmit,
  onUploadPhoto,
  fetchAddressSuggestions,
  submitting,
  categoryTitle,
  cardTextMax = 500,
  palette,
}) {
  const fileRef = useRef(null);
  const [title, setTitle] = useState("");
  const [dateTime, setDateTime] = useState("");
  const [location, setLocation] = useState("");
  const [about, setAbout] = useState("");
  const [photos, setPhotos] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [addrLoading, setAddrLoading] = useState(false);
  const [addrOptions, setAddrOptions] = useState([]);

  useEffect(() => {
    if (!open) return;
    setTitle("");
    setDateTime("");
    setLocation("");
    setAbout("");
    setPhotos([]);
    setUploading(false);
    setAddrLoading(false);
    setAddrOptions([]);
  }, [open]);

  const canSubmit = useMemo(() => {
    return Boolean(title.trim() && dateTime && location.trim() && about.trim()) && !submitting && !uploading;
  }, [title, dateTime, location, about, submitting, uploading]);

  const handlePickPhotos = async (event) => {
    const files = Array.from(event.target.files || []);
    if (!files.length) return;
    setUploading(true);
    const uploaded = [];
    for (const file of files.slice(0, 10 - photos.length)) {
      const { url } = await onUploadPhoto(file, "events");
      if (url) uploaded.push(url);
    }
    setPhotos((prev) => [...prev, ...uploaded].slice(0, 10));
    setUploading(false);
    if (fileRef.current) fileRef.current.value = "";
  };

  useEffect(() => {
    if (!open) return;
    const q = (location || "").trim();
    if (q.length < 3) {
      setAddrLoading(false);
      setAddrOptions([]);
      return;
    }
    let canceled = false;
    const t = setTimeout(async () => {
      setAddrLoading(true);
      try {
        const opts = await fetchAddressSuggestions(q);
        if (canceled) return;
        setAddrOptions(Array.isArray(opts) ? opts.filter((o) => o && o.value) : []);
      } finally {
        if (!canceled) setAddrLoading(false);
      }
    }, 280);
    return () => {
      canceled = true;
      clearTimeout(t);
    };
  }, [open, location, fetchAddressSuggestions]);

  const submit = () => {
    if (!canSubmit) return;
    onSubmit({
      title: title.trim(),
      date: new Date(dateTime).toISOString(),
      location: location.trim(),
      desc: about.trim(),
      photos,
    });
  };

  if (!open) return null;

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,0.42)",
        zIndex: 11000,
        display: "flex",
        alignItems: "flex-end",
        justifyContent: "center",
        touchAction: "none",
        pointerEvents: "auto",
        isolation: "isolate",
      }}
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background: palette.card,
          width: "100%",
          maxWidth: 480,
          borderRadius: "24px 24px 0 0",
          padding: "22px 18px 30px",
          maxHeight: "90vh",
          overflowY: "auto",
          overscrollBehavior: "contain",
          touchAction: "pan-y",
          WebkitOverflowScrolling: "touch",
          border: `1px solid ${palette.borderL}`,
          boxShadow: palette.sh,
          boxSizing: "border-box",
        }}
      >
        <div style={{ width: 40, height: 4, borderRadius: 2, background: palette.border, margin: "0 auto 18px" }} />
        <h3 style={{ margin: "0 0 14px", fontSize: 20, fontWeight: 800, lineHeight: 1.2, color: palette.text }}>
          🎉 Новое событие{categoryTitle ? ` · ${categoryTitle}` : ""}
        </h3>

        <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: palette.mid, marginBottom: 6 }}>Название *</label>
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Название события"
          style={{ width: "100%", padding: "13px 14px", borderRadius: 14, border: `1px solid ${palette.border}`, fontFamily: "inherit", fontSize: 16, marginBottom: 12, boxSizing: "border-box" }}
        />

        <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: palette.mid, marginBottom: 6 }}>Дата и время *</label>
        <input
          type="datetime-local"
          value={dateTime}
          onChange={(e) => setDateTime(e.target.value)}
          style={{ width: "100%", padding: "13px 14px", borderRadius: 14, border: `1px solid ${palette.border}`, fontFamily: "inherit", fontSize: 16, marginBottom: 12, boxSizing: "border-box" }}
        />

        <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: palette.mid, marginBottom: 6 }}>Место *</label>
        <div style={{ position: "relative", marginBottom: 12 }}>
          <input
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            placeholder="Адрес или место проведения"
            style={{ width: "100%", padding: "13px 14px", borderRadius: 14, border: `1px solid ${palette.border}`, fontFamily: "inherit", fontSize: 16, boxSizing: "border-box" }}
          />
          {addrLoading && (
            <div style={{ fontSize: 11, color: palette.light, marginTop: 5 }}>Ищем адрес...</div>
          )}
          {!!addrOptions.length && (
            <div style={{ marginTop: 6, border: `1px solid ${palette.border}`, borderRadius: 12, background: palette.card, boxShadow: palette.sh, overflow: "hidden" }}>
              {addrOptions.slice(0, 6).map((opt, idx) => (
                <button
                  key={`${opt.value}-${idx}`}
                  onClick={() => {
                    setLocation(opt.value);
                    setAddrOptions([]);
                    setAddrLoading(false);
                  }}
                  style={{ width: "100%", border: "none", borderBottom: idx < Math.min(addrOptions.length, 6) - 1 ? `1px solid ${palette.borderL}` : "none", background: "transparent", textAlign: "left", padding: "10px 12px", fontFamily: "inherit", fontSize: 13, color: palette.text, cursor: "pointer" }}
                >
                  {opt.label || opt.value}
                </button>
              ))}
            </div>
          )}
        </div>

        <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: palette.mid, marginBottom: 6 }}>О событии *</label>
        <textarea
          value={about}
          onChange={(e) => setAbout(e.target.value.slice(0, cardTextMax))}
          placeholder="Коротко опишите событие"
          style={{ width: "100%", minHeight: 110, padding: "13px 14px", borderRadius: 14, border: `1px solid ${palette.border}`, fontFamily: "inherit", fontSize: 16, lineHeight: 1.45, resize: "vertical", boxSizing: "border-box" }}
        />
        <div style={{ fontSize: 11, color: palette.light, textAlign: "right", marginTop: 4, marginBottom: 12 }}>{about.length}/{cardTextMax}</div>

        <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 10 }}>
          {photos.map((ph, idx) => (
            <div key={`${ph}-${idx}`} style={{ position: "relative" }}>
              <img src={ph} alt="" style={{ width: 70, height: 70, objectFit: "cover", borderRadius: 10, border: `1px solid ${palette.border}` }} />
              <button
                onClick={() => setPhotos((prev) => prev.filter((_, i) => i !== idx))}
                style={{ position: "absolute", top: -6, right: -6, width: 18, height: 18, borderRadius: 999, border: "none", background: "rgba(0,0,0,0.72)", color: "#fff", cursor: "pointer", fontSize: 11, lineHeight: "18px", padding: 0 }}
                title="Удалить фото"
              >
                ×
              </button>
            </div>
          ))}
          {photos.length < 10 && (
            <button
              onClick={() => fileRef.current?.click()}
              disabled={uploading}
              style={{ height: 70, minWidth: 70, padding: "0 12px", borderRadius: 10, border: `1px dashed ${palette.primary}66`, background: palette.primaryLight, color: palette.primary, fontSize: 12, fontWeight: 700, cursor: "pointer", fontFamily: "inherit" }}
            >
              {uploading ? "Загрузка..." : "+ Фото"}
            </button>
          )}
        </div>
        <input ref={fileRef} type="file" accept="image/*" multiple style={{ display: "none" }} onChange={handlePickPhotos} />

        <div style={{ display: "flex", gap: 10, marginTop: 8 }}>
          <button
            onClick={onClose}
            disabled={submitting || uploading}
            style={{ flex: 1, padding: "13px 14px", borderRadius: 24, border: "none", fontFamily: "inherit", fontSize: 14, fontWeight: 700, cursor: "pointer", background: palette.primaryLight, color: palette.primary, opacity: submitting ? 0.7 : 1 }}
          >
            Отмена
          </button>
          <button
            onClick={submit}
            disabled={!canSubmit}
            style={{ flex: 2, padding: "13px 14px", borderRadius: 24, border: "none", fontFamily: "inherit", fontSize: 14, fontWeight: 700, cursor: canSubmit ? "pointer" : "not-allowed", background: palette.primary, color: "#fff", opacity: canSubmit ? 1 : 0.5 }}
          >
            {submitting ? "Сохраняю..." : "Опубликовать"}
          </button>
        </div>
      </div>
    </div>
  );
}
