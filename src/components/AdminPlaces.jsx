"use client";

import { useEffect, useMemo, useState } from "react";
import {
  addPlace as dbAddPlace,
  deletePlace as dbDeletePlace,
  getEvents,
  getPlaces,
  getTips,
  getUser,
  signInWithGoogle,
  signOut,
  supabase,
  updatePlace as dbUpdatePlace,
  uploadPhoto,
} from "@/lib/supabase";

const TABS = ["places", "tips", "events", "comments", "likes"];
const PLACE_CATEGORIES = ["restaurants", "bars", "coffee", "hiking", "interesting", "music"];
const DISTRICTS = ["weho", "hollywood", "glendale", "dtla", "valley", "silverlake", "westside", "pasadena", "midcity"];

const initialForm = {
  id: "",
  name: "",
  category: "",
  district: "",
  address: "",
  tip: "",
  added_by: "",
  photos: [],
};

function filterRows(rows, query) {
  const q = query.trim().toLowerCase();
  if (!q) return rows;
  return rows.filter((row) => JSON.stringify(row).toLowerCase().includes(q));
}

export default function AdminPlaces() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [tab, setTab] = useState("places");
  const [query, setQuery] = useState("");

  const [places, setPlaces] = useState([]);
  const [tips, setTips] = useState([]);
  const [events, setEvents] = useState([]);
  const [comments, setComments] = useState([]);
  const [likes, setLikes] = useState([]);

  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState("");
  const [editorOpen, setEditorOpen] = useState(false);
  const [form, setForm] = useState(initialForm);
  const [newPhotos, setNewPhotos] = useState([]);

  const filteredPlaces = useMemo(() => filterRows(places, query), [places, query]);
  const filteredTips = useMemo(() => filterRows(tips, query), [tips, query]);
  const filteredEvents = useMemo(() => filterRows(events, query), [events, query]);
  const filteredComments = useMemo(() => filterRows(comments, query), [comments, query]);
  const filteredLikes = useMemo(() => filterRows(likes, query), [likes, query]);

  useEffect(() => {
    async function init() {
      const u = await getUser();
      setUser(u);
      if (u) await loadAll();
      setLoading(false);
    }
    init();
  }, []);

  async function loadAll() {
    setLoading(true);
    setError("");
    try {
      const [{ data: p }, { data: t }, { data: e }, commentsRes, likesRes] = await Promise.all([
        getPlaces(),
        getTips(),
        getEvents(),
        supabase.from("comments").select("*").order("created_at", { ascending: false }),
        supabase.from("likes").select("*").order("created_at", { ascending: false }),
      ]);
      setPlaces(p || []);
      setTips(t || []);
      setEvents(e || []);
      setComments(commentsRes.data || []);
      setLikes(likesRes.data || []);
    } catch (err) {
      setError(err?.message || "Failed to load database data");
    } finally {
      setLoading(false);
    }
  }

  function openCreate() {
    setForm({ ...initialForm, added_by: user?.user_metadata?.full_name || user?.email || "" });
    setNewPhotos([]);
    setEditorOpen(true);
  }

  function openEdit(place) {
    setForm({
      id: place.id,
      name: place.name || "",
      category: place.category || "",
      district: place.district || "",
      address: place.address || "",
      tip: place.tip || "",
      added_by: place.added_by || "",
      photos: Array.isArray(place.photos) ? place.photos : [],
    });
    setNewPhotos([]);
    setEditorOpen(true);
  }

  function removeExistingPhoto(index) {
    setForm((prev) => ({ ...prev, photos: prev.photos.filter((_, i) => i !== index) }));
  }

  function removeNewPhoto(index) {
    setNewPhotos((prev) => prev.filter((_, i) => i !== index));
  }

  async function savePlace() {
    if (!form.name || !form.category || !form.district || !form.tip) {
      setError("Fill required fields: name, category, district, tip");
      return;
    }
    setSaving(true);
    setError("");
    try {
      const uploaded = [];
      for (const p of newPhotos) {
        const url = await uploadPhoto(p.file);
        if (url) uploaded.push(url);
      }
      const payload = {
        name: form.name,
        category: form.category,
        district: form.district,
        address: form.address,
        tip: form.tip,
        added_by: form.added_by || user?.email || "admin",
        photos: [...form.photos, ...uploaded],
      };
      if (form.id) await dbUpdatePlace(form.id, payload);
      else await dbAddPlace(payload);
      setEditorOpen(false);
      await loadAll();
    } catch (err) {
      setError(err?.message || "Save failed");
    } finally {
      setSaving(false);
    }
  }

  async function deletePlace(id) {
    if (!window.confirm("Delete this place?")) return;
    setDeleting(id);
    setError("");
    try {
      await dbDeletePlace(id);
      await loadAll();
    } catch (err) {
      setError(err?.message || "Delete failed");
    } finally {
      setDeleting("");
    }
  }

  async function handleLogin() {
    await signInWithGoogle();
  }

  async function handleLogout() {
    await signOut();
    setUser(null);
    setPlaces([]);
    setTips([]);
    setEvents([]);
    setComments([]);
    setLikes([]);
  }

  if (!user) {
    return (
      <div style={{ maxWidth: 1100, margin: "0 auto", padding: 24 }}>
        <h1 style={{ margin: "0 0 8px" }}>Admin / Database</h1>
        <p style={{ margin: "0 0 16px", color: "#666" }}>Sign in with Google to continue.</p>
        <button onClick={handleLogin} style={btn}>
          Sign in
        </button>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 1200, margin: "0 auto", padding: 20 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12, gap: 10 }}>
        <div>
          <h1 style={{ margin: 0 }}>Admin / Database</h1>
          <div style={{ color: "#666", fontSize: 13 }}>{user.email}</div>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          {tab === "places" && (
            <button onClick={openCreate} style={btn}>
              New place
            </button>
          )}
          <button onClick={loadAll} style={btn}>
            Refresh
          </button>
          <button onClick={handleLogout} style={btn}>
            Sign out
          </button>
        </div>
      </div>

      <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 12 }}>
        {TABS.map((t) => (
          <button key={t} onClick={() => setTab(t)} style={{ ...btn, background: tab === t ? "#111" : "#fff", color: tab === t ? "#fff" : "#111", borderColor: tab === t ? "#111" : "#ddd" }}>
            {t[0].toUpperCase() + t.slice(1)}
          </button>
        ))}
      </div>

      <div style={{ marginBottom: 12 }}>
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search in active section"
          style={{ width: "100%", padding: "10px 12px", borderRadius: 8, border: "1px solid #ddd" }}
        />
      </div>

      {error && <div style={{ color: "#B00020", marginBottom: 12 }}>{error}</div>}

      {loading ? <div>Loading...</div> : null}

      {!loading && tab === "places" && (
        <div style={tableWrap}>
          <table style={table}>
            <thead>
              <tr style={headRow}>
                <th style={th}>Name</th>
                <th style={th}>Category</th>
                <th style={th}>District</th>
                <th style={th}>Address</th>
                <th style={th}>Tip</th>
                <th style={th}>Photos</th>
                <th style={th}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredPlaces.map((p) => (
                <tr key={p.id} style={row}>
                  <td style={td}>{p.name}</td>
                  <td style={td}>{p.category}</td>
                  <td style={td}>{p.district}</td>
                  <td style={td}>{p.address || "-"}</td>
                  <td style={td}>{(p.tip || "").slice(0, 120)}</td>
                  <td style={td}>{Array.isArray(p.photos) ? p.photos.length : 0}</td>
                  <td style={td}>
                    <div style={{ display: "flex", gap: 8 }}>
                      <button onClick={() => openEdit(p)} style={smallBtn}>Edit</button>
                      <button onClick={() => deletePlace(p.id)} disabled={deleting === p.id} style={smallBtnDanger}>
                        {deleting === p.id ? "Deleting..." : "Delete"}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {!filteredPlaces.length && (
                <tr><td style={td} colSpan={7}>No places found.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {!loading && tab === "tips" && (
        <div style={tableWrap}>
          <table style={table}>
            <thead>
              <tr style={headRow}>
                <th style={th}>Title</th>
                <th style={th}>Category</th>
                <th style={th}>Author</th>
                <th style={th}>Text</th>
              </tr>
            </thead>
            <tbody>
              {filteredTips.map((t) => (
                <tr key={t.id} style={row}>
                  <td style={td}>{t.title}</td>
                  <td style={td}>{t.category}</td>
                  <td style={td}>{t.author}</td>
                  <td style={td}>{(t.text || "").slice(0, 180)}</td>
                </tr>
              ))}
              {!filteredTips.length && (
                <tr><td style={td} colSpan={4}>No tips found.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {!loading && tab === "events" && (
        <div style={tableWrap}>
          <table style={table}>
            <thead>
              <tr style={headRow}>
                <th style={th}>Title</th>
                <th style={th}>Category</th>
                <th style={th}>Date</th>
                <th style={th}>Location</th>
                <th style={th}>Description</th>
              </tr>
            </thead>
            <tbody>
              {filteredEvents.map((e) => (
                <tr key={e.id} style={row}>
                  <td style={td}>{e.title}</td>
                  <td style={td}>{e.category}</td>
                  <td style={td}>{e.date}</td>
                  <td style={td}>{e.location || "-"}</td>
                  <td style={td}>{(e.description || "").slice(0, 160)}</td>
                </tr>
              ))}
              {!filteredEvents.length && (
                <tr><td style={td} colSpan={5}>No events found.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {!loading && tab === "comments" && (
        <div style={tableWrap}>
          <table style={table}>
            <thead>
              <tr style={headRow}>
                <th style={th}>Item Type</th>
                <th style={th}>Item ID</th>
                <th style={th}>Author</th>
                <th style={th}>Text</th>
                <th style={th}>Created</th>
              </tr>
            </thead>
            <tbody>
              {filteredComments.map((c) => (
                <tr key={c.id} style={row}>
                  <td style={td}>{c.item_type}</td>
                  <td style={td}>{c.item_id}</td>
                  <td style={td}>{c.author}</td>
                  <td style={td}>{(c.text || "").slice(0, 180)}</td>
                  <td style={td}>{c.created_at || "-"}</td>
                </tr>
              ))}
              {!filteredComments.length && (
                <tr><td style={td} colSpan={5}>No comments found.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {!loading && tab === "likes" && (
        <div style={tableWrap}>
          <table style={table}>
            <thead>
              <tr style={headRow}>
                <th style={th}>Item Type</th>
                <th style={th}>Item ID</th>
                <th style={th}>User ID</th>
                <th style={th}>Created</th>
              </tr>
            </thead>
            <tbody>
              {filteredLikes.map((l) => (
                <tr key={l.id} style={row}>
                  <td style={td}>{l.item_type}</td>
                  <td style={td}>{l.item_id}</td>
                  <td style={td}>{l.user_id}</td>
                  <td style={td}>{l.created_at || "-"}</td>
                </tr>
              ))}
              {!filteredLikes.length && (
                <tr><td style={td} colSpan={4}>No likes found.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {editorOpen && (
        <div style={overlay} onClick={() => setEditorOpen(false)}>
          <div style={panel} onClick={(e) => e.stopPropagation()}>
            <h3 style={{ marginTop: 0 }}>{form.id ? "Edit place" : "New place"}</h3>
            <div style={fieldGrid}>
              <label style={label}>
                Name *
                <input value={form.name} onChange={(e) => setForm((s) => ({ ...s, name: e.target.value }))} style={input} />
              </label>
              <label style={label}>
                Category *
                <select value={form.category} onChange={(e) => setForm((s) => ({ ...s, category: e.target.value }))} style={input}>
                  <option value="">Select category</option>
                  {PLACE_CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
                </select>
              </label>
              <label style={label}>
                District *
                <select value={form.district} onChange={(e) => setForm((s) => ({ ...s, district: e.target.value }))} style={input}>
                  <option value="">Select district</option>
                  {DISTRICTS.map((d) => <option key={d} value={d}>{d}</option>)}
                </select>
              </label>
              <label style={label}>
                Added by
                <input value={form.added_by} onChange={(e) => setForm((s) => ({ ...s, added_by: e.target.value }))} style={input} />
              </label>
            </div>

            <label style={{ ...label, marginTop: 8 }}>
              Address
              <input value={form.address} onChange={(e) => setForm((s) => ({ ...s, address: e.target.value }))} style={input} />
            </label>

            <label style={{ ...label, marginTop: 8 }}>
              Tip *
              <textarea value={form.tip} onChange={(e) => setForm((s) => ({ ...s, tip: e.target.value }))} style={{ ...input, minHeight: 90 }} />
            </label>

            <div style={{ marginTop: 10 }}>
              <div style={{ fontSize: 13, color: "#666", marginBottom: 6 }}>Photos</div>
              <input
                type="file"
                accept="image/*"
                multiple
                onChange={(e) => {
                  const files = Array.from(e.target.files || []).map((file) => ({ file, preview: URL.createObjectURL(file) }));
                  setNewPhotos((prev) => [...prev, ...files].slice(0, 10));
                }}
              />
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginTop: 10 }}>
                {(form.photos || []).map((src, i) => (
                  <div key={`existing-${i}`} style={thumbWrap}>
                    <img src={src} alt="" style={thumb} />
                    <button onClick={() => removeExistingPhoto(i)} style={closeBtn}>x</button>
                  </div>
                ))}
                {newPhotos.map((p, i) => (
                  <div key={`new-${i}`} style={thumbWrap}>
                    <img src={p.preview} alt="" style={thumb} />
                    <button onClick={() => removeNewPhoto(i)} style={closeBtn}>x</button>
                  </div>
                ))}
              </div>
            </div>

            <div style={{ display: "flex", justifyContent: "flex-end", gap: 8, marginTop: 14 }}>
              <button onClick={() => setEditorOpen(false)} style={smallBtn}>Cancel</button>
              <button onClick={savePlace} disabled={saving} style={smallBtn}>
                {saving ? "Saving..." : "Save"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

const btn = { padding: "10px 14px", borderRadius: 8, border: "1px solid #ddd", cursor: "pointer", background: "#fff" };
const smallBtn = { padding: "6px 10px", borderRadius: 8, border: "1px solid #ddd", cursor: "pointer", background: "#fff" };
const smallBtnDanger = { ...smallBtn, borderColor: "#f4b4b4", color: "#b00020", background: "#fff5f5" };
const tableWrap = { border: "1px solid #eee", borderRadius: 10, overflow: "auto" };
const table = { width: "100%", borderCollapse: "collapse", fontSize: 14, minWidth: 900 };
const headRow = { background: "#fafafa" };
const row = { borderTop: "1px solid #f0f0f0" };
const th = { textAlign: "left", padding: "10px 12px", color: "#385272", fontWeight: 700, borderBottom: "1px solid #f0f0f0", whiteSpace: "nowrap" };
const td = { padding: "10px 12px", verticalAlign: "top", color: "#1a2d44" };

const overlay = {
  position: "fixed",
  inset: 0,
  background: "rgba(0,0,0,0.5)",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  zIndex: 300,
  padding: 16,
};
const panel = { width: "100%", maxWidth: 760, background: "#fff", borderRadius: 12, padding: 16, maxHeight: "92vh", overflowY: "auto" };
const fieldGrid = { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 };
const label = { display: "flex", flexDirection: "column", gap: 6, fontSize: 13, color: "#3d4f63" };
const input = { padding: "10px 12px", borderRadius: 8, border: "1px solid #ddd", fontSize: 14, fontFamily: "inherit" };
const thumbWrap = { position: "relative", width: 74, height: 74, borderRadius: 8, overflow: "hidden", border: "1px solid #eee" };
const thumb = { width: "100%", height: "100%", objectFit: "cover" };
const closeBtn = {
  position: "absolute",
  top: 2,
  right: 2,
  width: 18,
  height: 18,
  border: "none",
  borderRadius: "50%",
  cursor: "pointer",
  background: "rgba(0,0,0,0.55)",
  color: "#fff",
  fontSize: 10,
  lineHeight: "18px",
  textAlign: "center",
  padding: 0,
};
