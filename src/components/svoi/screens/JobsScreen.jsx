import { useState } from "react";
import JobCard from "../cards/JobCard";
import JobFormModal from "../forms/JobFormModal";

const EMPTY_FORM = {
  title: "", district: "", price: "", price_type: "",
  schedule: "full-time", english_lvl: "basic", work_auth: "ask",
  description: "", telegram: "", phone: "",
};

const TABS = [
  { id: "vacancy", label: "💼 Вакансии" },
  { id: "service", label: "🛠️ Услуги" },
];

export default function JobsScreen({
  T, cd, bk, pl, iS,
  user,
  jobs,
  liked,
  onGoHome,
  onToggleLike,
  onShare,
  onRequireAuth,
  trackView,
  onAdd,
  onUpdate,
  onDelete,
  canManage,
}) {
  const [tab, setTab] = useState("vacancy");
  const [search, setSearch] = useState("");
  const [expanded, setExpanded] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);

  const query = search.trim().toLowerCase();
  const filtered = jobs
    .filter((j) => j.type === tab)
    .filter((j) => {
      if (!query) return true;
      return (
        j.title?.toLowerCase().includes(query) ||
        j.description?.toLowerCase().includes(query) ||
        j.district?.toLowerCase().includes(query)
      );
    });

  const openAdd = () => {
    if (!user) { onRequireAuth(); return; }
    setEditing(null);
    setForm(EMPTY_FORM);
    setShowForm(true);
  };

  const openEdit = (job) => {
    setEditing(job);
    setForm({
      title: job.title || "",
      district: job.district || "",
      price: job.price || "",
      price_type: job.price_type || "",
      schedule: job.schedule || "full-time",
      english_lvl: job.english_lvl || "basic",
      work_auth: job.work_auth || "ask",
      description: job.description || "",
      telegram: job.telegram || "",
      phone: job.phone || "",
    });
    setShowForm(true);
  };

  const handleSave = async () => {
    const title = form.title.trim();
    const description = form.description.trim();
    if (!title || !description) return;
    setSaving(true);
    const payload = {
      type: tab,
      title,
      district: form.district || null,
      price: form.price.trim() || null,
      price_type: form.price_type || null,
      schedule: tab === "vacancy" ? (form.schedule || null) : null,
      english_lvl: form.english_lvl || null,
      work_auth: form.work_auth || "ask",
      description,
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

  const emptyText = tab === "vacancy"
    ? "Вакансий пока нет. Будьте первым!"
    : "Услуг пока нет. Предложите свои!";

  return (
    <div>      <div style={{ position: "relative", display: "flex", alignItems: "center", justifyContent: "space-between", minHeight: 40, margin: "4px 0 14px" }}>
        <button
          onClick={onGoHome}
          style={{ width: 40, height: 40, borderRadius: 13, border: "none", background: "#FFFFFF", color: "#8E8E93", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", padding: 0, boxShadow: "0 1px 2px rgba(0,0,0,0.04)" }}
          title="Назад"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M15 18l-6-6 6-6" />
          </svg>
        </button>
        <h2 style={{ position: "absolute", left: "50%", transform: "translateX(-50%)", fontSize: 20, fontWeight: 700, margin: 0, whiteSpace: "nowrap" }}>Работа / Услуги</h2>
        <button
          onClick={openAdd}
          style={{ width: 38, height: 38, borderRadius: 12, border: `1.5px solid ${T.primary}55`, background: T.primaryLight, color: T.primary, fontSize: 28, lineHeight: 1, cursor: "pointer", fontFamily: "inherit", display: "flex", alignItems: "center", justifyContent: "center", padding: 0, flexShrink: 0 }}
          title="Добавить"
        >+</button>
      </div>

      {/* Tabs */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 14 }}>
        {TABS.map((t) => (
          <button
            key={t.id}
            onClick={() => { setTab(t.id); setExpanded(null); setSearch(""); }}
            style={{
              ...cd,
              padding: "12px 10px",
              cursor: "pointer",
              fontFamily: "inherit",
              fontSize: 14,
              fontWeight: 700,
              color: tab === t.id ? T.primary : T.mid,
              background: tab === t.id ? T.primaryLight : T.card,
              border: `1.5px solid ${tab === t.id ? T.primary + "55" : T.borderL}`,
              boxShadow: tab === t.id ? T.shH : "none",
            }}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Search */}
      <input
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder={tab === "vacancy" ? "Поиск вакансий..." : "Поиск услуг..."}
        style={{ ...iS, marginBottom: 14 }}
      />

      {/* List */}
      {filtered.length === 0 && (
        <div style={{ ...cd, padding: 20, textAlign: "center", fontSize: 13, color: T.mid }}>
          {query ? `Ничего не найдено по запросу «${search}»` : emptyText}
        </div>
      )}

      {filtered.map((job) => (
        <JobCard
          key={job.id}
          job={job}
          isExpanded={expanded === job.id}
          isLiked={!!liked[`job-${job.id}`]}
          canEdit={canManage(job)}
          T={T}
          cd={cd}
          pl={pl}
          onToggleExpand={(open) => {
            setExpanded(open ? job.id : null);
            if (open) trackView("job", job);
          }}
          onToggleLike={() => onToggleLike(job.id, "job")}
          onShare={() => onShare(job)}
          onEdit={() => openEdit(job)}
          onDelete={async () => {
            await onDelete(job.id);
            if (expanded === job.id) setExpanded(null);
          }}
        />
      ))}

      <JobFormModal
        open={showForm}
        type={tab}
        editing={editing}
        form={form}
        setForm={setForm}
        saving={saving}
        onSave={handleSave}
        onDelete={handleDelete}
        onClose={() => { setShowForm(false); setEditing(null); }}
        T={T}
        cd={cd}
        pl={pl}
        iS={iS}
        user={user}
        onRequireAuth={onRequireAuth}
      />
    </div>
  );
}


