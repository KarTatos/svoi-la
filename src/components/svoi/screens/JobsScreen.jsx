import { useState } from "react";
import JobCard from "../cards/JobCard";
import JobFormModal from "../forms/JobFormModal";

const EMPTY_FORM = {
  title: "", district: "", price: "",
  schedule: "full-time", english_lvl: "basic", work_auth: "ask",
  description: "", telegram: "", phone: "",
};

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
  const [search, setSearch] = useState("");
  const [expanded, setExpanded] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);

  const query = search.trim().toLowerCase();
  const filtered = jobs.filter((j) => {
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
      title,
      district: form.district || null,
      price: form.price.trim() || null,
      schedule: form.schedule || null,
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

  return (
    <div>
      <button onClick={onGoHome} style={bk}>← Главная</button>

      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", margin: "4px 0 14px" }}>
        <h2 style={{ fontSize: 20, fontWeight: 700, margin: 0 }}>💼 Вакансии</h2>
        <button
          onClick={openAdd}
          style={{ width: 38, height: 38, borderRadius: 12, border: `1.5px solid ${T.primary}55`, background: T.primaryLight, color: T.primary, fontSize: 28, lineHeight: 1, cursor: "pointer", fontFamily: "inherit", display: "flex", alignItems: "center", justifyContent: "center", padding: 0, flexShrink: 0 }}
          title="Добавить вакансию"
        >+</button>
      </div>

      {/* Search */}
      <input
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder="Поиск вакансий..."
        style={{ ...iS, marginBottom: 14 }}
      />

      {/* List */}
      {filtered.length === 0 && (
        <div style={{ ...cd, padding: 20, textAlign: "center", fontSize: 13, color: T.mid }}>
          {query ? `Ничего не найдено по запросу «${search}»` : "Вакансий пока нет. Будьте первым!"}
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
