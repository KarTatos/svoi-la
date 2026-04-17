"use client";

import { useEffect, useMemo, useState } from "react";
import {
  addHousing as dbAddHousing,
  addPlace as dbAddPlace,
  deleteHousing as dbDeleteHousing,
  deletePlace as dbDeletePlace,
  getEvents,
  getHousing,
  getPlaces,
  getTips,
  getUser,
  signInWithGoogle,
  signOut,
  supabase,
  updateHousing as dbUpdateHousing,
  updatePlace as dbUpdatePlace,
  uploadPhoto,
} from "@/lib/supabase";

const TABS = ["places", "housing", "tips", "events", "comments", "likes"];
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

const initialHousingForm = {
  id: "",
  title: "",
  address: "",
  district: "",
  type: "Apartments for rent",
  min_price: "",
  price_options: "",
  beds: "",
  baths: "",
  updated_label: "",
  tags: "",
  photo: "",
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
  const [housing, setHousing] = useState([]);
  const [tips, setTips] = useState([]);
  const [events, setEvents] = useState([]);
  const [comments, setComments] = useState([]);
  const [likes, setLikes] = useState([]);

  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState("");
  const [editorOpen, setEditorOpen] = useState(false);
  const [form, setForm] = useState(initialForm);
  const [newPhotos, setNewPhotos] = useState([]);
  const [housingEditorOpen, setHousingEditorOpen] = useState(false);
  const [housingForm, setHousingForm] = useState(initialHousingForm);

  const filteredPlaces = useMemo(() => filterRows(places, query), [places, query]);
  const filteredHousing = useMemo(() => filterRows(housing, query), [housing, query]);
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
      const [{ data: p }, { data: h }, { data: t }, { data: e }, commentsRes, likesRes] = await Promise.all([
        getPlaces(),
        getHousing(),
        getTips(),
        getEvents(),
        supabase.from("comments").select("*").order("created_at", { ascending: false }),
        supabase.from("likes").select("*").order("created_at", { ascending: false }),
      ]);
      setPlaces(p || []);
      setHousing(h || []);
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

  function openCreateHousing() {
    setHousingForm({ ...initialHousingForm });
    setHousingEditorOpen(true);
  }

  function openEditHousing(item) {
    setHousingForm({
      id: item.id,
      title: item.title || "",
      address: item.address || "",
      district: item.district || "",
      type: item.type || "Apartments for rent",
      min_price: item.min_price ?? "",
      price_options: Array.isArray(item.price_options) ? item.price_options.join(", ") : "",
      beds: item.beds ?? "",
      baths: item.baths ?? "",
      updated_label: item.updated_label || "",
      tags: Array.isArray(item.tags) ? item.tags.join(", ") : "",
      photo: item.photo || "",
    });
    setHousingEditorOpen(true);
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

  async function saveHousing() {
    if (!housingForm.title || !housingForm.address || !housingForm.min_price) {
      setError("Fill required fields: title, address, min price");
      return;
    }
    setSaving(true);
    setError("");
    try {
      const payload = {
        title: housingForm.title,
        address: housingForm.address,
        district: housingForm.district || "",
        type: housingForm.type || "Apartments for rent",
        min_price: Number(housingForm.min_price || 0),
        price_options: housingForm.price_options
          .split(",")
          .map((x) => x.trim())
          .filter(Boolean),
        beds: Number(housingForm.beds || 0),
        baths: Number(housingForm.baths || 0),
        updated_label: housingForm.updated_label || "",
        tags: housingForm.tags
          .split(",")
          .map((x) => x.trim())
          .filter(Boolean),
        photo: housingForm.photo || "",
      };
      if (housingForm.id) await dbUpdateHousing(housingForm.id, payload);
      else await dbAddHousing(payload);
      setHousingEditorOpen(false);
      await loadAll();
    } catch (err) {
      setError(err?.message || "Save housing failed");
    } finally {
      setSaving(false);
    }
  }

  async function deletePlace(id) {
    if (!window.confirm("Delete this place?")) return;
    setDeleting(String(id));
    setError("");
    try {
      const { error } = await dbDeletePlace(id);
      if (error) throw new Error(error.message || "Delete failed");
      await loadAll();
    } catch (err) {
      setError(err?.message || "Delete failed");
    } finally {
      setDeleting("");
    }
  }

  async function deleteHousing(id) {
    if (!window.confirm("Delete this housing item?")) return;
    setDeleting(String(id));
    setError("");
    try {
      const { error } = await dbDeleteHousing(id);
      if (error) throw new Error(error.message || "Delete failed");
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
    setHousing([]);
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
          {tab === "housing" && (
            <button onClick={openCreateHousing} style={btn}>
              New housing
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
                <th style={{ ...th, width: "14%" }}>Name</th>
                <th style={{ ...th, width: "10%" }}>Category</th>
                <th style={{ ...th, width: "8%" }}>District</th>
                <th style={{ ...th, width: "22%" }}>Address</th>
                <th style={{ ...th, width: "26%" }}>Tip</th>
                <th style={{ ...th, width: "6%" }}>Photos</th>
                <th style={{ ...th, width: "14%" }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredPlaces.map((p) => (
                <tr key={p.id} style={row}>
                  <td style={td}><div style={clipText}>{p.name}</div></td>
                  <td style={td}><div style={clipText}>{p.category}</div></td>
                  <td style={td}><div style={clipText}>{p.district}</div></td>
                  <td style={td}><div style={clipTwoLines}>{p.address || "-"}</div></td>
                  <td style={td}><div style={clipTwoLines}>{p.tip || "-"}</div></td>
                  <td style={td}><div style={clipText}>{Array.isArray(p.photos) ? p.photos.length : 0}</div></td>
                  <td style={td}>
                    <div style={{ display: "flex", gap: 8 }}>
                      <button onClick={() => openEdit(p)} style={smallBtn}>Edit</button>
                      <button onClick={() => deletePlace(p.id)} disabled={deleting === String(p.id)} style={smallBtnDanger}>
                        {deleting === String(p.id) ? "Deleting..." : "Delete"}
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

      {!loading && tab === "housing" && (
        <div style={tableWrap}>
          <table style={table}>
            <thead>
              <tr style={headRow}>
                <th style={{ ...th, width: "16%" }}>Title</th>
                <th style={{ ...th, width: "18%" }}>Address</th>
                <th style={{ ...th, width: "8%" }}>District</th>
                <th style={{ ...th, width: "9%" }}>Type</th>
                <th style={{ ...th, width: "8%" }}>Min Price</th>
                <th style={{ ...th, width: "12%" }}>Options</th>
                <th style={{ ...th, width: "6%" }}>Beds</th>
                <th style={{ ...th, width: "6%" }}>Baths</th>
                <th style={{ ...th, width: "7%" }}>Photo</th>
                <th style={{ ...th, width: "10%" }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredHousing.map((h) => (
                <tr key={h.id} style={row}>
                  <td style={td}><div style={clipText}>{h.title || "-"}</div></td>
                  <td style={td}><div style={clipTwoLines}>{h.address || "-"}</div></td>
                  <td style={td}><div style={clipText}>{h.district || "-"}</div></td>
                  <td style={td}><div style={clipText}>{h.type || "-"}</div></td>
                  <td style={td}><div style={clipText}>{h.min_price || 0}</div></td>
                  <td style={td}><div style={clipTwoLines}>{Array.isArray(h.price_options) ? h.price_options.join(", ") : "-"}</div></td>
                  <td style={td}><div style={clipText}>{h.beds ?? 0}</div></td>
                  <td style={td}><div style={clipText}>{h.baths ?? 0}</div></td>
                  <td style={td}><div style={clipText}>{h.photo ? "yes" : "-"}</div></td>
                  <td style={td}>
                    <div style={{ display: "flex", gap: 8 }}>
                      <button onClick={() => openEditHousing(h)} style={smallBtn}>Edit</button>
                      <button onClick={() => deleteHousing(h.id)} disabled={deleting === String(h.id)} style={smallBtnDanger}>
                        {deleting === String(h.id) ? "Deleting..." : "Delete"}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {!filteredHousing.length && (
                <tr><td style={td} colSpan={10}>No housing found.</td></tr>
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
                  <td style={td}><div style={clipText}>{t.title}</div></td>
                  <td style={td}><div style={clipText}>{t.category}</div></td>
                  <td style={td}><div style={clipText}>{t.author}</div></td>
                  <td style={td}><div style={clipTwoLines}>{t.text || "-"}</div></td>
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
                  <td style={td}><div style={clipText}>{e.title}</div></td>
                  <td style={td}><div style={clipText}>{e.category}</div></td>
                  <td style={td}><div style={clipText}>{e.date}</div></td>
                  <td style={td}><div style={clipTwoLines}>{e.location || "-"}</div></td>
                  <td style={td}><div style={clipTwoLines}>{e.description || "-"}</div></td>
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
                  <td style={td}><div style={clipText}>{c.item_type}</div></td>
                  <td style={td}><div style={clipText}>{c.item_id}</div></td>
                  <td style={td}><div style={clipText}>{c.author}</div></td>
                  <td style={td}><div style={clipTwoLines}>{c.text || "-"}</div></td>
                  <td style={td}><div style={clipText}>{c.created_at || "-"}</div></td>
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
                  <td style={td}><div style={clipText}>{l.item_type}</div></td>
                  <td style={td}><div style={clipText}>{l.item_id}</div></td>
                  <td style={td}><div style={clipText}>{l.user_id}</div></td>
                  <td style={td}><div style={clipText}>{l.created_at || "-"}</div></td>
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

      {housingEditorOpen && (
        <div style={overlay} onClick={() => setHousingEditorOpen(false)}>
          <div style={panel} onClick={(e) => e.stopPropagation()}>
            <h3 style={{ marginTop: 0 }}>{housingForm.id ? "Edit housing" : "New housing"}</h3>
            <div style={fieldGrid}>
              <label style={label}>
                Title *
                <input value={housingForm.title} onChange={(e) => setHousingForm((s) => ({ ...s, title: e.target.value }))} style={input} />
              </label>
              <label style={label}>
                Address *
                <input value={housingForm.address} onChange={(e) => setHousingForm((s) => ({ ...s, address: e.target.value }))} style={input} />
              </label>
              <label style={label}>
                District
                <input value={housingForm.district} onChange={(e) => setHousingForm((s) => ({ ...s, district: e.target.value }))} style={input} />
              </label>
              <label style={label}>
                Type
                <input value={housingForm.type} onChange={(e) => setHousingForm((s) => ({ ...s, type: e.target.value }))} style={input} />
              </label>
              <label style={label}>
                Min Price *
                <input type="number" value={housingForm.min_price} onChange={(e) => setHousingForm((s) => ({ ...s, min_price: e.target.value }))} style={input} />
              </label>
              <label style={label}>
                Price options (comma)
                <input value={housingForm.price_options} onChange={(e) => setHousingForm((s) => ({ ...s, price_options: e.target.value }))} style={input} />
              </label>
              <label style={label}>
                Beds
                <input type="number" value={housingForm.beds} onChange={(e) => setHousingForm((s) => ({ ...s, beds: e.target.value }))} style={input} />
              </label>
              <label style={label}>
                Baths
                <input type="number" value={housingForm.baths} onChange={(e) => setHousingForm((s) => ({ ...s, baths: e.target.value }))} style={input} />
              </label>
            </div>

            <label style={{ ...label, marginTop: 8 }}>
              Updated label
              <input value={housingForm.updated_label} onChange={(e) => setHousingForm((s) => ({ ...s, updated_label: e.target.value }))} style={input} />
            </label>
            <label style={{ ...label, marginTop: 8 }}>
              Tags (comma)
              <input value={housingForm.tags} onChange={(e) => setHousingForm((s) => ({ ...s, tags: e.target.value }))} style={input} />
            </label>
            <label style={{ ...label, marginTop: 8 }}>
              Photo URL
              <input value={housingForm.photo} onChange={(e) => setHousingForm((s) => ({ ...s, photo: e.target.value }))} style={input} />
            </label>

            <div style={{ display: "flex", justifyContent: "flex-end", gap: 8, marginTop: 14 }}>
              <button onClick={() => setHousingEditorOpen(false)} style={smallBtn}>Cancel</button>
              <button onClick={saveHousing} disabled={saving} style={smallBtn}>
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
const table = { width: "100%", borderCollapse: "collapse", fontSize: 14, tableLayout: "fixed" };
const headRow = { background: "#fafafa" };
const row = { borderTop: "1px solid #f0f0f0" };
const th = { textAlign: "left", padding: "10px 12px", color: "#385272", fontWeight: 700, borderBottom: "1px solid #f0f0f0", whiteSpace: "nowrap" };
const td = { padding: "10px 12px", verticalAlign: "top", color: "#1a2d44", overflow: "hidden" };
const clipText = { overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" };
const clipTwoLines = {
  overflow: "hidden",
  display: "-webkit-box",
  WebkitLineClamp: 2,
  WebkitBoxOrient: "vertical",
  wordBreak: "break-word",
};

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
