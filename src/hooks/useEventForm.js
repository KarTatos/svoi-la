import { useState } from "react";

export function useEventForm({
  user,
  events,
  canManageEvent,
  setEvents,
  setExp,
  addrValidEvent,
  setAddrValidEvent,
  setAddrOptionsEvent,
  dbAddEvent,
  dbUpdateEvent,
  dbDeleteEvent,
  uploadPhoto,
  limitCardText,
  encodeRichText,
  normalizeExternalUrl,
  onRequireAuth,
}) {
  const [showAddEvent, setShowAddEvent] = useState(false);
  const [newEvent, setNewEvent] = useState({ title: "", date: "", location: "", desc: "", website: "", cat: "" });
  const [newEventPhotos, setNewEventPhotos] = useState([]);
  const [editingEvent, setEditingEvent] = useState(null);

  const resetEventForm = () => {
    setShowAddEvent(false);
    setEditingEvent(null);
    setNewEvent({ title: "", date: "", location: "", desc: "", website: "", cat: "" });
    setNewEventPhotos([]);
    setAddrValidEvent(false);
    setAddrOptionsEvent([]);
  };

  const openAddEventForm = () => {
    if (!user) {
      onRequireAuth?.();
      return;
    }
    setEditingEvent(null);
    setNewEvent({ title: "", date: "", location: "", desc: "", website: "", cat: "" });
    setNewEventPhotos([]);
    setAddrValidEvent(false);
    setAddrOptionsEvent([]);
    setShowAddEvent(true);
  };

  const handleEventPhotos = (e) => {
    const files = Array.from(e.target.files).slice(0, 3);
    const newFiles = files.map((f) => ({ file: f, name: f.name, preview: URL.createObjectURL(f) }));
    setNewEventPhotos((prev) => [...prev, ...newFiles].slice(0, 3));
  };

  const startEditEvent = (ev) => {
    if (!canManageEvent(ev)) {
      alert("Редактировать событие может только автор или админ.");
      return;
    }
    setEditingEvent(ev);
    setNewEvent({
      title: ev.title || "",
      date: ev.date ? new Date(ev.date).toISOString().slice(0, 16) : "",
      location: ev.location || "",
      desc: ev.desc || "",
      website: ev.website || "",
      cat: ev.cat || "",
    });
    setNewEventPhotos(
      (ev.photos || [])
        .filter((ph) => typeof ph === "string" && ph.startsWith("http"))
        .map((ph) => ({ name: "existing", preview: ph })),
    );
    setAddrValidEvent(!!(ev.location || "").trim());
    setAddrOptionsEvent([]);
    setShowAddEvent(true);
  };

  const handleDeleteEvent = async (eventId) => {
    const item = events.find((e) => e.id === eventId);
    if (!canManageEvent(item)) {
      alert("Удалять событие может только автор или админ.");
      return;
    }
    if (!window.confirm("Удалить событие?")) return;
    const { error } = await dbDeleteEvent(eventId);
    if (error) {
      alert(error.message || "Не удалось удалить событие");
      return;
    }
    setEvents((prev) => prev.filter((e) => e.id !== eventId));
    setShowAddEvent(false);
    setEditingEvent(null);
    setExp(null);
  };

  const handleAddEvent = async () => {
    if (!newEvent.title || !newEvent.date || !newEvent.desc || !newEvent.cat || !user) return;
    if (!newEvent.location.trim() || !addrValidEvent) {
      alert("Выберите место из подсказок адреса.");
      return;
    }
    const uploaded = [];
    for (const p of newEventPhotos) {
      if (p.file) {
        const url = await uploadPhoto(p.file);
        if (url) uploaded.push(url);
      } else if (p.preview && p.preview.startsWith("http")) {
        uploaded.push(p.preview);
      }
    }
    const safeEventDesc = limitCardText(newEvent.desc).trim();
    const website = normalizeExternalUrl(newEvent.website || "");
    const dbData = {
      category: newEvent.cat,
      title: newEvent.title,
      date: newEvent.date,
      location: newEvent.location || "",
      description: encodeRichText(safeEventDesc, uploaded, { website }),
      author: user.name,
      user_id: user.id,
    };
    if (editingEvent) {
      await dbUpdateEvent(editingEvent.id, dbData);
      setEvents((prev) =>
        prev.map((ev) =>
          ev.id === editingEvent.id
            ? {
                ...ev,
                cat: newEvent.cat,
                title: newEvent.title,
                date: newEvent.date,
                location: newEvent.location,
                desc: safeEventDesc,
                website,
                photos: uploaded,
              }
            : ev,
        ),
      );
    } else {
      const { data } = await dbAddEvent(dbData);
      const newId = data?.[0]?.id || Date.now();
      setEvents((prev) => [
        {
          id: newId,
          cat: newEvent.cat,
          title: newEvent.title,
          date: newEvent.date,
          location: newEvent.location,
          desc: safeEventDesc,
          website,
          photos: uploaded,
          author: user.name,
          userId: user.id,
          likes: 0,
          views: 0,
          comments: [],
          fromDB: true,
        },
        ...prev,
      ]);
    }
    resetEventForm();
  };

  return {
    showAddEvent,
    setShowAddEvent,
    newEvent,
    setNewEvent,
    newEventPhotos,
    setNewEventPhotos,
    editingEvent,
    setEditingEvent,
    resetEventForm,
    openAddEventForm,
    handleEventPhotos,
    startEditEvent,
    handleDeleteEvent,
    handleAddEvent,
  };
}
