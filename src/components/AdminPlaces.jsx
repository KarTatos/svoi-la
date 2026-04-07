"use client";

import { useEffect, useMemo, useState } from "react";
import { getUser, signInWithGoogle, signOut, supabase, uploadPhoto } from "@/lib/supabase";

const PLACE_CATEGORIES = [
  "restaurants",
  "bars",
  "coffee",
  "hiking",
  "interesting",
  "music",
  "cinema",
];

const DISTRICTS = [
  "weho",
  "hollywood",
  "glendale",
  "dtla",
  "valley",
  "silverlake",
  "westside",
  "pasadena",
  "midcity",
];

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

async function getAccessToken() {
  const { data } = await supabase.auth.getSession();
  return data?.session?.access_token || "";
}

export default function AdminPlaces() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [places, setPlaces] = useState([]);
  const [query, setQuery] = useState("");
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState("");
  const [editorOpen, setEditorOpen] = useState(false);
  const [form, setForm] = useState(initialForm);
  const [newPhotos, setNewPhotos] = useState([]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return places;
    return places.filter((p) => {
      return (
        (p.name || "").toLowerCase().includes(q) ||
        (p.address || "").toLowerCase().includes(q) ||
        (p.category || "").toLowerCase().includes(q) ||
        (p.district || "").toLowerCase().includes(q)
      );
    });
  }, [places, query]);

  useEffect(() => {
    async function init() {
      const u = await getUser();
      setUser(u);
      setLoading(false);
      if (u) await loadPlaces();
    }
    init();
  }, []);

  async function requestAdmin(path, options = {}) {
    const token = await getAccessToken();
    const response = await fetch(path, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
        ...(options.headers || {}),
      },
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data?.error || "Request failed");
    return data;
  }

  async function loadPlaces() {
    setLoading(true);
    setError("");
    try {
      const data = await requestAdmin("/api/admin/places");
      setPlaces(data.data || []);
    } catch (e) {
      setError(e.message || "Failed to load places");
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

      if (form.id) {
        await requestAdmin("/api/admin/places", {
          method: "PATCH",
          body: JSON.stringify({ id: form.id, updates: payload }),
        });
      } else {
        await requestAdmin("/api/admin/places", {
          method: "POST",
          body: JSON.stringify({ place: payload }),
        });
      }

      setEditorOpen(false);
      await loadPlaces();
    } catch (e) {
      setError(e.message || "Save failed");
    } finally {
      setSaving(false);
    }
  }

  async function deletePlace(id) {
    if (!window.confirm("Delete this place?")) return;
    setDeleting(id);
    setError("");
    try {
      await requestAdmin("/api/admin/places", {
        method: "DELETE",
        body: JSON.stringify({ id }),
      });
      await loadPlaces();
    } catch (e) {
      setError(e.message || "Delete failed");
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
  }

  if (!user) {
    return (
      <div style={{ maxWidth: 960, margin: "0 auto", padding: 24 }}>
        <h1 style={{ margin: "0 0 8px" }}>Admin</h1>
        <p style={{ margin: "0 0 16px", color: "#666" }}>Sign in with Google to continue.</p>
        <button onClick={handleLogin} style={{ padding: "10px 14px", borderRadius: 8, border: "1px solid #ddd", cursor: "pointer" }}>
          Sign in
        </button>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 1100, margin: "0 auto", padding: 20 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
        <div>
          <h1 style={{ margin: 0 }}>Admin / Places</h1>
          <div style={{ color: "#666", fontSize: 13 }}>{user.email}</div>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <button onClick={openCreate} style={{ padding: "10px 14px", borderRadius: 8, border: "1px solid #ddd", cursor: "pointer" }}>New place</button>
          <button onClick={handleLogout} style={{ padding: "10px 14px", borderRadius: 8, border: "1px solid #ddd", cursor: "pointer" }}>Sign out</button>
        </div>
      </div>

      <div style={{ marginBottom: 12 }}>
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search by name, address, category, district"
          style={{ width: "100%", padding: "10px 12px", borderRadius: 8, border: "1px solid #ddd" }}
        />
      </div>

      {error && <div style={{ color: "#B00020", marginBottom: 12 }}>{error}</div>}
      {loading ? (
        <div>Loading...</div>
      ) : (
        <div style={{ border: "1px solid #eee", borderRadius: 10, overflow: "hidden" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 14 }}>
            <thead>
              <tr style={{ background: "#fafafa" }}>
                <th style={th}>Name</th>
                <th style={th}>Category</th>
                <th style={th}>District</th>
                <th style={th}>Address</th>
                <th style={th}>Photos</th>
                <th style={th}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((p) => (
                <tr key={p.id} style={{ borderTop: "1px solid #f0f0f0" }}>
                  <td style={td}>{p.name}</td>
                  <td style={td}>{p.category}</td>
                  <td style={td}>{p.district}</td>
                  <td style={td}>{p.address || "-"}</td>
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
              {!filtered.length && (
                <tr>
                  <td style={td} colSpan={6}>No places found.</td>
                </tr>
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
              <input type="file" accept="image/*" multiple onChange={(e) => {
                const files = Array.from(e.target.files || []).map((file) => ({ file, preview: URL.createObjectURL(file) }));
                setNewPhotos((prev) => [...prev, ...files].slice(0, 10));
              }} />
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

const th = { textAlign: "left", padding: "10px 12px", fontSize: 12, color: "#666", fontWeight: 600 };
const td = { padding: "10px 12px", verticalAlign: "top" };
const smallBtn = { padding: "6px 10px", borderRadius: 8, border: "1px solid #ddd", background: "#fff", cursor: "pointer" };
const smallBtnDanger = { ...smallBtn, borderColor: "#f3c0c0", color: "#B00020" };
const overlay = { position: "fixed", inset: 0, background: "rgba(0,0,0,0.35)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 100 };
const panel = { width: "min(900px, calc(100vw - 24px))", maxHeight: "90vh", overflowY: "auto", background: "#fff", borderRadius: 12, padding: 16 };
const fieldGrid = { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 };
const label = { display: "flex", flexDirection: "column", gap: 4, fontSize: 13, color: "#444" };
const input = { width: "100%", padding: "10px 12px", border: "1px solid #ddd", borderRadius: 8, fontFamily: "inherit", boxSizing: "border-box" };
const thumbWrap = { position: "relative", width: 84, height: 84, borderRadius: 8, border: "1px solid #ddd", overflow: "hidden" };
const thumb = { width: "100%", height: "100%", objectFit: "cover", display: "block" };
const closeBtn = { position: "absolute", top: 4, right: 4, width: 18, height: 18, border: "none", borderRadius: 999, background: "rgba(0,0,0,0.55)", color: "#fff", cursor: "pointer", fontSize: 11, lineHeight: "18px", padding: 0 };

