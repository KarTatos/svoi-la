export default function EventFormModal({
  showAddEvent,
  setShowAddEvent,
  setNewEventPhotos,
  setAddrOptionsEvent,
  setAddrValidEvent,
  setEditingEvent,
  cd,
  T,
  user,
  handleLogin,
  pl,
  editingEvent,
  newEvent,
  setNewEvent,
  iS,
  EVENT_CATS,
  addrLoadingEvent,
  addrOptionsEvent,
  onSelectEventAddressSuggestion,
  CARD_TEXT_MAX,
  eventFileRef,
  handleEventPhotos,
  newEventPhotos,
  canManageEvent,
  handleDeleteEvent,
  handleAddEvent,
}) {
  if (!showAddEvent) return null;

  const closeModal = () => {
    setShowAddEvent(false);
    setNewEventPhotos([]);
    setAddrOptionsEvent([]);
    setAddrValidEvent(false);
    setEditingEvent(null);
  };

  const canSubmit = !!(newEvent.title && newEvent.date && newEvent.desc && newEvent.cat && newEvent.location.trim() && addrValidEvent);

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,0.42)",
        zIndex: 10000,
        display: "flex",
        alignItems: "flex-end",
        justifyContent: "center",
        touchAction: "none",
        pointerEvents: "auto",
        isolation: "isolate",
      }}
      onClick={closeModal}
      onTouchMove={(e) => {
        if (e.target === e.currentTarget) e.preventDefault();
      }}
      onWheel={(e) => {
        if (e.target === e.currentTarget) e.preventDefault();
      }}
    >
      <div
        style={{
          ...cd,
          position: "relative",
          zIndex: 1,
          width: "100%",
          maxWidth: 480,
          borderRadius: "24px 24px 0 0",
          maxHeight: "92vh",
          overflow: "hidden",
          overscrollBehavior: "contain",
          touchAction: "pan-y",
          WebkitOverflowScrolling: "touch",
          display: "flex",
          flexDirection: "column",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div style={{ padding: "16px 20px 12px", borderBottom: `1px solid ${T.borderL}`, background: T.card }}>
          <div style={{ width: 40, height: 4, borderRadius: 2, background: T.border, margin: "0 auto 12px" }} />
          <h3 style={{ fontSize: 18, fontWeight: 700, margin: 0 }}>{editingEvent ? "✏️ Редактировать событие" : "🎉 Новое событие"}</h3>
        </div>

        {!user ? (
          <div style={{ textAlign: "center", padding: "20px" }}>
            <div style={{ fontSize: 48, marginBottom: 16 }}>🔐</div>
            <button onClick={handleLogin} style={{ ...pl(true), padding: "14px 28px" }}>
              Войти через Google
            </button>
            <div style={{ marginTop: 10, fontSize: 12, color: T.mid, background: T.bg, border: `1px solid ${T.borderL}`, borderRadius: 10, padding: "10px 12px", lineHeight: 1.45 }}>
              Вход через Google безопасен: мы не видим ваш пароль Google. Сохраняются только имя, email и аватар для работы аккаунта.
            </div>
          </div>
        ) : (
          <>
            <div style={{ padding: "16px 20px 20px", overflowY: "auto", flex: 1, minHeight: 0 }}>
              <label style={{ fontSize: 12, fontWeight: 600, color: T.mid, marginBottom: 6, display: "block" }}>Название *</label>
              <input
                autoComplete="off"
                value={newEvent.title}
                onChange={(e) => setNewEvent({ ...newEvent, title: e.target.value })}
                placeholder="Что за мероприятие?"
                style={{ ...iS, marginBottom: 14 }}
              />

              <label style={{ fontSize: 12, fontWeight: 600, color: T.mid, marginBottom: 6, display: "block" }}>Категория *</label>
              <select
                value={newEvent.cat}
                onChange={(e) => setNewEvent({ ...newEvent, cat: e.target.value })}
                style={{ ...iS, marginBottom: 14, appearance: "none", color: newEvent.cat ? T.text : T.light }}
              >
                <option value="">Выберите</option>
                {EVENT_CATS.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.icon} {c.title}
                  </option>
                ))}
              </select>

              <label style={{ fontSize: 12, fontWeight: 600, color: T.mid, marginBottom: 6, display: "block" }}>Дата и время *</label>
              <input
                type="datetime-local"
                value={newEvent.date}
                onChange={(e) => setNewEvent({ ...newEvent, date: e.target.value })}
                style={{ ...iS, marginBottom: 14 }}
              />

              <label style={{ fontSize: 12, fontWeight: 600, color: T.mid, marginBottom: 6, display: "block" }}>Место *</label>
              <input
                value={newEvent.location}
                onChange={(e) => {
                  setNewEvent({ ...newEvent, location: e.target.value });
                  setAddrValidEvent(false);
                }}
                placeholder="Адрес или название места"
                style={{ ...iS, marginBottom: 6, borderColor: newEvent.location && !addrValidEvent ? "#f5b7b1" : T.border }}
              />
              {addrLoadingEvent && <div style={{ fontSize: 12, color: T.mid, marginBottom: 8 }}>Ищем место...</div>}
              {!addrLoadingEvent && addrOptionsEvent.length > 0 && !addrValidEvent && (
                <div style={{ marginBottom: 10, border: `1px solid ${T.border}`, borderRadius: 10, overflow: "hidden", maxHeight: 180, overflowY: "auto", background: T.card }}>
                  {addrOptionsEvent
                    .filter((opt) => opt && opt.value)
                    .map((opt, i) => (
                      <button
                        type="button"
                        key={`${opt.value}-${i}`}
                        onMouseDown={(e) => e.preventDefault()}
                        onClick={() => onSelectEventAddressSuggestion(opt)}
                        style={{
                          width: "100%",
                          textAlign: "left",
                          padding: "10px 12px",
                          border: "none",
                          borderBottom: i < addrOptionsEvent.length - 1 ? `1px solid ${T.borderL}` : "none",
                          background: T.card,
                          cursor: "pointer",
                          fontFamily: "inherit",
                          fontSize: 12,
                          color: T.mid,
                        }}
                      >
                        {opt.label}
                      </button>
                    ))}
                </div>
              )}
              {newEvent.location && !addrValidEvent && <div style={{ fontSize: 12, color: "#E74C3C", marginBottom: 10 }}>Выберите реальное место из подсказок.</div>}

              <label style={{ fontSize: 12, fontWeight: 600, color: T.mid, marginBottom: 6, display: "block" }}>Описание *</label>
              <textarea
                value={newEvent.desc}
                maxLength={CARD_TEXT_MAX}
                onChange={(e) => setNewEvent({ ...newEvent, desc: e.target.value.slice(0, CARD_TEXT_MAX) })}
                placeholder="Подробности..."
                style={{ ...iS, minHeight: 90, resize: "vertical", marginBottom: 6 }}
              />
              <div style={{ fontSize: 11, color: T.light, marginBottom: 12, textAlign: "right" }}>
                {newEvent.desc.length}/{CARD_TEXT_MAX}
              </div>

              <label style={{ fontSize: 12, fontWeight: 600, color: T.mid, marginBottom: 6, display: "block" }}>Сайт (необязательно)</label>
              <input
                value={newEvent.website || ""}
                onChange={(e) => setNewEvent({ ...newEvent, website: e.target.value })}
                placeholder="https://..."
                style={{ ...iS, marginBottom: 14 }}
              />

              <input ref={eventFileRef} type="file" accept="image/*" multiple onChange={handleEventPhotos} style={{ display: "none" }} />
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 8 }}>
                {newEventPhotos.map((p, i) => (
                  <div key={i} style={{ position: "relative", width: 66, height: 66, borderRadius: 10, overflow: "hidden", border: `1px solid ${T.border}`, flexShrink: 0 }}>
                    <img src={p.preview} alt="" style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
                    <button
                      type="button"
                      onClick={() => setNewEventPhotos((pr) => pr.filter((_, j) => j !== i))}
                      style={{ position: "absolute", top: 3, right: 3, background: "rgba(0,0,0,0.55)", border: "none", color: "#fff", cursor: "pointer", borderRadius: "50%", width: 20, height: 20, fontSize: 11, display: "flex", alignItems: "center", justifyContent: "center", padding: 0 }}
                    >
                      ✕
                    </button>
                  </div>
                ))}
                {newEventPhotos.length < 3 && (
                  <button
                    type="button"
                    onClick={() => eventFileRef.current?.click()}
                    style={{ padding: "8px 14px", background: T.bg, border: `1.5px dashed ${T.border}`, borderRadius: 10, color: T.primary, fontSize: 12, fontWeight: 600, cursor: "pointer", fontFamily: "inherit" }}
                  >
                    ＋ Фото (до 3)
                  </button>
                )}
              </div>
            </div>

            <div style={{ padding: "12px 20px 16px", borderTop: `1px solid ${T.borderL}`, background: T.card, display: "flex", gap: 10 }}>
              <button onClick={closeModal} style={{ ...pl(false), flex: 1, padding: 14 }}>
                Отмена
              </button>
              {editingEvent && canManageEvent(editingEvent) && (
                <button onClick={() => handleDeleteEvent(editingEvent.id)} style={{ ...pl(false), flex: 1, padding: 14, border: "1.5px solid #fecaca", color: "#E74C3C", background: "#FFF5F5" }}>
                  Удалить
                </button>
              )}
              <button onClick={handleAddEvent} disabled={!canSubmit} style={{ ...pl(true), flex: 2, padding: 14, opacity: canSubmit ? 1 : 0.5 }}>
                {editingEvent ? "Сохранить" : "Опубликовать"}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
