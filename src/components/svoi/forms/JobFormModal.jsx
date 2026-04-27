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
  if (!open) return null;

  const field = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));

  const valid = String(form.title || "").trim() && String(form.description || "").trim();

  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 200, background: "rgba(0,0,0,0.45)", display: "flex", alignItems: "flex-end" }}>
      <div style={{ width: "100%", maxWidth: 480, margin: "0 auto", background: T.card, borderRadius: "20px 20px 0 0", maxHeight: "92vh", overflowY: "auto", padding: "20px 16px 40px" }}>

        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 18 }}>
          <div style={{ fontSize: 17, fontWeight: 700 }}>{editing ? "Редактировать" : "Новая вакансия"}</div>
          <button onClick={onClose} style={{ background: "none", border: "none", fontSize: 24, cursor: "pointer", color: T.mid, fontFamily: "inherit", lineHeight: 1, padding: 0 }}>×</button>
        </div>

        {/* Title */}
        <div style={{ marginBottom: 16 }}>
          <div style={{ fontSize: 12, color: T.mid, marginBottom: 6 }}>Название *</div>
          <input value={form.title} onChange={field("title")} placeholder="Нужен бариста, ищем нянечку..." style={{ ...iS, marginBottom: 0 }} />
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
          <div style={{ fontSize: 12, color: T.mid, marginBottom: 6 }}>Зарплата / оплата</div>
          <input value={form.price} onChange={field("price")} placeholder="$22/час, от $3000/мес, договорная" style={{ ...iS, marginBottom: 0 }} />
        </div>

        {/* Schedule */}
        <div style={{ marginBottom: 16 }}>
          <div style={{ fontSize: 12, color: T.mid, marginBottom: 6 }}>График</div>
          <Chips options={JOB_SCHEDULES} value={form.schedule} onChange={(v) => setForm((f) => ({ ...f, schedule: v }))} T={T} pl={pl} />
        </div>

        {/* English */}
        <div style={{ marginBottom: 16 }}>
          <div style={{ fontSize: 12, color: T.mid, marginBottom: 6 }}>English</div>
          <Chips options={JOB_ENGLISH} value={form.english_lvl} onChange={(v) => setForm((f) => ({ ...f, english_lvl: v }))} T={T} pl={pl} />
        </div>

        {/* Work auth — shown as emoji only, no explicit label */}
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
            placeholder="Что нужно делать, требования, условия..."
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
          <input value={form.phone} onChange={field("phone")} placeholder="+1 (323) 555-0100" style={{ ...iS, marginBottom: 0 }} />
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
            🗑 Удалить вакансию
          </button>
        )}
      </div>
    </div>
  );
}
