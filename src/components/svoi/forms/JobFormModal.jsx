import { useEffect } from "react";
import { JOB_SCHEDULES, JOB_ENGLISH, JOB_WORK_AUTH, DISTRICTS } from "../config";

function Chips({ options, value, onChange, T, pl }) {
  return (
    <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
      {options.map((o) => (
        <button
          key={o.id}
          type="button"
          onClick={() => onChange(o.id)}
          style={{ ...pl(value === o.id), padding: "8px 14px", fontSize: 13 }}
        >
          {"emoji" in o ? `${o.emoji} ${o.label}` : o.label}
        </button>
      ))}
    </div>
  );
}

export default function JobFormModal({
  open,
  type,
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
  // Блокируем прокрутку фона пока модал открыт
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = prev; };
  }, [open]);

  if (!open) return null;

  const isService = type === "service";
  const field = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));
  const numField = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value.replace(/[^\d]/g, "") }));
  const priceField = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value.replace(/[^\d.,$ ]/g, "") }));
  const valid = String(form.title || "").trim() && String(form.description || "").trim();

  const modalTitle = editing
    ? "Редактировать"
    : isService ? "Новая услуга" : "Новая вакансия";

  const titlePlaceholder = isService
    ? "Ремонт, переводы, уборка..."
    : "Нужен бариста, ищем нянечку...";

  const descPlaceholder = isService
    ? "Что вы предлагаете, опыт, цены..."
    : "Что нужно делать, требования, условия...";

  const deleteLabel = isService ? "🗑 Удалить услугу" : "🗑 Удалить вакансию";

  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 200, background: "rgba(0,0,0,0.45)", display: "flex", alignItems: "flex-end" }} onTouchMove={(e) => e.preventDefault()}>
      <div style={{ width: "100%", maxWidth: 480, margin: "0 auto", background: T.card, borderRadius: "20px 20px 0 0", maxHeight: "92vh", overflowY: "auto", overscrollBehavior: "contain", WebkitOverflowScrolling: "touch", padding: "20px 16px 40px" }} onTouchMove={(e) => e.stopPropagation()}>

        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 18 }}>
          <div style={{ fontSize: 17, fontWeight: 700 }}>{modalTitle}</div>
          <button onClick={onClose} style={{ background: "none", border: "none", fontSize: 24, cursor: "pointer", color: T.mid, fontFamily: "inherit", lineHeight: 1, padding: 0 }}>×</button>
        </div>

        {/* Title */}
        <div style={{ marginBottom: 16 }}>
          <div style={{ fontSize: 12, color: T.mid, marginBottom: 6 }}>Название *</div>
          <input value={form.title} onChange={field("title")} placeholder={titlePlaceholder} style={{ ...iS, marginBottom: 0 }} />
        </div>

        {/* District */}
        <div style={{ marginBottom: 16 }}>
          <div style={{ fontSize: 12, color: T.mid, marginBottom: 6 }}>Район</div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
            {DISTRICTS.map((d) => (
              <button key={d.id} type="button" onClick={() => setForm((f) => ({ ...f, district: d.id === f.district ? "" : d.id }))}
                style={{ ...pl(form.district === d.id), padding: "7px 12px", fontSize: 12 }}>
                {d.emoji} {d.name}
              </button>
            ))}
          </div>
        </div>

        {/* Price */}
        <div style={{ marginBottom: 16 }}>
          <div style={{ fontSize: 12, color: T.mid, marginBottom: 6 }}>
            {isService ? "Стоимость" : "Зарплата"}
          </div>
          <input
            value={form.price}
            onChange={priceField("price")}
            inputMode="decimal"
            placeholder={isService ? "200" : "3000"}
            style={{ ...iS, marginBottom: 8 }}
          />
          <div style={{ display: "flex", gap: 8 }}>
            {["", "час", "разово"].map((pt) => (
              <button
                key={pt || "none"}
                type="button"
                onClick={() => setForm((f) => ({ ...f, price_type: pt }))}
                style={{ ...pl(form.price_type === pt), padding: "7px 16px", fontSize: 13 }}
              >
                {pt === "" ? "не указано" : `/ ${pt}`}
              </button>
            ))}
          </div>
        </div>

        {/* Schedule — vacancies only */}
        {!isService && (
          <div style={{ marginBottom: 16 }}>
            <div style={{ fontSize: 12, color: T.mid, marginBottom: 6 }}>График</div>
            <Chips options={JOB_SCHEDULES} value={form.schedule} onChange={(v) => setForm((f) => ({ ...f, schedule: v }))} T={T} pl={pl} />
          </div>
        )}

        {/* English */}
        <div style={{ marginBottom: 16 }}>
          <div style={{ fontSize: 12, color: T.mid, marginBottom: 6 }}>English</div>
          <Chips options={JOB_ENGLISH} value={form.english_lvl} onChange={(v) => setForm((f) => ({ ...f, english_lvl: v }))} T={T} pl={pl} />
        </div>

        {/* Work auth */}
        <div style={{ marginBottom: 16 }}>
          <div style={{ fontSize: 12, color: T.mid, marginBottom: 6 }}>Документы</div>
          <Chips options={JOB_WORK_AUTH} value={form.work_auth} onChange={(v) => setForm((f) => ({ ...f, work_auth: v }))} T={T} pl={pl} />
        </div>

        {/* Description */}
        <div style={{ marginBottom: 16 }}>
          <div style={{ fontSize: 12, color: T.mid, marginBottom: 6 }}>Описание *</div>
          <textarea
            value={form.description}
            onChange={field("description")}
            placeholder={descPlaceholder}
            rows={4}
            style={{ ...iS, marginBottom: 0, resize: "vertical", minHeight: 90 }}
          />
        </div>

        {/* Contacts */}
        <div style={{ marginBottom: 16 }}>
          <div style={{ fontSize: 12, color: T.mid, marginBottom: 6 }}>Telegram</div>
          <input value={form.telegram} onChange={field("telegram")} placeholder="@username" style={{ ...iS, marginBottom: 0 }} />
        </div>
        <div style={{ marginBottom: 24 }}>
          <div style={{ fontSize: 12, color: T.mid, marginBottom: 6 }}>Телефон (необязательно)</div>
          <input value={form.phone} onChange={numField("phone")} type="tel" inputMode="numeric" placeholder="13235550100" style={{ ...iS, marginBottom: 0 }} />
        </div>

        {/* Actions */}
        <button
          onClick={user ? onSave : onRequireAuth}
          disabled={saving || !valid}
          style={{ ...pl(true), width: "100%", padding: 16, fontSize: 15, fontWeight: 700, opacity: (!valid || saving) ? 0.5 : 1 }}
        >
          {saving ? "Сохраняем..." : editing ? "Сохранить" : "Опубликовать"}
        </button>

        {editing && (
          <button
            onClick={onDelete}
            style={{ ...pl(false), width: "100%", marginTop: 10, padding: 14, fontSize: 14, border: "1.5px solid #fecaca", color: "#E74C3C", background: "#FFF5F5" }}
          >
            {deleteLabel}
          </button>
        )}
      </div>
    </div>
  );
}
